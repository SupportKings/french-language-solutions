"use client";

import { useState, useTransition } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import type { ClassSession } from "@/features/shared/types";

import { format, isPast, parseISO } from "date-fns";
import {
	BookOpen,
	Calendar,
	CheckCircle2,
	Clock,
	ExternalLink,
	MapPin,
	Video,
	XCircle,
} from "lucide-react";
import {
	markHomeworkComplete,
	unmarkHomeworkComplete,
} from "../actions/markHomeworkComplete";

interface ClassDetailsModalProps {
	classSession: ClassSession | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function formatClassLabel(classItem: ClassSession): string {
	const formatLabel =
		classItem.format === "group"
			? "Group"
			: classItem.format === "private"
				? "Private"
				: "Hybrid";
	return `${formatLabel} - ${classItem.level}`;
}

function formatLocation(location: string | null | undefined): string {
	if (!location) return "Online";
	// Convert snake_case or similar to proper title case
	return location
		.replace(/_/g, " ")
		.replace(/-/g, " ")
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

export function ClassDetailsModal({
	classSession,
	open,
	onOpenChange,
}: ClassDetailsModalProps) {
	const [isPending, startTransition] = useTransition();
	// null means "use server value", boolean means "override with this value"
	const [optimisticHomework, setOptimisticHomework] = useState<{
		completed: boolean;
		completedAt: string | null;
	} | null>(null);

	if (!classSession) return null;

	const startTime = parseISO(classSession.startTime);
	const endTime = parseISO(classSession.endTime);
	const isClassInPast = isPast(endTime);
	const hasAttendanceRecord = !!classSession.attendanceRecord;

	// Use optimistic value if set, otherwise fall back to server value
	const homeworkCompleted =
		optimisticHomework !== null
			? optimisticHomework.completed
			: (classSession.attendanceRecord?.homeworkCompleted ?? false);
	const homeworkCompletedAt =
		optimisticHomework !== null
			? optimisticHomework.completedAt
			: classSession.attendanceRecord?.homeworkCompletedAt;

	const initials = classSession.teacher.name
		.split(" ")
		.map((n: string) => n[0])
		.join("");

	const handleHomeworkToggle = async (checked: boolean) => {
		if (!classSession.attendanceRecord) return;

		// Optimistic update
		setOptimisticHomework({
			completed: checked,
			completedAt: checked ? new Date().toISOString() : null,
		});

		startTransition(async () => {
			if (checked) {
				const result = await markHomeworkComplete(
					classSession.attendanceRecord!.id,
				);
				if (!result.success) {
					// Revert on error
					setOptimisticHomework({
						completed: false,
						completedAt: null,
					});
				}
			} else {
				const result = await unmarkHomeworkComplete(
					classSession.attendanceRecord!.id,
				);
				if (!result.success) {
					// Revert on error - restore previous server state
					setOptimisticHomework({
						completed: true,
						completedAt:
							classSession.attendanceRecord?.homeworkCompletedAt ?? null,
					});
				}
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="gap-0 p-0 sm:max-w-[480px]">
				{/* Header Section */}
				<div className="border-b bg-muted/30 px-6 py-5">
					<DialogHeader className="space-y-1.5">
						<DialogTitle className="font-bold text-xl tracking-tight">
							{formatClassLabel(classSession)}
						</DialogTitle>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<Calendar className="h-4 w-4" />
							<span>{format(startTime, "EEEE, MMMM d, yyyy")}</span>
						</div>
					</DialogHeader>
				</div>

				<div className="p-6">
					{/* Teacher Section */}
					<div className="flex items-center gap-4">
						<Avatar className="h-12 w-12 ring-2 ring-primary/10">
							<AvatarImage src={classSession.teacher.avatar} />
							<AvatarFallback className="bg-primary/10 font-semibold text-primary">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<p className="text-muted-foreground text-xs uppercase tracking-wide">
								Teacher
							</p>
							<p className="font-semibold">{classSession.teacher.name}</p>
						</div>
					</div>

					{/* Class Details Section */}
					<div className="mt-6 rounded-xl border bg-muted/20 p-4">
						<div className="grid gap-4">
							{/* Time */}
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
									<Clock className="h-4 w-4 text-muted-foreground" />
								</div>
								<div className="flex-1">
									<p className="text-muted-foreground text-xs">Time</p>
									<p className="font-medium">
										{format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
									</p>
								</div>
							</div>

							{/* Location */}
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
									<MapPin className="h-4 w-4 text-muted-foreground" />
								</div>
								<div className="flex-1">
									<p className="text-muted-foreground text-xs">Location</p>
									<p className="font-medium">
										{formatLocation(classSession.location)}
									</p>
								</div>
							</div>

							{/* Attendance Status */}
							{hasAttendanceRecord && isClassInPast && (
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
										{classSession.attendanceRecord?.status === "attended" ||
										classSession.attendanceRecord?.status === "attended_late" ? (
											<CheckCircle2 className="h-4 w-4 text-emerald-600" />
										) : (
											<XCircle className="h-4 w-4 text-destructive" />
										)}
									</div>
									<div className="flex-1">
										<p className="text-muted-foreground text-xs">Attendance</p>
										<p className="font-medium">
											{classSession.attendanceRecord?.status === "attended" && (
												<span className="text-emerald-600">Present</span>
											)}
											{classSession.attendanceRecord?.status ===
												"attended_late" && (
												<span className="text-amber-600">Present (Late)</span>
											)}
											{classSession.attendanceRecord?.status ===
												"not_attended" && (
												<span className="text-destructive">Absent</span>
											)}
											{classSession.attendanceRecord?.status === "unset" && (
												<span className="text-muted-foreground">Not marked</span>
											)}
										</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Meeting Links */}
					{(classSession.meetingLink || classSession.hangoutLink) && (
						<div className="mt-4 flex gap-2">
							{classSession.meetingLink && (
								<a
									href={classSession.meetingLink}
									target="_blank"
									rel="noopener noreferrer"
									className="flex flex-1 items-center justify-center gap-2 rounded-lg border bg-background py-2.5 font-medium text-primary text-sm transition-all hover:bg-muted/50"
								>
									<ExternalLink className="h-4 w-4" />
									<span>View in Google Calendar</span>
								</a>
							)}
							{classSession.hangoutLink && (
								<a
									href={classSession.hangoutLink}
									target="_blank"
									rel="noopener noreferrer"
									className="flex flex-1 items-center justify-center gap-2 rounded-lg border bg-background py-2.5 font-medium text-primary text-sm transition-all hover:bg-muted/50"
								>
									<Video className="h-4 w-4" />
									<span>Open Google Meet</span>
								</a>
							)}
						</div>
					)}

					{/* Homework Section */}
					{hasAttendanceRecord && isClassInPast && (
						<div className="mt-6 rounded-xl border bg-muted/20 p-4">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
									<BookOpen className="h-4 w-4 text-muted-foreground" />
								</div>
								<p className="font-medium text-sm">Homework</p>
							</div>

							<div className="mt-4 space-y-2 rounded-lg border bg-background p-3">
								<div className="flex items-center gap-3">
									<Checkbox
										id="homework"
										checked={homeworkCompleted}
										onCheckedChange={handleHomeworkToggle}
										disabled={isPending}
										className="h-5 w-5"
									/>
									<Label
										htmlFor="homework"
										className="cursor-pointer font-medium text-sm"
									>
										I completed my homework
									</Label>
								</div>
								{homeworkCompletedAt && homeworkCompleted && (
									<p className="pl-8 text-muted-foreground text-xs">
										Completed on{" "}
										{format(
											parseISO(homeworkCompletedAt),
											"MMM d, yyyy 'at' h:mm a",
										)}
									</p>
								)}
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
