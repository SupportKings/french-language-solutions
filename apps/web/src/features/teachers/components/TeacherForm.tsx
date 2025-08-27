"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
	teacherFormSchema, 
	type TeacherFormData, 
	type Teacher 
} from "../schemas/teacher.schema";
import { useCreateTeacher, useUpdateTeacher } from "../queries/teachers.queries";

interface TeacherFormProps {
	teacher?: Teacher;
	mode: "create" | "edit";
}

export function TeacherForm({ teacher, mode }: TeacherFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const createTeacher = useCreateTeacher();
	const updateTeacher = useUpdateTeacher();

	const form = useForm<TeacherFormData>({
		resolver: zodResolver(teacherFormSchema),
		defaultValues: {
			first_name: teacher?.first_name || "",
			last_name: teacher?.last_name || "",
			group_class_bonus_terms: teacher?.group_class_bonus_terms || undefined,
			onboarding_status: teacher?.onboarding_status ?? "new",
			google_calendar_id: teacher?.google_calendar_id || "",
			maximum_hours_per_week: teacher?.maximum_hours_per_week || undefined,
			maximum_hours_per_day: teacher?.maximum_hours_per_day || undefined,
			qualified_for_under_16: teacher?.qualified_for_under_16 ?? false,
			available_for_booking: teacher?.available_for_booking ?? true,
			contract_type: teacher?.contract_type || undefined,
			available_for_online_classes: teacher?.available_for_online_classes ?? true,
			available_for_in_person_classes: teacher?.available_for_in_person_classes ?? false,
			mobile_phone_number: teacher?.mobile_phone_number || "",
			admin_notes: teacher?.admin_notes || "",
		},
	});

	const onSubmit = async (data: TeacherFormData) => {
		setIsSubmitting(true);
		try {
			if (mode === "create") {
				await createTeacher.mutateAsync(data);
				toast.success("Teacher created successfully");
			} else {
				await updateTeacher.mutateAsync({ id: teacher!.id, data });
				toast.success("Teacher updated successfully");
			}
			router.push("/admin/teachers");
		} catch (error) {
			toast.error(mode === "create" ? "Failed to create teacher" : "Failed to update teacher");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="first_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>First Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="last_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="mobile_phone_number"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Mobile Phone Number</FormLabel>
									<FormControl>
										<Input {...field} placeholder="+33 6 12 34 56 78" />
									</FormControl>
									<FormDescription>
										Enter in E.164 format (e.g., +33612345678)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="google_calendar_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Google Calendar ID</FormLabel>
									<FormControl>
										<Input {...field} placeholder="teacher@gmail.com" />
									</FormControl>
									<FormDescription>
										Calendar ID for scheduling classes
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Contract & Status */}
				<Card>
					<CardHeader>
						<CardTitle>Contract & Status</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="onboarding_status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Onboarding Status</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="new">New</SelectItem>
												<SelectItem value="training_in_progress">Training in Progress</SelectItem>
												<SelectItem value="onboarded">Onboarded</SelectItem>
												<SelectItem value="offboarded">Offboarded</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="contract_type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Contract Type</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select contract type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="full_time">Full Time</SelectItem>
												<SelectItem value="freelancer">Freelancer</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="group_class_bonus_terms"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Group Class Bonus Terms</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select bonus terms" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="per_student_per_hour">Per Student Per Hour</SelectItem>
											<SelectItem value="per_hour">Per Hour</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Availability */}
				<Card>
					<CardHeader>
						<CardTitle>Availability & Hours</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="maximum_hours_per_week"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Maximum Hours Per Week</FormLabel>
										<FormControl>
											<Input 
												type="number" 
												{...field} 
												onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="maximum_hours_per_day"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Maximum Hours Per Day</FormLabel>
										<FormControl>
											<Input 
												type="number" 
												{...field}
												onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
												value={field.value || ""}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Separator />

						<div className="space-y-4">
							<FormField
								control={form.control}
								name="available_for_booking"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">Available for Booking</FormLabel>
											<FormDescription>
												Teacher can be scheduled for new classes
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
								name="qualified_for_under_16"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">Qualified for Under 16</FormLabel>
											<FormDescription>
												Teacher can teach students under 16 years old
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
								name="available_for_online_classes"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">Available for Online Classes</FormLabel>
											<FormDescription>
												Teacher can conduct online classes
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
								name="available_for_in_person_classes"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">Available for In-Person Classes</FormLabel>
											<FormDescription>
												Teacher can conduct in-person classes
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
					</CardContent>
				</Card>

				{/* Admin Notes */}
				<Card>
					<CardHeader>
						<CardTitle>Admin Notes</CardTitle>
					</CardHeader>
					<CardContent>
						<FormField
							control={form.control}
							name="admin_notes"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea 
											{...field} 
											placeholder="Internal notes about this teacher..."
											className="min-h-[100px]"
										/>
									</FormControl>
									<FormDescription>
										These notes are only visible to administrators
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Actions */}
				<div className="flex gap-4">
					<Button
						type="submit"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Saving..." : mode === "create" ? "Create Teacher" : "Update Teacher"}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => router.push("/admin/teachers")}
					>
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	);
}