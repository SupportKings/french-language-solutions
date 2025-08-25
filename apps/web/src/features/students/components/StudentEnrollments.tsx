"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, AlertCircle, MoreHorizontal, Eye, Trash } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const statusColors = {
	declined_contract: "destructive",
	dropped_out: "destructive",
	interested: "secondary",
	beginner_form_filled: "warning",
	contract_abandoned: "destructive",
	contract_signed: "info",
	payment_abandoned: "destructive",
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
	welcome_package_sent: "Welcome Sent",
};

interface StudentEnrollmentsProps {
	studentId: string;
}

export function StudentEnrollments({ studentId }: StudentEnrollmentsProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	
	const { data: enrollments, isLoading } = useQuery({
		queryKey: ["student-enrollments", studentId],
		queryFn: async () => {
			const response = await fetch(`/api/enrollments?studentId=${studentId}&limit=50`);
			if (!response.ok) throw new Error("Failed to fetch enrollments");
			const result = await response.json();
			return result.enrollments || [];
		},
	});

	const deleteEnrollment = useMutation({
		mutationFn: async (enrollmentId: string) => {
			const response = await fetch(`/api/enrollments/${enrollmentId}`, {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Failed to delete enrollment");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["student-enrollments", studentId] });
			toast.success("Enrollment removed successfully");
		},
		onError: () => {
			toast.error("Failed to remove enrollment");
		},
	});

	const handleDelete = (enrollmentId: string) => {
		if (confirm("Are you sure you want to remove this enrollment?")) {
			deleteEnrollment.mutate(enrollmentId);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-2">
				{Array.from({ length: 2 }).map((_, i) => (
					<div key={i} className="rounded-lg border bg-muted/10 p-3">
						<div className="flex items-start justify-between">
							<div className="space-y-1">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-3 w-32" />
							</div>
							<Skeleton className="h-5 w-16" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (!enrollments || enrollments.length === 0) {
		return (
			<div className="text-center py-4">
				<AlertCircle className="h-6 w-6 text-muted-foreground/50 mx-auto mb-2" />
				<p className="text-xs text-muted-foreground">No enrollments yet</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{enrollments.map((enrollment: any) => (
				<div key={enrollment.id} className="rounded-lg border bg-muted/10 hover:bg-muted/20 transition-colors">
					<div className="p-3">
						<div className="flex items-start justify-between">
							<div className="space-y-1 flex-1">
								<div className="flex items-center gap-2">
									<span className="font-medium text-sm">
										{enrollment.cohorts?.format === 'group' ? 'Group' : 'Private'} - {enrollment.cohorts?.starting_level?.toUpperCase()}
									</span>
									<Badge variant={statusColors[enrollment.status] as any} className="h-5 text-[10px] px-1.5">
										{statusLabels[enrollment.status]}
									</Badge>
								</div>
								<div className="flex items-center gap-3 text-xs text-muted-foreground">
									{enrollment.cohorts?.start_date && (
										<div className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											<span>Starts {format(new Date(enrollment.cohorts.start_date), "MMM d, yyyy")}</span>
										</div>
									)}
									{enrollment.cohorts?.room_type && (
										<div className="flex items-center gap-1">
											<Users className="h-3 w-3" />
											<span>{enrollment.cohorts.room_type.replace('_', ' ')}</span>
										</div>
									)}
								</div>
								<div className="text-xs text-muted-foreground">
									Enrolled {format(new Date(enrollment.created_at), "MMM d, yyyy")}
								</div>
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon" className="h-6 w-6">
										<MoreHorizontal className="h-3 w-3" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem 
										onClick={() => handleDelete(enrollment.id)}
										className="text-destructive"
									>
										<Trash className="mr-2 h-4 w-4" />
										Remove Enrollment
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}