import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import type { DirectMessage } from "../types";

interface GetDirectMessagesParams {
	conversationId: string;
	page?: number;
	limit?: number;
}

interface GetDirectMessagesResult {
	messages: DirectMessage[];
	hasMore: boolean;
	total: number;
}

/**
 * Get messages for a direct conversation with pagination
 * Follows the same pattern as getMessages.ts but for direct messages
 */
export async function getDirectMessages({
	conversationId,
	page = 1,
	limit = 10,
}: GetDirectMessagesParams): Promise<GetDirectMessagesResult> {
	const user = await requireAuth();
	const supabase = await createClient();

	// Verify user is a participant in this conversation
	const { data: participant } = await supabase
		.from("conversation_participants")
		.select("id")
		.eq("conversation_id", conversationId)
		.eq("user_id", user.id)
		.maybeSingle();

	if (!participant) {
		throw new Error("FORBIDDEN: You don't have access to this conversation");
	}

	// Calculate pagination
	const from = (page - 1) * limit;
	const to = from + limit - 1;

	// Fetch direct messages with pagination
	// Use descending order to get newest messages first, then reverse in memory
	const {
		data: directMessages,
		error: directError,
		count,
	} = await supabase
		.from("direct_messages")
		.select(
			`
			message_id,
			conversation_id,
			created_at
		`,
			{ count: "exact" },
		)
		.eq("conversation_id", conversationId)
		.order("created_at", { ascending: false })
		.range(from, to);

	if (directError) {
		throw new Error(`Failed to fetch direct messages: ${directError.message}`);
	}

	if (!directMessages || directMessages.length === 0) {
		return {
			messages: [],
			hasMore: false,
			total: 0,
		};
	}

	// Get the actual messages with user info
	const messageIds = directMessages.map((dm) => dm.message_id);

	const { data: messages, error: messagesError } = await supabase
		.from("messages")
		.select(
			`
			id,
			user_id,
			content,
			created_at,
			updated_at,
			edited_at,
			deleted_at,
			user:user!messages_user_id_fkey(
				id,
				name,
				email
			),
			message_attachments(
				id,
				file_name,
				file_url,
				file_type,
				file_size,
				created_at
			)
		`,
		)
		.in("id", messageIds)
		.is("deleted_at", null);

	if (messagesError) {
		throw new Error(`Failed to fetch messages: ${messagesError.message}`);
	}

	// Create a map for quick lookup
	const messagesMap = new Map(
		(messages || []).map((msg: any) => [msg.id, msg] as const),
	);

	// Combine direct_messages with messages data, maintaining direct_messages order
	const enrichedMessages = directMessages
		.map((directMsg: any) => {
			const msg = messagesMap.get(directMsg.message_id);
			if (!msg) return null;

			const message: DirectMessage = {
				id: msg.id,
				userId: msg.user_id,
				content: msg.content,
				createdAt: msg.created_at,
				updatedAt: msg.updated_at,
				editedAt: msg.edited_at,
				deletedAt: msg.deleted_at,
				user: Array.isArray(msg.user) ? msg.user[0] : msg.user,
				cohortId: "", // Not applicable for direct messages
				conversationId: directMsg.conversation_id,
				attachments:
					msg.message_attachments?.map((att: any) => ({
						id: att.id,
						messageId: msg.id,
						fileName: att.file_name,
						fileUrl: att.file_url,
						fileType: att.file_type,
						fileSize: att.file_size,
						createdAt: att.created_at,
					})) || [],
			};

			return message;
		})
		.filter((msg: DirectMessage | null): msg is DirectMessage => msg !== null);

	// Reverse messages to show oldest to newest (DB returns newest first)
	return {
		messages: enrichedMessages.reverse(),
		hasMore: (count || 0) > page * limit,
		total: count || 0,
	};
}
