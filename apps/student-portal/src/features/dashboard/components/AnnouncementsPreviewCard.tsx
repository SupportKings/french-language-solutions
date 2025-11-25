"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { mockAnnouncements } from "@/features/shared/data/mock-data";
import type { Announcement } from "@/features/shared/types";

import { formatDistanceToNow, parseISO } from "date-fns";
import { ArrowRight, Bell, Pin } from "lucide-react";

function AnnouncementItem({
	announcement,
	isUnread,
}: {
	announcement: Announcement;
	isUnread: boolean;
}) {
	const timeAgo = formatDistanceToNow(parseISO(announcement.createdAt), {
		addSuffix: true,
	});

	return (
		<Link
			href={`/announcements/${announcement.id}`}
			className="group -mx-3 block rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
		>
			<div className="flex items-start gap-2">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-1.5">
						<p
							className={`truncate text-sm ${isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}
						>
							{announcement.title}
						</p>
						{announcement.isPinned && (
							<Pin className="h-3 w-3 shrink-0 rotate-45 text-secondary" />
						)}
					</div>
					<p className="mt-0.5 text-muted-foreground text-xs">
						{announcement.author.name} · {timeAgo}
					</p>
				</div>
				{isUnread && (
					<div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />
				)}
			</div>
		</Link>
	);
}

export function AnnouncementsPreviewCard() {
	// Separate and sort announcements
	const unreadAnnouncements = [...mockAnnouncements]
		.filter((a) => !a.isRead)
		.sort((a, b) => {
			if (a.isPinned && !b.isPinned) return -1;
			if (!a.isPinned && b.isPinned) return 1;
			return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
		})
		.slice(0, 3);

	const readAnnouncements = [...mockAnnouncements]
		.filter((a) => a.isRead)
		.sort((a, b) => {
			if (a.isPinned && !b.isPinned) return -1;
			if (!a.isPinned && b.isPinned) return 1;
			return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
		})
		.slice(0, 3);

	const unreadCount = mockAnnouncements.filter((a) => !a.isRead).length;
	const hasAnnouncements =
		unreadAnnouncements.length > 0 || readAnnouncements.length > 0;

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<CardTitle className="text-base">Announcements</CardTitle>
						{unreadCount > 0 && (
							<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 font-bold text-[10px] text-secondary-foreground">
								{unreadCount}
							</span>
						)}
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 gap-1 text-muted-foreground text-xs hover:text-foreground"
						asChild
					>
						<Link href="/announcements">
							View all
							<ArrowRight className="h-3 w-3" />
						</Link>
					</Button>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				{!hasAnnouncements ? (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<Bell className="h-6 w-6 text-muted-foreground" />
						</div>
						<p className="mt-3 text-muted-foreground text-sm">
							No announcements yet
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{/* Unread Section */}
						{unreadAnnouncements.length > 0 && (
							<div>
								<p className="mb-1 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
									New
								</p>
								<div className="divide-y divide-border/50">
									{unreadAnnouncements.map((announcement) => (
										<AnnouncementItem
											key={announcement.id}
											announcement={announcement}
											isUnread
										/>
									))}
								</div>
							</div>
						)}

						{/* Read Section */}
						{readAnnouncements.length > 0 && (
							<div>
								<p className="mb-1 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
									Read
								</p>
								<div className="divide-y divide-border/50">
									{readAnnouncements.map((announcement) => (
										<AnnouncementItem
											key={announcement.id}
											announcement={announcement}
											isUnread={false}
										/>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
