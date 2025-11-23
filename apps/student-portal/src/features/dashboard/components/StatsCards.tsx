"use client";

import { BookOpen, Calendar, CheckCircle, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { mockStudentStats } from "@/features/shared/data/mock-data";

export function StatsCards() {
	const stats = mockStudentStats;

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{/* Attendance Rate */}
			<Card className="bg-gradient-to-br from-blue-500/15 to-blue-500/5 border-blue-200/50 hover:shadow-md transition-shadow">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Attendance</p>
							<p className="font-bold text-2xl text-blue-700">{stats.attendanceRate}%</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/15">
							<CheckCircle className="h-6 w-6 text-blue-600" />
						</div>
					</div>
					<Progress value={stats.attendanceRate} className="mt-4 h-1.5 [&>div]:bg-blue-500" />
				</CardContent>
			</Card>

			{/* Completion Rate */}
			<Card className="bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border-emerald-200/50 hover:shadow-md transition-shadow">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Completion</p>
							<p className="font-bold text-2xl text-emerald-700">{stats.completionRate}%</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15">
							<TrendingUp className="h-6 w-6 text-emerald-600" />
						</div>
					</div>
					<Progress
						value={stats.completionRate}
						className="mt-4 h-1.5 [&>div]:bg-emerald-500"
					/>
				</CardContent>
			</Card>

			{/* Current Level */}
			<Card className="bg-gradient-to-br from-amber-500/15 to-amber-500/5 border-amber-200/50 hover:shadow-md transition-shadow">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Current Level</p>
							<p className="font-bold text-2xl text-amber-700">{stats.currentLevel}</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15">
							<BookOpen className="h-6 w-6 text-amber-600" />
						</div>
					</div>
					<p className="mt-4 text-muted-foreground text-xs">
						{stats.completedClasses} of {stats.totalClasses} classes completed
					</p>
				</CardContent>
			</Card>

			{/* Upcoming Classes */}
			<Card className="bg-gradient-to-br from-rose-500/15 to-rose-500/5 border-rose-200/50 hover:shadow-md transition-shadow">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Upcoming</p>
							<p className="font-bold text-2xl text-rose-700">{stats.upcomingClasses}</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15">
							<Calendar className="h-6 w-6 text-rose-600" />
						</div>
					</div>
					<p className="mt-4 text-muted-foreground text-xs">
						Classes scheduled this week
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
