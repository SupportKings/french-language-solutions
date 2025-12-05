"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import { format, parseISO } from "date-fns";
import { Calendar, Check, Clock, Search, User, X } from "lucide-react";
import { useQueryState } from "nuqs";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { useRescheduleRequests } from "../queries/rescheduleRequests.queries";
import type { RescheduleRequest, RescheduleRequestStatus } from "../types";
import { AcceptRequestModal } from "./AcceptRequestModal";
import { DeclineRequestModal } from "./DeclineRequestModal";

const STATUS_STYLES: Record<RescheduleRequestStatus, string> = {
	pending: "bg-amber-100 text-amber-800 border-amber-200",
	approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
	rejected: "bg-red-100 text-red-800 border-red-200",
	cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_LABELS: Record<RescheduleRequestStatus, string> = {
	pending: "Pending",
	approved: "Approved",
	rejected: "Rejected",
	cancelled: "Cancelled",
};

export function RescheduleRequestsTable() {
	// URL state management
	const [pageState, setPageState] = useQueryState("page", {
		parse: (value) => Number.parseInt(value) || 1,
		serialize: (value) => value.toString(),
		defaultValue: 1,
	});
	const page = pageState ?? 1;

	const [statusFilter, setStatusFilter] = useQueryState("status", {
		defaultValue: "pending",
	});

	const [searchQuery, setSearchQuery] = useQueryState("search", {
		defaultValue: "",
	});

	// Local state
	const [selectedRequest, setSelectedRequest] =
		useState<RescheduleRequest | null>(null);
	const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
	const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);

	const limit = 10;

	const effectiveQuery = useMemo(
		() => ({
			page,
			limit,
			status: statusFilter === "all" ? undefined : (statusFilter as RescheduleRequestStatus),
		}),
		[page, limit, statusFilter],
	);

	const { data, isLoading, error } = useRescheduleRequests(effectiveQuery);

	const handleAccept = (request: RescheduleRequest) => {
		setSelectedRequest(request);
		setIsAcceptModalOpen(true);
	};

	const handleDecline = (request: RescheduleRequest) => {
		setSelectedRequest(request);
		setIsDeclineModalOpen(true);
	};

	if (error) {
		return (
			<Card>
				<CardContent className="py-10">
					<p className="text-center text-muted-foreground">
						Failed to load reschedule requests
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">


			{/* Table */}
			<div className="rounded-md border">
				{/* Filter bar */}
				<div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3">
					<div className="relative max-w-xs flex-1">
						<Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by student name..."
							value={searchQuery || ""}
							onChange={(e) => setSearchQuery(e.target.value || null)}
							className="h-9 bg-muted/50 pl-9"
						/>
					</div>

					<Select
						value={statusFilter || "pending"}
						onValueChange={(value) => {
							setStatusFilter(value);
							setPageState(1);
						}}
					>
						<SelectTrigger className="h-9 w-[160px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="approved">Approved</SelectItem>
							<SelectItem value="rejected">Rejected</SelectItem>
							<SelectItem value="cancelled">Cancelled</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Student</TableHead>
							<TableHead>Original Class</TableHead>
							<TableHead>Requested Time</TableHead>
							<TableHead>Reason</TableHead>
							<TableHead>Teacher Notes</TableHead>
							<TableHead>Submitted</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="w-[140px]">Actions</TableHead>
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
										<Skeleton className="h-5 w-28" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-32" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-5 w-40" />
									</TableCell>
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
										<Skeleton className="h-8 w-24" />
									</TableCell>
								</TableRow>
							))
						) : data?.data?.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={8}
									className="py-10 text-center text-muted-foreground"
								>
									<Calendar className="mx-auto mb-2 h-8 w-8 opacity-50" />
									<p>No reschedule requests found</p>
								</TableCell>
							</TableRow>
						) : (
							data?.data?.map((request) => {
								const originalDate = parseISO(request.original_class_date);
								const studentName =
									request.student.full_name ||
									request.student.first_name ||
									"Unknown Student";

								return (
									<TableRow key={request.id}>
										<TableCell>
											<Link
												href={`/admin/students/${request.student.id}`}
												className="flex items-center gap-2 transition-colors hover:text-primary"
											>
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
													<User className="h-4 w-4 text-primary" />
												</div>
												<div>
													<p className="font-medium">{studentName}</p>
													<p className="text-muted-foreground text-xs">
														{request.student.email || "No email"}
													</p>
												</div>
											</Link>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												<div>
													<p className="font-medium text-sm">
														{format(originalDate, "EEE, MMM d")}
													</p>
													<p className="text-muted-foreground text-xs">
														{format(originalDate, "h:mm a")}
													</p>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Popover>
												<PopoverTrigger asChild>
													<button
														type="button"
														className="flex max-w-[140px] cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-left transition-colors hover:bg-muted"
													>
														<Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
														<span className="truncate text-sm">
															{request.proposed_datetime}
														</span>
													</button>
												</PopoverTrigger>
												<PopoverContent className="w-auto max-w-xs p-3" align="start">
													<div className="space-y-1">
														<p className="font-medium text-muted-foreground text-xs">
															Requested Time
														</p>
														<p className="text-sm">{request.proposed_datetime}</p>
													</div>
												</PopoverContent>
											</Popover>
										</TableCell>
										<TableCell>
											{request.reason ? (
												<Popover>
													<PopoverTrigger asChild>
														<button
															type="button"
															className="max-w-[180px] cursor-pointer truncate rounded px-1 py-0.5 text-left text-sm transition-colors hover:bg-muted"
														>
															{request.reason}
														</button>
													</PopoverTrigger>
													<PopoverContent className="w-auto max-w-sm p-3" align="start">
														<div className="space-y-1">
															<p className="font-medium text-muted-foreground text-xs">
																Reason
															</p>
															<p className="whitespace-pre-wrap text-sm">{request.reason}</p>
														</div>
													</PopoverContent>
												</Popover>
											) : (
												<span className="text-muted-foreground text-sm">
													No reason provided
												</span>
											)}
										</TableCell>
										<TableCell>
											{request.teacher_notes ? (
												<Popover>
													<PopoverTrigger asChild>
														<button
															type="button"
															className="max-w-[140px] cursor-pointer truncate rounded px-1 py-0.5 text-left text-sm transition-colors hover:bg-muted"
														>
															{request.teacher_notes}
														</button>
													</PopoverTrigger>
													<PopoverContent className="w-auto max-w-sm p-3" align="start">
														<div className="space-y-1">
															<p className="font-medium text-muted-foreground text-xs">
																Notes
															</p>
															<p className="whitespace-pre-wrap text-sm">{request.teacher_notes}</p>
														</div>
													</PopoverContent>
												</Popover>
											) : (
												<span className="text-muted-foreground text-sm">—</span>
											)}
										</TableCell>
										<TableCell>
											<span className="text-muted-foreground text-sm">
												{request.created_at
													? format(
															parseISO(request.created_at),
															"MMM d, h:mm a",
														)
													: "—"}
											</span>
										</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className={STATUS_STYLES[request.status]}
											>
												{STATUS_LABELS[request.status]}
											</Badge>
										</TableCell>
										<TableCell>
											{request.status === "pending" ? (
												<div className="flex items-center gap-1">
													<Button
														size="sm"
														variant="outline"
														className="h-8 gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
														onClick={() => handleAccept(request)}
													>
														<Check className="h-3.5 w-3.5" />
														Accept
													</Button>
													<Button
														size="sm"
														variant="outline"
														className="h-8 gap-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
														onClick={() => handleDecline(request)}
													>
														<X className="h-3.5 w-3.5" />
														Decline
													</Button>
												</div>
											) : request.status === "rejected" ? (
												<Button
													size="sm"
													variant="outline"
													className="h-8 gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
													onClick={() => handleAccept(request)}
												>
													<Check className="h-3.5 w-3.5" />
													Accept
												</Button>
											) : request.status === "approved" ? (
												<Button
													size="sm"
													variant="outline"
													className="h-8 gap-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
													onClick={() => handleDecline(request)}
												>
													<X className="h-3.5 w-3.5" />
													Decline
												</Button>
											) : (
												<span className="text-muted-foreground text-sm">—</span>
											)}
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>

				{/* Pagination */}
				{data && data.totalPages > 1 && (
					<div className="flex items-center justify-between border-t bg-muted/10 px-4 py-3">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<span className="font-medium text-primary">
								Total: {data.count || 0}
							</span>
							<span>•</span>
							<span>
								Page {data.page} of {data.totalPages}
							</span>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPageState(page - 1)}
								disabled={page === 1}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPageState(page + 1)}
								disabled={page === data.totalPages}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Accept Modal */}
			<AcceptRequestModal
				open={isAcceptModalOpen}
				onOpenChange={setIsAcceptModalOpen}
				request={selectedRequest}
			/>

			{/* Decline Modal */}
			<DeclineRequestModal
				open={isDeclineModalOpen}
				onOpenChange={setIsDeclineModalOpen}
				request={selectedRequest}
			/>
		</div>
	);
}
