"use client";

import { useEffect, useMemo } from "react";

import { fetchMessages } from "@/features/chats/actions/fetchMessages";
import { markMessagesAsRead } from "@/features/chats/actions/markMessagesAsRead";
import { Chat } from "@/features/chats/components/Chat";
import { chatsKeys } from "@/features/chats/queries/chats.queries";
import { useRealtimeMessages } from "@/features/chats/queries/useRealtimeMessages";
import type {
	DeleteMessageHandler,
	EditMessageHandler,
	Message,
	SendMessageHandler,
} from "@/features/chats/types";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";

interface ChatWrapperProps {
	cohortId: string;
	cohortName: string;
	currentUserId: string;
	onSendMessage: SendMessageHandler;
	onEditMessage: EditMessageHandler;
	onDeleteMessage: DeleteMessageHandler;
}

interface GetMessagesResult {
	messages: Message[];
	hasMore: boolean;
	total: number;
}

export function ChatWrapper({
	cohortId,
	cohortName,
	currentUserId,
	onSendMessage,
	onEditMessage,
	onDeleteMessage,
}: ChatWrapperProps) {
	// Fetch messages with infinite query for pagination
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery<GetMessagesResult>({
			queryKey: chatsKeys.messages(cohortId),
			queryFn: async ({ pageParam = 1 }) => {
				const result = await fetchMessages(cohortId, pageParam as number);
				if (!result.success || !result.data) {
					throw new Error(result.error || "Failed to fetch messages");
				}
				return result.data;
			},
			getNextPageParam: (
				lastPage: GetMessagesResult,
				allPages: GetMessagesResult[],
			) => {
				return lastPage.hasMore ? allPages.length + 1 : undefined;
			},
			initialPageParam: 1,
		});

	// Flatten all pages - reverse page order since we fetch newest first
	// Each page is already reversed to show oldest to newest within the page
	const messages = useMemo(() => {
		if (!data?.pages) return [];
		// Reverse pages array so older pages come first, then flatten
		const allMessages = [...data.pages]
			.reverse()
			.flatMap((page: GetMessagesResult) => page.messages);

		// Deduplicate messages by ID (in case real-time adds duplicates)
		const seen = new Set<string>();
		return allMessages.filter((message) => {
			if (seen.has(message.id)) {
				return false;
			}
			seen.add(message.id);
			return true;
		});
	}, [data?.pages]);

	// Subscribe to realtime updates
	useRealtimeMessages(cohortId);

	// Mark messages as read when opening cohort chat
	const { executeAsync: executeMarkAsRead } = useAction(markMessagesAsRead);
	const queryClient = useQueryClient();

	useEffect(() => {
		if (cohortId) {
			executeMarkAsRead({ cohortId }).then(() => {
				// Invalidate cohorts query to update unread badges in sidebar
				queryClient.invalidateQueries({ queryKey: chatsKeys.cohorts() });
			});
		}
	}, [cohortId, executeMarkAsRead, queryClient]);

	return (
		<Chat
			cohortId={cohortId}
			cohortName={cohortName}
			currentUserId={currentUserId}
			messages={messages}
			isLoading={isLoading}
			hasNextPage={hasNextPage}
			isFetchingNextPage={isFetchingNextPage}
			onLoadMore={fetchNextPage}
			mode="widget"
			maxHeight="100%"
			onSendMessage={onSendMessage}
			onEditMessage={onEditMessage}
			onDeleteMessage={onDeleteMessage}
		/>
	);
}
