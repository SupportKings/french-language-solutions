"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
	FormActions,
	FormContent,
	FormField,
	FormHeader,
	FormLayout,
	FormRow,
	FormSection,
	InfoBanner,
	InputField,
	SelectField,
	SwitchField,
	TextareaField,
} from "@/components/form-layout/FormLayout";
import { DaysSelector } from "@/components/ui/days-selector";
import { MultiSelect } from "@/components/ui/multi-select";

import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, CalendarDays, Clock, FileText, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	useCreateTeacher,
	useUpdateTeacher,
} from "../queries/teachers.queries";
import {
	type Teacher,
	type TeacherFormData,
	teacherFormSchema,
} from "../schemas/teacher.schema";

interface TeacherFormNewProps {
	teacher?: Teacher;
}

export function TeacherFormNew({ teacher }: TeacherFormNewProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const createTeacher = useCreateTeacher();
	const updateTeacher = useUpdateTeacher();
	const isEditMode = !!teacher;

	const form = useForm<TeacherFormData>({
		resolver: zodResolver(teacherFormSchema),
		defaultValues: {
			first_name: teacher?.first_name || "",
			last_name: teacher?.last_name || "",
			role: teacher?.role || [],
			group_class_bonus_terms: teacher?.group_class_bonus_terms || undefined,
			onboarding_status: teacher?.onboarding_status || "new",
			google_calendar_id: teacher?.google_calendar_id || "",
			maximum_hours_per_week: teacher?.maximum_hours_per_week || undefined,
			maximum_hours_per_day: teacher?.maximum_hours_per_day || undefined,
			qualified_for_under_16: teacher?.qualified_for_under_16 || false,
			available_for_booking: teacher?.available_for_booking ?? true,
			contract_type: teacher?.contract_type || undefined,
			available_for_online_classes:
				teacher?.available_for_online_classes ?? true,
			available_for_in_person_classes:
				teacher?.available_for_in_person_classes || false,
			max_students_in_person: teacher?.max_students_in_person || undefined,
			max_students_online: teacher?.max_students_online || undefined,
			days_available_online: teacher?.days_available_online || [],
			days_available_in_person: teacher?.days_available_in_person || [],
			mobile_phone_number: teacher?.mobile_phone_number || "",
			admin_notes: teacher?.admin_notes || "",
		},
	});

	const onSubmit = async (data: TeacherFormData) => {
		setIsSubmitting(true);
		try {
			if (isEditMode) {
				await updateTeacher.mutateAsync({ id: teacher.id, data });
				toast.success("Team member updated successfully");
			} else {
				await createTeacher.mutateAsync(data);
				toast.success("Team member created successfully");
			}
			router.push("/admin/team-members");
		} catch (error) {
			toast.error(
				isEditMode ? "Failed to update team member" : "Failed to create team member",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		router.push("/admin/team-members");
	};

	const onboardingStatuses = [
		{ label: "New", value: "new" },
		{ label: "Training in Progress", value: "training_in_progress" },
		{ label: "Onboarded", value: "onboarded" },
		{ label: "Offboarded", value: "offboarded" },
	];

	const contractTypes = [
		{ label: "Full Time", value: "full_time" },
		{ label: "Freelancer", value: "freelancer" },
	];

	const bonusTerms = [
		{ label: "Per Student Per Hour", value: "per_student_per_hour" },
		{ label: "Per Hour", value: "per_hour" },
	];

	return (
		<FormLayout>
			<FormHeader
				backUrl="/admin/team-members"
				backLabel="Team Members"
				title={isEditMode ? "Edit Team Member" : "New Team Member"}
				subtitle={
					isEditMode
						? `Update ${teacher.first_name} ${teacher.last_name}'s information`
						: "Add a new team member to your organization"
				}
				badge={
					isEditMode ? { label: "Editing", variant: "warning" } : undefined
				}
			/>

			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormContent>
					<div className="space-y-4">
						{/* Info Banner for new teachers */}
						{!isEditMode && (
							<InfoBanner
								variant="info"
								title="Getting Started"
								message="Create a team member profile to start assigning them roles and responsibilities. You can update their availability and qualifications later."
							/>
						)}

						{/* Basic Information */}
						<FormSection
							title="Basic Information"
							description="Team member's personal and contact details"
							icon={User}
							required
						>
							<FormRow>
								<FormField
									label="First Name"
									required
									error={form.formState.errors.first_name?.message}
								>
									<InputField
										placeholder="John"
										error={!!form.formState.errors.first_name}
										{...form.register("first_name")}
									/>
								</FormField>
								<FormField
									label="Last Name"
									required
									error={form.formState.errors.last_name?.message}
								>
									<InputField
										placeholder="Doe"
										error={!!form.formState.errors.last_name}
										{...form.register("last_name")}
									/>
								</FormField>
							</FormRow>
							<FormRow>
								<FormField
									label="Mobile Phone Number"
									hint="E.164 format (e.g., +33612345678)"
									error={form.formState.errors.mobile_phone_number?.message}
								>
									<InputField
										placeholder="+33 6 12 34 56 78"
										error={!!form.formState.errors.mobile_phone_number}
										{...form.register("mobile_phone_number")}
									/>
								</FormField>
								<FormField
									label="Google Calendar ID"
									hint="Calendar ID for scheduling classes"
									error={form.formState.errors.google_calendar_id?.message}
								>
									<InputField
										placeholder="teacher@gmail.com"
										error={!!form.formState.errors.google_calendar_id}
										{...form.register("google_calendar_id")}
									/>
								</FormField>
							</FormRow>
						</FormSection>

						{/* Contract & Status */}
						<FormSection
							title="Role & Employment"
							description="Team member role and employment status"
							icon={Briefcase}
						>
							<FormRow>
								<FormField
									label="Role(s)"
									hint="Select all roles that apply"
									error={form.formState.errors.role?.message}
								>
									<MultiSelect
										options={[
											{ label: "Teacher", value: "Teacher" },
											{ label: "Evaluator", value: "Evaluator" },
											{ label: "Marketing/Admin", value: "Marketing/Admin" },
											{ label: "Exec", value: "Exec" },
										]}
										value={form.watch("role") || []}
										onValueChange={(value) => form.setValue("role", value as ("Teacher" | "Evaluator" | "Marketing/Admin" | "Exec")[])}
										placeholder="Select roles..."
									/>
								</FormField>
								<div />
							</FormRow>
							<FormRow>
								<FormField
									label="Onboarding Status"
									error={form.formState.errors.onboarding_status?.message}
								>
									<SelectField
										placeholder="Select status"
										value={form.watch("onboarding_status")}
										onValueChange={(value) =>
											form.setValue("onboarding_status", value as any)
										}
										options={onboardingStatuses}
									/>
								</FormField>
								<FormField
									label="Contract Type"
									error={form.formState.errors.contract_type?.message}
								>
									<SelectField
										placeholder="Select contract type"
										value={form.watch("contract_type")}
										onValueChange={(value) =>
											form.setValue("contract_type", value as any)
										}
										options={contractTypes}
									/>
								</FormField>
							</FormRow>
							<FormField
								label="Group Class Bonus Terms"
								hint="How bonuses are calculated for group classes"
								error={form.formState.errors.group_class_bonus_terms?.message}
							>
								<SelectField
									placeholder="Select bonus terms"
									value={form.watch("group_class_bonus_terms")}
									onValueChange={(value) =>
										form.setValue("group_class_bonus_terms", value as any)
									}
									options={bonusTerms}
								/>
							</FormField>
						</FormSection>

						{/* Availability & Hours */}
						<FormSection
							title="Availability & Hours"
							description="Working hours and teaching preferences"
							icon={Clock}
						>
							<FormRow>
								<FormField
									label="Maximum Hours Per Week"
									error={form.formState.errors.maximum_hours_per_week?.message}
								>
									<InputField
										type="number"
										placeholder="35"
										min="0"
										max="60"
										error={!!form.formState.errors.maximum_hours_per_week}
										value={form.watch("maximum_hours_per_week") || ""}
										onChange={(e) =>
											form.setValue(
												"maximum_hours_per_week",
												e.target.value
													? Number.parseInt(e.target.value)
													: undefined,
											)
										}
									/>
								</FormField>
								<FormField
									label="Maximum Hours Per Day"
									error={form.formState.errors.maximum_hours_per_day?.message}
								>
									<InputField
										type="number"
										placeholder="8"
										min="0"
										max="12"
										error={!!form.formState.errors.maximum_hours_per_day}
										value={form.watch("maximum_hours_per_day") || ""}
										onChange={(e) =>
											form.setValue(
												"maximum_hours_per_day",
												e.target.value
													? Number.parseInt(e.target.value)
													: undefined,
											)
										}
									/>
								</FormField>
							</FormRow>

							<FormRow>
								<FormField
									label="Max Students (In-Person)"
									hint="Maximum students for in-person classes"
									error={form.formState.errors.max_students_in_person?.message}
								>
									<InputField
										type="number"
										placeholder="10"
										min="0"
										max="50"
										error={!!form.formState.errors.max_students_in_person}
										value={form.watch("max_students_in_person") || ""}
										onChange={(e) =>
											form.setValue(
												"max_students_in_person",
												e.target.value
													? Number.parseInt(e.target.value)
													: undefined,
											)
										}
									/>
								</FormField>
								<FormField
									label="Max Students (Online)"
									hint="Maximum students for online classes"
									error={form.formState.errors.max_students_online?.message}
								>
									<InputField
										type="number"
										placeholder="15"
										min="0"
										max="50"
										error={!!form.formState.errors.max_students_online}
										value={form.watch("max_students_online") || ""}
										onChange={(e) =>
											form.setValue(
												"max_students_online",
												e.target.value
													? Number.parseInt(e.target.value)
													: undefined,
											)
										}
									/>
								</FormField>
							</FormRow>

							<div className="space-y-3">
								<SwitchField
									label="Available for Booking"
									description="Teacher can be scheduled for new classes"
									checked={form.watch("available_for_booking")}
									onCheckedChange={(checked) =>
										form.setValue("available_for_booking", checked)
									}
								/>
								<SwitchField
									label="Qualified for Under 16"
									description="Teacher can teach students under 16 years old"
									checked={form.watch("qualified_for_under_16")}
									onCheckedChange={(checked) =>
										form.setValue("qualified_for_under_16", checked)
									}
								/>
								<SwitchField
									label="Available for Online Classes"
									description="Teacher can conduct online classes via video call"
									checked={form.watch("available_for_online_classes")}
									onCheckedChange={(checked) =>
										form.setValue("available_for_online_classes", checked)
									}
								/>
								<SwitchField
									label="Available for In-Person Classes"
									description="Teacher can conduct face-to-face classes"
									checked={form.watch("available_for_in_person_classes")}
									onCheckedChange={(checked) =>
										form.setValue("available_for_in_person_classes", checked)
									}
								/>
							</div>

							{/* Days Availability */}
							<div className="space-y-4 border-border/50 border-t pt-4">
								<div className="mb-2 flex items-center gap-2">
									<CalendarDays className="h-4 w-4 text-muted-foreground" />
									<h4 className="font-medium text-sm">Days Available</h4>
								</div>

								<FormField
									label="Days Available for Online Classes"
									hint="Select the days when this teacher can conduct online classes"
								>
									<DaysSelector
										value={form.watch("days_available_online") || []}
										onChange={(days) =>
											form.setValue("days_available_online", days as any)
										}
									/>
								</FormField>

								<FormField
									label="Days Available for In-Person Classes"
									hint="Select the days when this teacher can conduct in-person classes"
								>
									<DaysSelector
										value={form.watch("days_available_in_person") || []}
										onChange={(days) =>
											form.setValue("days_available_in_person", days as any)
										}
									/>
								</FormField>
							</div>
						</FormSection>

						{/* Admin Notes */}
						<FormSection
							title="Admin Notes"
							description="Internal notes visible only to administrators"
							icon={FileText}
						>
							<FormField
								label="Notes"
								hint="Add any relevant information about this teacher"
								error={form.formState.errors.admin_notes?.message}
							>
								<TextareaField
									placeholder="Internal notes about this teacher..."
									rows={4}
									error={!!form.formState.errors.admin_notes}
									{...form.register("admin_notes")}
								/>
							</FormField>
						</FormSection>
					</div>
				</FormContent>

				<FormActions
					primaryLabel={isEditMode ? "Update Teacher" : "Create Teacher"}
					primaryLoading={isSubmitting}
					primaryDisabled={
						!form.formState.isValid && form.formState.isSubmitted
					}
					primaryType="submit"
					secondaryLabel="Cancel"
					onSecondaryClick={handleCancel}
				/>
			</form>
		</FormLayout>
	);
}
