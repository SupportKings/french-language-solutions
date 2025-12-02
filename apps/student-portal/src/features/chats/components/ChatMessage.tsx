"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { format, isThisWeek, isToday, isYesterday } from "date-fns";
import { Check, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadFileToStorage } from "../lib/uploadToStorage";
import type {
	AttachmentMetadata,
	AttachmentPreview,
	DeleteMessageHandler,
	EditMessageHandler,
	Message,
	MessageAttachment,
} from "../types";
import { AttachmentUpload } from "./AttachmentUpload";
import { MessageActions } from "./MessageActions";
import { MessageAttachments } from "./MessageAttachments";

interface ChatMessageProps {
	message: Message;
	isCurrentUser: boolean;
	showHeader: boolean;
	cohortId: string; // Required for file uploads
	currentUserId: string; // Required for storage upload
	onEdit: EditMessageHandler;
	onDelete: DeleteMessageHandler;
}

function formatMessageTime(date: Date): string {
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
		return `${diffInMinutes} min ago`;
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
		return format(messageDate, "EEEE");
	}

	// Older - show date
	return format(messageDate, "MMM d");
}

export function ChatMessage({
	message,
	isCurrentUser,
	showHeader,
	cohortId,
	currentUserId,
	onEdit,
	onDelete,
}: ChatMessageProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(message.content || "");
	const [isEditPending, setIsEditPending] = useState(false);
	const [isDeletePending, setIsDeletePending] = useState(false);

	// Attachment management for edit mode
	const [existingAttachments, setExistingAttachments] = useState<
		MessageAttachment[]
	>(message.attachments || []);
	const [attachmentsToRemove, setAttachmentsToRemove] = useState<string[]>([]);
	const [newAttachments, setNewAttachments] = useState<AttachmentPreview[]>([]);

	const handleEdit = async () => {
		const trimmedContent = editContent.trim();
		const hasContentChange = trimmedContent !== (message.content || "");
		const hasAttachmentChanges =
			attachmentsToRemove.length > 0 || newAttachments.length > 0;

		// Calculate remaining attachments after removals
		const remainingExistingCount =
			(message.attachments?.length || 0) - attachmentsToRemove.length;
		const totalAttachmentsAfterEdit =
			remainingExistingCount + newAttachments.length;

		// Validate: message must have content OR attachments
		if (!trimmedContent && totalAttachmentsAfterEdit === 0) {
			toast.error("Message must have content or attachments");
			return;
		}

		// Skip if no changes
		if (!hasContentChange && !hasAttachmentChanges) {
			setIsEditing(false);
			return;
		}

		setIsEditPending(true);
		try {
			// Upload new attachments directly to storage (client-side)
			let uploadedAttachments: AttachmentMetadata[] = [];
			if (newAttachments.length > 0) {
				const uploadPromises = newAttachments.map(async (att) => {
					try {
						return await uploadFileToStorage(att.file, currentUserId);
					} catch (error) {
						console.error("Failed to upload file:", att.file.name, error);
						return null;
					}
				});

				const results = await Promise.all(uploadPromises);
				uploadedAttachments = results.filter(
					(r): r is AttachmentMetadata => r !== null,
				);

				if (uploadedAttachments.length !== newAttachments.length) {
					toast.error("Some files failed to upload");
				}
			}

			// Call onEdit with all changes
			await onEdit(
				message.id,
				trimmedContent || null,
				attachmentsToRemove.length > 0 ? attachmentsToRemove : undefined,
				uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
			);

			// Reset edit state
			setIsEditing(false);
			setAttachmentsToRemove([]);
			setNewAttachments([]);

			// Clean up preview URLs
			newAttachments.forEach((att) => {
				if (att.preview) URL.revokeObjectURL(att.preview);
			});
		} catch (error) {
			console.error("Failed to edit message:", error);
			toast.error("Failed to edit message");
		} finally {
			setIsEditPending(false);
		}
	};

	const handleDeleteClick = async () => {
		if (confirm("Are you sure you want to delete this message?")) {
			setIsDeletePending(true);
			try {
				await onDelete(message.id);
			} finally {
				setIsDeletePending(false);
			}
		}
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditContent(message.content || "");
		setAttachmentsToRemove([]);
		setNewAttachments([]);
		// Clean up preview URLs
		newAttachments.forEach((att) => {
			if (att.preview) URL.revokeObjectURL(att.preview);
		});
	};

	const handleRemoveExistingAttachment = (attachmentId: string) => {
		setAttachmentsToRemove((prev) => [...prev, attachmentId]);
	};

	const handleUndoRemoveAttachment = (attachmentId: string) => {
		setAttachmentsToRemove((prev) => prev.filter((id) => id !== attachmentId));
	};

	const handleAddNewAttachments = (attachments: AttachmentPreview[]) => {
		setNewAttachments((prev) => [...prev, ...attachments]);
	};

	const handleRemoveNewAttachment = (index: number) => {
		const attachment = newAttachments[index];
		if (attachment.preview) {
			URL.revokeObjectURL(attachment.preview);
		}
		setNewAttachments((prev) => prev.filter((_, i) => i !== index));
	};

	// Get visible existing attachments (not marked for removal)
	const visibleExistingAttachments = (message.attachments || []).filter(
		(att) => !attachmentsToRemove.includes(att.id),
	);

	// Don't show deleted messages
	if (message.deletedAt) {
		return null;
	}

	return (
		<div
			className={cn("group mt-2 flex", {
				"justify-end": isCurrentUser,
				"justify-start": !isCurrentUser,
			})}
		>
			<div
				className={cn("flex w-fit max-w-[75%] flex-col gap-1", {
					"items-end": isCurrentUser,
				})}
			>
				{showHeader && (
					<div
						className={cn("flex items-center gap-2 px-3 text-xs", {
							"flex-row-reverse justify-end": isCurrentUser,
						})}
					>
						<span className="font-medium">
							{isCurrentUser
								? "You"
								: message.user?.name || message.user?.email || "Unknown User"}
						</span>
						<span className="text-foreground/50 text-xs">
							{formatMessageTime(new Date(message.createdAt))}
						</span>
						{message.editedAt && (
							<span className="text-foreground/50 text-xs italic">
								(edited)
							</span>
						)}
					</div>
				)}

				<div className="flex items-start gap-2">
					{isEditing ? (
						<div className="flex w-full flex-col gap-2">
							<Textarea
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleEdit();
									} else if (e.key === "Escape") {
										handleCancelEdit();
									}
								}}
								className={cn(
									"min-h-[40px] resize-none rounded-xl px-3 py-2 text-sm",
									isCurrentUser
										? "bg-primary text-primary-foreground placeholder:text-primary-foreground/50"
										: "bg-muted text-foreground",
								)}
								disabled={isEditPending}
								autoFocus
								rows={editContent.split("\n").length || 1}
								placeholder="Type a message..."
							/>

							{/* Existing attachments (with remove/undo) */}
							{message.attachments && message.attachments.length > 0 && (
								<div className="space-y-2">
									<p className="text-muted-foreground text-xs">
										Current attachments:
									</p>
									<div className="flex flex-wrap gap-2">
										{message.attachments.map((att) => {
											const isMarkedForRemoval = attachmentsToRemove.includes(
												att.id,
											);
											return (
												<div
													key={att.id}
													className={cn(
														"relative flex items-center gap-2 rounded-md border p-2 transition-opacity",
														isMarkedForRemoval
															? "border-destructive bg-destructive/10 opacity-50"
															: "border-border bg-background",
													)}
												>
													<div className="flex min-w-0 items-center gap-2">
														{att.fileType === "image" ? (
															<img
																src={att.fileUrl}
																alt={att.fileName}
																className="h-8 w-8 rounded object-cover"
															/>
														) : (
															<div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
																<span className="text-xs">📄</span>
															</div>
														)}
														<div className="min-w-0">
															<p className="max-w-[120px] truncate font-medium text-xs">
																{att.fileName}
															</p>
														</div>
													</div>
													{isMarkedForRemoval ? (
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => handleUndoRemoveAttachment(att.id)}
															className="h-6 w-6 p-0"
															disabled={isEditPending}
														>
															<span className="text-xs">↺</span>
														</Button>
													) : (
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() =>
																handleRemoveExistingAttachment(att.id)
															}
															className="h-6 w-6 p-0"
															disabled={isEditPending}
														>
															<Trash2 className="h-3 w-3" />
														</Button>
													)}
												</div>
											);
										})}
									</div>
								</div>
							)}

							{/* New attachments to add */}
							<AttachmentUpload
								attachments={newAttachments}
								onAdd={handleAddNewAttachments}
								onRemove={handleRemoveNewAttachment}
								disabled={isEditPending}
								maxFiles={10}
							/>

							<div className="flex justify-end gap-1">
								<Button
									size="sm"
									variant="ghost"
									onClick={handleCancelEdit}
									disabled={isEditPending}
								>
									<X className="mr-1 h-4 w-4" />
									Cancel
								</Button>
								<Button size="sm" onClick={handleEdit} disabled={isEditPending}>
									<Check className="mr-1 h-4 w-4" />
									Save
								</Button>
							</div>
						</div>
					) : (
						<div className="flex items-center justify-between gap-2">
							{isCurrentUser && !message.id.startsWith("optimistic-") && (
								<MessageActions
									onEdit={() => setIsEditing(true)}
									onDelete={handleDeleteClick}
									isDeleting={isDeletePending}
								/>
							)}
							<div
								className={cn(
									"w-fit rounded-xl text-sm",
									isCurrentUser
										? "bg-primary text-primary-foreground"
										: "bg-muted text-foreground",
								)}
							>
								{/* Message content */}
								{message.content && (
									<div className="overflow-wrap-anywhere whitespace-pre-wrap break-all px-3 py-2">
										{message.content}
									</div>
								)}

								{/* Attachments inside bubble */}
								{message.attachments && message.attachments.length > 0 && (
									<div className={cn(message.content && "px-2 pt-0 pb-2")}>
										<MessageAttachments attachments={message.attachments} />
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
