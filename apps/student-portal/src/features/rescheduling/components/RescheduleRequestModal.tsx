"use client";

import { useState, useTransition } from "react";

import { format } from "date-fns";
import { AlertCircle, ArrowLeft, Calendar, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createRescheduleRequest } from "../actions/createRescheduleRequest";
import type { FutureClass, RescheduleRequest } from "../types";
import { generateFutureClasses } from "../utils/generateFutureClasses";
import type { PrivateEnrollment } from "../types";
import { FutureClassCard } from "./FutureClassCard";

interface RescheduleRequestModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	enrollment: PrivateEnrollment;
	existingRequests: RescheduleRequest[];
	activeRequestCount: number;
	onSuccess: () => void;
}

const MAX_REQUESTS = 3;

export function RescheduleRequestModal({
	open,
	onOpenChange,
	enrollment,
	existingRequests,
	activeRequestCount,
	onSuccess,
}: RescheduleRequestModalProps) {
	const [selectedClass, setSelectedClass] = useState<FutureClass | null>(null);
	const [proposedDatetime, setProposedDatetime] = useState("");
	const [reason, setReason] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	// Generate future classes
	const futureClasses = generateFutureClasses(
		enrollment.weeklySessions,
		enrollment.cohortId,
		enrollment.cohortStartDate,
		existingRequests,
	);

	const remainingRequests = MAX_REQUESTS - activeRequestCount;
	const canSubmit = remainingRequests > 0;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedClass || !proposedDatetime.trim()) return;

		setError(null);

		startTransition(async () => {
			const result = await createRescheduleRequest({
				cohortId: enrollment.cohortId,
				originalClassDate: selectedClass.date.toISOString(),
				proposedDatetime: proposedDatetime.trim(),
				reason: reason.trim() || undefined,
			});

			if (result?.data?.success) {
				// Reset form
				setSelectedClass(null);
				setProposedDatetime("");
				setReason("");
				onOpenChange(false);
				onSuccess();
			} else {
				setError(result?.data?.error || "Failed to submit request. Please try again.");
			}
		});
	};

	const handleBack = () => {
		setSelectedClass(null);
		setProposedDatetime("");
		setReason("");
		setError(null);
	};

	const handleClose = () => {
		setSelectedClass(null);
		setProposedDatetime("");
		setReason("");
		setError(null);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px]">
				<DialogHeader className="space-y-1 pb-4">
					<DialogTitle className="flex items-center gap-2 font-bold text-xl">
						{selectedClass && (
							<button
								type="button"
								onClick={handleBack}
								className="rounded-md p-1 transition-colors hover:bg-muted"
							>
								<ArrowLeft className="h-5 w-5" />
							</button>
						)}
						<Calendar className="h-5 w-5 text-primary" />
						{selectedClass ? "Request Details" : "Request Reschedule"}
					</DialogTitle>
					<DialogDescription>
						{selectedClass
							? `Reschedule your class on ${format(selectedClass.date, "MMMM d, yyyy")}`
							: "Select a class you'd like to reschedule"}
					</DialogDescription>
				</DialogHeader>

				{/* Remaining requests indicator */}
				<div
					className={`rounded-lg border p-3 text-sm ${
						remainingRequests > 0
							? "border-primary/20 bg-primary/5"
							: "border-amber-200 bg-amber-50"
					}`}
				>
					{remainingRequests > 0 ? (
						<span>
							You have{" "}
							<span className="font-semibold">{remainingRequests}</span> of{" "}
							{MAX_REQUESTS} reschedule requests available this period.
						</span>
					) : (
						<div className="flex items-center gap-2 text-amber-800">
							<AlertCircle className="h-4 w-4" />
							<span>
								You've used all {MAX_REQUESTS} reschedule requests for this
								2-week period.
							</span>
						</div>
					)}
				</div>

				{!selectedClass ? (
					// Class selection view
					<div className="space-y-3">
						{futureClasses.length === 0 ? (
							<div className="rounded-lg border border-border/50 bg-muted/30 py-8 text-center">
								<Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
								<p className="font-medium text-muted-foreground">
									No upcoming classes available
								</p>
								<p className="mt-1 text-muted-foreground text-sm">
									Classes must be more than 24 hours away
								</p>
							</div>
						) : (
							futureClasses.map((futureClass) => (
								<FutureClassCard
									key={futureClass.date.toISOString()}
									futureClass={futureClass}
									isSelected={false}
									onSelect={() => canSubmit && setSelectedClass(futureClass)}
								/>
							))
						)}
					</div>
				) : (
					// Request form view
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Selected class summary */}
						<div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
							<div className="font-medium">
								{format(selectedClass.date, "EEEE, MMMM d, yyyy")}
							</div>
							<div className="text-muted-foreground text-sm">
								{selectedClass.startTime} - {selectedClass.endTime}
								{selectedClass.teacher && ` with ${selectedClass.teacher.name}`}
							</div>
						</div>

						{/* Proposed datetime */}
						<div className="space-y-2">
							<Label htmlFor="proposedDatetime">
								Preferred date and time <span className="text-destructive">*</span>
							</Label>
							<Input
								id="proposedDatetime"
								placeholder="e.g., Tuesday Dec 10 at 3pm, or any weekday afternoon"
								value={proposedDatetime}
								onChange={(e) => setProposedDatetime(e.target.value)}
								disabled={isPending}
								required
							/>
							<p className="text-muted-foreground text-xs">
								Let us know when you're available and we'll try to accommodate
							</p>
						</div>

						{/* Reason (optional) */}
						<div className="space-y-2">
							<Label htmlFor="reason">
								Reason <span className="text-muted-foreground">(optional)</span>
							</Label>
							<Textarea
								id="reason"
								placeholder="Why do you need to reschedule this class?"
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								disabled={isPending}
								rows={3}
							/>
						</div>

						{/* Error message */}
						{error && (
							<div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
								<AlertCircle className="h-4 w-4" />
								<span>{error}</span>
							</div>
						)}

						{/* Submit button */}
						<div className="flex justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="outline"
								onClick={handleBack}
								disabled={isPending}
							>
								Back
							</Button>
							<Button
								type="submit"
								disabled={isPending || !proposedDatetime.trim()}
							>
								{isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Submitting...
									</>
								) : (
									"Submit Request"
								)}
							</Button>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
