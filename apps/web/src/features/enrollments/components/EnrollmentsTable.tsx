"use client";

import { useEffect, useMemo, useRef } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
	DataTableFilter,
	useDataTableFilters,
} from "@/components/data-table-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useQueryState } from "nuqs";
import {
	Building,
	Calendar,
	CalendarDays,
	CheckCircle,
	Edit,
	Eye,
	GraduationCap,
	MoreHorizontal,
	Package,
	Plus,
	Search,
	Trash,
	User,
	Users,
} from "lucide-react";
import { toast } from "sonner";

import { useProducts } from "@/features/products/queries/useProducts";
import { teachersQueries } from "@/features/teachers/queries/teachers.queries";

const statusColors = {
	declined_contract: "destructive",
	dropped_out: "destructive",
	interested: "secondary",
	beginner_form_filled: "warning",
	contract_abandoned: "destructive",
	contract_signed: "info",
	payment_abandoned: "destructive",
	paid: "success",
	welcome_package_sent: "success",
	transitioning: "warning",
	offboarding: "warning",
};

const statusLabels = {
	declined_contract: "Declined",
	dropped_out: "Dropped Out",
	interested: "Interested",
	beginner_form_filled: "Form Filled",
	contract_abandoned: "Contract Abandoned",
	contract_signed: "Contract Signed",
	payment_abandoned: "Payment Abandoned",
	paid: "Paid",
	welcome_package_sent: "Welcome Package Sent",
	transitioning: "Transitioning",
	offboarding: "Offboarding",
};

// Function to get column configurations - needs products and teachers for options
const getEnrollmentColumns = (products: any[], teachers: any[]) => [
	{
		id: "status",
		accessor: (enrollment: any) => enrollment.status,
		displayName: "Enrollment Status",
		icon: CheckCircle,
		type: "option" as const,
		options: Object.entries(statusLabels).map(([value, label]) => ({
			label,
			value,
		})),
	},
	{
		id: "product",
		accessor: (enrollment: any) => enrollment.cohorts?.products?.id,
		displayName: "Product",
		icon: Package,
		type: "option" as const,
		options: products.map((product) => ({
			label: product.display_name,
			value: product.id,
		})),
	},
	{
		id: "cohort_nickname",
		accessor: (enrollment: any) => enrollment.cohorts?.nickname,
		displayName: "Cohort Nickname",
		icon: Users,
		type: "text" as const,
	},
	{
		id: "teacher",
		accessor: (enrollment: any) =>
			enrollment.cohorts?.weekly_sessions
				?.map((s: any) => s.teacher_id)
				.filter(Boolean),
		displayName: "Teacher",
		icon: GraduationCap,
		type: "option" as const,
		options: teachers.map((teacher) => ({
			label: `${teacher.first_name} ${teacher.last_name}`,
			value: teacher.id,
		})),
	},
	{
		id: "created_at",
		accessor: (enrollment: any) =>
			enrollment.airtable_created_at || enrollment.created_at,
		displayName: "Created Date",
		icon: CalendarDays,
		type: "date" as const,
	},
];

interface EnrollmentsTableProps {
	hideTitle?: boolean;
}

export function EnrollmentsTable({ hideTitle = false }: EnrollmentsTableProps) {
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

	const limit = 20;

	// Fetch products for filter options using React Query
	const { data: productsData } = useProducts({
		page: 1,
		limit: 100,
		sortBy: "display_name",
		sortOrder: "asc",
	});

	// Fetch teachers for filter options - only onboarded teachers with Teacher role
	const { data: teachersData } = useQuery(
		teachersQueries.list({
			page: 1,
			limit: 200,
			sortBy: "first_name",
			sortOrder: "asc",
			onboarding_status: ["onboarded"],
			role: ["Teacher"],
		}),
	);

	const products = productsData?.data || [];
	const teachers = teachersData?.data || [];

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

	// Data table filters hook - use dynamic columns with products and teachers
	const { columns, filters, actions, strategy } = useDataTableFilters({
		strategy: "server" as const,
		data: [], // Empty for server-side filtering
		columnsConfig: getEnrollmentColumns(products, teachers),
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

	// Convert filters to query params with operators
	const filterQuery = useMemo(() => {
		const statusFilter = filters.find((f) => f.columnId === "status");
		const productFilter = filters.find((f) => f.columnId === "product");
		const cohortNicknameFilter = filters.find((f) => f.columnId === "cohort_nickname");
		const teacherFilter = filters.find((f) => f.columnId === "teacher");
		const dateFilter = filters.find((f) => f.columnId === "created_at");

		// Date filter values are stored as [from, to] for ranges or [date] for single dates
		const dateValues = dateFilter?.values || [];
		let dateFrom = "";
		let dateTo = "";
		let useAirtableDate = false;

		if (dateValues.length > 0 && dateValues[0]) {
			// Create date and set to start of day (00:00:00.000)
			const fromDate = new Date(dateValues[0]);
			fromDate.setHours(0, 0, 0, 0);
			dateFrom = fromDate.toISOString();
			useAirtableDate = true;
		}

		if (dateValues.length > 1 && dateValues[1]) {
			// Range selected - set end date to end of day (23:59:59.999)
			const toDate = new Date(dateValues[1]);
			toDate.setHours(23, 59, 59, 999);
			dateTo = toDate.toISOString();
		} else if (dateValues.length === 1 && dateValues[0]) {
			// Single date selected - set to end of same day
			const toDate = new Date(dateValues[0]);
			toDate.setHours(23, 59, 59, 999);
			dateTo = toDate.toISOString();
		}

		return {
			status: statusFilter?.values?.length ? statusFilter.values : undefined,
			status_operator: statusFilter?.operator,
			productIds: productFilter?.values?.length ? productFilter.values : undefined,
			productIds_operator: productFilter?.operator,
			cohortNickname: cohortNicknameFilter?.values?.[0] || undefined,
			cohortNickname_operator: cohortNicknameFilter?.operator,
			teacherIds: teacherFilter?.values?.length ? teacherFilter.values : undefined,
			teacherIds_operator: teacherFilter?.operator,
			dateFrom,
			dateTo,
			useAirtableDate,
			created_at_operator: dateFilter?.operator,
		};
	}, [filters]);

	// Reset page when filters or search change (but not on initial mount)
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}
		setPageState(1);
	}, [filters, searchQuery, setPageState]);

	const { data, isLoading, error } = useQuery({
		queryKey: ["enrollments", page, limit, searchQuery, filterQuery],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
				sortBy: "created_at",
				sortOrder: "desc",
			});

			// Add search if present
			if (searchQuery) {
				params.append("search", searchQuery);
			}

			// Add product filters (multiple values) with operator
			if (filterQuery.productIds && filterQuery.productIds.length > 0) {
				filterQuery.productIds.forEach((id) => params.append("productId", id));
				if (filterQuery.productIds_operator) {
					params.append("productIds_operator", filterQuery.productIds_operator);
				}
			}

			// Add status filters (multiple values) with operator
			if (filterQuery.status && filterQuery.status.length > 0) {
				filterQuery.status.forEach((s) => params.append("status", s));
				if (filterQuery.status_operator) {
					params.append("status_operator", filterQuery.status_operator);
				}
			}

			// Add cohort nickname text search with operator
			if (filterQuery.cohortNickname) {
				params.append("cohortNickname", filterQuery.cohortNickname);
				if (filterQuery.cohortNickname_operator) {
					params.append("cohortNickname_operator", filterQuery.cohortNickname_operator);
				}
			}

			// Add teacher filters (multiple values) with operator
			if (filterQuery.teacherIds && filterQuery.teacherIds.length > 0) {
				filterQuery.teacherIds.forEach((id) => params.append("teacherId", id));
				if (filterQuery.teacherIds_operator) {
					params.append("teacherIds_operator", filterQuery.teacherIds_operator);
				}
			}

			// Add date filters with operator
			if (filterQuery.dateFrom) {
				params.append("dateFrom", filterQuery.dateFrom);
				if (filterQuery.useAirtableDate) {
					params.append("useAirtableDate", "true");
				}
			}
			if (filterQuery.dateTo) {
				params.append("dateTo", filterQuery.dateTo);
			}
			if (filterQuery.created_at_operator) {
				params.append("created_at_operator", filterQuery.created_at_operator);
			}

			const response = await fetch(`/api/enrollments?${params}`);
			if (!response.ok) throw new Error("Failed to fetch enrollments");
			return response.json();
		},
	});

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/enrollments/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete enrollment");

			toast.success("Enrollment deleted successfully");
			// Refetch data
			window.location.reload();
		} catch (error) {
			console.error("Error deleting enrollment:", error);
			toast.error("Failed to delete enrollment");
		}
	};

	if (error) {
		return (
			<Card>
				<CardContent className="py-10">
					<p className="text-center text-muted-foreground">
						Failed to load enrollments
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
								placeholder="Search by student name or email..."
								value={searchQuery || ""}
								onChange={(e) => {
									setSearchQuery(e.target.value || null);
									setPageState(1); // Reset to first page on search
								}}
								className="h-9 bg-muted/50 pl-9"
							/>
						</div>

						<div className="ml-auto">
							<Link href="/admin/students/enrollments/new">
								<Button size="sm" className="h-9">
									<Plus className="mr-1.5 h-4 w-4" />
									New Enrollment
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
							<TableHead>Student</TableHead>
							<TableHead>Cohort (Product and Sessions)</TableHead>
							<TableHead>Teachers</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created at</TableHead>
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
										<Skeleton className="h-5 w-24" />
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
										<Skeleton className="h-5 w-8" />
									</TableCell>
								</TableRow>
							))
						) : data?.enrollments?.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center text-muted-foreground"
								>
									No enrollments found
								</TableCell>
							</TableRow>
						) : (
							data?.enrollments?.map((enrollment: any) => (
								<TableRow
									key={enrollment.id}
									className="cursor-pointer transition-colors duration-150 hover:bg-muted/50"
									onClick={() =>
										router.push(`/admin/students/enrollments/${enrollment.id}`)
									}
								>
									<TableCell>
										{enrollment.students ? (
											<LinkedRecordBadge
												href={`/admin/students/${enrollment.student_id}`}
												label={enrollment.students.full_name}
												icon={User}
												title={enrollment.students.email || "No email"}
											/>
										) : (
											<span className="text-muted-foreground">No student</span>
										)}
									</TableCell>
									<TableCell>
										<div className="space-y-1">
											{/* Cohort Name - show nickname if available, otherwise product + level */}
											<div className="font-medium">
												{enrollment.cohorts?.nickname ? (
													<span className="truncate max-w-[250px] inline-block align-bottom" title={enrollment.cohorts.nickname}>
														{enrollment.cohorts.nickname}
													</span>
												) : (
													<>
														{enrollment.cohorts?.products?.display_name || "N/A"}
														{enrollment.cohorts?.starting_level?.code ? (
															<span className="font-normal text-muted-foreground">
																{" "}
																(
																{enrollment.cohorts.starting_level.code.toUpperCase()}
																{enrollment.cohorts?.current_level?.code !==
																	enrollment.cohorts?.starting_level?.code && (
																	<>
																		{" "}
																		→{" "}
																		{enrollment.cohorts.current_level?.code?.toUpperCase()}
																	</>
																)}
																)
															</span>
														) : (
															enrollment.cohorts?.products?.display_name && (
																<span className="font-normal text-muted-foreground">
																	{" "}
																	(N/A)
																</span>
															)
														)}
													</>
												)}
											</div>

											{/* Weekly Sessions */}
											{enrollment.cohorts?.weekly_sessions &&
												enrollment.cohorts.weekly_sessions.length > 0 && (
													<div className="flex flex-wrap gap-1">
														{enrollment.cohorts.weekly_sessions.map(
															(session: any) => {
																const dayMap: Record<string, string> = {
																	monday: "Mon",
																	tuesday: "Tue",
																	wednesday: "Wed",
																	thursday: "Thu",
																	friday: "Fri",
																	saturday: "Sat",
																	sunday: "Sun",
																};
																const dayAbbrev = session.day_of_week
																	? dayMap[session.day_of_week.toLowerCase()] ||
																		session.day_of_week
																	: "";

																return (
																	<Badge
																		key={session.id}
																		variant="secondary"
																		className="text-xs"
																	>
																		{dayAbbrev}{" "}
																		{session.start_time?.slice(0, 5)}
																	</Badge>
																);
															},
														)}
													</div>
												)}
										</div>
									</TableCell>
									<TableCell>
										{enrollment.cohorts?.weekly_sessions &&
										enrollment.cohorts.weekly_sessions.length > 0 ? (
											<div className="flex flex-wrap gap-1">
												{enrollment.cohorts.weekly_sessions
													.map((session: any) => session.teachers)
													.filter(Boolean) // Remove null/undefined
													.filter(
														(teacher: any, index: number, self: any[]) =>
															teacher && self.findIndex((t: any) => t?.id === teacher?.id) === index,
													) // Get unique teachers
													.map((teacher: any) => (
														<LinkedRecordBadge
															key={teacher.id}
															href={`/admin/people/teachers/${teacher.id}`}
															label={`${teacher.first_name} ${teacher.last_name}`}
															icon={GraduationCap}
														/>
													))}
											</div>
										) : (
											<span className="text-muted-foreground text-sm">
												No teachers
											</span>
										)}
									</TableCell>
									<TableCell>
										<Badge variant={(statusColors as any)[enrollment.status]}>
											{(statusLabels as any)[enrollment.status]}
										</Badge>
									</TableCell>
									<TableCell>
										<p className="text-sm">
											{format(
												new Date(
													enrollment.airtable_created_at ||
														enrollment.created_at,
												),
												"MMM d, yyyy",
											)}
										</p>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													onClick={(e) => e.stopPropagation()}
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<Link
													href={`/admin/students/enrollments/${enrollment.id}`}
												>
													<DropdownMenuItem>
														<Eye className="mr-2 h-4 w-4" />
														View Details
													</DropdownMenuItem>
												</Link>
												<DropdownMenuItem
													onClick={() => handleDelete(enrollment.id)}
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

				{data?.pagination && data.pagination.totalPages > 1 && (
					<div className="flex items-center justify-between border-t bg-muted/10 px-4 py-3">
						<p className="text-muted-foreground text-sm">
							Page {data.pagination.page} of {data.pagination.totalPages}
						</p>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setPageState(page - 1);
									window.scrollTo({ top: 0, behavior: "smooth" });
								}}
								disabled={page === 1}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setPageState(page + 1);
									window.scrollTo({ top: 0, behavior: "smooth" });
								}}
								disabled={page === data.pagination.totalPages}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
