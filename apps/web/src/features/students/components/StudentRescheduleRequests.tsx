"use client";

import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { useRescheduleRequests } from "@/features/reschedule-requests/queries/rescheduleRequests.queries";
import type {
	RescheduleRequest,
	RescheduleRequestStatus,
} from "@/features/reschedule-requests/types";
import { AcceptRequestModal } from "@/features/reschedule-requests/components/AcceptRequestModal";
import { DeclineRequestModal } from "@/features/reschedule-requests/components/DeclineRequestModal";

import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
	Calendar,
	Check,
	Clock,
	FileText,
	MessageSquare,
	X,
} from "lucide-react";

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

interface StudentRescheduleRequestsProps {
	studentId: string;
}

export function StudentRescheduleRequests({
	studentId,
}: StudentRescheduleRequestsProps) {
	const router = useRouter();
	const pathname = usePathname();
	const queryClient = useQueryClient();

	const [selectedRequest, setSelectedRequest] =
		useState<RescheduleRequest | null>(null);
	const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
	const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);

	// Invalidate cache when component mounts (useful when returning from forms)
	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.get("tab") === "reschedule-requests") {
			queryClient.invalidateQueries({
				queryKey: [
					"reschedule-requests",
					"list",
					{ page: 1, limit: 50, studentId },
				],
			});
		}
	}, [queryClient, studentId, pathname]);

	const { data, isLoading } = useRescheduleRequests({
		studentId,
		page: 1,
		limit: 50,
	});

	const handleAccept = (request: RescheduleRequest) => {
		setSelectedRequest(request);
		setIsAcceptModalOpen(true);
	};

	const handleDecline = (request: RescheduleRequest) => {
		setSelectedRequest(request);
		setIsDeclineModalOpen(true);
	};

	if (isLoading) {
		return (
			<div className="grid gap-2">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="group relative animate-pulse overflow-hidden rounded-lg border bg-card"
					>
						<div className="p-3">
							<div className="flex items-start justify-between gap-3">
								<div className="flex min-w-0 flex-1 items-start gap-3">
									<div className="h-9 w-9 flex-shrink-0 rounded-full bg-muted" />
									<div className="min-w-0 flex-1">
										<div className="space-y-2">
											<div className="h-4 w-32 rounded bg-muted" />
											<div className="flex items-center gap-3">
												<div className="h-3 w-40 rounded bg-muted" />
												<div className="h-3 w-24 rounded bg-muted" />
											</div>
											<div className="mt-2 flex items-center gap-2">
												<div className="h-5 w-20 rounded bg-muted" />
												<div className="h-4 w-16 rounded bg-muted" />
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (!data?.data || data.data.length === 0) {
		return (
			<div className="rounded-lg bg-muted/30 py-8 text-center">
				<Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
				<p className="text-muted-foreground">No reschedule requests yet</p>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-3">
				{data.data.map((request) => {
					const originalDate = parseISO(request.original_class_date);
					const cohortName =
						request.cohort?.nickname ||
						request.cohort?.product?.display_name ||
						"Unknown Cohort";
					const productName = request.cohort?.product?.display_name || "";

					return (
						<div
							key={request.id}
							className="group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
						>
							{/* Header with cohort info */}
							<div className="border-b bg-muted/30 px-4 py-2.5">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
											<Calendar className="h-4 w-4 text-primary" />
										</div>
										<div>
											<p className="font-semibold text-sm leading-tight">
												{cohortName}
											</p>
											{productName && (
												<p className="text-muted-foreground text-xs">
													{productName}
												</p>
											)}
										</div>
									</div>
									<Badge
										variant="outline"
										className={`${STATUS_STYLES[request.status]}`}
									>
										{STATUS_LABELS[request.status]}
									</Badge>
								</div>
							</div>

							{/* Details row */}
							<div className="px-4 py-3">
								<div className="flex items-center justify-between gap-6">
									{/* Left side - Times and Details */}
									<div className="flex flex-1 items-center gap-6">
										{/* Submitted */}
										<div className="flex min-w-[130px] flex-col gap-0.5">
											<span className="text-muted-foreground text-xs">
												Submitted
											</span>
											<div className="flex items-center gap-1.5">
												<Clock className="h-3.5 w-3.5 text-muted-foreground" />
												<span className="text-sm">
													{request.created_at
														? format(parseISO(request.created_at), "MMM d, h:mm a")
														: "—"}
												</span>
											</div>
										</div>

										{/* Original Class */}
										<div className="flex flex-col gap-0.5">
											<span className="text-muted-foreground text-xs">
												Original Class
											</span>
											<span className="font-medium text-sm">
												{format(originalDate, "MMM d, h:mm a")}
											</span>
										</div>

										{/* Arrow */}
										<div className="flex items-center text-muted-foreground">
											→
										</div>

										{/* Requested Time */}
										<div className="flex flex-col gap-0.5">
											<span className="text-muted-foreground text-xs">
												Requested Time
											</span>
											<span className="font-medium text-sm">
												{request.proposed_datetime}
											</span>
										</div>

										{/* Reason */}
										<div className="flex min-w-[150px] flex-col gap-0.5">
											<span className="text-muted-foreground text-xs">Reason</span>
											{request.reason ? (
												<Popover>
													<PopoverTrigger asChild>
														<button
															type="button"
															className="flex items-center gap-1.5 truncate text-left text-sm transition-colors hover:text-primary"
														>
															<FileText className="h-3.5 w-3.5 flex-shrink-0" />
															<span className="truncate">{request.reason}</span>
														</button>
													</PopoverTrigger>
													<PopoverContent
														className="max-w-md p-4"
														align="start"
													>
														<div className="space-y-2">
															<p className="font-semibold text-sm">
																Student's Reason
															</p>
															<p className="whitespace-pre-wrap text-sm">
																{request.reason}
															</p>
														</div>
													</PopoverContent>
												</Popover>
											) : (
												<span className="text-muted-foreground text-sm">
													No reason provided
												</span>
											)}
										</div>

										{/* Teacher Notes */}
										{request.teacher_notes && (
											<div className="flex min-w-[150px] flex-col gap-0.5">
												<span className="text-muted-foreground text-xs">
													Teacher Notes
												</span>
												<Popover>
													<PopoverTrigger asChild>
														<button
															type="button"
															className="flex items-center gap-1.5 truncate text-left text-sm transition-colors hover:text-primary"
														>
															<MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
															<span className="truncate">
																{request.teacher_notes}
															</span>
														</button>
													</PopoverTrigger>
													<PopoverContent className="max-w-md p-4" align="start">
														<div className="space-y-2">
															<p className="font-semibold text-sm">
																Teacher's Notes
															</p>
															<p className="whitespace-pre-wrap text-sm">
																{request.teacher_notes}
															</p>
														</div>
													</PopoverContent>
												</Popover>
											</div>
										)}
									</div>

									{/* Right side - Actions */}
									<div className="flex items-center gap-2">
										{request.status === "pending" && (
											<>
												<Button
													size="sm"
													variant="outline"
													className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
													onClick={() => handleAccept(request)}
												>
													<Check className="h-4 w-4" />
													Accept
												</Button>
												<Button
													size="sm"
													variant="outline"
													className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
													onClick={() => handleDecline(request)}
												>
													<X className="h-4 w-4" />
													Decline
												</Button>
											</>
										)}
										{request.status === "rejected" && (
											<Button
												size="sm"
												variant="outline"
												className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
												onClick={() => handleAccept(request)}
											>
												<Check className="h-4 w-4" />
												Accept
											</Button>
										)}
										{request.status === "approved" && (
											<Button
												size="sm"
												variant="outline"
												className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
												onClick={() => handleDecline(request)}
											>
												<X className="h-4 w-4" />
												Decline
											</Button>
										)}
									</div>
								</div>
							</div>
						</div>
					);
				})}
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
		</>
	);
}
