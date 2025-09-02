"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Import update action
import { updateEnrollmentAction } from "../actions/updateEnrollment";

// Import queries
import { enrollmentQueries, useEnrollment } from "../queries/useEnrollments";

// Import section components
import { EnrollmentBasicInfo } from "./detail-sections/enrollment-basic-info";
import { EnrollmentStudentInfo } from "./detail-sections/enrollment-student-info";
import { EnrollmentCohortSection } from "./detail-sections/enrollment-cohort-section";
import { EnrollmentSystemInfo } from "./detail-sections/enrollment-system-info";

interface EnrollmentDetailViewProps {
	enrollmentId: string;
}

export default function EnrollmentDetailView({ enrollmentId }: EnrollmentDetailViewProps) {
	const { data: enrollment, isLoading, error } = useEnrollment(enrollmentId);
	const queryClient = useQueryClient();

	// Edit state for basic info sections
	const [editState, setEditState] = useState<{
		isEditing: boolean;
		section: "basic" | "student" | null;
	}>({ isEditing: false, section: null });

	const handleEditToggle = (section: "basic" | "student") => {
		if (editState.isEditing && editState.section === section) {
			// Cancel edit
			setEditState({ isEditing: false, section: null });
		} else {
			// Start edit
			setEditState({ isEditing: true, section });
		}
	};

	const handleSave = async (data: any) => {
		try {
			// Transform form data to match the updateEnrollmentSchema format
			const updateData: any = {
				id: enrollmentId,
			};

			// Only include fields from the section being edited
			if (editState.section === "basic") {
				// Basic info fields (enrollment status)
				updateData.status = data.status;
			} else if (editState.section === "student") {
				// Student info fields
				updateData.studentId = enrollment?.student?.id;
				updateData.studentData = {
					full_name: data.full_name,
					email: data.email,
					mobile_phone_number: data.mobile_phone_number || null,
					city: data.city || null,
					communication_channel: data.communication_channel,
				};
			}

			// Call the update action
			const result = await updateEnrollmentAction(updateData);

			if (result?.validationErrors) {
				// Handle validation errors
				const errorMessages: string[] = [];
				
				if (result.validationErrors._errors) {
					errorMessages.push(...result.validationErrors._errors);
				}
				
				// Handle field-specific errors
				Object.entries(result.validationErrors).forEach(([field, errors]) => {
					if (field !== "_errors" && errors) {
						if (Array.isArray(errors)) {
							errorMessages.push(...errors);
						} else if (errors && typeof errors === "object" && "_errors" in errors && Array.isArray(errors._errors)) {
							errorMessages.push(...errors._errors);
						}
					}
				});

				if (errorMessages.length > 0) {
					errorMessages.forEach(error => toast.error(error));
				} else {
					toast.error("Failed to update enrollment");
				}
				return;
			}

			if (result?.data?.success) {
				toast.success("Enrollment updated successfully");
				setEditState({ isEditing: false, section: null });
				
				// Invalidate queries to refresh data
				await queryClient.invalidateQueries({
					queryKey: enrollmentQueries.detail(enrollmentId).queryKey,
				});
			} else {
				toast.error("Failed to update enrollment");
			}

		} catch (error) {
			console.error("Error updating enrollment:", error);
			toast.error("Failed to update enrollment");
		}
	};

	const handleCancel = () => {
		setEditState({ isEditing: false, section: null });
	};

	if (isLoading) return <div>Loading...</div>;
	if (error || !enrollment) return <div>Error loading enrollment</div>;

	const studentName = enrollment.student?.full_name || "Unknown Student";
	const initials = studentName
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<div className="space-y-6 p-6">
			{/* Header Section */}
			<div className="flex items-start justify-between">
				<div className="flex items-center space-x-4">
					<Avatar className="h-16 w-16">
						<AvatarFallback className="font-semibold text-lg">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div>
						<h1 className="font-bold text-2xl">{studentName}</h1>
						<p className="text-muted-foreground">
							{enrollment.cohort?.product?.display_name || "No Product"}
						</p>
					</div>
				</div>
			</div>

			{/* Basic Information Grid */}
			<div className="grid gap-6 md:grid-cols-2">
				<EnrollmentBasicInfo
					enrollment={{
						status: enrollment.status,
						created_at: enrollment.created_at,
					}}
					isEditing={editState.isEditing && editState.section === "basic"}
					onEditToggle={() => handleEditToggle("basic")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
				<EnrollmentStudentInfo
					student={enrollment.student}
					isEditing={editState.isEditing && editState.section === "student"}
					onEditToggle={() => handleEditToggle("student")}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			</div>

			{/* Cohort Details Section */}
			<EnrollmentCohortSection cohort={enrollment.cohort} />

			{/* System Information */}
			<EnrollmentSystemInfo enrollment={enrollment} />
		</div>
	);
}