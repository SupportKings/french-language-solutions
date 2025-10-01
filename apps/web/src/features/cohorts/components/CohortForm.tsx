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
	InputField,
	SelectField,
	TextareaField,
} from "@/components/form-layout/FormLayout";
import { SearchableSelect } from "@/components/form-layout/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { languageLevelQueries } from "@/features/language-levels/queries/language-levels.queries";
import {
	productQueries,
	useProducts,
} from "@/features/products/queries/products.queries";
import {
	teachersQueries,
	useTeachers,
} from "@/features/teachers/queries/teachers.queries";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	AlertCircle,
	BookOpen,
	Calendar as CalendarIcon,
	ChevronDown,
	Clock,
	FolderOpen,
	GraduationCap,
	Info,
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
import { useCreateCohort, useUpdateCohort } from "../queries/cohorts.queries";

// Schema for the cohort form
const cohortFormSchema = z.object({
	// Basic Information
	starting_level_id: z.string().min(1, "Starting level is required"),
	current_level_id: z.string().optional(),
	max_students: z.number().int().min(1).max(100).optional(),
	product_id: z.string().optional(),

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

	// Resources
	google_drive_folder_id: z.string().optional(),

	// Weekly Sessions
	weekly_sessions: z.array(
		z
			.object({
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
			})
			.refine((s) => s.start_time < s.end_time, {
				path: ["end_time"],
				message: "End time must be after start time",
			}),
	),
	// External IDs
	airtable_record_id: z.string().optional(),
});

type CohortFormValues = z.infer<typeof cohortFormSchema>;

interface CohortFormProps {
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

export function CohortForm({ cohort, onSuccess }: CohortFormProps) {
	const router = useRouter();
	const createCohortMutation = useCreateCohort();
	const updateCohortMutation = useUpdateCohort();
	const [showSessions, setShowSessions] = useState(
		cohort?.weekly_sessions?.length > 0 || false,
	);
	const isEditMode = !!cohort;
	// Track original weekly sessions to detect removals
	const [originalSessionIds] = useState<string[]>(
		cohort?.weekly_sessions?.filter((s: any) => s.id).map((s: any) => s.id) ||
			[],
	);

	// Fetch language levels
	const { data: languageLevels, isLoading: languageLevelsLoading } = useQuery(
		languageLevelQueries.list(),
	);
	const levelOptions = languageLevels || [];

	// Fetch teachers
	const { data: teachersData, isLoading: teachersLoading } = useTeachers({
		page: 1,
		limit: 100,
		sortBy: "first_name",
		sortOrder: "asc",
	});
	const teachers = teachersData?.data || [];

	// Fetch products
	const { data: productsData, isLoading: productsLoading } = useProducts();
	const products = Array.isArray(productsData)
		? productsData
		: productsData?.data || [];

	const form = useForm<CohortFormValues>({
		resolver: zodResolver(cohortFormSchema),
		defaultValues: {
			starting_level_id: cohort?.starting_level_id || "",
			current_level_id: cohort?.current_level_id || "",
			max_students: cohort?.max_students || 20,
			start_date: cohort?.start_date ? new Date(cohort.start_date) : undefined,
			cohort_status: cohort?.cohort_status ?? "enrollment_open",
			room_type: cohort?.room_type || undefined,
			product_id: cohort?.product_id || "",
			google_drive_folder_id: cohort?.google_drive_folder_id || "",
			weekly_sessions: cohort?.weekly_sessions ?? [],
			airtable_record_id: cohort?.airtable_record_id || "",
		},
	});

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
		try {
			const formattedData = {
				...data,
				start_date: data.start_date
					? format(data.start_date, "yyyy-MM-dd")
					: null,
				current_level_id: data.current_level_id || data.starting_level_id,
				max_students: data.max_students || 20,
				google_drive_folder_id: data.google_drive_folder_id || null,
				airtable_record_id: data.airtable_record_id || null,
				room_type: data.room_type || null,
				product_id: data.product_id || null,
				starting_level_id: data.starting_level_id || null,
			};

			// Use mutation hooks for better cache management
			let savedCohort;
			if (isEditMode) {
				savedCohort = await updateCohortMutation.mutateAsync({
					id: cohort.id,
					data: formattedData,
				});
			} else {
				savedCohort = await createCohortMutation.mutateAsync(formattedData);
			}

			// Delete removed weekly sessions
			if (isEditMode && originalSessionIds.length > 0) {
				const currentSessionIds =
					formattedData.weekly_sessions
						?.filter((s: any) => s.id)
						.map((s: any) => s.id) || [];

				const sessionsToDelete = originalSessionIds.filter(
					(id) => !currentSessionIds.includes(id),
				);

				if (sessionsToDelete.length > 0) {
					try {
						const deletePromises = sessionsToDelete.map(async (sessionId) => {
							const deleteResponse = await fetch(
								`/api/weekly-sessions/${sessionId}`,
								{ method: "DELETE" },
							);

							if (!deleteResponse.ok) {
								const errorText = await deleteResponse.text();
								console.error(`Failed to delete session ${sessionId}:`, {
									status: deleteResponse.status,
									response: errorText,
								});
								throw new Error(
									`Failed to delete session ${sessionId}: ${deleteResponse.status}`,
								);
							}

							return sessionId;
						});

						const deletedIds = await Promise.all(deletePromises);
						console.log("Successfully deleted sessions:", deletedIds);
					} catch (error) {
						console.error("Error deleting weekly sessions:", error);
						throw new Error(
							`Failed to delete removed sessions: ${
								error instanceof Error ? error.message : "Unknown error"
							}`,
						);
					}
				}
			}

			// Save weekly sessions in parallel
			if (
				formattedData.weekly_sessions &&
				formattedData.weekly_sessions.length > 0
			) {
				try {
					const sessionPromises = formattedData.weekly_sessions.map(
						async (session, index) => {
							const sessionData = {
								...session,
								cohort_id: savedCohort.id,
							};

							const url = session.id
								? `/api/weekly-sessions/${session.id}`
								: `/api/cohorts/${savedCohort.id}/sessions`;
							const method = session.id ? "PATCH" : "POST";

							try {
								const sessionResponse = await fetch(url, {
									method,
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify(sessionData),
								});

								if (!sessionResponse.ok) {
									const errorText = await sessionResponse.text();
									throw new Error(
										`Session ${
											session.id || `temp-${index}`
										} failed: ${method} ${url} - Status: ${
											sessionResponse.status
										}, Response: ${errorText}`,
									);
								}

								return sessionResponse.json();
							} catch (error) {
								const errorMessage =
									error instanceof Error
										? error.message
										: `Unknown error for session ${
												session.id || `temp-${index}`
											}`;
								console.error("Failed to save weekly session:", {
									sessionId: session.id || `temp-${index}`,
									url,
									method,
									error: errorMessage,
									sessionData,
								});
								throw new Error(errorMessage);
							}
						},
					);

					await Promise.all(sessionPromises);
				} catch (error) {
					console.error("Failed to save weekly sessions:", error);
					throw new Error(
						`Failed to save weekly sessions: ${
							error instanceof Error ? error.message : "Unknown error"
						}`,
					);
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
				// Small delay to allow cache invalidation to complete
				setTimeout(() => {
					router.push(`/admin/cohorts/${savedCohort.id}`);
				}, 100);
			}
		} catch (error) {
			console.error("Error saving cohort:", error);
			toast.error(
				isEditMode ? "Failed to update cohort" : "Failed to create cohort",
			);
		}
	};

	const handleCancel = () => {
		router.push("/admin/cohorts");
	};

	// Transform language levels for select options
	const languageLevelOptions = levelOptions.map((level) => ({
		label: level.display_name,
		value: level.id,
	}));

	// Transform teachers for select options with max students
	const teacherOptions = teachers.map((teacher: any) => {
		const name =
			`${teacher.first_name || ""} ${teacher.last_name || ""}`.trim() ||
			"Unknown";
		// Get the appropriate max students based on product location
		const selectedProduct = products.find(
			(p: any) => p.id === form.watch("product_id"),
		);
		const isOnline = selectedProduct?.location === "online";
		const maxStudents = isOnline
			? teacher.max_students_online
			: teacher.max_students_in_person;

		// Show capacity with location context
		const label = maxStudents
			? `${name} (Max: ${maxStudents} students ${isOnline ? "online" : "in-person"})`
			: `${name}`;
		return {
			label,
			value: teacher.id,
			maxStudents: maxStudents || null,
		};
	});

	// Transform products for select options
	const productOptions = products.map((product: any) => ({
		label: product.display_name || product.name || "Unknown",
		value: product.id,
	}));

	// Calculate actual max students based on selected teachers
	const calculateActualMaxStudents = () => {
		const sessions = form.watch("weekly_sessions") || [];
		const selectedTeachers = new Set(
			sessions.filter((s) => s.teacher_id).map((s) => s.teacher_id),
		);

		if (selectedTeachers.size === 0) {
			return form.watch("max_students") || 20;
		}

		// Get product location to determine which capacity to use
		const selectedProduct = products.find(
			(p: any) => p.id === form.watch("product_id"),
		);
		const isOnline = selectedProduct?.location === "online";

		// Find the minimum capacity among selected teachers
		let minCapacity = Number.MAX_SAFE_INTEGER;
		selectedTeachers.forEach((teacherId) => {
			const teacher = teachers.find((t: any) => t.id === teacherId);
			if (teacher) {
				const teacherCapacity = isOnline
					? teacher.max_students_online
					: teacher.max_students_in_person;
				if (teacherCapacity && teacherCapacity < minCapacity) {
					minCapacity = teacherCapacity;
				}
			}
		});

		const cohortMax = form.watch("max_students") || 20;
		return minCapacity === Number.MAX_SAFE_INTEGER
			? cohortMax
			: Math.min(cohortMax, minCapacity);
	};

	const actualMaxStudents = calculateActualMaxStudents();
	const cohortMaxStudents = form.watch("max_students") || 20;
	const isCapacityLimited = actualMaxStudents < cohortMaxStudents;

	return (
		<FormLayout>
			<FormHeader
				backUrl="/admin/cohorts"
				backLabel="Cohorts"
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
								message="You can configure the basic details now and add weekly sessions later. Only starting level is required."
							/>
						)}

						{/* Basic Information */}
						<FormSection
							title="Basic Information"
							description="Core details about the cohort"
							icon={BookOpen}
							required
						>
							<FormField
								label="Product"
								hint="Select the product/format for this cohort"
								error={form.formState.errors.product_id?.message}
							>
								<SearchableSelect
									placeholder="Select a product"
									searchPlaceholder="Search products..."
									value={form.watch("product_id") || ""}
									onValueChange={(value) => form.setValue("product_id", value)}
									options={productOptions}
									showOnlyOnSearch={false}
								/>
							</FormField>
							<FormField
								label="Starting Level"
								required
								error={form.formState.errors.starting_level_id?.message}
							>
								<SearchableSelect
									placeholder={
										languageLevelsLoading
											? "Loading levels..."
											: "Select starting level"
									}
									searchPlaceholder="Type to search levels..."
									value={form.watch("starting_level_id") || ""}
									onValueChange={(value) =>
										form.setValue("starting_level_id", value)
									}
									options={languageLevelOptions}
									showOnlyOnSearch={true}
									disabled={languageLevelsLoading}
								/>
							</FormField>
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
												onSelect={(date) => form.setValue("start_date", date)}
												disabled={(date) =>
													date < new Date(new Date().setHours(0, 0, 0, 0))
												}
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
												value as
													| "enrollment_open"
													| "enrollment_closed"
													| "class_ended",
											)
										}
										options={statusOptions}
									/>
								</FormField>
							</FormRow>
						</FormSection>

						{/* Resources */}
						<FormSection
							title="Resources"
							description="Learning materials and resources"
							icon={FolderOpen}
						>
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
						</FormSection>

						{/* Weekly Sessions */}
						<FormSection
							title="Weekly Sessions"
							description="Regular weekly class schedule"
							icon={Clock}
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
															const sessions =
																form.getValues("weekly_sessions") || [];
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
													<SearchableSelect
														placeholder="Select teacher"
														searchPlaceholder="Type to search teachers..."
														value={session.teacher_id || ""}
														onValueChange={(value) => {
															const sessions =
																form.getValues("weekly_sessions") || [];
															sessions[index] = {
																...sessions[index],
																teacher_id: value,
															};
															form.setValue("weekly_sessions", sessions);
														}}
														options={teacherOptions}
														showOnlyOnSearch={true}
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
															const sessions =
																form.getValues("weekly_sessions") || [];
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
															const sessions =
																form.getValues("weekly_sessions") || [];
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

						{/* Capacity & Location */}
						<FormSection
							title="Capacity & Location"
							description="Maximum enrollment and classroom settings"
							icon={MapPin}
						>
							<FormRow>
								<FormField
									label="Max Students"
									hint="Maximum enrollment capacity for this cohort"
									error={form.formState.errors.max_students?.message}
								>
									<InputField
										type="number"
										placeholder="20"
										min={1}
										max={100}
										error={!!form.formState.errors.max_students}
										{...form.register("max_students", {
											setValueAs: (v) =>
												v === "" || v === null ? undefined : Number(v),
										})}
									/>
								</FormField>
								<FormField
									label="Room Type"
									hint="Select the appropriate classroom size"
									error={form.formState.errors.room_type?.message}
								>
									<SelectField
										placeholder="Select room type"
										value={form.watch("room_type") || ""}
										onValueChange={(value) =>
											form.setValue(
												"room_type",
												value as
													| "for_one_to_one"
													| "medium"
													| "medium_plus"
													| "large",
											)
										}
										options={roomTypeOptions}
									/>
								</FormField>
							</FormRow>
						</FormSection>
					</div>
				</FormContent>

				<FormActions
					primaryLabel={
						createCohortMutation.isPending || updateCohortMutation.isPending
							? isEditMode
								? "Updating..."
								: "Creating..."
							: isEditMode
								? "Update Cohort"
								: "Create Cohort"
					}
					primaryLoading={
						createCohortMutation.isPending || updateCohortMutation.isPending
					}
					primaryType="submit"
					secondaryLabel="Cancel"
					onSecondaryClick={handleCancel}
				/>
			</form>
		</FormLayout>
	);
}
