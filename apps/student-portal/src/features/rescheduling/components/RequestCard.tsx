"use client";

import { useTransition } from "react";

import { format, parseISO } from "date-fns";
import { ArrowRight, Calendar, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { RescheduleRequest, RescheduleRequestStatus } from "../types";

interface RequestCardProps {
	request: RescheduleRequest;
	onCancel?: (requestId: string) => Promise<void>;
	showCancelButton?: boolean;
}

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

export function RequestCard({
	request,
	onCancel,
	showCancelButton = true,
}: RequestCardProps) {
	const [isPending, startTransition] = useTransition();
	const originalDate = parseISO(request.originalClassDate);
	const isPendingStatus = request.status === "pending";

	const handleCancel = () => {
		if (!onCancel) return;
		startTransition(async () => {
			await onCancel(request.id);
		});
	};

	return (
		<div className="rounded-lg border border-border/50 bg-card p-3">
			{/* Header row: date, arrow, requested time, status */}
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 flex-1 items-center gap-2">
					<Calendar className="h-4 w-4 shrink-0 text-primary" />
					<div className="flex min-w-0 items-center gap-1.5 text-sm">
						<span className="font-medium">
							{format(originalDate, "EEE, MMM d")}
						</span>
						<span className="text-muted-foreground">
							{format(originalDate, "h:mm a")}
						</span>
						<ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
						<span className="truncate font-medium text-primary">
							{request.proposedDatetime}
						</span>
					</div>
				</div>
				<div className="flex shrink-0 items-center gap-2">
					<span
						className={`rounded-full border px-2 py-0.5 font-medium text-xs ${STATUS_STYLES[request.status]}`}
					>
						{STATUS_LABELS[request.status]}
					</span>
					{showCancelButton && isPendingStatus && onCancel && (
						<Button
							variant="ghost"
							size="icon"
							onClick={handleCancel}
							disabled={isPending}
							className="h-7 w-7 text-muted-foreground hover:text-destructive"
						>
							{isPending ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : (
								<X className="h-3.5 w-3.5" />
							)}
						</Button>
					)}
				</div>
			</div>

			{/* Details: reason and response */}
			{(request.reason || request.adminNotes) && (
				<div className="mt-2 flex flex-col gap-1 border-t pt-2 text-xs">
					{request.reason && (
						<div>
							<span className="text-muted-foreground">Reason: </span>
							<span>{request.reason}</span>
						</div>
					)}
					{request.adminNotes && (
						<div>
							<span className="font-medium text-primary">Response: </span>
							<span>{request.adminNotes}</span>
						</div>
					)}
				</div>
			)}

			{/* Footer: submitted timestamp */}
			<div className="mt-2 text-muted-foreground text-[11px]">
				Submitted {format(parseISO(request.createdAt), "MMM d, yyyy 'at' h:mm a")}
			</div>
		</div>
	);
}
