"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import type { ClassSession } from "@/features/shared/types";

import {
	addMonths,
	addWeeks,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	getDay,
	isSameDay,
	isSameMonth,
	isToday,
	parseISO,
	startOfMonth,
	startOfWeek,
	subMonths,
	subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ClassDetailsModal } from "./ClassDetailsModal";

// Generate hours from 7am to 8pm
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

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

// Get class status colors based on homework completion
function getClassStatusColors(classItem: ClassSession) {
	const hasAttendance = !!classItem.attendanceRecord;

	// No attendance record - default blue (no coloring)
	if (!hasAttendance) {
		return {
			bg: "bg-blue-50",
			border: "border-blue-200",
			hoverBg: "hover:bg-blue-100",
			hoverBorder: "hover:border-blue-300",
			dot: null,
		};
	}

	const homeworkDone = classItem.attendanceRecord?.homeworkCompleted;

	// Homework completed - green
	if (homeworkDone) {
		return {
			bg: "bg-green-50",
			border: "border-green-300",
			hoverBg: "hover:bg-green-100",
			hoverBorder: "hover:border-green-400",
			dot: "bg-green-500",
		};
	}

	// Has attendance record but homework not completed - amber/warning
	return {
		bg: "bg-amber-50",
		border: "border-amber-300",
		hoverBg: "hover:bg-amber-100",
		hoverBorder: "hover:border-amber-400",
		dot: "bg-amber-500",
	};
}

interface ScheduleCalendarViewProps {
	classes: ClassSession[];
	view: "week" | "month";
	onViewChange?: (view: "week" | "month") => void;
}

export function ScheduleCalendarView({
	classes,
	view,
	onViewChange,
}: ScheduleCalendarViewProps) {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleClassClick = (classSession: ClassSession) => {
		setSelectedClass(classSession);
		setIsModalOpen(true);
	};

	// Week view calculations
	const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
	const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
	const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

	// Month view calculations
	const monthStart = startOfMonth(currentDate);
	const monthEnd = endOfMonth(currentDate);
	const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
	const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
	const calendarDays = eachDayOfInterval({
		start: calendarStart,
		end: calendarEnd,
	});

	const classesInRange = useMemo(() => {
		const rangeStart = view === "week" ? weekStart : calendarStart;
		const rangeEnd = view === "week" ? weekEnd : calendarEnd;

		return classes.filter((c) => {
			const classDate = parseISO(c.startTime);
			return classDate >= rangeStart && classDate <= rangeEnd;
		});
	}, [classes, view, weekStart, weekEnd, calendarStart, calendarEnd]);

	const getClassesForDay = (day: Date) => {
		return classesInRange.filter((c) => isSameDay(parseISO(c.startTime), day));
	};

	const getClassPosition = (classItem: ClassSession) => {
		const startTime = parseISO(classItem.startTime);
		const endTime = parseISO(classItem.endTime);
		const startHour = startTime.getHours() + startTime.getMinutes() / 60;
		const endHour = endTime.getHours() + endTime.getMinutes() / 60;
		const duration = endHour - startHour;

		const top = (startHour - 7) * 60;
		const height = duration * 60;

		return { top, height };
	};

	const navigate = (direction: "prev" | "next") => {
		if (view === "week") {
			setCurrentDate(
				direction === "prev"
					? subWeeks(currentDate, 1)
					: addWeeks(currentDate, 1),
			);
		} else {
			setCurrentDate(
				direction === "prev"
					? subMonths(currentDate, 1)
					: addMonths(currentDate, 1),
			);
		}
	};

	const goToToday = () => {
		setCurrentDate(new Date());
	};

	const headerText =
		view === "week"
			? `${format(weekStart, "MMMM d")} - ${format(weekEnd, "d, yyyy")}`
			: format(currentDate, "MMMM yyyy");

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
							onClick={() => navigate("prev")}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => navigate("next")}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
					{/* View Toggle */}
					{onViewChange && (
						<div className="ml-2 flex items-center rounded-lg border bg-muted/30 p-0.5">
							<Button
								variant={view === "month" ? "secondary" : "ghost"}
								size="sm"
								className="h-7 px-3 text-xs"
								onClick={() => onViewChange("month")}
							>
								Month
							</Button>
							<Button
								variant={view === "week" ? "secondary" : "ghost"}
								size="sm"
								className="h-7 px-3 text-xs"
								onClick={() => onViewChange("week")}
							>
								Week
							</Button>
						</div>
					)}
				</div>
				<h2 className="font-semibold text-lg">{headerText}</h2>
			</div>

			{/* Calendar Grid */}
			{view === "week" ? (
				<WeekView
					weekDays={weekDays}
					getClassesForDay={getClassesForDay}
					getClassPosition={getClassPosition}
					onClassClick={handleClassClick}
				/>
			) : (
				<MonthView
					calendarDays={calendarDays}
					currentDate={currentDate}
					getClassesForDay={getClassesForDay}
					onClassClick={handleClassClick}
				/>
			)}

			{/* Class Details Modal */}
			<ClassDetailsModal
				classSession={selectedClass}
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
			/>
		</div>
	);
}

interface WeekViewProps {
	weekDays: Date[];
	getClassesForDay: (day: Date) => ClassSession[];
	getClassPosition: (classItem: ClassSession) => {
		top: number;
		height: number;
	};
	onClassClick: (classSession: ClassSession) => void;
}

function WeekView({
	weekDays,
	getClassesForDay,
	getClassPosition,
	onClassClick,
}: WeekViewProps) {
	return (
		<div className="overflow-hidden rounded-xl border bg-card">
			{/* Day Headers */}
			<div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
				<div className="border-r p-2" />
				{weekDays.map((day) => (
					<div
						key={day.toISOString()}
						className={cn(
							"border-r p-3 text-center last:border-r-0",
							isToday(day) && "bg-primary/5",
						)}
					>
						<p className="text-muted-foreground text-xs uppercase">
							{format(day, "EEE")}
						</p>
						<p
							className={cn(
								"mt-1 font-semibold text-xl",
								isToday(day) &&
									"mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground",
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
						<div key={hour} className="h-[60px] border-b px-2 py-1 text-right">
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
								isToday(day) && "bg-primary/5",
							)}
						>
							{/* Hour Lines */}
							{HOURS.map((hour) => (
								<div key={hour} className="h-[60px] border-b border-dashed" />
							))}

							{/* Classes */}
							{dayClasses.map((classItem) => {
								const { top, height } = getClassPosition(classItem);
								const colors = getClassStatusColors(classItem);
								const initials = classItem.teacher.name
									.split(" ")
									.map((n: string) => n[0])
									.join("");

								return (
									<button
										key={classItem.id}
										type="button"
										onClick={() => onClassClick(classItem)}
										className={cn(
											"absolute inset-x-1 cursor-pointer overflow-hidden rounded-lg border p-2 text-left text-xs transition-all hover:shadow-md",
											colors.bg,
											colors.border,
											colors.hoverBg,
											colors.hoverBorder,
										)}
										style={{ top: `${top}px`, height: `${height}px` }}
									>
										{/* Status dot indicator */}
										{colors.dot && (
											<div className="absolute top-1.5 right-1.5">
												<div
													className={cn("h-2 w-2 rounded-full", colors.dot)}
												/>
											</div>
										)}

										<p className="truncate font-semibold text-primary">
											{formatClassLabel(classItem)}
										</p>
										<p className="truncate text-muted-foreground">
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
									</button>
								);
							})}
						</div>
					);
				})}
			</div>
		</div>
	);
}

interface MonthViewProps {
	calendarDays: Date[];
	currentDate: Date;
	getClassesForDay: (day: Date) => ClassSession[];
	onClassClick: (classSession: ClassSession) => void;
}

function MonthView({
	calendarDays,
	currentDate,
	getClassesForDay,
	onClassClick,
}: MonthViewProps) {
	const weekDayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

	return (
		<div className="overflow-hidden rounded-xl border bg-card">
			{/* Week Day Headers */}
			<div className="grid grid-cols-7 border-b">
				{weekDayHeaders.map((day) => (
					<div
						key={day}
						className="border-r bg-muted/30 p-3 text-center last:border-r-0"
					>
						<p className="font-medium text-muted-foreground text-xs uppercase">
							{day}
						</p>
					</div>
				))}
			</div>

			{/* Calendar Days Grid */}
			<div className="grid grid-cols-7">
				{calendarDays.map((day, index) => {
					const dayClasses = getClassesForDay(day);
					const isCurrentMonth = isSameMonth(day, currentDate);

					return (
						<div
							key={day.toISOString()}
							className={cn(
								"min-h-[120px] border-r border-b p-2 last:border-r-0",
								"[&:nth-child(7n)]:border-r-0",
								!isCurrentMonth && "bg-muted/20",
								isToday(day) && "bg-primary/5",
							)}
						>
							{/* Day Number */}
							<div className="mb-1 flex justify-end">
								<span
									className={cn(
										"font-medium text-sm",
										!isCurrentMonth && "text-muted-foreground/50",
										isToday(day) &&
											"flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground",
									)}
								>
									{format(day, "d")}
								</span>
							</div>

							{/* Classes */}
							<div className="space-y-1">
								{dayClasses.slice(0, 3).map((classItem) => {
									const colors = getClassStatusColors(classItem);
									return (
										<button
											key={classItem.id}
											type="button"
											onClick={() => onClassClick(classItem)}
											className={cn(
												"flex w-full cursor-pointer items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-primary text-xs transition-all",
												colors.bg,
												colors.hoverBg,
											)}
											title={`${formatClassLabel(classItem)} - ${format(parseISO(classItem.startTime), "h:mm a")}`}
										>
											{colors.dot && (
												<div
													className={cn(
														"h-1.5 w-1.5 shrink-0 rounded-full",
														colors.dot,
													)}
												/>
											)}
											<span className="font-medium">
												{format(parseISO(classItem.startTime), "h:mm")}
											</span>{" "}
											<span className="truncate">
												{formatClassLabel(classItem)}
											</span>
										</button>
									);
								})}
								{dayClasses.length > 3 && (
									<div className="pl-1.5 text-muted-foreground text-xs">
										+{dayClasses.length - 3} more
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
