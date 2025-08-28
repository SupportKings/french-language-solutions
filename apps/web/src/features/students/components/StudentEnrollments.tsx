"use client";

import { useEffect } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	AlertCircle,
	Calendar,
	Clock,
	Edit2,
	Mail,
	MapPin,
	Phone,
	School,
	Users,
} from "lucide-react";
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
		if (searchParams.get("tab") === "enrollments") {
			queryClient.invalidateQueries({
				queryKey: ["student-enrollments", studentId],
			});
		}
	}, [queryClient, studentId, pathname]);

	const { data: enrollments, isLoading } = useQuery({
		queryKey: ["student-enrollments", studentId],
		queryFn: async () => {
			const response = await fetch(
				`/api/enrollments?studentId=${studentId}&limit=50`,
			);
			if (!response.ok) throw new Error("Failed to fetch enrollments");
			const result = await response.json();
			return result.enrollments || [];
		},
	});

	if (isLoading) {
		return (
			<div className="grid gap-2">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="group relative animate-pulse overflow-hidden rounded-lg border bg-card"
					>
						<div className="p-3">
							<div className="flex items-start justify-between gap-3">
								<div className="flex min-w-0 flex-1 items-start gap-3">
									<div className="h-9 w-9 flex-shrink-0 rounded-full bg-muted" />
									<div className="min-w-0 flex-1">
										<div className="space-y-2">
											<div className="h-4 w-32 rounded bg-muted" />
											<div className="flex items-center gap-3">
												<div className="h-3 w-40 rounded bg-muted" />
												<div className="h-3 w-24 rounded bg-muted" />
											</div>
											<div className="mt-2 flex items-center gap-2">
												<div className="h-5 w-20 rounded bg-muted" />
												<div className="h-4 w-16 rounded bg-muted" />
											</div>
										</div>
									</div>
									<div className="h-8 w-8 rounded bg-muted" />
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
			<div className="rounded-lg bg-muted/30 py-8 text-center">
				<School className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
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
				const cohortInitials =
					enrollment.cohorts?.products?.format === "group" ? "GC" : "PC";

				return (
					<div
						key={enrollment.id}
						className="group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition-all duration-200 hover:shadow-md"
						onClick={() =>
							router.push(
								`/admin/students/enrollments/${enrollment.id}?redirectTo=${encodeURIComponent(currentUrl)}`,
							)
						}
					>
						<div className="p-3">
							<div className="flex items-start justify-between gap-3">
								<div className="flex min-w-0 flex-1 items-start gap-3">
									<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
										<span className="font-semibold text-primary text-xs">
											{cohortInitials}
										</span>
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0 flex-1">
												<Link
													href={`/admin/cohorts/${enrollment.cohort_id}`}
													className="block truncate font-medium text-sm transition-colors hover:text-primary hover:underline"
												>
													{enrollment.cohorts?.products?.format
														? `${enrollment.cohorts.products.format.charAt(0).toUpperCase() + enrollment.cohorts.products.format.slice(1)} Cohort`
														: "Cohort"}{" "}
													-{" "}
													{enrollment.cohorts?.starting_level?.display_name ||
														enrollment.cohorts?.starting_level?.code?.toUpperCase() ||
														"N/A"}
												</Link>
												<div className="mt-1 flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
													{enrollment.cohorts?.start_date && (
														<div className="flex items-center gap-1">
															<Calendar className="h-3 w-3" />
															<span>
																Starts{" "}
																{format(
																	new Date(enrollment.cohorts.start_date),
																	"MMM d, yyyy",
																)}
															</span>
														</div>
													)}
													{enrollment.cohorts?.room_type && (
														<div className="flex items-center gap-1">
															<MapPin className="h-3 w-3" />
															<span className="capitalize">
																{enrollment.cohorts.room_type
																	.replace(/_/g, " ")
																	.replace("for one to one", "One-to-One")}
															</span>
														</div>
													)}
													{enrollmentDate && (
														<div className="flex items-center gap-1">
															<Clock className="h-3 w-3" />
															<span>
																Enrolled{" "}
																{enrollmentDate.toLocaleDateString("en-US", {
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

										<div className="mt-2 flex items-center gap-2">
											<Badge
												variant="outline"
												className={`h-5 px-2 font-medium text-[10px] ${statusColor}`}
											>
												{enrollment.status
													?.replace(/_/g, " ")
													.replace(/\b\w/g, (l: string) => l.toUpperCase())}
											</Badge>
										</div>
									</div>

									<Button
										variant="outline"
										size="sm"
										className="h-7 px-2 opacity-0 transition-opacity group-hover:opacity-100"
										onClick={(e) => {
											e.stopPropagation();
											router.push(
												`/admin/students/enrollments/${enrollment.id}/edit?redirectTo=${encodeURIComponent(currentUrl)}`,
											);
										}}
									>
										<Edit2 className="mr-1 h-3.5 w-3.5" />
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
