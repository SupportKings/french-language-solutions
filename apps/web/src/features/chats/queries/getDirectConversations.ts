import { requireAuth } from "@/lib/rbac-middleware";
import { createClient } from "@/lib/supabase/server";

import type { ConversationListItem } from "../types";

interface GetDirectConversationsParams {
	page?: number;
	limit?: number;
}

interface GetDirectConversationsResult {
	conversations: ConversationListItem[];
	hasMore: boolean;
	total: number;
}

/**
 * Get direct message conversations for the current user
 * Returns conversations sorted by unread first, then by last message time
 */
export async function getDirectConversations({
	page = 1,
	limit = 20,
}: GetDirectConversationsParams = {}): Promise<GetDirectConversationsResult> {
	const session = await requireAuth();
	const supabase = await createClient();

	// Calculate pagination (applied after sorting by unread status)
	const from = (page - 1) * limit;

	// Fetch ALL conversations where user is a participant
	// NOTE: We fetch all to sort by unread status, then apply pagination in memory
	const { data: conversationsData, error } = await supabase
		.from("conversations")
		.select(
			`
			id,
			created_at,
			updated_at,
			last_message_at,
			conversation_participants!inner(
				user_id,
				joined_at,
				user:user!conversation_participants_user_id_fkey(
					id,
					name,
					email
				)
			)
		`,
		)
		.eq("conversation_participants.user_id", session.user.id)
		.is("deleted_at", null)
		.order("last_message_at", { ascending: false, nullsFirst: false });

	if (error) {
		throw new Error(`Failed to fetch conversations: ${error.message}`);
	}

	if (!conversationsData || conversationsData.length === 0) {
		return {
			conversations: [],
			hasMore: false,
			total: 0,
		};
	}

	// For each conversation, get all participants and last message
	const conversationsPromises = conversationsData.map(async (conv: any) => {
		// Get all participants for this conversation
		const { data: allParticipants } = await supabase
			.from("conversation_participants")
			.select(
				`
				user_id,
				joined_at,
				user:user!conversation_participants_user_id_fkey(
					id,
					name,
					email
				)
			`,
			)
			.eq("conversation_id", conv.id);

		// Get last message for this conversation (excluding deleted messages)
		const { data: lastMessageData } = await supabase
			.from("direct_messages")
			.select(
				`
				message_id,
				created_at,
				messages!inner(
					id,
					content,
					user_id,
					deleted_at,
					user:user!messages_user_id_fkey(
						id,
						name,
						email
					)
				)
			`,
			)
			.eq("conversation_id", conv.id)
			.is("messages.deleted_at", null)
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle();

		// Get all message IDs for this conversation to calculate unread count
		const { data: allMessages } = await supabase
			.from("direct_messages")
			.select("message_id, messages!inner(id, deleted_at, user_id)")
			.eq("conversation_id", conv.id);

		// Filter to non-deleted messages from other users
		const validMessageIds = (allMessages || [])
			.filter(
				(dm: any) =>
					dm.messages?.deleted_at === null &&
					dm.messages?.user_id !== session.user.id,
			)
			.map((dm: any) => dm.message_id);

		// Get already read messages for this user
		let unreadCount = 0;
		if (validMessageIds.length > 0) {
			const { data: readMessages } = await supabase
				.from("message_reads")
				.select("message_id")
				.eq("user_id", session.user.id)
				.in("message_id", validMessageIds);

			const readMessageIds = new Set(
				readMessages?.map((r) => r.message_id) || [],
			);
			unreadCount = validMessageIds.filter(
				(id: string) => !readMessageIds.has(id),
			).length;
		}

		// Transform participants
		const participants =
			allParticipants?.map((p: any) => ({
				userId: p.user_id,
				name: p.user?.name || null,
				email: p.user?.email || "",
				joinedAt: p.joined_at,
			})) || [];

		// Transform last message
		const messageData = lastMessageData?.messages as any;
		const lastMessage =
			lastMessageData && messageData
				? {
						content: messageData.content,
						createdAt: lastMessageData.created_at,
						senderName:
							messageData.user?.name || messageData.user?.email || "Unknown",
						senderId: messageData.user_id,
					}
				: null;

		return {
			id: conv.id,
			participants,
			lastMessage,
			lastMessageAt: conv.last_message_at,
			unreadCount,
		};
	});

	// biome-ignore lint/suspicious/noExplicitAny: Pre-existing type mismatch with ConversationListItem
	const conversations: any[] = await Promise.all(conversationsPromises);

	// Sort: unread conversations first, then by last message time
	conversations.sort((a, b) => {
		// Prioritize conversations with unread messages
		const aHasUnread = a.unreadCount > 0 ? 1 : 0;
		const bHasUnread = b.unreadCount > 0 ? 1 : 0;
		if (aHasUnread !== bHasUnread) {
			return bHasUnread - aHasUnread; // Unread first
		}
		// Then sort by last message time (most recent first)
		if (!a.lastMessageAt && !b.lastMessageAt) return 0;
		if (!a.lastMessageAt) return 1;
		if (!b.lastMessageAt) return -1;
		return (
			new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
		);
	});

	// Apply pagination AFTER sorting by unread status
	const total = conversations.length;
	const paginatedConversations = conversations.slice(from, from + limit);

	return {
		conversations: paginatedConversations,
		hasMore: total > page * limit,
		total,
	};
}
