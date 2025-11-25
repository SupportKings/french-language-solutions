"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { Pin } from "lucide-react";
import type { AnnouncementWithDetails } from "../queries";

interface PinnedSidebarProps {
	announcements: AnnouncementWithDetails[];
}

function PinnedItem({
	announcement,
}: {
	announcement: AnnouncementWithDetails;
}) {
	const initials = announcement.author
		? announcement.author.name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "A";

	const authorName = announcement.author ? announcement.author.name : "Unknown";

	// Extract text preview from JSON content if possible
	let contentPreview = announcement.content;
	try {
		const parsed = JSON.parse(announcement.content);
		// Try to extract text from Tiptap JSON structure
		if (parsed.content && Array.isArray(parsed.content)) {
			const textNodes = parsed.content
				.filter((node: any) => node.type === "paragraph" && node.content)
				.flatMap((node: any) => node.content)
				.filter((node: any) => node.type === "text")
				.map((node: any) => node.text);
			contentPreview = textNodes.join(" ");
		}
	} catch {
		// If parsing fails, use the content as is
	}

	return (
		<button
			type="button"
			className="w-full text-left space-y-2 rounded-lg border border-border/50 bg-card p-3 hover:bg-accent/5 hover:border-primary/30 transition-all duration-200 group"
		>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Avatar className="h-6 w-6">
						<AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
							{initials}
						</AvatarFallback>
					</Avatar>
					<span className="font-semibold text-sm text-foreground">{authorName}</span>
				</div>
				<Pin className="h-3 w-3 text-secondary rotate-45" />
			</div>

			{/* Title */}
			<h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
				{announcement.title}
			</h4>

			{/* Preview */}
			<p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
				{contentPreview}
			</p>

			{/* Category */}
			<Badge
				variant="secondary"
				className={cn(
					"text-[10px] font-medium",
					announcement.scope === "school_wide"
						? "bg-primary/10 text-primary border-primary/20"
						: "bg-accent/15 text-foreground border-accent/25"
				)}
			>
				{announcement.scope === "school_wide"
					? "School-wide"
					: announcement.cohort?.nickname || "Cohort"}
			</Badge>
		</button>
	);
}

export function PinnedSidebar({ announcements }: PinnedSidebarProps) {
	const pinnedAnnouncements = announcements.filter((a) => a.is_pinned);

	return (
		<Card className="overflow-hidden">
			<CardHeader className="pb-2 px-4 pt-4">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
						<Pin className="h-3.5 w-3.5 text-secondary rotate-45" />
						Pinned
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="px-4 pb-4">
				{pinnedAnnouncements.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<Pin className="h-6 w-6 text-muted-foreground rotate-45" />
						</div>
						<p className="mt-3 text-xs text-muted-foreground">
							No pinned announcements yet
						</p>
						<p className="mt-1 text-xs text-muted-foreground/60">
							Pin important announcements to show them here
						</p>
					</div>
				) : (
					<div className="space-y-2">
						{pinnedAnnouncements.map((announcement) => (
							<PinnedItem key={announcement.id} announcement={announcement} />
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
