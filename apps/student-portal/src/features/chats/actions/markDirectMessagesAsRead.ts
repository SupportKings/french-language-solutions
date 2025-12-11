"use server";

import { requireAuth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

const markDirectMessagesAsReadSchema = z.object({
	conversationId: z.string().uuid(),
});

export const markDirectMessagesAsRead = actionClient
	.inputSchema(markDirectMessagesAsReadSchema)
	.action(async ({ parsedInput: input }) => {
		const user = await requireAuth();
		const supabase = await createClient();

		// Verify user is a participant in this conversation
		const { data: participant } = await supabase
			.from("conversation_participants")
			.select("id")
			.eq("conversation_id", input.conversationId)
			.eq("user_id", user.id)
			.maybeSingle();

		if (!participant) {
			throw new Error("Not authorized to access this conversation");
		}

		// Get all message IDs in this conversation
		const { data: directMessages, error: directMessagesError } = await supabase
			.from("direct_messages")
			.select("message_id")
			.eq("conversation_id", input.conversationId);

		if (directMessagesError) {
			console.error("Error fetching direct messages:", directMessagesError);
			throw new Error(
				`Failed to fetch direct messages: ${directMessagesError.message}`,
			);
		}

		const messageIds =
			directMessages?.map((dm) => dm.message_id).filter(Boolean) || [];

		if (messageIds.length === 0) {
			return { success: true, markedCount: 0 };
		}

		// Filter to only non-deleted messages
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

		const alreadyReadIds = new Set(
			existingReads?.map((r) => r.message_id) || [],
		);

		// Filter to unread messages only
		const unreadMessageIds = validMessageIds.filter(
			(id) => !alreadyReadIds.has(id),
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
			console.error("Error marking messages as read:", error);
			throw new Error(`Failed to mark messages as read: ${error.message}`);
		}

		return { success: true, markedCount: unreadMessageIds.length };
	});
