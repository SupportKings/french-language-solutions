"use client";

import { useMemo, useState } from "react";

import {
	addDays,
	addWeeks,
	eachDayOfInterval,
	eachHourOfInterval,
	endOfWeek,
	format,
	isSameDay,
	isToday,
	parseISO,
	startOfDay,
	startOfWeek,
	subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { mockClasses } from "@/features/shared/data/mock-data";
import type { ClassSession } from "@/features/shared/types";

// Generate hours from 7am to 8pm
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

interface ScheduleCalendarViewProps {
	view: "week" | "month";
}

export function ScheduleCalendarView({ view }: ScheduleCalendarViewProps) {
	const [currentDate, setCurrentDate] = useState(new Date());

	const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
	const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
	const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

	const classesThisWeek = useMemo(() => {
		return mockClasses.filter((c) => {
			const classDate = parseISO(c.startTime);
			return classDate >= weekStart && classDate <= weekEnd;
		});
	}, [weekStart, weekEnd]);

	const getClassesForDay = (day: Date) => {
		return classesThisWeek.filter((c) =>
			isSameDay(parseISO(c.startTime), day)
		);
	};

	const getClassPosition = (classItem: ClassSession) => {
		const startTime = parseISO(classItem.startTime);
		const endTime = parseISO(classItem.endTime);
		const startHour = startTime.getHours() + startTime.getMinutes() / 60;
		const endHour = endTime.getHours() + endTime.getMinutes() / 60;
		const duration = endHour - startHour;

		const top = (startHour - 7) * 60; // 60px per hour, starting from 7am
		const height = duration * 60;

		return { top, height };
	};

	const navigateWeek = (direction: "prev" | "next") => {
		if (direction === "prev") {
			setCurrentDate(subWeeks(currentDate, 1));
		} else {
			setCurrentDate(addWeeks(currentDate, 1));
		}
	};

	const goToToday = () => {
		setCurrentDate(new Date());
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={goToToday}>
						Today
					</Button>
					<div className="flex items-center">
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => navigateWeek("prev")}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => navigateWeek("next")}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
				<h2 className="font-semibold text-lg">
					{format(weekStart, "MMMM d")} - {format(weekEnd, "d, yyyy")}
				</h2>
			</div>

			{/* Calendar Grid */}
			<div className="overflow-hidden rounded-xl border bg-card">
				{/* Day Headers */}
				<div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
					<div className="border-r p-2" />
					{weekDays.map((day) => (
						<div
							key={day.toISOString()}
							className={cn(
								"border-r p-3 text-center last:border-r-0",
								isToday(day) && "bg-primary/5"
							)}
						>
							<p className="text-muted-foreground text-xs uppercase">
								{format(day, "EEE")}
							</p>
							<p
								className={cn(
									"mt-1 font-semibold text-xl",
									isToday(day) &&
										"flex h-8 w-8 mx-auto items-center justify-center rounded-full bg-primary text-primary-foreground"
								)}
							>
								{format(day, "d")}
							</p>
						</div>
					))}
				</div>

				{/* Time Grid */}
				<div className="relative grid grid-cols-[60px_repeat(7,1fr)]">
					{/* Time Labels */}
					<div className="border-r">
						{HOURS.map((hour) => (
							<div
								key={hour}
								className="h-[60px] border-b px-2 py-1 text-right"
							>
								<span className="text-muted-foreground text-xs">
									{format(new Date().setHours(hour, 0), "h a")}
								</span>
							</div>
						))}
					</div>

					{/* Day Columns */}
					{weekDays.map((day) => {
						const dayClasses = getClassesForDay(day);
						return (
							<div
								key={day.toISOString()}
								className={cn(
									"relative border-r last:border-r-0",
									isToday(day) && "bg-primary/5"
								)}
							>
								{/* Hour Lines */}
								{HOURS.map((hour) => (
									<div
										key={hour}
										className="h-[60px] border-b border-dashed"
									/>
								))}

								{/* Classes */}
								{dayClasses.map((classItem) => {
									const { top, height } = getClassPosition(classItem);
									const initials = classItem.teacher.name
										.split(" ")
										.map((n: string) => n[0])
										.join("");

									return (
										<div
											key={classItem.id}
											className="absolute inset-x-1 overflow-hidden rounded-lg border bg-primary/10 p-2 text-xs transition-all hover:bg-primary/20 hover:shadow-md"
											style={{ top: `${top}px`, height: `${height}px` }}
										>
											<p className="font-semibold text-primary truncate">
												{classItem.cohortName}
											</p>
											<p className="text-muted-foreground truncate">
												{format(parseISO(classItem.startTime), "h:mm a")} -{" "}
												{format(parseISO(classItem.endTime), "h:mm a")}
											</p>
											{height > 60 && (
												<div className="mt-1 flex items-center gap-1">
													<Avatar className="h-4 w-4">
														<AvatarFallback className="text-[8px]">
															{initials}
														</AvatarFallback>
													</Avatar>
													<span className="truncate text-muted-foreground">
														{classItem.teacher.name}
													</span>
												</div>
											)}
										</div>
									);
								})}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
