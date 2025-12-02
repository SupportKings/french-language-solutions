// TypeScript types for the chat feature

// Generic attachment interface - works with any message type
export interface MessageAttachment {
	id: string;
	messageId: string;
	fileName: string;
	fileUrl: string;
	fileType: "image" | "document";
	fileSize: number;
	createdAt: string;
}

// Attachment preview (before upload) - used in upload UI
export interface AttachmentPreview {
	file: File;
	preview?: string; // Image preview URL (for display)
	type: "image" | "document";
}

// Attachment metadata for server actions
export interface AttachmentMetadata {
	fileName: string;
	fileUrl: string;
	fileType: "image" | "document";
	fileSize: number;
	storagePath?: string; // For cleanup if needed
}

export interface Message {
	id: string;
	userId: string;
	content: string | null; // Now nullable - messages can be attachment-only
	createdAt: string;
	updatedAt: string;
	editedAt: string | null;
	deletedAt: string | null;
	// Populated from joins
	user: {
		id: string;
		name: string | null;
		email: string;
	};
	cohortId?: string; // Optional - not present for direct messages
	attachments?: MessageAttachment[]; // Generic attachments
}

// Action handler types
export type SendMessageHandler = (
	content: string | null,
	attachments?: AttachmentMetadata[],
) => Promise<void>;

export type EditMessageHandler = (
	messageId: string,
	content: string | null,
	attachmentsToRemove?: string[],
	attachmentsToAdd?: AttachmentMetadata[],
) => Promise<void>;

export type DeleteMessageHandler = (messageId: string) => Promise<void>;

export interface ChatProps {
	chatType?: "cohort" | "direct";
	// For cohort chats
	cohortId?: string;
	cohortName?: string;
	// For direct messages
	conversationId?: string;
	conversationName?: string;
	// Common props
	currentUserId: string;
	messages: Message[] | DirectMessage[];
	isLoading?: boolean;
	mode?: "standalone" | "tab" | "widget";
	maxHeight?: string;
	showHeader?: boolean;
	className?: string;
	// Pagination props
	hasNextPage?: boolean;
	isFetchingNextPage?: boolean;
	onLoadMore?: () => void;
	// Action handlers
	onSendMessage: SendMessageHandler;
	onEditMessage: EditMessageHandler;
	onDeleteMessage: DeleteMessageHandler;
}

export interface SendMessageInput {
	cohortId: string;
	content?: string;
	attachments?: AttachmentMetadata[];
}

export interface SendDirectMessageInput {
	conversationId: string;
	content?: string;
	attachments?: AttachmentMetadata[];
}

export interface DeleteMessageInput {
	messageId: string;
}

export interface EditMessageInput {
	messageId: string;
	content?: string;
	attachmentsToRemove?: string[];
	attachmentsToAdd?: AttachmentMetadata[];
}

// Cohort members interfaces
export interface CohortMember {
	id: string;
	userId: string;
	name: string | null;
	email: string;
	role: "teacher" | "student";
	enrollmentStatus?:
		| "paid"
		| "welcome_package_sent"
		| "transitioning"
		| "offboarding";
}

export interface CohortMembers {
	teachers: CohortMember[];
	students: CohortMember[];
	totalCount: number;
}

// Direct Messages / Private Chat types

export interface DirectMessage extends Message {
	conversationId: string;
}

export interface Conversation {
	id: string;
	createdAt: string;
	updatedAt: string;
	lastMessageAt: string | null;
	participants: ConversationParticipant[];
	lastMessage?: {
		content: string | null;
		createdAt: string;
		senderName: string;
		senderId: string;
	} | null;
	unreadCount?: number;
}

export interface ConversationParticipant {
	userId: string;
	name: string | null;
	email: string;
	role: string;
	joinedAt: string;
}

export interface ConversationListItem {
	id: string;
	participants: ConversationParticipant[];
	lastMessage: {
		content: string | null;
		createdAt: string;
		senderName: string;
		senderId: string;
	} | null;
	lastMessageAt: string | null;
	unreadCount: number;
}

export interface ChatNotificationPreferences {
	emailNotificationsEnabled: boolean;
}
