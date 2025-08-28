"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

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
	CheckCircle,
	Edit,
	Eye,
	GraduationCap,
	MoreHorizontal,
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

// Define column configurations for data-table-filter
const enrollmentColumns = [
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
		id: "cohort_format",
		accessor: (enrollment: any) => enrollment.cohorts?.products?.format,
		displayName: "Class Format",
		icon: Users,
		type: "option" as const,
		options: [
			{ label: "Group Class", value: "group" },
			{ label: "Private Class", value: "private" },
		],
	},
	{
		id: "cohort_status",
		accessor: (enrollment: any) => enrollment.cohorts?.cohort_status,
		displayName: "Cohort Status",
		icon: Calendar,
		type: "option" as const,
		options: [
			{ label: "Enrollment Open", value: "enrollment_open" },
			{ label: "Enrollment Closed", value: "enrollment_closed" },
			{ label: "Class Ended", value: "class_ended" },
		],
	},
	{
		id: "starting_level",
		accessor: (enrollment: any) => enrollment.cohorts?.starting_level?.code,
		displayName: "Starting Level",
		icon: GraduationCap,
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
		accessor: (enrollment: any) => enrollment.cohorts?.room_type,
		displayName: "Room Type",
		icon: Building,
		type: "option" as const,
		options: [
			{ label: "One-to-One", value: "for_one_to_one" },
			{ label: "Medium", value: "medium" },
			{ label: "Medium+", value: "medium_plus" },
			{ label: "Large", value: "large" },
		],
	},
];

interface EnrollmentsTableProps {
	hideTitle?: boolean;
}

export function EnrollmentsTable({ hideTitle = false }: EnrollmentsTableProps) {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);

	// Data table filters hook
	const { columns, filters, actions, strategy } = useDataTableFilters({
		strategy: "server" as const,
		data: [], // Empty for server-side filtering
		columnsConfig: enrollmentColumns,
	});

	// Convert filters to query params - support multiple values
	const filterQuery = useMemo(() => {
		const statusFilter = filters.find((f) => f.columnId === "status");
		const formatFilter = filters.find((f) => f.columnId === "cohort_format");
		const cohortStatusFilter = filters.find(
			(f) => f.columnId === "cohort_status",
		);
		const levelFilter = filters.find((f) => f.columnId === "starting_level");
		const roomFilter = filters.find((f) => f.columnId === "room_type");

		return {
			// Pass arrays for multi-select filters
			status: statusFilter?.values?.length ? statusFilter.values : undefined,
			cohort_format: formatFilter?.values?.length
				? formatFilter.values
				: undefined,
			cohort_status: cohortStatusFilter?.values?.length
				? cohortStatusFilter.values
				: undefined,
			starting_level: levelFilter?.values?.length
				? levelFilter.values
				: undefined,
			room_type: roomFilter?.values?.length ? roomFilter.values : undefined,
		};
	}, [filters]);

	const { data, isLoading, error } = useQuery({
		queryKey: ["enrollments", page, debouncedSearch, filterQuery],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: "20",
				...(debouncedSearch && { search: debouncedSearch }),
			});

			// Add array filters
			if (filterQuery.status) {
				filterQuery.status.forEach((v) => params.append("status", v));
			}
			if (filterQuery.cohort_format) {
				filterQuery.cohort_format.forEach((v) =>
					params.append("cohort_format", v),
				);
			}
			if (filterQuery.cohort_status) {
				filterQuery.cohort_status.forEach((v) =>
					params.append("cohort_status", v),
				);
			}
			if (filterQuery.starting_level) {
				filterQuery.starting_level.forEach((v) =>
					params.append("starting_level", v),
				);
			}
			if (filterQuery.room_type) {
				filterQuery.room_type.forEach((v) => params.append("room_type", v));
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
							<TableHead>Enrolled</TableHead>
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
										<div>
											<p className="font-medium">
												{enrollment.cohorts?.products?.format || "N/A"} -{" "}
												{enrollment.cohorts?.starting_level?.display_name ||
													enrollment.cohorts?.starting_level?.code?.toUpperCase() ||
													"N/A"}
											</p>
											{enrollment.cohorts?.start_date && (
												<p className="text-muted-foreground text-sm">
													Starts{" "}
													{format(
														new Date(enrollment.cohorts.start_date),
														"MMM d, yyyy",
													)}
												</p>
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
