"use client";

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { MoreHorizontal, Pin } from "lucide-react";
import type { StudentAnnouncement } from "../queries/getStudentAnnouncements";

interface PinnedSidebarProps {
	announcements: StudentAnnouncement[];
	studentId: string;
}

function PinnedItem({ announcement }: { announcement: StudentAnnouncement }) {
	const initials = announcement.author.name
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.slice(0, 2);

	return (
		<div className="space-y-2 rounded-lg border border-border/50 bg-muted/30 p-3">
			{/* Author */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Avatar className="h-6 w-6">
						<AvatarImage src={announcement.author.avatar} />
						<AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
					</Avatar>
					<span className="font-medium text-sm">
						{announcement.author.name}
					</span>
				</div>
				<Badge variant="outline" className="gap-1 text-[10px]">
					<Pin className="h-2.5 w-2.5 rotate-45" />
					Pinned
				</Badge>
			</div>

			{/* Category */}
			<Badge variant="secondary" className="text-xs">
				{announcement.scope === "school_wide"
					? "School-wide"
					: announcement.cohortName}
			</Badge>

			{/* Title */}
			<h4 className="font-medium text-sm">{announcement.title}</h4>

			{/* Preview */}
			<p className="line-clamp-2 text-muted-foreground text-xs">
				{announcement.content}
			</p>

			{/* View link */}
			<Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
				<Link href={`/announcements/${announcement.id}`}>View post →</Link>
			</Button>
		</div>
	);
}

export function PinnedSidebar({
	announcements,
	studentId,
}: PinnedSidebarProps) {
	const pinnedAnnouncements = announcements.filter((a) => a.isPinned);

	if (pinnedAnnouncements.length === 0) {
		return null;
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base">Pinned Announcements</CardTitle>
					<Button variant="ghost" size="icon" className="h-8 w-8">
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{pinnedAnnouncements.map((announcement) => (
					<PinnedItem key={announcement.id} announcement={announcement} />
				))}
			</CardContent>
		</Card>
	);
}
