"use client";

import { format, isToday, isTomorrow, parseISO, isPast } from "date-fns";
import {
	Calendar,
	ChevronDown,
	ChevronUp,
	Clock,
	MapPin,
	Video,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { mockClasses } from "@/features/shared/data/mock-data";
import type { ClassSession } from "@/features/shared/types";

function getDateLabel(dateString: string): string {
	const date = parseISO(dateString);
	if (isToday(date)) return `Today · ${format(date, "MMMM d, yyyy")}`;
	if (isTomorrow(date)) return `Tomorrow · ${format(date, "MMMM d, yyyy")}`;
	return format(date, "EEEE · MMMM d, yyyy");
}

function groupClassesByDate(
	classes: ClassSession[]
): Map<string, ClassSession[]> {
	const grouped = new Map<string, ClassSession[]>();

	const sortedClasses = [...classes].sort(
		(a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
	);

	for (const classItem of sortedClasses) {
		const label = getDateLabel(classItem.startTime);
		const existing = grouped.get(label) || [];
		grouped.set(label, [...existing, classItem]);
	}

	return grouped;
}

interface ClassCardProps {
	classItem: ClassSession;
}

function ClassCard({ classItem }: ClassCardProps) {
	const [expanded, setExpanded] = useState(false);
	const startTime = parseISO(classItem.startTime);
	const endTime = parseISO(classItem.endTime);
	const initials = classItem.teacher.name
		.split(" ")
		.map((n: string) => n[0])
		.join("");

	const isCompleted = classItem.status === "completed";
	const isLive = classItem.status === "in_progress";

	return (
		<div
			className={cn(
				"rounded-xl border bg-card transition-all duration-200",
				isCompleted && "opacity-60",
				!isCompleted && "hover:shadow-md"
			)}
		>
			<div className="p-4">
				<div className="flex items-start gap-4">
					{/* Time Block */}
					<div className="flex shrink-0 flex-col items-center rounded-lg bg-muted/50 px-3 py-2 text-center">
						<span className="font-semibold text-foreground text-sm">
							{format(startTime, "h:mm")}
						</span>
						<span className="text-muted-foreground text-xs">
							{format(startTime, "a")}
						</span>
						<div className="my-1 h-4 w-px bg-border" />
						<span className="font-semibold text-foreground text-sm">
							{format(endTime, "h:mm")}
						</span>
						<span className="text-muted-foreground text-xs">
							{format(endTime, "a")}
						</span>
					</div>

					{/* Main Content */}
					<div className="min-w-0 flex-1">
						<div className="flex items-start justify-between gap-3">
							<div>
								<h3 className="font-semibold text-foreground">
									{classItem.cohortName}
								</h3>
								<p className="text-muted-foreground text-sm">
									{classItem.courseName}
								</p>
							</div>
							{isLive && (
								<Badge variant="success" className="shrink-0">
									Live Now
								</Badge>
							)}
							{isCompleted && (
								<Badge variant="secondary" className="shrink-0">
									Completed
								</Badge>
							)}
						</div>

						{/* Teacher */}
						<div className="mt-3 flex items-center gap-2">
							<Avatar className="h-6 w-6">
								<AvatarImage src={classItem.teacher.avatar} />
								<AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
							</Avatar>
							<span className="text-muted-foreground text-sm">
								{classItem.teacher.name}
							</span>
						</div>

						{/* Expanded Content */}
						{expanded && (
							<div className="mt-4 space-y-3 border-t pt-4">
								{classItem.meetingLink && (
									<div className="flex items-center gap-2 text-sm">
										<Video className="h-4 w-4 text-muted-foreground" />
										<a
											href={classItem.meetingLink}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											{classItem.meetingLink}
										</a>
									</div>
								)}
								{classItem.location && (
									<div className="flex items-center gap-2 text-sm">
										<MapPin className="h-4 w-4 text-muted-foreground" />
										<span className="capitalize text-muted-foreground">
											{classItem.location.replace("_", " ")}
										</span>
									</div>
								)}
								{classItem.notes && (
									<p className="text-muted-foreground text-sm">
										{classItem.notes}
									</p>
								)}
							</div>
						)}
					</div>

					{/* Actions */}
					<div className="flex shrink-0 items-center gap-2">
						{classItem.meetingLink && !isCompleted && (
							<Button size="sm" asChild>
								<a
									href={classItem.meetingLink}
									target="_blank"
									rel="noopener noreferrer"
								>
									Join Meeting
								</a>
							</Button>
						)}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setExpanded(!expanded)}
							className="gap-1"
						>
							{expanded ? (
								<>
									Show less
									<ChevronUp className="h-4 w-4" />
								</>
							) : (
								<>
									Show more
									<ChevronDown className="h-4 w-4" />
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

interface ScheduleListViewProps {
	filter: "upcoming" | "past";
}

export function ScheduleListView({ filter }: ScheduleListViewProps) {
	const filteredClasses = mockClasses.filter((c) => {
		const classDate = parseISO(c.startTime);
		if (filter === "upcoming") {
			return !isPast(classDate) || c.status === "in_progress";
		}
		return isPast(classDate) && c.status !== "in_progress";
	});

	const groupedClasses = groupClassesByDate(filteredClasses);

	if (filteredClasses.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
					<Calendar className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="mt-4 font-semibold text-lg">
					No {filter} classes
				</h3>
				<p className="mt-1 text-muted-foreground text-sm">
					{filter === "upcoming"
						? "Your upcoming classes will appear here"
						: "Your past classes will appear here"}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{Array.from(groupedClasses.entries()).map(([dateLabel, classes]) => (
				<div key={dateLabel}>
					<h2 className="mb-4 font-semibold text-foreground">{dateLabel}</h2>
					<div className="space-y-3">
						{classes.map((classItem) => (
							<ClassCard key={classItem.id} classItem={classItem} />
						))}
					</div>
				</div>
			))}
		</div>
	);
}
