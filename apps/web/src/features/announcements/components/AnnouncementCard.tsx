"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { RichTextEditor } from "@/components/rich-text-editor/RichTextEditor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
	ChevronLeft,
	ChevronRight,
	Eye,
	FileIcon,
	ImageIcon,
	MoreVertical,
	Pencil,
	Pin,
	Trash2,
	VideoIcon,
	X,
} from "lucide-react";
import { toast } from "sonner";
import { deleteAnnouncement, togglePinAnnouncement } from "../actions";
import type { AnnouncementWithDetails } from "../queries";
import { announcementsKeys } from "../queries/announcements.queries";

interface AnnouncementCardProps {
	announcement: AnnouncementWithDetails;
	onViewStats?: (id: string) => void;
	onEdit?: (id: string) => void;
}

export function AnnouncementCard({
	announcement,
	onViewStats,
	onEdit,
}: AnnouncementCardProps) {
	const [isPending, startTransition] = useTransition();
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const queryClient = useQueryClient();
	const router = useRouter();

	// Get all image attachments
	const imageAttachments =
		announcement.attachments?.filter((a) => a.file_type === "image") || [];
	const nonImageAttachments =
		announcement.attachments?.filter((a) => a.file_type !== "image") || [];

	const initials = announcement.author
		? announcement.author.name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "A";

	const authorName = announcement.author ? announcement.author.name : "Unknown";

	const formattedDate = format(
		parseISO(announcement.created_at),
		"MMM d, h:mm a",
	);

	const handleTogglePin = () => {
		startTransition(async () => {
			try {
				const result = await togglePinAnnouncement({
					id: announcement.id,
					isPinned: !announcement.is_pinned,
				});

				console.log("Toggle pin result:", result);

				if (result?.data?.success) {
					toast.success(
						announcement.is_pinned
							? "Announcement unpinned"
							: "Announcement pinned",
					);
					// Invalidate all announcement list queries
					await queryClient.invalidateQueries({
						queryKey: announcementsKeys.all,
					});
				} else if (result?.serverError) {
					console.error("Server error:", result.serverError);
					toast.error(result.serverError);
				} else if (result?.validationErrors) {
					console.error("Validation errors:", result.validationErrors);
					toast.error("Invalid input");
				} else {
					toast.error("Failed to toggle pin");
				}
			} catch (error) {
				console.error("Toggle pin error:", error);
				toast.error("Failed to toggle pin");
			}
		});
	};

	const handleDeleteClick = () => {
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		startTransition(async () => {
			try {
				await deleteAnnouncement({ id: announcement.id });
				toast.success("Announcement deleted");
				queryClient.invalidateQueries({ queryKey: announcementsKeys.lists() });
				setDeleteDialogOpen(false);
			} catch (error) {
				toast.error("Failed to delete announcement");
			}
		});
	};

	const handleCohortClick = () => {
		if (announcement.scope === "cohort" && announcement.cohort_id) {
			router.push(`/admin/cohorts/${announcement.cohort_id}`);
		}
	};

	const openLightbox = (index: number) => {
		setCurrentImageIndex(index);
		setLightboxOpen(true);
	};

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % imageAttachments.length);
	};

	const previousImage = () => {
		setCurrentImageIndex(
			(prev) => (prev - 1 + imageAttachments.length) % imageAttachments.length,
		);
	};

	const getFileIcon = (fileType: string) => {
		if (fileType === "image") return <ImageIcon className="h-4 w-4" />;
		if (fileType === "video") return <VideoIcon className="h-4 w-4" />;
		return <FileIcon className="h-4 w-4" />;
	};

	// Parse content from JSON string
	let parsedContent;
	try {
		parsedContent = JSON.parse(announcement.content);
	} catch {
		parsedContent = null;
	}

	return (
		<>
			<Card className="group hover:-translate-y-0.5 transition-all duration-200 hover:shadow-md">
				<CardContent className="p-5">
					{/* Header - Avatar + Name + Timestamp + Actions */}
					<div className="mb-3 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Avatar className="h-10 w-10">
								<AvatarFallback className="bg-primary/10 font-semibold text-primary text-sm">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div className="flex items-center gap-2">
								<span className="font-bold text-foreground">{authorName}</span>
								<span className="text-muted-foreground/60">·</span>
								<span className="text-muted-foreground/60 text-xs">
									{formattedDate}
								</span>
								{announcement.is_pinned && (
									<Badge
										variant="outline"
										className="ml-1 gap-1 border-secondary/30 bg-secondary/5 text-secondary text-xs"
									>
										<Pin className="h-3 w-3 rotate-45" />
										Pinned
									</Badge>
								)}
							</div>
						</div>

						{/* Actions Menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
									disabled={isPending}
								>
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={handleTogglePin}>
									<Pin className="mr-2 h-4 w-4" />
									{announcement.is_pinned ? "Unpin" : "Pin"} Announcement
								</DropdownMenuItem>
								{onEdit && (
									<DropdownMenuItem onClick={() => onEdit(announcement.id)}>
										<Pencil className="mr-2 h-4 w-4" />
										Edit
									</DropdownMenuItem>
								)}

								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleDeleteClick}
									className="text-destructive focus:text-destructive"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Body - Title + Content + Category */}
					<div className="space-y-2.5">
						{/* Title */}
						<h3 className="font-bold text-foreground text-xl leading-tight">
							{announcement.title}
						</h3>

						{/* Content */}
						<div className="prose prose-sm max-w-none text-muted-foreground text-sm leading-relaxed">
							{parsedContent ? (
								<RichTextEditor
									content={parsedContent}
									onChange={() => {}}
									editable={false}
									className="border-0 bg-transparent p-0 [&_.ProseMirror]:min-h-0 [&_.ProseMirror]:p-0"
								/>
							) : (
								<div className="whitespace-pre-line">
									{announcement.content}
								</div>
							)}
						</div>

						{/* Category Badge */}
						<div>
							<Badge
								variant="secondary"
								className={
									announcement.scope === "school_wide"
										? "border-primary/20 bg-primary/10 font-medium text-primary text-xs"
										: "cursor-pointer border-accent/25 bg-accent/15 font-medium text-foreground text-xs transition-colors hover:bg-accent/25"
								}
								onClick={
									announcement.scope === "cohort"
										? handleCohortClick
										: undefined
								}
							>
								{announcement.scope === "school_wide"
									? "School-wide"
									: announcement.cohort?.nickname || "Cohort"}
							</Badge>
						</div>

						{/* Image Attachments Grid */}
						{imageAttachments.length > 0 && (
							<div
								className={`grid gap-2 ${
									imageAttachments.length === 1
										? "grid-cols-1"
										: imageAttachments.length === 2
											? "grid-cols-2"
											: imageAttachments.length === 3
												? "grid-cols-3"
												: "grid-cols-2"
								}`}
							>
								{imageAttachments.map((attachment, index) => (
									<button
										key={attachment.id}
										type="button"
										onClick={() => openLightbox(index)}
										className={`group relative cursor-pointer overflow-hidden rounded-lg border border-border/50 transition-all hover:border-primary/30 ${
											imageAttachments.length === 1
												? "aspect-video"
												: imageAttachments.length === 3
													? "aspect-square"
													: index === 0 && imageAttachments.length > 3
														? "col-span-2 aspect-video"
														: "aspect-square"
										}`}
									>
										<img
											src={attachment.file_url}
											alt={attachment.file_name}
											className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
										/>
										{imageAttachments.length > 1 && (
											<div className="absolute right-2 bottom-2 rounded bg-black/60 px-2 py-1 text-white text-xs">
												{index + 1}/{imageAttachments.length}
											</div>
										)}
									</button>
								))}
							</div>
						)}

						{/* Non-Image Attachments */}
						{nonImageAttachments.length > 0 && (
							<div className="space-y-2">
								{nonImageAttachments.map((attachment) => (
									<a
										key={attachment.id}
										href={attachment.file_url}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2 transition-colors hover:bg-muted/50"
									>
										<div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
											{getFileIcon(attachment.file_type)}
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-sm">
												{attachment.file_name}
											</p>
											<p className="text-muted-foreground text-xs">
												{(attachment.file_size / 1024).toFixed(0)} KB
											</p>
										</div>
									</a>
								))}
							</div>
						)}
					</div>

					{/* Footer - Read Stats */}
					<div className="mt-4 flex items-center justify-between border-t pt-3">
						<div className="flex items-center gap-2 text-muted-foreground/70 text-xs">
							{announcement._count.reads > 0 ? (
								<>
									<Eye className="h-4 w-4" />
									<span>
										{announcement._count.reads} student
										{announcement._count.reads !== 1 ? "s" : ""} read this
									</span>
								</>
							) : (
								<>
									<Eye className="h-4 w-4 opacity-50" />
									<span>No reads yet</span>
								</>
							)}
						</div>
						{onViewStats && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onViewStats(announcement.id)}
								className="text-primary text-xs hover:bg-primary/5 hover:text-primary"
							>
								View Details
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Image Lightbox */}
			{imageAttachments.length > 0 && (
				<Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
					<DialogContent className="max-w-5xl border-0 bg-black/95 p-0">
						<DialogTitle className="sr-only">
							Image {currentImageIndex + 1} of {imageAttachments.length}
						</DialogTitle>
						<div className="relative flex max-h-[90vh] min-h-[400px] items-center justify-center">
							{/* Close Button */}
							<button
								onClick={() => setLightboxOpen(false)}
								className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
								type="button"
							>
								<X className="h-5 w-5" />
							</button>

							{/* Image Counter */}
							{imageAttachments.length > 1 && (
								<div className="absolute top-4 left-4 z-10 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white">
									{currentImageIndex + 1} / {imageAttachments.length}
								</div>
							)}

							{/* Previous Button */}
							{imageAttachments.length > 1 && (
								<button
									onClick={previousImage}
									className="absolute left-4 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
									type="button"
								>
									<ChevronLeft className="h-6 w-6" />
								</button>
							)}

							{/* Image */}
							{imageAttachments[currentImageIndex] && (
								<img
									src={imageAttachments[currentImageIndex].file_url}
									alt={imageAttachments[currentImageIndex].file_name}
									className="max-h-[90vh] w-auto object-contain"
								/>
							)}

							{/* Next Button */}
							{imageAttachments.length > 1 && (
								<button
									onClick={nextImage}
									className="absolute right-4 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
									type="button"
								>
									<ChevronRight className="h-6 w-6" />
								</button>
							)}
						</div>
					</DialogContent>
				</Dialog>
			)}

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmationDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				onConfirm={handleDeleteConfirm}
				title="Delete Announcement"
				description="Are you sure you want to delete this announcement? This action cannot be undone."
				isDeleting={isPending}
			/>
		</>
	);
}
