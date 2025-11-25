"use client";

import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import type { ClassSession } from "@/features/shared/types";

import { format, isPast, isToday, isTomorrow, parseISO } from "date-fns";
import {
	AlertCircle,
	Calendar,
	Check,
	CheckCircle2,
	ChevronDown,
	MapPin,
	XCircle,
} from "lucide-react";
import {
	markHomeworkComplete,
	unmarkHomeworkComplete,
} from "../actions/markHomeworkComplete";

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
	return format(date, "EEEE");
}

function getDateSuffix(dateString: string): string {
	const date = parseISO(dateString);
	return format(date, "MMMM d, yyyy");
}

function groupClassesByDate(
	classes: ClassSession[],
): Map<string, ClassSession[]> {
	const grouped = new Map<string, ClassSession[]>();

	const sortedClasses = [...classes].sort(
		(a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime(),
	);

	for (const classItem of sortedClasses) {
		const dateKey = format(parseISO(classItem.startTime), "yyyy-MM-dd");
		const existing = grouped.get(dateKey) || [];
		grouped.set(dateKey, [...existing, classItem]);
	}

	return grouped;
}

// Get class status badge info based on attendance and homework
function getClassStatusBadge(classItem: ClassSession) {
	const hasAttendance = !!classItem.attendanceRecord;

	// No attendance record - no badge needed
	if (!hasAttendance) {
		return null;
	}

	const status = classItem.attendanceRecord?.status;
	const homeworkDone = classItem.attendanceRecord?.homeworkCompleted;

	// Explicitly marked as not attended - red badge
	if (status === "not_attended") {
		return {
			label: "Absent",
			variant: "destructive" as const,
			icon: XCircle,
		};
	}

	// Attended (or attended_late) but no homework - yellow/amber badge
	if ((status === "attended" || status === "attended_late") && !homeworkDone) {
		return {
			label: "Homework Pending",
			variant: "warning" as const,
			icon: AlertCircle,
		};
	}

	// Attended and homework done - green badge
	if ((status === "attended" || status === "attended_late") && homeworkDone) {
		return {
			label: "Completed",
			variant: "success" as const,
			icon: CheckCircle2,
		};
	}

	// Default (e.g., status is "unset") - no badge
	return null;
}

interface ClassCardProps {
	classItem: ClassSession;
}

function ClassCard({ classItem }: ClassCardProps) {
	const [expanded, setExpanded] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [optimisticHomeworkDone, setOptimisticHomeworkDone] = useState(false);

	const startTime = parseISO(classItem.startTime);
	const endTime = parseISO(classItem.endTime);
	const initials = classItem.teacher.name
		.split(" ")
		.map((n: string) => n[0])
		.join("");

	const isCompleted = classItem.status === "completed";
	const isLive = classItem.status === "in_progress";
	const isClassInPast = isPast(endTime);
	const hasAttendanceRecord = !!classItem.attendanceRecord;
	const homeworkCompleted =
		optimisticHomeworkDone ||
		classItem.attendanceRecord?.homeworkCompleted ||
		false;
	const homeworkCompletedAt = classItem.attendanceRecord?.homeworkCompletedAt;

	const statusBadge = getClassStatusBadge(classItem);

	const handleHomeworkToggle = async (checked: boolean) => {
		if (!classItem.attendanceRecord) return;

		// Optimistic update
		setOptimisticHomeworkDone(checked);

		startTransition(async () => {
			if (checked) {
				const result = await markHomeworkComplete(
					classItem.attendanceRecord!.id,
				);
				if (!result.success) {
					// Revert on error
					setOptimisticHomeworkDone(false);
				}
			} else {
				const result = await unmarkHomeworkComplete(
					classItem.attendanceRecord!.id,
				);
				if (!result.success) {
					// Revert on error
					setOptimisticHomeworkDone(true);
				}
			}
		});
	};

	return (
		<div
			className={cn(
				"overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:border-border hover:shadow-md",
				isLive && "border-primary/50 shadow-md ring-2 ring-primary/20",
			)}
		>
			{/* Clickable Header */}
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className="w-full p-5 text-left"
			>
				<div className="flex items-start gap-6">
					{/* Time Block */}
					<div className="flex shrink-0 gap-4">
						<div className="min-w-[60px] text-center">
							<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
								From
							</p>
							<p className="mt-0.5 font-bold text-foreground text-xl">
								{format(startTime, "hh:mm")}
							</p>
							<p className="font-medium text-muted-foreground text-xs">
								{format(startTime, "a").toUpperCase()}
							</p>
						</div>
						<div className="min-w-[60px] text-center">
							<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
								To
							</p>
							<p className="mt-0.5 font-bold text-foreground text-xl">
								{format(endTime, "hh:mm")}
							</p>
							<p className="font-medium text-muted-foreground text-xs">
								{format(endTime, "a").toUpperCase()}
							</p>
						</div>
					</div>

					{/* Divider */}
					<div className="h-14 w-px shrink-0 self-center bg-border/60" />

					{/* Course Info */}
					<div className="min-w-0 flex-1">
						<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
							Course
						</p>
						<div className="mt-0.5 flex items-center gap-2">
							<h3 className="font-bold text-foreground text-lg leading-snug">
								{formatClassLabel(classItem)}
							</h3>
							{statusBadge && (
								<Badge variant={statusBadge.variant} className="gap-1">
									<statusBadge.icon className="h-3 w-3" />
									{statusBadge.label}
								</Badge>
							)}
						</div>
					</div>

					{/* Teacher */}
					<div className="flex shrink-0 items-center gap-2.5">
						<div className="hidden text-right sm:block">
							<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
								Teacher
							</p>
							<p className="mt-0.5 font-semibold text-foreground text-sm">
								{classItem.teacher.name}
							</p>
						</div>
						<Avatar className="h-10 w-10 shadow-sm ring-2 ring-background">
							<AvatarImage src={classItem.teacher.avatar} />
							<AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 font-semibold text-primary text-xs">
								{initials}
							</AvatarFallback>
						</Avatar>
					</div>

					{/* Chevron Icon */}
					<div className="shrink-0 self-center">
						<ChevronDown
							className={cn(
								"h-5 w-5 text-muted-foreground transition-transform duration-200",
								expanded && "rotate-180",
							)}
						/>
					</div>
				</div>
			</button>

			{/* Expanded Content */}
			{expanded && (
				<div className="px-5 pb-5">
					<div className="space-y-4 border-border/50 border-t pt-4">
						<div className="flex items-center justify-between gap-6">
							{/* Left side info */}
							<div className="flex items-center gap-6">
								{/* Location */}
								<div>
									<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
										Location
									</p>
									<div className="mt-1 flex items-center gap-1.5">
										<MapPin className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium text-foreground capitalize">
											{classItem.location || "Online"}
										</span>
									</div>
								</div>

								{/* Calendar Event Link */}
								{classItem.meetingLink && (
									<div>
										<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
											Calendar Event
										</p>
										<a
											href={classItem.meetingLink}
											target="_blank"
											rel="noopener noreferrer"
											className="mt-1 inline-flex items-center gap-1.5 font-medium text-primary text-sm hover:underline"
											onClick={(e) => e.stopPropagation()}
										>
											<Calendar className="h-4 w-4 shrink-0" />
											<span>View in calendar</span>
										</a>
									</div>
								)}
							</div>

							{/* Action Button */}
							{classItem.meetingLink && !isCompleted && (
								<Button
									size="sm"
									className="rounded-full bg-primary px-5 shadow-sm hover:bg-primary/90"
									asChild
								>
									<a
										href={classItem.meetingLink}
										target="_blank"
										rel="noopener noreferrer"
										onClick={(e) => e.stopPropagation()}
									>
										Open event
									</a>
								</Button>
							)}
						</div>

						{/* Homework Section (only show if attendance record exists and class is in the past) */}
						{hasAttendanceRecord && isClassInPast && (
							<div className="space-y-2">
								<div className="flex items-center gap-3">
									<Checkbox
										id={`homework-${classItem.id}`}
										checked={homeworkCompleted}
										onCheckedChange={handleHomeworkToggle}
										disabled={isPending}
										className="h-5 w-5"
									/>
									<Label
										htmlFor={`homework-${classItem.id}`}
										className="flex-1 cursor-pointer font-medium text-sm"
									>
										I completed my homework
									</Label>
									{homeworkCompleted && (
										<Check className="h-5 w-5 text-green-600" />
									)}
								</div>
								{homeworkCompletedAt && (
									<p className="pl-8 text-muted-foreground text-xs">
										Completed on{" "}
										{format(
											parseISO(homeworkCompletedAt),
											"MMM d, yyyy 'at' h:mm a",
										)}
									</p>
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

interface ScheduleListViewProps {
	classes: ClassSession[];
	filter: "upcoming" | "past";
}

export function ScheduleListView({ classes, filter }: ScheduleListViewProps) {
	const filteredClasses = classes.filter((c) => {
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
				<h3 className="mt-5 font-bold text-foreground text-xl">
					No {filter} classes
				</h3>
				<p className="mt-2 max-w-xs text-muted-foreground">
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
						<div className="mb-4 flex items-baseline gap-2">
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
