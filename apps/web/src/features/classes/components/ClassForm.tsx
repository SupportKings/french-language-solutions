"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { BookOpen, Calendar, Clock, MapPin, Users, Video } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCreateClass, useUpdateClass } from "../queries/classes.queries";
import {
	type Class,
	type ClassFormValues,
	classFormSchema,
} from "../schemas/class.schema";

interface ClassFormProps {
	initialData?: Class;
	isEdit?: boolean;
}

export function ClassForm({ initialData, isEdit = false }: ClassFormProps) {
	const router = useRouter();
	const createClass = useCreateClass();
	const updateClass = useUpdateClass();

	// Fetch cohorts for selection
	const { data: cohorts } = useQuery({
		queryKey: ["cohorts"],
		queryFn: async () => {
			const supabase = createClient();
			const { data } = await supabase
				.from("cohorts")
				.select("id, starting_level, start_date")
				.order("created_at", { ascending: false });
			return data || [];
		},
	});

	// Fetch teachers for selection
	const { data: teachers } = useQuery({
		queryKey: ["teachers"],
		queryFn: async () => {
			const supabase = createClient();
			const { data } = await supabase
				.from("teachers")
				.select("id, full_name")
				.eq("onboarding_status", "onboarded")
				.order("full_name");
			return data || [];
		},
	});

	const form = useForm<ClassFormValues>({
		resolver: zodResolver(classFormSchema),
		defaultValues: initialData || {
			name: "",
			description: "",
			cohort_id: "",
			start_time: "",
			end_time: "",
			status: "scheduled",
			mode: "online",
			room: "",
			meeting_link: "",
			materials: "",
			max_students: 10,
			current_enrollment: 0,
			teacher_id: "",
			is_active: true,
			notes: "",
		},
	});

	const onSubmit = async (data: ClassFormValues) => {
		if (isEdit && initialData) {
			updateClass.mutate(
				{ id: initialData.id, data },
				{
					onSuccess: () => {
						router.push(`/admin/cohorts/${initialData.id}`);
					},
				},
			);
		} else {
			createClass.mutate(data, {
				onSuccess: (createdClass) => {
					router.push(`/admin/cohorts/${createdClass.cohort_id}`);
				},
			});
		}
	};

	const isSubmitting = createClass.isPending || updateClass.isPending;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<Card className="border-border/50 bg-card/95 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							Basic Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Class Name</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., French A1 - Module 3"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Brief description of the class content and objectives"
											className="min-h-[100px]"
											{...field}
											value={field.value || ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="cohort_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Cohort</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a cohort" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{cohorts?.map((cohort) => (
													<SelectItem key={cohort.id} value={cohort.id}>
														{cohort.starting_level} - {cohort.start_date}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="teacher_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Teacher (Optional)</FormLabel>
										<Select
											onValueChange={(value) =>
												field.onChange(value === "none" ? "" : value)
											}
											defaultValue={field.value || "none"}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a teacher" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="none">
													No teacher assigned
												</SelectItem>
												{teachers?.map((teacher) => (
													<SelectItem key={teacher.id} value={teacher.id}>
														{teacher.full_name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/50 bg-card/95 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							Schedule & Status
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="start_time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Start Time</FormLabel>
										<FormControl>
											<Input type="datetime-local" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="end_time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>End Time</FormLabel>
										<FormControl>
											<Input type="datetime-local" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
												<SelectItem value="scheduled">Scheduled</SelectItem>
												<SelectItem value="in_progress">In Progress</SelectItem>
												<SelectItem value="completed">Completed</SelectItem>
												<SelectItem value="cancelled">Cancelled</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="mode"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mode</FormLabel>
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
												<SelectItem value="online">
													<div className="flex items-center gap-2">
														<Video className="h-4 w-4" />
														Online
													</div>
												</SelectItem>
												<SelectItem value="in_person">
													<div className="flex items-center gap-2">
														<MapPin className="h-4 w-4" />
														In Person
													</div>
												</SelectItem>
												<SelectItem value="hybrid">Hybrid</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>
				</Card>

				<Card className="border-border/50 bg-card/95 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPin className="h-5 w-5" />
							Location & Resources
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="room"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Room/Location</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., Room 201 or Building A"
											{...field}
											value={field.value || ""}
										/>
									</FormControl>
									<FormDescription>
										Physical location for in-person classes
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="meeting_link"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Meeting Link</FormLabel>
									<FormControl>
										<Input
											placeholder="https://zoom.us/..."
											type="url"
											{...field}
											value={field.value || ""}
										/>
									</FormControl>
									<FormDescription>
										Video conference link for online classes
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="materials"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Materials Link</FormLabel>
									<FormControl>
										<Input
											placeholder="Link to course materials"
											{...field}
											value={field.value || ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				<Card className="border-border/50 bg-card/95 backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Capacity & Settings
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="max_students"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Maximum Students</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="1"
												{...field}
												onChange={(e) =>
													field.onChange(Number.parseInt(e.target.value))
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="current_enrollment"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Current Enrollment</FormLabel>
										<FormControl>
											<Input
												type="number"
												min="0"
												{...field}
												onChange={(e) =>
													field.onChange(Number.parseInt(e.target.value))
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="is_active"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">Active</FormLabel>
										<FormDescription>
											Active classes are visible and can accept enrollments
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
								<FormItem>
									<FormLabel>Internal Notes</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Any additional notes for internal use"
											className="min-h-[80px]"
											{...field}
											value={field.value || ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				<div className="flex justify-end gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.back()}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting
							? isEdit
								? "Updating..."
								: "Creating..."
							: isEdit
								? "Update Class"
								: "Create Class"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
