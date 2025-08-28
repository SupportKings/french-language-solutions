"use client";

import { useMemo } from "react";

import { useRouter } from "next/navigation";

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
	RoomType,
} from "@/features/cohorts/schemas/cohort.schema";
import { languageLevelQueries } from "@/features/language-levels/queries/language-levels.queries";
import type { LanguageLevel } from "@/features/language-levels/types/language-level.types";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { Plus, Search, Users } from "lucide-react";
import { useQueryState } from "nuqs";

// Extended cohort type with relationships
interface CohortWithRelations extends Cohort {
	products?: {
		format: string;
	} | null;
	starting_level?: LanguageLevel | null;
	current_level?: LanguageLevel | null;
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
		id: "room_type",
		accessor: (cohort: CohortWithRelations) => cohort.room_type,
		displayName: "Room Type",
		icon: Users,
		type: "option" as const,
		options: [
			{ label: "One-to-One", value: "for_one_to_one" },
			{ label: "Medium", value: "medium" },
			{ label: "Medium+", value: "medium_plus" },
			{ label: "Large", value: "large" },
		],
	},
];

export function ClassesPageClient() {
	console.log("🔥 ClassesPageClient component mounted");
	const router = useRouter();

	// Fetch language levels for filter options
	const { data: languageLevels } = useQuery(languageLevelQueries.list());

	// URL state management for search
	const [search, setSearch] = useQueryState("search", { defaultValue: "" });
	const [pageState, setPageState] = useQueryState("page", {
		parse: (value) => Number.parseInt(value) || 1,
		serialize: (value) => value.toString(),
		defaultValue: 1,
	});
	const page = pageState ?? 1;

	const debouncedSearch = useDebounce(search, 300);

	// Update cohortColumns with language level options
	const dynamicCohortColumns = useMemo(() => {
		const columns = [...cohortColumns];
		const levelColumnIndex = columns.findIndex(
			(col) => col.id === "starting_level_id",
		);
		if (levelColumnIndex !== -1 && languageLevels) {
			columns[levelColumnIndex] = {
				...columns[levelColumnIndex],
				options: languageLevels.map((level: LanguageLevel) => ({
					label: level.display_name || level.code?.toUpperCase() || "Unknown",
					value: level.id,
				})),
			};
		}
		return columns;
	}, [languageLevels]);

	// Data table filters hook
	const { columns, filters, actions, strategy } = useDataTableFilters({
		strategy: "server" as const,
		data: [], // Empty for server-side filtering
		columnsConfig: dynamicCohortColumns,
	});

	// Convert filters to query params - support multiple values
	const filterParams = useMemo(() => {
		const params: Record<string, any> = {};

		console.log("🎯 Active filters:", filters);
		filters.forEach((filter) => {
			if (filter.values.length > 0) {
				// Support multiple values for filters
				if (filter.type === "option") {
					params[filter.columnId] = filter.values;
					console.log(`📌 Filter ${filter.columnId}:`, filter.values);
				}
			}
		});

		console.log("📦 Final filterParams:", params);
		return params;
	}, [filters]);

	// Build query filters - pass arrays for multi-select
	const queryFilters = useMemo(
		() => {
			const query: any = {
				page,
				limit: 20,
			};
			
			// Only add filters if they have values
			if (debouncedSearch) query.search = debouncedSearch;
			if (filterParams.format && filterParams.format.length > 0) {
				query.format = filterParams.format as CohortFormat[];
			}
			if (filterParams.cohort_status && filterParams.cohort_status.length > 0) {
				query.cohort_status = filterParams.cohort_status as CohortStatus[];
			}
			if (filterParams.starting_level_id && filterParams.starting_level_id.length > 0) {
				query.starting_level_id = filterParams.starting_level_id as string[];
			}
			if (filterParams.room_type && filterParams.room_type.length > 0) {
				query.room_type = filterParams.room_type as RoomType[];
			}
			
			console.log("🎯 Final queryFilters:", query);
			return query;
		},
		[debouncedSearch, filterParams, page],
	);

	// Fetch cohorts data
	console.log("🔍 Query filters being sent:", queryFilters);
	const { data, isLoading, error } = useCohorts(queryFilters);
	console.log("📊 Cohorts query result:", { data, isLoading, error });

	const handlePageChange = (newPage: number) => {
		setPageState(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

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
								placeholder="Search cohorts..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="h-9 bg-muted/50 pl-9"
							/>
						</div>

						<div className="ml-auto">
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

					{/* Filter bar */}
					<DataTableFilter
						columns={columns}
						filters={filters}
						actions={actions}
						strategy={strategy}
					/>
				</div>

				{/* Cohorts Table content */}
				<CohortsTable
					cohorts={data?.data || []}
					isLoading={isLoading}
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
