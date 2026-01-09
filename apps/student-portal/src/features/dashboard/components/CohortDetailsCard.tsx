"use client";

import { BookOpen, FolderOpen, TrendingUp } from "lucide-react";
import { format } from "date-fns";

import { Progress } from "@/components/ui/progress";
import { cn, getGoogleDriveUrl } from "@/lib/utils";

import type { CohortDetails } from "../queries/getCohortDetails";

interface CohortDetailsCardProps {
	details: CohortDetails;
}

const enrollmentStatusConfig = {
	paid: {
		label: "Active",
		bgColor: "bg-emerald-500/10",
		textColor: "text-emerald-600 dark:text-emerald-400",
	},
	welcome_package_sent: {
		label: "Active",
		bgColor: "bg-emerald-500/10",
		textColor: "text-emerald-600 dark:text-emerald-400",
	},
	transitioning: {
		label: "In Transition",
		bgColor: "bg-amber-500/10",
		textColor: "text-amber-600 dark:text-amber-400",
	},
	offboarding: {
		label: "Offboarding",
		bgColor: "bg-blue-500/10",
		textColor: "text-blue-600 dark:text-blue-400",
	},
};

export function CohortDetailsCard({ details }: CohortDetailsCardProps) {
	const { cohort, stats, enrollmentStatus, goalLevel, nextMajorLevel } = details;

	const statusConfig =
		enrollmentStatusConfig[
			enrollmentStatus as keyof typeof enrollmentStatusConfig
		] || enrollmentStatusConfig.paid;

	const formattedStartDate = cohort.startDate
		? format(new Date(cohort.startDate), "MMM yyyy")
		: "Not set";

	const hasProgressed =
		cohort.startingLevel &&
		cohort.currentLevel &&
		cohort.startingLevel.code !== cohort.currentLevel.code &&
		cohort.startingLevel !== null;

	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
			{/* Main Card - Cohort Info */}
			<div
				className={cn(
					"group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-all duration-300 will-change-transform hover:-translate-y-0.5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)] md:col-span-2",
				)}
			>
				{/* Dot pattern background on hover */}
				<div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:4px_4px] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
				</div>

				<div className="relative flex flex-col space-y-3">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 transition-all duration-300">
								<BookOpen className="h-4 w-4 text-white" />
							</div>
							<span
								className={cn(
									"rounded-lg px-2 py-1 text-xs font-medium backdrop-blur-sm transition-colors duration-300",
									statusConfig.bgColor,
									statusConfig.textColor,
								)}
							>
								{statusConfig.label}
							</span>
						</div>
						<div className="flex items-center gap-3">
							{cohort.googleDriveFolderId && (
								<a
									href={getGoogleDriveUrl(cohort.googleDriveFolderId) || "#"}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-all duration-200 hover:border-blue-300 hover:bg-blue-100 hover:shadow-sm dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:border-blue-700 dark:hover:bg-blue-900/50"
									onClick={(e) => e.stopPropagation()}
								>
									<FolderOpen className="h-4 w-4" />
									Class Materials
								</a>
							)}
							<div className="text-right">
								<div className="font-bold text-2xl text-primary">
									{cohort.currentLevel?.displayName || "-"}
								</div>
							</div>
						</div>
					</div>

					{/* Content */}
					<div className="space-y-2">
						<h3 className="font-medium text-lg tracking-tight text-foreground">
						{cohort.product?.format &&
									cohort.product.format.charAt(0).toUpperCase() +
										cohort.product.format.slice(1)} Class
								{cohort.product?.format && cohort.product?.location && " • "}
								{cohort.product?.location &&
									cohort.product.location.charAt(0).toUpperCase() +
										cohort.product.location.slice(1).replace("_", " ")}
						
						</h3>

						{/* Progress towards next major level */}
						<div className="space-y-1.5">
							{cohort.currentLevel?.levelGroup === "c2" ? (
								<div className="rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
									<p className="text-sm text-emerald-600 dark:text-emerald-400 text-center">
										Congratulations! You've reached the highest level.
									</p>
								</div>
							) : nextMajorLevel && stats.totalHoursToNextLevel > 0 ? (
								<>
									<div className="flex items-baseline justify-between">
										<span className="text-sm leading-snug text-muted-foreground">
											Progress to {nextMajorLevel.levelGroup.toUpperCase()}
										</span>
										<span className="text-sm font-semibold text-primary">
											{stats.progressPercentage}%
										</span>
									</div>
									<Progress value={stats.progressPercentage} className="h-1.5" />
								</>
							) : null}
						</div>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between pt-1">
						<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
							<span className="rounded-md bg-muted/50 px-2 py-1 backdrop-blur-sm transition-all duration-200 hover:bg-muted">
								Started {formattedStartDate}
							</span>
							{hasProgressed && (
								<span className="rounded-md bg-muted/50 px-2 py-1 backdrop-blur-sm transition-all duration-200 hover:bg-muted">
									From {cohort.startingLevel?.displayName}
								</span>
							)}
							{goalLevel && (
								<span className="rounded-md bg-primary/10 px-2 py-1 font-medium text-primary backdrop-blur-sm transition-all duration-200 hover:bg-primary/20">
									Goal: {goalLevel.displayName}
								</span>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Attendance Card */}
			<div
				className={cn(
					"group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-all duration-300 will-change-transform hover:-translate-y-0.5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]",
				)}
			>
				{/* Dot pattern background on hover */}
				<div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:4px_4px] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
				</div>

				<div className="relative flex flex-col space-y-3">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 transition-all duration-300">
							<TrendingUp className="h-4 w-4 text-emerald-600" />
						</div>
						<span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 backdrop-blur-sm dark:text-emerald-400">
							Attendance
						</span>
					</div>

					{/* Content */}
					<div className="space-y-1">
						<div className="font-bold text-3xl text-emerald-600 dark:text-emerald-400">
							{stats.attendancePercentage}%
						</div>
						<p className="text-sm leading-snug text-muted-foreground">
							{stats.attendedCount} of {stats.totalAttendance} classes attended
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
