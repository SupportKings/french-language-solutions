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
	Phone,
	Mail,
	MessageSquare,
	Hand,
	Video,
	FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface Touchpoint {
	id: string;
	student_id: string;
	type: "call" | "email" | "sms" | "meeting" | "video_call" | "note";
	title: string;
	description?: string;
	contact_date: string;
	duration_minutes?: number;
	outcome?: string;
	created_at: string;
	updated_at: string;
	created_by?: {
		id: string;
		name: string;
	};
}

interface StudentTouchpointsProps {
	studentId: string;
}

const touchpointConfig = {
	call: {
		label: "Phone Call",
		icon: Phone,
		color: "bg-blue-500/10 text-blue-700 border-blue-200",
	},
	email: {
		label: "Email",
		icon: Mail,
		color: "bg-green-500/10 text-green-700 border-green-200",
	},
	sms: {
		label: "SMS",
		icon: MessageSquare,
		color: "bg-purple-500/10 text-purple-700 border-purple-200",
	},
	whatsapp: {
		label: "WhatsApp",
		icon: MessageSquare,
		color: "bg-green-500/10 text-green-700 border-green-200",
	},
};

export function StudentTouchpoints({ studentId }: StudentTouchpointsProps) {
	const [touchpoints, setTouchpoints] = useState<Touchpoint[]>([]);
	const [loading, setLoading] = useState(true);

	// Fetch touchpoints data
	const fetchTouchpoints = async () => {
		try {
			const response = await fetch(`/api/students/${studentId}/touchpoints`);
			if (!response.ok) throw new Error("Failed to fetch touchpoints");
			const data = await response.json();
			setTouchpoints(data);
		} catch (error) {
			console.error("Error fetching touchpoints:", error);
			toast.error("Failed to load touchpoints");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTouchpoints();
	}, [studentId]);

	if (loading) {
		return (
			<div className="space-y-3">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="border rounded-lg p-4">
						<div className="flex items-start gap-4">
							<Skeleton className="h-10 w-10 rounded" />
							<div className="flex-1 space-y-2">
								<div className="flex items-center gap-2">
									<Skeleton className="h-4 w-1/3" />
									<Skeleton className="h-5 w-16" />
								</div>
								<Skeleton className="h-3 w-full" />
								<Skeleton className="h-3 w-2/3" />
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (touchpoints.length === 0) {
		return (
			<div className="text-center py-8 bg-muted/30 rounded-lg">
				<Hand className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
				<p className="text-muted-foreground mb-1">No touchpoints yet</p>
				<p className="text-xs text-muted-foreground">Communication touchpoints will appear here once logged</p>
			</div>
		);
	}

	// Sort touchpoints by date (newest first)
	const sortedTouchpoints = touchpoints.sort((a, b) => 
		new Date(b.contact_date).getTime() - new Date(a.contact_date).getTime()
	);

	// Group touchpoints by month
	const groupedTouchpoints = sortedTouchpoints.reduce((acc, touchpoint) => {
		const date = new Date(touchpoint.contact_date);
		const monthKey = format(date, "MMMM yyyy");
		if (!acc[monthKey]) {
			acc[monthKey] = [];
		}
		acc[monthKey].push(touchpoint);
		return acc;
	}, {} as Record<string, Touchpoint[]>);

	return (
		<div className="space-y-6">
			{Object.entries(groupedTouchpoints).map(([month, monthTouchpoints]) => (
				<div key={month} className="space-y-3">
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4 text-muted-foreground" />
						<h3 className="font-medium text-sm text-muted-foreground">{month}</h3>
						<div className="flex-1 h-px bg-border" />
					</div>

					{monthTouchpoints.map((touchpoint) => {
						const typeInfo = touchpointConfig[touchpoint.type];
						const TypeIcon = typeInfo.icon;

						return (
							<div
								key={touchpoint.id}
								className="border rounded-lg p-4 transition-all duration-200 hover:shadow-md"
							>
								<div className="flex items-start gap-4">
									<div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
										<TypeIcon className="h-5 w-5 text-muted-foreground" />
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-3">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<h3 className="font-medium text-sm">
														{touchpoint.title}
													</h3>
													<Badge variant="outline" className={cn("text-xs", typeInfo.color)}>
														{typeInfo.label}
													</Badge>
												</div>
												
												{touchpoint.description && (
													<p className="text-xs text-muted-foreground mb-2">
														{touchpoint.description}
													</p>
												)}

												{touchpoint.outcome && (
													<div className="text-xs bg-muted/30 rounded p-2 mb-2">
														<span className="font-medium">Outcome: </span>
														{touchpoint.outcome}
													</div>
												)}
											</div>
											
											<Button
												asChild
												variant="ghost"
												size="sm"
												className="h-8 px-2 flex-shrink-0"
											>
												<Link href={`/admin/touchpoints/${touchpoint.id}`}>
													<ExternalLink className="h-3.5 w-3.5" />
												</Link>
											</Button>
										</div>

										<div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												<span>
													{format(new Date(touchpoint.contact_date), "MMM d, yyyy 'at' h:mm a")}
												</span>
											</div>

											{touchpoint.duration_minutes && (
												<div className="flex items-center gap-1">
													<span>{touchpoint.duration_minutes} min</span>
												</div>
											)}

											{touchpoint.created_by && (
												<div className="flex items-center gap-1">
													<User className="h-3 w-3" />
													<span>{touchpoint.created_by.name}</span>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			))}
		</div>
	);
}