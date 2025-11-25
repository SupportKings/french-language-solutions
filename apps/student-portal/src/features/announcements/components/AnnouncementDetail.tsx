"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

import { markAnnouncementAsRead } from "../actions/markAsRead";

import { format, parseISO } from "date-fns";
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	Download,
	FileText,
	Image as ImageIcon,
	Pin,
	Video,
	X,
} from "lucide-react";

interface AnnouncementDetailProps {
	announcement: any;
	studentId: string;
	isRead: boolean;
}

export function AnnouncementDetail({
	announcement,
	studentId,
	isRead,
}: AnnouncementDetailProps) {
	const router = useRouter();
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);

	// Intersection observer to detect when content enters viewport
	const [ref, entry] = useIntersectionObserver({
		threshold: 0.3, // Trigger when 30% of content is visible
		root: null,
		rootMargin: "0px",
	});

	useEffect(() => {
		// Mark as read when content enters viewport
		if (entry?.isIntersecting && !isRead && !hasMarkedAsRead) {
			setHasMarkedAsRead(true);
			markAnnouncementAsRead(announcement.id, studentId);
		}
	}, [entry?.isIntersecting, isRead, hasMarkedAsRead, announcement.id, studentId]);

	const authorName =
		announcement.author?.name ||
		`${announcement.author?.first_name || ""} ${announcement.author?.last_name || ""}`.trim() ||
		"Unknown";
	const initials = authorName
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.slice(0, 2);

	const formattedDate = format(
		parseISO(announcement.created_at),
		"MMMM d, yyyy 'at' h:mm a",
	);

	// Get all image attachments
	const imageAttachments =
		announcement.attachments?.filter((a: any) =>
			a.file_type.startsWith("image"),
		) || [];
	const nonImageAttachments =
		announcement.attachments?.filter(
			(a: any) => !a.file_type.startsWith("image"),
		) || [];

	const getFileIcon = (fileType: string) => {
		if (fileType.startsWith("image")) return ImageIcon;
		if (fileType.startsWith("video")) return Video;
		return FileText;
	};

	const formatFileSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

	// Parse content from JSON string
	let parsedContent;
	try {
		parsedContent = JSON.parse(announcement.content);
	} catch {
		parsedContent = null;
	}

	return (
		<>
			<div className="mx-auto max-w-4xl space-y-6">
				{/* Back Button */}
				<Button
					variant="ghost"
					className="gap-2"
					onClick={() => router.push("/announcements")}
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Announcements
				</Button>

				{/* Main Content Card */}
				<Card ref={ref as any}>
					<CardContent className="pt-8">
						{/* Header */}
						<div className="flex items-start justify-between">
							<div className="flex items-start gap-4">
								<Avatar className="h-12 w-12">
									<AvatarImage src={announcement.author?.image} />
									<AvatarFallback className="bg-primary/10 text-primary">
										{initials}
									</AvatarFallback>
								</Avatar>
								<div>
									<div className="flex items-center gap-2">
										<span className="font-semibold text-foreground text-lg">
											{authorName}
										</span>
										{announcement.is_pinned && (
											<Badge variant="outline" className="gap-1 text-xs">
												<Pin className="h-3 w-3 rotate-45" />
												Pinned
											</Badge>
										)}
									</div>
									<div className="mt-1 text-muted-foreground text-sm">
										{formattedDate}
									</div>
								</div>
							</div>
						</div>

						{/* Scope Badge */}
						<div className="mt-6">
							<Badge variant="secondary" className="text-sm">
								{announcement.scope === "school_wide"
									? "School-wide Announcement"
									: `Class Update: ${announcement.cohort?.nickname || "Unknown Class"}`}
							</Badge>
						</div>

						{/* Title */}
						<h1 className="mt-6 font-bold text-2xl text-foreground md:text-3xl">
							{announcement.title}
						</h1>

						{/* Content */}
						<div className="prose prose-blue mt-6 max-w-none text-foreground leading-relaxed">
							{parsedContent ? (
								<RichTextEditor
									content={parsedContent}
									onChange={() => {}}
									editable={false}
									className="border-0 bg-transparent p-0 [&_.ProseMirror]:p-0 [&_.ProseMirror]:min-h-0"
								/>
							) : (
								<div className="whitespace-pre-line">{announcement.content}</div>
							)}
						</div>

						{/* Image Attachments Grid */}
						{imageAttachments.length > 0 && (
							<div className="mt-8 space-y-4">
								<h3 className="font-semibold text-foreground text-lg">
									Images ({imageAttachments.length})
								</h3>
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
									{imageAttachments.map((attachment: any, index: number) => (
										<button
											key={attachment.id}
											type="button"
											onClick={() => openLightbox(index)}
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
												src={attachment.file_url}
												alt={attachment.file_name}
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
							</div>
						)}

						{/* Non-Image Attachments */}
						{nonImageAttachments.length > 0 && (
							<div className="mt-8 space-y-4">
								<h3 className="font-semibold text-foreground text-lg">
									Attachments ({nonImageAttachments.length})
								</h3>
								<div className="space-y-2">
									{nonImageAttachments.map((attachment: any) => {
										const FileIcon = getFileIcon(attachment.file_type);
										return (
											<Card key={attachment.id}>
												<CardContent className="flex items-center justify-between p-4">
													<div className="flex items-center gap-3">
														<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
															<FileIcon className="h-5 w-5 text-muted-foreground" />
														</div>
														<div>
															<p className="font-medium text-sm">
																{attachment.file_name}
															</p>
															<p className="text-muted-foreground text-xs">
																{formatFileSize(attachment.file_size)}
															</p>
														</div>
													</div>
													<Button
														size="sm"
														variant="outline"
														asChild
														className="gap-2"
													>
														<a
															href={attachment.file_url}
															target="_blank"
															rel="noopener noreferrer"
															download
														>
															<Download className="h-4 w-4" />
															Download
														</a>
													</Button>
												</CardContent>
											</Card>
										);
									})}
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Additional Info Card */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between text-muted-foreground text-sm">
							<div>
								Posted on{" "}
								{format(parseISO(announcement.created_at), "MMMM d, yyyy")}
							</div>
							{announcement.updated_at !== announcement.created_at && (
								<div>
									Last updated{" "}
									{format(parseISO(announcement.updated_at), "MMM d, yyyy")}
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

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
									src={imageAttachments[currentImageIndex].file_url}
									alt={imageAttachments[currentImageIndex].file_name}
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
