"use client";

import { useState } from "react";

import { CalendarDays, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
	ScheduleCalendarView,
	ScheduleListView,
} from "@/features/schedule/components";

type ViewMode = "list" | "calendar";
type FilterMode = "upcoming" | "past";

export function ScheduleSection() {
	const [viewMode, setViewMode] = useState<ViewMode>("list");
	const [filterMode, setFilterMode] = useState<FilterMode>("upcoming");

	return (
		<Card>
			<CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="text-lg">My Schedule</CardTitle>

				<div className="flex items-center gap-3">
					{/* Filter Tabs (for list view) */}
					{viewMode === "list" && (
						<Tabs
							value={filterMode}
							onValueChange={(v) => setFilterMode(v as FilterMode)}
						>
							<TabsList className="h-8">
								<TabsTrigger value="upcoming" className="text-xs px-3">
									Upcoming
								</TabsTrigger>
								<TabsTrigger value="past" className="text-xs px-3">
									Past
								</TabsTrigger>
							</TabsList>
						</Tabs>
					)}

					{/* View Mode Toggle */}
					<div className="flex items-center rounded-md border bg-muted/30 p-0.5">
						<Button
							variant={viewMode === "list" ? "secondary" : "ghost"}
							size="sm"
							className="h-7 gap-1.5 px-2"
							onClick={() => setViewMode("list")}
						>
							<List className="h-3.5 w-3.5" />
							<span className="hidden sm:inline text-xs">List</span>
						</Button>
						<Button
							variant={viewMode === "calendar" ? "secondary" : "ghost"}
							size="sm"
							className="h-7 gap-1.5 px-2"
							onClick={() => setViewMode("calendar")}
						>
							<CalendarDays className="h-3.5 w-3.5" />
							<span className="hidden sm:inline text-xs">Calendar</span>
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{viewMode === "list" ? (
					<ScheduleListView filter={filterMode} />
				) : (
					<ScheduleCalendarView view="week" />
				)}
			</CardContent>
		</Card>
	);
}
