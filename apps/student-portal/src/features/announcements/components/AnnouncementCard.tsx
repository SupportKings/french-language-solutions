"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@uidotdev/usehooks";

import { RichTextEditor } from "@/components/rich-text-editor/RichTextEditor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";

import type { StudentAnnouncement } from "../queries/getStudentAnnouncements";
import { markAnnouncementAsRead } from "../actions/markAsRead";
import { announcementKeys } from "../queries";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
	ChevronLeft,
	ChevronRight,
	FileText,
	ImageIcon,
	MoreHorizontal,
	Pin,
	VideoIcon,
	X,
} from "lucide-react";

interface AnnouncementCardProps {
	announcement: StudentAnnouncement;
	studentId: string;
}

export function AnnouncementCard({
	announcement,
	studentId,
}: AnnouncementCardProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);

	// Intersection observer to detect when card enters viewport
	const [ref, entry] = useIntersectionObserver({
		threshold: 0.5, // Trigger when 50% of the card is visible
		root: null,
		rootMargin: "0px",
	});

	// Get all image attachments
	const imageAttachments =
		announcement.attachments?.filter((a) => a.type === "image") || [];
	const nonImageAttachments =
		announcement.attachments?.filter((a) => a.type !== "image") || [];

	const initials = announcement.author.name
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.slice(0, 2);

	const timeAgo = formatDistanceToNow(parseISO(announcement.createdAt), {
		addSuffix: false,
	});

	const formattedDate = format(
		parseISO(announcement.createdAt),
		"MMM d, h:mm a",
	);

	// Mark as read when card enters viewport
	useEffect(() => {
		if (
			entry?.isIntersecting &&
			!announcement.isRead &&
			!hasMarkedAsRead
		) {
			setHasMarkedAsRead(true);

			// Update cache optimistically
			queryClient.setQueryData<StudentAnnouncement[]>(
				announcementKeys.byStudent(studentId),
				(old) =>
					old?.map((a) =>
						a.id === announcement.id ? { ...a, isRead: true } : a,
					),
			);

			// Call server action
			markAnnouncementAsRead(announcement.id, studentId);
		}
	}, [
		entry?.isIntersecting,
		announcement.isRead,
		announcement.id,
		studentId,
		hasMarkedAsRead,
		queryClient,
	]);

	const handleViewFullPost = () => {
		// Just navigate - marking as read is handled by viewport detection
		router.push(`/announcements/${announcement.id}`);
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
		return <FileText className="h-4 w-4" />;
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
			<Card
				ref={ref as any}
				className={cn(
					"transition-all duration-200",
					!announcement.isRead && "border-l-4 border-l-secondary",
				)}
			>
				<CardContent className="pt-6">
					{/* Header */}
					<div className="flex items-start justify-between">
						<div className="flex items-start gap-3">
							<Avatar className="h-10 w-10">
								<AvatarImage src={announcement.author.avatar} />
								<AvatarFallback className="bg-primary/10 text-primary text-sm">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div>
								<div className="flex items-center gap-2">
									<span className="font-semibold text-foreground">
										{announcement.author.name}
									</span>
									{announcement.isPinned && (
										<Badge variant="outline" className="gap-1 text-xs">
											<Pin className="h-3 w-3 rotate-45" />
											Pinned
										</Badge>
									)}
								</div>
								<div className="flex items-center gap-2 text-muted-foreground text-sm">
									<span className="capitalize">{announcement.author.role}</span>
									<span>·</span>
									<span>{formattedDate}</span>
								</div>
							</div>
						</div>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</div>

					{/* Category Badge */}
					<div className="mt-3">
						<Badge variant="secondary">
							{announcement.scope === "school_wide"
								? "School-wide"
								: announcement.cohortName}
						</Badge>
					</div>

					{/* Title */}
					<h3 className="mt-3 font-semibold text-foreground text-lg">
						{announcement.title}
					</h3>

					{/* Content Preview */}
					<div className="mt-2 text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
						{parsedContent ? (
							<RichTextEditor
								content={parsedContent}
								onChange={() => {}}
								editable={false}
								className="border-0 bg-transparent p-0 [&_.ProseMirror]:p-0 [&_.ProseMirror]:min-h-0 line-clamp-3"
							/>
						) : (
							<div className="line-clamp-3 whitespace-pre-line">
								{announcement.content}
							</div>
						)}
					</div>

					{/* Image Attachments Grid */}
					{imageAttachments.length > 0 && (
						<div
							className={`mt-3 grid gap-2 ${
								imageAttachments.length === 1
									? "grid-cols-1"
									: imageAttachments.length === 2
										? "grid-cols-2"
										: imageAttachments.length === 3
											? "grid-cols-3"
											: "grid-cols-2"
							}`}
						>
							{imageAttachments.slice(0, 4).map((attachment, index) => (
								<button
									key={attachment.id}
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										openLightbox(index);
									}}
									className={`relative overflow-hidden rounded-lg border border-border/50 hover:border-primary/30 transition-all cursor-pointer group ${
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
										src={attachment.url}
										alt={attachment.name}
										className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
									/>
									{imageAttachments.length > 1 && (
										<div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
											{index + 1}/{imageAttachments.length}
										</div>
									)}
								</button>
							))}
						</div>
					)}

					{/* Non-Image Attachments */}
					{nonImageAttachments.length > 0 && (
						<div className="mt-3 space-y-2">
							{nonImageAttachments.map((attachment) => (
								<a
									key={attachment.id}
									href={attachment.url}
									target="_blank"
									rel="noopener noreferrer"
									onClick={(e) => e.stopPropagation()}
									className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2 transition-colors hover:bg-muted/50"
								>
									<div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
										{getFileIcon(attachment.type)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm">{attachment.name}</p>
									</div>
								</a>
							))}
						</div>
					)}

					{/* Footer */}
					<div className="mt-4 flex items-center justify-between border-t pt-4">
						<div className="text-muted-foreground text-sm">
							Posted {timeAgo} ago
						</div>
						<Button variant="outline" size="sm" onClick={handleViewFullPost}>
							View Full Post
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Image Lightbox */}
			{imageAttachments.length > 0 && (
				<Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
					<DialogContent className="max-w-5xl p-0 bg-black/95 border-0">
						<DialogTitle className="sr-only">
							Image {currentImageIndex + 1} of {imageAttachments.length}
						</DialogTitle>
						<div className="relative flex items-center justify-center min-h-[400px] max-h-[90vh]">
							{/* Close Button */}
							<button
								onClick={() => setLightboxOpen(false)}
								className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
								type="button"
							>
								<X className="h-5 w-5" />
							</button>

							{/* Image Counter */}
							{imageAttachments.length > 1 && (
								<div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm">
									{currentImageIndex + 1} / {imageAttachments.length}
								</div>
							)}

							{/* Previous Button */}
							{imageAttachments.length > 1 && (
								<button
									onClick={previousImage}
									className="absolute left-4 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
									type="button"
								>
									<ChevronLeft className="h-6 w-6" />
								</button>
							)}

							{/* Image */}
							{imageAttachments[currentImageIndex] && (
								<img
									src={imageAttachments[currentImageIndex].url}
									alt={imageAttachments[currentImageIndex].name}
									className="max-h-[90vh] w-auto object-contain"
								/>
							)}

							{/* Next Button */}
							{imageAttachments.length > 1 && (
								<button
									onClick={nextImage}
									className="absolute right-4 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
									type="button"
								>
									<ChevronRight className="h-6 w-6" />
								</button>
							)}
						</div>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
