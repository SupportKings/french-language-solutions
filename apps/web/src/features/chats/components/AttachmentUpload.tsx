"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { FileIcon, ImageIcon, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import type { AttachmentPreview } from "../types";

/**
 * Generic file upload component for chat attachments
 * Fully reusable - works with cohort messages, direct messages, or any chat type
 * No message-type-specific logic
 */

interface AttachmentUploadProps {
	attachments: AttachmentPreview[];
	onAdd: (files: AttachmentPreview[]) => void;
	onRemove: (index: number) => void;
	disabled?: boolean;
	maxFiles?: number;
}

const SIZE_LIMITS = {
	image: 5 * 1024 * 1024, // 5MB
	document: 10 * 1024 * 1024, // 10MB
};

const ALLOWED_TYPES = {
	image: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
	document: [
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"text/plain",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	],
};

export function AttachmentUpload({
	attachments,
	onAdd,
	onRemove,
	disabled = false,
	maxFiles = 10,
}: AttachmentUploadProps) {
	const [isProcessing, setIsProcessing] = useState(false);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		if (attachments.length + files.length > maxFiles) {
			toast.error(`Maximum ${maxFiles} files allowed`);
			return;
		}

		setIsProcessing(true);
		const newAttachments: AttachmentPreview[] = [];

		for (const file of files) {
			// Determine file type
			const isImage = ALLOWED_TYPES.image.includes(file.type);
			const isDocument = ALLOWED_TYPES.document.includes(file.type);

			if (!isImage && !isDocument) {
				toast.error(`File type not supported: ${file.name}`);
				continue;
			}

			const type = isImage ? "image" : "document";
			const maxSize = SIZE_LIMITS[type];

			if (file.size > maxSize) {
				toast.error(
					`${file.name} is too large. Max size for ${type}s is ${maxSize / (1024 * 1024)}MB`,
				);
				continue;
			}

			// Create preview for images
			let preview: string | undefined;
			if (isImage) {
				preview = URL.createObjectURL(file);
			}

			newAttachments.push({
				file,
				preview,
				type,
			});
		}

		onAdd(newAttachments);
		setIsProcessing(false);
		e.target.value = ""; // Reset input
	};

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	return (
		<div className="space-y-2">
			<input
				id="chat-file-upload"
				type="file"
				multiple
				accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
				onChange={handleFileSelect}
				className="hidden"
				disabled={disabled || isProcessing}
			/>

			{attachments.length > 0 && (
				<div className="flex flex-wrap gap-2 rounded-lg border border-border bg-muted/30 p-2">
					{attachments.map((attachment, index) => (
						<div
							key={`${attachment.file.name}-${index}`}
							className="relative flex max-w-[200px] items-center gap-2 rounded-md border border-border bg-background p-2"
						>
							{attachment.type === "image" && attachment.preview ? (
								<img
									src={attachment.preview}
									alt={attachment.file.name}
									className="h-10 w-10 rounded object-cover"
								/>
							) : (
								<div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
									<FileIcon className="h-5 w-5 text-muted-foreground" />
								</div>
							)}
							<div className="min-w-0 flex-1">
								<p className="truncate font-medium text-xs">
									{attachment.file.name}
								</p>
								<p className="text-muted-foreground text-xs">
									{formatFileSize(attachment.file.size)}
								</p>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => onRemove(index)}
								className="h-6 w-6 p-0"
								disabled={disabled}
							>
								<X className="h-3 w-3" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
