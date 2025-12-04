"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { format, parseISO } from "date-fns";
import { Calendar, CheckCircle2, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { approveRescheduleRequest } from "../actions/approveRescheduleRequest";
import { useInvalidateRescheduleRequests } from "../queries/rescheduleRequests.queries";
import type { RescheduleRequest } from "../types";

interface AcceptRequestModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	request: RescheduleRequest | null;
}

export function AcceptRequestModal({
	open,
	onOpenChange,
	request,
}: AcceptRequestModalProps) {
	const [isApproving, setIsApproving] = useState(false);
	const [notes, setNotes] = useState("");
	const invalidateRequests = useInvalidateRescheduleRequests();

	// Handle escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && open && !isApproving) {
				onOpenChange(false);
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [open, isApproving, onOpenChange]);

	// Prevent body scroll when modal is open
	useEffect(() => {
		if (open) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	if (!open || !request) return null;

	const studentName =
		request.student.first_name || request.student.full_name || "Student";
	const originalDate = parseISO(request.original_class_date);

	const handleApprove = async () => {
		setIsApproving(true);

		try {
			const result = await approveRescheduleRequest({
				requestId: request.id,
				adminNotes: notes.trim() || undefined,
			});

			if (result?.data?.success) {
				toast.success("Request approved successfully");
				invalidateRequests();
				setNotes("");
				onOpenChange(false);
			} else {
				toast.error(result?.data?.error || "Failed to approve request");
			}
		} catch (error) {
			console.error("Error approving request:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsApproving(false);
		}
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && !isApproving) {
			onOpenChange(false);
		}
	};

	const modalContent = (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
			onClick={handleBackdropClick}
		>
			<div className="w-full max-w-lg rounded-xl bg-background shadow-xl">
				{/* Header */}
				<div className="relative border-b px-6 py-5">
					<button
						type="button"
						onClick={() => !isApproving && onOpenChange(false)}
						disabled={isApproving}
						className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
					>
						<X className="h-5 w-5" />
					</button>

					<div className="flex flex-col items-center text-center">
						<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
							<CheckCircle2 className="h-6 w-6 text-emerald-600" />
						</div>
						<h2 className="font-semibold text-lg">Approve Reschedule Request</h2>
						<p className="mt-1 text-muted-foreground text-sm">
							Before approving, please ensure you've updated the class time in
							Google Calendar.
						</p>
					</div>
				</div>

				{/* Content */}
				<div className="space-y-4 px-6 py-5">
					{/* Important Notice */}
					<div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
						<div className="flex items-start gap-3">
							<Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
							<div className="space-y-1">
								<p className="font-medium text-amber-800 text-sm">
									Google Calendar Update Required
								</p>
								<p className="text-amber-700 text-sm">
									Please reschedule the event on Google Calendar before
									confirming this approval. The calendar update must be done
									manually.
								</p>
							</div>
						</div>
					</div>

					{/* Request Details */}
					<div className="space-y-3 rounded-lg border bg-muted/30 p-4">
						<div className="flex justify-between gap-4">
							<span className="shrink-0 text-muted-foreground text-sm">
								Student
							</span>
							<span className="font-medium text-right text-sm">
								{studentName}
							</span>
						</div>
						<div className="flex justify-between gap-4">
							<span className="shrink-0 text-muted-foreground text-sm">
								Original Class
							</span>
							<span className="font-medium text-right text-sm">
								{format(originalDate, "EEEE, MMM d")} at{" "}
								{format(originalDate, "h:mm a")}
							</span>
						</div>
						<div className="flex justify-between gap-4">
							<span className="shrink-0 text-muted-foreground text-sm">
								Requested Time
							</span>
							<span className="font-medium text-right text-sm">
								{request.proposed_datetime}
							</span>
						</div>
						{request.reason && (
							<div className="border-t pt-3">
								<span className="text-muted-foreground text-sm">Reason</span>
								<p className="mt-1 text-sm">{request.reason}</p>
							</div>
						)}
					</div>

					{/* Notes field */}
					<div className="space-y-2">
						<Label htmlFor="admin-notes" className="text-sm">
							Notes for student{" "}
							<span className="text-muted-foreground">(optional)</span>
						</Label>
						<Textarea
							id="admin-notes"
							placeholder="Add any notes or instructions for the student..."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							className="min-h-[80px] resize-none"
							disabled={isApproving}
						/>
						<p className="text-muted-foreground text-xs">
							This note will be visible to the student.
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="flex flex-col gap-2 border-t px-6 py-4">
					<Button
						onClick={handleApprove}
						disabled={isApproving}
						className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
					>
						{isApproving ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Approving...
							</>
						) : (
							<>
								<CheckCircle2 className="h-4 w-4" />
								I confirm the event has been rescheduled on Google Calendar
							</>
						)}
					</Button>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isApproving}
						className="w-full"
					>
						Cancel
					</Button>
				</div>
			</div>
		</div>
	);

	return typeof document !== "undefined"
		? createPortal(modalContent, document.body)
		: null;
}
