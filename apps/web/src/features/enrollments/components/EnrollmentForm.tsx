"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
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

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
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

interface EnrollmentFormProps {
	enrollment?: any;
	studentId?: string;
	onSuccess?: () => void;
}

export function EnrollmentForm({
	enrollment,
	studentId,
	onSuccess,
}: EnrollmentFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [students, setStudents] = useState<any[]>([]);
	const [cohorts, setCohorts] = useState<any[]>([]);
	const [loadingStudents, setLoadingStudents] = useState(false);
	const [loadingCohorts, setLoadingCohorts] = useState(false);

	const form = useForm<EnrollmentFormValues>({
		resolver: zodResolver(enrollmentFormSchema),
		defaultValues: {
			student_id: enrollment?.student_id || studentId || "",
			cohort_id: enrollment?.cohort_id || "",
			status: enrollment?.status ?? "interested",
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

	// Fetch cohorts
	useEffect(() => {
		async function fetchCohorts() {
			setLoadingCohorts(true);
			try {
				const response = await fetch("/api/cohorts");
				if (response.ok) {
					const data = await response.json();
					setCohorts(data.cohorts || []);
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

			// API expects snake_case field names
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

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="grid gap-4">
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
													!field.value && "text-muted-foreground",
												)}
												disabled={!!studentId || loadingStudents}
											>
												{field.value
													? students.find((s) => s.id === field.value)
															?.full_name
													: "Select student..."}
												{!studentId && (
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												)}
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
																	field.value === student.id
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
								<FormDescription>
									{studentId
										? "Student is pre-selected"
										: "Choose the student to enroll"}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="cohort_id"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<FormLabel>Cohort *</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												role="combobox"
												className={cn(
													"justify-between",
													!field.value && "text-muted-foreground",
												)}
												disabled={loadingCohorts}
											>
												{field.value
													? (() => {
															const cohort = cohorts.find(
																(c) => c.id === field.value,
															);
															return cohort
																? `${cohort.products?.format || "N/A"} - ${cohort.starting_level?.display_name || cohort.starting_level?.code?.toUpperCase() || "N/A"} (${cohort.start_date ? formatDate(cohort.start_date, "PP") : "TBD"})`
																: "Select cohort...";
														})()
													: "Select cohort..."}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-[400px] p-0">
										<Command>
											<CommandInput placeholder="Search cohorts..." />
											<CommandEmpty>No cohort found.</CommandEmpty>
											<CommandGroup className="max-h-64 overflow-auto">
												{cohorts.map((cohort) => (
													<CommandItem
														key={cohort.id}
														value={`${cohort.products?.format || ""} ${cohort.starting_level?.code || ""}`}
														onSelect={() => {
															form.setValue("cohort_id", cohort.id);
														}}
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																field.value === cohort.id
																	? "opacity-100"
																	: "opacity-0",
															)}
														/>
														<div className="flex flex-col">
															<span className="font-medium">
																{cohort.products?.format || "N/A"} -{" "}
																{cohort.starting_level?.display_name ||
																	cohort.starting_level?.code?.toUpperCase() ||
																	"N/A"}
															</span>
															<span className="text-muted-foreground text-xs">
																{cohort.start_date
																	? `Starts ${formatDate(cohort.start_date, "PP")}`
																	: "Start date TBD"}
																{cohort.cohort_status &&
																	` • ${cohort.cohort_status.replace("_", " ")}`}
															</span>
														</div>
													</CommandItem>
												))}
											</CommandGroup>
										</Command>
									</PopoverContent>
								</Popover>
								<FormDescription>
									Select the cohort for this enrollment
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Status</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="interested">Interested</SelectItem>
										<SelectItem value="beginner_form_filled">
											Form Filled
										</SelectItem>
										<SelectItem value="contract_abandoned">
											Contract Abandoned
										</SelectItem>
										<SelectItem value="contract_signed">
											Contract Signed
										</SelectItem>
										<SelectItem value="payment_abandoned">
											Payment Abandoned
										</SelectItem>
										<SelectItem value="paid">Paid</SelectItem>
										<SelectItem value="welcome_package_sent">
											Welcome Package Sent
										</SelectItem>
										<SelectItem value="transitioning">Transitioning</SelectItem>
										<SelectItem value="offboarding">Offboarding</SelectItem>
										<SelectItem value="declined_contract">
											Declined Contract
										</SelectItem>
										<SelectItem value="dropped_out">Dropped Out</SelectItem>
									</SelectContent>
								</Select>
								<FormDescription>
									Current status of the enrollment
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="flex gap-4">
					<Button type="submit" disabled={isLoading}>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{enrollment ? "Update Enrollment" : "Create Enrollment"}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push("/admin/students/enrollments")}
					>
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	);
}
