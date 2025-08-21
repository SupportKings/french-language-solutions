"use client";

import { useQuery } from "@tanstack/react-query";
import { 
	Table, 
	TableBody, 
	TableCell, 
	TableHead, 
	TableHeader, 
	TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
	Plus, 
	Calendar,
	CheckCircle,
	XCircle,
	ExternalLink 
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

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
}

export function StudentAssessments({ studentId }: StudentAssessmentsProps) {
	const { data: assessments, isLoading } = useQuery({
		queryKey: ["student-assessments", studentId],
		queryFn: async () => {
			const response = await fetch(`/api/assessments?studentId=${studentId}&limit=50`);
			if (!response.ok) throw new Error("Failed to fetch assessments");
			const result = await response.json();
			return result.assessments || [];
		},
	});

	if (isLoading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="flex items-center justify-between rounded-lg border p-4">
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
			<div className="text-center py-8">
				<p className="text-muted-foreground mb-4">No assessments yet</p>
				<Link href={`/admin/students/assessments/new?studentId=${studentId}`}>
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Schedule Assessment
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{assessments.length} assessment{assessments.length === 1 ? '' : 's'}
				</p>
				<Link href={`/admin/students/assessments/new?studentId=${studentId}`}>
					<Button size="sm">
						<Plus className="mr-2 h-4 w-4" />
						Add Assessment
					</Button>
				</Link>
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
							<TableRow key={assessment.id}>
								<TableCell>
									{assessment.level ? (
										<Badge variant="outline">
											{assessment.level.toUpperCase()}
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
												{format(new Date(assessment.scheduled_for), "MMM d, yyyy")}
											</span>
										</div>
									) : (
										<span className="text-muted-foreground">Not scheduled</span>
									)}
								</TableCell>
								<TableCell>
									<Badge variant={resultColors[assessment.result] as any}>
										{resultLabels[assessment.result]}
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
									<p className="text-sm">
										{assessment.interview_held_by ? 
											`${assessment.interview_held_by.first_name} ${assessment.interview_held_by.last_name}`.trim() :
										 assessment.level_checked_by ? 
											`${assessment.level_checked_by.first_name} ${assessment.level_checked_by.last_name}`.trim() :
										 "-"}
									</p>
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

			{assessments.length > 0 && (
				<div className="rounded-lg bg-muted/50 p-4">
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<p className="font-medium">Latest Assessment</p>
							<p className="text-muted-foreground">
								{format(new Date(assessments[0].created_at), "MMM d, yyyy")}
							</p>
						</div>
						<div>
							<p className="font-medium">Current Level</p>
							<p className="text-muted-foreground">
								{assessments.find((a: any) => a.level)?.level?.toUpperCase() || "Not determined"}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}