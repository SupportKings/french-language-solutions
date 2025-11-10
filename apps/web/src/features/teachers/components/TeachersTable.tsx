"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";

import {
	DataTableFilter,
	useDataTableFilters,
} from "@/components/data-table-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import {
	Briefcase,
	Calendar,
	CalendarDays,
	Eye,
	MapPin,
	MoreHorizontal,
	Plus,
	Search,
	Shield,
	Trash,
	UserCheck,
	Video,
} from "lucide-react";
import { toast } from "sonner";
import { useDeleteTeacher, useTeachers } from "../queries/teachers.queries";
import type { TeacherQuery } from "../schemas/teacher.schema";

const onboardingStatusColors = {
	new: "info",
	training_in_progress: "warning",
	onboarded: "success",
	offboarded: "destructive",
};

const onboardingStatusLabels = {
	new: "New",
	training_in_progress: "Training",
	onboarded: "Onboarded",
	offboarded: "Offboarded",
};

const contractTypeLabels = {
	full_time: "Full Time",
	freelancer: "Freelancer",
};

// Define column configurations for data-table-filter
const teacherColumns = [
	{
		id: "onboarding_status",
		accessor: (teacher: any) => teacher.onboarding_status,
		displayName: "Onboarding Status",
		icon: UserCheck,
		type: "option" as const,
		options: Object.entries(onboardingStatusLabels).map(([value, label]) => ({
			label,
			value,
		})),
	},
	{
		id: "contract_type",
		accessor: (teacher: any) => teacher.contract_type,
		displayName: "Contract Type",
		icon: Briefcase,
		type: "option" as const,
		options: Object.entries(contractTypeLabels).map(([value, label]) => ({
			label,
			value,
		})),
	},
	{
		id: "available_for_booking",
		accessor: (teacher: any) => teacher.available_for_booking,
		displayName: "Availability",
		icon: Calendar,
		type: "option" as const,
		options: [
			{ label: "Available", value: "true" },
			{ label: "Not Available", value: "false" },
		],
	},
	{
		id: "qualified_for_under_16",
		accessor: (teacher: any) => teacher.qualified_for_under_16,
		displayName: "Under 16 Qualified",
		icon: Shield,
		type: "option" as const,
		options: [
			{ label: "Qualified", value: "true" },
			{ label: "Not Qualified", value: "false" },
		],
	},
	{
		id: "available_for_online_classes",
		accessor: (teacher: any) => teacher.available_for_online_classes,
		displayName: "Online Classes",
		icon: Video,
		type: "option" as const,
		options: [
			{ label: "Available", value: "true" },
			{ label: "Not Available", value: "false" },
		],
	},
	{
		id: "available_for_in_person_classes",
		accessor: (teacher: any) => teacher.available_for_in_person_classes,
		displayName: "In-Person Classes",
		icon: MapPin,
		type: "option" as const,
		options: [
			{ label: "Available", value: "true" },
			{ label: "Not Available", value: "false" },
		],
	},
	{
		id: "days_available_online",
		accessor: (teacher: any) => teacher.days_available_online,
		displayName: "Online Days Available",
		icon: CalendarDays,
		type: "option" as const,
		options: [
			{ label: "Monday", value: "monday" },
			{ label: "Tuesday", value: "tuesday" },
			{ label: "Wednesday", value: "wednesday" },
			{ label: "Thursday", value: "thursday" },
			{ label: "Friday", value: "friday" },
			{ label: "Saturday", value: "saturday" },
			{ label: "Sunday", value: "sunday" },
		],
	},
	{
		id: "days_available_in_person",
		accessor: (teacher: any) => teacher.days_available_in_person,
		displayName: "In-Person Days Available",
		icon: CalendarDays,
		type: "option" as const,
		options: [
			{ label: "Monday", value: "monday" },
			{ label: "Tuesday", value: "tuesday" },
			{ label: "Wednesday", value: "wednesday" },
			{ label: "Thursday", value: "thursday" },
			{ label: "Friday", value: "friday" },
			{ label: "Saturday", value: "saturday" },
			{ label: "Sunday", value: "sunday" },
		],
	},
];

interface TeachersTableProps {
	hideTitle?: boolean;
}

export function TeachersTable({ hideTitle = false }: TeachersTableProps) {
	const router = useRouter();

	// Track if this is the first render to avoid resetting page on initial load
	const isInitialMount = useRef(true);

	// URL state management for pagination and search
	const [pageState, setPageState] = useQueryState("page", {
		parse: (value) => Number.parseInt(value) || 1,
		serialize: (value) => value.toString(),
		defaultValue: 1,
	});
	const page = pageState ?? 1;

	const [searchQuery, setSearchQuery] = useQueryState("search", {
		defaultValue: "",
	});

	// Store filters in URL as JSON
	const [filtersParam, setFiltersParam] = useQueryState("filters", {
		defaultValue: "",
		parse: (value) => value,
		serialize: (value) => value,
	});

	const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const limit = 20;

	// Parse initial filters from URL
	const initialFilters = useMemo(() => {
		if (!filtersParam) return [];
		try {
			const parsed = JSON.parse(decodeURIComponent(filtersParam));
			return parsed;
		} catch {
			return [];
		}
	}, [filtersParam]);

	// Data table filters hook
	const { columns, filters, actions, strategy } = useDataTableFilters({
		strategy: "server" as const,
		data: [], // Empty for server-side filtering
		columnsConfig: teacherColumns,
		defaultFilters: initialFilters,
	});

	// Sync filters to URL whenever they change
	useEffect(() => {
		if (filters.length === 0) {
			setFiltersParam(null);
		} else {
			const serialized = encodeURIComponent(JSON.stringify(filters));
			setFiltersParam(serialized);
		}
	}, [filters, setFiltersParam]);

	// Convert filters to query params - support multiple values
	const filterQuery = useMemo(() => {
		const onboardingFilter = filters.find(
			(f) => f.columnId === "onboarding_status",
		);
		const contractFilter = filters.find((f) => f.columnId === "contract_type");
		const bookingFilter = filters.find(
			(f) => f.columnId === "available_for_booking",
		);
		const under16Filter = filters.find(
			(f) => f.columnId === "qualified_for_under_16",
		);
		const onlineFilter = filters.find(
			(f) => f.columnId === "available_for_online_classes",
		);
		const inPersonFilter = filters.find(
			(f) => f.columnId === "available_for_in_person_classes",
		);
		const onlineDaysFilter = filters.find(
			(f) => f.columnId === "days_available_online",
		);
		const inPersonDaysFilter = filters.find(
			(f) => f.columnId === "days_available_in_person",
		);

		return {
			// Pass arrays for multi-select filters with operators
			onboarding_status: onboardingFilter?.values?.length
				? onboardingFilter.values
				: undefined,
			onboarding_status_operator: onboardingFilter?.operator,
			contract_type: contractFilter?.values?.length
				? contractFilter.values
				: undefined,
			contract_type_operator: contractFilter?.operator,
			available_for_booking:
				bookingFilter?.values?.[0] === "true"
					? true
					: bookingFilter?.values?.[0] === "false"
						? false
						: undefined,
			available_for_booking_operator: bookingFilter?.operator,
			qualified_for_under_16:
				under16Filter?.values?.[0] === "true"
					? true
					: under16Filter?.values?.[0] === "false"
						? false
						: undefined,
			qualified_for_under_16_operator: under16Filter?.operator,
			available_for_online_classes:
				onlineFilter?.values?.[0] === "true"
					? true
					: onlineFilter?.values?.[0] === "false"
						? false
						: undefined,
			available_for_online_classes_operator: onlineFilter?.operator,
			available_for_in_person_classes:
				inPersonFilter?.values?.[0] === "true"
					? true
					: inPersonFilter?.values?.[0] === "false"
						? false
						: undefined,
			available_for_in_person_classes_operator: inPersonFilter?.operator,
			days_available_online: onlineDaysFilter?.values?.length
				? onlineDaysFilter.values
				: undefined,
			days_available_online_operator: onlineDaysFilter?.operator,
			days_available_in_person: inPersonDaysFilter?.values?.length
				? inPersonDaysFilter.values
				: undefined,
			days_available_in_person_operator: inPersonDaysFilter?.operator,
		};
	}, [filters]);

	// Reset page when filters or search change (but not on initial mount)
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}
		setPageState(1);
	}, [filterQuery, searchQuery, setPageState]);

	// Build effective query with URL state and filters
	const effectiveQuery = useMemo(() => ({
		page,
		limit,
		sortBy: "created_at" as const,
		sortOrder: "desc" as const,
		...filterQuery,
		search: searchQuery || undefined,
	}), [page, limit, filterQuery, searchQuery]);

	const { data, isLoading, error } = useTeachers(effectiveQuery);
	const deleteTeacher = useDeleteTeacher();

	const handleDelete = async () => {
		if (!teacherToDelete) return;
		if (isDeleting) return;

		setIsDeleting(true);
		try {
			await deleteTeacher.mutateAsync(teacherToDelete);
			toast.success("Team member deleted successfully");
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to delete team member";
			toast.error(errorMessage);
			console.error("Delete teacher error:", error);
		} finally {
			setIsDeleting(false);
			setTeacherToDelete(null);
		}
	};

	if (error) {
		return (
			<Card>
				<CardContent className="py-10">
					<p className="text-center text-muted-foreground">
						Failed to load team members
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Table with integrated search, filters and actions */}
			<div className="rounded-md border">
				{/* Combined header with search, filters, and add button */}
				<div className="space-y-2 border-b bg-muted/30 px-4 py-2">
					{/* Search bar and action button */}
					<div className="flex items-center gap-3">
						<div className="relative max-w-sm flex-1">
							<Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by name..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="h-9 bg-muted/50 pl-9"
							/>
						</div>

						<div className="ml-auto">
							<Link href="/admin/team-members/new">
								<Button size="sm" className="h-9">
									<Plus className="mr-1.5 h-4 w-4" />
									New Team Member
								</Button>
							</Link>
						</div>
					</div>

					{/* Filter bar */}
					<DataTableFilter
						columns={columns}
						filters={filters}
						actions={actions}
						strategy={strategy}
					/>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Team Member</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Contract</TableHead>
							<TableHead>Active Cohorts</TableHead>
							<TableHead>Availability</TableHead>
							<TableHead>Class Preferences</TableHead>
							<TableHead>Hours</TableHead>
							<TableHead>Student Capacity</TableHead>
							<TableHead className="w-[70px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="h-5 w-32" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-12" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-28" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-8" />
									</TableCell>
								</TableRow>
							))
						) : data?.data?.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={10}
									className="text-center text-muted-foreground"
								>
									No team members found
								</TableCell>
							</TableRow>
						) : (
							data?.data?.map((teacher: any) => (
								<TableRow
									key={teacher.id}
									className="cursor-pointer transition-colors duration-150 hover:bg-muted/50"
									onClick={() =>
										router.push(`/admin/team-members/${teacher.id}`)
									}
								>
									<TableCell>
										<div>
											<p className="font-medium">
												{teacher.first_name} {teacher.last_name}
											</p>
											<p className="text-muted-foreground text-sm">
												{teacher.mobile_phone_number || "No phone"}
											</p>
										</div>
									</TableCell>
									<TableCell>
										{teacher.role && teacher.role.length > 0 ? (
											<div className="flex flex-wrap gap-1">
												{teacher.role.map((r: string) => (
													<Badge key={r} variant="outline" className="text-xs">
														{r}
													</Badge>
												))}
											</div>
										) : (
											<span className="text-muted-foreground text-sm">
												Not set
											</span>
										)}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												(onboardingStatusColors as any)[
													teacher.onboarding_status
												]
											}
										>
											{
												(onboardingStatusLabels as any)[
													teacher.onboarding_status
												]
											}
										</Badge>
									</TableCell>
									<TableCell>
										{teacher.contract_type ? (
											<Badge variant="outline">
												{(contractTypeLabels as any)[teacher.contract_type]}
											</Badge>
										) : (
											<span className="text-muted-foreground">Not set</span>
										)}
									</TableCell>
									<TableCell>
										{teacher.active_cohorts_count > 0 ? (
											<Badge variant="outline" className="text-xs">
												{teacher.active_cohorts_count}{" "}
												{teacher.active_cohorts_count === 1
													? "cohort"
													: "cohorts"}
											</Badge>
										) : (
											<span className="text-muted-foreground text-sm">
												None
											</span>
										)}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											{teacher.available_for_booking ? (
												<Badge variant="success" className="text-xs">
													Available
												</Badge>
											) : (
												<Badge variant="secondary" className="text-xs">
													Unavailable
												</Badge>
											)}
											{teacher.qualified_for_under_16 && (
												<Badge variant="outline" className="text-xs">
													U16 Qualified
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											{teacher.available_for_online_classes && (
												<Badge variant="outline" className="text-xs">
													<Video className="mr-1 h-3 w-3" />
													Online
												</Badge>
											)}
											{teacher.available_for_in_person_classes && (
												<Badge variant="outline" className="text-xs">
													<MapPin className="mr-1 h-3 w-3" />
													In-Person
												</Badge>
											)}
											{!teacher.available_for_online_classes &&
												!teacher.available_for_in_person_classes && (
													<span className="text-muted-foreground text-sm">
														Not specified
													</span>
												)}
										</div>
									</TableCell>
									<TableCell>
										<div className="text-sm">
											{teacher.maximum_hours_per_week ? (
												<>
													<p>{teacher.maximum_hours_per_week}h/week</p>
													{teacher.maximum_hours_per_day && (
														<p className="text-muted-foreground">
															{teacher.maximum_hours_per_day}h/day
														</p>
													)}
												</>
											) : (
												<span className="text-muted-foreground">Not set</span>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="text-sm">
											{teacher.max_students_in_person != null ||
											teacher.max_students_online != null ? (
												<>
													{teacher.max_students_in_person != null && (
														<p>{teacher.max_students_in_person} in-person</p>
													)}
													{teacher.max_students_online != null && (
														<p className="text-muted-foreground">
															{teacher.max_students_online} online
														</p>
													)}
												</>
											) : (
												<span className="text-muted-foreground">Not set</span>
											)}
										</div>
									</TableCell>
									<TableCell onClick={(e) => e.stopPropagation()}>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<Link href={`/admin/team-members/${teacher.id}`}>
													<DropdownMenuItem>
														<Eye className="mr-2 h-4 w-4" />
														View
													</DropdownMenuItem>
												</Link>
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														setTeacherToDelete(teacher.id);
													}}
													className="text-destructive"
												>
													<Trash className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>

				{data && data.meta?.totalPages > 1 && (
					<div className="flex items-center justify-between border-t bg-muted/10 px-4 py-3">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<span className="font-medium text-primary">
								Total: {data.meta.total || 0}
							</span>
							<span>•</span>
							<span>
								Page {data.meta.page} of {data.meta.totalPages}
							</span>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPageState(page - 1)}
								disabled={page === 1}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPageState(page + 1)}
								disabled={page === data.meta.totalPages}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>

			<DeleteConfirmationDialog
				open={!!teacherToDelete}
				onOpenChange={(open) => !open && setTeacherToDelete(null)}
				onConfirm={handleDelete}
				title="Delete Team Member"
				description="Are you sure you want to delete this team member?"
				isDeleting={isDeleting}
			/>
		</div>
	);
}
