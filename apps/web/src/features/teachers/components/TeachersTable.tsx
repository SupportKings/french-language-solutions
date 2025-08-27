"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
	MoreHorizontal, 
	Search, 
	Plus, 
	Eye, 
	Trash, 
	UserCheck, 
	Briefcase, 
	Calendar,
	Video,
	MapPin,
	Shield
} from "lucide-react";
import { useTeachers, useDeleteTeacher } from "../queries/teachers.queries";
import type { TeacherQuery } from "../schemas/teacher.schema";
import { format } from "date-fns";
import Link from "next/link";
import { DataTableFilter, useDataTableFilters } from "@/components/data-table-filter";
import { toast } from "sonner";

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
];

interface TeachersTableProps {
	hideTitle?: boolean;
}

export function TeachersTable({ hideTitle = false }: TeachersTableProps) {
	const router = useRouter();
	const [query, setQuery] = useState<TeacherQuery>({
		page: 1,
		limit: 20,
		sortBy: "created_at",
		sortOrder: "desc",
	});
	const [searchInput, setSearchInput] = useState("");
	const debouncedSearch = useDebounce(searchInput, 300);

	// Data table filters hook
	const {
		columns,
		filters,
		actions,
		strategy,
	} = useDataTableFilters({
		strategy: "server" as const,
		data: [], // Empty for server-side filtering
		columnsConfig: teacherColumns,
	});

	// Convert filters to query params - support multiple values
	const filterQuery = useMemo(() => {
		const onboardingFilter = filters.find(f => f.columnId === "onboarding_status");
		const contractFilter = filters.find(f => f.columnId === "contract_type");
		const bookingFilter = filters.find(f => f.columnId === "available_for_booking");
		const under16Filter = filters.find(f => f.columnId === "qualified_for_under_16");
		const onlineFilter = filters.find(f => f.columnId === "available_for_online_classes");
		const inPersonFilter = filters.find(f => f.columnId === "available_for_in_person_classes");
		
		return {
			// Pass arrays for multi-select filters
			onboarding_status: onboardingFilter?.values?.length ? onboardingFilter.values[0] as any : undefined,
			contract_type: contractFilter?.values?.length ? contractFilter.values[0] as any : undefined,
			available_for_booking: bookingFilter?.values?.[0] === "true" ? true : bookingFilter?.values?.[0] === "false" ? false : undefined,
			qualified_for_under_16: under16Filter?.values?.[0] === "true" ? true : under16Filter?.values?.[0] === "false" ? false : undefined,
			available_for_online_classes: onlineFilter?.values?.[0] === "true" ? true : onlineFilter?.values?.[0] === "false" ? false : undefined,
			available_for_in_person_classes: inPersonFilter?.values?.[0] === "true" ? true : inPersonFilter?.values?.[0] === "false" ? false : undefined,
		};
	}, [filters]);

	// Update query when debounced search changes or filters change
	const effectiveQuery = {
		...query,
		...filterQuery,
		search: debouncedSearch || undefined,
	};

	const { data, isLoading, error } = useTeachers(effectiveQuery);
	const deleteTeacher = useDeleteTeacher();

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this teacher?")) {
			try {
				await deleteTeacher.mutateAsync(id);
				toast.success("Teacher deleted successfully");
			} catch (error) {
				toast.error("Failed to delete teacher");
			}
		}
	};

	if (error) {
		return (
			<Card>
				<CardContent className="py-10">
					<p className="text-center text-muted-foreground">
						Failed to load teachers
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
				<div className="border-b bg-muted/30 px-4 py-2 space-y-2">
					{/* Search bar and action button */}
					<div className="flex items-center gap-3">
						<div className="relative flex-1 max-w-sm">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
							<Input
								placeholder="Search by name..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="h-9 pl-9 bg-muted/50"
							/>
						</div>
						
						<div className="ml-auto">
							<Link href="/admin/teachers/new">
								<Button 
									size="sm" 
									className="h-9"
								>
									<Plus className="mr-1.5 h-4 w-4" />
									New Teacher
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
								<TableHead>Teacher</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Contract</TableHead>
								<TableHead>Availability</TableHead>
								<TableHead>Classes</TableHead>
								<TableHead>Hours</TableHead>
								<TableHead className="w-[70px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<TableRow key={i}>
										<TableCell><Skeleton className="h-5 w-32" /></TableCell>
										<TableCell><Skeleton className="h-5 w-20" /></TableCell>
										<TableCell><Skeleton className="h-5 w-24" /></TableCell>
										<TableCell><Skeleton className="h-5 w-20" /></TableCell>
										<TableCell><Skeleton className="h-5 w-28" /></TableCell>
										<TableCell><Skeleton className="h-5 w-20" /></TableCell>
										<TableCell><Skeleton className="h-5 w-8" /></TableCell>
									</TableRow>
								))
							) : data?.data?.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center text-muted-foreground">
										No teachers found
									</TableCell>
								</TableRow>
							) : (
								data?.data?.map((teacher: any) => (
									<TableRow key={teacher.id} className="hover:bg-muted/50 transition-colors duration-150">
										<TableCell>
											<div>
												<p className="font-medium">
													{teacher.first_name} {teacher.last_name}
												</p>
												<p className="text-sm text-muted-foreground">
													{teacher.mobile_phone_number || "No phone"}
												</p>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant={(onboardingStatusColors as any)[teacher.onboarding_status]}>
												{(onboardingStatusLabels as any)[teacher.onboarding_status]}
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
											<div className="flex items-center gap-2">
												{teacher.available_for_booking ? (
													<Badge variant="success" className="text-xs">Available</Badge>
												) : (
													<Badge variant="secondary" className="text-xs">Unavailable</Badge>
												)}
												{teacher.qualified_for_under_16 && (
													<Badge variant="outline" className="text-xs">U16</Badge>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												{teacher.available_for_online_classes && (
													<Video className="h-4 w-4 text-muted-foreground" />
												)}
												{teacher.available_for_in_person_classes && (
													<MapPin className="h-4 w-4 text-muted-foreground" />
												)}
												{!teacher.available_for_online_classes && !teacher.available_for_in_person_classes && (
													<span className="text-sm text-muted-foreground">None</span>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className="text-sm">
												{teacher.maximum_hours_per_week ? (
													<>
														<p>{teacher.maximum_hours_per_week}h/week</p>
														{teacher.maximum_hours_per_day && (
															<p className="text-muted-foreground">{teacher.maximum_hours_per_day}h/day</p>
														)}
													</>
												) : (
													<span className="text-muted-foreground">Not set</span>
												)}
											</div>
										</TableCell>
										<TableCell>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<Link href={`/admin/teachers/${teacher.id}`}>
														<DropdownMenuItem>
															<Eye className="mr-2 h-4 w-4" />
															View
														</DropdownMenuItem>
													</Link>
													<DropdownMenuItem 
														onClick={() => handleDelete(teacher.id)}
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
					<div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
						<p className="text-sm text-muted-foreground">
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
		</div>
	);
}