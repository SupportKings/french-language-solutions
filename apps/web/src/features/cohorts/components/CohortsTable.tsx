import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkedRecordBadge } from "@/components/ui/linked-record-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { format } from "date-fns";
import { BookOpen, Clock, User, Users } from "lucide-react";
import type {
	Cohort,
	CohortStatus,
	RoomType,
	WeeklySession,
} from "../schemas/cohort.schema";

interface CohortsTableProps {
	cohorts: (Cohort & {
		products?: {
			id: string;
			format: string;
			location: string;
			display_name?: string;
		};
	})[];
	isLoading: boolean;
	hideWrapper?: boolean;
}

interface CohortWithStats extends Cohort {
	activeEnrollments?: number;
	totalEnrollments?: number;
	products?: {
		id: string;
		format: string;
		location: string;
		display_name?: string;
	} | null;
	starting_level?: {
		id: string;
		code: string;
		display_name: string;
	} | null;
	current_level?: {
		id: string;
		code: string;
		display_name: string;
	} | null;
	weekly_sessions?: Array<{
		id: string;
		day_of_week: string;
		start_time: string;
		end_time: string;
		teacher?: {
			id: string;
			first_name: string;
			last_name: string;
		} | null;
	}>;
}

// Status badge variant mapping
const getStatusVariant = (status: CohortStatus) => {
	switch (status) {
		case "enrollment_open":
			return "success";
		case "enrollment_closed":
			return "warning";
		case "class_ended":
			return "secondary";
		default:
			return "outline";
	}
};

// Format status for display
const formatStatus = (status: CohortStatus) => {
	return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

// Format level for display
const formatLevel = (level: any) => {
	if (!level) return "—";
	// Handle new database structure (language level object)
	if (typeof level === "object" && level.display_name) {
		return level.display_name;
	}
	// Handle legacy string format
	if (typeof level === "string") {
		return level.replace("_", "+").toUpperCase();
	}
	return "—";
};

export function CohortsTable({
	cohorts,
	isLoading,
	hideWrapper = false,
}: CohortsTableProps) {
	console.log(
		"📊 CohortsTable received cohorts:",
		cohorts?.length || 0,
		"isLoading:",
		isLoading,
	);
	const router = useRouter();
	const [cohortsWithStats, setCohortsWithStats] = useState<CohortWithStats[]>(
		[],
	);
	const [loadingStats, setLoadingStats] = useState(false);

	// Fetch enrollment stats for each cohort
	useEffect(() => {
		async function fetchEnrollmentStats() {
			if (!cohorts || cohorts.length === 0) {
				// Clear the stats when no cohorts
				setCohortsWithStats([]);
				return;
			}

			setLoadingStats(true);
			try {
				const statsPromises = cohorts.map(async (cohort) => {
					const response = await fetch(
						`/api/enrollments?cohortId=${cohort.id}&limit=100`,
					);
					if (response.ok) {
						const result = await response.json();
						const enrollments = result.enrollments || [];
						const activeEnrollments = enrollments.filter(
							(e: any) =>
								e.status === "paid" || e.status === "welcome_package_sent",
						).length;
						return {
							...cohort,
							activeEnrollments,
							totalEnrollments: enrollments.length,
						};
					}
					return { ...cohort, activeEnrollments: 0, totalEnrollments: 0 };
				});

				const cohortsWithStats = await Promise.all(statsPromises);
				setCohortsWithStats(cohortsWithStats);
			} catch (error) {
				console.error("Error fetching enrollment stats:", error);
				setCohortsWithStats(
					cohorts.map((c) => ({
						...c,
						activeEnrollments: 0,
						totalEnrollments: 0,
					})),
				);
			} finally {
				setLoadingStats(false);
			}
		}

		fetchEnrollmentStats();
	}, [cohorts]);

	// Debug logging for state
	console.log(
		"📈 cohortsWithStats:",
		cohortsWithStats.length,
		"loadingStats:",
		loadingStats,
	);

	const tableContent = (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[200px]">Cohort</TableHead>
					<TableHead>Format</TableHead>
					<TableHead>Location</TableHead>
					<TableHead>Students</TableHead>
					<TableHead>Level Progress</TableHead>
					<TableHead>Weekly Sessions</TableHead>
					<TableHead>Teachers</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Start Date</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{isLoading || loadingStats ? (
					// Loading skeletons
					Array.from({ length: 5 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell>
								<Skeleton className="h-4 w-40" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-16" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
						</TableRow>
					))
				) : cohortsWithStats.length === 0 ? (
					// Empty state
					<TableRow>
						<TableCell colSpan={9} className="py-12 text-center">
							<Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
							<h3 className="mb-2 font-semibold text-lg">No cohorts found</h3>
							<p className="mb-4 text-muted-foreground">
								Create your first cohort to get started.
							</p>
							<Button asChild>
								<Link href="/admin/cohorts/new">New Cohort</Link>
							</Button>
						</TableCell>
					</TableRow>
				) : (
					// Data rows - no expandable functionality
					cohortsWithStats.map((cohort) => {
						const enrollmentCount = cohort.activeEnrollments || 0;
						const maxStudents = cohort.max_students || 0;
						const progressPercentage =
							maxStudents > 0 ? (enrollmentCount / maxStudents) * 100 : 0;

						return (
							<TableRow
								key={cohort.id}
								className="cursor-pointer transition-colors duration-150 hover:bg-muted/50"
								onClick={() => router.push(`/admin/cohorts/${cohort.id}`)}
							>
								<TableCell className="max-w-[200px]">
									<div className="flex h-12 flex-col justify-center gap-1">
										{cohort.nickname ? (
											<>
												<span
													className="truncate font-medium text-sm"
													title={cohort.nickname}
												>
													{cohort.nickname}
												</span>
												<LinkedRecordBadge
													href={
														cohort.products?.id
															? `/admin/configuration/products/${cohort.products.id}`
															: "/admin/configuration/products"
													}
													label={
														cohort.products?.display_name ||
														(cohort.products?.format
															? `${cohort.products.format.charAt(0).toUpperCase() + cohort.products.format.slice(1)} Course`
															: "Product")
													}
													icon={BookOpen}
													className="text-xs"
													title={
														cohort.products?.display_name ||
														(cohort.products?.format
															? `${cohort.products.format.charAt(0).toUpperCase() + cohort.products.format.slice(1)} Course`
															: "Product")
													}
												/>
											</>
										) : (
											<LinkedRecordBadge
												href={
													cohort.products?.id
														? `/admin/configuration/products/${cohort.products.id}`
														: "/admin/configuration/products"
												}
												label={
													cohort.products?.display_name ||
													(cohort.products?.format
														? `${cohort.products.format.charAt(0).toUpperCase() + cohort.products.format.slice(1)} Course`
														: "Product")
												}
												icon={BookOpen}
												className="text-xs"
												title={
													cohort.products?.display_name ||
													(cohort.products?.format
														? `${cohort.products.format.charAt(0).toUpperCase() + cohort.products.format.slice(1)} Course`
														: "Product")
												}
											/>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex h-12 items-center">
										{cohort.products?.format ? (
											<Badge variant="outline" className="w-fit text-xs">
												{cohort.products.format.charAt(0).toUpperCase() +
													cohort.products.format.slice(1)}
											</Badge>
										) : (
											<span className="text-muted-foreground text-sm">—</span>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex h-12 items-center">
										{cohort.products?.location ? (
											<Badge variant="outline" className="w-fit text-xs">
												{cohort.products.location === "in_person"
													? "In-Person"
													: cohort.products.location === "online"
														? "Online"
														: cohort.products.location.charAt(0).toUpperCase() +
															cohort.products.location.slice(1)}
											</Badge>
										) : (
											<span className="text-muted-foreground text-sm">—</span>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex h-12 flex-col justify-center">
										<div className="mb-1 flex items-center gap-2">
											<Users className="h-3.5 w-3.5 text-muted-foreground" />
											<span className="font-medium text-sm">
												{enrollmentCount}
												{maxStudents > 0 ? `/${maxStudents}` : ""}
											</span>
										</div>
										{maxStudents > 0 && (
											<div className="w-20">
												<div className="h-1.5 w-full rounded-full bg-muted">
													<div
														className={cn(
															"h-1.5 rounded-full transition-all",
															progressPercentage > 100
																? "bg-red-500"
																: progressPercentage === 100
																	? "bg-green-500"
																	: "bg-blue-500",
														)}
														style={{
															width: `${Math.min(progressPercentage, 100)}%`,
														}}
													/>
												</div>
											</div>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex h-12 items-center">
										<p className="text-sm">
											{formatLevel(cohort.starting_level)} →{" "}
											{formatLevel(cohort.current_level)}
										</p>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex h-12 flex-col justify-center gap-0.5 overflow-hidden">
										{cohort.weekly_sessions &&
										cohort.weekly_sessions.length > 0 ? (
											cohort.weekly_sessions.slice(0, 2).map((session: any) => (
												<Badge
													key={session.id}
													variant="outline"
													className="w-fit text-xs"
												>
													<Clock className="mr-1 h-3 w-3" />
													{session.day_of_week
														.slice(0, 3)
														.charAt(0)
														.toUpperCase() + session.day_of_week.slice(1, 3)}
													, {session.start_time?.slice(0, 5) || "N/A"}
												</Badge>
											))
										) : (
											<span className="text-muted-foreground text-xs">
												No sessions
											</span>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex h-12 flex-col justify-center gap-0.5 overflow-hidden">
										{cohort.weekly_sessions &&
										cohort.weekly_sessions.length > 0 ? (
											[
												...new Map(
													cohort.weekly_sessions.map((session: any) => [
														session.teacher?.id,
														session.teacher,
													]),
												).values(),
											]
												.filter(Boolean)
												.slice(0, 2)
												.map((teacher: any) => (
													<LinkedRecordBadge
														key={teacher.id}
														href={`/admin/teachers/${teacher.id}`}
														label={
															teacher.first_name && teacher.last_name
																? `${teacher.first_name} ${teacher.last_name}`
																: teacher.first_name ||
																	teacher.last_name ||
																	"Unknown"
														}
														icon={User}
														className="text-xs"
													/>
												))
										) : (
											<span className="text-muted-foreground text-xs">
												No teachers
											</span>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div className="flex h-12 items-center">
										<Badge
											variant={getStatusVariant(cohort.cohort_status)}
											className="text-xs"
										>
											{formatStatus(cohort.cohort_status)}
										</Badge>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex h-12 items-center">
										{cohort.start_date ? (
											<p className="text-sm">
												{formatDate(cohort.start_date, "MMM d, yyyy")}
											</p>
										) : (
											<span className="text-muted-foreground">-</span>
										)}
									</div>
								</TableCell>
							</TableRow>
						);
					})
				)}
			</TableBody>
		</Table>
	);

	if (hideWrapper) {
		return tableContent;
	}

	return <div className="rounded-lg border">{tableContent}</div>;
}
