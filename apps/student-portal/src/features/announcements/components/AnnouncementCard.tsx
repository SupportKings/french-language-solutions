"use client";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { Announcement } from "@/features/shared/types";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import { MessageCircle, MoreHorizontal, Pin, Share2 } from "lucide-react";

interface AnnouncementCardProps {
	announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
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

	return (
		<Card
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

				{/* Content */}
				<div className="mt-2 whitespace-pre-line text-muted-foreground leading-relaxed">
					{announcement.content}
				</div>

				{/* Footer */}
				<div className="mt-4 flex items-center justify-between border-t pt-4">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="sm"
							className="gap-2 text-muted-foreground"
						>
							<MessageCircle className="h-4 w-4" />
							Comment
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="gap-2 text-muted-foreground"
						>
							<Share2 className="h-4 w-4" />
							Share
						</Button>
					</div>
					<Button variant="outline" size="sm">
						View Full Post
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
