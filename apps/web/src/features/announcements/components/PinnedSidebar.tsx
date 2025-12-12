"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
	const router = useRouter();

	const initials = announcement.author
		? announcement.author.name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "A";

	const authorName = announcement.author ? announcement.author.name : "Unknown";

	const handleCohortClick = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent triggering the button click
		if (announcement.scope === "cohort" && announcement.cohort_id) {
			router.push(`/admin/cohorts/${announcement.cohort_id}`);
		}
	};

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
			className="group w-full space-y-2 rounded-lg border border-border/50 bg-card p-3 text-left transition-all duration-200 hover:border-primary/30 hover:bg-accent/5"
		>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Avatar className="h-6 w-6">
						<AvatarFallback className="bg-primary/10 font-semibold text-[10px] text-primary">
							{initials}
						</AvatarFallback>
					</Avatar>
					<span className="font-semibold text-foreground text-sm">
						{authorName}
					</span>
				</div>
				<Pin className="h-3 w-3 rotate-45 text-secondary" />
			</div>

			{/* Title */}
			<h4 className="line-clamp-2 font-semibold text-foreground text-sm leading-tight">
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
					"font-medium text-[10px]",
					announcement.scope === "school_wide"
						? "border-primary/20 bg-primary/10 text-primary"
						: "cursor-pointer border-accent/25 bg-accent/15 text-foreground transition-colors hover:bg-accent/30",
				)}
				onClick={
					announcement.scope === "cohort" ? handleCohortClick : undefined
				}
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
			<CardHeader className="px-4 pt-4 pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
						<Pin className="h-3.5 w-3.5 rotate-45 text-secondary" />
						Pinned
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="px-4 pb-4">
				{pinnedAnnouncements.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<Pin className="h-6 w-6 rotate-45 text-muted-foreground" />
						</div>
						<p className="mt-3 text-muted-foreground text-xs">
							No pinned announcements yet
						</p>
						<p className="mt-1 text-muted-foreground/60 text-xs">
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
