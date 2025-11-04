"use client";

import { useEffect, useMemo, useRef } from "react";

import { useRouter } from "next/navigation";

import { parseDateString } from "@/lib/date-utils";

import {
	DataTableFilter,
	useDataTableFilters,
} from "@/components/data-table-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { CohortsTable } from "@/features/cohorts/components/CohortsTable";
import { useCohorts } from "@/features/cohorts/queries/cohorts.queries";
import type {
	Cohort,
	CohortFormat,
	CohortStatus,
} from "@/features/cohorts/schemas/cohort.schema";
import { languageLevelQueries } from "@/features/language-levels/queries/language-levels.queries";
import type { LanguageLevel } from "@/features/language-levels/types/language-level.types";
import { teachersQueries } from "@/features/teachers/queries/teachers.queries";
import type { Teacher } from "@/features/teachers/schemas/teacher.schema";

import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Plus, Search, Users } from "lucide-react";
import { useQueryState } from "nuqs";

// Extended cohort type with relationships
interface CohortWithRelations extends Cohort {
	products?: {
		format: string;
		location: string;
	} | null;
	starting_level?: LanguageLevel | null;
	current_level?: LanguageLevel | null;
	weekly_sessions?: Array<{
		teacher?: {
			id: string;
			first_name: string;
			last_name: string;
		} | null;
	}> | null;
}

// Define column configurations for data-table-filter
const cohortColumns = [
	{
		id: "format",
		accessor: (cohort: CohortWithRelations) => cohort.products?.format,
		displayName: "Format",
		icon: Users,
		type: "option" as const,
		options: [
			{ label: "Group", value: "group" },
			{ label: "Private", value: "private" },
		],
	},
	{
		id: "location",
		accessor: (cohort: CohortWithRelations) => cohort.products?.location,
		displayName: "Location",
		icon: Users,
		type: "option" as const,
		options: [
			{ label: "Online", value: "online" },
			{ label: "In-Person", value: "in_person" },
		],
	},
	{
		id: "cohort_status",
		accessor: (cohort: CohortWithRelations) => cohort.cohort_status,
		displayName: "Status",
		icon: Users,
		type: "option" as const,
		options: [
			{ label: "Enrollment Open", value: "enrollment_open" },
			{ label: "Enrollment Closed", value: "enrollment_closed" },
			{ label: "Class Ended", value: "class_ended" },
		],
	},
	{
		id: "starting_level_id",
		accessor: (cohort: CohortWithRelations) => cohort.starting_level?.id,
		displayName: "Starting Level",
		icon: Users,
		type: "option" as const,
		options: [], // Will be populated dynamically
	},
	{
		id: "current_level_id",
		accessor: (cohort: CohortWithRelations) => cohort.current_level?.id,
		displayName: "Current Level",
		icon: Users,
		type: "option" as const,
		options: [], // Will be populated dynamically
	},
	{
		id: "teacher_ids",
		accessor: (cohort: CohortWithRelations) => {
			// Extract unique teacher IDs from weekly sessions - return first teacher for display
			const teacherIds =
				cohort.weekly_sessions
					?.map((session) => session.teacher?.id)
					.filter((id): id is string => !!id) || [];
			const uniqueTeacherIds = [...new Set(teacherIds)];
			return uniqueTeacherIds.length > 0 ? uniqueTeacherIds[0] : undefined;
		},
		displayName: "Teachers",
		icon: Users,
		type: "option" as const,
		options: [], // Will be populated dynamically
	},
	{
		id: "start_date",
		accessor: (cohort: CohortWithRelations) =>
			cohort.start_date ? parseDateString(cohort.start_date) : undefined,
		displayName: "Start Date",
		icon: Users,
		type: "date" as const,
	},
];

export function ClassesPageClient() {
	console.log("🔥 ClassesPageClient component mounted");
	const router = useRouter();

	// Track if this is the first render to avoid resetting page on initial load
	const isInitialMount = useRef(true);

	// Fetch language levels and teachers for filter options
	const { data: languageLevels } = useQuery(languageLevelQueries.list());
	const { data: teachersData } = useQuery(teachersQueries.list());

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

	const [todaySessionsState, setTodaySessionsState] = useQueryState(
		"today_sessions",
		{
			defaultValue: "",
		},
	);
	const todaySessions = todaySessionsState === "true";

	// Store filters in URL as JSON
	const [filtersParam, setFiltersParam] = useQueryState("filters", {
		defaultValue: "",
		parse: (value) => value,
		serialize: (value) => value,
	});

	// Parse initial filters from URL and convert date strings back to Date objects
	const initialFilters = useMemo(() => {
		if (!filtersParam) return [];
		try {
			const parsed = JSON.parse(decodeURIComponent(filtersParam));
			// Convert date string values back to Date objects
			return parsed.map((filter: any) => {
				if (filter.type === "date" && filter.values) {
					return {
						...filter,
						values: filter.values.map((v: any) => v ? new Date(v) : v),
					};
				}
				return filter;
			});
		} catch {
			return [];
		}
	}, [filtersParam]);

	// Update cohortColumns with language level and teacher options
	const dynamicCohortColumns = useMemo(() => {
		const columns = [...cohortColumns];

		// Update starting level options
		const startingLevelColumnIndex = columns.findIndex(
			(col) => col.id === "starting_level_id",
		);
		if (startingLevelColumnIndex !== -1 && languageLevels) {
			columns[startingLevelColumnIndex] = {
				...columns[startingLevelColumnIndex],
				options: languageLevels.map((level: LanguageLevel) => ({
					label: level.display_name || level.code?.toUpperCase() || "Unknown",
					value: level.id,
				})),
			} as any;
		}

		// Update current level options
		const currentLevelColumnIndex = columns.findIndex(
			(col) => col.id === "current_level_id",
		);
		if (currentLevelColumnIndex !== -1 && languageLevels) {
			columns[currentLevelColumnIndex] = {
				...columns[currentLevelColumnIndex],
				options: languageLevels.map((level: LanguageLevel) => ({
					label: level.display_name || level.code?.toUpperCase() || "Unknown",
					value: level.id,
				})),
			} as any;
		}

		// Update teacher options
		const teacherColumnIndex = columns.findIndex(
			(col) => col.id === "teacher_ids",
		);
		if (teacherColumnIndex !== -1 && teachersData?.data) {
			columns[teacherColumnIndex] = {
				...columns[teacherColumnIndex],
				options: teachersData.data.map((teacher: Teacher) => ({
					label: `${teacher.first_name} ${teacher.last_name}`,
					value: teacher.id,
				})),
			} as any;
		}

		return columns;
	}, [languageLevels, teachersData]);

	// Data table filters hook
	const { columns, filters, actions, strategy } = useDataTableFilters({
		strategy: "server" as const,
		data: [], // Empty for server-side filtering
		columnsConfig: dynamicCohortColumns,
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

	// Convert filters to query params - support multiple values with operators
	const filterParams = useMemo(() => {
		const params: Record<string, any> = {};

		console.log("🎯 Active filters:", filters);
		filters.forEach((filter) => {
			if (filter.values.length > 0) {
				// Support multiple values for filters
				if (filter.type === "option") {
					params[filter.columnId] = filter.values;
					params[`${filter.columnId}_operator`] = filter.operator;
					console.log(
						`📌 Filter ${filter.columnId}:`,
						filter.values,
						"operator:",
						filter.operator,
					);
				} else if (filter.type === "text") {
					// Text filter - use first value as search string
					params[filter.columnId] = filter.values[0] as string;
					console.log(`🔍 Text Filter ${filter.columnId}:`, filter.values[0]);
				} else if (filter.type === "date") {
					// Date filter can be single date or date range
					params[`${filter.columnId}_operator`] = filter.operator;
					if (filter.values.length === 1) {
						// Single date - treat based on operator
						params[`${filter.columnId}_from`] = (
							filter.values[0] as Date
						).toISOString();
					} else if (filter.values.length === 2) {
						// Date range
						params[`${filter.columnId}_from`] = (
							filter.values[0] as Date
						).toISOString();
						params[`${filter.columnId}_to`] = (
							filter.values[1] as Date
						).toISOString();
					}
					console.log(
						`📌 Date Filter ${filter.columnId}:`,
						filter.values,
						"operator:",
						filter.operator,
					);
				}
			}
		});

		console.log("📦 Final filterParams:", params);
		return params;
	}, [filters]);

	// Reset to page 1 when filters change (but not on initial mount)
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}
		setPageState(1);
	}, [filterParams, setPageState]);

	// Build query filters - pass arrays for multi-select
	const queryFilters = useMemo(() => {
		const query: any = {
			page,
			limit: 20,
		};

		// Add search query
		if (searchQuery && searchQuery.length > 0) {
			query.search = searchQuery;
		}

		// Add today sessions filter
		if (todaySessions) {
			query.today_sessions = true;
		}

		// Only add filters if they have values
		if (filterParams.format && filterParams.format.length > 0) {
			query.format = filterParams.format as CohortFormat[];
			query.format_operator = filterParams.format_operator;
		}
		if (filterParams.location && filterParams.location.length > 0) {
			query.location = filterParams.location as string[];
			query.location_operator = filterParams.location_operator;
		}
		if (filterParams.cohort_status && filterParams.cohort_status.length > 0) {
			query.cohort_status = filterParams.cohort_status as CohortStatus[];
			query.cohort_status_operator = filterParams.cohort_status_operator;
		}
		if (
			filterParams.starting_level_id &&
			filterParams.starting_level_id.length > 0
		) {
			query.starting_level_id = filterParams.starting_level_id as string[];
			query.starting_level_id_operator =
				filterParams.starting_level_id_operator;
		}
		if (
			filterParams.current_level_id &&
			filterParams.current_level_id.length > 0
		) {
			query.current_level_id = filterParams.current_level_id as string[];
			query.current_level_id_operator = filterParams.current_level_id_operator;
		}
		if (filterParams.teacher_ids && filterParams.teacher_ids.length > 0) {
			query.teacher_ids = filterParams.teacher_ids as string[];
			query.teacher_ids_operator = filterParams.teacher_ids_operator;
		}
		if (filterParams.start_date_from) {
			query.start_date_from = filterParams.start_date_from;
		}
		if (filterParams.start_date_to) {
			query.start_date_to = filterParams.start_date_to;
		}
		if (filterParams.start_date_operator) {
			query.start_date_operator = filterParams.start_date_operator;
		}

		console.log("🎯 Final queryFilters:", query);
		return query;
	}, [filterParams, page, searchQuery, todaySessions]);

	// Fetch cohorts data
	console.log("🔍 Query filters being sent:", queryFilters);
	const { data, isLoading, isFetching, isPlaceholderData, error } =
		useCohorts(queryFilters);
	console.log("📊 Cohorts query result:", {
		data,
		isLoading,
		isFetching,
		isPlaceholderData,
		error,
	});

	const handlePageChange = (newPage: number) => {
		setPageState(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="space-y-6">
			{/* Table with integrated search, filters and actions */}
			<div className="rounded-md border">
				{/* Combined header with filters and add button */}
				<div className="space-y-2 border-b bg-muted/30 px-4 py-2">
					{/* Search input */}
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Search by nickname..."
							value={searchQuery || ""}
							onChange={(e) => {
								setSearchQuery(e.target.value || null);
								setPageState(1); // Reset to first page on search
							}}
							className="h-9 pl-9"
						/>
					</div>

					{/* Filters and action button */}
					<div className="flex items-center gap-3">
						<div className="flex-1">
							<DataTableFilter
								columns={columns}
								filters={filters}
								actions={actions}
								strategy={strategy}
							/>
						</div>

						<div className="ml-auto flex items-center gap-2">
							<Button
								onClick={() =>
									setTodaySessionsState(todaySessions ? "" : "true")
								}
								size="sm"
								variant={todaySessions ? "default" : "outline"}
								className="h-9"
							>
								<CalendarClock className="mr-1.5 h-4 w-4" />
								Today's Cohorts
							</Button>

							<Button
								onClick={() => router.push("/admin/cohorts/new")}
								size="sm"
								className="h-9"
							>
								<Plus className="mr-1.5 h-4 w-4" />
								New Cohort
							</Button>
						</div>
					</div>
				</div>

				{/* Cohorts Table content */}
				<CohortsTable
					cohorts={data?.data || []}
					isLoading={isLoading && !isPlaceholderData}
					hideWrapper={true}
				/>
			</div>

			{/* Pagination */}
			{data && data.meta.totalPages > 1 && (
				<div className="flex items-center justify-between rounded-xl border bg-card/50 px-6 py-4 backdrop-blur-sm">
					<p className="text-muted-foreground text-sm">
						Showing {(page - 1) * 20 + 1} to{" "}
						{Math.min(page * 20, data.meta.total)} of {data.meta.total} cohorts
					</p>
					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(page - 1)}
							disabled={page === 1}
							className="h-9 px-3"
						>
							Previous
						</Button>
						<div className="flex items-center gap-1">
							{Array.from(
								{ length: Math.min(5, data.meta.totalPages) },
								(_, i) => {
									const pageNum = i + 1;
									return (
										<Button
											key={pageNum}
											variant={pageNum === page ? "default" : "outline"}
											size="sm"
											onClick={() => handlePageChange(pageNum)}
											className="h-9 w-9"
										>
											{pageNum}
										</Button>
									);
								},
							)}
							{data.meta.totalPages > 5 && (
								<>
									<span className="px-2 text-muted-foreground">...</span>
									<Button
										variant={
											page === data.meta.totalPages ? "default" : "outline"
										}
										size="sm"
										onClick={() => handlePageChange(data.meta.totalPages)}
										className="h-9 w-9"
									>
										{data.meta.totalPages}
									</Button>
								</>
							)}
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(page + 1)}
							disabled={page === data.meta.totalPages}
							className="h-9 px-3"
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
