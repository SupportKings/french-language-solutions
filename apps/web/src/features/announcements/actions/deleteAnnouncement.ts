"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

const schema = z.object({
	id: z.string().uuid(),
});

export const deleteAnnouncement = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput: input }) => {
		const supabase = await createClient();

		// Get the current user
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error("Unauthorized");
		}

		// Get teacher record
		const { data: teacher, error: teacherError } = await supabase
			.from("teachers")
			.select("id")
			.eq("user_id", user.id)
			.single();

		if (teacherError || !teacher) {
			throw new Error("Teacher not found");
		}

		// Verify the announcement belongs to this teacher or user is admin
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
			.eq("id", user.id)
			.single();

		const isAdmin = userData?.role === "admin";

		if (existingAnnouncement.author_id !== teacher.id && !isAdmin) {
			throw new Error("Unauthorized to delete this announcement");
		}

		// Soft delete by setting deleted_at
		const { error: deleteError } = await supabase
			.from("announcements")
			.update({ deleted_at: new Date().toISOString() })
			.eq("id", input.id);

		if (deleteError) {
			throw new Error(`Failed to delete announcement: ${deleteError.message}`);
		}

		return {
			success: true,
		};
	});
