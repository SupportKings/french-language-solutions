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
import { Calendar, Check, Clock, ExternalLink, MapPin } from "lucide-react";
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

export function ClassDetailsModal({
	classSession,
	open,
	onOpenChange,
}: ClassDetailsModalProps) {
	const [isPending, startTransition] = useTransition();
	const [optimisticHomeworkDone, setOptimisticHomeworkDone] = useState(false);

	if (!classSession) return null;

	const startTime = parseISO(classSession.startTime);
	const endTime = parseISO(classSession.endTime);
	const isClassInPast = isPast(endTime);
	const hasAttendanceRecord = !!classSession.attendanceRecord;
	const homeworkCompleted =
		optimisticHomeworkDone ||
		classSession.attendanceRecord?.homeworkCompleted ||
		false;
	const homeworkCompletedAt =
		classSession.attendanceRecord?.homeworkCompletedAt;

	const initials = classSession.teacher.name
		.split(" ")
		.map((n: string) => n[0])
		.join("");

	const handleHomeworkToggle = async (checked: boolean) => {
		if (!classSession.attendanceRecord) return;

		// Optimistic update
		setOptimisticHomeworkDone(checked);

		startTransition(async () => {
			if (checked) {
				const result = await markHomeworkComplete(
					classSession.attendanceRecord!.id,
				);
				if (!result.success) {
					// Revert on error
					setOptimisticHomeworkDone(false);
				}
			} else {
				const result = await unmarkHomeworkComplete(
					classSession.attendanceRecord!.id,
				);
				if (!result.success) {
					// Revert on error
					setOptimisticHomeworkDone(true);
				}
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[480px]">
				{/* Header with class type */}
				<DialogHeader className="space-y-1 pb-6">
					<DialogTitle className="font-bold text-2xl">
						{formatClassLabel(classSession)}
					</DialogTitle>
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<Calendar className="h-4 w-4" />
						<span>{format(startTime, "EEEE, MMMM d, yyyy")}</span>
					</div>
				</DialogHeader>

				<div className="space-y-6">
					{/* Teacher - Simple row */}
					<div className="flex items-center gap-4">
						<Avatar className="h-12 w-12">
							<AvatarImage src={classSession.teacher.avatar} />
							<AvatarFallback className="bg-primary/10 font-semibold text-primary">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<p className="text-muted-foreground text-xs">Teacher</p>
							<p className="font-semibold text-base">
								{classSession.teacher.name}
							</p>
						</div>
					</div>

					{/* Divider */}
					<div className="border-t" />

					{/* Time & Location - Simple rows */}
					<div className="space-y-4">
						<div className="flex items-center gap-3">
							<Clock className="h-5 w-5 text-muted-foreground" />
							<div className="flex-1">
								<p className="text-muted-foreground text-xs">Time</p>
								<p className="font-medium">
									{format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<MapPin className="h-5 w-5 text-muted-foreground" />
							<div className="flex-1">
								<p className="text-muted-foreground text-xs">Location</p>
								<p className="font-medium capitalize">
									{classSession.location || "Online"}
								</p>
							</div>
						</div>
					</div>

					{/* Meeting Link */}
					{classSession.meetingLink && (
						<>
							<div className="border-t" />
							<a
								href={classSession.meetingLink}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-center gap-2 font-medium text-primary text-sm transition-colors hover:text-primary/80"
							>
								<ExternalLink className="h-4 w-4" />
								<span>View in Google Calendar</span>
							</a>
						</>
					)}

					{/* Homework Section */}
					{hasAttendanceRecord && isClassInPast && (
						<>
							<div className="border-t" />
							<div className="space-y-3">
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
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
