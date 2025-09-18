"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DaysDisplay, DaysSelector } from "@/components/ui/days-selector";
import { MultiSelect } from "@/components/ui/multi-select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { format } from "date-fns";
import {
	Briefcase,
	Calendar,
	CalendarDays,
	ChevronRight,
	Clock,
	CreditCard,
	DollarSign,
	MapPin,
	MessageSquare,
	MoreVertical,
	Phone,
	Plus,
	Shield,
	Trash2,
	User,
	Users,
	Video,
} from "lucide-react";
import { toast } from "sonner";

const onboardingStatusColors = {
	new: "secondary",
	training_in_progress: "default",
	onboarded: "success",
	offboarded: "destructive",
} as const;

const onboardingStatusLabels = {
	new: "New",
	training_in_progress: "Training",
	onboarded: "Onboarded",
	offboarded: "Offboarded",
} as const;

const contractTypeLabels = {
	full_time: "Full Time",
	freelancer: "Freelancer",
} as const;

const bonusTermsLabels = {
	per_student_per_hour: "Per Student Per Hour",
	per_hour: "Per Hour",
} as const;

interface TeacherDetailsClientProps {
	teacher: any;
}

export default function TeacherDetailsClient({
	teacher: initialTeacher,
}: TeacherDetailsClientProps) {
	const router = useRouter();
	const [teacher, setTeacher] = useState(initialTeacher);
	const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
	// Local state for edited values
	const [editedTeacher, setEditedTeacher] = useState<any>(initialTeacher);

	// Update the teacher when data changes
	useEffect(() => {
		if (initialTeacher) {
			// Ensure role is always an array
			const teacherWithRole = {
				...initialTeacher,
				role: initialTeacher.role || []
			};
			setTeacher(teacherWithRole);
			setEditedTeacher(teacherWithRole);
		}
	}, [initialTeacher]);

	// Construct full name from first and last name
	const fullName =
		`${teacher.first_name || ""} ${teacher.last_name || ""}`.trim();

	// Get initials for avatar
	const initials = fullName
		.split(" ")
		.map((n: string) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	// Update edited teacher field locally
	const updateEditedField = async (field: string, value: any) => {
		console.log(`Updating field ${field} to:`, value); // Debug log
		setEditedTeacher((prev: any) => ({
			...prev,
			[field]: value,
		}));
		// Return a resolved promise to match the expected type
		return Promise.resolve();
	};

	// Save all changes to the API
	const saveAllChanges = async () => {
		try {
			// Collect all changes
			const changes: any = {};

			// Check for changes in fields
			if (editedTeacher.mobile_phone_number !== teacher.mobile_phone_number) {
				changes.mobile_phone_number = editedTeacher.mobile_phone_number;
			}
			if (editedTeacher.first_name !== teacher.first_name) {
				changes.first_name = editedTeacher.first_name;
			}
			if (editedTeacher.last_name !== teacher.last_name) {
				changes.last_name = editedTeacher.last_name;
			}
			if (editedTeacher.contract_type !== teacher.contract_type) {
				changes.contract_type = editedTeacher.contract_type;
			}
			if (editedTeacher.onboarding_status !== teacher.onboarding_status) {
				changes.onboarding_status = editedTeacher.onboarding_status;
			}
			if (
				editedTeacher.available_for_booking !== teacher.available_for_booking
			) {
				changes.available_for_booking = editedTeacher.available_for_booking;
			}
			if (
				editedTeacher.group_class_bonus_terms !==
				teacher.group_class_bonus_terms
			) {
				changes.group_class_bonus_terms = editedTeacher.group_class_bonus_terms;
			}
			if (editedTeacher.admin_notes !== teacher.admin_notes) {
				changes.admin_notes = editedTeacher.admin_notes;
			}
			// Compare role arrays properly
			const teacherRole = teacher.role || [];
			const editedRole = editedTeacher.role || [];
			console.log("Current teacher role:", teacherRole); // Debug
			console.log("Edited teacher role:", editedRole); // Debug
			console.log("Role comparison:", JSON.stringify(editedRole.sort()), "vs", JSON.stringify(teacherRole.sort())); // Debug
			
			// Create copies for sorting to avoid mutating original arrays
			const sortedEditedRole = [...editedRole].sort();
			const sortedTeacherRole = [...teacherRole].sort();
			
			if (JSON.stringify(sortedEditedRole) !== JSON.stringify(sortedTeacherRole)) {
				changes.role = editedRole;
				console.log("Role will be updated to:", editedRole); // Debug
			}

			// If no changes, return early
			if (Object.keys(changes).length === 0) {
				toast.info("No changes to save");
				return;
			}

			console.log("Saving changes:", changes); // Debug log

			const response = await fetch(`/api/teachers/${teacher.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(changes),
			});

			if (!response.ok) throw new Error("Failed to update");

			const updated = await response.json();
			// Ensure role is always an array in the response
			const updatedWithRole = {
				...updated,
				role: updated.role || []
			};
			setTeacher(updatedWithRole);
			setEditedTeacher(updatedWithRole);
			toast.success("Changes saved successfully");
		} catch (error) {
			toast.error("Failed to save changes");
			throw error;
		}
	};

	// Update pending change (for form-like sections)
	const updatePendingChange = (field: string, value: any) => {
		setPendingChanges((prev) => ({ ...prev, [field]: value }));
	};

	// Save all pending changes for Teaching Preferences
	const saveTeachingPreferences = async () => {
		if (Object.keys(pendingChanges).length === 0) return;

		try {
			const response = await fetch(`/api/teachers/${teacher.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(pendingChanges),
			});

			if (!response.ok) throw new Error("Failed to update");

			const updated = await response.json();
			setTeacher((prevTeacher: any) => ({ ...prevTeacher, ...updated }));
			setPendingChanges({});
		} catch (error) {
			throw error;
		}
	};

	// Cancel pending changes for Teaching Preferences
	const cancelTeachingPreferences = () => {
		setPendingChanges({});
	};

	// Navigate to create forms with pre-filled data
	const navigateToAssignClass = () => {
		const params = new URLSearchParams({
			teacherId: teacher.id,
			teacherName: fullName,
		});
		router.push(`/admin/cohorts/new?${params.toString()}`);
	};

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Enhanced Header with Breadcrumb */}
			<div className="border-b bg-background">
				<div className="px-6 py-3">
					<div className="mb-2 flex items-center gap-2 text-muted-foreground text-sm">
						<Link
							href="/admin/team-members"
							className="transition-colors hover:text-foreground"
						>
							Team Members
						</Link>
						<ChevronRight className="h-3 w-3" />
						<span>{fullName}</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<span className="font-semibold text-primary text-sm">
									{initials}
								</span>
							</div>
							<div>
								<h1 className="font-semibold text-xl">{fullName}</h1>
								<div className="mt-0.5 flex items-center gap-2">
									<Badge
										variant={
											onboardingStatusColors[
												teacher.onboarding_status as keyof typeof onboardingStatusColors
											]
										}
										className="h-4 px-1.5 text-[10px]"
									>
										{
											onboardingStatusLabels[
												teacher.onboarding_status as keyof typeof onboardingStatusLabels
											]
										}
									</Badge>
									{teacher.contract_type && (
										<Badge variant="outline" className="h-4 px-1.5 text-[10px]">
											{
												contractTypeLabels[
													teacher.contract_type as keyof typeof contractTypeLabels
												]
											}
										</Badge>
									)}
									{teacher.role && teacher.role.length > 0 && (
										<div className="flex flex-wrap gap-1">
											{teacher.role.map((r: string) => (
												<Badge key={r} variant="outline" className="h-4 px-1.5 text-[10px]">
													{r}
												</Badge>
											))}
										</div>
									)}
								</div>
							</div>
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									<MoreVertical className="h-3.5 w-3.5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuItem onClick={navigateToAssignClass}>
									<Calendar className="mr-2 h-3.5 w-3.5" />
									Assign to Class
								</DropdownMenuItem>
							
								<DropdownMenuSeparator />
								<DropdownMenuItem className="text-destructive">
									<Trash2 className="mr-2 h-3.5 w-3.5" />
									Delete Team Member
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			<div className="space-y-4 px-6 py-4">
				{/* Team Member Information with inline editing */}
				<EditableSection
					title="Team Member Information"
					onEditStart={() => {
						console.log("Edit started. Current teacher state:", teacher);
						const editTeacher = {
							...teacher,
							role: teacher.role || []
						};
						console.log("Setting editedTeacher to:", editTeacher);
						setEditedTeacher(editTeacher);
					}}
					onSave={saveAllChanges}
					onCancel={() => setEditedTeacher(teacher)}
				>
					{(editing) => (
						<div className="grid gap-8 lg:grid-cols-3">
							{/* Contact Section */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Contact
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Phone:</p>
											<InlineEditField
												value={teacher.mobile_phone_number}
												onSave={async (value) =>
													updateEditedField("mobile_phone_number", value)
												}
												editing={editing}
												type="text"
												placeholder="Enter phone"
											/>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												First Name:
											</p>
											<InlineEditField
												value={teacher.first_name}
												onSave={async (value) =>
													updateEditedField("first_name", value)
												}
												editing={editing}
												type="text"
												placeholder="Enter first name"
											/>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Last Name:
											</p>
											<InlineEditField
												value={teacher.last_name}
												onSave={async (value) =>
													updateEditedField("last_name", value)
												}
												editing={editing}
												type="text"
												placeholder="Enter last name"
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Employment Details */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Employment & Role
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Role(s):
											</p>
											{editing ? (
												<MultiSelect
													options={[
														{ label: "Teacher", value: "Teacher" },
														{ label: "Evaluator", value: "Evaluator" },
														{ label: "Marketing/Admin", value: "Marketing/Admin" },
														{ label: "Exec", value: "Exec" },
													]}
													value={editedTeacher.role || []}
													onValueChange={(newRoles) => {
														console.log("MultiSelect onValueChange called with:", newRoles);
														updateEditedField("role", newRoles);
													}}
													placeholder="Select roles..."
												/>
											) : (
												<div>
													{teacher.role && teacher.role.length > 0 ? (
														<div className="flex flex-wrap gap-1">
															{teacher.role.map((r: string) => (
																<Badge key={r} variant="outline" className="h-5 text-xs">
																	{r}
																</Badge>
															))}
														</div>
													) : (
														<span className="text-muted-foreground text-sm">—</span>
													)}
												</div>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Briefcase className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Contract Type:
											</p>
											{editing ? (
												<InlineEditField
													value={teacher.contract_type}
													onSave={async (value) =>
														updateEditedField("contract_type", value)
													}
													editing={editing}
													type="select"
													options={[
														{ label: "Full Time", value: "full_time" },
														{ label: "Freelancer", value: "freelancer" },
													]}
												/>
											) : (
												<Badge variant="outline" className="h-5 text-xs">
													{teacher.contract_type
														? contractTypeLabels[
																teacher.contract_type as keyof typeof contractTypeLabels
															]
														: "—"}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Onboarding Status:
											</p>
											{editing ? (
												<InlineEditField
													value={teacher.onboarding_status}
													onSave={async (value) =>
														updateEditedField("onboarding_status", value)
													}
													editing={editing}
													type="select"
													options={[
														{ label: "New", value: "new" },
														{
															label: "Training",
															value: "training_in_progress",
														},
														{ label: "Onboarded", value: "onboarded" },
														{ label: "Offboarded", value: "offboarded" },
													]}
												/>
											) : (
												<Badge
													variant={
														onboardingStatusColors[
															teacher.onboarding_status as keyof typeof onboardingStatusColors
														]
													}
													className="h-5 text-xs"
												>
													{
														onboardingStatusLabels[
															teacher.onboarding_status as keyof typeof onboardingStatusLabels
														]
													}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Available for Booking:
											</p>
											{editing ? (
												<InlineEditField
													value={
														teacher.available_for_booking ? "true" : "false"
													}
													onSave={async (value) =>
														updateEditedField(
															"available_for_booking",
															value === "true",
														)
													}
													editing={editing}
													type="select"
													options={[
														{ label: "Available", value: "true" },
														{ label: "Not Available", value: "false" },
													]}
												/>
											) : (
												<Badge
													variant={
														teacher.available_for_booking
															? "success"
															: "secondary"
													}
													className="h-5 text-xs"
												>
													{teacher.available_for_booking
														? "Available"
														: "Not Available"}
												</Badge>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Compensation Details */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Compensation
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Group Class Bonus Terms:
											</p>
											{editing ? (
												<InlineEditField
													value={teacher.group_class_bonus_terms}
													onSave={async (value) =>
														updateEditedField("group_class_bonus_terms", value)
													}
													editing={editing}
													type="select"
													options={[
														{
															label: "Per Student Per Hour",
															value: "per_student_per_hour",
														},
														{ label: "Per Hour", value: "per_hour" },
													]}
												/>
											) : teacher.group_class_bonus_terms ? (
												<Badge variant="outline" className="h-5 text-xs">
													{
														bonusTermsLabels[
															teacher.group_class_bonus_terms as keyof typeof bonusTermsLabels
														]
													}
												</Badge>
											) : (
												<span className="font-medium text-sm">—</span>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</EditableSection>

				{/* Teaching Information */}
				<EditableSection
					title="Teaching Preferences"
					onSave={saveTeachingPreferences}
					onCancel={cancelTeachingPreferences}
				>
					{(editing) => (
						<div className="space-y-8">
							{/* Working Hours */}
							<div>
								<h4 className="mb-4 font-medium text-sm">Working Hours</h4>
								<div className="grid gap-6 lg:grid-cols-2">
									<div className="flex items-start gap-3">
										<Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Max Hours/Week:
											</p>
											<InlineEditField
												value={
													pendingChanges.maximum_hours_per_week ??
													teacher.maximum_hours_per_week
												}
												onSave={async (value) =>
													updatePendingChange(
														"maximum_hours_per_week",
														value ? Number.parseInt(value) : null,
													)
												}
												editing={editing}
												type="text"
												placeholder="Enter max hours"
											/>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Max Hours/Day:
											</p>
											<InlineEditField
												value={
													pendingChanges.maximum_hours_per_day ??
													teacher.maximum_hours_per_day
												}
												onSave={async (value) =>
													updatePendingChange(
														"maximum_hours_per_day",
														value ? Number.parseInt(value) : null,
													)
												}
												editing={editing}
												type="text"
												placeholder="Enter max hours"
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Class Availability */}
							<div>
								<h4 className="mb-4 font-medium text-sm">Class Availability</h4>
								<div className="grid gap-6 lg:grid-cols-3">
									<div className="flex items-start gap-3">
										<Video className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Available for Online:
											</p>
											{editing ? (
												<InlineEditField
													value={
														(pendingChanges.available_for_online_classes ??
														teacher.available_for_online_classes)
															? "true"
															: "false"
													}
													onSave={async (value) =>
														updatePendingChange(
															"available_for_online_classes",
															value === "true",
														)
													}
													editing={editing}
													type="select"
													options={[
														{ label: "Yes", value: "true" },
														{ label: "No", value: "false" },
													]}
												/>
											) : (
												<Badge
													variant={
														teacher.available_for_online_classes
															? "success"
															: "secondary"
													}
													className="h-5 text-xs"
												>
													{teacher.available_for_online_classes ? "Yes" : "No"}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Available for In-Person:
											</p>
											{editing ? (
												<InlineEditField
													value={
														(pendingChanges.available_for_in_person_classes ??
														teacher.available_for_in_person_classes)
															? "true"
															: "false"
													}
													onSave={async (value) =>
														updatePendingChange(
															"available_for_in_person_classes",
															value === "true",
														)
													}
													editing={editing}
													type="select"
													options={[
														{ label: "Yes", value: "true" },
														{ label: "No", value: "false" },
													]}
												/>
											) : (
												<Badge
													variant={
														teacher.available_for_in_person_classes
															? "success"
															: "secondary"
													}
													className="h-5 text-xs"
												>
													{teacher.available_for_in_person_classes
														? "Yes"
														: "No"}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Qualified for Under 16:
											</p>
											{editing ? (
												<InlineEditField
													value={
														(pendingChanges.qualified_for_under_16 ??
														teacher.qualified_for_under_16)
															? "true"
															: "false"
													}
													onSave={async (value) =>
														updatePendingChange(
															"qualified_for_under_16",
															value === "true",
														)
													}
													editing={editing}
													type="select"
													options={[
														{ label: "Yes", value: "true" },
														{ label: "No", value: "false" },
													]}
												/>
											) : (
												<Badge
													variant={
														teacher.qualified_for_under_16
															? "info"
															: "secondary"
													}
													className="h-5 text-xs"
												>
													{teacher.qualified_for_under_16 ? "Yes" : "No"}
												</Badge>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Student Capacity */}
							<div>
								<h4 className="mb-4 font-medium text-sm">Student Capacity</h4>
								<div className="grid gap-6 lg:grid-cols-2">
									<div className="flex items-start gap-3">
										<Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Max Students (In-Person):
											</p>
											<InlineEditField
												value={
													pendingChanges.max_students_in_person ??
													teacher.max_students_in_person
												}
												onSave={async (value) =>
													updatePendingChange(
														"max_students_in_person",
														value ? Number.parseInt(value) : null,
													)
												}
												editing={editing}
												type="text"
												placeholder="Enter max students"
											/>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Max Students (Online):
											</p>
											<InlineEditField
												value={
													pendingChanges.max_students_online ??
													teacher.max_students_online
												}
												onSave={async (value) =>
													updatePendingChange(
														"max_students_online",
														value ? Number.parseInt(value) : null,
													)
												}
												editing={editing}
												type="text"
												placeholder="Enter max students"
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Schedule Availability */}
							<div>
								<h4 className="mb-4 font-medium text-sm">
									Schedule Availability
								</h4>
								<div className="grid gap-6 lg:grid-cols-2">
									<div className="flex items-start gap-3">
										<CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-2">
											<p className="text-muted-foreground text-xs">
												Days Available (Online):
											</p>
											{editing ? (
												<DaysSelector
													value={
														pendingChanges.days_available_online ??
														(teacher.days_available_online || [])
													}
													onChange={(days) =>
														updatePendingChange("days_available_online", days)
													}
												/>
											) : (
												<DaysDisplay
													value={teacher.days_available_online || []}
													emptyText="No days selected"
												/>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-2">
											<p className="text-muted-foreground text-xs">
												Days Available (In-Person):
											</p>
											{editing ? (
												<DaysSelector
													value={
														pendingChanges.days_available_in_person ??
														(teacher.days_available_in_person || [])
													}
													onChange={(days) =>
														updatePendingChange(
															"days_available_in_person",
															days,
														)
													}
												/>
											) : (
												<DaysDisplay
													value={teacher.days_available_in_person || []}
													emptyText="No days selected"
												/>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</EditableSection>

				{/* Admin Notes */}
				<EditableSection
					title="Admin Notes"
					onEditStart={() => setEditedTeacher(teacher)}
					onSave={saveAllChanges}
					onCancel={() => setEditedTeacher(teacher)}
				>
					{(editing) => (
						<div className="space-y-3">
							<InlineEditField
								value={editedTeacher.admin_notes}
								onSave={async (value) =>
									updateEditedField("admin_notes", value)
								}
								editing={editing}
								type="textarea"
								placeholder="Enter admin notes"
							/>
						</div>
					)}
				</EditableSection>

				{/* System Information - Less prominent at the bottom */}
				<div className="mt-8 border-t pt-6">
					<div className="mx-auto max-w-3xl">
						<div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground/70 text-xs">
							<div className="flex items-center gap-2">
								<span>ID:</span>
								<code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono">
									{teacher.id.slice(0, 8)}
								</code>
							</div>
							{teacher.user_id && (
								<div className="flex items-center gap-2">
									<span>User:</span>
									<code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono">
										{teacher.user_id.slice(0, 8)}
									</code>
								</div>
							)}
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Created:</span>
								<span>
									{format(
										new Date(teacher.created_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Updated at:</span>
								<span>
									{format(
										new Date(teacher.updated_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
