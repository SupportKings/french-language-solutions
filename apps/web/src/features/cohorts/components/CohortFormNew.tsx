"use client";

import { useEffect, useState } from "react";

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
	InputField,
	SelectField,
	TextareaField,
} from "@/components/form-layout/FormLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { languageLevelQueries } from "@/features/language-levels/queries/language-levels.queries";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	BookOpen,
	Calendar as CalendarIcon,
	ChevronDown,
	Clock,
	FolderOpen,
	GraduationCap,
	MapPin,
	Plus,
	Settings,
	Trash2,
	User,
	Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Schema for the cohort form
const cohortFormSchema = z.object({
	// Basic Information
	format: z.enum(["group", "private"]),
	starting_level_id: z.string().min(1, "Starting level is required"),
	current_level_id: z.string().optional(),
	max_students: z.number().min(1).max(100).optional(),
	
	// Schedule
	start_date: z.date().optional(),
	cohort_status: z.enum([
		"enrollment_open",
		"enrollment_closed",
		"class_ended",
	]),
	
	// Location
	room_type: z
		.enum(["for_one_to_one", "medium", "medium_plus", "large"])
		.optional(),
	room: z.string().optional(),
	
	// Resources
	product_id: z.string().optional(),
	google_drive_folder_id: z.string().optional(),
	
	// Weekly Sessions
	weekly_sessions: z
		.array(
			z.object({
				id: z.string().optional(),
				day_of_week: z.enum([
					"monday",
					"tuesday",
					"wednesday",
					"thursday",
					"friday",
					"saturday",
					"sunday",
				]),
				start_time: z.string(),
				end_time: z.string(),
				teacher_id: z.string().optional(),
				google_calendar_event_id: z.string().optional(),
			}),
		)
		.optional(),
	
	// External IDs
	airtable_record_id: z.string().optional(),
});

type CohortFormValues = z.infer<typeof cohortFormSchema>;

interface CohortFormNewProps {
	cohort?: any;
	onSuccess?: () => void;
}

const roomTypeOptions = [
	{ label: "One-to-One", value: "for_one_to_one" },
	{ label: "Medium", value: "medium" },
	{ label: "Medium Plus", value: "medium_plus" },
	{ label: "Large", value: "large" },
];

const statusOptions = [
	{ label: "Enrollment Open", value: "enrollment_open" },
	{ label: "Enrollment Closed", value: "enrollment_closed" },
	{ label: "Class Ended", value: "class_ended" },
];

const formatOptions = [
	{ label: "Group", value: "group" },
	{ label: "Private", value: "private" },
];

const dayOptions = [
	{ label: "Monday", value: "monday" },
	{ label: "Tuesday", value: "tuesday" },
	{ label: "Wednesday", value: "wednesday" },
	{ label: "Thursday", value: "thursday" },
	{ label: "Friday", value: "friday" },
	{ label: "Saturday", value: "saturday" },
	{ label: "Sunday", value: "sunday" },
];

export function CohortFormNew({ cohort, onSuccess }: CohortFormNewProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [teachers, setTeachers] = useState<any[]>([]);
	const [products, setProducts] = useState<any[]>([]);
	const [showSessions, setShowSessions] = useState(
		cohort?.weekly_sessions?.length > 0 || false,
	);
	const isEditMode = !!cohort;
	
	// Fetch language levels
	const { data: languageLevels, isLoading: languageLevelsLoading } = useQuery(
		languageLevelQueries.list(),
	);
	const levelOptions = languageLevels || [];
	
	const form = useForm<CohortFormValues>({
		resolver: zodResolver(cohortFormSchema),
		defaultValues: {
			format: cohort?.format || "group",
			starting_level_id: cohort?.starting_level_id || "",
			current_level_id: cohort?.current_level_id || "",
			max_students: cohort?.max_students || 20,
			start_date: cohort?.start_date ? new Date(cohort.start_date) : undefined,
			cohort_status: cohort?.cohort_status ?? "enrollment_open",
			room_type: cohort?.room_type || undefined,
			room: cohort?.room || "",
			product_id: cohort?.product_id || "",
			google_drive_folder_id: cohort?.google_drive_folder_id || "",
			weekly_sessions: cohort?.weekly_sessions ?? [],
			airtable_record_id: cohort?.airtable_record_id || "",
		},
	});
	
	// Fetch teachers and products
	useEffect(() => {
		async function fetchData() {
			try {
				// Fetch teachers
				const teachersResponse = await fetch("/api/teachers");
				if (teachersResponse.ok) {
					const teachersData = await teachersResponse.json();
					setTeachers(Array.isArray(teachersData) ? teachersData : teachersData.data || []);
				}
				
				// Fetch products
				const productsResponse = await fetch("/api/products");
				if (productsResponse.ok) {
					const productsData = await productsResponse.json();
					setProducts(Array.isArray(productsData) ? productsData : productsData.data || []);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}
		fetchData();
	}, []);
	
	const addWeeklySession = () => {
		const currentSessions = form.getValues("weekly_sessions") || [];
		form.setValue("weekly_sessions", [
			...currentSessions,
			{
				day_of_week: "monday",
				start_time: "09:00",
				end_time: "10:00",
				teacher_id: "",
				google_calendar_event_id: "",
			},
		]);
	};
	
	const removeWeeklySession = (index: number) => {
		const currentSessions = form.getValues("weekly_sessions") || [];
		form.setValue(
			"weekly_sessions",
			currentSessions.filter((_, i) => i !== index),
		);
	};
	
	const onSubmit = async (data: CohortFormValues) => {
		setIsLoading(true);
		try {
			const formattedData = {
				...data,
				start_date: data.start_date
					? format(data.start_date, "yyyy-MM-dd")
					: null,
				current_level_id: data.current_level_id || data.starting_level_id,
				max_students: data.max_students || 20,
			};
			
			const response = await fetch(
				isEditMode ? `/api/cohorts/${cohort.id}` : "/api/cohorts",
				{
					method: isEditMode ? "PATCH" : "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formattedData),
				},
			);
			
			if (!response.ok) {
				throw new Error("Failed to save cohort");
			}
			
			const savedCohort = await response.json();
			
			// Save weekly sessions
			if (formattedData.weekly_sessions && formattedData.weekly_sessions.length > 0) {
				for (const session of formattedData.weekly_sessions) {
					const sessionData = {
						...session,
						cohort_id: savedCohort.id,
					};
					
					const sessionResponse = await fetch(
						session.id
							? `/api/weekly-sessions/${session.id}`
							: `/api/cohorts/${savedCohort.id}/sessions`,
						{
							method: session.id ? "PATCH" : "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(sessionData),
						},
					);
					
					if (!sessionResponse.ok) {
						console.error("Failed to save weekly session");
					}
				}
			}
			
			toast.success(
				isEditMode
					? "Cohort updated successfully"
					: "Cohort created successfully",
			);
			
			if (onSuccess) {
				onSuccess();
			} else {
				router.push(`/admin/classes/${savedCohort.id}`);
				router.refresh();
			}
		} catch (error) {
			console.error("Error saving cohort:", error);
			toast.error(
				isEditMode ? "Failed to update cohort" : "Failed to create cohort",
			);
		} finally {
			setIsLoading(false);
		}
	};
	
	const handleCancel = () => {
		router.push("/admin/classes");
	};
	
	// Transform language levels for select options
	const languageLevelOptions = levelOptions.map((level) => ({
		label: level.display_name,
		value: level.id,
	}));
	
	// Transform teachers for select options
	const teacherOptions = teachers.map((teacher) => ({
		label: `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim() || "Unknown",
		value: teacher.id,
	}));
	
	// Transform products for select options
	const productOptions = products.map((product) => ({
		label: product.display_name || product.name || "Unknown",
		value: product.id,
	}));
	
	return (
		<FormLayout>
			<FormHeader
				backUrl="/admin/classes"
				backLabel="Classes"
				title={isEditMode ? "Edit Cohort" : "New Cohort"}
				subtitle={
					isEditMode
						? "Update cohort information and schedule"
						: "Set up a new cohort with all necessary details"
				}
				badge={
					isEditMode ? { label: "Editing", variant: "warning" } : undefined
				}
			/>
			
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormContent>
					<div className="space-y-4">
						{/* Info Banner for new cohorts */}
						{!isEditMode && (
							<InfoBanner
								variant="info"
								title="Quick Tip"
								message="You can configure the basic details now and add weekly sessions later. Only format and starting level are required."
							/>
						)}
						
						{/* Basic Information */}
						<FormSection
							title="Basic Information"
							description="Core details about the cohort"
							icon={BookOpen}
							required
						>
							<FormRow>
								<FormField
									label="Format"
									required
									error={form.formState.errors.format?.message}
								>
									<SelectField
										placeholder="Select format"
										value={form.watch("format") || ""}
										onValueChange={(value) =>
											form.setValue("format", value as "group" | "private")
										}
										options={formatOptions}
									/>
								</FormField>
								<FormField
									label="Max Students"
									hint="Maximum enrollment capacity"
									error={form.formState.errors.max_students?.message}
								>
									<InputField
										type="number"
										placeholder="20"
										min={1}
										max={100}
										error={!!form.formState.errors.max_students}
										{...form.register("max_students", { valueAsNumber: true })}
									/>
								</FormField>
							</FormRow>
							<FormRow>
								<FormField
									label="Starting Level"
									required
									error={form.formState.errors.starting_level_id?.message}
								>
									<SelectField
										placeholder={
											languageLevelsLoading
												? "Loading levels..."
												: "Select starting level"
										}
										value={form.watch("starting_level_id") || ""}
										onValueChange={(value) =>
											form.setValue("starting_level_id", value)
										}
										options={languageLevelOptions}
									/>
								</FormField>
								<FormField
									label="Current Level"
									hint="Leave empty to use starting level"
									error={form.formState.errors.current_level_id?.message}
								>
									<SelectField
										placeholder="Same as starting level"
										value={form.watch("current_level_id") || ""}
										onValueChange={(value) =>
											form.setValue("current_level_id", value)
										}
										options={languageLevelOptions}
									/>
								</FormField>
							</FormRow>
						</FormSection>
						
						{/* Schedule & Status */}
						<FormSection
							title="Schedule & Status"
							description="When the cohort starts and its enrollment status"
							icon={CalendarIcon}
						>
							<FormRow>
								<FormField
									label="Start Date"
									error={form.formState.errors.start_date?.message}
								>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												type="button"
												variant="outline"
												className={cn(
													"w-full justify-start text-left font-normal",
													!form.watch("start_date") && "text-muted-foreground",
												)}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{form.watch("start_date") ? (
													format(form.watch("start_date")!, "PPP")
												) : (
													<span>Pick a date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={form.watch("start_date")}
												onSelect={(date) =>
													form.setValue("start_date", date)
												}
												disabled={(date) =>
													date < new Date(new Date().setHours(0, 0, 0, 0))
												}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</FormField>
								<FormField
									label="Status"
									error={form.formState.errors.cohort_status?.message}
								>
									<SelectField
										placeholder="Select status"
										value={form.watch("cohort_status") || ""}
										onValueChange={(value) =>
											form.setValue(
												"cohort_status",
												value as "enrollment_open" | "enrollment_closed" | "class_ended",
											)
										}
										options={statusOptions}
									/>
								</FormField>
							</FormRow>
						</FormSection>
						
						{/* Location */}
						<FormSection
							title="Location"
							description="Physical or virtual location settings"
							icon={MapPin}
						>
							<FormRow>
								<FormField
									label="Room Type"
									error={form.formState.errors.room_type?.message}
								>
									<SelectField
										placeholder="Select room type"
										value={form.watch("room_type") || ""}
										onValueChange={(value) =>
											form.setValue(
												"room_type",
												value as "for_one_to_one" | "medium" | "medium_plus" | "large",
											)
										}
										options={roomTypeOptions}
									/>
								</FormField>
								<FormField
									label="Room/Location"
									hint="e.g., Room 201, Online, Building A"
									error={form.formState.errors.room?.message}
								>
									<InputField
										placeholder="Enter location"
										error={!!form.formState.errors.room}
										{...form.register("room")}
									/>
								</FormField>
							</FormRow>
						</FormSection>
						
						{/* Resources */}
						<FormSection
							title="Resources"
							description="Product and learning materials"
							icon={FolderOpen}
						>
							<FormRow>
								<FormField
									label="Product"
									error={form.formState.errors.product_id?.message}
								>
									<SelectField
										placeholder="Select a product"
										value={form.watch("product_id") || ""}
										onValueChange={(value) =>
											form.setValue("product_id", value)
										}
										options={productOptions}
									/>
								</FormField>
								<FormField
									label="Google Drive Folder ID"
									hint="The ID from the Google Drive folder URL"
									error={form.formState.errors.google_drive_folder_id?.message}
								>
									<InputField
										placeholder="Folder ID"
										error={!!form.formState.errors.google_drive_folder_id}
										{...form.register("google_drive_folder_id")}
									/>
								</FormField>
							</FormRow>
						</FormSection>
						
						{/* Weekly Sessions */}
						<FormSection
							title="Weekly Sessions"
							description="Regular weekly class schedule"
							icon={Clock}
							collapsible
							defaultExpanded={showSessions}
						>
							<div className="space-y-4">
								{(form.watch("weekly_sessions") || []).map((session, index) => (
									<div
										key={index}
										className="relative rounded-lg border bg-muted/30 p-4"
									>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="absolute top-2 right-2 h-8 w-8"
											onClick={() => removeWeeklySession(index)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
										
										<div className="space-y-4">
											<FormRow>
												<FormField
													label="Day of Week"
													error={
														form.formState.errors.weekly_sessions?.[index]
															?.day_of_week?.message
													}
												>
													<SelectField
														placeholder="Select day"
														value={session.day_of_week || ""}
														onValueChange={(value) => {
															const sessions = form.getValues("weekly_sessions") || [];
															sessions[index] = {
																...sessions[index],
																day_of_week: value as any,
															};
															form.setValue("weekly_sessions", sessions);
														}}
														options={dayOptions}
													/>
												</FormField>
												<FormField
													label="Teacher"
													error={
														form.formState.errors.weekly_sessions?.[index]
															?.teacher_id?.message
													}
												>
													<SelectField
														placeholder="Select teacher"
														value={session.teacher_id || ""}
														onValueChange={(value) => {
															const sessions = form.getValues("weekly_sessions") || [];
															sessions[index] = {
																...sessions[index],
																teacher_id: value,
															};
															form.setValue("weekly_sessions", sessions);
														}}
														options={teacherOptions}
													/>
												</FormField>
											</FormRow>
											<FormRow>
												<FormField
													label="Start Time"
													error={
														form.formState.errors.weekly_sessions?.[index]
															?.start_time?.message
													}
												>
													<InputField
														type="time"
														value={session.start_time || ""}
														onChange={(e) => {
															const sessions = form.getValues("weekly_sessions") || [];
															sessions[index] = {
																...sessions[index],
																start_time: e.target.value,
															};
															form.setValue("weekly_sessions", sessions);
														}}
													/>
												</FormField>
												<FormField
													label="End Time"
													error={
														form.formState.errors.weekly_sessions?.[index]
															?.end_time?.message
													}
												>
													<InputField
														type="time"
														value={session.end_time || ""}
														onChange={(e) => {
															const sessions = form.getValues("weekly_sessions") || [];
															sessions[index] = {
																...sessions[index],
																end_time: e.target.value,
															};
															form.setValue("weekly_sessions", sessions);
														}}
													/>
												</FormField>
											</FormRow>
										</div>
									</div>
								))}
								
								<Button
									type="button"
									variant="outline"
									onClick={addWeeklySession}
									className="w-full"
								>
									<Plus className="mr-2 h-4 w-4" />
									Add Weekly Session
								</Button>
							</div>
						</FormSection>
						
						{/* External References */}
						<FormSection
							title="External References"
							description="IDs from external systems"
							icon={Settings}
						>
							<FormField
								label="Airtable Record ID"
								hint="Record ID from Airtable"
								error={form.formState.errors.airtable_record_id?.message}
							>
								<InputField
									placeholder="rec..."
									error={!!form.formState.errors.airtable_record_id}
									{...form.register("airtable_record_id")}
								/>
							</FormField>
						</FormSection>
					</div>
				</FormContent>
				
				<FormActions>
					<Button
						type="button"
						variant="outline"
						onClick={handleCancel}
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
				</FormActions>
			</form>
		</FormLayout>
	);
}