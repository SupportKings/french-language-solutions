"use client";

import { format, isToday, isTomorrow, parseISO, isPast } from "date-fns";
import {
	Calendar,
	ChevronDown,
	ChevronUp,
	Clock,
	ExternalLink,
	MapPin,
	Video,
	X,
	RefreshCw,
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
	if (isToday(date)) return "Today";
	if (isTomorrow(date)) return "Tomorrow";
	return format(date, "EEEE");
}

function getDateSuffix(dateString: string): string {
	const date = parseISO(dateString);
	return format(date, "MMMM d, yyyy");
}

function groupClassesByDate(
	classes: ClassSession[]
): Map<string, ClassSession[]> {
	const grouped = new Map<string, ClassSession[]>();

	const sortedClasses = [...classes].sort(
		(a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
	);

	for (const classItem of sortedClasses) {
		const dateKey = format(parseISO(classItem.startTime), "yyyy-MM-dd");
		const existing = grouped.get(dateKey) || [];
		grouped.set(dateKey, [...existing, classItem]);
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
				"rounded-2xl border bg-card transition-all duration-200 hover:shadow-md",
				isCompleted && "opacity-60 border-border bg-muted/30",
				isLive && "border-primary/40 bg-gradient-to-r from-primary/5 to-transparent shadow-lg shadow-primary/10 ring-1 ring-primary/20",
				!isCompleted && !isLive && "border-border/60 hover:border-primary/30"
			)}
		>
			<div className="p-5">
				<div className="flex items-start gap-5">
					{/* Time Block - EduMate inspired */}
					<div className="flex shrink-0 gap-3">
						<div className="text-center">
							<p className="text-xs font-medium text-muted-foreground mb-0.5">From</p>
							<p className="text-lg font-bold text-foreground">
								{format(startTime, "hh:mm")}
							</p>
							<p className="text-xs font-medium text-muted-foreground">
								{format(startTime, "a").toUpperCase()}
							</p>
						</div>
						<div className="text-center">
							<p className="text-xs font-medium text-muted-foreground mb-0.5">To</p>
							<p className="text-lg font-bold text-foreground">
								{format(endTime, "hh:mm")}
							</p>
							<p className="text-xs font-medium text-muted-foreground">
								{format(endTime, "a").toUpperCase()}
							</p>
						</div>
					</div>

					{/* Vertical divider */}
					<div className="h-16 w-px bg-border self-center" />

					{/* Course Info */}
					<div className="min-w-0 flex-1">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-xs font-medium text-muted-foreground mb-1">Course</p>
								<h3 className="font-bold text-foreground text-lg leading-tight">
									{classItem.courseName}
								</h3>
							</div>
						</div>
					</div>

					{/* Teacher - EduMate style */}
					<div className="shrink-0 text-right">
						<p className="text-xs font-medium text-muted-foreground mb-1.5">Teacher</p>
						<div className="flex items-center gap-2 justify-end">
							<span className="font-semibold text-foreground text-sm">
								{classItem.teacher.name}
							</span>
							<Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
								<AvatarImage src={classItem.teacher.avatar} />
								<AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
									{initials}
								</AvatarFallback>
							</Avatar>
						</div>
					</div>

					{/* Toggle */}
					<Button
						variant="link"
						size="sm"
						onClick={() => setExpanded(!expanded)}
						className="shrink-0 text-primary font-medium h-auto p-0"
					>
						{expanded ? "Show less" : "Show more"}
					</Button>
				</div>

				{/* Expanded Content */}
				{expanded && (
					<div className="mt-5 pt-5 border-t border-border/60">
						<div className="grid grid-cols-2 gap-4 mb-4">
							{/* Cohort */}
							<div>
								<p className="text-xs font-medium text-muted-foreground mb-1">Cohort</p>
								<p className="font-medium text-foreground">{classItem.cohortName}</p>
							</div>

							{/* Meeting Link */}
							{classItem.meetingLink && (
								<div>
									<p className="text-xs font-medium text-muted-foreground mb-1">Link</p>
									<a
										href={classItem.meetingLink}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
									>
										{classItem.meetingLink}
									</a>
								</div>
							)}
						</div>

						{/* Action Buttons - EduMate style */}
						<div className="flex items-center gap-3 justify-end">
							<Button
								variant="outline"
								size="sm"
								className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive rounded-full px-4"
							>
								Cancel
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="text-primary border-primary/30 hover:bg-primary/10 rounded-full px-4"
							>
								Reschedule
							</Button>
							{classItem.meetingLink && !isCompleted && (
								<Button
									size="sm"
									className="bg-primary hover:bg-primary/90 rounded-full px-5 shadow-md"
									asChild
								>
									<a
										href={classItem.meetingLink}
										target="_blank"
										rel="noopener noreferrer"
									>
										Join meeting
									</a>
								</Button>
							)}
						</div>
					</div>
				)}
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
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-primary/10 shadow-sm">
					<Calendar className="h-10 w-10 text-primary" />
				</div>
				<h3 className="mt-5 font-bold text-xl text-foreground">
					No {filter} classes
				</h3>
				<p className="mt-2 text-muted-foreground max-w-xs">
					{filter === "upcoming"
						? "Your upcoming classes will appear here when scheduled"
						: "Your completed classes will be shown here"}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{Array.from(groupedClasses.entries()).map(([dateKey, classes]) => {
				const firstClass = classes[0];
				const dateLabel = getDateLabel(firstClass.startTime);
				const dateSuffix = getDateSuffix(firstClass.startTime);

				return (
					<div key={dateKey}>
						<div className="flex items-baseline gap-2 mb-4">
							<h2 className="font-bold text-foreground text-lg">{dateLabel}</h2>
							<span className="text-muted-foreground">{dateSuffix}</span>
						</div>
						<div className="space-y-4">
							{classes.map((classItem) => (
								<ClassCard key={classItem.id} classItem={classItem} />
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
