"use client";

import { useEffect } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	Calendar,
	CheckCircle,
	ExternalLink,
	Plus,
	XCircle,
} from "lucide-react";

const resultColors = {
	requested: "secondary",
	scheduled: "default",
	session_held: "outline",
	level_determined: "success",
};

const resultLabels = {
	requested: "Requested",
	scheduled: "Scheduled",
	session_held: "Session Held",
	level_determined: "Level Determined",
};

interface StudentAssessmentsProps {
	studentId: string;
	canScheduleAssessment?: boolean;
}

export function StudentAssessments({
	studentId,
	canScheduleAssessment = true,
}: StudentAssessmentsProps) {
	const router = useRouter();
	const pathname = usePathname();
	const queryClient = useQueryClient();

	// Get current URL for redirectTo
	const currentUrl = `${pathname}?tab=assessments`;

	// Invalidate cache when component mounts (useful when returning from forms)
	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.get("tab") === "assessments") {
			queryClient.invalidateQueries({
				queryKey: ["student-assessments", studentId],
			});
		}
	}, [queryClient, studentId, pathname]);

	const { data: assessments, isLoading } = useQuery({
		queryKey: ["student-assessments", studentId],
		queryFn: async () => {
			const response = await fetch(
				`/api/assessments?studentId=${studentId}&limit=50`,
			);
			if (!response.ok) throw new Error("Failed to fetch assessments");
			const result = await response.json();
			return result.assessments || [];
		},
	});

	if (isLoading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="flex items-center justify-between rounded-lg border p-4"
					>
						<div className="space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-24" />
						</div>
						<Skeleton className="h-6 w-16" />
					</div>
				))}
			</div>
		);
	}

	if (!assessments || assessments.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="mb-4 text-muted-foreground">No assessments yet</p>
				{canScheduleAssessment && (
					<Link
						href={`/admin/students/assessments/new?studentId=${studentId}&redirectTo=${encodeURIComponent(currentUrl)}`}
					>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Schedule Assessment
						</Button>
					</Link>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-muted-foreground text-sm">
					{assessments.length} assessment{assessments.length === 1 ? "" : "s"}
				</p>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Level</TableHead>
							<TableHead>Scheduled</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Paid</TableHead>
							<TableHead>Teacher</TableHead>
							<TableHead>Links</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{assessments.map((assessment: any) => (
							<TableRow
								key={assessment.id}
								className="cursor-pointer transition-colors hover:bg-muted/50"
								onClick={() =>
									router.push(
										`/admin/students/assessments/${assessment.id}?redirectTo=${encodeURIComponent(currentUrl)}`,
									)
								}
							>
								<TableCell>
									{assessment.language_level?.display_name ||
									assessment.language_level?.code ? (
										<Badge variant="outline">
											{assessment.language_level.display_name ||
												assessment.language_level.code.toUpperCase()}
										</Badge>
									) : (
										<span className="text-muted-foreground">TBD</span>
									)}
								</TableCell>
								<TableCell>
									{assessment.scheduled_for ? (
										<div className="flex items-center gap-1">
											<Calendar className="h-3 w-3 text-muted-foreground" />
											<span className="text-sm">
												{format(
													new Date(assessment.scheduled_for),
													"MMM d, yyyy",
												)}
											</span>
										</div>
									) : (
										<span className="text-muted-foreground">Not scheduled</span>
									)}
								</TableCell>
								<TableCell>
									<Badge variant={(resultColors as any)[assessment.result]}>
										{(resultLabels as any)[assessment.result]}
									</Badge>
								</TableCell>
								<TableCell>
									{assessment.is_paid ? (
										<CheckCircle className="h-4 w-4 text-green-600" />
									) : (
										<XCircle className="h-4 w-4 text-muted-foreground" />
									)}
								</TableCell>
								<TableCell>
									<p className="text-sm">-</p>
								</TableCell>
								<TableCell>
									<div className="flex gap-1">
										{assessment.calendar_event_url && (
											<Button size="sm" variant="ghost" asChild>
												<a
													href={assessment.calendar_event_url}
													target="_blank"
													rel="noopener noreferrer"
													title="Calendar Event"
												>
													<Calendar className="h-3 w-3" />
												</a>
											</Button>
										)}
										{assessment.meeting_recording_url && (
											<Button size="sm" variant="ghost" asChild>
												<a
													href={assessment.meeting_recording_url}
													target="_blank"
													rel="noopener noreferrer"
													title="Recording"
												>
													<ExternalLink className="h-3 w-3" />
												</a>
											</Button>
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
