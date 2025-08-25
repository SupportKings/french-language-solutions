"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
	UserCheck, 
	MessageSquare, 
	Check, 
	ChevronsUpDown,
	Calendar,
	AlertCircle
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
	InfoBanner
} from "@/components/form-layout/FormLayout";

const followUpFormSchema = z.object({
	student_id: z.string().min(1, "Student is required"),
	sequence_id: z.string().min(1, "Sequence is required"),
	status: z.enum([
		"activated",
		"ongoing",
		"answer_received",
		"disabled"
	]).default("activated"),
});

type FollowUpFormValues = z.infer<typeof followUpFormSchema>;

interface AutomatedFollowUpFormProps {
	followUp?: any;
	searchParams?: {
		studentId?: string;
		studentName?: string;
		email?: string;
		phone?: string;
	};
	onSuccess?: () => void;
}

export function AutomatedFollowUpForm({ followUp, searchParams, onSuccess }: AutomatedFollowUpFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [students, setStudents] = useState<any[]>([]);
	const [sequences, setSequences] = useState<any[]>([]);
	const [loadingStudents, setLoadingStudents] = useState(false);
	const [loadingSequences, setLoadingSequences] = useState(false);
	const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);
	const [sequencePopoverOpen, setSequencePopoverOpen] = useState(false);
	const isEditMode = !!followUp;

	const form = useForm<FollowUpFormValues>({
		resolver: zodResolver(followUpFormSchema),
		defaultValues: {
			student_id: followUp?.student_id || searchParams?.studentId || "",
			sequence_id: followUp?.sequence_id || "",
			status: followUp?.status || "activated",
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
					const studentsList = result.data || [];
					setStudents(Array.isArray(studentsList) ? studentsList : []);
					
					// If we have a searchParams.studentName, pre-select that student
					if (searchParams?.studentName && !form.getValues("student_id")) {
						const matchingStudent = studentsList.find((s: any) => 
							s.full_name === searchParams.studentName || 
							s.id === searchParams.studentId
						);
						if (matchingStudent) {
							form.setValue("student_id", matchingStudent.id);
						}
					}
				}
			} catch (error) {
				console.error("Failed to fetch students:", error);
				toast.error("Failed to load students");
			} finally {
				setLoadingStudents(false);
			}
		}
		fetchStudents();
	}, [searchParams, form]);

	// Fetch sequences
	useEffect(() => {
		async function fetchSequences() {
			setLoadingSequences(true);
			try {
				const response = await fetch("/api/sequences?limit=100");
				if (response.ok) {
					const result = await response.json();
					console.log("Fetched sequences:", result); // Debug log
					const sequencesList = result.data || [];
					setSequences(Array.isArray(sequencesList) ? sequencesList : []);
				} else {
					console.error("Failed to fetch sequences:", response.status);
					toast.error("Failed to load sequences");
				}
			} catch (error) {
				console.error("Failed to fetch sequences:", error);
				toast.error("Failed to load sequences");
			} finally {
				setLoadingSequences(false);
			}
		}
		fetchSequences();
	}, []);

	const onSubmit = async (data: FollowUpFormValues) => {
		setIsLoading(true);
		try {
			const url = isEditMode 
				? `/api/automated-follow-ups/${followUp.id}`
				: "/api/automated-follow-ups";
			
			const response = await fetch(url, {
				method: isEditMode ? "PATCH" : "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to save follow-up");
			}

			toast.success(isEditMode ? "Follow-up updated successfully" : "Follow-up created successfully");
			
			if (onSuccess) {
				onSuccess();
			} else {
				router.push("/admin/automation/automated-follow-ups");
			}
		} catch (error) {
			console.error("Error saving follow-up:", error);
			toast.error(error instanceof Error ? error.message : "Failed to save follow-up");
		} finally {
			setIsLoading(false);
		}
	};

	const selectedStudent = students.find(s => s.id === form.watch("student_id"));
	const selectedSequence = sequences.find(s => s.id === form.watch("sequence_id"));

	return (
		<FormLayout >
			<FormHeader
				backUrl="/admin/automation/automated-follow-ups"
				backLabel="Follow-ups"
				title={isEditMode ? "Edit Automated Follow-up" : "Set Automated Follow-up"}
				subtitle={isEditMode ? "Update the automated follow-up details" : "Configure an automated follow-up sequence for a student"}
			/>

			<form  onSubmit={form.handleSubmit(onSubmit)}>
				<FormContent>
					{/* Pre-filled info from search params */}
					{searchParams?.studentName && (
						<InfoBanner
							icon={UserCheck}
							title="Student Pre-selected"
							description={`Setting up follow-up for ${searchParams.studentName}`}
						/>
					)}

					<FormSection title="Follow-up Configuration">
						<FormRow>
							<FormField
								label="Student"
								description="Select the student for this follow-up"
								required
								error={form.formState.errors.student_id?.message}
							>
								<Popover open={studentPopoverOpen} onOpenChange={setStudentPopoverOpen}>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											role="combobox"
											aria-expanded={studentPopoverOpen}
											className="w-full justify-between"
											disabled={loadingStudents}
										>
											{selectedStudent ? (
												<div className="flex items-center gap-2">
													<UserCheck className="h-4 w-4" />
													<span>{selectedStudent.full_name}</span>
													{selectedStudent.email && (
														<span className="text-muted-foreground text-xs">
															({selectedStudent.email})
														</span>
													)}
												</div>
											) : (
												<span className="text-muted-foreground">
													{loadingStudents ? "Loading students..." : "Select a student..."}
												</span>
											)}
											<ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-[400px] p-0">
										<Command>
											<CommandInput placeholder="Search students..." />
											<CommandEmpty>No student found.</CommandEmpty>
											<CommandGroup className="max-h-[200px] overflow-auto">
												{students.map((student) => (
													<CommandItem
														key={student.id}
														value={`${student.full_name} ${student.email || ''}`}
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
														<div className="flex-1">
															<p className="font-medium">{student.full_name}</p>
															{student.email && (
																<p className="text-sm text-muted-foreground">{student.email}</p>
															)}
														</div>
													</CommandItem>
												))}
											</CommandGroup>
										</Command>
									</PopoverContent>
								</Popover>
							</FormField>

							<FormField
								label="Sequence"
								description="Select the follow-up sequence to use"
								required
								error={form.formState.errors.sequence_id?.message}
							>
								<Popover open={sequencePopoverOpen} onOpenChange={setSequencePopoverOpen}>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											role="combobox"
											aria-expanded={sequencePopoverOpen}
											className="w-full justify-between"
											disabled={loadingSequences}
										>
											{selectedSequence ? (
												<div className="flex items-center gap-2">
													<MessageSquare className="h-4 w-4" />
													<span>{selectedSequence.display_name || selectedSequence.displayName || 'Selected'}</span>
												</div>
											) : (
												<span className="text-muted-foreground">
													{loadingSequences ? "Loading sequences..." : "Select a sequence..."}
												</span>
											)}
											<ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-[400px] p-0">
										<Command>
											<CommandInput placeholder="Search sequences..." />
											<CommandEmpty>No sequence found.</CommandEmpty>
											<CommandGroup className="max-h-[200px] overflow-auto">
												{sequences.length === 0 ? (
													<CommandItem disabled>
														<span className="text-muted-foreground">No sequences available</span>
													</CommandItem>
												) : (
													sequences.map((sequence) => (
														<CommandItem
															key={sequence.id}
															value={`${sequence.display_name || sequence.displayName || ''} ${sequence.subject || ''}`}
															onSelect={() => {
																form.setValue("sequence_id", sequence.id);
																setSequencePopoverOpen(false);
															}}
														>
															<Check
																className={cn(
																	"mr-2 h-4 w-4",
																	form.watch("sequence_id") === sequence.id ? "opacity-100" : "opacity-0"
																)}
															/>
															<div className="flex-1">
																<p className="font-medium">{sequence.display_name || sequence.displayName || 'Unnamed Sequence'}</p>
																{sequence.subject && (
																	<p className="text-sm text-muted-foreground">{sequence.subject}</p>
																)}
															</div>
														</CommandItem>
													))
												)}
											</CommandGroup>
										</Command>
									</PopoverContent>
								</Popover>
							</FormField>
						</FormRow>
					</FormSection>
				</FormContent>

				<FormActions>
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push("/admin/automation/automated-follow-ups")}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isLoading}>
						{isLoading ? "Saving..." : isEditMode ? "Update Follow-up" : "Create Follow-up"}
					</Button>
				</FormActions>
			</form>
		</FormLayout>
	);
}