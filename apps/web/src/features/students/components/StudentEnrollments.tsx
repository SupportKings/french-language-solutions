"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
	Calendar, 
	Users, 
	AlertCircle, 
	Edit2, 
	Mail, 
	Phone,
	School,
	MapPin,
	Clock
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

const statusColors = {
	paid: "bg-green-500/10 text-green-700 border-green-200",
	welcome_package_sent: "bg-blue-500/10 text-blue-700 border-blue-200",
	contract_signed: "bg-purple-500/10 text-purple-700 border-purple-200",
	interested: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
	beginner_form_filled: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
	dropped_out: "bg-red-500/10 text-red-700 border-red-200",
	declined_contract: "bg-red-500/10 text-red-700 border-red-200",
	contract_abandoned: "bg-orange-500/10 text-orange-700 border-orange-200",
	payment_abandoned: "bg-orange-500/10 text-orange-700 border-orange-200",
};

interface StudentEnrollmentsProps {
	studentId: string;
}

export function StudentEnrollments({ studentId }: StudentEnrollmentsProps) {
	const router = useRouter();
	const pathname = usePathname();
	const queryClient = useQueryClient();
	
	// Get current URL for redirectTo
	const currentUrl = `${pathname}?tab=enrollments`;
	
	// Invalidate cache when component mounts (useful when returning from forms)
	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.get('tab') === 'enrollments') {
			queryClient.invalidateQueries({ queryKey: ["student-enrollments", studentId] });
		}
	}, [queryClient, studentId, pathname]);
	
	const { data: enrollments, isLoading } = useQuery({
		queryKey: ["student-enrollments", studentId],
		queryFn: async () => {
			const response = await fetch(`/api/enrollments?studentId=${studentId}&limit=50`);
			if (!response.ok) throw new Error("Failed to fetch enrollments");
			const result = await response.json();
			return result.enrollments || [];
		},
	});

	if (isLoading) {
		return (
			<div className="grid gap-2">
				{[1, 2, 3].map((i) => (
					<div key={i} className="group relative overflow-hidden rounded-lg border bg-card animate-pulse">
						<div className="p-3">
							<div className="flex items-start justify-between gap-3">
								<div className="flex items-start gap-3 flex-1 min-w-0">
									<div className="h-9 w-9 rounded-full bg-muted flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<div className="space-y-2">
											<div className="h-4 w-32 bg-muted rounded" />
											<div className="flex items-center gap-3">
												<div className="h-3 w-40 bg-muted rounded" />
												<div className="h-3 w-24 bg-muted rounded" />
											</div>
											<div className="flex items-center gap-2 mt-2">
												<div className="h-5 w-20 bg-muted rounded" />
												<div className="h-4 w-16 bg-muted rounded" />
											</div>
										</div>
									</div>
									<div className="h-8 w-8 bg-muted rounded" />
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (!enrollments || enrollments.length === 0) {
		return (
			<div className="text-center py-8 bg-muted/30 rounded-lg">
				<School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<p className="text-muted-foreground">No enrollments yet</p>
			</div>
		);
	}

	return (
		<div className="grid gap-2">
			{enrollments.map((enrollment: any) => {
				const enrollmentDate = enrollment.created_at
					? new Date(enrollment.created_at)
					: null;
				const statusColor =
					statusColors[enrollment.status as keyof typeof statusColors] || 
					"bg-gray-500/10 text-gray-700 border-gray-200";

				// Get cohort initials
				const cohortInitials = enrollment.cohorts?.products?.format === 'group' ? 'GC' : 'PC';

				return (
					<div
						key={enrollment.id}
						className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-md transition-all duration-200 cursor-pointer"
						onClick={() => router.push(`/admin/students/enrollments/${enrollment.id}?redirectTo=${encodeURIComponent(currentUrl)}`)}
					>
						<div className="p-3">
							<div className="flex items-start justify-between gap-3">
								<div className="flex items-start gap-3 flex-1 min-w-0">
									<div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
										<span className="text-xs font-semibold text-primary">
											{cohortInitials}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<Link
													href={`/admin/classes/${enrollment.cohort_id}`}
													className="font-medium text-sm hover:text-primary hover:underline transition-colors truncate block"
												>
													{enrollment.cohorts?.title ? 
														enrollment.cohorts.title :
														`${enrollment.cohorts?.products?.format === 'group' ? 'Group' : 'Private'} - ${enrollment.cohorts?.starting_level?.display_name || enrollment.cohorts?.starting_level?.code?.toUpperCase() || 'N/A'}`
													}
												</Link>
												<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
													{enrollment.cohorts?.start_date && (
														<div className="flex items-center gap-1">
															<Calendar className="h-3 w-3" />
															<span>
																Starts {format(new Date(enrollment.cohorts.start_date), "MMM d, yyyy")}
															</span>
														</div>
													)}
													{enrollment.cohorts?.room_type && (
														<div className="flex items-center gap-1">
															<MapPin className="h-3 w-3" />
															<span className="capitalize">
																{enrollment.cohorts.room_type.replace(/_/g, ' ').replace('for one to one', 'One-to-One')}
															</span>
														</div>
													)}
													{enrollmentDate && (
														<div className="flex items-center gap-1">
															<Clock className="h-3 w-3" />
															<span>
																Enrolled {enrollmentDate.toLocaleDateString("en-US", {
																	month: "short",
																	day: "numeric",
																	year: "numeric",
																})}
															</span>
														</div>
													)}
												</div>
											</div>
										</div>

										<div className="flex items-center gap-2 mt-2">
											<Badge
												variant="outline"
												className={`text-[10px] h-5 px-2 font-medium ${statusColor}`}
											>
												{enrollment.status
													?.replace(/_/g, " ")
													.replace(/\b\w/g, (l: string) =>
														l.toUpperCase()
													)}
											</Badge>
										</div>
									</div>

									<Button
										variant="outline"
										size="sm"
										className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
										onClick={(e) => {
											e.stopPropagation();
											router.push(
												`/admin/students/enrollments/${enrollment.id}/edit?redirectTo=${encodeURIComponent(currentUrl)}`
											);
										}}
									>
										<Edit2 className="h-3.5 w-3.5 mr-1" />
										Edit
									</Button>
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}