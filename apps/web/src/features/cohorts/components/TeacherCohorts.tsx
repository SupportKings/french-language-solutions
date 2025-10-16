"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Users, Calendar, BookOpen, Loader2, ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { useCohorts } from "@/features/cohorts/queries/cohorts.queries";
import type { CohortStatus } from "@/features/cohorts/schemas/cohort.schema";
import { formatDate } from "@/lib/date-utils";

interface TeacherCohortsProps {
	teacherId: string;
	teacherName: string;
}

interface CohortWithStats {
	id: string;
	nickname?: string | null;
	cohort_status: CohortStatus;
	start_date?: string | null;
	max_students?: number | null;
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
	activeEnrollments?: number;
	totalEnrollments?: number;
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
	// Handle database structure (language level object)
	if (typeof level === "object" && level.display_name) {
		return level.display_name;
	}
	// Handle legacy string format
	if (typeof level === "string") {
		return level.replace("_", "+").toUpperCase();
	}
	return "—";
};

export function TeacherCohorts({ teacherId, teacherName }: TeacherCohortsProps) {
	const [page, setPage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [cohortsWithStats, setCohortsWithStats] = useState<CohortWithStats[]>([]);
	const [loadingStats, setLoadingStats] = useState(false);
	const limit = 10;

	// Build query params for server-side filtering
	const queryParams: any = {
		page,
		teacher_ids: [teacherId],
		limit,
	};

	// Add status filter if not "all"
	if (statusFilter !== "all") {
		queryParams.cohort_status = [statusFilter as CohortStatus];
	}

	// Fetch cohorts for this teacher with server-side filtering
	const { data, isLoading, isFetching } = useCohorts(queryParams);

	const cohorts = data?.data || [];
	const totalPages = data?.meta?.totalPages || 1;
	const total = data?.meta?.total || 0;

	// Fetch enrollment stats for each cohort
	useEffect(() => {
		async function fetchEnrollmentStats() {
			if (!cohorts || cohorts.length === 0) {
				setCohortsWithStats([]);
				return;
			}

			setLoadingStats(true);
			try {
				const statsPromises = cohorts.map(async (cohort: any) => {
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
					cohorts.map((c: any) => ({
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(cohorts.map((c: any) => c.id))]);

	// Handle status filter change - reset to page 1
	const handleStatusChange = (value: string) => {
		setStatusFilter(value);
		setPage(1);
	};

	// Handle page change
	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				{/* Header with filter */}
				<div className="flex items-center justify-between">
					<div>
						<Skeleton className="h-6 w-40 mb-2" />
						<Skeleton className="h-4 w-60" />
					</div>
					<Skeleton className="h-10 w-[200px]" />
				</div>
				{/* Loading table */}
				<div className="rounded-lg border bg-card">
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
							{Array.from({ length: 3 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell><Skeleton className="h-4 w-40" /></TableCell>
									<TableCell><Skeleton className="h-4 w-20" /></TableCell>
									<TableCell><Skeleton className="h-4 w-20" /></TableCell>
									<TableCell><Skeleton className="h-4 w-24" /></TableCell>
									<TableCell><Skeleton className="h-4 w-20" /></TableCell>
									<TableCell><Skeleton className="h-4 w-24" /></TableCell>
									<TableCell><Skeleton className="h-4 w-24" /></TableCell>
									<TableCell><Skeleton className="h-4 w-16" /></TableCell>
									<TableCell><Skeleton className="h-4 w-20" /></TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header with filter */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-medium text-lg">Assigned Cohorts</h3>
					<p className="text-muted-foreground text-sm">
						{total} cohort{total !== 1 ? "s" : ""} where {teacherName} is assigned
					</p>
				</div>
				<Select value={statusFilter} onValueChange={handleStatusChange}>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="enrollment_open">Enrollment Open</SelectItem>
						<SelectItem value="enrollment_closed">Enrollment Closed</SelectItem>
						<SelectItem value="class_ended">Class Ended</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Cohorts Table - matching main cohorts table exactly */}
			<div className="rounded-lg border bg-card">
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
						{loadingStats ? (
							// Loading stats skeletons
							Array.from({ length: 3 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell><Skeleton className="h-4 w-40" /></TableCell>
									<TableCell><Skeleton className="h-4 w-20" /></TableCell>
									<TableCell><Skeleton className="h-4 w-20" /></TableCell>
									<TableCell><Skeleton className="h-4 w-24" /></TableCell>
									<TableCell><Skeleton className="h-4 w-20" /></TableCell>
									<TableCell><Skeleton className="h-4 w-24" /></TableCell>
									<TableCell><Skeleton className="h-4 w-24" /></TableCell>
									<TableCell><Skeleton className="h-4 w-16" /></TableCell>
									<TableCell><Skeleton className="h-4 w-20" /></TableCell>
								</TableRow>
							))
						) : cohortsWithStats.length === 0 ? (
							<TableRow>
								<TableCell colSpan={9} className="h-32">
									<div className="flex flex-col items-center justify-center text-center">
										<Users className="mb-2 h-8 w-8 text-muted-foreground" />
										<p className="text-muted-foreground text-sm">
											{statusFilter === "all"
												? `${teacherName} is not assigned to any cohorts`
												: `No cohorts found with selected status`}
										</p>
									</div>
								</TableCell>
							</TableRow>
						) : (
							cohortsWithStats.map((cohort) => {
								const enrollmentCount = cohort.activeEnrollments || 0;
								const maxStudents = cohort.max_students || 0;
								const progressPercentage =
									maxStudents > 0 ? (enrollmentCount / maxStudents) * 100 : 0;

								return (
									<TableRow
										key={cohort.id}
										className="cursor-pointer transition-colors duration-150 hover:bg-muted/50"
										onClick={() => window.location.href = `/admin/cohorts/${cohort.id}`}
									>
										{/* Cohort Name & Product */}
										<TableCell className="max-w-[200px]">
											<div className="flex h-12 flex-col justify-center gap-1">
												{cohort.nickname ? (
													<>
														<span className="truncate font-medium text-sm" title={cohort.nickname}>
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
													/>
												)}
											</div>
										</TableCell>

										{/* Format */}
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

										{/* Location */}
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

										{/* Students with Progress Bar */}
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

										{/* Level Progress */}
										<TableCell>
											<div className="flex h-12 items-center">
												<p className="text-sm">
													{formatLevel(cohort.starting_level)} →{" "}
													{formatLevel(cohort.current_level)}
												</p>
											</div>
										</TableCell>

										{/* Weekly Sessions */}
										<TableCell>
											<div className="flex h-12 flex-col justify-center gap-0.5 overflow-hidden">
												{cohort.weekly_sessions &&
												cohort.weekly_sessions.length > 0 ? (
													cohort.weekly_sessions.slice(0, 2).map((session) => (
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

										{/* Teachers */}
										<TableCell>
											<div className="flex h-12 flex-col justify-center gap-0.5 overflow-hidden">
												{cohort.weekly_sessions &&
												cohort.weekly_sessions.length > 0 ? (
													[
														...new Map(
															cohort.weekly_sessions.map((session) => [
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
																href={`/admin/team-members/${teacher.id}`}
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

										{/* Status */}
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

										{/* Start Date */}
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
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
					<p className="text-muted-foreground text-sm">
						Showing {(page - 1) * limit + 1} to{" "}
						{Math.min(page * limit, total)} of {total} cohorts
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(page - 1)}
							disabled={page === 1 || isFetching}
						>
							<ChevronLeft className="h-4 w-4" />
							Previous
						</Button>
						<div className="flex items-center gap-1">
							<span className="text-muted-foreground text-sm">
								Page {page} of {totalPages}
							</span>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(page + 1)}
							disabled={page === totalPages || isFetching}
						>
							Next
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
