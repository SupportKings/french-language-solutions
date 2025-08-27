"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const assessmentFormSchema = z.object({
	student_id: z.string().min(1, "Student is required"),
	level: z.enum([
		"a1", "a1_plus", "a2", "a2_plus", "b1", "b1_plus",
		"b2", "b2_plus", "c1", "c1_plus", "c2"
	]).optional(),
	scheduled_for: z.date().optional(),
	is_paid: z.boolean(),
	result: z.enum([
		"requested", "scheduled", "session_held", "level_determined"
	]),
	notes: z.union([z.string(), z.literal("")]).optional(),
	interview_held_by: z.union([z.string(), z.literal("")]).optional(),
	level_checked_by: z.union([z.string(), z.literal("")]).optional(),
	meeting_recording_url: z.union([z.string().url(), z.literal("")]).optional(),
	calendar_event_url: z.union([z.string().url(), z.literal("")]).optional(),
});

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;

interface AssessmentFormProps {
	assessment?: any;
	studentId?: string;
	onSuccess?: () => void;
}

export function AssessmentForm({ assessment, studentId, onSuccess }: AssessmentFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [students, setStudents] = useState<any[]>([]);
	const [teachers, setTeachers] = useState<any[]>([]);
	const [loadingStudents, setLoadingStudents] = useState(false);
	const [loadingTeachers, setLoadingTeachers] = useState(false);

	const form = useForm<AssessmentFormValues>({
		resolver: zodResolver(assessmentFormSchema),
		defaultValues: {
			student_id: assessment?.student_id || studentId || "",
			level: assessment?.level,
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
					const data = await response.json();
					setStudents(data.students || []);
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
				const response = await fetch("/api/teachers?onboarding_status=onboarded");
				if (response.ok) {
					const data = await response.json();
					setTeachers(data.teachers || []);
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
			
			// API expects camelCase for these specific fields
			const payload = {
				studentId: values.student_id,
				level: values.level || null,
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

			toast.success(assessment ? "Assessment updated successfully" : "Assessment created successfully");
			
			if (onSuccess) {
				onSuccess();
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

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2">
					<FormField
						control={form.control}
						name="student_id"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Student *</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												role="combobox"
												className={cn(
													"justify-between",
													!field.value && "text-muted-foreground"
												)}
												disabled={!!studentId || loadingStudents}
											>
												{field.value
													? students.find((s) => s.id === field.value)?.full_name
													: "Select student..."}
												{!studentId && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
											</Button>
										</FormControl>
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
															value={student.full_name}
															onSelect={() => {
																form.setValue("student_id", student.id);
															}}
														>
															<Check
																className={cn(
																	"mr-2 h-4 w-4",
																	field.value === student.id ? "opacity-100" : "opacity-0"
																)}
															/>
															<div className="flex flex-col">
																<span>{student.full_name}</span>
																{student.email && (
																	<span className="text-xs text-muted-foreground">{student.email}</span>
																)}
															</div>
														</CommandItem>
													))}
												</CommandGroup>
											</Command>
										</PopoverContent>
									)}
								</Popover>
								<FormDescription>
									{studentId ? "Student is pre-selected" : "Choose the student for assessment"}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="scheduled_for"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Scheduled Date</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												className={cn(
													"pl-3 text-left font-normal",
													!field.value && "text-muted-foreground"
												)}
											>
												{field.value ? (
													format(field.value, "PPP")
												) : (
													<span>Pick a date</span>
												)}
												<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
								<FormDescription>
									When is the assessment scheduled?
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="level"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Language Level</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select level" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="a1">A1</SelectItem>
										<SelectItem value="a1_plus">A1+</SelectItem>
										<SelectItem value="a2">A2</SelectItem>
										<SelectItem value="a2_plus">A2+</SelectItem>
										<SelectItem value="b1">B1</SelectItem>
										<SelectItem value="b1_plus">B1+</SelectItem>
										<SelectItem value="b2">B2</SelectItem>
										<SelectItem value="b2_plus">B2+</SelectItem>
										<SelectItem value="c1">C1</SelectItem>
										<SelectItem value="c1_plus">C1+</SelectItem>
										<SelectItem value="c2">C2</SelectItem>
									</SelectContent>
								</Select>
								<FormDescription>
									Determined language level
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="result"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Assessment Status</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="requested">Requested</SelectItem>
										<SelectItem value="scheduled">Scheduled</SelectItem>
										<SelectItem value="session_held">Session Held</SelectItem>
										<SelectItem value="level_determined">Level Determined</SelectItem>
									</SelectContent>
								</Select>
								<FormDescription>
									Current status of the assessment
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="interview_held_by"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Interview Held By</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												role="combobox"
												className={cn(
													"justify-between",
													!field.value && "text-muted-foreground"
												)}
												disabled={loadingTeachers}
											>
												{field.value
													? teachers.find((t) => t.id === field.value)?.full_name
													: "Select teacher..."}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-[400px] p-0">
										<Command>
											<CommandInput placeholder="Search teachers..." />
											<CommandEmpty>No teacher found.</CommandEmpty>
											<CommandGroup className="max-h-64 overflow-auto">
												{teachers.map((teacher) => (
													<CommandItem
														key={teacher.id}
														value={teacher.full_name}
														onSelect={() => {
															form.setValue("interview_held_by", teacher.id);
														}}
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																field.value === teacher.id ? "opacity-100" : "opacity-0"
															)}
														/>
														{teacher.full_name}
													</CommandItem>
												))}
											</CommandGroup>
										</Command>
									</PopoverContent>
								</Popover>
								<FormDescription>
									Teacher who conducted the interview
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="level_checked_by"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Level Checked By</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												role="combobox"
												className={cn(
													"justify-between",
													!field.value && "text-muted-foreground"
												)}
												disabled={loadingTeachers}
											>
												{field.value
													? teachers.find((t) => t.id === field.value)?.full_name
													: "Select teacher..."}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-[400px] p-0">
										<Command>
											<CommandInput placeholder="Search teachers..." />
											<CommandEmpty>No teacher found.</CommandEmpty>
											<CommandGroup className="max-h-64 overflow-auto">
												{teachers.map((teacher) => (
													<CommandItem
														key={teacher.id}
														value={teacher.full_name}
														onSelect={() => {
															form.setValue("level_checked_by", teacher.id);
														}}
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																field.value === teacher.id ? "opacity-100" : "opacity-0"
															)}
														/>
														{teacher.full_name}
													</CommandItem>
												))}
											</CommandGroup>
										</Command>
									</PopoverContent>
								</Popover>
								<FormDescription>
									Teacher who verified the level
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="is_paid"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
								<div className="space-y-0.5">
									<FormLabel className="text-base">Paid</FormLabel>
									<FormDescription>
										Has the assessment been paid for?
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="notes"
						render={({ field }) => (
							<FormItem className="md:col-span-2">
								<FormLabel>Notes</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Additional notes about the assessment..."
										className="resize-none"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="meeting_recording_url"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Meeting Recording URL</FormLabel>
								<FormControl>
									<Input type="url" placeholder="https://..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="calendar_event_url"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Calendar Event URL</FormLabel>
								<FormControl>
									<Input type="url" placeholder="https://..." {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="flex gap-4">
					<Button
						type="submit"
						disabled={isLoading}
					>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{assessment ? "Update Assessment" : "Create Assessment"}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push("/admin/students/assessments")}
					>
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	);
}