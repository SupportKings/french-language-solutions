"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { format, parseISO } from "date-fns";
import { Calendar, CalendarClock, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type {
	PrivateEnrollment,
	RescheduleRequest,
	RescheduleRequestStatus,
} from "../types";
import { RescheduleRequestModal } from "./RescheduleRequestModal";

interface RescheduleRequestsSidebarProps {
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

export function RescheduleRequestsSidebar({
	enrollment,
	requests,
}: RescheduleRequestsSidebarProps) {
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
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-base">
						<CalendarClock className="h-4 w-4 text-primary" />
						Reschedule Requests
					</CardTitle>
					<Button
						onClick={() => setIsRequestModalOpen(true)}
						size="sm"
						variant="ghost"
						className="h-7 gap-1 rounded-md px-2 text-xs"
						disabled={remainingRequests <= 0}
					>
						<Plus className="h-3 w-3" />
						New
					</Button>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				{/* Request Allowance */}
				<div className="mb-3 flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-2.5">
					<div>
						<p className="text-[11px] text-muted-foreground uppercase tracking-wide">
							Allowance
						</p>
						<p className="text-xs text-muted-foreground">Per 2 weeks</p>
					</div>
					<div className="text-right">
						<div
							className={cn(
								"font-bold text-xl",
								remainingRequests > 0 ? "text-primary" : "text-amber-600",
							)}
						>
							{remainingRequests}/{MAX_REQUESTS}
						</div>
						<p className="text-[10px] text-muted-foreground">remaining</p>
					</div>
				</div>

				{/* Recent Requests */}
				{recentRequests.length > 0 ? (
					<div className="space-y-1.5">
						{recentRequests.map((request) => (
							<div
								key={request.id}
								className="rounded-lg border border-border/50 bg-muted/30 p-2"
							>
								<div className="mb-1.5 flex items-center justify-between">
									<div className="flex items-center gap-1.5">
										<Calendar className="h-3 w-3 text-muted-foreground" />
										<span className="text-xs">
											{format(parseISO(request.originalClassDate), "MMM d")}
										</span>
									</div>
									<span
										className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[request.status]}`}
									>
										{STATUS_LABELS[request.status]}
									</span>
								</div>
								{request.adminNotes && (
									<p className="text-[11px] text-muted-foreground line-clamp-1">
										Note: {request.adminNotes}
									</p>
								)}
							</div>
						))}
					</div>
				) : (
					<div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 py-6 text-center">
						<Calendar className="mx-auto mb-1.5 h-5 w-5 text-muted-foreground" />
						<p className="text-muted-foreground text-xs">
							No requests yet
						</p>
					</div>
				)}

				{/* View All Link */}
				{requests.length > 0 && (
					<Button
						variant="ghost"
						size="sm"
						className="mt-3 h-7 w-full gap-1 rounded-md text-muted-foreground text-xs transition-colors hover:bg-muted/50 hover:text-foreground"
						asChild
					>
						<Link href="/rescheduling">
							View all requests
							<ChevronRight className="h-3 w-3" />
						</Link>
					</Button>
				)}
			</CardContent>

			{/* Request Modal */}
			<RescheduleRequestModal
				open={isRequestModalOpen}
				onOpenChange={setIsRequestModalOpen}
				enrollment={enrollment}
				existingRequests={requests}
				activeRequestCount={activeRequestCount}
				onSuccess={handleSuccess}
			/>
		</Card>
	);
}
