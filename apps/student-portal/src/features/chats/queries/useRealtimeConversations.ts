"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import type { ConversationListItem } from "../types";
import { chatsKeys } from "./chats.queries";

interface GetDirectConversationsResult {
	conversations: ConversationListItem[];
	hasMore: boolean;
	total: number;
}

/**
 * Subscribe to realtime updates for conversations list
 * Updates React Query cache when new messages arrive in any conversation
 * This keeps the conversation list fresh with latest messages and unread counts
 */
export function useRealtimeConversations(userId: string) {
	const queryClient = useQueryClient();
	const supabase = createClient();

	useEffect(() => {
		// Subscribe to direct_messages table to detect new messages in any conversation
		const channel = supabase
			.channel("conversations-list")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "direct_messages",
				},
				async (payload: any) => {
					console.log(
						"🔔 Real-time: New message in a conversation",
						payload.new,
					);

					const conversationId = payload.new.conversation_id;

					// First check if this user is a participant in this conversation
					const { data: isParticipant } = await supabase
						.from("conversation_participants")
						.select("id")
						.eq("conversation_id", conversationId)
						.eq("user_id", userId)
						.maybeSingle();

					if (!isParticipant) {
						console.log("⏭️ Real-time: User not in this conversation, skipping");
						return;
					}

					// Fetch the message details
					const { data: message } = await supabase
						.from("messages")
						.select(
							`
              id,
              user_id,
              content,
              created_at,
              user:user!messages_user_id_fkey(
                id,
                name
              )
            `,
						)
						.eq("id", payload.new.message_id)
						.single();

					if (!message) {
						console.log("⚠️ Real-time: Could not fetch message details");
						return;
					}

					// Update the conversations list query
					queryClient.setQueryData<InfiniteData<GetDirectConversationsResult>>(
						chatsKeys.conversationsInfinite(),
						(old: InfiniteData<GetDirectConversationsResult> | undefined) => {
							if (!old || !old.pages) {
								console.log(
									"⚠️ Real-time: No existing conversations data, skipping",
								);
								return old;
							}

							let conversationFound = false;

							// Update existing conversation or move it to the top
							const updatedPages = old.pages.map(
								(page: GetDirectConversationsResult) => {
									const updatedConversations = page.conversations
										.map((conv: ConversationListItem) => {
											if (conv.id === conversationId) {
												conversationFound = true;
												const user = Array.isArray(message.user)
													? message.user[0]
													: message.user;

												return {
													...conv,
													lastMessage: {
														content: message.content,
														createdAt: message.created_at,
														senderName: user?.name || "Unknown",
														senderId: message.user_id,
													},
													lastMessageAt: message.created_at,
													// Only increment unread if message is not from current user
													unreadCount:
														message.user_id !== userId
															? conv.unreadCount + 1
															: conv.unreadCount,
												};
											}
											return conv;
										})
										// Sort conversations by lastMessageAt (most recent first)
										.sort(
											(a: ConversationListItem, b: ConversationListItem) => {
												const aTime = a.lastMessageAt
													? new Date(a.lastMessageAt).getTime()
													: 0;
												const bTime = b.lastMessageAt
													? new Date(b.lastMessageAt).getTime()
													: 0;
												return bTime - aTime;
											},
										);

									return {
										...page,
										conversations: updatedConversations,
									};
								},
							);

							if (conversationFound) {
								console.log(
									"✅ Real-time: Updated conversation in list",
									conversationId,
								);
							} else {
								console.log(
									"⚠️ Real-time: Conversation not in current list, invalidating query",
								);
								// Conversation not in current list, refetch to get it
								queryClient.invalidateQueries({
									queryKey: chatsKeys.conversationsInfinite(),
								});
							}

							return {
								...old,
								pages: updatedPages,
							};
						},
					);
				},
			)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "conversations",
				},
				() => {
					console.log("🔔 Real-time: New conversation created");
					// Invalidate and refetch conversations list to include the new one
					queryClient.invalidateQueries({
						queryKey: chatsKeys.conversationsInfinite(),
					});
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [userId, queryClient, supabase]);
}
