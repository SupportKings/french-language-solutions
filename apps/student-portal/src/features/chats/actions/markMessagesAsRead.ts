"use server";

import { requireAuth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

const markMessagesAsReadSchema = z.object({
	cohortId: z.string().uuid(),
});

export const markMessagesAsRead = actionClient
	.inputSchema(markMessagesAsReadSchema)
	.action(async ({ parsedInput: input }) => {
		const user = await requireAuth();
		const supabase = await createClient();

		// Get all message IDs for this cohort
		const { data: cohortMessages } = await supabase
			.from("cohort_messages")
			.select("message_id")
			.eq("cohort_id", input.cohortId);

		const messageIds =
			cohortMessages?.map((cm) => cm.message_id).filter(Boolean) || [];

		if (messageIds.length === 0) {
			return { success: true, markedCount: 0 };
		}

		// Get only non-deleted messages
		const { data: validMessages } = await supabase
			.from("messages")
			.select("id")
			.in("id", messageIds)
			.is("deleted_at", null);

		const validMessageIds = validMessages?.map((m) => m.id) || [];

		if (validMessageIds.length === 0) {
			return { success: true, markedCount: 0 };
		}

		// Get already read messages to avoid duplicates
		const { data: existingReads } = await supabase
			.from("message_reads")
			.select("message_id")
			.eq("user_id", user.id)
			.in("message_id", validMessageIds);

		const alreadyReadSet = new Set(
			existingReads?.map((r) => r.message_id) || [],
		);

		// Filter to only unread messages
		const unreadMessageIds = validMessageIds.filter(
			(id) => !alreadyReadSet.has(id),
		);

		if (unreadMessageIds.length === 0) {
			return { success: true, markedCount: 0 };
		}

		// Bulk insert read records
		const readRecords = unreadMessageIds.map((messageId) => ({
			message_id: messageId,
			user_id: user.id,
		}));

		const { error } = await supabase.from("message_reads").insert(readRecords);

		if (error) {
			console.error("❌ Error marking messages as read:", error);
			throw new Error(`Failed to mark messages as read: ${error.message}`);
		}

		return { success: true, markedCount: unreadMessageIds.length };
	});
