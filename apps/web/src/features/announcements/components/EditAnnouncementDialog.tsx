"use client";

import React, { useEffect, useState, useTransition } from "react";

import { RichTextEditor } from "@/components/rich-text-editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useQueryClient } from "@tanstack/react-query";
import {
	FileIcon,
	ImageIcon,
	Loader2,
	Upload,
	VideoIcon,
	X,
} from "lucide-react";
import { toast } from "sonner";
import { updateAnnouncement, uploadAttachment } from "../actions";
import type { AnnouncementWithDetails } from "../queries";
import { announcementsKeys } from "../queries/announcements.queries";

interface EditAnnouncementDialogProps {
	announcement: AnnouncementWithDetails | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface AttachmentFile {
	fileName: string;
	fileUrl: string;
	fileType: "image" | "video" | "document";
	fileSize: number;
	preview?: string;
}

export function EditAnnouncementDialog({
	announcement,
	open,
	onOpenChange,
}: EditAnnouncementDialogProps) {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState<any>(null);
	const [scope, setScope] = useState<"school_wide" | "cohort">("cohort");
	const [isPinned, setIsPinned] = useState(false);
	const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [isPending, startTransition] = useTransition();

	const queryClient = useQueryClient();

	// Initialize form with announcement data
	useEffect(() => {
		if (announcement) {
			setTitle(announcement.title);
			setScope(announcement.scope);
			setIsPinned(announcement.is_pinned);

			// Parse content
			try {
				const parsedContent = JSON.parse(announcement.content);
				setContent(parsedContent);
			} catch {
				setContent(null);
			}

			// Set attachments
			const existingAttachments: AttachmentFile[] =
				announcement.attachments?.map((att) => ({
					fileName: att.file_name,
					fileUrl: att.file_url,
					fileType: att.file_type as "image" | "video" | "document",
					fileSize: att.file_size,
				})) || [];
			setAttachments(existingAttachments);
		}
	}, [announcement]);

	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;

		setIsUploading(true);

		try {
			const uploadPromises = Array.from(files).map(async (file) => {
				const result = await uploadAttachment({ file });

				if (result?.data?.data) {
					const fileData = result.data.data;
					return {
						fileName: fileData.fileName,
						fileUrl: fileData.fileUrl,
						fileType: fileData.fileType,
						fileSize: fileData.fileSize,
					};
				}
				return null;
			});

			const uploaded = await Promise.all(uploadPromises);
			const validUploads = uploaded.filter(
				(f) => f !== null,
			) as AttachmentFile[];

			setAttachments((prev) => [...prev, ...validUploads]);
			toast.success(`${validUploads.length} file(s) uploaded successfully`);
		} catch (error) {
			toast.error("Failed to upload files");
			console.error(error);
		} finally {
			setIsUploading(false);
		}
	};

	const removeAttachment = (index: number) => {
		setAttachments((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = () => {
		if (!announcement) return;

		if (!title.trim()) {
			toast.error("Please enter a title");
			return;
		}

		if (!content) {
			toast.error("Please enter content");
			return;
		}

		startTransition(async () => {
			try {
				// Convert TipTap JSON to HTML string for storage
				const contentHTML = JSON.stringify(content);

				const result = await updateAnnouncement({
					id: announcement.id,
					title,
					content: contentHTML,
					isPinned,
					attachments,
				});

				if (result?.data) {
					toast.success("Announcement updated successfully");
					queryClient.invalidateQueries({
						queryKey: announcementsKeys.lists(),
					});
					onOpenChange(false);
				}
			} catch (error) {
				toast.error("Failed to update announcement");
				console.error(error);
			}
		});
	};

	const getFileIcon = (fileType: string) => {
		if (fileType === "image") return <ImageIcon className="h-4 w-4" />;
		if (fileType === "video") return <VideoIcon className="h-4 w-4" />;
		return <FileIcon className="h-4 w-4" />;
	};

	if (!announcement) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Announcement</DialogTitle>
					<DialogDescription>
						Update announcement details
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Title */}
					<div className="space-y-2">
						<Label htmlFor="title">
							Title <span className="text-destructive">*</span>
						</Label>
						<Input
							id="title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Enter announcement title"
						/>
					</div>

					{/* Content */}
					<div className="space-y-2">
						<Label>
							Content <span className="text-destructive">*</span>
						</Label>
						<RichTextEditor
							content={content}
							onChange={setContent}
							placeholder="Write your announcement..."
							className="min-h-[200px]"
						/>
					</div>

					{/* Scope - Display only, not editable */}
					<div className="space-y-2">
						<Label>Scope</Label>
						<div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
							{scope === "school_wide" ? (
								<span>School-wide</span>
							) : (
								<span>
									Cohort: {announcement.cohort?.nickname || "Unknown Cohort"}
								</span>
							)}
						</div>
						<p className="text-muted-foreground text-xs">
							Scope cannot be changed after creation
						</p>
					</div>

					{/* Pin Checkbox */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="pinned"
							checked={isPinned}
							onCheckedChange={(checked) => setIsPinned(checked as boolean)}
						/>
						<Label
							htmlFor="pinned"
							className="cursor-pointer font-normal text-sm"
						>
							Pin this announcement (appears first)
						</Label>
					</div>

					{/* File Upload */}
					<div className="space-y-2">
						<Label>Attachments (optional)</Label>
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={isUploading}
								onClick={() => document.getElementById("file-upload-edit")?.click()}
							>
								{isUploading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Uploading...
									</>
								) : (
									<>
										<Upload className="mr-2 h-4 w-4" />
										Upload Files
									</>
								)}
							</Button>
							<input
								id="file-upload-edit"
								type="file"
								multiple
								accept="image/*,video/*,.pdf,.doc,.docx"
								onChange={handleFileUpload}
								className="hidden"
							/>
						</div>

						{/* Attachments List */}
						{attachments.length > 0 && (
							<div className="mt-2 space-y-2">
								{attachments.map((attachment, index) => (
									<div
										key={index}
										className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2"
									>
										{attachment.fileType === "image" ? (
											<img
												src={attachment.fileUrl}
												alt={attachment.fileName}
												className="h-10 w-10 rounded object-cover"
											/>
										) : (
											<div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
												{getFileIcon(attachment.fileType)}
											</div>
										)}
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-sm">
												{attachment.fileName}
											</p>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() => removeAttachment(index)}
											className="h-8 w-8 p-0"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isPending || isUploading}>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Updating...
							</>
						) : (
							"Update Announcement"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
