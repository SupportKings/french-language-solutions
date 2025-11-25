"use client";

import type { StudentStats } from "@/features/shared/types";

import { BookOpen, Calendar, CheckCircle, TrendingUp } from "lucide-react";

interface StatsCardsProps {
	stats: StudentStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
	return (
		<div className="rounded-xl border bg-card p-4">
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
				{/* Attendance */}
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
						<CheckCircle className="h-5 w-5 text-blue-600" />
					</div>
					<div className="min-w-0">
						<p className="text-muted-foreground text-xs">Attendance</p>
						<p className="font-bold text-blue-700 text-lg leading-tight">
							{stats.attendanceRate}%
						</p>
					</div>
				</div>

				{/* Progress */}
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
						<TrendingUp className="h-5 w-5 text-emerald-600" />
					</div>
					<div className="min-w-0">
						<p className="text-muted-foreground text-xs">Course Progress</p>
						<div className="flex items-baseline gap-1">
							<span className="font-bold text-emerald-700 text-lg leading-tight">
								{stats.completedClasses}
							</span>
							<span className="text-muted-foreground text-xs">
								/ {stats.totalClasses} classes
							</span>
						</div>
					</div>
				</div>

				{/* Current Level */}
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
						<BookOpen className="h-5 w-5 text-amber-600" />
					</div>
					<div className="min-w-0">
						<p className="text-muted-foreground text-xs">Current Level</p>
						<p className="font-bold text-amber-700 text-lg leading-tight">
							{stats.currentLevel}
						</p>
					</div>
				</div>

				{/* Upcoming */}
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
						<Calendar className="h-5 w-5 text-secondary" />
					</div>
					<div className="min-w-0">
						<p className="text-muted-foreground text-xs">This Week</p>
						<div className="flex items-baseline gap-1">
							<span className="font-bold text-lg text-secondary leading-tight">
								{stats.upcomingClasses}
							</span>
							<span className="text-muted-foreground text-xs">classes</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
