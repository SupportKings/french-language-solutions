"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { format, parseISO } from "date-fns";
import { Loader2, X, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { declineRescheduleRequest } from "../actions/declineRescheduleRequest";
import { useInvalidateRescheduleRequests } from "../queries/rescheduleRequests.queries";
import type { RescheduleRequest } from "../types";

interface DeclineRequestModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	request: RescheduleRequest | null;
}

export function DeclineRequestModal({
	open,
	onOpenChange,
	request,
}: DeclineRequestModalProps) {
	const [isDeclining, setIsDeclining] = useState(false);
	const [notes, setNotes] = useState("");
	const invalidateRequests = useInvalidateRescheduleRequests();

	// Handle escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && open && !isDeclining) {
				onOpenChange(false);
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [open, isDeclining, onOpenChange]);

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

	const handleDecline = async () => {
		setIsDeclining(true);

		try {
			const result = await declineRescheduleRequest({
				requestId: request.id,
				adminNotes: notes.trim() || undefined,
			});

			if (result?.data?.success) {
				toast.success("Request declined");
				invalidateRequests();
				setNotes("");
				onOpenChange(false);
			} else {
				toast.error(result?.data?.error || "Failed to decline request");
			}
		} catch (error) {
			console.error("Error declining request:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsDeclining(false);
		}
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && !isDeclining) {
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
						onClick={() => !isDeclining && onOpenChange(false)}
						disabled={isDeclining}
						className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
					>
						<X className="h-5 w-5" />
					</button>

					<div className="flex flex-col items-center text-center">
						<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
							<XCircle className="h-6 w-6 text-red-600" />
						</div>
						<h2 className="font-semibold text-lg">Decline Reschedule Request</h2>
						<p className="mt-1 text-muted-foreground text-sm">
							Are you sure you want to decline this request?
						</p>
					</div>
				</div>

				{/* Content */}
				<div className="space-y-4 px-6 py-5">
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
						<Label htmlFor="decline-notes" className="text-sm">
							Reason for declining{" "}
							<span className="text-muted-foreground">(optional)</span>
						</Label>
						<Textarea
							id="decline-notes"
							placeholder="Let the student know why the request was declined..."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							className="min-h-[80px] resize-none"
							disabled={isDeclining}
						/>
						<p className="text-muted-foreground text-xs">
							This note will be visible to the student.
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="flex flex-col gap-2 border-t px-6 py-4">
					<Button
						onClick={handleDecline}
						disabled={isDeclining}
						variant="destructive"
						className="w-full gap-2"
					>
						{isDeclining ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Declining...
							</>
						) : (
							<>
								<XCircle className="h-4 w-4" />
								Decline Request
							</>
						)}
					</Button>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDeclining}
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
