"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
	FormActions,
	FormContent,
	FormField,
	FormHeader,
	FormLayout,
	FormSection,
	InfoBanner,
} from "@/components/form-layout/FormLayout";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { studentsApi } from "@/features/students/api/students.api";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import {
	Check,
	ChevronsUpDown,
	Loader2,
	UserPlus,
	Workflow,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createAutomatedFollowUp } from "../actions/create-follow-up";
import { sequencesQuery } from "../queries/follow-ups.queries";

const formSchema = z.object({
	student_id: z.string().min(1, "Please select a student"),
	sequence_id: z.string().min(1, "Please select a sequence"),
	start_immediately: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface FollowUpFormProps {
	studentId?: string;
	sequenceId?: string;
	redirectTo?: string;
}

export function FollowUpForm({
	studentId,
	sequenceId,
	redirectTo,
}: FollowUpFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [studentSearchOpen, setStudentSearchOpen] = useState(false);
	const [studentSearch, setStudentSearch] = useState("");

	// Debounce the student search to avoid too many API calls
	const debouncedStudentSearch = useDebounce(studentSearch, 300);

	// Fetch students for search - only when user types (with debouncing)
	const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
		queryKey: ["students", "search", debouncedStudentSearch],
		queryFn: () =>
			studentsApi.list({
				search: debouncedStudentSearch,
				page: 1,
				limit: 20,
				sortBy: "created_at",
				sortOrder: "desc",
			}),
		enabled: debouncedStudentSearch.length >= 2, // Only search after 2 characters
		staleTime: 1000 * 60 * 5, // Cache for 5 minutes
	});

	const students = studentsData?.data || [];

	// Fetch sequences for dropdown
	const { data: sequencesData, isLoading: isLoadingSequences } = useQuery(
		sequencesQuery.all(),
	);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			student_id: studentId || "",
			sequence_id: sequenceId || "",
			start_immediately: true,
		},
	});

	// Fetch the selected student details if we have an ID but no data
	const selectedStudentId = form.watch("student_id");
	const { data: selectedStudentData } = useQuery({
		queryKey: ["students", selectedStudentId],
		queryFn: () => studentsApi.getById(selectedStudentId),
		enabled:
			!!selectedStudentId && !students.find((s) => s.id === selectedStudentId),
		staleTime: 1000 * 60 * 10,
	});

	const selectedStudent =
		students.find((s) => s.id === selectedStudentId) || selectedStudentData;

	const selectedSequenceId = form.watch("sequence_id");
	const selectedSequence = sequencesData?.data?.find(
		(s: any) => s.id === selectedSequenceId
	);

	const onSubmit = async (values: FormValues) => {
		setIsSubmitting(true);
		try {
			const { data, serverError } = await createAutomatedFollowUp(values);

			if (data) {
				toast.success("Automated follow-up has been created successfully");

				if (redirectTo) {
					router.push(redirectTo);
				} else {
					router.push("/admin/automation/automated-follow-ups");
				}
			} else {
				const errorMessage =
					serverError || "Failed to create automated follow-up";
				toast.error(errorMessage);
			}
		} catch (error) {
			toast.error("An unexpected error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		if (redirectTo) {
			router.push(redirectTo);
		} else {
			router.push("/admin/automation/automated-follow-ups");
		}
	};

	return (
		<FormLayout>
			<FormHeader
				backUrl="/admin/automation/automated-follow-ups"
				backLabel="Automated Follow-ups"
				title="New Automated Follow-up"
				subtitle="Create a new automated follow-up sequence for a student"
			/>

			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormContent>
					<div className="space-y-4">
						{/* Info Banner */}
						<InfoBanner
							variant="info"
							title="Getting Started"
							message="Select a student and a follow-up sequence template to start automated messaging. The sequence will begin immediately or can be scheduled."
						/>

						{/* Student Selection */}
						<FormSection
							title="Student Selection"
							description="Choose the student who will receive the automated follow-up"
							icon={UserPlus}
							required
						>
							<FormField
								label="Student"
								required
								error={form.formState.errors.student_id?.message}
								hint="Search by name, email, or phone number"
							>
								<Popover
									open={studentSearchOpen}
									onOpenChange={setStudentSearchOpen}
								>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											role="combobox"
											aria-expanded={studentSearchOpen}
											className="w-full justify-between font-normal"
											disabled={!!studentId}
										>
											{selectedStudent ? (
												<div className="flex flex-col items-start">
													<span className="font-medium">
														{selectedStudent.full_name}
													</span>
													{selectedStudent.email && (
														<span className="text-muted-foreground text-xs">
															{selectedStudent.email}
														</span>
													)}
												</div>
											) : (
												"Search and select a student..."
											)}
											<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-[400px] p-0">
										<Command shouldFilter={false}>
											<CommandInput
												placeholder="Type at least 2 characters to search..."
												value={studentSearch}
												onValueChange={setStudentSearch}
											/>
											<CommandList>
												{studentSearch.length < 2 ? (
													<div className="py-6 text-center text-muted-foreground text-sm">
														Start typing to search students...
													</div>
												) : isLoadingStudents ? (
													<div className="py-6 text-center text-muted-foreground text-sm">
														<Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
														Loading students...
													</div>
												) : students.length === 0 ? (
													<CommandEmpty>
														No students found for "{studentSearch}"
													</CommandEmpty>
												) : (
													<CommandGroup>
														{students.map((student) => (
															<CommandItem
																key={student.id}
																value={student.id}
																onSelect={(currentValue) => {
																	form.setValue("student_id", currentValue, {
																		shouldValidate: true,
																	});
																	setStudentSearchOpen(false);
																	setStudentSearch("");
																}}
															>
																<Check
																	className={`mr-2 h-4 w-4 ${
																		selectedStudentId === student.id
																			? "opacity-100"
																			: "opacity-0"
																	}`}
																/>
																<div className="flex flex-col">
																	<span className="font-medium">
																		{student.full_name}
																	</span>
																	<div className="flex flex-col text-muted-foreground text-xs">
																		{student.email && (
																			<span>{student.email}</span>
																		)}
																		{student.mobile_phone_number && (
																			<span>{student.mobile_phone_number}</span>
																		)}
																	</div>
																</div>
															</CommandItem>
														))}
													</CommandGroup>
												)}
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							</FormField>
						</FormSection>

						{/* Sequence Selection */}
						<FormSection
							title="Follow-up Sequence"
							description="Select the automated sequence template to use"
							icon={Workflow}
							required
						>
							<FormField
								label="Sequence Template"
								required
								error={form.formState.errors.sequence_id?.message}
								hint="Choose from your active sequence templates"
							>
								<Select
									value={form.watch("sequence_id")}
									onValueChange={(value) =>
										form.setValue("sequence_id", value, {
											shouldValidate: true,
										})
									}
									disabled={isLoadingSequences || !!sequenceId}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a sequence">
											{selectedSequence?.display_name || "Select a sequence"}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{isLoadingSequences ? (
											<div className="flex items-center justify-center p-4">
												<Loader2 className="h-4 w-4 animate-spin" />
											</div>
										) : sequencesData?.data?.length === 0 ? (
											<div className="p-4 text-center text-muted-foreground">
												No active sequences found
											</div>
										) : (
											sequencesData?.data?.map((sequence: any) => (
												<SelectItem 
													key={sequence.id} 
													value={sequence.id}
													className="flex flex-col items-start py-2"
												>
													<div className="font-medium">
														{sequence.display_name}
													</div>
													{sequence.subject && (
														<div className="text-muted-foreground text-xs mt-0.5">
															Subject: {sequence.subject}
														</div>
													)}
													{sequence.first_follow_up_delay_minutes && (
														<div className="text-muted-foreground text-xs">
															First message after{" "}
															{sequence.first_follow_up_delay_minutes < 60
																? `${sequence.first_follow_up_delay_minutes} minutes`
																: sequence.first_follow_up_delay_minutes < 1440
																? `${Math.floor(sequence.first_follow_up_delay_minutes / 60)} hours`
																: `${Math.floor(sequence.first_follow_up_delay_minutes / 1440)} days`}
														</div>
													)}
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
							</FormField>
						</FormSection>
					</div>
				</FormContent>

				<FormActions
					primaryLabel="Create Automated Follow-up"
					primaryLoading={isSubmitting}
					onSecondaryClick={handleCancel}
				/>
			</form>
		</FormLayout>
	);
}
