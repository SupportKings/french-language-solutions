"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { format, parseISO } from "date-fns";
import { Calendar, CalendarClock, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type {
	PrivateEnrollment,
	RescheduleRequest,
	RescheduleRequestStatus,
} from "../types";
import { RescheduleRequestModal } from "./RescheduleRequestModal";

interface ReschedulingSectionProps {
	enrollment: PrivateEnrollment;
	requests: RescheduleRequest[];
}

const MAX_REQUESTS = 3;

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

export function ReschedulingSection({
	enrollment,
	requests,
}: ReschedulingSectionProps) {
	const router = useRouter();
	const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

	// Count active (pending) requests
	const activeRequestCount = requests.filter(
		(r) => r.status === "pending",
	).length;
	const remainingRequests = MAX_REQUESTS - activeRequestCount;

	// Get recent requests to show in preview (up to 3)
	const recentRequests = [...requests]
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)
		.slice(0, 3);

	const handleSuccess = () => {
		router.refresh();
	};

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-2xl tracking-tight">Rescheduling</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Request to reschedule your upcoming private classes
					</p>
				</div>
				<Button
					onClick={() => setIsRequestModalOpen(true)}
					size="sm"
					className="gap-1.5"
					disabled={remainingRequests <= 0}
				>
					<Plus className="h-4 w-4" />
					New Request
				</Button>
			</div>

			{/* Main Card */}
			<div
				className={cn(
					"group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-all duration-300",
				)}
			>
				{/* Dot pattern background on hover */}
				<div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:4px_4px] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
				</div>

				<div className="relative space-y-4">
					{/* Header with icon and remaining count */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600">
								<CalendarClock className="h-4 w-4 text-white" />
							</div>
							<div>
								<h3 className="font-medium text-sm">Request Allowance</h3>
								<p className="text-muted-foreground text-xs">
									Per 2-week period
								</p>
							</div>
						</div>
						<div className="text-right">
							<div
								className={cn(
									"font-bold text-2xl",
									remainingRequests > 0 ? "text-primary" : "text-amber-600",
								)}
							>
								{remainingRequests}/{MAX_REQUESTS}
							</div>
							<p className="text-muted-foreground text-xs">remaining</p>
						</div>
					</div>

					{/* Recent Requests */}
					{recentRequests.length > 0 ? (
						<div className="space-y-2">
							<div className="border-t pt-3">
								<h4 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
									Recent Requests
								</h4>
								<div className="space-y-2">
									{recentRequests.map((request) => (
										<div
											key={request.id}
											className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
										>
											<div className="flex items-center gap-2">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												<span className="text-sm">
													{format(
														parseISO(request.originalClassDate),
														"MMM d, yyyy",
													)}
												</span>
											</div>
											<div className="flex items-center gap-2">
												{request.adminNotes && (
													<span className="max-w-[140px] truncate text-muted-foreground text-xs" title={request.adminNotes}>
														<span className="font-medium">Note:</span> {request.adminNotes}
													</span>
												)}
												<span
													className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[request.status]}`}
												>
													{STATUS_LABELS[request.status]}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					) : (
						<div className="border-t pt-3">
							<div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 py-4 text-center">
								<Calendar className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
								<p className="text-muted-foreground text-sm">
									No reschedule requests yet
								</p>
							</div>
						</div>
					)}

					{/* View All Link */}
					{requests.length > 0 && (
						<Link
							href="/rescheduling"
							className="flex w-full items-center justify-center gap-1 rounded-lg border border-border/50 bg-muted/30 py-2 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
						>
							View All Requests
							<ChevronRight className="h-4 w-4" />
						</Link>
					)}
				</div>
			</div>

			{/* Request Modal */}
			<RescheduleRequestModal
				open={isRequestModalOpen}
				onOpenChange={setIsRequestModalOpen}
				enrollment={enrollment}
				existingRequests={requests}
				activeRequestCount={activeRequestCount}
				onSuccess={handleSuccess}
			/>
		</div>
	);
}
