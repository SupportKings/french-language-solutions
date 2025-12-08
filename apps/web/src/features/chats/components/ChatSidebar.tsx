"use client";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import { format, isThisWeek, isToday, isYesterday } from "date-fns";
import {
	Loader2,
	MessageCircle,
	Plus,
	Search,
	Settings,
	Users,
} from "lucide-react";
import type { SimpleCohort } from "../queries/getAllCohorts";
import type { ConversationListItem } from "../types";

interface ChatSidebarProps {
	cohorts: SimpleCohort[];
	conversations?: ConversationListItem[];
	isLoading: boolean;
	isFetchingNextPage: boolean;
	hasNextPage: boolean;
	searchQuery: string;
	selectedCohortId: string | null;
	selectedConversationId?: string | null;
	onSelectCohort: (cohortId: string) => void;
	onSelectConversation?: (conversationId: string) => void;
	onSearchChange: (query: string) => void;
	onLoadMore: () => void;
	onCreateConversation?: () => void;
	isCreatingConversation?: boolean;
	onOpenSettings?: () => void;
}

function formatLastMessageTime(date: Date): string {
	const now = new Date();
	const messageDate = new Date(date);
	const diffInMinutes = Math.floor(
		(now.getTime() - messageDate.getTime()) / (1000 * 60),
	);

	// Less than 1 minute ago
	if (diffInMinutes < 1) {
		return "Just now";
	}

	// Less than 1 hour ago
	if (diffInMinutes < 60) {
		return `${diffInMinutes}m ago`;
	}

	// Today - show time
	if (isToday(messageDate)) {
		return format(messageDate, "h:mm a");
	}

	// Yesterday
	if (isYesterday(messageDate)) {
		return "Yesterday";
	}

	// This week - show day name
	if (isThisWeek(messageDate, { weekStartsOn: 0 })) {
		return format(messageDate, "EEE");
	}

	// Older - show date
	return format(messageDate, "MMM d");
}

// Get initials from name
function getInitials(name: string): string {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

export function ChatSidebar({
	cohorts,
	conversations = [],
	isLoading,
	searchQuery,
	selectedCohortId,
	selectedConversationId,
	onSelectCohort,
	onSelectConversation,
	onSearchChange,
	onCreateConversation,
	isCreatingConversation,
	onOpenSettings,
}: ChatSidebarProps) {
	// Filter conversations based on search query
	const filteredConversations = conversations.filter((conv) =>
		conv.participants.some((p) =>
			(p.name || p.email).toLowerCase().includes(searchQuery.toLowerCase()),
		),
	);

	// Filter cohorts based on search query
	const filteredCohorts = cohorts.filter((cohort) =>
		cohort.nickname?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	if (isLoading) {
		return (
			<div className="flex h-screen w-[350px] flex-col border-r bg-muted/20">
				{/* Search Input Skeleton */}
				<div className="border-border border-b p-3">
					<Skeleton className="h-10 w-full" />
				</div>

				<div className="flex-1 p-2">
					<div className="space-y-2">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="rounded-lg border p-3">
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-24" />
									</div>
									<Skeleton className="h-3 w-12" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full w-[350px] flex-col border-r bg-muted/20">
			{/* Search Input & Settings */}
			<div className="border-border border-b p-3">
				<div className="flex items-center gap-2">
					<div className="relative flex-1">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Search chats..."
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							className="pl-9"
						/>
					</div>
					{onOpenSettings && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onOpenSettings}
							title="Notification settings"
							className="flex-shrink-0"
						>
							<Settings className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>

			<ScrollArea className="flex-1 overflow-y-auto">
				<div className="w-full space-y-1 p-2">
					{/* Direct Messages Section */}
					<div className="mb-4">
						<div className="mb-1 flex items-center justify-between px-2 py-2">
							<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
								Direct Messages
							</h3>
							{onCreateConversation && (
								<Button
									variant="ghost"
									size="icon"
									className="h-5 w-5"
									onClick={onCreateConversation}
									disabled={isCreatingConversation}
									title="New message"
								>
									{isCreatingConversation ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Plus className="h-3.5 w-3.5" />
									)}
								</Button>
							)}
						</div>
						{filteredConversations.length > 0 && (
							<div className="space-y-1">
								{filteredConversations.map((conversation) => {
									const participantNames = conversation.participants
										.map((p) => p.name || p.email.split("@")[0])
										.join(", ");
									const initials = conversation.participants
										.map((p) => getInitials(p.name || p.email))
										.join("");

									return (
										<div
											key={conversation.id}
											className={cn(
												"w-full cursor-pointer overflow-hidden rounded-lg border p-2.5 transition-all hover:bg-muted/50",
												selectedConversationId === conversation.id
													? "border-primary bg-primary/5 shadow-sm"
													: "border-transparent bg-card/50",
											)}
											onClick={() => onSelectConversation?.(conversation.id)}
										>
											<div className="flex min-w-0 items-start gap-2.5">
												{/* Avatar */}
												<div className="relative flex-shrink-0">
													<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
														<span className="font-semibold text-primary text-xs">
															{initials.slice(0, 2)}
														</span>
													</div>
												</div>

												{/* Message Info */}
												<div className="min-w-0 flex-1 overflow-hidden">
													<div className="mb-0.5 flex items-start justify-between gap-2">
														<p className="flex-1 text-wrap font-medium text-sm">
															{participantNames}
														</p>
														{conversation.lastMessageAt && (
															<span className="flex-shrink-0 text-muted-foreground text-xs">
																{formatLastMessageTime(
																	new Date(conversation.lastMessageAt),
																)}
															</span>
														)}
													</div>
													{conversation.lastMessage && (
														<p className="truncate text-muted-foreground text-xs">
															{conversation.lastMessage.content ||
																"[Attachment]"}
														</p>
													)}
												</div>

												{/* Unread Badge */}
												{conversation.unreadCount > 0 && (
													<Badge
														variant="default"
														className="h-5 min-w-5 flex-shrink-0 rounded-full bg-destructive px-1.5 text-[10px]"
													>
														{conversation.unreadCount}
													</Badge>
												)}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Cohort Chats Section */}
					{filteredCohorts.length > 0 && (
						<div>
							<div className="mb-1 px-2 py-2">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Cohort Chats
								</h3>
							</div>
							<div className="space-y-1">
								{filteredCohorts.map((cohort) => (
									<div
										key={cohort.id}
										className={cn(
											"w-full cursor-pointer overflow-hidden rounded-lg border p-2.5 transition-all hover:bg-muted/50",
											selectedCohortId === cohort.id
												? "border-primary bg-primary/5 shadow-sm"
												: "border-transparent bg-card/30",
										)}
										onClick={() => onSelectCohort(cohort.id)}
									>
										<div className="flex min-w-0 items-start gap-2.5">
											{/* Cohort Icon */}
											<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
												<Users className="h-4.5 w-4.5 text-blue-600" />
											</div>

											{/* Cohort Info */}
											<div className="min-w-0 flex-1 overflow-hidden">
												<div className="mb-0.5 flex items-start justify-between gap-2">
													<p className="flex-1 truncate font-medium text-sm">
														{cohort.nickname ||
															`Cohort ${cohort.id.slice(0, 8)}`}
													</p>
													{cohort.lastMessage && (
														<span className="flex-shrink-0 text-muted-foreground text-xs">
															{formatLastMessageTime(
																new Date(cohort.lastMessage.createdAt),
															)}
														</span>
													)}
												</div>
												{cohort.messageCount > 0 && (
													<div className="flex items-center gap-1">
														<MessageCircle className="h-3 w-3 text-muted-foreground" />
														<span className="text-muted-foreground text-xs">
															{cohort.messageCount} messages
														</span>
													</div>
												)}
											</div>

											{/* Unread Badge */}
											{cohort.unreadCount > 0 && (
												<Badge
													variant="default"
													className="h-5 min-w-5 flex-shrink-0 rounded-full bg-destructive px-1.5 text-[10px]"
												>
													{cohort.unreadCount}
												</Badge>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Empty State */}
					{filteredConversations.length === 0 &&
						filteredCohorts.length === 0 && (
							<div className="flex flex-col items-center justify-center p-12 text-center">
								<MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
								<p className="text-muted-foreground">
									{searchQuery ? "No chats found" : "No chats available"}
								</p>
								{searchQuery && (
									<p className="mt-2 text-muted-foreground text-xs">
										Try a different search term
									</p>
								)}
							</div>
						)}
				</div>
			</ScrollArea>
		</div>
	);
}
