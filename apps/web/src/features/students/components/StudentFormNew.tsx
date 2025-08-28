"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { languageLevelQueries } from "@/features/language-levels/queries/language-levels.queries";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	CalendarIcon,
	ExternalLink,
	GraduationCap,
	Info,
	Mail,
	MapPin,
	MessageSquare,
	Phone,
	Settings,
	User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const studentFormSchema = z.object({
	full_name: z.string().min(1, "Full name is required"),
	email: z.string().email("Invalid email").optional().or(z.literal("")),
	mobile_phone_number: z.string().max(20).optional().or(z.literal("")),
	city: z.string().optional().or(z.literal("")),
	desired_starting_language_level_id: z.string().optional(),
	initial_channel: z
		.enum(["form", "quiz", "call", "message", "email", "assessment"])
		.optional(),
	communication_channel: z.enum(["sms_email", "email", "sms"]),
	is_full_beginner: z.boolean(),
	is_under_16: z.boolean(),
	subjective_deadline_for_student: z.date().optional(),
	purpose_to_learn: z.string().optional().or(z.literal("")),
	// External IDs
	convertkit_id: z.string().optional().or(z.literal("")),
	openphone_contact_id: z.string().optional().or(z.literal("")),
	tally_form_submission_id: z.string().optional().or(z.literal("")),
	respondent_id: z.string().optional().or(z.literal("")),
	stripe_customer_id: z.string().optional().or(z.literal("")),
	airtable_record_id: z.string().optional().or(z.literal("")),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface StudentFormNewProps {
	student?: any;
	onSuccess?: () => void;
}

export function StudentFormNew({ student, onSuccess }: StudentFormNewProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const isEditMode = !!student;

	// Fetch language levels
	const { data: languageLevels, isLoading: languageLevelsLoading } = useQuery(
		languageLevelQueries.list(),
	);
	const levelOptions = languageLevels || [];

	const form = useForm<StudentFormValues>({
		resolver: zodResolver(studentFormSchema),
		defaultValues: {
			full_name: student?.full_name || "",
			email: student?.email || "",
			mobile_phone_number: student?.mobile_phone_number || "",
			city: student?.city || "",
			desired_starting_language_level_id:
				student?.desired_starting_language_level_id,
			initial_channel: student?.initial_channel,
			communication_channel: student?.communication_channel ?? "sms_email",
			is_full_beginner: student?.is_full_beginner ?? false,
			is_under_16: student?.is_under_16 ?? false,
			subjective_deadline_for_student: student?.subjective_deadline_for_student
				? new Date(student.subjective_deadline_for_student)
				: undefined,
			purpose_to_learn: student?.purpose_to_learn || "",
			convertkit_id: student?.convertkit_id || "",
			openphone_contact_id: student?.openphone_contact_id || "",
			tally_form_submission_id: student?.tally_form_submission_id || "",
			respondent_id: student?.respondent_id || "",
			stripe_customer_id: student?.stripe_customer_id || "",
			airtable_record_id: student?.airtable_record_id || "",
		},
	});

	async function onSubmit(values: StudentFormValues) {
		setIsLoading(true);

		try {
			const url = student ? `/api/students/${student.id}` : "/api/students";

			const method = student ? "PATCH" : "POST";

			// Format dates for API
			const payload = {
				...values,
				subjective_deadline_for_student: values.subjective_deadline_for_student
					? format(values.subjective_deadline_for_student, "yyyy-MM-dd")
					: null,
			};

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error("Failed to save student");
			}

			toast.success(
				student
					? "Student updated successfully"
					: "Student created successfully",
			);

			if (onSuccess) {
				onSuccess();
			} else {
				router.push("/admin/students");
				router.refresh();
			}
		} catch (error) {
			console.error("Error saving student:", error);
			toast.error("Failed to save student");
		} finally {
			setIsLoading(false);
		}
	}

	const handleCancel = () => {
		router.push("/admin/students");
	};

	// Transform language levels for select options
	const languageLevelOptions = levelOptions.map((level) => ({
		label: level.display_name,
		value: level.id,
	}));

	const initialChannels = [
		{ label: "Form", value: "form" },
		{ label: "Quiz", value: "quiz" },
		{ label: "Call", value: "call" },
		{ label: "Message", value: "message" },
		{ label: "Email", value: "email" },
		{ label: "Assessment", value: "assessment" },
	];

	const communicationChannels = [
		{ label: "SMS + Email", value: "sms_email" },
		{ label: "Email Only", value: "email" },
		{ label: "SMS Only", value: "sms" },
	];

	return (
		<FormLayout>
			<FormHeader
				backUrl="/admin/students"
				backLabel="Students"
				title={isEditMode ? "Edit Student" : "New Student"}
				subtitle={
					isEditMode
						? `Update ${student.full_name}'s information`
						: "Add a new student to your database"
				}
				badge={
					isEditMode ? { label: "Editing", variant: "warning" } : undefined
				}
			/>

			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormContent>
					<div className="space-y-4">
						{/* Info Banner for new students */}
						{!isEditMode && (
							<InfoBanner
								variant="info"
								title="Quick Tip"
								message="You can add basic information now and complete the profile later. Only the student's name is required."
							/>
						)}

						{/* Personal Information */}
						<FormSection
							title="Personal Information"
							description="Basic contact and identification details"
							icon={User}
							required
						>
							<FormRow>
								<FormField
									label="Full Name"
									required
									error={form.formState.errors.full_name?.message}
								>
									<InputField
										placeholder="John Doe"
										error={!!form.formState.errors.full_name}
										{...form.register("full_name")}
									/>
								</FormField>
								<FormField
									label="Email Address"
									error={form.formState.errors.email?.message}
								>
									<InputField
										type="email"
										placeholder="john@example.com"
										error={!!form.formState.errors.email}
										{...form.register("email")}
									/>
								</FormField>
							</FormRow>
							<FormRow>
								<FormField
									label="Mobile Phone"
									hint="E.164 format preferred (+1234567890)"
									error={form.formState.errors.mobile_phone_number?.message}
								>
									<InputField
										placeholder="+1234567890"
										error={!!form.formState.errors.mobile_phone_number}
										{...form.register("mobile_phone_number")}
									/>
								</FormField>
								<FormField
									label="City"
									error={form.formState.errors.city?.message}
								>
									<InputField
										placeholder="Paris"
										error={!!form.formState.errors.city}
										{...form.register("city")}
									/>
								</FormField>
							</FormRow>
						</FormSection>

						{/* Learning Profile */}
						<FormSection
							title="Learning Profile"
							description="Language level and learning objectives"
							icon={GraduationCap}
						>
							<FormRow>
								<FormField
									label="Desired Starting Level"
									error={
										form.formState.errors.desired_starting_language_level_id
											?.message
									}
								>
									<SelectField
										placeholder={
											languageLevelsLoading
												? "Loading levels..."
												: "Select a level"
										}
										value={
											form.watch("desired_starting_language_level_id") || ""
										}
										onValueChange={(value) =>
											form.setValue("desired_starting_language_level_id", value)
										}
										options={languageLevelOptions}
										disabled={languageLevelsLoading}
									/>
								</FormField>
								<FormField
									label="Target Deadline"
									error={
										form.formState.errors.subjective_deadline_for_student
											?.message
									}
								>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={cn(
													"h-9 w-full justify-start text-left font-normal",
													!form.watch("subjective_deadline_for_student") &&
														"text-muted-foreground",
												)}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{form.watch("subjective_deadline_for_student") ? (
													format(
														form.watch("subjective_deadline_for_student")!,
														"PPP",
													)
												) : (
													<span>Pick a date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={form.watch("subjective_deadline_for_student")}
												onSelect={(date) =>
													form.setValue("subjective_deadline_for_student", date)
												}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</FormField>
							</FormRow>

							<FormField
								label="Learning Purpose"
								hint="Why does the student want to learn French?"
								error={form.formState.errors.purpose_to_learn?.message}
							>
								<TextareaField
									placeholder="Travel, work, personal interest, family connections..."
									error={!!form.formState.errors.purpose_to_learn}
									{...form.register("purpose_to_learn")}
								/>
							</FormField>

							<div className="space-y-3">
								<SwitchField
									label="Full Beginner"
									description="Student has no prior French knowledge"
									checked={form.watch("is_full_beginner")}
									onCheckedChange={(checked) =>
										form.setValue("is_full_beginner", checked)
									}
								/>
								<SwitchField
									label="Under 16 Years Old"
									description="Student requires age-appropriate materials"
									checked={form.watch("is_under_16")}
									onCheckedChange={(checked) =>
										form.setValue("is_under_16", checked)
									}
								/>
							</div>
						</FormSection>

						{/* Communication Preferences */}
						<FormSection
							title="Communication"
							description="Contact preferences and acquisition channels"
							icon={MessageSquare}
						>
							<FormRow>
								<FormField
									label="Preferred Communication"
									error={form.formState.errors.communication_channel?.message}
								>
									<SelectField
										value={form.watch("communication_channel")}
										onValueChange={(value) =>
											form.setValue("communication_channel", value as any)
										}
										options={communicationChannels}
									/>
								</FormField>
								<FormField
									label="Initial Contact Channel"
									hint="How did they first reach us?"
									error={form.formState.errors.initial_channel?.message}
								>
									<SelectField
										placeholder="Select channel"
										value={form.watch("initial_channel")}
										onValueChange={(value) =>
											form.setValue("initial_channel", value as any)
										}
										options={initialChannels}
									/>
								</FormField>
							</FormRow>
						</FormSection>

						{/* External Integrations - Collapsible or hidden by default */}
						{isEditMode && (
							<FormSection
								title="External Integrations"
								description="IDs from third-party services (optional)"
								icon={ExternalLink}
							>
								<FormRow>
									<FormField label="Stripe Customer ID">
										<InputField
											placeholder="cus_..."
											{...form.register("stripe_customer_id")}
										/>
									</FormField>
									<FormField label="ConvertKit ID">
										<InputField
											placeholder="12345678"
											{...form.register("convertkit_id")}
										/>
									</FormField>
								</FormRow>
								<FormRow>
									<FormField label="OpenPhone Contact ID">
										<InputField
											placeholder="contact_..."
											{...form.register("openphone_contact_id")}
										/>
									</FormField>
									<FormField label="Airtable Record ID">
										<InputField
											placeholder="rec..."
											{...form.register("airtable_record_id")}
										/>
									</FormField>
								</FormRow>
								<FormRow>
									<FormField label="Tally Form Submission ID">
										<InputField
											placeholder="submission_..."
											{...form.register("tally_form_submission_id")}
										/>
									</FormField>
									<FormField label="Respondent ID">
										<InputField
											placeholder="resp_..."
											{...form.register("respondent_id")}
										/>
									</FormField>
								</FormRow>
							</FormSection>
						)}
					</div>
				</FormContent>

				<FormActions
					primaryLabel={isEditMode ? "Update Student" : "Create Student"}
					primaryLoading={isLoading}
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
