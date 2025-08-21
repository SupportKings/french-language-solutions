"use client";

import { useParams } from "next/navigation";
import { useTeacher } from "@/features/teachers/queries/teachers.queries";
import { ArrowLeft, Edit, Phone, Calendar, Video, MapPin, Shield, Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

const onboardingStatusColors = {
	new: "secondary",
	training_in_progress: "default",
	onboarded: "success",
	offboarded: "destructive",
};

const onboardingStatusLabels = {
	new: "New",
	training_in_progress: "Training",
	onboarded: "Onboarded",
	offboarded: "Offboarded",
};

const contractTypeLabels = {
	full_time: "Full Time",
	freelancer: "Freelancer",
};

const bonusTermsLabels = {
	per_student_per_hour: "Per Student Per Hour",
	per_hour: "Per Hour",
};

export default function ViewTeacherPage() {
	const params = useParams();
	const teacherId = params.id as string;
	const { data: teacher, isLoading, error } = useTeacher(teacherId);

	if (isLoading) {
		return (
			<div className="p-6">
				<Skeleton className="mb-4 h-10 w-32" />
				<Skeleton className="mb-2 h-8 w-48" />
				<Skeleton className="mb-6 h-4 w-64" />
				<div className="space-y-4">
					<Skeleton className="h-64 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			</div>
		);
	}

	if (error || !teacher) {
		return (
			<div className="p-6">
				<Card>
					<CardContent className="py-10">
						<p className="text-center text-muted-foreground">
							Failed to load teacher details
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<Link href="/admin/teachers">
					<Button variant="ghost" size="sm" className="mb-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Teachers
					</Button>
				</Link>
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">
							{teacher.first_name} {teacher.last_name}
						</h1>
						<p className="text-muted-foreground">Teacher Profile</p>
					</div>
					<Link href={`/admin/teachers/${teacherId}/edit`}>
						<Button>
							<Edit className="mr-2 h-4 w-4" />
							Edit
						</Button>
					</Link>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Full Name</p>
							<p className="text-lg">{teacher.first_name} {teacher.last_name}</p>
						</div>
						
						{teacher.mobile_phone_number && (
							<div>
								<p className="text-sm font-medium text-muted-foreground">Phone Number</p>
								<div className="flex items-center gap-2">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<p>{teacher.mobile_phone_number}</p>
								</div>
							</div>
						)}

						{teacher.google_calendar_id && (
							<div>
								<p className="text-sm font-medium text-muted-foreground">Google Calendar</p>
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<p>{teacher.google_calendar_id}</p>
								</div>
							</div>
						)}

						<div>
							<p className="text-sm font-medium text-muted-foreground">ID</p>
							<p className="font-mono text-xs">{teacher.id}</p>
						</div>
					</CardContent>
				</Card>

				{/* Contract & Status */}
				<Card>
					<CardHeader>
						<CardTitle>Contract & Status</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="text-sm font-medium text-muted-foreground">Onboarding Status</p>
							<Badge variant={onboardingStatusColors[teacher.onboarding_status] as any} className="mt-1">
								{onboardingStatusLabels[teacher.onboarding_status]}
							</Badge>
						</div>

						{teacher.contract_type && (
							<div>
								<p className="text-sm font-medium text-muted-foreground">Contract Type</p>
								<div className="mt-1 flex items-center gap-2">
									<Briefcase className="h-4 w-4 text-muted-foreground" />
									<Badge variant="outline">
										{contractTypeLabels[teacher.contract_type]}
									</Badge>
								</div>
							</div>
						)}

						{teacher.group_class_bonus_terms && (
							<div>
								<p className="text-sm font-medium text-muted-foreground">Bonus Terms</p>
								<p className="mt-1">{bonusTermsLabels[teacher.group_class_bonus_terms]}</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Availability */}
				<Card>
					<CardHeader>
						<CardTitle>Availability & Hours</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Available for Booking</span>
							{teacher.available_for_booking ? (
								<Badge variant="success">Yes</Badge>
							) : (
								<Badge variant="secondary">No</Badge>
							)}
						</div>

						{(teacher.maximum_hours_per_week || teacher.maximum_hours_per_day) && (
							<>
								<Separator />
								{teacher.maximum_hours_per_week && (
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Max Hours Per Week</span>
										<span>{teacher.maximum_hours_per_week} hours</span>
									</div>
								)}
								{teacher.maximum_hours_per_day && (
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium">Max Hours Per Day</span>
										<span>{teacher.maximum_hours_per_day} hours</span>
									</div>
								)}
							</>
						)}
					</CardContent>
				</Card>

				{/* Qualifications */}
				<Card>
					<CardHeader>
						<CardTitle>Qualifications & Classes</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Shield className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium">Under 16 Qualified</span>
							</div>
							{teacher.qualified_for_under_16 ? (
								<Badge variant="success">Yes</Badge>
							) : (
								<Badge variant="secondary">No</Badge>
							)}
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Video className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium">Online Classes</span>
							</div>
							{teacher.available_for_online_classes ? (
								<Badge variant="success">Available</Badge>
							) : (
								<Badge variant="secondary">Not Available</Badge>
							)}
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<MapPin className="h-4 w-4 text-muted-foreground" />
								<span className="text-sm font-medium">In-Person Classes</span>
							</div>
							{teacher.available_for_in_person_classes ? (
								<Badge variant="success">Available</Badge>
							) : (
								<Badge variant="secondary">Not Available</Badge>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Admin Notes */}
				{teacher.admin_notes && (
					<Card className="md:col-span-2">
						<CardHeader>
							<CardTitle>Admin Notes</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="whitespace-pre-wrap text-sm">{teacher.admin_notes}</p>
						</CardContent>
					</Card>
				)}

				{/* Metadata */}
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>System Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Created</p>
								<p className="text-sm">
									{format(new Date(teacher.created_at), "PPP 'at' p")}
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">Last Updated</p>
								<p className="text-sm">
									{format(new Date(teacher.updated_at), "PPP 'at' p")}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}