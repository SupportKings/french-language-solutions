"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
	Calendar,
	Clock,
	User,
	ExternalLink,
	AlertCircle,
	CheckCircle2,
	XCircle,
	Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface AutomatedFollowUp {
	id: string;
	student_id: string;
	sequence_id: string;
	status: "activated" | "ongoing" | "answer_received" | "disabled";
	started_at: string;
	last_message_sent_at?: string;
	completed_at?: string;
	created_at: string;
	updated_at: string;
	sequence: {
		id: string;
		display_name: string;
		subject: string;
		first_follow_up_delay_minutes: number;
	};
}

interface StudentFollowUpsProps {
	studentId: string;
}

const statusConfig = {
	activated: {
		label: "Activated",
		icon: AlertCircle,
		color: "bg-blue-500/10 text-blue-700 border-blue-200",
	},
	ongoing: {
		label: "Ongoing",
		icon: Clock,
		color: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
	},
	answer_received: {
		label: "Answer Received",
		icon: CheckCircle2,
		color: "bg-green-500/10 text-green-700 border-green-200",
	},
	disabled: {
		label: "Disabled",
		icon: XCircle,
		color: "bg-gray-500/10 text-gray-700 border-gray-200",
	},
};

export function StudentFollowUps({ studentId }: StudentFollowUpsProps) {
	const [followUps, setFollowUps] = useState<AutomatedFollowUp[]>([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const pathname = usePathname();
	
	// Get current URL for redirectTo
	const currentUrl = `${pathname}?tab=followups`;

	// Fetch follow-ups data
	const fetchFollowUps = async () => {
		try {
			const response = await fetch(`/api/students/${studentId}/followups`);
			if (!response.ok) throw new Error("Failed to fetch follow-ups");
			const data = await response.json();
			setFollowUps(data);
		} catch (error) {
			console.error("Error fetching follow-ups:", error);
			toast.error("Failed to load follow-ups");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchFollowUps();
	}, [studentId]);
	
	// Refresh data when returning from forms
	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.get('tab') === 'followups') {
			fetchFollowUps();
		}
	}, [pathname]);

	if (loading) {
		return (
			<div className="space-y-3">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="border rounded-lg p-4">
						<div className="flex items-start gap-4">
							<Skeleton className="h-10 w-10 rounded" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-2/3" />
								<Skeleton className="h-3 w-full" />
								<div className="flex gap-2">
									<Skeleton className="h-5 w-16" />
									<Skeleton className="h-5 w-16" />
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (followUps.length === 0) {
		return (
			<div className="text-center py-8 bg-muted/30 rounded-lg">
				<Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
				<p className="text-muted-foreground mb-1">No follow-ups yet</p>
				<p className="text-xs text-muted-foreground">Follow-ups will appear here once created</p>
			</div>
		);
	}

	// Sort follow-ups by started date (newest first)
	const sortedFollowUps = followUps.sort((a, b) => 
		new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
	);

	return (
		<div className="space-y-3">
			{sortedFollowUps.map((followUp) => {
				const statusInfo = statusConfig[followUp.status] || statusConfig.activated; // Default to activated if status not found
				const StatusIcon = statusInfo.icon;
				const isOngoing = followUp.status === 'ongoing';

				return (
					<div
						key={followUp.id}
						className={cn(
							"border rounded-lg p-4 transition-all duration-200 hover:shadow-md",
							isOngoing && "border-yellow-200 bg-yellow-50/30"
						)}
					>
						<div className="flex items-start gap-4">
							<div className={cn(
								"h-10 w-10 rounded-lg flex items-center justify-center",
								isOngoing ? "bg-yellow-100 text-yellow-600" : "bg-muted/50 text-muted-foreground"
							)}>
								<StatusIcon className="h-5 w-5" />
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-3">
									<div className="flex-1">
										<h3 className="font-medium text-sm leading-tight mb-1">
											{followUp.sequence.display_name}
										</h3>
										<p className="text-xs text-muted-foreground mb-2 line-clamp-2">
											{followUp.sequence.subject}
										</p>
									</div>
									
									<Button
										asChild
										variant="ghost"
										size="sm"
										className="h-8 px-2 flex-shrink-0"
									>
										<Link href={`/admin/follow-ups/${followUp.id}?redirectTo=${encodeURIComponent(currentUrl)}`}>
											<ExternalLink className="h-3.5 w-3.5" />
										</Link>
									</Button>
								</div>

								<div className="flex items-center gap-2 flex-wrap mt-2">
									<Badge variant="outline" className={cn("text-xs", statusInfo.color)}>
										{statusInfo.label}
									</Badge>

									<div className="flex items-center gap-1 text-xs text-muted-foreground">
										<Calendar className="h-3 w-3" />
										<span>Started: {format(new Date(followUp.started_at), "MMM d, yyyy")}</span>
									</div>

									{followUp.last_message_sent_at && (
										<div className="flex items-center gap-1 text-xs text-muted-foreground">
											<Clock className="h-3 w-3" />
											<span>Last message: {format(new Date(followUp.last_message_sent_at), "MMM d, yyyy")}</span>
										</div>
									)}

									{followUp.completed_at && (
										<div className="flex items-center gap-1 text-xs text-muted-foreground">
											<CheckCircle2 className="h-3 w-3" />
											<span>Completed: {format(new Date(followUp.completed_at), "MMM d, yyyy")}</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}