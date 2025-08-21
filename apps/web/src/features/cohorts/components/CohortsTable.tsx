import { useState } from "react";
import { useRouter } from "next/navigation";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
	ChevronRight, 
	ChevronDown, 
	Calendar,
	Clock,
	Users,
	MapPin,
	Eye,
	MoreHorizontal,
	Edit
} from "lucide-react";
import type { Cohort, WeeklySession, CohortStatus, RoomType } from "../schemas/cohort.schema";
import { format } from "date-fns";

interface CohortsTableProps {
	cohorts: Cohort[];
	isLoading: boolean;
	hideWrapper?: boolean;
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
	const [openCohorts, setOpenCohorts] = useState<Set<string>>(new Set());

	const toggleCohort = (cohortId: string) => {
		const newOpen = new Set(openCohorts);
		if (newOpen.has(cohortId)) {
			newOpen.delete(cohortId);
		} else {
			newOpen.add(cohortId);
		}
		setOpenCohorts(newOpen);
	};

	const tableContent = (
		<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-8"></TableHead>
						<TableHead>Cohort</TableHead>
						<TableHead>Level Progress</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Room Type</TableHead>
						<TableHead>Start Date</TableHead>
						<TableHead className="w-[50px]"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading ? (
						// Loading skeletons
						Array.from({ length: 5 }).map((_, i) => (
							<TableRow key={i}>
								<TableCell><Skeleton className="h-4 w-4" /></TableCell>
								<TableCell><Skeleton className="h-4 w-32" /></TableCell>
								<TableCell><Skeleton className="h-4 w-24" /></TableCell>
								<TableCell><Skeleton className="h-4 w-20" /></TableCell>
								<TableCell><Skeleton className="h-4 w-16" /></TableCell>
								<TableCell><Skeleton className="h-4 w-20" /></TableCell>
								<TableCell><Skeleton className="h-4 w-4" /></TableCell>
							</TableRow>
						))
					) : cohorts.length === 0 ? (
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
						// Data rows with simple toggle logic
						cohorts.flatMap((cohort) => {
							const isOpen = openCohorts.has(cohort.id);
							
							const rows = [
								// Main cohort row
								<TableRow key={cohort.id} className="hover:bg-muted/30">
									<TableCell>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 p-0"
											onClick={() => toggleCohort(cohort.id)}
										>
											{isOpen ? (
												<ChevronDown className="h-4 w-4 text-muted-foreground" />
											) : (
												<ChevronRight className="h-4 w-4 text-muted-foreground" />
											)}
										</Button>
									</TableCell>
									<TableCell className="font-medium">
										{cohort.format.charAt(0).toUpperCase() + cohort.format.slice(1)} Cohort
									</TableCell>
									<TableCell>
										<span className="text-sm">
											{formatLevel(cohort.starting_level)} → {formatLevel(cohort.current_level)}
										</span>
									</TableCell>
									<TableCell>
										<Badge variant={getStatusVariant(cohort.cohort_status)} className="text-xs">
											{formatStatus(cohort.cohort_status)}
										</Badge>
									</TableCell>
									<TableCell>
										{cohort.room_type && (
											<Badge variant={getRoomTypeVariant(cohort.room_type)} className="text-xs">
												<MapPin className="mr-1 h-3 w-3" />
												{cohort.room_type.replace("for_one_to_one", "1-on-1").replace("_", " ")}
											</Badge>
										)}
									</TableCell>
									<TableCell>
										{cohort.start_date ? (
											<span className="text-sm">
												{format(new Date(cohort.start_date), "MMM d, yyyy")}
											</span>
										) : (
											"-"
										)}
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="h-8 w-8">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => router.push(`/admin/classes/${cohort.id}`)}
												>
													<Eye className="mr-2 h-4 w-4" />
													View
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => router.push(`/admin/classes/${cohort.id}/edit`)}
												>
													<Edit className="mr-2 h-4 w-4" />
													Edit
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							];
							
							// Add sessions row if expanded
							if (isOpen) {
								rows.push(
									<TableRow key={`${cohort.id}-sessions`} className="hover:bg-transparent">
										<TableCell colSpan={7} className="p-0 border-t-0">
											<div className="bg-muted/20 px-6 py-4 border-l-4 border-l-primary/20">
												<div className="mb-3 text-sm font-medium text-muted-foreground">
													Weekly Sessions
												</div>
												
												{/* Mock weekly sessions - will be replaced with real data */}
												<div className="space-y-2">
													<div className="flex items-center justify-between bg-background/80 border rounded-lg p-3">
														<div className="flex items-center gap-3">
															<Clock className="h-4 w-4 text-muted-foreground" />
															<span className="font-medium text-sm">Monday 10:00-11:30</span>
															<Badge variant="outline" className="text-xs">
																Online
															</Badge>
														</div>
														<Button size="sm" variant="outline" className="h-7 text-xs">
															View Classes
														</Button>
													</div>
													
													<div className="flex items-center justify-between bg-background/80 border rounded-lg p-3">
														<div className="flex items-center gap-3">
															<Clock className="h-4 w-4 text-muted-foreground" />
															<span className="font-medium text-sm">Wednesday 14:00-15:30</span>
															<Badge variant="outline" className="text-xs">
																Online
															</Badge>
														</div>
														<Button size="sm" variant="outline" className="h-7 text-xs">
															View Classes
														</Button>
													</div>
												</div>
											</div>
										</TableCell>
									</TableRow>
								);
							}
							
							return rows;
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