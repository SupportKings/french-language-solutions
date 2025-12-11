"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { format, parseISO } from "date-fns";
import { ArrowLeft, Calendar, CalendarClock, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { cancelRescheduleRequest } from "../actions/cancelRescheduleRequest";
import type {
	PrivateEnrollment,
	RescheduleRequest,
	RescheduleRequestStatus,
} from "../types";
import { RequestCard } from "./RequestCard";
import { RescheduleRequestModal } from "./RescheduleRequestModal";

interface ReschedulingPageClientProps {
	enrollment: PrivateEnrollment;
	requests: RescheduleRequest[];
}

const MAX_REQUESTS = 3;

export function ReschedulingPageClient({
	enrollment,
	requests,
}: ReschedulingPageClientProps) {
	const router = useRouter();
	const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
	const [isPending, startTransition] = useTransition();

	// Count active (pending) requests
	const activeRequestCount = requests.filter(
		(r) => r.status === "pending",
	).length;
	const remainingRequests = MAX_REQUESTS - activeRequestCount;

	// Sort requests by createdAt descending (newest first)
	const sortedRequests = [...requests].sort(
		(a, b) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	const handleCancel = async (requestId: string) => {
		startTransition(async () => {
			const result = await cancelRescheduleRequest({ requestId });
			if (result?.data?.success) {
				router.refresh();
			}
		});
	};

	const handleSuccess = () => {
		router.refresh();
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link
						href="/dashboard"
						className="rounded-lg p-2 transition-colors hover:bg-muted"
					>
						<ArrowLeft className="h-5 w-5" />
					</Link>
					<div>
						<h1 className="font-bold text-2xl tracking-tight">
							Reschedule Requests
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							Manage your class rescheduling requests
						</p>
					</div>
				</div>
				<Button
					onClick={() => setIsRequestModalOpen(true)}
					className="gap-1.5"
					disabled={remainingRequests <= 0}
				>
					<Plus className="h-4 w-4" />
					New Request
				</Button>
			</div>

			{/* Allowance Card */}
			<div
				className={cn(
					"group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4",
				)}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600">
							<CalendarClock className="h-5 w-5 text-white" />
						</div>
						<div>
							<h3 className="font-medium">Request Allowance</h3>
							<p className="text-muted-foreground text-sm">
								Per 2-week period
							</p>
						</div>
					</div>
					<div className="text-right">
						<div
							className={cn(
								"font-bold text-3xl",
								remainingRequests > 0 ? "text-primary" : "text-amber-600",
							)}
						>
							{remainingRequests}/{MAX_REQUESTS}
						</div>
						<p className="text-muted-foreground text-sm">remaining</p>
					</div>
				</div>
			</div>

			{/* Requests List */}
			<div className="space-y-4">
				<h2 className="font-semibold text-lg">Request History</h2>

				{sortedRequests.length === 0 ? (
					<div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 py-12 text-center">
						<Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
						<p className="font-medium text-muted-foreground">
							No reschedule requests yet
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							Your reschedule requests from the past 2 weeks will appear here
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{sortedRequests.map((request) => (
							<RequestCard
								key={request.id}
								request={request}
								onCancel={handleCancel}
								showCancelButton={true}
							/>
						))}
					</div>
				)}
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
