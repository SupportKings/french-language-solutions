"use client";

import { useState } from "react";

import { ScheduleCalendarView } from "@/features/schedule/components";
import type { ClassSession } from "@/features/shared/types";

type CalendarViewMode = "week" | "month";

interface ScheduleSectionProps {
	classes: ClassSession[];
}

export function ScheduleSection({ classes }: ScheduleSectionProps) {
	const [calendarViewMode, setCalendarViewMode] =
		useState<CalendarViewMode>("month");

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div>
				<h2 className="font-bold text-2xl tracking-tight">My Schedule</h2>
				<p className="mt-1 text-muted-foreground text-sm">
					View and manage your upcoming and past classes
				</p>
			</div>

			{/* Content */}
			<ScheduleCalendarView
				classes={classes}
				view={calendarViewMode}
				onViewChange={setCalendarViewMode}
			/>
		</div>
	);
}
