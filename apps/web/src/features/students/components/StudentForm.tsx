"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const studentFormSchema = z.object({
	full_name: z.string().min(1, "Full name is required"),
	email: z.string().email("Invalid email").optional().or(z.literal("")),
	mobile_phone_number: z.string().max(20).optional().or(z.literal("")),
	city: z.string().optional().or(z.literal("")),
	desired_starting_language_level: z.enum([
		"a1", "a1_plus", "a2", "a2_plus", "b1", "b1_plus", 
		"b2", "b2_plus", "c1", "c1_plus", "c2"
	]).optional(),
	website_quiz_submission_date: z.date().optional(),
	added_to_email_newsletter: z.boolean().default(false),
	initial_channel: z.enum([
		"form", "quiz", "call", "message", "email", "assessment"
	]).optional(),
	communication_channel: z.enum(["sms_email", "email", "sms"]).default("sms_email"),
	is_full_beginner: z.boolean().default(false),
	is_under_16: z.boolean().default(false),
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

interface StudentFormProps {
	student?: any;
	onSuccess?: () => void;
}

export function StudentForm({ student, onSuccess }: StudentFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<StudentFormValues>({
		resolver: zodResolver(studentFormSchema),
		defaultValues: {
			full_name: student?.full_name || "",
			email: student?.email || "",
			mobile_phone_number: student?.mobile_phone_number || "",
			city: student?.city || "",
			desired_starting_language_level: student?.desired_starting_language_level,
			website_quiz_submission_date: student?.website_quiz_submission_date 
				? new Date(student.website_quiz_submission_date) 
				: undefined,
			added_to_email_newsletter: student?.added_to_email_newsletter || false,
			initial_channel: student?.initial_channel,
			communication_channel: student?.communication_channel || "sms_email",
			is_full_beginner: student?.is_full_beginner || false,
			is_under_16: student?.is_under_16 || false,
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
			const url = student 
				? `/api/students/${student.id}`
				: "/api/students";
			
			const method = student ? "PATCH" : "POST";
			
			// Format dates for API - fields are already snake_case
			const payload = {
				...values,
				website_quiz_submission_date: values.website_quiz_submission_date
					? format(values.website_quiz_submission_date, "yyyy-MM-dd")
					: null,
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

			toast.success(student ? "Student updated successfully" : "Student created successfully");
			
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

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<div className="grid gap-6">
					<div className="grid gap-4 md:grid-cols-2">
						<FormField
							control={form.control}
							name="full_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name *</FormLabel>
									<FormControl>
										<Input placeholder="John Doe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="john@example.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="mobile_phone_number"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Mobile Phone</FormLabel>
									<FormControl>
										<Input placeholder="+1234567890" {...field} />
									</FormControl>
									<FormDescription>E.164 format preferred</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="city"
							render={({ field }) => (
								<FormItem>
									<FormLabel>City</FormLabel>
									<FormControl>
										<Input placeholder="New York" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Learning Preferences</h3>
						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="desired_starting_language_level"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Desired Starting Level</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a level" />
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
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="subjective_deadline_for_student"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Target Deadline</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														className={cn(
															"w-full pl-3 text-left font-normal",
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
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="purpose_to_learn"
								render={({ field }) => (
									<FormItem className="md:col-span-2">
										<FormLabel>Purpose to Learn</FormLabel>
										<FormControl>
											<Textarea 
												placeholder="Why do you want to learn French?"
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
								name="is_full_beginner"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">Full Beginner</FormLabel>
											<FormDescription>
												Student has no prior French knowledge
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
								name="is_under_16"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">Under 16</FormLabel>
											<FormDescription>
												Student is under 16 years old
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
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Communication</h3>
						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="communication_channel"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Communication Channel</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="sms_email">SMS + Email</SelectItem>
												<SelectItem value="email">Email Only</SelectItem>
												<SelectItem value="sms">SMS Only</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="initial_channel"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Initial Channel</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="How did they find us?" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="form">Form</SelectItem>
												<SelectItem value="quiz">Quiz</SelectItem>
												<SelectItem value="call">Call</SelectItem>
												<SelectItem value="message">Message</SelectItem>
												<SelectItem value="email">Email</SelectItem>
												<SelectItem value="assessment">Assessment</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="website_quiz_submission_date"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Quiz Submission Date</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														className={cn(
															"w-full pl-3 text-left font-normal",
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
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="added_to_email_newsletter"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">Newsletter Subscription</FormLabel>
											<FormDescription>
												Student is subscribed to email newsletter
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
						</div>
					</div>
				</div>

				<div className="flex gap-4">
					<Button
						type="submit"
						disabled={isLoading}
					>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{student ? "Update Student" : "Create Student"}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push("/admin/students")}
					>
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	);
}