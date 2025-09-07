"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Database } from "@/utils/supabase/database.types";

import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	Activity,
	BookOpen,
	Calendar,
	ChevronRight,
	Clock,
	ExternalLink,
	GraduationCap,
	Mail,
	MapPin,
	MessageSquare,
	MoreVertical,
	Phone,
	School,
	Trash2,
	User,
} from "lucide-react";
import { toast } from "sonner";
// Import update action
import { updateEnrollmentAction } from "../actions/updateEnrollment";
// Import queries
import { enrollmentQueries, useEnrollment } from "../queries/useEnrollments";

type EnrollmentStatus = Database["public"]["Enums"]["enrollment_status"];
type CommunicationChannel =
	Database["public"]["Enums"]["communication_channel"];

interface EnrollmentDetailViewProps {
	enrollmentId: string;
}

// Status configuration
const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
	declined_contract: "Declined Contract",
	dropped_out: "Dropped Out",
	interested: "Interested",
	beginner_form_filled: "Beginner Form Filled",
	contract_abandoned: "Contract Abandoned",
	contract_signed: "Contract Signed",
	payment_abandoned: "Payment Abandoned",
	paid: "Paid",
	welcome_package_sent: "Welcome Package Sent",
};

const ENROLLMENT_STATUS_COLORS: Record<EnrollmentStatus, string> = {
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

const COMMUNICATION_CHANNEL_LABELS: Record<CommunicationChannel, string> = {
	sms_email: "SMS & Email",
	email: "Email Only",
	sms: "SMS Only",
};

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

const formatTime = (timeString: string) => {
	if (!timeString) return "";
	try {
		const [hours, minutes] = timeString.split(":");
		const hour = Number.parseInt(hours);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	} catch {
		return timeString;
	}
};

export default function EnrollmentDetailView({
	enrollmentId,
}: EnrollmentDetailViewProps) {
	const { data: enrollment, isLoading, error } = useEnrollment(enrollmentId);
	const queryClient = useQueryClient();
	const router = useRouter();
	const [updatedEnrollment, setUpdatedEnrollment] = useState<any>(null);
	// Local state for edited values
	const [editedEnrollment, setEditedEnrollment] = useState<any>(null);

	// Use updated enrollment if available, otherwise use fetched data
	const currentEnrollment = updatedEnrollment || enrollment;

	// Update the local edited state when data changes
	useEffect(() => {
		if (currentEnrollment) {
			setEditedEnrollment(currentEnrollment);
		}
	}, [currentEnrollment]);

	if (isLoading) return <div>Loading...</div>;
	if (error || !currentEnrollment) return <div>Error loading enrollment</div>;

	const studentName = currentEnrollment.student?.full_name || "Unknown Student";
	const productName =
		currentEnrollment.cohort?.product?.display_name || "Unknown Product";
	const initials = studentName
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	// Update edited enrollment field locally
	const updateEditedField = async (field: string, value: any) => {
		if (!editedEnrollment) return Promise.resolve();

		if (field.startsWith("student.")) {
			const studentField = field.replace("student.", "");
			setEditedEnrollment({
				...editedEnrollment,
				student: {
					...editedEnrollment.student,
					[studentField]: value,
				},
			});
		} else {
			setEditedEnrollment({
				...editedEnrollment,
				[field]: value,
			});
		}
		return Promise.resolve();
	};

	// Save all changes to the API
	const saveAllChanges = async () => {
		if (!editedEnrollment || !currentEnrollment) return;

		try {
			const changes: any = {};
			let hasChanges = false;

			// Check for enrollment status changes
			if (editedEnrollment.status !== currentEnrollment.status) {
				changes.status = editedEnrollment.status;
				hasChanges = true;
			}

			// We're not editing student data anymore, only enrollment status

			if (!hasChanges) {
				return;
			}

			// Prepare update data
			const updateData: any = {
				id: enrollmentId,
			};

			if (changes.status) {
				updateData.status = changes.status;
			}

			const result = await updateEnrollmentAction(updateData);

			if (result?.validationErrors) {
				// Handle validation errors
				const errorMessages: string[] = [];

				if (result.validationErrors._errors) {
					errorMessages.push(...result.validationErrors._errors);
				}

				Object.entries(result.validationErrors).forEach(([field, errors]) => {
					if (field !== "_errors" && errors) {
						if (Array.isArray(errors)) {
							errorMessages.push(...errors);
						} else if (
							errors &&
							typeof errors === "object" &&
							"_errors" in errors &&
							Array.isArray(errors._errors)
						) {
							errorMessages.push(...errors._errors);
						}
					}
				});

				if (errorMessages.length > 0) {
					errorMessages.forEach((error) => toast.error(error));
				} else {
					toast.error("Failed to update");
				}
				throw new Error("Validation failed");
			}

			if (result?.data?.success) {
				toast.success("Changes saved successfully");
				// Invalidate queries to refresh data
				await queryClient.invalidateQueries({
					queryKey: enrollmentQueries.detail(enrollmentId).queryKey,
				});
			} else {
				toast.error("Failed to save changes");
				throw new Error("Update failed");
			}
		} catch (error) {
			console.error("Error saving changes:", error);
			toast.error("Failed to save changes");
			throw error;
		}
	};

	const handleDeleteEnrollment = async () => {
		// Implementation would go here
		toast.info("Delete functionality to be implemented");
	};

	const dayOrder = [
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
		"sunday",
	];
	const sortedSessions =
		currentEnrollment.cohort?.weekly_sessions?.sort((a: any, b: any) => {
			return dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week);
		}) || [];

	// Get display values for status and communication channel
	const statusDisplay =
		ENROLLMENT_STATUS_LABELS[currentEnrollment.status as EnrollmentStatus] ||
		currentEnrollment.status;
	const communicationChannelDisplay = currentEnrollment.student
		?.communication_channel
		? COMMUNICATION_CHANNEL_LABELS[
				currentEnrollment.student.communication_channel as CommunicationChannel
			]
		: "Not set";

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Enhanced Header with Breadcrumb */}
			<div className="border-b bg-background">
				<div className="px-6 py-3">
					<div className="mb-2 flex items-center gap-2 text-muted-foreground text-sm">
						<Link
							href="/admin/enrollments"
							className="transition-colors hover:text-foreground"
						>
							Enrollments
						</Link>
						<ChevronRight className="h-3 w-3" />
						<span>
							{studentName} - {productName}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<span className="font-semibold text-primary text-sm">
									{initials}
								</span>
							</div>
							<div>
								<h1 className="font-semibold text-xl">{studentName}</h1>
								<div className="mt-0.5 flex items-center gap-2">
									<Badge
										variant={
											(ENROLLMENT_STATUS_COLORS as any)[
												currentEnrollment.status
											] || "default"
										}
										className="h-4 px-1.5 text-[10px]"
									>
										{statusDisplay}
									</Badge>
									{productName && (
										<Badge variant="outline" className="h-4 px-1.5 text-[10px]">
											{productName}
										</Badge>
									)}
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									router.push(
										`/admin/students/${currentEnrollment.student?.id}`,
									)
								}
							>
								<User className="mr-2 h-3.5 w-3.5" />
								View Student
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									router.push(`/admin/cohorts/${currentEnrollment.cohort?.id}`)
								}
							>
								<School className="mr-2 h-3.5 w-3.5" />
								View Cohort
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm">
										<MoreVertical className="h-3.5 w-3.5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuItem
										className="text-destructive"
										onClick={handleDeleteEnrollment}
									>
										<Trash2 className="mr-2 h-3.5 w-3.5" />
										Delete Enrollment
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-4 px-6 py-4">
				{/* Enrollment Information with inline editing */}
				<EditableSection
					title="Enrollment Information"
					onEditStart={() => setEditedEnrollment(currentEnrollment)}
					onSave={saveAllChanges}
					onCancel={() => setEditedEnrollment(currentEnrollment)}
				>
					{(editing) => (
						<div className="grid gap-8 lg:grid-cols-3">
							{/* Enrollment Details Section */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Enrollment
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Activity className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Status:</p>
											{editing ? (
												<InlineEditField
													value={
														editedEnrollment?.status || currentEnrollment.status
													}
													onSave={(value) => updateEditedField("status", value)}
													editing={editing}
													type="select"
													options={Object.entries(ENROLLMENT_STATUS_LABELS).map(
														([value, label]) => ({
															value,
															label,
														}),
													)}
												/>
											) : (
												<p className="font-medium text-sm">{statusDisplay}</p>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Enrolled Date:
											</p>
											<p className="text-sm">
												{formatDate(currentEnrollment.created_at)}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Student Contact Section */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Student Contact
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Email:</p>
											<p className="font-medium text-sm">
												{currentEnrollment.student?.email || "Not provided"}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Phone:</p>
											<p className="font-medium text-sm">
												{currentEnrollment.student?.mobile_phone_number ||
													"Not provided"}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">City:</p>
											<p className="font-medium text-sm">
												{currentEnrollment.student?.city || "Not provided"}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Communication Channel:
											</p>
											<p className="text-sm">{communicationChannelDisplay}</p>
										</div>
									</div>
								</div>
							</div>

							{/* Cohort Overview Section */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Cohort Overview
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<School className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Product:</p>
											<p className="font-medium text-sm">
												{currentEnrollment.cohort?.product?.display_name ||
													"Not set"}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<BookOpen className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Starting Level:
											</p>
											<p className="text-sm">
												{currentEnrollment.cohort?.starting_level
													?.display_name || "Not set"}
												{currentEnrollment.cohort?.starting_level?.code && (
													<span className="ml-1 text-muted-foreground">
														({currentEnrollment.cohort.starting_level.code})
													</span>
												)}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<GraduationCap className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Current Level:
											</p>
											<p className="text-sm">
												{currentEnrollment.cohort?.current_level
													?.display_name || "Not set"}
												{currentEnrollment.cohort?.current_level?.code && (
													<span className="ml-1 text-muted-foreground">
														({currentEnrollment.cohort.current_level.code})
													</span>
												)}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Start Date:
											</p>
											<p className="text-sm">
												{formatDate(currentEnrollment.cohort?.start_date)}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</EditableSection>

				{/* Cohort Information Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<School className="h-4 w-4" />
							Cohort Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Product Details */}
						<div>
							<h4 className="mb-3 font-medium text-sm">Product Details</h4>
							<div className="grid gap-4 md:grid-cols-3">
								<div>
									<p className="text-muted-foreground text-xs">Product Name</p>
									<p className="mt-1 font-medium text-sm">
										{currentEnrollment.cohort?.product?.display_name ||
											"Not set"}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Format</p>
									<p className="mt-1 text-sm capitalize">
										{currentEnrollment.cohort?.product?.format || "Not set"}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Location</p>
									<p className="mt-1 text-sm capitalize">
										{currentEnrollment.cohort?.product?.location || "Not set"}
									</p>
								</div>
							</div>
						</div>

						{/* Cohort Status */}
						<div>
							<h4 className="mb-3 font-medium text-sm">Status & Capacity</h4>
							<div className="grid gap-4 md:grid-cols-3">
								<div>
									<p className="text-muted-foreground text-xs">Cohort Status</p>
									<Badge variant="outline" className="mt-1">
										{currentEnrollment.cohort?.cohort_status
											?.replace(/_/g, " ")
											.replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
											"Unknown"}
									</Badge>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">
										Maximum Students
									</p>
									<p className="mt-1 text-sm">
										{currentEnrollment.cohort?.max_students
											? `${currentEnrollment.cohort.max_students} students`
											: "Not set"}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground text-xs">Room Type</p>
									<p className="mt-1 text-sm capitalize">
										{currentEnrollment.cohort?.room_type?.replace(/_/g, " ") ||
											"Not set"}
									</p>
								</div>
							</div>
						</div>

						{/* Weekly Sessions */}
						{sortedSessions.length > 0 && (
							<div>
								<h4 className="mb-3 font-medium text-sm">Weekly Schedule</h4>
								<div className="space-y-2">
									{sortedSessions.map((session: any) => (
										<div
											key={session.id}
											className="flex items-center justify-between rounded-lg border p-3"
										>
											<div className="flex items-center gap-4">
												<div>
													<p className="font-medium text-sm capitalize">
														{session.day_of_week}
													</p>
													<p className="text-muted-foreground text-xs">
														{formatTime(session.start_time)} -{" "}
														{formatTime(session.end_time)}
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="font-medium text-sm">
													{session.teacher?.first_name}{" "}
													{session.teacher?.last_name}
												</p>
												<p className="text-muted-foreground text-xs">Teacher</p>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* System Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<Clock className="h-4 w-4" />
							System Information
						</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-4 md:grid-cols-2">
						<div>
							<p className="text-muted-foreground text-xs">Created At</p>
							<p className="mt-1 text-sm">
								{format(
									new Date(currentEnrollment.created_at),
									"MMM dd, yyyy 'at' h:mm a",
								)}
							</p>
						</div>
						<div>
							<p className="text-muted-foreground text-xs">Last Updated</p>
							<p className="mt-1 text-sm">
								{format(
									new Date(currentEnrollment.updated_at),
									"MMM dd, yyyy 'at' h:mm a",
								)}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
