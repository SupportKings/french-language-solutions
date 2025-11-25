"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

const schema = z.object({
	title: z.string().min(1, "Title is required"),
	content: z.string().min(1, "Content is required"),
	scope: z.enum(["school_wide", "cohort"]),
	cohortId: z.string().uuid().nullable(),
	isPinned: z.boolean().default(false),
	attachments: z
		.array(
			z.object({
				fileName: z.string(),
				fileUrl: z.string(),
				fileType: z.enum(["image", "video", "document"]),
				fileSize: z.number(),
			}),
		)
		.optional(),
});

export const createAnnouncement = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput: input, ctx }) => {
		const supabase = await createClient();

		// Validate scope and cohortId relationship
		if (input.scope === "cohort" && !input.cohortId) {
			throw new Error(
				"Cohort ID is required for cohort-specific announcements",
			);
		}

		// Get the session using Better Auth
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			throw new Error("Unauthorized");
		}

		// Create the announcement
		// If user has no teacher record, it means it's posted by system admin
		const { data: announcement, error: announcementError } = await supabase
			.from("announcements")
			.insert({
				title: input.title,
				content: input.content,
				author_id: session.user.id,
				scope: input.scope,
				cohort_id: input.cohortId,
				is_pinned: input.isPinned,
			})
			.select()
			.single();

		if (announcementError) {
			throw new Error(
				`Failed to create announcement: ${announcementError.message}`,
			);
		}

		// Create attachments if provided
		if (input.attachments && input.attachments.length > 0) {
			const attachmentsToInsert = input.attachments.map((att) => ({
				announcement_id: announcement.id,
				file_name: att.fileName,
				file_url: att.fileUrl,
				file_type: att.fileType,
				file_size: att.fileSize,
			}));

			const { error: attachmentsError } = await supabase
				.from("announcement_attachments")
				.insert(attachmentsToInsert);

			if (attachmentsError) {
				throw new Error(
					`Failed to save attachments: ${attachmentsError.message}`,
				);
			}
		}

		// Send email notifications to enrolled students
		try {
			// Build the query to get eligible students with their user info
			let studentsQuery = supabase
				.from("students")
				.select(
					`
				id,
				user_id,
				enrollments!inner(
					id,
					status,
					cohort_id
				)
			`,
				)
				.not("user_id", "is", null)
				.in("enrollments.status", ["paid", "welcome_package_sent"]);

			// Filter by cohort if this is a cohort-specific announcement
			if (input.scope === "cohort" && input.cohortId) {
				studentsQuery = studentsQuery.eq(
					"enrollments.cohort_id",
					input.cohortId,
				);
			}

			const { data: students, error: studentsError } = await studentsQuery;

			if (studentsError) {
				console.error("[Email] Error fetching students:", studentsError);
			} else if (students && students.length > 0) {
				// Deduplicate students by ID (in case they have multiple enrollments)
				const uniqueStudents = Array.from(
					new Map(students.map((student) => [student.id, student])).values(),
				);

				// Fetch user data for all unique students
				const userIds = uniqueStudents
					.map((s) => s.user_id)
					.filter((id): id is string => id !== null);

				const { data: users, error: usersError } = await supabase
					.from("user")
					.select("id, email, name")
					.in("id", userIds);

				if (usersError) {
					console.error("[Email] Error fetching user data:", usersError);
				} else if (users && users.length > 0) {
					// Create a map of user_id to user data
					const userMap = new Map(users.map((user) => [user.id, user]));

					// Map students to recipients with their email and name
					const recipients = uniqueStudents
						.map((student) => {
							const user = student.user_id ? userMap.get(student.user_id) : null;
							if (!user?.email) return null;
							return {
								email: user.email,
								name: user.name || "Student",
							};
						})
						.filter((r): r is { email: string; name: string } => r !== null);

					if (recipients.length > 0) {
						const { sendAnnouncementNotificationsBatch } = await import(
							"@/lib/email"
						);
						await sendAnnouncementNotificationsBatch(
							recipients,
							input.title,
							process.env.STUDENT_PORTAL_URL ||
								process.env.NEXT_PUBLIC_APP_URL ||
								"https://student.frenchlanguagesolutions.com",
						);
					}
				}
			}
		} catch (emailError) {
			// Don't fail the announcement creation if email fails
			console.error("[Email] Failed to send notifications:", emailError);
		}

		return {
			success: true,
			data: announcement,
		};
	});
