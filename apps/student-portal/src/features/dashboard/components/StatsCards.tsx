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
			<Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Attendance</p>
							<p className="font-bold text-2xl">{stats.attendanceRate}%</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<CheckCircle className="h-6 w-6 text-primary" />
						</div>
					</div>
					<Progress value={stats.attendanceRate} className="mt-4 h-1.5" />
				</CardContent>
			</Card>

			{/* Completion Rate */}
			<Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-500/5">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Completion</p>
							<p className="font-bold text-2xl">{stats.completionRate}%</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
							<TrendingUp className="h-6 w-6 text-green-600" />
						</div>
					</div>
					<Progress
						value={stats.completionRate}
						className="mt-4 h-1.5 [&>div]:bg-green-500"
					/>
				</CardContent>
			</Card>

			{/* Current Level */}
			<Card className="border-0 bg-gradient-to-br from-amber-500/10 to-amber-500/5">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Current Level</p>
							<p className="font-bold text-2xl">{stats.currentLevel}</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
							<BookOpen className="h-6 w-6 text-amber-600" />
						</div>
					</div>
					<p className="mt-4 text-muted-foreground text-xs">
						{stats.completedClasses} of {stats.totalClasses} classes completed
					</p>
				</CardContent>
			</Card>

			{/* Upcoming Classes */}
			<Card className="border-0 bg-gradient-to-br from-secondary/10 to-secondary/5">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-muted-foreground text-sm">Upcoming</p>
							<p className="font-bold text-2xl">{stats.upcomingClasses}</p>
						</div>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
							<Calendar className="h-6 w-6 text-secondary" />
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
