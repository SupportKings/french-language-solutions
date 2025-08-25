"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
	UserCheck, 
	Users, 
	Check, 
	ChevronsUpDown,
	BookOpen,
	AlertCircle,
	Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
	FormLayout,
	FormHeader,
	FormContent,
	FormSection,
	FormField,
	FormRow,
	FormActions,
	InfoBanner,
	SelectField
} from "@/components/form-layout/FormLayout";

const enrollmentFormSchema = z.object({
	student_id: z.string().min(1, "Student is required"),
	cohort_id: z.string().min(1, "Cohort is required"),
	status: z.enum([
		"declined_contract",
		"dropped_out",
		"interested",
		"beginner_form_filled",
		"contract_abandoned",
		"contract_signed",
		"payment_abandoned",
		"paid",
		"welcome_package_sent",
	]).default("interested"),
});

type EnrollmentFormValues = z.infer<typeof enrollmentFormSchema>;

interface EnrollmentFormNewProps {
	enrollment?: any;
	studentId?: string;
	cohortId?: string;
	cohortName?: string;
	redirectTo?: string;
	onSuccess?: () => void;
}

export function EnrollmentFormNew({ 
	enrollment, 
	studentId, 
	cohortId,
	cohortName,
	redirectTo,
	onSuccess 
}: EnrollmentFormNewProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [students, setStudents] = useState<any[]>([]);
	const [cohorts, setCohorts] = useState<any[]>([]);
	const [loadingStudents, setLoadingStudents] = useState(false);
	const [loadingCohorts, setLoadingCohorts] = useState(false);
	const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);
	const [cohortPopoverOpen, setCohortPopoverOpen] = useState(false);
	const isEditMode = !!enrollment;

	const form = useForm<EnrollmentFormValues>({
		resolver: zodResolver(enrollmentFormSchema),
		defaultValues: {
			student_id: enrollment?.student_id || studentId || "",
			cohort_id: enrollment?.cohort_id || cohortId || "",
			status: enrollment?.status || "interested",
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
					console.log("Fetched students data:", result); // Debug log
					// The API returns { data: [...], meta: {...} }
					const studentsList = result.data || [];
					setStudents(Array.isArray(studentsList) ? studentsList : []);
				}
			} catch (error) {
				console.error("Error fetching students:", error);
			} finally {
				setLoadingStudents(false);
			}
		}
		fetchStudents();
	}, []);

	// Fetch cohorts
	useEffect(() => {
		async function fetchCohorts() {
			setLoadingCohorts(true);
			try {
				const response = await fetch("/api/cohorts?limit=100");
				if (response.ok) {
					const result = await response.json();
					console.log("Fetched cohorts data:", result); // Debug log
					// The API returns { data: [...], meta: {...} }
					const cohortsList = result.data || [];
					setCohorts(Array.isArray(cohortsList) ? cohortsList : []);
				}
			} catch (error) {
				console.error("Error fetching cohorts:", error);
			} finally {
				setLoadingCohorts(false);
			}
		}
		fetchCohorts();
	}, []);

	async function onSubmit(values: EnrollmentFormValues) {
		setIsLoading(true);
		
		try {
			const url = enrollment 
				? `/api/enrollments/${enrollment.id}`
				: "/api/enrollments";
			
			const method = enrollment ? "PATCH" : "POST";
			
			const payload = {
				studentId: values.student_id,
				cohortId: values.cohort_id,
				status: values.status,
			};

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to save enrollment");
			}

			toast.success(enrollment ? "Enrollment updated successfully" : "Enrollment created successfully");
			
			if (onSuccess) {
				onSuccess();
			} else if (redirectTo) {
				router.push(redirectTo);
				router.refresh();
			} else {
				router.push("/admin/students/enrollments");
				router.refresh();
			}
		} catch (error: any) {
			console.error("Error saving enrollment:", error);
			toast.error(error.message || "Failed to save enrollment");
		} finally {
			setIsLoading(false);
		}
	}

	const handleCancel = () => {
		if (redirectTo) {
			router.push(redirectTo);
		} else {
			router.push("/admin/students/enrollments");
		}
	};

	const statusOptions = [
		{ label: "Interested", value: "interested" },
		{ label: "Form Filled", value: "beginner_form_filled" },
		{ label: "Contract Abandoned", value: "contract_abandoned" },
		{ label: "Contract Signed", value: "contract_signed" },
		{ label: "Payment Abandoned", value: "payment_abandoned" },
		{ label: "Paid", value: "paid" },
		{ label: "Welcome Package Sent", value: "welcome_package_sent" },
		{ label: "Declined Contract", value: "declined_contract" },
		{ label: "Dropped Out", value: "dropped_out" },
	];

	const selectedStudent = students.find(s => s.id === form.watch("student_id"));
	const selectedCohort = cohorts.find(c => c.id === form.watch("cohort_id"));

	return (
		<FormLayout>
			<FormHeader
				backUrl={redirectTo || "/admin/students/enrollments"}
				backLabel={redirectTo ? "Back" : "Enrollments"}
				title={isEditMode ? "Edit Enrollment" : "New Enrollment"}
				subtitle={isEditMode ? "Update enrollment details" : "Create a new student enrollment"}
				badge={isEditMode ? { label: "Editing", variant: "warning" } : undefined}
			/>

			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormContent>
					<div className="space-y-4">
						{/* Info Banner */}
						{!isEditMode && (
							<InfoBanner
								variant="info"
								title="Quick Enrollment"
								message="Link a student to a cohort to start their learning journey. You can update the enrollment status as they progress."
							/>
						)}

						{/* Enrollment Details */}
						<FormSection 
							title="Enrollment Details" 
							description="Select the student and cohort for this enrollment"
							icon={BookOpen}
							required
						>
							<FormRow>
								<FormField 
									label="Student" 
									required
									error={form.formState.errors.student_id?.message}
									hint={studentId ? "Pre-selected student" : undefined}
								>
									<Popover open={studentPopoverOpen} onOpenChange={setStudentPopoverOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={studentPopoverOpen}
												className={cn(
													"w-full h-9 justify-between font-normal",
													!form.watch("student_id") && "text-muted-foreground"
												)}
												disabled={!!studentId || loadingStudents}
											>
												<span className="truncate">
													{selectedStudent
														? selectedStudent.full_name
														: "Select student..."}
												</span>
												{!studentId && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
											</Button>
										</PopoverTrigger>
										{!studentId && (
											<PopoverContent className="w-[400px] p-0">
												<Command>
													<CommandInput placeholder="Search students..." />
													<CommandEmpty>
														{loadingStudents ? "Loading students..." : "No student found."}
													</CommandEmpty>
													<CommandGroup className="max-h-64 overflow-auto">
														{students.length > 0 ? (
															students.map((student) => (
																<CommandItem
																	key={student.id}
																	value={student.full_name?.toLowerCase()}
																	onSelect={() => {
																		form.setValue("student_id", student.id);
																		setStudentPopoverOpen(false);
																	}}
																>
																	<Check
																		className={cn(
																			"mr-2 h-4 w-4",
																			form.watch("student_id") === student.id ? "opacity-100" : "opacity-0"
																		)}
																	/>
																	<div className="flex flex-col">
																		<span>{student.full_name}</span>
																		{student.email && (
																			<span className="text-xs text-muted-foreground">{student.email}</span>
																		)}
																	</div>
																</CommandItem>
															))
														) : (
															!loadingStudents && (
																<div className="p-2 text-sm text-muted-foreground">
																	No students available. Please create students first.
																</div>
															)
														)}
													</CommandGroup>
												</Command>
											</PopoverContent>
										)}
									</Popover>
								</FormField>

								<FormField 
									label="Cohort" 
									required
									error={form.formState.errors.cohort_id?.message}
								>
									<Popover open={cohortPopoverOpen} onOpenChange={setCohortPopoverOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={cohortPopoverOpen}
												className={cn(
													"w-full h-9 justify-between font-normal",
													!form.watch("cohort_id") && "text-muted-foreground"
												)}
												disabled={loadingCohorts}
											>
												<span className="truncate flex items-center gap-2">
													{selectedCohort ? (
														<>
															{selectedCohort.title || (
																<>
																	<span className="text-muted-foreground">Title Missing</span>
																	<AlertCircle className="h-3 w-3 text-warning" />
																</>
															)}
														</>
													) : "Select cohort..."}
												</span>
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-[400px] p-0">
											<Command>
												<CommandInput placeholder="Search cohorts..." />
												<CommandEmpty>
													{loadingCohorts ? "Loading cohorts..." : "No cohort found."}
												</CommandEmpty>
												<CommandGroup className="max-h-64 overflow-auto">
													{cohorts.length > 0 ? (
														cohorts.map((cohort) => (
															<CommandItem
																key={cohort.id}
																value={`${cohort.format || ''} ${cohort.starting_level || ''}`.toLowerCase()}
																onSelect={() => {
																	form.setValue("cohort_id", cohort.id);
																	setCohortPopoverOpen(false);
																}}
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		form.watch("cohort_id") === cohort.id ? "opacity-100" : "opacity-0"
																	)}
																/>
																<div className="flex items-start gap-2 flex-1">
																	<div className="flex flex-col flex-1">
																		<span className="font-medium flex items-center gap-2">
																			{cohort.title || (
																				<>
																					<span className="text-muted-foreground">Title Missing</span>
																					<AlertCircle className="h-3 w-3 text-warning" />
																				</>
																			)}
																		</span>
																		<span className="text-xs text-muted-foreground">
																			{cohort.format} - {cohort.starting_level?.toUpperCase()}
																			{cohort.start_date && ` • Starts ${new Date(cohort.start_date).toLocaleDateString()}`}
																		</span>
																	</div>
																</div>
															</CommandItem>
														))
													) : (
														!loadingCohorts && (
															<div className="p-2 text-sm text-muted-foreground">
																No cohorts available. Please create cohorts first.
															</div>
														)
													)}
												</CommandGroup>
											</Command>
										</PopoverContent>
									</Popover>
								</FormField>
							</FormRow>

							{/* Show selected details */}
							{(selectedStudent || selectedCohort) && (
								<div className="rounded-lg border bg-muted/30 p-3 space-y-2">
									{selectedStudent && (
										<div className="flex items-center gap-2 text-sm">
											<UserCheck className="h-4 w-4 text-muted-foreground" />
											<span className="text-muted-foreground">Student:</span>
											<span className="font-medium">{selectedStudent.full_name}</span>
											{selectedStudent.email && (
												<span className="text-xs text-muted-foreground">({selectedStudent.email})</span>
											)}
										</div>
									)}
									{selectedCohort && (
										<div className="flex items-center gap-2 text-sm">
											<Users className="h-4 w-4 text-muted-foreground" />
											<span className="text-muted-foreground">Cohort:</span>
											<span className="font-medium flex items-center gap-2">
												{selectedCohort.title ? (
													<>
														{selectedCohort.title}
														<span className="text-xs text-muted-foreground">
															({selectedCohort.format} - {selectedCohort.starting_level?.toUpperCase()})
														</span>
													</>
												) : (
													<>
														<span className="text-muted-foreground">Title Missing</span>
														<AlertCircle className="h-3 w-3 text-warning" />
														<span className="text-xs text-muted-foreground">
															({selectedCohort.format} - {selectedCohort.starting_level?.toUpperCase()})
														</span>
													</>
												)}
											</span>
											{selectedCohort.start_date && (
												<span className="text-xs text-muted-foreground">
													• Starts {new Date(selectedCohort.start_date).toLocaleDateString()}
												</span>
											)}
										</div>
									)}
								</div>
							)}
						</FormSection>

						{/* Enrollment Status */}
						<FormSection 
							title="Status" 
							description="Track the enrollment progress"
							icon={AlertCircle}
						>
							<FormField 
								label="Enrollment Status"
								hint="Update as the student progresses through the enrollment process"
								error={form.formState.errors.status?.message}
							>
								<SelectField
									value={form.watch("status")}
									onValueChange={(value) => form.setValue("status", value as any)}
									options={statusOptions}
								/>
							</FormField>

							{/* Status helper text */}
							<div className="rounded-lg border bg-muted/30 p-3">
								<p className="text-xs text-muted-foreground">
									{form.watch("status") === "interested" && "Student has shown interest but hasn't started the enrollment process."}
									{form.watch("status") === "beginner_form_filled" && "Student has completed the initial assessment form."}
									{form.watch("status") === "contract_signed" && "Student has signed the enrollment contract."}
									{form.watch("status") === "paid" && "Payment has been received for this enrollment."}
									{form.watch("status") === "welcome_package_sent" && "Welcome materials have been sent to the student."}
									{form.watch("status") === "dropped_out" && "Student has discontinued their enrollment."}
									{form.watch("status") === "declined_contract" && "Student decided not to proceed with the enrollment."}
									{form.watch("status") === "contract_abandoned" && "Student started but didn't complete the contract process."}
									{form.watch("status") === "payment_abandoned" && "Student signed the contract but didn't complete payment."}
								</p>
							</div>
						</FormSection>
					</div>
				</FormContent>

				<FormActions
					primaryLabel={isEditMode ? "Update Enrollment" : "Create Enrollment"}
					primaryLoading={isLoading}
					primaryDisabled={!form.formState.isValid && form.formState.isSubmitted}
					primaryType="submit"
					secondaryLabel="Cancel"
					onSecondaryClick={handleCancel}
				/>
			</form>
		</FormLayout>
	);
}