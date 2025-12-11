"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useUnreadAnnouncements } from "@/features/announcements/queries";

import { formatDistanceToNow, parseISO } from "date-fns";
import { Bell, Pin } from "lucide-react";

interface AnnouncementsPopoverProps {
	studentId: string;
	unreadCount?: number;
}

export function AnnouncementsPopover({
	studentId,
	unreadCount,
}: AnnouncementsPopoverProps) {
	const { data: unreadAnnouncements = [] } = useUnreadAnnouncements(studentId);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount && unreadCount > 0 && (
						<span className="-top-0.5 -right-0.5 absolute flex h-4 w-4 items-center justify-center rounded-full bg-destructive font-bold text-[10px] text-destructive-foreground">
							{unreadCount}
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-0" align="end">
				<div className="flex items-center justify-between border-b px-4 py-3">
					<h4 className="font-semibold text-sm">Announcements</h4>
					{unreadCount && unreadCount > 0 && (
						<span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive font-bold text-[10px] text-destructive-foreground">
							{unreadCount}
						</span>
					)}
				</div>
				<ScrollArea className="h-[400px]">
					{unreadAnnouncements.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<Bell className="mb-2 h-8 w-8 text-muted-foreground" />
							<p className="text-muted-foreground text-sm">No unread announcements</p>
						</div>
					) : (
						<div className="divide-y">
							{unreadAnnouncements.map((announcement) => {
								const timeAgo = formatDistanceToNow(
									parseISO(announcement.createdAt),
									{
										addSuffix: true,
									},
								);

								return (
									<Link
										key={announcement.id}
										href={`/announcements/${announcement.id}`}
										className="block px-4 py-3 transition-colors hover:bg-muted/50"
									>
										<div className="flex items-start gap-2">
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-1.5">
													<p className="line-clamp-2 font-semibold text-sm leading-tight">
														{announcement.title}
													</p>
													{announcement.isPinned && (
														<Pin className="h-3 w-3 shrink-0 rotate-45 text-secondary" />
													)}
												</div>
												<p className="mt-1 text-muted-foreground text-xs">
													{announcement.author.name} · {timeAgo}
												</p>
											</div>
											<div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-secondary" />
										</div>
									</Link>
								);
							})}
						</div>
					)}
				</ScrollArea>
				{unreadAnnouncements.length > 0 && (
					<div className="border-t p-2">
						<Button
							variant="ghost"
							size="sm"
							className="w-full justify-center text-xs"
							asChild
						>
							<Link href="/announcements">View all announcements</Link>
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
