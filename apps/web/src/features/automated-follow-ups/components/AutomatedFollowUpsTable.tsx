"use client";

import { useMemo, useState } from "react";

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

import { useSequences } from "@/features/sequences/queries/sequences.queries";

import { useDebounce } from "@uidotdev/usehooks";
import { format } from "date-fns";
import {
	AlertCircle,
	CheckCircle,
	Clock,
	Eye,
	MessageSquare,
	MoreHorizontal,
	Play,
	Plus,
	Search,
	Trash,
	User,
	XCircle,
} from "lucide-react";
import {
	useAutomatedFollowUps,
	useDeleteAutomatedFollowUp,
} from "../queries/automated-follow-ups.queries";
import type { AutomatedFollowUpQuery } from "../schemas/automated-follow-up.schema";

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

// Define column configurations for data-table-filter - will be populated dynamically
const getColumnConfigurations = (sequences: any[]) =>
	[
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
		{
			id: "sequence_id",
			accessor: (touchpoint: any) => touchpoint.sequence_id,
			displayName: "Sequence",
			icon: MessageSquare,
			type: "option" as const,
			options: sequences.map((sequence) => ({
				label: sequence.display_name || "Unknown",
				value: sequence.id,
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
		limit: 20,
	});
	const [followUpToDelete, setFollowUpToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const deleteFollowUp = useDeleteAutomatedFollowUp();

	// Fetch sequences for filters
	const { data: sequencesData } = useSequences({ page: 1, limit: 100 });
	const sequences = sequencesData?.data || [];

	// Data table filters hook - use dynamic columns
	const { columns, filters, actions, strategy } = useDataTableFilters({
		strategy: "server" as const,
		data: [], // Empty for server-side filtering
		columnsConfig: getColumnConfigurations(sequences),
	});

	// Convert filters to query params - support multiple values
	const filterQuery = useMemo(() => {
		const statusFilter = filters.find((f) => f.columnId === "status");
		const sequenceFilter = filters.find((f) => f.columnId === "sequence_id");

		return {
			status: statusFilter?.values?.length
				? (statusFilter.values as any)
				: undefined,
			sequence_id: sequenceFilter?.values?.length
				? (sequenceFilter.values as any)
				: undefined,
		};
	}, [filters]);

	// Update query when search or filters change
	const finalQuery = useMemo(
		() => ({
			...query,
			search: debouncedSearch,
			...filterQuery,
		}),
		[query, debouncedSearch, filterQuery],
	);

	const { data, isLoading, error } = useAutomatedFollowUps(finalQuery);

	const handleDelete = async () => {
		if (!followUpToDelete) return;
		setIsDeleting(true);
		try {
			await deleteFollowUp.mutateAsync(followUpToDelete);
			setFollowUpToDelete(null);
		} finally {
			setIsDeleting(false);
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
			{/* Table with integrated search, filters and actions */}
			<div className="rounded-md border">
				{/* Combined header with search, filters, and add button */}
				<div className="space-y-2 border-b bg-muted/30 px-4 py-2">
					{/* Search bar and action button */}
					<div className="flex items-center gap-3">
						<div className="relative max-w-sm flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search by student name..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="h-9 bg-muted/50 pl-9"
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
							<TableHead>Sequence</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Started</TableHead>
							<TableHead>Last Message</TableHead>
							<TableHead>Completed at</TableHead>
							<TableHead className="w-[70px]" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={`skeleton-${i}`}>
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
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-8" />
									</TableCell>
								</TableRow>
							))
						) : data?.data?.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="text-center text-muted-foreground"
								>
									No automated follow-ups found
								</TableCell>
							</TableRow>
						) : (
							data?.data?.map((touchpoint: any) => {
								const StatusIcon = (statusIcons as any)[touchpoint.status];
								return (
									<TableRow
										key={touchpoint.id}
										className="cursor-pointer transition-colors duration-150 hover:bg-muted/50"
										onClick={() =>
											router.push(
												`/admin/automation/automated-follow-ups/${touchpoint.id}`,
											)
										}
									>
										<TableCell>
											<div className="flex items-center gap-2">
												<User className="h-4 w-4 text-muted-foreground" />
												<div>
													<p className="font-medium">
														{touchpoint.students?.full_name || "Unknown"}
													</p>
													<p className="text-muted-foreground text-sm">
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
														{touchpoint.sequence?.display_name || touchpoint.sequences?.display_name || "Unknown"}
													</p>
													<p className="text-muted-foreground text-sm">
														{touchpoint.sequence?.subject || touchpoint.sequences?.subject || "No subject"}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant={(statusColors as any)[touchpoint.status]}
												className="gap-1"
											>
												<StatusIcon className="h-3 w-3" />
												{(statusLabels as any)[touchpoint.status]}
											</Badge>
										</TableCell>
										<TableCell>
											<p className="text-sm">
												{format(new Date(touchpoint.started_at), "MMM d, yyyy")}
											</p>
											<p className="text-muted-foreground text-xs">
												{format(new Date(touchpoint.started_at), "h:mm a")}
											</p>
										</TableCell>
										<TableCell>
											{touchpoint.last_message_sent_at ? (
												<>
													<p className="text-sm">
														{format(
															new Date(touchpoint.last_message_sent_at),
															"MMM d, yyyy",
														)}
													</p>
													<p className="text-muted-foreground text-xs">
														{format(
															new Date(touchpoint.last_message_sent_at),
															"h:mm a",
														)}
													</p>
												</>
											) : (
												<span className="text-muted-foreground text-sm">
													Not sent
												</span>
											)}
										</TableCell>
										<TableCell>
											{touchpoint.completed_at ? (
												<>
													<p className="text-sm">
														{format(
															new Date(touchpoint.completed_at),
															"MMM d, yyyy",
														)}
													</p>
													<p className="text-muted-foreground text-xs">
														{format(
															new Date(touchpoint.completed_at),
															"h:mm a",
														)}
													</p>
												</>
											) : (
												<Badge
													variant="outline"
													className="text-muted-foreground text-sm"
												>
													In Progress
												</Badge>
											)}
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
														href={`/admin/automation/automated-follow-ups/${touchpoint.id}`}
													>
														<DropdownMenuItem>
															<Eye className="mr-2 h-4 w-4" />
															View Details
														</DropdownMenuItem>
													</Link>
													<DropdownMenuItem
														onClick={(e) => {
															e.stopPropagation();
															setFollowUpToDelete(touchpoint.id);
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
								);
							})
						)}
					</TableBody>
				</Table>

				{data && data.meta?.totalPages > 1 && (
					<div className="flex items-center justify-between border-border/50 border-t p-4">
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
				open={!!followUpToDelete}
				onOpenChange={(open) => !open && setFollowUpToDelete(null)}
				onConfirm={handleDelete}
				title="Delete Automated Follow-up"
				description="Are you sure you want to delete this automated follow-up?"
				isDeleting={isDeleting}
			/>
		</div>
	);
}
