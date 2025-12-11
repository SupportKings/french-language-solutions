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
		<div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md">
			{/* Subtle gradient background on hover */}
			<div className="absolute inset-0 bg-gradient-to-br from-background/50 to-accent/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

			<div className="relative">
				{/* Header row: date, arrow, requested time, status */}
				<div className="flex items-center justify-between gap-3">
					<div className="flex min-w-0 flex-1 items-center gap-2.5">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
							<Calendar className="h-4 w-4 text-primary" />
						</div>
						<div className="flex min-w-0 items-center gap-2 text-sm">
							<span className="font-semibold">
								{format(originalDate, "EEE, MMM d")}
							</span>
							<span className="text-muted-foreground text-xs">
								{format(originalDate, "h:mm a")}
							</span>
							<ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
							<span className="truncate font-semibold text-primary">
								{request.proposedDatetime}
							</span>
						</div>
					</div>
					<div className="flex shrink-0 items-center gap-2">
						<span
							className={`rounded-full border px-2.5 py-1 font-medium text-xs shadow-sm ${STATUS_STYLES[request.status]}`}
						>
							{STATUS_LABELS[request.status]}
						</span>
						{showCancelButton && isPendingStatus && onCancel && (
							<Button
								variant="ghost"
								size="icon"
								onClick={handleCancel}
								disabled={isPending}
								className="h-8 w-8 text-muted-foreground hover:text-destructive"
							>
								{isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<X className="h-4 w-4" />
								)}
							</Button>
						)}
					</div>
				</div>

				{/* Details: reason and response */}
				{(request.reason || request.adminNotes) && (
					<div className="mt-3 flex flex-col gap-2 rounded-lg bg-muted/50 p-3 text-xs">
						{request.reason && (
							<div>
								<span className="font-medium text-foreground">Reason: </span>
								<span className="text-muted-foreground">{request.reason}</span>
							</div>
						)}
						{request.adminNotes && (
							<div className="rounded-md border border-primary/20 bg-primary/5 p-2">
								<span className="font-semibold text-primary">Response: </span>
								<span className="text-foreground">{request.adminNotes}</span>
							</div>
						)}
					</div>
				)}

				{/* Footer: submitted timestamp */}
				<div className="mt-3 flex items-center gap-1.5 text-muted-foreground text-[11px]">
					<div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
					<span>Submitted {format(parseISO(request.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
				</div>
			</div>
		</div>
	);
}
