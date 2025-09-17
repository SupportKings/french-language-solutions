"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

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

import { languageLevelQueries } from "@/features/language-levels/queries/language-levels.queries";

import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { format } from "date-fns";
import {
	Calendar,
	CalendarDays,
	Eye,
	GraduationCap,
	MessageSquare,
	MoreHorizontal,
	Plus,
	Search,
	Trash,
	UserCheck,
	Users,
} from "lucide-react";
import { useDeleteStudent, useStudents } from "../queries/students.queries";
import type { StudentQuery } from "../schemas/student.schema";

// This will be replaced with dynamic data from the database

const ENROLLMENT_STATUS_LABELS = {
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

const ENROLLMENT_STATUS_COLORS = {
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

// Define column configurations for data-table-filter
const studentColumns = [
	{
		id: "enrollment_status",
		accessor: (student: any) => student.enrollment_status,
		displayName: "Enrollment Status",
		icon: UserCheck,
		type: "option" as const,
		options: Object.entries(ENROLLMENT_STATUS_LABELS).map(([value, label]) => ({
			label,
			value,
		})),
	},
	{
		id: "desired_starting_language_level",
		accessor: (student: any) => student.desired_language_level?.id,
		displayName: "Language Level",
		icon: GraduationCap,
		type: "option" as const,
		options: [], // Will be populated dynamically
	},
	{
		id: "initial_channel",
		accessor: (student: any) => student.initial_channel,
		displayName: "Initial Channel",
		icon: Users,
		type: "option" as const,
		options: [
			{ label: "Form", value: "form" },
			{ label: "Quiz", value: "quiz" },
			{ label: "Call", value: "call" },
			{ label: "Message", value: "message" },
			{ label: "Email", value: "email" },
			{ label: "Assessment", value: "assessment" },
		],
	},
	{
		id: "communication_channel",
		accessor: (student: any) => student.communication_channel,
		displayName: "Communication Preference",
		icon: MessageSquare,
		type: "option" as const,
		options: [
			{ label: "SMS & Email", value: "sms_email" },
			{ label: "Email Only", value: "email" },
			{ label: "SMS Only", value: "sms" },
		],
	},
	{
		id: "is_full_beginner",
		accessor: (student: any) => student.is_full_beginner,
		displayName: "Beginner Status",
		icon: UserCheck,
		type: "option" as const,
		options: [
			{ label: "Full Beginner", value: "true" },
			{ label: "Has Experience", value: "false" },
		],
	},
	{
		id: "added_to_email_newsletter",
		accessor: (student: any) => student.added_to_email_newsletter,
		displayName: "Newsletter Status",
		icon: MessageSquare,
		type: "option" as const,
		options: [
			{ label: "Subscribed", value: "true" },
			{ label: "Not Subscribed", value: "false" },
		],
	},
	{
		id: "is_under_16",
		accessor: (student: any) => student.is_under_16,
		displayName: "Age Group",
		icon: Users,
		type: "option" as const,
		options: [
			{ label: "Under 16", value: "true" },
			{ label: "16 and Over", value: "false" },
		],
	},
	{
		id: "created_at",
		accessor: (student: any) =>
			student.airtable_created_at || student.created_at,
		displayName: "Created Date",
		icon: CalendarDays,
		type: "date" as const,
	},
];

interface StudentsTableProps {
	hideTitle?: boolean;
}

export function StudentsTable({ hideTitle = false }: StudentsTableProps) {
	const router = useRouter();

	// Fetch language levels for filter options
	const { data: languageLevels } = useQuery(languageLevelQueries.list());
	const [query, setQuery] = useState<StudentQuery>({
		page: 1,
		limit: 20,
		sortBy: "created_at",
		sortOrder: "desc",
	});
	const [searchInput, setSearchInput] = useState("");
	const debouncedSearch = useDebounce(searchInput, 300);
	const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Build dynamic student columns with language levels
	const dynamicStudentColumns = useMemo(() => {
		const columns = [...studentColumns];
		// Find and update the language level column with dynamic options
		const levelColumnIndex = columns.findIndex(
			(col) => col.id === "desired_starting_language_level",
		);
		if (
			levelColumnIndex !== -1 &&
			languageLevels &&
			columns[levelColumnIndex].type === "option"
		) {
			columns[levelColumnIndex] = {
				...columns[levelColumnIndex],
				options: languageLevels.map((level: any) => ({
					label: level.display_name || level.code?.toUpperCase() || "Unknown",
					value: level.id,
				})),
			} as any;
		}
		return columns;
	}, [languageLevels]);

	// Data table filters hook
	const { columns, filters, actions, strategy } = useDataTableFilters({
		strategy: "server" as const,
		data: [], // Empty for server-side filtering
		columnsConfig: dynamicStudentColumns,
	});

	// Convert filters to query params - support multiple values
	const filterQuery = useMemo(() => {
		const enrollmentFilter = filters.find(
			(f) => f.columnId === "enrollment_status",
		);
		const levelFilter = filters.find(
			(f) => f.columnId === "desired_starting_language_level",
		);
		const channelFilter = filters.find((f) => f.columnId === "initial_channel");
		const commFilter = filters.find(
			(f) => f.columnId === "communication_channel",
		);
		const beginnerFilter = filters.find(
			(f) => f.columnId === "is_full_beginner",
		);
		const newsletterFilter = filters.find(
			(f) => f.columnId === "added_to_email_newsletter",
		);
		const ageFilter = filters.find((f) => f.columnId === "is_under_16");
		const dateFilter = filters.find((f) => f.columnId === "created_at");

		// Process date filter values
		const dateValues = dateFilter?.values || [];
		let dateFrom: string | undefined;
		let dateTo: string | undefined;
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
			// Pass arrays for multi-select filters
			enrollment_status: enrollmentFilter?.values?.length
				? (enrollmentFilter.values as any)
				: undefined,
			desired_starting_language_level_id: levelFilter?.values?.length
				? (levelFilter.values as any)
				: undefined,
			initial_channel: channelFilter?.values?.length
				? (channelFilter.values as any)
				: undefined,
			communication_channel: commFilter?.values?.length
				? (commFilter.values as any)
				: undefined,
			is_full_beginner: beginnerFilter?.values?.[0] || undefined,
			added_to_email_newsletter: newsletterFilter?.values?.[0] || undefined,
			is_under_16: ageFilter?.values?.[0] || undefined,
			dateFrom,
			dateTo,
			useAirtableDate,
		};
	}, [filters]);

	// Update query when debounced search changes or filters change
	const effectiveQuery = {
		...query,
		...filterQuery,
		search: debouncedSearch || undefined,
	};

	// Reset page when filters change
	useEffect(() => {
		setQuery({ ...query, page: 1 });
	}, [filters, debouncedSearch]);

	const { data, isLoading, error } = useStudents(effectiveQuery);
	const deleteStudent = useDeleteStudent();

	const handleDelete = async () => {
		if (!studentToDelete) return;
		setIsDeleting(true);
		try {
			await deleteStudent.mutateAsync(studentToDelete);
			setStudentToDelete(null);
		} finally {
			setIsDeleting(false);
		}
	};

	if (error) {
		return (
			<Card>
				<CardContent className="py-10">
					<p className="text-center text-muted-foreground">
						Failed to load students
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
								placeholder="Search students by name, email, or phone..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="h-9 bg-muted/50 pl-9"
							/>
						</div>

						<div className="ml-auto">
							<Link href="/admin/students/new">
								<Button size="sm" className="h-9">
									<Plus className="mr-1.5 h-4 w-4" />
									Add Student
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
							<TableHead>Contact</TableHead>
							<TableHead>Enrollment Status</TableHead>
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
										<Skeleton className="h-5 w-40" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-20" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-28" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-8" />
									</TableCell>
								</TableRow>
							))
						) : data?.data.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center text-muted-foreground"
								>
									No students found
								</TableCell>
							</TableRow>
						) : (
							data?.data.map((student) => (
								<TableRow
									key={student.id}
									className="transition-colors duration-150 hover:bg-muted/50"
								>
									<TableCell>
										<Link
											href={`/admin/students/${student.id}`}
											className="hover:underline"
										>
											<p className="cursor-pointer font-medium transition-colors hover:text-primary">
												{student.full_name}
											</p>
										</Link>
									</TableCell>
									<TableCell>
										<div>
											<p className="text-sm">{student.email || "No email"}</p>
											<p className="text-muted-foreground text-sm">
												{student.mobile_phone_number || "No phone"}
											</p>
										</div>
									</TableCell>

									<TableCell>
										{(student as any).enrollment_status ? (
											<Badge
												variant={
													ENROLLMENT_STATUS_COLORS[
														(student as any)
															.enrollment_status as keyof typeof ENROLLMENT_STATUS_COLORS
													] as any
												}
											>
												{
													ENROLLMENT_STATUS_LABELS[
														(student as any)
															.enrollment_status as keyof typeof ENROLLMENT_STATUS_LABELS
													]
												}
											</Badge>
										) : (
											<span className="text-muted-foreground">
												No enrollment
											</span>
										)}
									</TableCell>
									<TableCell>
										<p className="text-sm">
											{format(
												new Date(
													student.airtable_created_at || student.created_at,
												),
												"MMM d, yyyy",
											)}
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
												<Link href={`/admin/students/${student.id}`}>
													<DropdownMenuItem>
														<Eye className="mr-2 h-4 w-4" />
														View
													</DropdownMenuItem>
												</Link>
												<DropdownMenuItem
													onClick={(e) => {
														e.stopPropagation();
														setStudentToDelete(student.id);
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

				{data && data.meta.totalPages > 1 && (
					<div className="flex items-center justify-between border-t bg-muted/10 px-4 py-3">
						<p className="text-muted-foreground text-sm">
							Page {data.meta.page} of {data.meta.totalPages}
						</p>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setQuery({ ...query, page: query.page - 1 })}
								disabled={query.page === 1}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setQuery({ ...query, page: query.page + 1 })}
								disabled={query.page === data.meta.totalPages}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>

			<DeleteConfirmationDialog
				open={!!studentToDelete}
				onOpenChange={(open) => !open && setStudentToDelete(null)}
				onConfirm={handleDelete}
				title="Delete Student"
				description="Are you sure you want to delete this student?"
				isDeleting={isDeleting}
			/>
		</div>
	);
}
