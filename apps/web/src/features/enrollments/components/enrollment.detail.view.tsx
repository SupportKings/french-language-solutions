"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Database } from "@/utils/supabase/database.types";

import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinkedRecordBadge } from "@/components/ui/linked-record-badge";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	Activity,
	Calendar,
	ChevronRight,
	MoreVertical,
	School,
	Trash2,
	User,
} from "lucide-react";
import { toast } from "sonner";
// Import update action
import { updateEnrollmentAction } from "../actions/updateEnrollment";
import { updateEnrollmentInternalNotes } from "../actions/updateInternalNotes";
// Import queries
import { enrollmentQueries, useEnrollment } from "../queries/useEnrollments";
import {
	type EnrollmentChecklist,
	getDefaultEnrollmentChecklist,
	getDefaultOffboardingChecklist,
	getDefaultTransitionChecklist,
	type OffboardingChecklist,
	type TransitionChecklist,
} from "../types/checklist.types";
// Import checklist component
import { ChecklistSection } from "./ChecklistSection";
// Import internal notes component
import { InternalNotes } from "@/components/internal-notes/InternalNotes";

type EnrollmentStatus = Database["public"]["Enums"]["enrollment_status"];

interface EnrollmentDetailViewProps {
	enrollmentId: string;
	permissions?: any;
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
	transitioning: "Transitioning",
	offboarding: "Offboarding",
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
	transitioning: "warning",
	offboarding: "warning",
};

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

export default function EnrollmentDetailView({
	enrollmentId,
	permissions,
}: EnrollmentDetailViewProps) {
	// Check if user can edit students (which includes enrollments)
	const canEditStudent = permissions?.students?.includes("write");
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
				// Invalidate all enrollment-related queries to refresh data everywhere
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: enrollmentQueries.detail(enrollmentId).queryKey,
					}),
					// Invalidate all enrollment list queries (EnrollmentsTable, CohortEnrollments, etc.)
					queryClient.invalidateQueries({
						queryKey: ["enrollments"],
					}),
				]);
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

	// Get display values for status
	const statusDisplay =
		ENROLLMENT_STATUS_LABELS[currentEnrollment.status as EnrollmentStatus] ||
		currentEnrollment.status;

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Enhanced Header with Breadcrumb */}
			<div className="border-b bg-background">
				<div className="px-6 py-3">
					<div className="mb-2 flex items-center gap-2 text-muted-foreground text-sm">
						<Link
							href="/admin/students/enrollments"
							className="transition-colors hover:text-foreground"
						>
							Enrollments
						</Link>
						<ChevronRight className="h-3 w-3" />
						<span>Enrollment</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div>
								<h1 className="font-semibold text-xl">
									{studentName} – Enrollment Details
								</h1>
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
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2">
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
					canEdit={canEditStudent}
					onEditStart={() => setEditedEnrollment(currentEnrollment)}
					onSave={saveAllChanges}
					onCancel={() => setEditedEnrollment(currentEnrollment)}
				>
					{(editing) => (
						<div className="grid gap-8 lg:grid-cols-2">
							{/* Basic Information */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Basic Information
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

							{/* Linked Records */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Linked Records
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Student:</p>
											{currentEnrollment.student?.id ? (
												<LinkedRecordBadge
													href={`/admin/students/${currentEnrollment.student.id}`}
													label={
														currentEnrollment.student.full_name ||
														"View Student"
													}
													icon={User}
													className="text-xs"
												/>
											) : (
												<span className="text-muted-foreground text-sm">
													Not linked
												</span>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<School className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Cohort:</p>
											{currentEnrollment.cohort?.id ? (
												<LinkedRecordBadge
													href={`/admin/cohorts/${currentEnrollment.cohort.id}`}
													label={
														currentEnrollment.cohort.nickname ||
														currentEnrollment.cohort.product?.display_name ||
														"View Cohort"
													}
													icon={School}
													className="text-xs"
													title={currentEnrollment.cohort.nickname || undefined}
												/>
											) : (
												<span className="text-muted-foreground text-sm">
													Not linked
												</span>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</EditableSection>

				{/* Checklist Section - show based on status */}
				{currentEnrollment.status === "transitioning" && (
					<ChecklistSection
						type="transition"
						checklist={
							currentEnrollment.transition_checklist ||
							getDefaultTransitionChecklist()
						}
						enrollmentId={enrollmentId}
						onUpdate={() => {
							queryClient.invalidateQueries({
								queryKey: enrollmentQueries.detail(enrollmentId).queryKey,
							});
						}}
						canEdit={canEditStudent}
					/>
				)}

				{currentEnrollment.status === "offboarding" && (
					<ChecklistSection
						type="offboarding"
						checklist={
							currentEnrollment.offboarding_checklist ||
							getDefaultOffboardingChecklist()
						}
						enrollmentId={enrollmentId}
						onUpdate={() => {
							queryClient.invalidateQueries({
								queryKey: enrollmentQueries.detail(enrollmentId).queryKey,
							});
						}}
						canEdit={canEditStudent}
					/>
				)}

				{currentEnrollment.status !== "transitioning" &&
					currentEnrollment.status !== "offboarding" && (
						<ChecklistSection
							type="enrollment"
							checklist={
								currentEnrollment.enrollment_checklist ||
								getDefaultEnrollmentChecklist()
							}
							enrollmentId={enrollmentId}
							onUpdate={() => {
								queryClient.invalidateQueries({
									queryKey: enrollmentQueries.detail(enrollmentId).queryKey,
								});
							}}
							canEdit={canEditStudent}
						/>
					)}

				{/* Internal Notes Section */}
				<InternalNotes
					initialContent={currentEnrollment.internal_notes}
					onSave={async (content) => {
						await updateEnrollmentInternalNotes({
							enrollmentId,
							internalNotes: content,
						});
						queryClient.invalidateQueries({
							queryKey: enrollmentQueries.detail(enrollmentId).queryKey,
						});
					}}
					canEdit={canEditStudent}
					entityType="enrollment"
				/>
			</div>
		</div>
	);
}
