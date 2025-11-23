"use client";

import Link from "next/link";

import { formatDistanceToNow, parseISO } from "date-fns";
import { ArrowRight, Bell, Megaphone, Pin } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { mockAnnouncements } from "@/features/shared/data/mock-data";
import type { Announcement } from "@/features/shared/types";

function AnnouncementRow({ announcement }: { announcement: Announcement }) {
	const initials = announcement.author.name
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.slice(0, 2);

	const timeAgo = formatDistanceToNow(parseISO(announcement.createdAt), {
		addSuffix: true,
	});

	return (
		<div
			className={`group flex gap-3 rounded-lg border p-3 transition-all duration-200 hover:border-primary/30 hover:bg-accent/50 ${
				!announcement.isRead
					? "border-l-2 border-l-secondary bg-secondary/5"
					: "border-border/50 bg-muted/30"
			}`}
		>
			{/* Avatar */}
			<Avatar className="h-8 w-8 shrink-0">
				<AvatarImage src={announcement.author.avatar} />
				<AvatarFallback className="bg-primary/10 text-primary text-[10px]">
					{initials}
				</AvatarFallback>
			</Avatar>

			{/* Content */}
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<p className="truncate font-medium text-sm">{announcement.title}</p>
					{announcement.isPinned && (
						<Pin className="h-3 w-3 shrink-0 rotate-45 text-secondary" />
					)}
				</div>
				<div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
					<span>{announcement.author.name}</span>
					<span>·</span>
					<span>{timeAgo}</span>
				</div>
			</div>

			{/* Unread dot */}
			{!announcement.isRead && (
				<div className="flex h-2 w-2 shrink-0 self-center rounded-full bg-secondary" />
			)}
		</div>
	);
}

export function AnnouncementsPreviewCard() {
	const unreadCount = mockAnnouncements.filter((a) => !a.isRead).length;
	const sortedAnnouncements = [...mockAnnouncements]
		.sort((a, b) => {
			if (a.isPinned && !b.isPinned) return -1;
			if (!a.isPinned && b.isPinned) return 1;
			return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
		})
		.slice(0, 3);

	return (
		<Card>
			<CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
				<div className="flex items-center gap-3">
					<div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10">
						<Megaphone className="h-4 w-4 text-secondary" />
						{unreadCount > 0 && (
							<span className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] text-secondary-foreground font-bold">
								{unreadCount}
							</span>
						)}
					</div>
					<CardTitle className="text-base">Announcements</CardTitle>
				</div>
				<Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
					<Link href="/announcements">
						View all
						<ArrowRight className="h-3 w-3" />
					</Link>
				</Button>
			</CardHeader>
			<CardContent className="space-y-2">
				{mockAnnouncements.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-6 text-center">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
							<Bell className="h-5 w-5 text-muted-foreground" />
						</div>
						<p className="mt-3 text-muted-foreground text-sm">
							No announcements
						</p>
					</div>
				) : (
					sortedAnnouncements.map((announcement) => (
						<AnnouncementRow key={announcement.id} announcement={announcement} />
					))
				)}
			</CardContent>
		</Card>
	);
}
