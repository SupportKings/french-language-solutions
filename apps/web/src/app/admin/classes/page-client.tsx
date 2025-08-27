"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users } from "lucide-react";
import { useDebounce } from "@uidotdev/usehooks";
import { DataTableFilter, useDataTableFilters } from "@/components/data-table-filter";
import { CohortsTable } from "@/features/cohorts/components/CohortsTable";
import { useCohorts } from "@/features/cohorts/queries/cohorts.queries";
import type { Cohort, CohortFormat, CohortStatus, LanguageLevel, RoomType } from "@/features/cohorts/schemas/cohort.schema";

// Define column configurations for data-table-filter
const cohortColumns = [
	{
		id: "format",
		accessor: (cohort: Cohort) => cohort.format,
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
		accessor: (cohort: Cohort) => cohort.cohort_status,
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
		id: "starting_level",
		accessor: (cohort: Cohort) => cohort.starting_level,
		displayName: "Starting Level",
		icon: Users,
		type: "option" as const,
		options: [
			{ label: "A1", value: "a1" },
			{ label: "A1+", value: "a1_plus" },
			{ label: "A2", value: "a2" },
			{ label: "A2+", value: "a2_plus" },
			{ label: "B1", value: "b1" },
			{ label: "B1+", value: "b1_plus" },
			{ label: "B2", value: "b2" },
			{ label: "B2+", value: "b2_plus" },
			{ label: "C1", value: "c1" },
			{ label: "C1+", value: "c1_plus" },
			{ label: "C2", value: "c2" },
		],
	},
	{
		id: "room_type",
		accessor: (cohort: Cohort) => cohort.room_type,
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
] as const;

export function ClassesPageClient() {
	console.log("🔥 ClassesPageClient component mounted");
	const router = useRouter();
	
	// URL state management for search
	const [search, setSearch] = useQueryState("search", { defaultValue: "" });
	const [page, setPage] = useQueryState("page", {
		parse: (value) => parseInt(value) || 1,
		serialize: (value) => value.toString(),
	});

	const debouncedSearch = useDebounce(search, 300);

	// Data table filters hook
	const {
		columns,
		filters,
		actions,
		strategy,
	} = useDataTableFilters({
		strategy: "server" as const,
		data: [], // Empty for server-side filtering
		columnsConfig: cohortColumns,
	});

	// Convert filters to query params - support multiple values
	const filterParams = useMemo(() => {
		const params: Record<string, any> = {};
		
		filters.forEach((filter) => {
			if (filter.values.length > 0) {
				// Support multiple values for filters
				if (filter.type === "option") {
					params[filter.columnId] = filter.values;
				}
			}
		});
		
		return params;
	}, [filters]);

	// Build query filters - pass arrays for multi-select
	const queryFilters = useMemo(() => ({
		search: debouncedSearch || undefined,
		format: filterParams.format as CohortFormat[] | undefined,
		cohort_status: filterParams.cohort_status as CohortStatus[] | undefined,
		starting_level: filterParams.starting_level as LanguageLevel[] | undefined,
		room_type: filterParams.room_type as RoomType[] | undefined,
		page,
		limit: 20,
	}), [debouncedSearch, filterParams, page]);

	// Fetch cohorts data
	console.log("🔍 Query filters being sent:", queryFilters);
	const { data, isLoading, error } = useCohorts(queryFilters);
	console.log("📊 Cohorts query result:", { data, isLoading, error });

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="space-y-6">
			{/* Table with integrated search, filters and actions */}
			<div className="rounded-md border">
				{/* Combined header with search, filters, and add button */}
				<div className="border-b bg-muted/30 px-4 py-2 space-y-2">
					{/* Search bar and action button */}
					<div className="flex items-center gap-3">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
							<Input
								placeholder="Search cohorts..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="h-9 pl-9 bg-muted/50"
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
				<div className="flex items-center justify-between rounded-xl border bg-card/50 backdrop-blur-sm px-6 py-4">
					<p className="text-sm text-muted-foreground">
						Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.meta.total)} of {data.meta.total} cohorts
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
							{Array.from({ length: Math.min(5, data.meta.totalPages) }, (_, i) => {
								const pageNum = i + 1;
								return (
									<Button
										key={pageNum}
										variant={pageNum === page ? "default" : "outline"}
										size="sm"
										onClick={() => handlePageChange(pageNum)}
										className="w-9 h-9"
									>
										{pageNum}
									</Button>
								);
							})}
							{data.meta.totalPages > 5 && (
								<>
									<span className="px-2 text-muted-foreground">...</span>
									<Button
										variant={page === data.meta.totalPages ? "default" : "outline"}
										size="sm"
										onClick={() => handlePageChange(data.meta.totalPages)}
										className="w-9 h-9"
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