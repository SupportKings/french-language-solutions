"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
	useLatestAnnouncements,
	useUnreadAnnouncements,
} from "@/features/announcements/queries";
import type { StudentAnnouncement } from "@/features/announcements/queries/getStudentAnnouncements";

import { formatDistanceToNow, parseISO } from "date-fns";
import { ArrowRight, Bell, Pin } from "lucide-react";

interface AnnouncementsPreviewCardProps {
	studentId: string;
}

function AnnouncementItem({
	announcement,
	isUnread,
	studentId,
}: {
	announcement: StudentAnnouncement;
	isUnread: boolean;
	studentId: string;
}) {
	const timeAgo = formatDistanceToNow(parseISO(announcement.createdAt), {
		addSuffix: true,
	});

	return (
		<Link
			href={`/announcements/${announcement.id}`}
			className={`group -mx-3 block rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50 ${isUnread ? "bg-primary/5" : ""}`}
		>
			<div className="flex items-start gap-2">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-1.5">
						<p
							className={`truncate text-sm ${isUnread ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}
						>
							{announcement.title}
						</p>
						{announcement.isPinned && (
							<Pin className="h-3 w-3 shrink-0 rotate-45 text-secondary" />
						)}
					</div>
					<p className={`mt-0.5 text-xs ${isUnread ? "font-medium text-foreground/70" : "text-muted-foreground"}`}>
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

export function AnnouncementsPreviewCard({
	studentId,
}: AnnouncementsPreviewCardProps) {
	const { data: latestAnnouncements = [], isLoading } =
		useLatestAnnouncements(studentId, 5);
	const { data: unreadAnnouncements = [] } = useUnreadAnnouncements(studentId);

	const unreadCount = unreadAnnouncements.length;
	const hasAnnouncements = latestAnnouncements.length > 0;

	if (isLoading) {
		return (
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Latest Announcements</CardTitle>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<p className="text-muted-foreground text-sm">Loading...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<CardTitle className="text-base">Latest Announcements</CardTitle>
						{unreadCount > 0 && (
							<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 font-bold text-[10px] text-secondary-foreground">
								{unreadCount}
							</span>
						)}
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 gap-1 rounded-md px-2 text-muted-foreground text-xs transition-colors hover:bg-muted/50 hover:text-foreground"
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
					<div className="divide-y divide-border/50">
						{latestAnnouncements.map((announcement) => (
							<AnnouncementItem
								key={announcement.id}
								announcement={announcement}
								isUnread={!announcement.isRead}
								studentId={studentId}
							/>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
