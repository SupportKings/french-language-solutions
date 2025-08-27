import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
	Calendar,
	Users,
	MapPin,
	CheckCircle2
} from "lucide-react";
import type { Cohort, WeeklySession, CohortStatus, RoomType } from "../schemas/cohort.schema";
import { format } from "date-fns";

interface CohortsTableProps {
	cohorts: Cohort[];
	isLoading: boolean;
	hideWrapper?: boolean;
}

interface CohortWithStats extends Cohort {
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

// Room type badge variant
const getRoomTypeVariant = (roomType: RoomType) => {
	switch (roomType) {
		case "for_one_to_one":
			return "info";
		case "medium":
			return "default";
		case "medium_plus":
			return "default";
		case "large":
			return "secondary";
		default:
			return "outline";
	}
};

// Format status for display
const formatStatus = (status: CohortStatus) => {
	return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
};

// Format level for display
const formatLevel = (level: string | null) => {
	if (!level) return "—";
	return level.replace("_", "+").toUpperCase();
};

// Format day and time
const formatSessionTime = (session: WeeklySession) => {
	const day = session.day_of_week.charAt(0).toUpperCase() + session.day_of_week.slice(1);
	return `${day} ${session.start_time}-${session.end_time}`;
};

export function CohortsTable({ cohorts, isLoading, hideWrapper = false }: CohortsTableProps) {
	const router = useRouter();
	const [cohortsWithStats, setCohortsWithStats] = useState<CohortWithStats[]>([]);
	const [loadingStats, setLoadingStats] = useState(false);

	// Fetch enrollment stats for each cohort
	useEffect(() => {
		async function fetchEnrollmentStats() {
			if (!cohorts || cohorts.length === 0) return;
			
			setLoadingStats(true);
			try {
				const statsPromises = cohorts.map(async (cohort) => {
					const response = await fetch(`/api/enrollments?cohortId=${cohort.id}&limit=100`);
					if (response.ok) {
						const result = await response.json();
						const enrollments = result.enrollments || [];
						const activeEnrollments = enrollments.filter((e: any) => 
							e.status === 'paid' || e.status === 'welcome_package_sent'
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
				setCohortsWithStats(cohorts.map(c => ({ ...c, activeEnrollments: 0, totalEnrollments: 0 })));
			} finally {
				setLoadingStats(false);
			}
		}
		
		fetchEnrollmentStats();
	}, [cohorts]);

	const tableContent = (
		<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Title</TableHead>
						<TableHead>Format</TableHead>
						<TableHead>Students</TableHead>
						<TableHead>Level Progress</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Start Date</TableHead>
						<TableHead>Setup</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading || loadingStats ? (
						// Loading skeletons
						Array.from({ length: 5 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell><Skeleton className="h-4 w-40" /></TableCell>
								<TableCell><Skeleton className="h-4 w-20" /></TableCell>
								<TableCell><Skeleton className="h-4 w-24" /></TableCell>
								<TableCell><Skeleton className="h-4 w-20" /></TableCell>
								<TableCell><Skeleton className="h-4 w-16" /></TableCell>
								<TableCell><Skeleton className="h-4 w-20" /></TableCell>
							</TableRow>
						))
					) : cohortsWithStats.length === 0 ? (
						// Empty state
						<TableRow>
							<TableCell colSpan={7} className="text-center py-12">
								<Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
								<h3 className="text-lg font-semibold mb-2">No cohorts found</h3>
								<p className="text-muted-foreground mb-4">Create your first cohort to get started.</p>
								<Button onClick={() => router.push("/admin/classes/new")}>
									New Cohort
								</Button>
							</TableCell>
						</TableRow>
					) : (
						// Data rows - no expandable functionality
						cohortsWithStats.map((cohort) => {
							const enrollmentCount = cohort.activeEnrollments || 0;
							
							return (
								<TableRow 
									key={cohort.id} 
									className="hover:bg-muted/50 transition-colors duration-150 cursor-pointer"
									onClick={() => router.push(`/admin/classes/${cohort.id}`)}
								>
									<TableCell>
										<div className="h-12 flex items-center">
											<p className="font-medium">
												{cohort.title || `${cohort.format.charAt(0).toUpperCase() + cohort.format.slice(1)} Cohort`}
											</p>
										</div>
									</TableCell>
									<TableCell>
										<div className="h-12 flex items-center">
											<p className="text-sm">
												{cohort.format.charAt(0).toUpperCase() + cohort.format.slice(1)}
											</p>
										</div>
									</TableCell>
									<TableCell>
										<div className="h-12 flex flex-col justify-center">
											<div className="flex items-center gap-2 mb-1">
												<Users className="h-3.5 w-3.5 text-muted-foreground" />
												<span className="text-sm font-medium">
													{enrollmentCount} enrolled
												</span>
											</div>
											<div className="w-20">
												<div className="w-full bg-muted rounded-full h-1.5">
													<div 
														className="h-1.5 rounded-full transition-all bg-primary"
														style={{ width: enrollmentCount > 0 ? "100%" : "0%" }}
													/>
												</div>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div className="h-12 flex items-center">
											<p className="text-sm">
												{formatLevel(cohort.starting_level)} → {formatLevel(cohort.current_level)}
											</p>
										</div>
									</TableCell>
									<TableCell>
										<div className="h-12 flex items-center">
											<Badge variant={getStatusVariant(cohort.cohort_status)} className="text-xs">
												{formatStatus(cohort.cohort_status)}
											</Badge>
										</div>
									</TableCell>
									<TableCell>
										<div className="h-12 flex items-center">
											{cohort.start_date ? (
												<p className="text-sm">
													{format(new Date(cohort.start_date), "MMM d, yyyy")}
												</p>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="h-12 flex items-center">
											<Badge variant="outline" className="text-xs">
												Setup
											</Badge>
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

	return (
		<div className="rounded-lg border">
			{tableContent}
		</div>
	);
}