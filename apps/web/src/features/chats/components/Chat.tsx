"use client";

import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ChatProps } from "../types";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";

export function Chat({
	chatType = "cohort",
	cohortId,
	cohortName,
	conversationId,
	conversationName,
	currentUserId,
	messages,
	isLoading = false,
	mode = "standalone",
	maxHeight = "600px",
	showHeader = true,
	className,
	hasNextPage,
	isFetchingNextPage,
	onLoadMore,
	onSendMessage,
	onEditMessage,
	onDeleteMessage,
}: ChatProps) {
	// Determine chat ID and name based on type
	const chatName =
		chatType === "cohort"
			? cohortName || "Cohort Chat"
			: conversationName || "Direct Message";

	const containerClasses = cn(
		"flex flex-col",
		(mode === "widget" || mode === "tab") && "h-full",
		className,
	);

	const content = (
		<>
			<ChatMessageList
				messages={messages}
				currentUserId={currentUserId}
				cohortId={chatType === "cohort" ? cohortId : undefined}
				conversationId={chatType === "direct" ? conversationId : undefined}
				isLoading={isLoading}
				className={mode !== "standalone" ? "flex-1" : undefined}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				onLoadMore={onLoadMore}
				onEditMessage={onEditMessage}
				onDeleteMessage={onDeleteMessage}
			/>
			<ChatInput
				chatType={chatType}
				cohortId={chatType === "cohort" ? cohortId : undefined}
				conversationId={chatType === "direct" ? conversationId : undefined}
				currentUserId={currentUserId}
				onSend={onSendMessage}
				placeholder="Type your message..."
			/>
		</>
	);

	if (mode === "widget" || mode === "tab") {
		return <div className={containerClasses}>{content}</div>;
	}

	// Standalone mode with card
	return (
		<Card className={containerClasses}>
			{showHeader && (
				<CardHeader>
					<CardTitle>{chatName}</CardTitle>
				</CardHeader>
			)}
			<CardContent className="flex flex-1 flex-col p-0" style={{ maxHeight }}>
				{content}
			</CardContent>
		</Card>
	);
}
