"use client";

import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";

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
  className,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
}: ChatProps) {
  const containerClasses = cn(
    "flex flex-col",
    (mode === "widget" || mode === "tab") && "h-full",
    className
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

  return (
    <Card className={containerClasses}>
      <CardContent className="flex flex-1 flex-col p-0" style={{ maxHeight }}>
        {content}
      </CardContent>
    </Card>
  );
}
