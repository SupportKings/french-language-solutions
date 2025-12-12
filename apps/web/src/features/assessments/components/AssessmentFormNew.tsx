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
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
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
	Check,
	ChevronsUpDown,
	ClipboardCheck,
	CreditCard,
	FileText,
	GraduationCap,
	Link as LinkIcon,
	UserCheck,
	Users,
	Video,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const assessmentFormSchema = z.object({
	student_id: z.string().min(1, "Student is required"),
	level_id: z.string().optional(),
	scheduled_for: z.date().optional(),
	is_paid: z.boolean(),
	result: z.enum([
		"requested",
		"scheduled",
		"session_held",
		"level_determined",
	]),
	notes: z.string().optional().or(z.literal("")),
	interview_held_by: z.string().optional().or(z.literal("")),
	level_checked_by: z.string().optional().or(z.literal("")),
	meeting_recording_url: z.string().url().optional().or(z.literal("")),
	calendar_event_url: z.string().url().optional().or(z.literal("")),
});

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;

interface AssessmentFormNewProps {
	assessment?: any;
	studentId?: string;
	redirectTo?: string;
	onSuccess?: () => void;
}

export function AssessmentFormNew({
	assessment,
	studentId,
	redirectTo,
	onSuccess,
}: AssessmentFormNewProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [students, setStudents] = useState<any[]>([]);
	const [teachers, setTeachers] = useState<any[]>([]);
	const [loadingStudents, setLoadingStudents] = useState(false);
	const [loadingTeachers, setLoadingTeachers] = useState(false);
	const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);
	const [interviewerPopoverOpen, setInterviewerPopoverOpen] = useState(false);
	const [checkerPopoverOpen, setCheckerPopoverOpen] = useState(false);
	const isEditMode = !!assessment;

	// Fetch language levels
	const { data: languageLevels, isLoading: isLoadingLevels } = useQuery(
		languageLevelQueries.list(),
	);
	const levelOptions = languageLevels || [];

	const form = useForm<AssessmentFormValues>({
		resolver: zodResolver(assessmentFormSchema),
		defaultValues: {
			student_id: assessment?.student_id || studentId || "",
			level_id: assessment?.level_id,
			scheduled_for: assessment?.scheduled_for
				? new Date(assessment.scheduled_for)
				: undefined,
			is_paid: assessment?.is_paid ?? false,
			result: assessment?.result ?? "requested",
			notes: assessment?.notes || "",
			interview_held_by: assessment?.interview_held_by || "",
			level_checked_by: assessment?.level_checked_by || "",
			meeting_recording_url: assessment?.meeting_recording_url || "",
			calendar_event_url: assessment?.calendar_event_url || "",
		},
	});

	// Fetch students
	useEffect(() => {
		async function fetchStudents() {
			setLoadingStudents(true);
			try {
				const response = await fetch("/api/students?limit=100");
				if (response.ok) {
					const result = await response.json();
					// The API returns { data: [...], meta: {...} }
					setStudents(result.data || []);
				}
			} catch (error) {
				console.error("Error fetching students:", error);
			} finally {
				setLoadingStudents(false);
			}
		}
		fetchStudents();
	}, []);

	// Fetch teachers
	useEffect(() => {
		async function fetchTeachers() {
			setLoadingTeachers(true);
			try {
				// Try fetching all teachers first to see if any exist
				const response = await fetch("/api/teachers?limit=100");
				if (response.ok) {
					const result = await response.json();
					console.log("Fetched teachers data:", result); // Debug log

					// The API returns { data: [...], meta: {...} }
					const teachersList = result.data || result.teachers || [];
					console.log("Teachers list:", teachersList); // Debug log

					// Filter for onboarded teachers on the client side if needed
					const onboardedTeachers = teachersList.filter(
						(teacher: any) => teacher.onboarding_status === "onboarded",
					);
					console.log("Onboarded teachers:", onboardedTeachers); // Debug log

					// Use all teachers if no onboarded ones, otherwise use onboarded only
					setTeachers(
						onboardedTeachers.length > 0 ? onboardedTeachers : teachersList,
					);
				} else {
					console.error(
						"Failed to fetch teachers:",
						response.status,
						response.statusText,
					);
				}
			} catch (error) {
				console.error("Error fetching teachers:", error);
			} finally {
				setLoadingTeachers(false);
			}
		}
		fetchTeachers();
	}, []);

	async function onSubmit(values: AssessmentFormValues) {
		setIsLoading(true);

		try {
			const url = assessment
				? `/api/assessments/${assessment.id}`
				: "/api/assessments";

			const method = assessment ? "PATCH" : "POST";

			const payload = {
				studentId: values.student_id,
				levelId: values.level_id || null,
				scheduledFor: values.scheduled_for
					? format(values.scheduled_for, "yyyy-MM-dd")
					: null,
				isPaid: values.is_paid,
				result: values.result,
				notes: values.notes || null,
				interviewHeldBy: values.interview_held_by || null,
				levelCheckedBy: values.level_checked_by || null,
				meetingRecordingUrl: values.meeting_recording_url || null,
				calendarEventUrl: values.calendar_event_url || null,
			};

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to save assessment");
			}

			toast.success(
				assessment
					? "Assessment updated successfully"
					: "Assessment created successfully",
			);

			if (onSuccess) {
				onSuccess();
			} else if (redirectTo) {
				router.push(redirectTo);
				router.refresh();
			} else {
				router.push("/admin/students/assessments");
				router.refresh();
			}
		} catch (error: any) {
			console.error("Error saving assessment:", error);
			toast.error(error.message || "Failed to save assessment");
		} finally {
			setIsLoading(false);
		}
	}

	const handleCancel = () => {
		if (redirectTo) {
			router.push(redirectTo);
		} else {
			router.push("/admin/students/assessments");
		}
	};

	// Transform language levels for select options
	const languageLevelOptions = levelOptions.map((level) => ({
		label: level.display_name,
		value: level.id,
	}));

	const assessmentStatuses = [
		{ label: "Requested", value: "requested" },
		{ label: "Scheduled", value: "scheduled" },
		{ label: "Session Held", value: "session_held" },
		{ label: "Level Determined", value: "level_determined" },
	];

	const selectedStudent = students.find(
		(s) => s.id === form.watch("student_id"),
	);

	return (
		<FormLayout>
			<FormHeader
				backUrl={redirectTo || "/admin/students/assessments"}
				backLabel={redirectTo ? "Back" : "Assessments"}
				title={isEditMode ? "Edit Assessment" : "New Assessment"}
				subtitle={
					isEditMode
						? "Update assessment details"
						: "Schedule a new student assessment"
				}
				badge={
					isEditMode ? { label: "Editing", variant: "warning" } : undefined
				}
			/>

			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormContent>
					<div className="space-y-4">
						{/* Info Banner */}
						{!isEditMode && (
							<InfoBanner
								variant="info"
								title="Assessment Process"
								message="Create an assessment to evaluate a student's French language proficiency. You can schedule the session and track the results."
							/>
						)}

						{/* Assessment Details */}
						<FormSection
							title="Assessment Details"
							description="Basic information about the assessment"
							icon={ClipboardCheck}
							required
						>
							<FormRow>
								<FormField
									label="Student"
									required
									error={form.formState.errors.student_id?.message}
									hint={studentId ? "Pre-selected student" : undefined}
								>
									<Popover
										open={studentPopoverOpen}
										onOpenChange={setStudentPopoverOpen}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={studentPopoverOpen}
												className={cn(
													"h-9 w-full justify-between font-normal",
													!form.watch("student_id") && "text-muted-foreground",
												)}
												disabled={!!studentId || loadingStudents}
											>
												<span className="truncate">
													{selectedStudent
														? selectedStudent.full_name
														: "Select student..."}
												</span>
												{!studentId && (
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												)}
											</Button>
										</PopoverTrigger>
										{!studentId && (
											<PopoverContent className="w-[400px] p-0">
												<Command>
													<CommandInput placeholder="Search students..." />
													<CommandEmpty>No student found.</CommandEmpty>
													<CommandGroup className="max-h-64 overflow-auto">
														{students.map((student) => (
															<CommandItem
																key={student.id}
																value={`${student.full_name} ${student.email || ""}`}
																onSelect={() => {
																	form.setValue("student_id", student.id);
																	setStudentPopoverOpen(false);
																}}
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		form.watch("student_id") === student.id
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
																<div className="flex flex-col">
																	<span>{student.full_name}</span>
																	{student.email && (
																		<span className="text-muted-foreground text-xs">
																			{student.email}
																		</span>
																	)}
																</div>
															</CommandItem>
														))}
													</CommandGroup>
												</Command>
											</PopoverContent>
										)}
									</Popover>
								</FormField>

								<FormField
									label="Scheduled Date"
									hint="When is the assessment scheduled?"
									error={form.formState.errors.scheduled_for?.message}
								>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={cn(
													"h-9 w-full justify-start text-left font-normal",
													!form.watch("scheduled_for") &&
														"text-muted-foreground",
												)}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{form.watch("scheduled_for") ? (
													format(form.watch("scheduled_for")!, "PPP")
												) : (
													<span>Pick a date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={form.watch("scheduled_for")}
												onSelect={(date) =>
													form.setValue("scheduled_for", date)
												}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</FormField>
							</FormRow>

							<FormRow>
								<FormField
									label="Assessment Status"
									error={form.formState.errors.result?.message}
								>
									<SelectField
										value={form.watch("result")}
										onValueChange={(value) =>
											form.setValue("result", value as any)
										}
										options={assessmentStatuses}
									/>
								</FormField>

								<FormField
									label="Determined Level"
									hint="Language level after assessment"
									error={form.formState.errors.level_id?.message}
								>
									<SelectField
										placeholder="Select level"
										value={form.watch("level_id")}
										onValueChange={(value) => form.setValue("level_id", value)}
										options={languageLevelOptions}
										disabled={form.watch("result") !== "level_determined"}
									/>
								</FormField>
							</FormRow>

							<SwitchField
								label="Payment Status"
								description="Mark as paid when payment has been received"
								checked={form.watch("is_paid")}
								onCheckedChange={(checked) => form.setValue("is_paid", checked)}
							/>
						</FormSection>

						{/* Assessment Team */}
						<FormSection
							title="Assessment Team"
							description="Teachers involved in the assessment process"
							icon={Users}
						>
							<FormRow>
								<FormField
									label="Interview Held By"
									hint="Teacher who conducted the interview"
								>
									<Popover
										open={interviewerPopoverOpen}
										onOpenChange={setInterviewerPopoverOpen}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={interviewerPopoverOpen}
												className={cn(
													"h-9 w-full justify-between font-normal",
													!form.watch("interview_held_by") &&
														"text-muted-foreground",
												)}
												disabled={loadingTeachers}
											>
												<span className="truncate">
													{form.watch("interview_held_by")
														? (() => {
																const teacher = teachers.find(
																	(t) =>
																		t.id === form.watch("interview_held_by"),
																);
																return teacher
																	? `${teacher.first_name} ${teacher.last_name}`
																	: form.watch("interview_held_by");
															})()
														: "Select teacher..."}
												</span>
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-[400px] p-0">
											<Command>
												<CommandInput placeholder="Search teachers..." />
												<CommandEmpty>
													{loadingTeachers
														? "Loading teachers..."
														: teachers.length === 0
															? "No teachers available. Please create teachers first."
															: "No teacher found."}
												</CommandEmpty>
												<CommandGroup className="max-h-64 overflow-auto">
													{teachers.length > 0
														? teachers.map((teacher) => {
																const teacherName = `${teacher.first_name} ${teacher.last_name}`;
																return (
																	<CommandItem
																		key={teacher.id}
																		value={teacherName}
																		onSelect={() => {
																			form.setValue(
																				"interview_held_by",
																				teacher.id,
																			);
																			setInterviewerPopoverOpen(false);
																		}}
																	>
																		<Check
																			className={cn(
																				"mr-2 h-4 w-4",
																				form.watch("interview_held_by") ===
																					teacher.id
																					? "opacity-100"
																					: "opacity-0",
																			)}
																		/>
																		{teacherName}
																	</CommandItem>
																);
															})
														: !loadingTeachers && (
																<div className="p-2 text-muted-foreground text-sm">
																	No teachers available. Please create teachers
																	first.
																</div>
															)}
												</CommandGroup>
											</Command>
										</PopoverContent>
									</Popover>
								</FormField>

								<FormField
									label="Level Checked By"
									hint="Teacher who verified the level"
								>
									<Popover
										open={checkerPopoverOpen}
										onOpenChange={setCheckerPopoverOpen}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={checkerPopoverOpen}
												className={cn(
													"h-9 w-full justify-between font-normal",
													!form.watch("level_checked_by") &&
														"text-muted-foreground",
												)}
												disabled={loadingTeachers}
											>
												<span className="truncate">
													{form.watch("level_checked_by")
														? (() => {
																const teacher = teachers.find(
																	(t) =>
																		t.id === form.watch("level_checked_by"),
																);
																return teacher
																	? `${teacher.first_name} ${teacher.last_name}`
																	: form.watch("level_checked_by");
															})()
														: "Select teacher..."}
												</span>
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-[400px] p-0">
											<Command>
												<CommandInput placeholder="Search teachers..." />
												<CommandEmpty>
													{loadingTeachers
														? "Loading teachers..."
														: teachers.length === 0
															? "No teachers available. Please create teachers first."
															: "No teacher found."}
												</CommandEmpty>
												<CommandGroup className="max-h-64 overflow-auto">
													{teachers.length > 0
														? teachers.map((teacher) => {
																const teacherName = `${teacher.first_name} ${teacher.last_name}`;
																return (
																	<CommandItem
																		key={teacher.id}
																		value={teacherName}
																		onSelect={() => {
																			form.setValue(
																				"level_checked_by",
																				teacher.id,
																			);
																			setCheckerPopoverOpen(false);
																		}}
																	>
																		<Check
																			className={cn(
																				"mr-2 h-4 w-4",
																				form.watch("level_checked_by") ===
																					teacher.id
																					? "opacity-100"
																					: "opacity-0",
																			)}
																		/>
																		{teacherName}
																	</CommandItem>
																);
															})
														: !loadingTeachers && (
																<div className="p-2 text-muted-foreground text-sm">
																	No teachers available. Please create teachers
																	first.
																</div>
															)}
												</CommandGroup>
											</Command>
										</PopoverContent>
									</Popover>
								</FormField>
							</FormRow>
						</FormSection>

						{/* Resources & Notes */}
						<FormSection
							title="Resources & Notes"
							description="Additional information and links"
							icon={FileText}
						>
							<FormRow>
								<FormField
									label="Meeting Recording URL"
									hint="Link to the recorded assessment session"
									error={form.formState.errors.meeting_recording_url?.message}
								>
									<InputField
										type="url"
										placeholder="https://..."
										error={!!form.formState.errors.meeting_recording_url}
										{...form.register("meeting_recording_url")}
									/>
								</FormField>

								<FormField
									label="Calendar Event URL"
									hint="Link to the calendar event"
									error={form.formState.errors.calendar_event_url?.message}
								>
									<InputField
										type="url"
										placeholder="https://..."
										error={!!form.formState.errors.calendar_event_url}
										{...form.register("calendar_event_url")}
									/>
								</FormField>
							</FormRow>

							<FormField
								label="Assessment Notes"
								hint="Internal notes about the assessment"
								error={form.formState.errors.notes?.message}
							>
								<TextareaField
									placeholder="Add any relevant notes about the assessment..."
									rows={4}
									error={!!form.formState.errors.notes}
									{...form.register("notes")}
								/>
							</FormField>
						</FormSection>
					</div>
				</FormContent>

				<FormActions
					primaryLabel={isEditMode ? "Update Assessment" : "Create Assessment"}
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
