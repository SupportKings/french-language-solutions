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

interface FollowUp {
	id: string;
	student_id: string;
	title: string;
	description?: string;
	follow_up_date: string;
	status: "pending" | "completed" | "cancelled";
	priority: "low" | "medium" | "high";
	created_at: string;
	updated_at: string;
	created_by?: {
		id: string;
		name: string;
	};
}

interface StudentFollowUpsProps {
	studentId: string;
}

const statusConfig = {
	pending: {
		label: "Pending",
		icon: AlertCircle,
		color: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
	},
	completed: {
		label: "Completed",
		icon: CheckCircle2,
		color: "bg-green-500/10 text-green-700 border-green-200",
	},
	cancelled: {
		label: "Cancelled",
		icon: XCircle,
		color: "bg-red-500/10 text-red-700 border-red-200",
	},
};

const priorityConfig = {
	low: {
		label: "Low",
		color: "bg-gray-500/10 text-gray-700 border-gray-200",
	},
	medium: {
		label: "Medium", 
		color: "bg-blue-500/10 text-blue-700 border-blue-200",
	},
	high: {
		label: "High",
		color: "bg-red-500/10 text-red-700 border-red-200",
	},
};

export function StudentFollowUps({ studentId }: StudentFollowUpsProps) {
	const [followUps, setFollowUps] = useState<FollowUp[]>([]);
	const [loading, setLoading] = useState(true);

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

	// Sort follow-ups by date (newest first)
	const sortedFollowUps = followUps.sort((a, b) => 
		new Date(b.follow_up_date).getTime() - new Date(a.follow_up_date).getTime()
	);

	return (
		<div className="space-y-3">
			{sortedFollowUps.map((followUp) => {
				const statusInfo = statusConfig[followUp.status];
				const priorityInfo = priorityConfig[followUp.priority];
				const StatusIcon = statusInfo.icon;
				const isOverdue = new Date(followUp.follow_up_date) < new Date() && followUp.status === 'pending';

				return (
					<div
						key={followUp.id}
						className={cn(
							"border rounded-lg p-4 transition-all duration-200 hover:shadow-md",
							isOverdue && "border-red-200 bg-red-50/30"
						)}
					>
						<div className="flex items-start gap-4">
							<div className={cn(
								"h-10 w-10 rounded-lg flex items-center justify-center",
								isOverdue ? "bg-red-100 text-red-600" : "bg-muted/50 text-muted-foreground"
							)}>
								<StatusIcon className="h-5 w-5" />
							</div>

							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-3">
									<div className="flex-1">
										<h3 className="font-medium text-sm leading-tight mb-1">
											{followUp.title}
										</h3>
										{followUp.description && (
											<p className="text-xs text-muted-foreground mb-2 line-clamp-2">
												{followUp.description}
											</p>
										)}
									</div>
									
									<Button
										asChild
										variant="ghost"
										size="sm"
										className="h-8 px-2 flex-shrink-0"
									>
										<Link href={`/admin/follow-ups/${followUp.id}`}>
											<ExternalLink className="h-3.5 w-3.5" />
										</Link>
									</Button>
								</div>

								<div className="flex items-center gap-2 flex-wrap mt-2">
									<Badge variant="outline" className={cn("text-xs", statusInfo.color)}>
										{statusInfo.label}
									</Badge>
									
									<Badge variant="outline" className={cn("text-xs", priorityInfo.color)}>
										{priorityInfo.label} Priority
									</Badge>

									<div className="flex items-center gap-1 text-xs text-muted-foreground">
										<Calendar className="h-3 w-3" />
										<span>
											{format(new Date(followUp.follow_up_date), "MMM d, yyyy")}
											{isOverdue && (
												<span className="text-red-600 font-medium ml-1">(Overdue)</span>
											)}
										</span>
									</div>

									{followUp.created_by && (
										<div className="flex items-center gap-1 text-xs text-muted-foreground">
											<User className="h-3 w-3" />
											<span>{followUp.created_by.name}</span>
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