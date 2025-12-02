"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import type {
	DeleteMessageHandler,
	EditMessageHandler,
	Message,
} from "../types";
import { ChatMessage } from "./ChatMessage";

interface ChatMessageListProps {
	messages: Message[];
	currentUserId?: string;
	cohortId?: string; // Required for cohort chat attachment uploads
	conversationId?: string; // Required for direct message attachment uploads
	isLoading?: boolean;
	className?: string;
	hasNextPage?: boolean;
	isFetchingNextPage?: boolean;
	onLoadMore?: () => void;
	onEditMessage: EditMessageHandler;
	onDeleteMessage: DeleteMessageHandler;
}

export function ChatMessageList({
	messages,
	currentUserId,
	cohortId,
	conversationId,
	isLoading = false,
	className,
	hasNextPage,
	isFetchingNextPage,
	onLoadMore,
	onEditMessage,
	onDeleteMessage,
}: ChatMessageListProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const isInitialMount = useRef(true);
	const lastMessageId = useRef<string | null>(null);

	// Auto-scroll to bottom on new messages
	useEffect(() => {
		if (!messagesEndRef.current || messages.length === 0) return;

		const currentLastMessageId = messages[messages.length - 1]?.id;

		// Instant scroll on initial load
		if (isInitialMount.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "auto" });
			isInitialMount.current = false;
			lastMessageId.current = currentLastMessageId;
		}
		// Smooth scroll only when a NEW message is added at the end (not when loading older messages)
		else if (currentLastMessageId !== lastMessageId.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
			lastMessageId.current = currentLastMessageId;
		}
	}, [messages]);

	if (isLoading) {
		return (
			<div className="flex-1 space-y-4 overflow-y-auto p-4">
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="flex gap-3">
						<Skeleton className="h-8 w-8 rounded-full" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-16 w-full" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (messages.length === 0) {
		return (
			<div className="flex flex-1 items-center justify-center p-8">
				<div className="text-center text-muted-foreground text-sm">
					No messages yet. Start the conversation!
				</div>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className={`flex-1 space-y-4 overflow-y-auto p-4 ${className || ""}`}
		>
			{hasNextPage && !isFetchingNextPage && (
				<div className="flex justify-center py-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onLoadMore}
						className="text-xs"
					>
						Load Older Messages
					</Button>
				</div>
			)}
			{isFetchingNextPage && (
				<div className="flex justify-center py-2">
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
						<span>Loading older messages...</span>
					</div>
				</div>
			)}
			<div className="space-y-1">
				{messages.map((message, index) => {
					const prevMessage = index > 0 ? messages[index - 1] : null;
					const showHeader =
						!prevMessage || prevMessage.userId !== message.userId;

					return (
						<div
							key={message.id}
							className="fade-in slide-in-from-bottom-4 animate-in duration-300"
						>
							<ChatMessage
								message={message}
								isCurrentUser={currentUserId === message.userId}
								showHeader={showHeader}
								cohortId={cohortId || conversationId || ""}
								currentUserId={currentUserId || ""}
								onEdit={onEditMessage}
								onDelete={onDeleteMessage}
							/>
						</div>
					);
				})}
				<div ref={messagesEndRef} />
			</div>
		</div>
	);
}
