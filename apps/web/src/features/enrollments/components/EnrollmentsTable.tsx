"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { getApiUrl } from "@/lib/api-utils";

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
import { useDebounce } from "@uidotdev/usehooks";
import { format } from "date-fns";
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
	Users,
} from "lucide-react";
import { toast } from "sonner";

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
};

// Function to get column configurations - needs products for options
const getEnrollmentColumns = (products: any[]) => [
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
		id: "created_at",
		accessor: (enrollment: any) => enrollment.created_at,
		displayName: "Created Date",
		icon: CalendarDays,
		type: "date" as const,
	},
];

interface EnrollmentsTableProps {
	hideTitle?: boolean;
}

export function EnrollmentsTable({ hideTitle = false }: EnrollmentsTableProps) {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [products, setProducts] = useState<any[]>([]);
	const debouncedSearch = useDebounce(search, 300);
	const limit = 20;

	// Fetch products for filter options
	useEffect(() => {
		const controller = new AbortController();

		async function fetchProducts() {
			try {
				const response = await fetch(getApiUrl("/api/products?limit=100"), {
					signal: controller.signal,
				});

				if (response.ok) {
					const result = await response.json();
					// Only update state if the fetch wasn't aborted
					if (!controller.signal.aborted) {
						setProducts(result.data || []);
					}
				}
			} catch (error) {
				// Only log error if it's not an abort error
				if (error instanceof Error && error.name !== "AbortError") {
					console.error("Error fetching products:", error);
				}
			}
		}

		fetchProducts();

		// Cleanup function to abort fetch on unmount
		return () => {
			controller.abort();
		};
	}, []);

	// Data table filters hook - use dynamic columns with products
	const { columns, filters, actions, strategy } = useDataTableFilters({
		strategy: "server" as const,
		data: [], // Empty for server-side filtering
		columnsConfig: getEnrollmentColumns(products),
	});

	// Convert filters to query params
	const filterQuery = useMemo(() => {
		const statusFilter = filters.find((f) => f.columnId === "status");
		const productFilter = filters.find((f) => f.columnId === "product");
		const dateFilter = filters.find((f) => f.columnId === "created_at");

		// Date filter values are stored as [from, to] for ranges or [date] for single dates
		const dateValues = dateFilter?.values || [];
		let dateFrom = "";
		let dateTo = "";

		if (dateValues.length > 0 && dateValues[0]) {
			// Create date and set to start of day (00:00:00.000)
			const fromDate = new Date(dateValues[0]);
			fromDate.setHours(0, 0, 0, 0);
			dateFrom = fromDate.toISOString();
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
			status: statusFilter?.values || [],
			productIds: productFilter?.values || [],
			dateFrom,
			dateTo,
		};
	}, [filters]);

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
	}, [filters, debouncedSearch]);

	const { data, isLoading, error } = useQuery({
		queryKey: ["enrollments", page, limit, debouncedSearch, filterQuery],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
				sortBy: "created_at",
				sortOrder: "desc",
			});

			// Add search if present
			if (debouncedSearch) {
				params.append("search", debouncedSearch);
			}

			// Add product filters (multiple values)
			if (filterQuery.productIds && filterQuery.productIds.length > 0) {
				filterQuery.productIds.forEach((id) => params.append("productId", id));
			}

			// Add status filters (multiple values)
			if (filterQuery.status && filterQuery.status.length > 0) {
				filterQuery.status.forEach((s) => params.append("status", s));
			}

			// Add date filters
			if (filterQuery.dateFrom) {
				params.append("dateFrom", filterQuery.dateFrom);
			}
			if (filterQuery.dateTo) {
				params.append("dateTo", filterQuery.dateTo);
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
								value={search}
								onChange={(e) => setSearch(e.target.value)}
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
							<TableHead>Cohort</TableHead>
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
									colSpan={5}
									className="text-center text-muted-foreground"
								>
									No enrollments found
								</TableCell>
							</TableRow>
						) : (
							data?.enrollments?.map((enrollment: any) => (
								<TableRow
									key={enrollment.id}
									className="transition-colors duration-150 hover:bg-muted/50"
								>
									<TableCell>
										<Link
											href={`/admin/students/${enrollment.student_id}`}
											className="hover:underline"
										>
											<div>
												<p className="font-medium">
													{enrollment.students?.full_name}
												</p>
												<p className="text-muted-foreground text-sm">
													{enrollment.students?.email || "No email"}
												</p>
											</div>
										</Link>
									</TableCell>
									<TableCell>
										<div className="space-y-1">
											{/* Product Name with Level Progression */}
											<div className="font-medium">
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
										<Badge variant={(statusColors as any)[enrollment.status]}>
											{(statusLabels as any)[enrollment.status]}
										</Badge>
									</TableCell>
									<TableCell>
										<p className="text-sm">
											{format(new Date(enrollment.created_at), "MMM d, yyyy")}
										</p>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<Link
													href={`/admin/students/enrollments/${enrollment.id}`}
												>
													<DropdownMenuItem>
														<Eye className="mr-2 h-4 w-4" />
														View
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
								onClick={() => setPage(page - 1)}
								disabled={page === 1}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(page + 1)}
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
