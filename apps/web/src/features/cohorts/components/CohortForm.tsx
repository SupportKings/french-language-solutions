"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { languageLevelQueries } from "@/features/language-levels/queries/language-levels.queries";
import { 
	CalendarIcon, 
	GraduationCap,
	MapPin,
	FolderOpen,
	BookOpen,
	Users,
	Clock,
	Plus,
	Trash2,
	Info,
	ChevronLeft,
	Settings,
	Calendar
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Schema for the cohort form
const cohortFormSchema = z.object({
	// Basic Information
	format: z.enum(["group", "private"]),
	starting_level_id: z.string(),
	current_level_id: z.string().optional(),
	
	// Schedule
	start_date: z.date().optional(),
	cohort_status: z.enum(["enrollment_open", "enrollment_closed", "class_ended"]),
	
	// Location
	room_type: z.enum(["for_one_to_one", "medium", "medium_plus", "large"]).optional(),
	room: z.string().optional(),
	
	// Resources
	product_id: z.string().optional(),
	google_drive_folder_id: z.string().optional(),
	
	// Weekly Sessions
	weekly_sessions: z.array(z.object({
		id: z.string().optional(),
		day_of_week: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
		start_time: z.string(),
		end_time: z.string(),
		teacher_id: z.string().optional(),
		google_calendar_event_id: z.string().optional(),
	})),
	
	// External IDs
	airtable_record_id: z.string().optional(),
});

type CohortFormValues = z.infer<typeof cohortFormSchema>;

interface CohortFormProps {
	cohort?: any;
	onSuccess?: () => void;
}


const roomTypeOptions = [
	{ value: "for_one_to_one", label: "One-to-One" },
	{ value: "medium", label: "Medium" },
	{ value: "medium_plus", label: "Medium Plus" },
	{ value: "large", label: "Large" },
];

const dayOptions = [
	{ value: "monday", label: "Monday" },
	{ value: "tuesday", label: "Tuesday" },
	{ value: "wednesday", label: "Wednesday" },
	{ value: "thursday", label: "Thursday" },
	{ value: "friday", label: "Friday" },
	{ value: "saturday", label: "Saturday" },
	{ value: "sunday", label: "Sunday" },
];

export function CohortForm({ cohort, onSuccess }: CohortFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [teachers, setTeachers] = useState<any[]>([]);
	const [products, setProducts] = useState<any[]>([]);
	const isEditMode = !!cohort;
	
	// Fetch language levels
	const { data: languageLevels, isLoading: isLoadingLevels } = useQuery(languageLevelQueries.list());
	const levelOptions = languageLevels || [];

	const form = useForm<CohortFormValues>({
		resolver: zodResolver(cohortFormSchema),
		defaultValues: {
			format: cohort?.format || "group",
			starting_level_id: cohort?.starting_level_id || "",
			current_level_id: cohort?.current_level_id || cohort?.starting_level_id,
			start_date: cohort?.start_date ? new Date(cohort.start_date) : undefined,
			cohort_status: cohort?.cohort_status ?? "enrollment_open",
			room_type: cohort?.room_type,
			room: cohort?.room || "",
			product_id: cohort?.product_id || "",
			google_drive_folder_id: cohort?.google_drive_folder_id || "",
			weekly_sessions: cohort?.weekly_sessions ?? [],
			airtable_record_id: cohort?.airtable_record_id || "",
		},
	});

	// Fetch teachers and products
	React.useEffect(() => {
		async function fetchData() {
			try {
				// Fetch teachers
				const teachersResponse = await fetch("/api/teachers");
				if (teachersResponse.ok) {
					const teachersData = await teachersResponse.json();
					setTeachers(teachersData);
				}

				// Fetch products
				const productsResponse = await fetch("/api/products");
				if (productsResponse.ok) {
					const productsData = await productsResponse.json();
					setProducts(productsData);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}
		fetchData();
	}, []);

	const addWeeklySession = () => {
		const currentSessions = form.getValues("weekly_sessions");
		form.setValue("weekly_sessions", [
			...currentSessions,
			{
				day_of_week: "monday",
				start_time: "09:00",
				end_time: "10:00",
				teacher_id: "",
				google_calendar_event_id: "",
			}
		]);
	};

	const removeWeeklySession = (index: number) => {
		const currentSessions = form.getValues("weekly_sessions");
		form.setValue("weekly_sessions", currentSessions.filter((_, i) => i !== index));
	};

	const onSubmit = async (data: CohortFormValues) => {
		setIsLoading(true);
		try {
			const formattedData = {
				...data,
				start_date: data.start_date ? format(data.start_date, "yyyy-MM-dd") : null,
				current_level_id: data.current_level_id || data.starting_level_id,
			};

			const response = await fetch(
				isEditMode ? `/api/cohorts/${cohort.id}` : "/api/cohorts",
				{
					method: isEditMode ? "PATCH" : "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formattedData),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to save cohort");
			}

			const savedCohort = await response.json();

			// Save weekly sessions
			if (formattedData.weekly_sessions.length > 0) {
				for (const session of formattedData.weekly_sessions) {
					const sessionData = {
						...session,
						cohort_id: savedCohort.id,
					};

					const sessionResponse = await fetch(
						session.id ? `/api/weekly-sessions/${session.id}` : "/api/cohorts/" + savedCohort.id + "/sessions",
						{
							method: session.id ? "PATCH" : "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(sessionData),
						}
					);

					if (!sessionResponse.ok) {
						console.error("Failed to save weekly session");
					}
				}
			}

			toast.success(isEditMode ? "Cohort updated successfully" : "Cohort created successfully");
			
			if (onSuccess) {
				onSuccess();
			} else {
				router.push(`/admin/classes/${savedCohort.id}`);
			}
		} catch (error) {
			console.error("Error saving cohort:", error);
			toast.error(isEditMode ? "Failed to update cohort" : "Failed to create cohort");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Link
						href="/admin/classes"
						className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ChevronLeft className="mr-1 h-4 w-4" />
						Back to Cohorts
					</Link>
				</div>
				
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						{isEditMode ? "Edit Cohort" : "Create New Cohort"}
					</h1>
					<p className="text-muted-foreground">
						{isEditMode 
							? "Update cohort information and weekly schedule"
							: "Set up a new cohort with all necessary details"
						}
					</p>
				</div>
			</div>

			<div className="space-y-6">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Basic Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<BookOpen className="h-5 w-5" />
									Basic Information
								</CardTitle>
								<p className="text-sm text-muted-foreground">Core details about the cohort</p>
							</CardHeader>
							<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="format"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Format</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="group">
														<div className="flex items-center gap-2">
															<Users className="h-4 w-4" />
															Group
														</div>
													</SelectItem>
													<SelectItem value="private">
														<div className="flex items-center gap-2">
															<Users className="h-4 w-4" />
															Private
														</div>
													</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="starting_level_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Starting Level</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{isLoadingLevels ? (
														<SelectItem value="" disabled>
															Loading levels...
														</SelectItem>
													) : (
														levelOptions.map((level, index) => (
															<SelectItem key={`level-${level.id}-${index}`} value={level.id}>
																{level.display_name}
															</SelectItem>
														))
													)}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="current_level_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Current Level (Optional)</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Same as starting level" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{isLoadingLevels ? (
														<SelectItem value="" disabled>
															Loading levels...
														</SelectItem>
													) : (
														levelOptions.map((level, index) => (
															<SelectItem key={`level-${level.id}-${index}`} value={level.id}>
																{level.display_name}
															</SelectItem>
														))
													)}
												</SelectContent>
											</Select>
											<FormDescription>
												Leave empty to use starting level
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							</CardContent>
						</Card>

						{/* Schedule & Status */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calendar className="h-5 w-5" />
									Schedule & Status
								</CardTitle>
								<p className="text-sm text-muted-foreground">When the cohort starts and its enrollment status</p>
							</CardHeader>
							<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="start_date"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>Start Date</FormLabel>
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
													<CalendarComponent
														mode="single"
														selected={field.value}
														onSelect={field.onChange}
														disabled={(date) =>
															date < new Date(new Date().setHours(0, 0, 0, 0))
														}
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
									name="cohort_status"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Status</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="enrollment_open">
														<div className="flex items-center gap-2">
															<Badge variant="success" className="h-2 w-2 p-0 rounded-full" />
															Enrollment Open
														</div>
													</SelectItem>
													<SelectItem value="enrollment_closed">
														<div className="flex items-center gap-2">
															<Badge variant="warning" className="h-2 w-2 p-0 rounded-full" />
															Enrollment Closed
														</div>
													</SelectItem>
													<SelectItem value="class_ended">
														<div className="flex items-center gap-2">
															<Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
															Class Ended
														</div>
													</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							</CardContent>
						</Card>

						{/* Location */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<MapPin className="h-5 w-5" />
									Location
								</CardTitle>
								<p className="text-sm text-muted-foreground">Physical or virtual location settings</p>
							</CardHeader>
							<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="room_type"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Room Type</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select room type" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{roomTypeOptions.map((type) => (
														<SelectItem key={type.value} value={type.value}>
															{type.label}
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
									name="room"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Room/Location (Optional)</FormLabel>
											<FormControl>
												<Input 
													placeholder="e.g., Room 201, Online, Building A" 
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							</CardContent>
						</Card>

						{/* Resources */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FolderOpen className="h-5 w-5" />
									Resources
								</CardTitle>
								<p className="text-sm text-muted-foreground">Product and learning materials</p>
							</CardHeader>
							<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="product_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Product (Optional)</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select a product" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="">No product</SelectItem>
													{products.map((product) => (
														<SelectItem key={product.id} value={product.id}>
															{product.display_name}
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
									name="google_drive_folder_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Google Drive Folder ID (Optional)</FormLabel>
											<FormControl>
												<Input 
													placeholder="Folder ID from Google Drive URL" 
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormDescription>
												The ID from the Google Drive folder URL
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							</CardContent>
						</Card>

						{/* Weekly Sessions */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Clock className="h-5 w-5" />
									Weekly Sessions
								</CardTitle>
								<p className="text-sm text-muted-foreground">Regular weekly class schedule</p>
							</CardHeader>
							<CardContent>
							<div className="space-y-4">
								{form.watch("weekly_sessions").map((session, index) => (
									<Card key={index} className="relative">
										<CardContent className="pt-6">
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="absolute right-2 top-2"
												onClick={() => removeWeeklySession(index)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<FormField
													control={form.control}
													name={`weekly_sessions.${index}.day_of_week`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Day</FormLabel>
															<Select onValueChange={field.onChange} defaultValue={field.value}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{dayOptions.map((day) => (
																		<SelectItem key={day.value} value={day.value}>
																			{day.label}
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
													name={`weekly_sessions.${index}.teacher_id`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Teacher (Optional)</FormLabel>
															<Select onValueChange={field.onChange} defaultValue={field.value}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select teacher" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="">No teacher</SelectItem>
																	{teachers.map((teacher) => (
																		<SelectItem key={teacher.id} value={teacher.id}>
																			{teacher.first_name} {teacher.last_name}
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
													name={`weekly_sessions.${index}.start_time`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>Start Time</FormLabel>
															<FormControl>
																<Input type="time" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name={`weekly_sessions.${index}.end_time`}
													render={({ field }) => (
														<FormItem>
															<FormLabel>End Time</FormLabel>
															<FormControl>
																<Input type="time" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
										</CardContent>
									</Card>
								))}

								<Button
									type="button"
									variant="outline"
									onClick={addWeeklySession}
									className="w-full"
								>
									<Plus className="h-4 w-4 mr-2" />
									Add Weekly Session
								</Button>
							</div>
							</CardContent>
						</Card>

						{/* External IDs */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Settings className="h-5 w-5" />
									External References
								</CardTitle>
								<p className="text-sm text-muted-foreground">IDs from external systems</p>
							</CardHeader>
							<CardContent>
							<FormField
								control={form.control}
								name="airtable_record_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Airtable Record ID (Optional)</FormLabel>
										<FormControl>
											<Input 
												placeholder="rec..." 
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
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading}>
								{isLoading
									? isEditMode
										? "Updating..."
										: "Creating..."
									: isEditMode
									? "Update Cohort"
									: "Create Cohort"}
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}