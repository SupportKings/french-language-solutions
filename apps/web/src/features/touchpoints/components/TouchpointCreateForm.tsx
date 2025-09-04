"use client";

import { useState } from "react";

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
	SelectField,
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
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { studentsApi } from "@/features/students/api/students.api";

import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@uidotdev/usehooks";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	CalendarIcon,
	Check,
	ChevronsUpDown,
	FileText,
	Link,
	MessageSquare,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const touchpointFormSchema = z.object({
	student_id: z.string().min(1, "Student is required"),
	channel: z.enum(["sms", "call", "whatsapp", "email"]),
	type: z.enum(["inbound", "outbound"]),
	message: z.string().min(1, "Message content is required"),
	source: z.enum([
		"manual",
		"automated",
		"openphone",
		"gmail",
		"whatsapp_business",
		"webhook",
	]),
	occurred_at: z.date(),
	automated_follow_up_id: z.string().optional().or(z.literal("")),
});

type TouchpointFormValues = z.infer<typeof touchpointFormSchema>;

export function TouchpointCreateForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [studentSearchOpen, setStudentSearchOpen] = useState(false);
	const [followUpSearchOpen, setFollowUpSearchOpen] = useState(false);
	const [studentSearch, setStudentSearch] = useState("");
	const [followUpSearch, setFollowUpSearch] = useState("");

	// Debounce the student search to avoid too many API calls
	const debouncedStudentSearch = useDebounce(studentSearch, 300);

	// Fetch students for search - only when user types (with debouncing)
	const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
		queryKey: ["students", "search", debouncedStudentSearch],
		queryFn: () =>
			studentsApi.list({
				search: debouncedStudentSearch,
				page: 1,
				limit: 20, // Increased limit for better results
				sortBy: "created_at",
				sortOrder: "desc",
			}),
		enabled: debouncedStudentSearch.length >= 2, // Only search after 2 characters
		staleTime: 1000 * 60 * 5, // Cache for 5 minutes
	});

	// Don't fetch all students initially - only search-based
	const students = studentsData?.data || [];

	// Fetch follow-up sequences
	const { data: followUpsData } = useQuery({
		queryKey: ["follow-up-sequences"],
		queryFn: async () => {
			const response = await fetch("/api/sequences");
			if (!response.ok) throw new Error("Failed to fetch sequences");
			return response.json();
		},
		staleTime: 1000 * 60 * 10, // Cache for 10 minutes since these don't change often
	});
	const followUpSequences = followUpsData?.data || [];

	const form = useForm<TouchpointFormValues>({
		resolver: zodResolver(touchpointFormSchema),
		defaultValues: {
			student_id: "",
			channel: "email",
			type: "outbound",
			message: "",
			source: "manual",
			occurred_at: new Date(),
			automated_follow_up_id: "",
		},
	});

	// Fetch the selected student details if we have an ID but no data
	const studentId = form.watch("student_id");
	const { data: selectedStudentData } = useQuery({
		queryKey: ["students", studentId],
		queryFn: () => studentsApi.getById(studentId),
		enabled: !!studentId && !students.find((s) => s.id === studentId),
		staleTime: 1000 * 60 * 10,
	});

	const selectedStudent =
		students.find((s) => s.id === studentId) || selectedStudentData;
	const selectedFollowUp = followUpSequences?.find(
		(f: any) => f.id === form.watch("automated_follow_up_id"),
	);

	async function onSubmit(values: TouchpointFormValues) {
		setIsLoading(true);

		try {
			// Format dates for API - keep in local timezone
			const payload = {
				...values,
				occurred_at: format(values.occurred_at, "yyyy-MM-dd'T'HH:mm:ss"),
				automated_follow_up_id: values.automated_follow_up_id || null,
			};

			const response = await fetch("/api/touchpoints", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to create touchpoint");
			}

			toast.success("Touchpoint logged successfully");
			router.push("/admin/automation/touchpoints");
			router.refresh();
		} catch (error) {
			console.error("Error creating touchpoint:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to create touchpoint",
			);
		} finally {
			setIsLoading(false);
		}
	}

	const channels = [
		{ label: "📧 Email", value: "email" },
		{ label: "📱 SMS", value: "sms" },
		{ label: "📞 Call", value: "call" },
		{ label: "💬 WhatsApp", value: "whatsapp" },
	];

	const types = [
		{ label: "➡️ Outbound (From Us)", value: "outbound" },
		{ label: "⬅️ Inbound (From Student)", value: "inbound" },
	];

	const sources = [
		{ label: "Manual Entry", value: "manual" },
		{ label: "Automated System", value: "automated" },
		{ label: "OpenPhone", value: "openphone" },
		{ label: "Gmail", value: "gmail" },
		{ label: "WhatsApp Business", value: "whatsapp_business" },
		{ label: "Webhook", value: "webhook" },
	];

	return (
		<FormLayout>
			<FormHeader
				backUrl="/admin/automation/touchpoints"
				backLabel="Touchpoints"
				title="Log New Touchpoint"
				subtitle="Record a student communication"
			/>

			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormContent>
					<div className="space-y-4">
						{/* Info Banner */}
						<InfoBanner
							variant="info"
							title="Communication Tracking"
							message="Log all interactions with students to maintain a complete communication history. This helps track engagement and follow-up effectiveness."
						/>

						{/* Communication Details */}
						<FormSection
							title="Communication Details"
							description="Basic information about this interaction"
							icon={MessageSquare}
							required
						>
							<FormField
								label="Student"
								required
								error={form.formState.errors.student_id?.message}
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
											className="w-full justify-between"
										>
											{selectedStudent
												? selectedStudent.full_name
												: "Select student..."}
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
													<div className="py-6 text-center text-sm text-muted-foreground">
														Start typing to search students...
													</div>
												) : isLoadingStudents ? (
													<div className="py-6 text-center text-sm text-muted-foreground">
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
																	form.setValue("student_id", currentValue);
																	setStudentSearchOpen(false);
																	setStudentSearch(""); // Clear search after selection
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
																<div className="flex-1">
																	<p className="font-medium">
																		{student.full_name}
																	</p>
																	<p className="text-muted-foreground text-xs">
																		{student.email ||
																			student.mobile_phone_number ||
																			"No contact info"}
																	</p>
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

							<FormRow>
								<FormField
									label="Channel"
									required
									error={form.formState.errors.channel?.message}
								>
									<SelectField
										value={form.watch("channel")}
										onValueChange={(value) =>
											form.setValue("channel", value as any)
										}
										options={channels}
									/>
								</FormField>
								<FormField
									label="Direction"
									required
									error={form.formState.errors.type?.message}
								>
									<SelectField
										value={form.watch("type")}
										onValueChange={(value) =>
											form.setValue("type", value as any)
										}
										options={types}
									/>
								</FormField>
							</FormRow>

							<FormRow>
								<FormField
									label="Source"
									hint="How was this communication logged?"
									error={form.formState.errors.source?.message}
								>
									<SelectField
										value={form.watch("source")}
										onValueChange={(value) =>
											form.setValue("source", value as any)
										}
										options={sources}
									/>
								</FormField>
								<FormField
									label="Date & Time"
									error={form.formState.errors.occurred_at?.message}
								>
									<div className="flex gap-2">
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"h-9 flex-1 justify-start text-left font-normal",
														!form.watch("occurred_at") &&
															"text-muted-foreground",
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{form.watch("occurred_at") ? (
														format(form.watch("occurred_at"), "MMM d, yyyy")
													) : (
														<span>Pick a date</span>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={form.watch("occurred_at")}
													onSelect={(date) => {
														if (date) {
															// Preserve the time from the current value
															const currentTime = form.watch("occurred_at");
															date.setHours(currentTime.getHours());
															date.setMinutes(currentTime.getMinutes());
															form.setValue("occurred_at", date);
														}
													}}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<input
											type="time"
											className="h-9 rounded-md border border-input bg-background px-3 text-sm"
											value={format(form.watch("occurred_at"), "HH:mm")}
											onChange={(e) => {
												const [hours, minutes] = e.target.value.split(":");
												const newDate = new Date(form.watch("occurred_at"));
												newDate.setHours(parseInt(hours, 10));
												newDate.setMinutes(parseInt(minutes, 10));
												form.setValue("occurred_at", newDate);
											}}
										/>
									</div>
								</FormField>
							</FormRow>
						</FormSection>

						{/* Message Content */}
						<FormSection
							title="Message Content"
							description="The actual communication content"
							icon={FileText}
							required
						>
							<FormField
								label="Message"
								required
								hint="Describe the communication or paste the message content"
								error={form.formState.errors.message?.message}
							>
								<TextareaField
									placeholder="Enter the message content or summary of the conversation..."
									className="min-h-[120px]"
									error={!!form.formState.errors.message}
									{...form.register("message")}
								/>
							</FormField>
						</FormSection>

						{/* Optional Follow-up Linking */}
						<FormSection
							title="Follow-up Linking"
							description="Optionally link this touchpoint to an automated follow-up sequence"
							icon={Link}
						>
							<FormField
								label="Link to Follow-up Sequence"
								hint="Select a follow-up sequence if this touchpoint is part of an automated campaign"
							>
								<Popover
									open={followUpSearchOpen}
									onOpenChange={setFollowUpSearchOpen}
								>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											role="combobox"
											aria-expanded={followUpSearchOpen}
											className="w-full justify-between"
										>
											{selectedFollowUp
												? selectedFollowUp.display_name
												: "No follow-up linked (optional)"}
											<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-[400px] p-0">
										<Command>
											<CommandInput
												placeholder="Search follow-up sequences..."
												value={followUpSearch}
												onValueChange={setFollowUpSearch}
											/>
											<CommandList>
												<CommandEmpty>No sequence found.</CommandEmpty>
												<CommandGroup>
													<CommandItem
														value=""
														onSelect={() => {
															form.setValue("automated_follow_up_id", "");
															setFollowUpSearchOpen(false);
														}}
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																!form.watch("automated_follow_up_id")
																	? "opacity-100"
																	: "opacity-0",
															)}
														/>
														<span className="text-muted-foreground">
															No follow-up (clear selection)
														</span>
													</CommandItem>
													{followUpSequences
														?.filter((seq: any) =>
															followUpSearch
																? seq.display_name
																		.toLowerCase()
																		.includes(followUpSearch.toLowerCase())
																: true,
														)
														.map((sequence: any) => (
															<CommandItem
																key={sequence.id}
																value={sequence.id}
																onSelect={(currentValue) => {
																	form.setValue(
																		"automated_follow_up_id",
																		currentValue,
																	);
																	setFollowUpSearchOpen(false);
																}}
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		form.watch("automated_follow_up_id") ===
																			sequence.id
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
																<div>
																	<p className="font-medium">
																		{sequence.display_name}
																	</p>
																	{sequence.description && (
																		<p className="text-muted-foreground text-xs">
																			{sequence.description}
																		</p>
																	)}
																</div>
															</CommandItem>
														))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							</FormField>
						</FormSection>
					</div>
				</FormContent>

				<FormActions
					primaryLabel="Log Touchpoint"
					primaryLoading={isLoading}
					primaryDisabled={isLoading}
					primaryType="submit"
					secondaryLabel="Cancel"
					onSecondaryClick={() => router.push("/admin/automation/touchpoints")}
				/>
			</form>
		</FormLayout>
	);
}
