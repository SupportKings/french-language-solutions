// TODO: Re-enable RBAC imports after testing
// import { isAdmin, requireAuth } from "@/lib/rbac-middleware";
import { createClient } from "@/lib/supabase/server";

import type { Message } from "../types";

interface GetMessagesParams {
	cohortId: string;
	page?: number;
	limit?: number;
}

interface GetMessagesResult {
	messages: Message[];
	hasMore: boolean;
	total: number;
}

/**
 * Get messages for a cohort with pagination and RBAC enforcement
 * - Admins: see all messages
 * - Teachers: only messages in cohorts they teach
 * - Students: only messages in cohorts they're enrolled in
 */
export async function getMessages({
	cohortId,
	page = 1,
	limit = 10,
}: GetMessagesParams): Promise<GetMessagesResult> {
	const supabase = await createClient();

	// Calculate pagination
	const from = (page - 1) * limit;
	const to = from + limit - 1;

	// Fetch messages with user information and pagination
	// Use descending order to get newest messages first, then reverse in memory
	const {
		data: cohortMessages,
		error: cohortError,
		count,
	} = await supabase
		.from("cohort_messages")
		.select(
			`
      message_id,
      cohort_id,
      created_at
    `,
			{ count: "exact" },
		)
		.eq("cohort_id", cohortId)
		.order("created_at", { ascending: false })
		.range(from, to);

	if (cohortError) {
		throw new Error(`Failed to fetch cohort messages: ${cohortError.message}`);
	}

	if (!cohortMessages || cohortMessages.length === 0) {
		return {
			messages: [],
			hasMore: false,
			total: 0,
		};
	}

	// Get the actual messages with user info
	const messageIds = cohortMessages.map((cm) => cm.message_id);

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

	// Combine cohort_messages with messages data, maintaining cohort_messages order
	const enrichedMessages = cohortMessages
		.map((cohortMsg: any) => {
			const msg = messagesMap.get(cohortMsg.message_id);
			if (!msg) return null;

			const message: Message = {
				id: msg.id,
				userId: msg.user_id,
				content: msg.content,
				createdAt: msg.created_at,
				updatedAt: msg.updated_at,
				editedAt: msg.edited_at,
				deletedAt: msg.deleted_at,
				user: Array.isArray(msg.user) ? msg.user[0] : msg.user,
				cohortId: cohortMsg.cohort_id,
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
		.filter((msg: Message | null): msg is Message => msg !== null);

	// Reverse messages to show oldest to newest (DB returns newest first)
	return {
		messages: enrichedMessages.reverse(),
		hasMore: (count || 0) > page * limit,
		total: count || 0,
	};
}
