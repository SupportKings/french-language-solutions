"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";

import {
	FormActions,
	FormContent,
	FormField,
	FormHeader,
	FormLayout,
	FormRow,
	FormSection,
	InfoBanner,
	SelectField,
} from "@/components/form-layout/FormLayout";
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

import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@uidotdev/usehooks";
import {
	AlertCircle,
	BookOpen,
	Check,
	ChevronsUpDown,
	UserCheck,
	Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
		"transitioning",
		"offboarding",
	]),
});

type EnrollmentFormValues = z.infer<typeof enrollmentFormSchema>;

interface EnrollmentFormNewProps {
	enrollment?: any;
	studentId?: string;
	cohortId?: string;
	redirectTo?: string;
	onSuccess?: () => void;
}

export function EnrollmentFormNew({
	enrollment,
	studentId,
	cohortId,
	redirectTo,
	onSuccess,
}: EnrollmentFormNewProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [students, setStudents] = useState<any[]>([]);
	const [cohorts, setCohorts] = useState<any[]>([]);
	const [loadingStudents, setLoadingStudents] = useState(false);
	const [loadingCohorts, setLoadingCohorts] = useState(false);
	const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);
	const [cohortPopoverOpen, setCohortPopoverOpen] = useState(false);
	const [studentSearch, setStudentSearch] = useState("");
	const [cohortSearch, setCohortSearch] = useState("");
	const debouncedStudentSearch = useDebounce(studentSearch, 300);
	const debouncedCohortSearch = useDebounce(cohortSearch, 300);
	const isEditMode = !!enrollment;

	const form = useForm<EnrollmentFormValues>({
		resolver: zodResolver(enrollmentFormSchema),
		defaultValues: {
			student_id: enrollment?.student_id || studentId || "",
			cohort_id: enrollment?.cohort_id || cohortId || "",
			status: enrollment?.status ?? "interested",
		},
	});

	// Fetch students with search
	const fetchStudents = useCallback(async (searchTerm = "") => {
		setLoadingStudents(true);
		try {
			const queryParams = new URLSearchParams();
			if (searchTerm) {
				queryParams.append("search", searchTerm);
			}
			queryParams.append("limit", "20");

			const response = await fetch(`/api/students?${queryParams}`);
			if (response.ok) {
				const result = await response.json();
				const studentsList = result.data || [];
				// Filter to only show students with emails when searching
				const filteredStudents = searchTerm
					? studentsList.filter(
							(s: any) => s.email && s.full_name !== "Unknown",
						)
					: studentsList.filter((s: any) => s.full_name !== "Unknown");
				setStudents(filteredStudents);
			}
		} catch (error) {
			console.error("Error fetching students:", error);
			setStudents([]);
		} finally {
			setLoadingStudents(false);
		}
	}, []);

	// Trigger student search when debounced search changes
	useEffect(() => {
		if (studentPopoverOpen) {
			fetchStudents(debouncedStudentSearch);
		}
	}, [debouncedStudentSearch, studentPopoverOpen, fetchStudents]);

	// Fetch cohorts with search (search by product name or nickname)
	const fetchCohorts = useCallback(async (searchTerm = "") => {
		setLoadingCohorts(true);
		try {
			const queryParams = new URLSearchParams();
			queryParams.append("limit", "20");

			const response = await fetch(`/api/cohorts?${queryParams}`);
			if (response.ok) {
				const result = await response.json();
				let cohortsList = result.data || [];

				// Filter cohorts by product display_name or nickname if search term is provided
				if (searchTerm) {
					cohortsList = cohortsList.filter((cohort: any) => {
						const productName = cohort.products?.display_name || "";
						const nickname = cohort.nickname || "";
						const searchLower = searchTerm.toLowerCase();
						return (
							productName.toLowerCase().includes(searchLower) ||
							nickname.toLowerCase().includes(searchLower)
						);
					});
				}

				setCohorts(cohortsList);
			}
		} catch (error) {
			console.error("Error fetching cohorts:", error);
			setCohorts([]);
		} finally {
			setLoadingCohorts(false);
		}
	}, []);

	// Trigger cohort search when debounced search changes
	useEffect(() => {
		if (cohortPopoverOpen) {
			fetchCohorts(debouncedCohortSearch);
		}
	}, [debouncedCohortSearch, cohortPopoverOpen, fetchCohorts]);

	// Fetch pre-selected cohort if cohortId is provided
	useEffect(() => {
		if (cohortId && cohorts.length === 0) {
			fetch(`/api/cohorts/${cohortId}`)
				.then((res) => res.json())
				.then((data) => {
					if (data.cohort) {
						setCohorts([data.cohort]);
					}
				})
				.catch((error) => {
					console.error("Error fetching pre-selected cohort:", error);
				});
		}
	}, [cohortId, cohorts.length]);

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

			toast.success(
				enrollment
					? "Enrollment updated successfully"
					: "Enrollment created successfully",
			);

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
		{ label: "Transitioning", value: "transitioning" },
		{ label: "Offboarding", value: "offboarding" },
		{ label: "Declined Contract", value: "declined_contract" },
		{ label: "Dropped Out", value: "dropped_out" },
	];

	const selectedStudent = students.find(
		(s) => s.id === form.watch("student_id"),
	);
	const selectedCohort = cohorts.find((c) => c.id === form.watch("cohort_id"));

	return (
		<FormLayout>
			<FormHeader
				backUrl={redirectTo || "/admin/students/enrollments"}
				backLabel={redirectTo ? "Back" : "Enrollments"}
				title={isEditMode ? "Edit Enrollment" : "New Enrollment"}
				subtitle={
					isEditMode
						? "Update enrollment details"
						: "Create a new student enrollment"
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
												<Command shouldFilter={false}>
													<CommandInput
														placeholder="Search by email..."
														value={studentSearch}
														onValueChange={setStudentSearch}
													/>
													{!studentSearch && (
														<div className="border-b p-2 text-muted-foreground text-sm">
															<AlertCircle className="mr-1 inline-block h-3 w-3" />
															Students without data will not be shown
														</div>
													)}
													<CommandEmpty>
														{loadingStudents
															? "Searching..."
															: studentSearch
																? "No students found with this email."
																: ""}
													</CommandEmpty>
													<CommandGroup className="max-h-64 overflow-auto">
														{students.length > 0 && studentSearch
															? students.map((student) => (
																	<CommandItem
																		key={student.id}
																		value={student.id}
																		onSelect={() => {
																			form.setValue("student_id", student.id);
																			setStudentPopoverOpen(false);
																			setStudentSearch("");
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
																))
															: null}
													</CommandGroup>
													{students.length === 0 &&
														!loadingStudents &&
														studentSearch && (
															<div className="p-3 text-center text-muted-foreground text-xs">
																<AlertCircle className="mx-auto mb-1 h-4 w-4" />
																Note: Students with name "Unknown" will not be
																shown
															</div>
														)}
												</Command>
											</PopoverContent>
										)}
									</Popover>
								</FormField>

								<FormField
									label="Cohort"
									required
									error={form.formState.errors.cohort_id?.message}
									hint={cohortId ? "Pre-selected cohort" : undefined}
								>
									<Popover
										open={cohortPopoverOpen}
										onOpenChange={setCohortPopoverOpen}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={cohortPopoverOpen}
												className={cn(
													"h-9 w-full justify-between font-normal",
													!form.watch("cohort_id") && "text-muted-foreground",
												)}
												disabled={!!cohortId || loadingCohorts}
											>
												<span className="flex items-center gap-2 truncate">
													{selectedCohort ? (
														<>
															{selectedCohort.nickname ||
																selectedCohort.products?.display_name ||
																(selectedCohort.products?.format
																	? `${selectedCohort.products.format.charAt(0).toUpperCase() + selectedCohort.products.format.slice(1)} Course`
																	: "Course")}
														</>
													) : (
														"Select cohort..."
													)}
												</span>
												{!cohortId && (
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												)}
											</Button>
										</PopoverTrigger>
										{!cohortId && (
											<PopoverContent className="w-[400px] p-0">
											<Command
												shouldFilter={false}
												className="[&_[cmdk-item]:hover]:bg-accent [&_[cmdk-item]:hover]:text-accent-foreground"
											>
												<CommandInput
													placeholder="Search by product name or nickname..."
													value={cohortSearch}
													onValueChange={setCohortSearch}
												/>
												{!cohortSearch && (
													<div className="border-b p-2 text-muted-foreground text-sm">
														<AlertCircle className="mr-1 inline-block h-3 w-3" />
														Type a product name or nickname to search for cohorts
													</div>
												)}
												<CommandEmpty>
													{loadingCohorts
														? "Searching..."
														: cohortSearch
															? "No cohorts found with this product name or nickname."
															: ""}
												</CommandEmpty>
												<CommandGroup className="max-h-64 overflow-auto [&_[cmdk-item]]:cursor-pointer">
													{cohorts.length > 0 && cohortSearch
														? cohorts.map((cohort, index) => (
																<CommandItem
																	key={`cohort-${cohort.id}-${index}`}
																	value={cohort.id}
																	onSelect={() => {
																		form.setValue("cohort_id", cohort.id);
																		setCohortPopoverOpen(false);
																		setCohortSearch("");
																	}}
																	className="cursor-pointer"
																>
																	<Check
																		className={cn(
																			"mr-2 h-4 w-4",
																			form.watch("cohort_id") === cohort.id
																				? "opacity-100"
																				: "opacity-0",
																		)}
																	/>
																	<div className="flex flex-1 items-start gap-2">
																		<div className="flex flex-1 flex-col">
																			<span className="flex items-center gap-2 font-medium">
																				{cohort.nickname ||
																					cohort.products?.display_name ||
																					(cohort.products?.format
																						? `${cohort.products.format.charAt(0).toUpperCase() + cohort.products.format.slice(1)} Course`
																						: "Course")}
																			</span>
																			<span className="text-muted-foreground text-xs">
																				{cohort.starting_level?.display_name ||
																					cohort.starting_level?.code?.toUpperCase() ||
																					"N/A"}{" "}
																				→{" "}
																				{cohort.current_level?.display_name ||
																					cohort.current_level?.code?.toUpperCase() ||
																					"N/A"}
																				{cohort.start_date &&
																					` • Starts ${formatDate(cohort.start_date, "PP")}`}
																			</span>
																		</div>
																	</div>
																</CommandItem>
															))
														: null}
												</CommandGroup>
											</Command>
										</PopoverContent>
										)}
									</Popover>
								</FormField>
							</FormRow>

							{/* Show selected details */}
							{(selectedStudent || selectedCohort) && (
								<div className="space-y-2 rounded-lg border bg-muted/30 p-3">
									{selectedStudent && (
										<div className="flex items-center gap-2 text-sm">
											<UserCheck className="h-4 w-4 text-muted-foreground" />
											<span className="text-muted-foreground">Student:</span>
											<span className="font-medium">
												{selectedStudent.full_name}
											</span>
											{selectedStudent.email && (
												<span className="text-muted-foreground text-xs">
													({selectedStudent.email})
												</span>
											)}
										</div>
									)}
									{selectedCohort && (
										<div className="flex items-center gap-2 text-sm">
											<Users className="h-4 w-4 text-muted-foreground" />
											<span className="text-muted-foreground">Cohort:</span>
											<span className="flex items-center gap-2 font-medium">
												{selectedCohort.nickname ||
													selectedCohort.products?.display_name ||
													(selectedCohort.products?.format
														? `${selectedCohort.products.format.charAt(0).toUpperCase() + selectedCohort.products.format.slice(1)} Course`
														: "Course")}
												<span className="text-muted-foreground text-xs">
													(
													{selectedCohort.starting_level?.display_name ||
														selectedCohort.starting_level?.code?.toUpperCase() ||
														"N/A"}{" "}
													→{" "}
													{selectedCohort.current_level?.display_name ||
														selectedCohort.current_level?.code?.toUpperCase() ||
														"N/A"}
													)
												</span>
											</span>
											{selectedCohort.start_date && (
												<span className="text-muted-foreground text-xs">
													• Starts{" "}
													{new Date(
														selectedCohort.start_date,
													).toLocaleDateString()}
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
									onValueChange={(value) =>
										form.setValue("status", value as any)
									}
									options={statusOptions}
								/>
							</FormField>

							{/* Status helper text */}
							<div className="rounded-lg border bg-muted/30 p-3">
								<p className="text-muted-foreground text-xs">
									{form.watch("status") === "interested" &&
										"Student has shown interest but hasn't started the enrollment process."}
									{form.watch("status") === "beginner_form_filled" &&
										"Student has completed the initial assessment form."}
									{form.watch("status") === "contract_signed" &&
										"Student has signed the enrollment contract."}
									{form.watch("status") === "paid" &&
										"Payment has been received for this enrollment."}
									{form.watch("status") === "welcome_package_sent" &&
										"Welcome materials have been sent to the student."}
									{form.watch("status") === "transitioning" &&
										"Student is transitioning between cohorts or programs."}
									{form.watch("status") === "offboarding" &&
										"Student is being offboarded from the program."}
									{form.watch("status") === "dropped_out" &&
										"Student has discontinued their enrollment."}
									{form.watch("status") === "declined_contract" &&
										"Student decided not to proceed with the enrollment."}
									{form.watch("status") === "contract_abandoned" &&
										"Student started but didn't complete the contract process."}
									{form.watch("status") === "payment_abandoned" &&
										"Student signed the contract but didn't complete payment."}
								</p>
							</div>
						</FormSection>
					</div>
				</FormContent>

				<FormActions
					primaryLabel={isEditMode ? "Update Enrollment" : "Create Enrollment"}
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
