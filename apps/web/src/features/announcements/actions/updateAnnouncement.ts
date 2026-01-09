"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

const schema = z.object({
	id: z.string().uuid(),
	title: z.string().min(1, "Title is required").optional(),
	content: z.string().min(1, "Content is required").optional(),
	scope: z.enum(["school_wide", "cohort"]).optional(),
	cohortId: z.string().uuid().nullable().optional(),
	isPinned: z.boolean().optional(),
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

export const updateAnnouncement = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput: input }) => {
		const supabase = await createClient();

		// Validate scope and cohortId relationship
		if (input.scope === "cohort" && input.cohortId === null) {
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

		// Verify the announcement belongs to this user or user is admin
		const { data: existingAnnouncement, error: fetchError } = await supabase
			.from("announcements")
			.select("author_id")
			.eq("id", input.id)
			.single();

		if (fetchError) {
			throw new Error("Announcement not found");
		}

		// Check if user is admin
		const { data: userData } = await supabase
			.from("user")
			.select("role")
			.eq("id", session.user.id)
			.single();

		const isAdmin =
			userData?.role === "admin" || userData?.role === "super_admin";

		if (existingAnnouncement.author_id !== session.user.id && !isAdmin) {
			throw new Error("Unauthorized to update this announcement");
		}

		// Prepare update data
		const updateData: Record<string, unknown> = {};
		if (input.title !== undefined) updateData.title = input.title;
		if (input.content !== undefined) updateData.content = input.content;
		if (input.scope !== undefined) updateData.scope = input.scope;
		if (input.cohortId !== undefined) updateData.cohort_id = input.cohortId;
		if (input.isPinned !== undefined) updateData.is_pinned = input.isPinned;

		// Update the announcement
		const { data: announcement, error: updateError } = await supabase
			.from("announcements")
			.update(updateData)
			.eq("id", input.id)
			.select()
			.single();

		if (updateError) {
			throw new Error(`Failed to update announcement: ${updateError.message}`);
		}

		// Update attachments if provided
		if (input.attachments !== undefined) {
			// Delete existing attachments
			await supabase
				.from("announcement_attachments")
				.delete()
				.eq("announcement_id", input.id);

			// Insert new attachments
			if (input.attachments.length > 0) {
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
		}

		return {
			success: true,
			data: announcement,
		};
	});
