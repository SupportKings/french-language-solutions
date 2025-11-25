"use client";

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { mockClasses } from "@/features/shared/data/mock-data";
import type { ClassSession } from "@/features/shared/types";

import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { ArrowRight, Calendar, Clock, ExternalLink, Video } from "lucide-react";

// Format class label as "Group - A2" or "Private - B1"
function formatClassLabel(classItem: ClassSession): string {
	const formatLabel =
		classItem.format === "group"
			? "Group"
			: classItem.format === "private"
				? "Private"
				: "Hybrid";
	return `${formatLabel} - ${classItem.level}`;
}

function getDateLabel(dateString: string): string {
	const date = parseISO(dateString);
	if (isToday(date)) return "Today";
	if (isTomorrow(date)) return "Tomorrow";
	return format(date, "EEEE, MMM d");
}

function groupClassesByDate(
	classes: ClassSession[],
): Map<string, ClassSession[]> {
	const grouped = new Map<string, ClassSession[]>();

	for (const classItem of classes) {
		const label = getDateLabel(classItem.startTime);
		const existing = grouped.get(label) || [];
		grouped.set(label, [...existing, classItem]);
	}

	return grouped;
}

function ClassItemRow({ classItem }: { classItem: ClassSession }) {
	const startTime = parseISO(classItem.startTime);
	const endTime = parseISO(classItem.endTime);
	const initials = classItem.teacher.name
		.split(" ")
		.map((n: string) => n[0])
		.join("");

	return (
		<div className="group flex items-center gap-4 rounded-lg border border-border/50 bg-muted/30 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-accent/50">
			{/* Time */}
			<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
				<Clock className="h-4 w-4 text-primary" />
			</div>

			{/* Info */}
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<p className="truncate font-medium text-sm">
						{formatClassLabel(classItem)}
					</p>
					{classItem.status === "in_progress" && (
						<Badge variant="success" className="shrink-0 text-[10px]">
							Live
						</Badge>
					)}
				</div>
				<p className="text-muted-foreground text-xs">
					{format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
				</p>
			</div>

			{/* Teacher */}
			<div className="hidden items-center gap-2 sm:flex">
				<Avatar className="h-6 w-6">
					<AvatarImage src={classItem.teacher.avatar} />
					<AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
				</Avatar>
				<span className="text-muted-foreground text-xs">
					{classItem.teacher.name}
				</span>
			</div>

			{/* Join button */}
			{classItem.meetingLink && (
				<Button
					variant="outline"
					size="sm"
					className="shrink-0 gap-1.5"
					asChild
				>
					<a
						href={classItem.meetingLink}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Video className="h-3.5 w-3.5" />
						<span className="hidden sm:inline">Join</span>
					</a>
				</Button>
			)}
		</div>
	);
}

export function UpcomingClassesCard() {
	const upcomingClasses = mockClasses
		.filter((c) => c.status !== "completed" && c.status !== "cancelled")
		.slice(0, 4);

	const groupedClasses = groupClassesByDate(upcomingClasses);

	return (
		<Card>
			<CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
						<Calendar className="h-4 w-4 text-primary" />
					</div>
					<CardTitle className="text-base">Upcoming Classes</CardTitle>
				</div>
				<Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
					<Link href="/schedule">
						View all
						<ArrowRight className="h-3 w-3" />
					</Link>
				</Button>
			</CardHeader>
			<CardContent className="space-y-4">
				{upcomingClasses.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-6 text-center">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
							<Calendar className="h-5 w-5 text-muted-foreground" />
						</div>
						<p className="mt-3 text-muted-foreground text-sm">
							No upcoming classes
						</p>
					</div>
				) : (
					Array.from(groupedClasses.entries()).map(([dateLabel, classes]) => (
						<div key={dateLabel} className="space-y-2">
							<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
								{dateLabel}
							</p>
							<div className="space-y-2">
								{classes.map((classItem) => (
									<ClassItemRow key={classItem.id} classItem={classItem} />
								))}
							</div>
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
