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
import { Plus } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const statusColors = {
	declined_contract: "destructive",
	dropped_out: "destructive",
	interested: "secondary",
	beginner_form_filled: "secondary",
	contract_abandoned: "outline",
	contract_signed: "default",
	payment_abandoned: "outline",
	paid: "success",
	welcome_package_sent: "success",
};

const statusLabels = {
	declined_contract: "Declined",
	dropped_out: "Dropped Out",
	interested: "Interested",
	beginner_form_filled: "Form Filled",
	contract_abandoned: "Contract Abandoned",
	contract_signed: "Contract Signed",
	payment_abandoned: "Payment Abandoned",
	paid: "Paid",
	welcome_package_sent: "Welcome Package Sent",
};

interface StudentEnrollmentsProps {
	studentId: string;
}

export function StudentEnrollments({ studentId }: StudentEnrollmentsProps) {
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

	if (!enrollments || enrollments.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-muted-foreground mb-4">No enrollments yet</p>
				<Link href={`/admin/students/enrollments/new?studentId=${studentId}`}>
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Create Enrollment
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{enrollments.length} enrollment{enrollments.length === 1 ? '' : 's'}
				</p>
				<Link href={`/admin/students/enrollments/new?studentId=${studentId}`}>
					<Button size="sm">
						<Plus className="mr-2 h-4 w-4" />
						Add Enrollment
					</Button>
				</Link>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Cohort</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Enrolled</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{enrollments.map((enrollment: any) => (
							<TableRow key={enrollment.id}>
								<TableCell>
									<div>
										<p className="font-medium">
											{enrollment.cohorts?.format} - {enrollment.cohorts?.starting_level?.toUpperCase()}
										</p>
										{enrollment.cohorts?.start_date && (
											<p className="text-sm text-muted-foreground">
												Starts {format(new Date(enrollment.cohorts.start_date), "MMM d, yyyy")}
											</p>
										)}
									</div>
								</TableCell>
								<TableCell>
									<Badge variant={statusColors[enrollment.status] as any}>
										{statusLabels[enrollment.status]}
									</Badge>
								</TableCell>
								<TableCell>
									<p className="text-sm">
										{format(new Date(enrollment.created_at), "MMM d, yyyy")}
									</p>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}