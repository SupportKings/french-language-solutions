"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { mockClasses } from "@/features/shared/data/mock-data";

import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	isSameMonth,
	isToday,
	parseISO,
	startOfMonth,
	startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function MiniCalendar() {
	const [currentMonth, setCurrentMonth] = useState(new Date());

	const classDates = useMemo(() => {
		return mockClasses.map((c) => parseISO(c.startTime));
	}, []);

	const days = useMemo(() => {
		const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
		const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
		return eachDayOfInterval({ start, end });
	}, [currentMonth]);

	const hasClass = (date: Date) => {
		return classDates.some((classDate) => isSameDay(classDate, date));
	};

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base">Calendar</CardTitle>
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="min-w-[100px] text-center font-medium text-sm">
							{format(currentMonth, "MMMM yyyy")}
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{/* Weekday headers */}
				<div className="mb-2 grid grid-cols-7 gap-1">
					{["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
						<div
							key={`${day}-${i}`}
							className="text-center font-medium text-muted-foreground text-xs"
						>
							{day}
						</div>
					))}
				</div>

				{/* Calendar days */}
				<div className="grid grid-cols-7 gap-1">
					{days.map((day) => {
						const isCurrentMonth = isSameMonth(day, currentMonth);
						const isTodayDate = isToday(day);
						const hasClassOnDay = hasClass(day);

						return (
							<button
								key={day.toISOString()}
								type="button"
								className={cn(
									"relative flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
									!isCurrentMonth && "text-muted-foreground/40",
									isCurrentMonth && "text-foreground",
									isTodayDate &&
										"bg-primary font-semibold text-primary-foreground",
									!isTodayDate && hasClassOnDay && "bg-primary/10 font-medium",
									!isTodayDate && !hasClassOnDay && "hover:bg-muted",
								)}
							>
								{format(day, "d")}
								{hasClassOnDay && !isTodayDate && (
									<span className="-bottom-0.5 absolute h-1 w-1 rounded-full bg-primary" />
								)}
							</button>
						);
					})}
				</div>

				{/* Legend */}
				<div className="mt-4 flex items-center gap-4 border-t pt-3 text-muted-foreground text-xs">
					<div className="flex items-center gap-1.5">
						<span className="h-2 w-2 rounded-full bg-primary" />
						<span>Today</span>
					</div>
					<div className="flex items-center gap-1.5">
						<span className="h-2 w-2 rounded-full bg-primary/30" />
						<span>Class day</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
