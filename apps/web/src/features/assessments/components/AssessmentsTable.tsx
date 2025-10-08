"use client";

import { useEffect, useMemo, useState } from "react";

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

import { languageLevelQueries } from "@/features/language-levels/queries/language-levels.queries";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { format } from "date-fns";
import {
	Calendar,
	CheckCircle,
	ClipboardCheck,
	DollarSign,
	Edit,
	Eye,
	GraduationCap,
	MoreHorizontal,
	Plus,
	Search,
	Trash,
	User,
	XCircle,
} from "lucide-react";
import { toast } from "sonner";

const resultColors = {
	requested: "info",
	scheduled: "warning",
	session_held: "outline",
	level_determined: "success",
};

const resultLabels = {
	requested: "Requested",
	scheduled: "Scheduled",
	session_held: "Session Held",
	level_determined: "Level Determined",
};

const LANGUAGE_LEVELS = {
	a1: "A1",
	a1_plus: "A1+",
	a2: "A2",
	a2_plus: "A2+",
	b1: "B1",
	b1_plus: "B1+",
	b2: "B2",
	b2_plus: "B2+",
	c1: "C1",
	c1_plus: "C1+",
	c2: "C2",
};

// Define column configurations for data-table-filter
const assessmentColumns = [
	{
		id: "result",
		accessor: (assessment: any) => assessment.result,
		displayName: "Assessment Status",
		icon: ClipboardCheck,
		type: "option" as const,
		options: Object.entries(resultLabels).map(([value, label]) => ({
			label,
			value,
		})),
	},
	{
		id: "level_id",
		accessor: (assessment: any) => assessment.level_id,
		displayName: "Determined Level",
		icon: GraduationCap,
		type: "async_option" as const,
		// We'll need to fetch language levels dynamically
	},
	{
		id: "is_paid",
		accessor: (assessment: any) => assessment.is_paid,
		displayName: "Payment Status",
		icon: DollarSign,
		type: "option" as const,
		options: [
			{ label: "Paid", value: "true" },
			{ label: "Unpaid", value: "false" },
		],
	},
	{
		id: "has_teacher",
		accessor: (assessment: any) => assessment.teacher_id,
		displayName: "Teacher Assignment",
		icon: User,
		type: "option" as const,
		options: [
			{ label: "Assigned", value: "assigned" },
			{ label: "Unassigned", value: "unassigned" },
		],
	},
	{
		id: "scheduled_status",
		accessor: (assessment: any) => assessment.scheduled_for,
		displayName: "Scheduling",
		icon: Calendar,
		type: "option" as const,
		options: [
			{ label: "Scheduled", value: "scheduled" },
			{ label: "Not Scheduled", value: "not_scheduled" },
			{ label: "Overdue", value: "overdue" },
		],
	},
	{
		id: "scheduled_date",
		accessor: (assessment: any) =>
			assessment.scheduled_for ? new Date(assessment.scheduled_for) : null,
		displayName: "Scheduled Date",
		icon: Calendar,
		type: "date" as const,
	},
];

interface AssessmentsTableProps {
	hideTitle?: boolean;
	permissions?: any;
}

export function AssessmentsTable({
	hideTitle = false,
	permissions,
}: AssessmentsTableProps) {
	// Check permissions
	const canAddAssessment = permissions?.assessments?.includes("write");
	const canDeleteAssessment = permissions?.assessments?.includes("write");
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);

	// Fetch language levels for the level filter
	const { data: languageLevels } = useQuery(languageLevelQueries.list());

	// Update level column with dynamic options
	const dynamicAssessmentColumns = useMemo(() => {
		return assessmentColumns.map((column) => {
			if (column.id === "level_id" && languageLevels) {
				return {
					...column,
					type: "option" as const,
					options: languageLevels.map((level) => ({
						label: level.display_name,
						value: level.id,
					})),
				};
			}
			return column;
		});
	}, [languageLevels]);

	// Data table filters hook
	const { columns, filters, actions, strategy } = useDataTableFilters({
		strategy: "server" as const,
		data: [], // Empty for server-side filtering
		columnsConfig: dynamicAssessmentColumns,
	});

	// Convert filters to query params - support multiple values
	const filterQuery = useMemo(() => {
		const resultFilter = filters.find((f) => f.columnId === "result");
		const levelFilter = filters.find((f) => f.columnId === "level_id");
		const paidFilter = filters.find((f) => f.columnId === "is_paid");
		const teacherFilter = filters.find((f) => f.columnId === "has_teacher");
		const scheduledFilter = filters.find(
			(f) => f.columnId === "scheduled_status",
		);
		const dateFilter = filters.find((f) => f.columnId === "scheduled_date");

		return {
			// Pass arrays for multi-select filters
			result: resultFilter?.values?.length ? resultFilter.values : undefined,
			level_id: levelFilter?.values?.length ? levelFilter.values : undefined,
			is_paid:
				paidFilter?.values?.[0] === "true"
					? "true"
					: paidFilter?.values?.[0] === "false"
						? "false"
						: undefined,
			has_teacher: teacherFilter?.values?.length
				? teacherFilter.values
				: undefined,
			scheduled_status: scheduledFilter?.values?.length
				? scheduledFilter.values
				: undefined,
			// Date filter - can be single date or date range
			date_from: dateFilter?.values?.[0]
				? (() => {
						const d = new Date(dateFilter.values[0]);
						const year = d.getFullYear();
						const month = String(d.getMonth() + 1).padStart(2, "0");
						const day = String(d.getDate()).padStart(2, "0");
						return `${year}-${month}-${day}`;
					})()
				: undefined,
			date_to: dateFilter?.values?.[1]
				? (() => {
						const d = new Date(dateFilter.values[1]);
						const year = d.getFullYear();
						const month = String(d.getMonth() + 1).padStart(2, "0");
						const day = String(d.getDate()).padStart(2, "0");
						return `${year}-${month}-${day}`;
					})()
				: undefined,
			date_operator: dateFilter?.operator,
		};
	}, [filters]);

	// Reset page when filters or search change
	useEffect(() => {
		setPage(1);
	}, [filterQuery, debouncedSearch]);

	const { data, isLoading, error } = useQuery({
		queryKey: ["assessments", page, debouncedSearch, filterQuery],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: "20",
				...(debouncedSearch && { search: debouncedSearch }),
				...(filterQuery.is_paid !== undefined && {
					is_paid: filterQuery.is_paid,
				}),
				...(filterQuery.date_from && { date_from: filterQuery.date_from }),
				...(filterQuery.date_to && { date_to: filterQuery.date_to }),
				...(filterQuery.date_operator && {
					date_operator: filterQuery.date_operator,
				}),
			});

			// Add array filters
			if (filterQuery.result) {
				filterQuery.result.forEach((v) => params.append("result", v));
			}
			if (filterQuery.level_id) {
				filterQuery.level_id.forEach((v) => params.append("level_id", v));
			}
			if (filterQuery.has_teacher) {
				filterQuery.has_teacher.forEach((v) => params.append("has_teacher", v));
			}
			if (filterQuery.scheduled_status) {
				filterQuery.scheduled_status.forEach((v) =>
					params.append("scheduled_status", v),
				);
			}

			const response = await fetch(`/api/assessments?${params}`);
			if (!response.ok) throw new Error("Failed to fetch assessments");
			return response.json();
		},
	});

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/assessments/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete assessment");

			toast.success("Assessment deleted successfully");
			// Refetch data
			window.location.reload();
		} catch (error) {
			console.error("Error deleting assessment:", error);
			toast.error("Failed to delete assessment");
		}
	};

	if (error) {
		return (
			<Card>
				<CardContent className="py-10">
					<p className="text-center text-muted-foreground">
						Failed to load assessments
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{/* Table with integrated search, filters and actions */}
			<div className="rounded-md border">
				{/* Combined header with search, filters, and add button */}
				<div className="space-y-2 border-b bg-muted/30 px-4 py-2">
					{/* Search bar and action button */}
					<div className="flex items-center gap-3">
						<div className="relative max-w-sm flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by student name or email..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="h-9 bg-muted/50 pl-9"
							/>
						</div>

						{canAddAssessment && (
							<div className="ml-auto">
								<Link href="/admin/students/assessments/new">
									<Button size="sm" className="h-9">
										<Plus className="mr-1.5 h-4 w-4" />
										New Assessment
									</Button>
								</Link>
							</div>
						)}
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
							<TableHead>Level</TableHead>
							<TableHead>Scheduled</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Payment</TableHead>
							<TableHead>Interview Held By</TableHead>
							<TableHead>Level Determined By</TableHead>
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
										<Skeleton className="h-5 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-12" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-28" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-28" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-8" />
									</TableCell>
								</TableRow>
							))
						) : data?.assessments?.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={8}
									className="text-center text-muted-foreground"
								>
									No assessments found
								</TableCell>
							</TableRow>
						) : (
							data?.assessments?.map((assessment: any) => (
								<TableRow
									key={assessment.id}
									className="cursor-pointer transition-colors hover:bg-muted/50"
									onClick={() =>
										(window.location.href = `/admin/students/assessments/${assessment.id}`)
									}
								>
									<TableCell>
										{assessment.students ? (
											<LinkedRecordBadge
												href={`/admin/students/${assessment.student_id}`}
												label={assessment.students.full_name}
												icon={User}
												title={assessment.students.email || "No email"}
											/>
										) : (
											<span className="text-muted-foreground">No student</span>
										)}
									</TableCell>
									<TableCell>
										{assessment.language_level ? (
											<LinkedRecordBadge
												href={"/admin/configuration/language-levels"}
												label={assessment.language_level.display_name}
												icon={GraduationCap}
											/>
										) : assessment.level ? (
											<Badge variant="outline">
												{assessment.level.toUpperCase()}
											</Badge>
										) : (
											<span className="text-muted-foreground">-</span>
										)}
									</TableCell>
									<TableCell>
										{assessment.scheduled_for ? (
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3 text-muted-foreground" />
												<span className="text-sm">
													{format(
														new Date(assessment.scheduled_for),
														"MMM d, yyyy",
													)}
												</span>
											</div>
										) : (
											<span className="text-muted-foreground">
												Not scheduled
											</span>
										)}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												(resultColors as any)[assessment.result] || "default"
											}
										>
											{(resultLabels as any)[assessment.result] ||
												assessment.result}
										</Badge>
									</TableCell>
									<TableCell>
										{assessment.is_paid ? (
											<Badge
												variant="default"
												className="bg-green-100 text-green-800 hover:bg-green-100"
											>
												Paid
											</Badge>
										) : (
											<Badge
												variant="default"
												className="bg-orange-100 text-orange-800 hover:bg-orange-100"
											>
												Unpaid
											</Badge>
										)}
									</TableCell>
									<TableCell>
										{assessment.interview_held_by ? (
											<LinkedRecordBadge
												href={`/admin/teachers/${assessment.interview_held_by_id}`}
												label={`${assessment.interview_held_by.first_name} ${assessment.interview_held_by.last_name}`.trim()}
												icon={User}
											/>
										) : (
											<span className="text-muted-foreground">-</span>
										)}
									</TableCell>
									<TableCell>
										{assessment.level_checked_by ? (
											<LinkedRecordBadge
												href={`/admin/teachers/${assessment.level_checked_by_id}`}
												label={`${assessment.level_checked_by.first_name} ${assessment.level_checked_by.last_name}`.trim()}
												icon={User}
											/>
										) : (
											<span className="text-muted-foreground">-</span>
										)}
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
													href={`/admin/students/assessments/${assessment.id}`}
												>
													<DropdownMenuItem>
														<Eye className="mr-2 h-4 w-4" />
														View
													</DropdownMenuItem>
												</Link>
												{canDeleteAssessment && (
													<DropdownMenuItem
														onClick={() => handleDelete(assessment.id)}
														className="text-destructive"
													>
														<Trash className="mr-2 h-4 w-4" />
														Delete
													</DropdownMenuItem>
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>

				{data?.pagination && data.pagination.totalPages > 1 && (
					<div className="flex items-center justify-between border-border/50 border-t p-4">
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
