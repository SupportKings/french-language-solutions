"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Loader2, Paperclip, Send } from "lucide-react";
import { toast } from "sonner";
import { uploadFileToStorage } from "../lib/uploadToStorage";
import type { AttachmentMetadata, AttachmentPreview } from "../types";
import { AttachmentUpload } from "./AttachmentUpload";

interface ChatInputProps {
	chatType?: "cohort" | "direct";
	cohortId?: string; // Required for cohort chats file upload
	conversationId?: string; // Required for direct message file upload
	currentUserId: string; // Required for storage upload
	onSend: (
		content: string | null,
		attachments?: AttachmentMetadata[],
	) => Promise<void>;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
}

export function ChatInput({
	chatType = "cohort",
	cohortId,
	conversationId,
	currentUserId,
	onSend,
	disabled = false,
	placeholder = "Type a message...",
	className,
}: ChatInputProps) {
	const [content, setContent] = useState("");
	const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
	const [isSending, setIsSending] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	const handleAddAttachments = (newAttachments: AttachmentPreview[]) => {
		setAttachments([...attachments, ...newAttachments]);
	};

	const handleRemoveAttachment = (index: number) => {
		const attachment = attachments[index];
		if (attachment.preview) {
			URL.revokeObjectURL(attachment.preview);
		}
		setAttachments(attachments.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const trimmedContent = content.trim();
		if (!trimmedContent && attachments.length === 0) return;
		if (isSending || disabled || isUploading) return;

		setIsSending(true);
		setIsUploading(true);

		try {
			// Upload attachments directly to storage (client-side)
			let uploadedAttachments: AttachmentMetadata[] = [];
			if (attachments.length > 0) {
				const uploadPromises = attachments.map(async (att) => {
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

				if (uploadedAttachments.length !== attachments.length) {
					toast.error("Some files failed to upload");
				}
			}

			setIsUploading(false);

			// Send message with attachments
			await onSend(
				trimmedContent || null,
				uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
			);

			// Clear form
			setContent("");
			attachments.forEach((att) => {
				if (att.preview) URL.revokeObjectURL(att.preview);
			});
			setAttachments([]);
		} catch (error) {
			console.error("Failed to send message:", error);
			toast.error("Failed to send message");
		} finally {
			setIsSending(false);
			setIsUploading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		// Submit on Enter (without Shift)
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e as any);
		}
		// Allow Shift+Enter for new line (default behavior)
	};

	const canSend =
		(content.trim() || attachments.length > 0) && !isSending && !isUploading;

	return (
		<form
			onSubmit={handleSubmit}
			className={cn(
				"flex w-full flex-col gap-2 border-border border-t p-4",
				className,
			)}
		>
			<AttachmentUpload
				attachments={attachments}
				onAdd={handleAddAttachments}
				onRemove={handleRemoveAttachment}
				disabled={disabled || isSending}
			/>

			<div className="flex gap-2">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => document.getElementById("chat-file-upload")?.click()}
					disabled={disabled || isSending || isUploading}
					className="shrink-0"
				>
					<Paperclip className="h-4 w-4" />
				</Button>

				<Textarea
					className="max-h-[120px] min-h-[40px] flex-1 resize-none rounded-2xl bg-background text-sm"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled || isSending}
					rows={1}
				/>

				{canSend && (
					<Button
						className="aspect-square shrink-0 rounded-full"
						type="submit"
						size="icon"
						disabled={!canSend}
					>
						{isUploading ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Send className="size-4" />
						)}
					</Button>
				)}
			</div>
		</form>
	);
}
