"use client";

import { useState } from "react";

import { createConversationAsAdmin } from "@/features/chats/actions/createConversationAsAdmin";
import { deleteMessage } from "@/features/chats/actions/deleteMessage";
import { editMessage } from "@/features/chats/actions/editMessage";
import { fetchCohorts } from "@/features/chats/actions/fetchCohorts";
import { fetchDirectConversations } from "@/features/chats/actions/fetchDirectConversations";
import { fetchDirectMessages } from "@/features/chats/actions/fetchDirectMessages";
import { sendDirectMessage } from "@/features/chats/actions/sendDirectMessage";
import { sendMessage } from "@/features/chats/actions/sendMessage";
import { Chat } from "@/features/chats/components/Chat";
import { ChatMembersSidebar } from "@/features/chats/components/ChatMembersSidebar";
import { ChatNotificationSettings } from "@/features/chats/components/ChatNotificationSettings";
import { ChatSidebar } from "@/features/chats/components/ChatSidebar";
import { ChatWrapper } from "@/features/chats/components/ChatWrapper";
import { NewConversationDialog } from "@/features/chats/components/NewConversationDialog";
import { chatsKeys } from "@/features/chats/queries/chats.queries";
import type { SimpleCohort } from "@/features/chats/queries/getAllCohorts";
import type { UserForConversation } from "@/features/chats/queries/getAllUsers";
import { useRealtimeConversations } from "@/features/chats/queries/useRealtimeConversations";
import { useRealtimeDirectMessages } from "@/features/chats/queries/useRealtimeDirectMessages";
import type {
	ChatNotificationPreferences,
	ConversationListItem,
	DirectMessage,
	Message,
} from "@/features/chats/types";

import {
	useInfiniteQuery,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { MessageCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface ChatsListPageClientProps {
	currentUserId: string;
	users: UserForConversation[];
	initialNotificationPreferences: ChatNotificationPreferences;
}

export function ChatsListPageClient({
	currentUserId,
	users,
	initialNotificationPreferences,
}: ChatsListPageClientProps) {
	const queryClient = useQueryClient();
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [selectedType, setSelectedType] = useState<
		"cohort" | "conversation" | null
	>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isNewConversationDialogOpen, setIsNewConversationDialogOpen] =
		useState(false);
	const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
	const [notificationPreferences, setNotificationPreferences] =
		useState<ChatNotificationPreferences>(initialNotificationPreferences);
	const debouncedSearchQuery = useDebounce(searchQuery, 300);

	// Fetch cohorts with infinite scroll and server-side search
	const {
		data: cohortsData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isLoadingCohorts,
	} = useInfiniteQuery({
		queryKey: chatsKeys.cohortsInfinite(debouncedSearchQuery),
		queryFn: async ({ pageParam = 1 }) => {
			const result = await fetchCohorts(
				pageParam,
				debouncedSearchQuery || undefined,
			);
			if (!result.success) {
				throw new Error(result.error);
			}
			return result.data;
		},
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.hasMore ? pages.length + 1 : undefined;
		},
		initialPageParam: 1,
	});

	const cohorts: SimpleCohort[] =
		cohortsData?.pages.flatMap((page) => page?.cohorts || []) || [];

	// Fetch conversations (direct messages)
	const { data: conversationsResponse, isLoading: isLoadingConversations } =
		useQuery({
			queryKey: chatsKeys.conversationsInfinite(),
			queryFn: async () => {
				const result = await fetchDirectConversations();
				if (!result.success) {
					throw new Error(result.error);
				}
				return result.data;
			},
		});

	const conversations: ConversationListItem[] =
		conversationsResponse?.conversations || [];

	// Fetch messages for selected conversation
	const {
		data: messagesData,
		fetchNextPage: fetchNextMessages,
		hasNextPage: hasNextMessages,
		isFetchingNextPage: isFetchingNextMessages,
		isLoading: isLoadingMessages,
	} = useInfiniteQuery({
		queryKey:
			selectedType === "conversation" && selectedId
				? chatsKeys.directMessages(selectedId)
				: ["no-selection"],
		queryFn: async ({ pageParam = 1 }) => {
			if (!selectedId || selectedType !== "conversation") {
				return { messages: [], hasMore: false, total: 0 };
			}

			const result = await fetchDirectMessages(selectedId, pageParam);
			if (!result.success) {
				throw new Error(result.error);
			}
			return result.data;
		},
		getNextPageParam: (lastPage, pages) => {
			return lastPage?.hasMore ? pages.length + 1 : undefined;
		},
		initialPageParam: 1,
		enabled: selectedType === "conversation" && !!selectedId,
	});

	const directMessages: DirectMessage[] =
		messagesData?.pages.flatMap((page) => page?.messages || []) || [];

	// Subscribe to realtime updates
	useRealtimeConversations(currentUserId);
	useRealtimeDirectMessages(
		selectedType === "conversation" && selectedId ? selectedId : "",
	);

	// Send cohort message handler
	const { execute: executeSend } = useAction(sendMessage, {
		onSuccess: () => {
			// Message will be updated via realtime subscription
		},
		onError: ({ error }) => {
			toast.error(error.serverError || "Failed to send message");
		},
	});

	// Send direct message handler
	const { execute: executeSendDirect } = useAction(sendDirectMessage, {
		onSuccess: () => {
			// Message will be updated via realtime subscription
		},
		onError: ({ error }) => {
			toast.error(error.serverError || "Failed to send message");
		},
	});

	const handleSendMessage = async (
		content: string | null,
		attachments?: import("@/features/chats/types").AttachmentMetadata[],
	) => {
		if (!selectedId) return;

		if (selectedType === "cohort") {
			// Cohort message
			const optimisticId = `optimistic-${Date.now()}`;
			const optimisticMessage: Message = {
				id: optimisticId,
				content,
				userId: currentUserId,
				cohortId: selectedId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				editedAt: null,
				deletedAt: null,
				user: {
					id: currentUserId,
					name: "You",
					email: "",
				},
				attachments: [],
			};

			queryClient.setQueryData(chatsKeys.messages(selectedId), (old: any) => {
				if (!old?.pages) return old;

				const newPages = [...old.pages];
				if (newPages.length > 0) {
					newPages[0] = {
						...newPages[0],
						messages: [...newPages[0].messages, optimisticMessage],
					};
				}

				return {
					...old,
					pages: newPages,
				};
			});

			await executeSend({
				cohortId: selectedId,
				content: content || undefined,
				attachments,
			});
		} else if (selectedType === "conversation") {
			// Direct message
			const optimisticId = `optimistic-${Date.now()}`;
			const optimisticMessage: DirectMessage = {
				id: optimisticId,
				content,
				userId: currentUserId,
				conversationId: selectedId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				editedAt: null,
				deletedAt: null,
				user: {
					id: currentUserId,
					name: "You",
					email: "",
				},
				attachments: [],
			};

			queryClient.setQueryData(
				chatsKeys.directMessages(selectedId),
				(old: any) => {
					if (!old?.pages) return old;

					const newPages = [...old.pages];
					if (newPages.length > 0) {
						newPages[0] = {
							...newPages[0],
							messages: [...newPages[0].messages, optimisticMessage],
						};
					}

					return {
						...old,
						pages: newPages,
					};
				},
			);

			await executeSendDirect({
				conversationId: selectedId,
				content: content || undefined,
				attachments,
			});
		}
	};

	// Edit message handler
	const { execute: executeEdit } = useAction(editMessage, {
		onSuccess: () => {
			toast.success("Message edited");
			if (selectedId) {
				if (selectedType === "cohort") {
					queryClient.invalidateQueries({
						queryKey: chatsKeys.messages(selectedId),
					});
				} else if (selectedType === "conversation") {
					queryClient.invalidateQueries({
						queryKey: chatsKeys.directMessages(selectedId),
					});
				}
			}
		},
		onError: ({ error }) => {
			toast.error(error.serverError || "Failed to edit message");
		},
	});

	const handleEditMessage = async (
		messageId: string,
		content: string | null,
		attachmentsToRemove?: string[],
		attachmentsToAdd?: import("@/features/chats/types").AttachmentMetadata[],
	) => {
		await executeEdit({
			messageId,
			content: content || undefined,
			attachmentsToRemove,
			attachmentsToAdd,
		});
	};

	// Delete message handler
	const { execute: executeDelete } = useAction(deleteMessage, {
		onSuccess: () => {
			toast.success("Message deleted");
			if (selectedId) {
				if (selectedType === "cohort") {
					queryClient.invalidateQueries({
						queryKey: chatsKeys.messages(selectedId),
					});
				} else if (selectedType === "conversation") {
					queryClient.invalidateQueries({
						queryKey: chatsKeys.directMessages(selectedId),
					});
				}
			}
		},
		onError: ({ error }) => {
			toast.error(error.serverError || "Failed to delete message");
		},
	});

	const handleDeleteMessage = async (messageId: string) => {
		await executeDelete({ messageId });
	};

	// Create conversation handler
	const {
		execute: executeCreateConversation,
		isPending: isCreatingConversation,
	} = useAction(createConversationAsAdmin, {
		onSuccess: ({ data }) => {
			if (data?.conversationId) {
				// Invalidate conversations list
				queryClient.invalidateQueries({
					queryKey: chatsKeys.conversationsInfinite(),
				});

				// Select the new/existing conversation
				setSelectedId(data.conversationId);
				setSelectedType("conversation");

				// Close dialog
				setIsNewConversationDialogOpen(false);

				if (data.isNew) {
					toast.success("Conversation created");
				} else {
					toast.info("Conversation already exists");
				}
			}
		},
		onError: ({ error }) => {
			toast.error(error.serverError || "Failed to create conversation");
		},
	});

	const handleCreateConversation = async (userIds: string[]) => {
		await executeCreateConversation({ participantIds: userIds });
	};

	// Handle selecting a chat (either cohort or conversation)
	const handleSelectChat = (id: string) => {
		// Check if it's a conversation or cohort
		const isConversation = conversations.some((conv) => conv.id === id);
		if (isConversation) {
			setSelectedId(id);
			setSelectedType("conversation");
		} else {
			setSelectedId(id);
			setSelectedType("cohort");
		}
	};

	// Get conversation name (participants' names)
	const conversationName =
		selectedType === "conversation" && selectedId
			? conversations
					.find((c) => c.id === selectedId)
					?.participants.map((p) => p.name || p.email)
					.join(", ") || "Direct Message"
			: undefined;

	return (
		<div className="flex h-[calc(100vh-1.5rem)]">
			{/* Left sidebar - Chats list */}
			<ChatSidebar
				cohorts={cohorts}
				conversations={conversations}
				isLoading={isLoadingCohorts || isLoadingConversations}
				isFetchingNextPage={isFetchingNextPage}
				hasNextPage={hasNextPage ?? false}
				searchQuery={searchQuery}
				selectedCohortId={selectedType === "cohort" ? selectedId : null}
				selectedConversationId={
					selectedType === "conversation" ? selectedId : null
				}
				onSelectCohort={handleSelectChat}
				onSelectConversation={handleSelectChat}
				onSearchChange={setSearchQuery}
				onLoadMore={fetchNextPage}
				onCreateConversation={() => setIsNewConversationDialogOpen(true)}
				isCreatingConversation={isCreatingConversation}
				onOpenSettings={() => setIsSettingsDialogOpen(true)}
			/>

			{/* Center & Right - Chat + Members */}
			{selectedId && selectedType ? (
				<div className="flex flex-1">
					{/* Center - Chat messages */}
					<div className="flex-1 overflow-hidden">
						{selectedType === "cohort" ? (
							<ChatWrapper
								cohortId={selectedId}
								cohortName={selectedId}
								currentUserId={currentUserId}
								onSendMessage={handleSendMessage}
								onEditMessage={handleEditMessage}
								onDeleteMessage={handleDeleteMessage}
							/>
						) : (
							<Chat
								chatType="direct"
								conversationId={selectedId}
								conversationName={conversationName}
								currentUserId={currentUserId}
								messages={directMessages}
								isLoading={isLoadingMessages}
								mode="tab"
								hasNextPage={hasNextMessages}
								isFetchingNextPage={isFetchingNextMessages}
								onLoadMore={fetchNextMessages}
								onSendMessage={handleSendMessage}
								onEditMessage={handleEditMessage}
								onDeleteMessage={handleDeleteMessage}
							/>
						)}
					</div>

					{/* Right - Members sidebar */}
					<ChatMembersSidebar
						cohortId={selectedType === "cohort" ? selectedId : undefined}
						conversationId={
							selectedType === "conversation" ? selectedId : undefined
						}
						currentUserId={currentUserId}
					/>
				</div>
			) : (
				<div className="flex flex-1 items-center justify-center bg-background">
					<div className="text-center">
						<MessageCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">
							Select a chat to start messaging
						</h3>
						<p className="text-muted-foreground text-sm">
							Choose a conversation or cohort from the list
						</p>
					</div>
				</div>
			)}

			{/* New Conversation Dialog */}
			<NewConversationDialog
				open={isNewConversationDialogOpen}
				onOpenChange={setIsNewConversationDialogOpen}
				users={users}
				isLoading={false}
				onCreateConversation={handleCreateConversation}
				isCreating={isCreatingConversation}
			/>

			{/* Notification Settings Dialog */}
			<ChatNotificationSettings
				open={isSettingsDialogOpen}
				onOpenChange={setIsSettingsDialogOpen}
				initialEmailEnabled={notificationPreferences.emailNotificationsEnabled}
				onPreferencesUpdated={(emailEnabled) => {
					setNotificationPreferences({
						emailNotificationsEnabled: emailEnabled,
					});
				}}
			/>
		</div>
	);
}
