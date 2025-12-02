"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { ChevronLeft, ChevronRight, Download, FileIcon, X } from "lucide-react";
import type { MessageAttachment } from "../types";

/**
 * Generic attachment display component
 * Fully reusable - works with any message that has attachments
 * No message-type-specific logic
 */

interface MessageAttachmentsProps {
	attachments: MessageAttachment[];
	className?: string;
}

export function MessageAttachments({
	attachments,
	className,
}: MessageAttachmentsProps) {
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	const images = attachments.filter((a) => a.fileType === "image");
	const documents = attachments.filter((a) => a.fileType === "document");

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
		setCurrentImageIndex((prev) => (prev + 1) % images.length);
	};

	const previousImage = () => {
		setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
	};

	return (
		<div className={cn("mt-2 space-y-2", className)}>
			{/* Image Grid */}
			{images.length > 0 && (
				<div
					className={cn(
						"grid gap-1 overflow-hidden rounded-lg",
						images.length === 1 && "grid-cols-1",
						images.length === 2 && "grid-cols-2",
						images.length >= 3 && "grid-cols-2",
					)}
				>
					{images.map((img, index) => (
						<button
							key={img.id}
							type="button"
							onClick={() => openLightbox(index)}
							className={cn(
								"group relative cursor-pointer overflow-hidden rounded",
								images.length === 1 ? "aspect-video max-w-sm" : "aspect-square",
								images.length === 3 && index === 0 && "col-span-2 aspect-video",
							)}
						>
							<img
								src={img.fileUrl}
								alt={img.fileName}
								className="h-full w-full object-cover transition-transform group-hover:scale-105"
							/>
							{images.length > 1 && (
								<div className="absolute right-1 bottom-1 rounded bg-black/60 px-2 py-0.5 text-white text-xs">
									{index + 1}/{images.length}
								</div>
							)}
						</button>
					))}
				</div>
			)}

			{/* Document List */}
			{documents.length > 0 && (
				<div className="space-y-1">
					{documents.map((doc) => (
						<Card key={doc.id} className="overflow-hidden">
							<CardContent className="flex items-center justify-between p-2">
								<div className="flex min-w-0 items-center gap-2">
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
										<FileIcon className="h-4 w-4 text-muted-foreground" />
									</div>
									<div className="min-w-0">
										<p className="truncate font-medium text-xs">
											{doc.fileName}
										</p>
										<p className="text-muted-foreground text-xs">
											{formatFileSize(doc.fileSize)}
										</p>
									</div>
								</div>
								<Button size="sm" variant="ghost" asChild className="shrink-0">
									<a
										href={doc.fileUrl}
										target="_blank"
										rel="noopener noreferrer"
										download
									>
										<Download className="h-3 w-3" />
									</a>
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Image Lightbox */}
			{images.length > 0 && (
				<Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
					<DialogContent className="max-w-5xl border-0 bg-black/95 p-0">
						<DialogTitle className="sr-only">
							Image {currentImageIndex + 1} of {images.length}
						</DialogTitle>
						<div className="relative flex max-h-[90vh] min-h-[400px] items-center justify-center">
							<button
								onClick={() => setLightboxOpen(false)}
								className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
								type="button"
							>
								<X className="h-5 w-5" />
							</button>

							{images.length > 1 && (
								<>
									<div className="absolute top-4 left-4 z-10 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white">
										{currentImageIndex + 1} / {images.length}
									</div>
									<button
										onClick={previousImage}
										className="absolute left-4 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
										type="button"
									>
										<ChevronLeft className="h-6 w-6" />
									</button>
									<button
										onClick={nextImage}
										className="absolute right-4 rounded-full bg-black/50 p-3 text-white hover:bg-black/70"
										type="button"
									>
										<ChevronRight className="h-6 w-6" />
									</button>
								</>
							)}

							{images[currentImageIndex] && (
								<img
									src={images[currentImageIndex].fileUrl}
									alt={images[currentImageIndex].fileName}
									className="max-h-[90vh] w-auto object-contain"
								/>
							)}
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
