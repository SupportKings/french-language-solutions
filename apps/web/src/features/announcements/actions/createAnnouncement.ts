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
			// Build the query to get eligible students
			let studentsQuery = supabase
				.from("students")
				.select(
					`
				id,
				user:user!students_user_id_fkey(
					id,
					email,
					full_name
				),
				enrollments!inner(
					id,
					status
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
				// Filter for test email only
				const testRecipients = students
					.filter((student) => student.user?.email === "vnasraddinli@gmail.com")
					.map((student) => ({
						email: student.user!.email!,
						name: student.user!.full_name || "Student",
					}));

				console.log(
					`[Email] Found ${students.length} eligible students, but only sending to test email (vnasraddinli@gmail.com)`,
				);
				console.log("[Email] Test recipients:", testRecipients);

				if (testRecipients.length > 0) {
					const { sendAnnouncementNotificationsBatch } = await import(
						"@/lib/email"
					);
					await sendAnnouncementNotificationsBatch(
						testRecipients,
						input.title,
						process.env.STUDENT_PORTAL_URL ||
							process.env.NEXT_PUBLIC_APP_URL ||
							"https://student.frenchlanguagesolutions.com",
					);
				} else {
					console.log(
						"[Email] No test recipients found matching vnasraddinli@gmail.com",
					);
				}
			} else {
				console.log("[Email] No eligible students found for notification");
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
