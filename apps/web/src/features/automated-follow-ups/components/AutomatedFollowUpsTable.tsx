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
	Edit, 
	Trash, 
	MessageSquare,
	User,
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	Play
} from "lucide-react";
import { useAutomatedFollowUps, useDeleteAutomatedFollowUp } from "../queries/automated-follow-ups.queries";
import type { AutomatedFollowUpQuery } from "../schemas/automated-follow-up.schema";
import { format } from "date-fns";
import Link from "next/link";
import { DataTableFilter, useDataTableFilters } from "@/components/data-table-filter";

const statusColors = {
	activated: "info",
	ongoing: "warning",
	answer_received: "success",
	disabled: "destructive",
};

const statusLabels = {
	activated: "Activated",
	ongoing: "Ongoing",
	answer_received: "Answer Received",
	disabled: "Disabled",
};

const statusIcons = {
	activated: Play,
	ongoing: Clock,
	answer_received: CheckCircle,
	disabled: XCircle,
};

// Define column configurations for data-table-filter
const touchpointColumns = [
	{
		id: "status",
		accessor: (touchpoint: any) => touchpoint.status,
		displayName: "Status",
		icon: AlertCircle,
		type: "option" as const,
		options: Object.entries(statusLabels).map(([value, label]) => ({
			label,
			value,
		})),
	},
] as const;

export function AutomatedFollowUpsTable() {
	const router = useRouter();
	const [searchInput, setSearchInput] = useState("");
	const debouncedSearch = useDebounce(searchInput, 300);
	const [query, setQuery] = useState<AutomatedFollowUpQuery>({
		search: "",
		page: 1,
		limit: 10,
	});

	const deleteFollowUp = useDeleteAutomatedFollowUp();

	// Data table filters hook
	const {
		columns,
		filters,
		actions,
		strategy,
	} = useDataTableFilters({
		strategy: "server" as const,
		data: [], // Empty for server-side filtering
		columnsConfig: touchpointColumns,
	});

	// Convert filters to query params - support multiple values
	const filterQuery = useMemo(() => {
		const statusFilter = filters.find(f => f.columnId === "status");
		
		return {
			status: statusFilter?.values?.length ? statusFilter.values as any : undefined,
		};
	}, [filters]);

	// Update query when search or filters change
	const finalQuery = useMemo(() => ({
		...query,
		search: debouncedSearch,
		...filterQuery,
	}), [query, debouncedSearch, filterQuery]);

	const { data, isLoading, error } = useAutomatedFollowUps(finalQuery);

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this automated follow-up?")) {
			await deleteFollowUp.mutateAsync(id);
		}
	};

	if (error) {
		return (
			<Card>
				<CardContent className="py-10">
					<p className="text-center text-muted-foreground">
						Failed to load automated follow-ups
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{/* Compact toolbar with search and action button */}
			<div className="flex items-center gap-3">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search by student or sequence..."
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="h-9 pl-9 bg-muted/50"
					/>
				</div>
				
				<div className="ml-auto">
					<Link href="/admin/automation/automated-follow-ups/new">
						<Button size="sm" className="h-9">
							<Plus className="mr-1.5 h-4 w-4" />
							New Follow-up
						</Button>
					</Link>
				</div>
			</div>

			<div className="rounded-md border">
				{/* Filter bar */}
				<div className="p-4 bg-muted/30 border-b border-border/50">
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
								<TableHead>Sequence</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Started</TableHead>
								<TableHead>Last Message</TableHead>
								<TableHead>Completed</TableHead>
								<TableHead className="w-[70px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<TableRow key={i}>
										<TableCell><Skeleton className="h-5 w-32" /></TableCell>
										<TableCell><Skeleton className="h-5 w-40" /></TableCell>
										<TableCell><Skeleton className="h-5 w-20" /></TableCell>
										<TableCell><Skeleton className="h-5 w-24" /></TableCell>
										<TableCell><Skeleton className="h-5 w-24" /></TableCell>
										<TableCell><Skeleton className="h-5 w-24" /></TableCell>
										<TableCell><Skeleton className="h-5 w-8" /></TableCell>
									</TableRow>
								))
							) : data?.data?.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="text-center text-muted-foreground">
										No automated follow-ups found
									</TableCell>
								</TableRow>
							) : (
								data?.data?.map((touchpoint: any) => {
									const StatusIcon = statusIcons[touchpoint.status];
									return (
										<TableRow key={touchpoint.id}>
											<TableCell>
												<div className="flex items-center gap-2">
													<User className="h-4 w-4 text-muted-foreground" />
													<div>
														<p className="font-medium">{touchpoint.students?.full_name || "Unknown"}</p>
														<p className="text-sm text-muted-foreground">
															{touchpoint.students?.email || "No email"}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<MessageSquare className="h-4 w-4 text-muted-foreground" />
													<div>
														<p className="font-medium">
															{touchpoint.template_follow_up_sequences?.display_name || "Unknown"}
														</p>
														<p className="text-sm text-muted-foreground">
															{touchpoint.template_follow_up_sequences?.subject || "No subject"}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge variant={statusColors[touchpoint.status] as any} className="gap-1">
													<StatusIcon className="h-3 w-3" />
													{statusLabels[touchpoint.status]}
												</Badge>
											</TableCell>
											<TableCell>
												<p className="text-sm">
													{format(new Date(touchpoint.started_at), "MMM d, yyyy")}
												</p>
												<p className="text-xs text-muted-foreground">
													{format(new Date(touchpoint.started_at), "h:mm a")}
												</p>
											</TableCell>
											<TableCell>
												{touchpoint.last_message_sent_at ? (
													<>
														<p className="text-sm">
															{format(new Date(touchpoint.last_message_sent_at), "MMM d, yyyy")}
														</p>
														<p className="text-xs text-muted-foreground">
															{format(new Date(touchpoint.last_message_sent_at), "h:mm a")}
														</p>
													</>
												) : (
													<span className="text-sm text-muted-foreground">Not sent</span>
												)}
											</TableCell>
											<TableCell>
												{touchpoint.completed_at ? (
													<>
														<p className="text-sm">
															{format(new Date(touchpoint.completed_at), "MMM d, yyyy")}
														</p>
														<p className="text-xs text-muted-foreground">
															{format(new Date(touchpoint.completed_at), "h:mm a")}
														</p>
													</>
												) : (
													<span className="text-sm text-muted-foreground">In progress</span>
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
														<Link href={`/admin/automation/automated-follow-ups/${touchpoint.id}`}>
															<DropdownMenuItem>
																<Eye className="mr-2 h-4 w-4" />
																View
															</DropdownMenuItem>
														</Link>
														<Link href={`/admin/automation/automated-follow-ups/${touchpoint.id}/edit`}>
															<DropdownMenuItem>
																<Edit className="mr-2 h-4 w-4" />
																Edit
															</DropdownMenuItem>
														</Link>
														<DropdownMenuItem 
															onClick={() => handleDelete(touchpoint.id)}
															className="text-destructive"
														>
															<Trash className="mr-2 h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
				</Table>
				
				{data && data.meta?.totalPages > 1 && (
					<div className="p-4 border-t border-border/50 flex items-center justify-between">
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