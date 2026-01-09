"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

const schema = z.object({
	id: z.string().uuid(),
	isPinned: z.boolean(),
});

export const togglePinAnnouncement = actionClient
	.inputSchema(schema)
	.action(async ({ parsedInput: input }) => {
		const supabase = await createClient();

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

		// Toggle pin status
		const { data, error: updateError } = await supabase
			.from("announcements")
			.update({ is_pinned: input.isPinned })
			.eq("id", input.id)
			.select()
			.single();

		if (updateError) {
			throw new Error(`Failed to toggle pin: ${updateError.message}`);
		}

		return {
			success: true,
			data,
		};
	});
