"use client";

import { useEffect, useRef } from "react";

import { createClient } from "@/lib/supabase/client";

import { type InfiniteData, useQueryClient } from "@tanstack/react-query";
import type { Message } from "../types";
import { chatsKeys } from "./chats.queries";

interface GetMessagesResult {
	messages: Message[];
	hasMore: boolean;
	total: number;
}

/**
 * Subscribe to realtime updates for cohort messages
 * Updates React Query cache when new messages arrive
 */
export function useRealtimeMessages(cohortId: string) {
	const queryClient = useQueryClient();
	// Use ref to maintain stable supabase client reference
	const supabaseRef = useRef(createClient());

	useEffect(() => {
		const supabase = supabaseRef.current;

		// Subscribe to cohort_messages junction table
		const channel = supabase
			.channel(`cohort-chat:${cohortId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "cohort_messages",
					filter: `cohort_id=eq.${cohortId}`,
				},
				async (payload: any) => {
					console.log(
						"🔔 Real-time: New cohort message event",
						payload.new.message_id,
					);

					// Fetch the full message with user info and attachments
					const { data: message, error } = await supabase
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
                email,
                image
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
						.eq("id", payload.new.message_id)
						.single();

					if (error) {
						console.error(
							"❌ Real-time: Failed to fetch message details",
							error,
						);
						// Fallback: invalidate query to refetch from server
						queryClient.invalidateQueries({
							queryKey: chatsKeys.messages(cohortId),
						});
						return;
					}

					if (message) {
						const newMessage: Message = {
							id: message.id,
							userId: message.user_id,
							content: message.content,
							createdAt: message.created_at,
							updatedAt: message.updated_at,
							editedAt: message.edited_at,
							deletedAt: message.deleted_at,
							user: Array.isArray(message.user)
								? message.user[0]
								: message.user,
							cohortId: cohortId,
							attachments:
								(message as any).message_attachments?.map((att: any) => ({
									id: att.id,
									messageId: message.id,
									fileName: att.file_name,
									fileUrl: att.file_url,
									fileType: att.file_type,
									fileSize: att.file_size,
									createdAt: att.created_at,
								})) || [],
						};

						console.log("📨 Real-time: Fetched message details", {
							id: newMessage.id,
							content:
								newMessage.content?.substring(0, 50) || "[attachment-only]",
							attachments: newMessage.attachments?.length || 0,
						});

						// Update infinite query data structure
						queryClient.setQueryData<InfiniteData<GetMessagesResult>>(
							chatsKeys.messages(cohortId),
							(old: InfiniteData<GetMessagesResult> | undefined) => {
								if (!old) {
									console.log("⚠️ Real-time: No existing query data, skipping");
									return old;
								}

								// Get the first page (most recent messages page)
								const firstPage = old.pages[0];
								if (!firstPage) {
									console.log("⚠️ Real-time: No first page, skipping");
									return old;
								}

								// Check if message already exists across all pages (avoid duplicates)
								const messageExists = old.pages.some(
									(page: GetMessagesResult) =>
										page.messages.some((m: Message) => m.id === message.id),
								);

								if (messageExists) {
									console.log(
										"⏭️ Real-time: Message already exists, skipping",
										message.id,
									);
									return old;
								}

								console.log(
									"✅ Real-time: Adding new message to cache",
									message.id,
								);

								// Remove any optimistic messages with the same content and userId
								const updatedPages = old.pages.map(
									(page: GetMessagesResult, index: number) => {
										if (index === 0) {
											// First page - add new message at the end
											const withoutOptimistic = page.messages.filter(
												(m: Message) =>
													!(
														m.id.startsWith("optimistic-") &&
														m.content === newMessage.content &&
														m.userId === newMessage.userId
													),
											);
											return {
												...page,
												messages: [...withoutOptimistic, newMessage],
												total: page.total + 1,
											};
										}
										return page;
									},
								);

								return {
									...old,
									pages: updatedPages,
								};
							},
						);
					}
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "messages",
				},
				(payload: any) => {
					console.log("Message updated:", payload.new);

					// Update the message in infinite query cache
					queryClient.setQueryData<InfiniteData<GetMessagesResult>>(
						chatsKeys.messages(cohortId),
						(old: InfiniteData<GetMessagesResult> | undefined) => {
							if (!old) return old;

							// Update the message across all pages
							const updatedPages = old.pages.map((page: GetMessagesResult) => ({
								...page,
								messages: page.messages.map((msg: Message) =>
									msg.id === payload.new.id
										? {
												...msg,
												content: payload.new.content,
												updatedAt: payload.new.updated_at,
												editedAt: payload.new.edited_at,
												deletedAt: payload.new.deleted_at,
											}
										: msg,
								),
							}));

							return {
								...old,
								pages: updatedPages,
							};
						},
					);
				},
			)
			.subscribe((status) => {
				if (status === "SUBSCRIBED") {
					console.log("✅ Real-time: Subscribed to cohort chat", cohortId);
				} else if (status === "CLOSED") {
					console.log("⚠️ Real-time: Subscription closed for cohort", cohortId);
				} else if (status === "CHANNEL_ERROR") {
					console.error("❌ Real-time: Channel error for cohort", cohortId);
					// Fallback to polling/invalidation on error
					queryClient.invalidateQueries({
						queryKey: chatsKeys.messages(cohortId),
					});
				}
			});

		return () => {
			supabase.removeChannel(channel);
		};
	}, [cohortId, queryClient]);
}
