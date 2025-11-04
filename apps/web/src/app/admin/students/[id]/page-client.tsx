"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { languageLevelQueries } from "@/features/language-levels/queries/language-levels.queries";
import { StudentAssessments } from "@/features/students/components/StudentAssessments";
import { StudentAttendance } from "@/features/students/components/StudentAttendance";
import {
	CopyButton,
	CopyButtonSmall,
} from "@/features/students/components/StudentDetailsClient";
import { StudentEnrollments } from "@/features/students/components/StudentEnrollments";
import { StudentFollowUps } from "@/features/students/components/StudentFollowUps";
import { StudentTouchpoints } from "@/features/students/components/StudentTouchpoints";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
	Baby,
	BookOpen,
	Calendar,
	ChevronRight,
	ClipboardCheck,
	Clock,
	CreditCard,
	GraduationCap,
	Hand,
	Mail,
	MapPin,
	MessageSquare,
	MoreVertical,
	Phone,
	Plus,
	Target,
	Trash2,
	User,
	UserCircle,
	Users,
	Zap,
} from "lucide-react";
import { toast } from "sonner";

interface StudentDetailsClientProps {
	student: any;
	enrollmentCount: number;
	assessmentCount: number;
	permissions?: any;
}

// Enrollment status configuration
const ENROLLMENT_STATUS_LABELS = {
	declined_contract: "Declined",
	dropped_out: "Dropped Out",
	interested: "Interested",
	beginner_form_filled: "Form Filled",
	contract_abandoned: "Contract Abandoned",
	contract_signed: "Contract Signed",
	payment_abandoned: "Payment Abandoned",
	paid: "Paid",
	welcome_package_sent: "Welcome Package Sent",
};

const ENROLLMENT_STATUS_COLORS = {
	declined_contract: "destructive",
	dropped_out: "destructive",
	interested: "secondary",
	beginner_form_filled: "warning",
	contract_abandoned: "destructive",
	contract_signed: "info",
	payment_abandoned: "destructive",
	paid: "success",
	welcome_package_sent: "success",
};

export default function StudentDetailsClient({
	student: initialStudent,
	enrollmentCount,
	assessmentCount,
	permissions,
}: StudentDetailsClientProps) {
	// Check permissions
	const canEditStudent = permissions?.students?.includes("write");
	const canDeleteStudent = permissions?.students?.includes("write");

	const router = useRouter();
	const pathname = usePathname();
	const [student, setStudent] = useState(initialStudent);
	// Local state for edited values
	const [editedStudent, setEditedStudent] = useState<any>(initialStudent);

	// Update the student when data changes
	useEffect(() => {
		if (initialStudent) {
			setStudent(initialStudent);
			setEditedStudent(initialStudent);
		}
	}, [initialStudent]);

	// Fetch language levels
	const { data: languageLevels, isLoading: languageLevelsLoading } = useQuery(
		languageLevelQueries.list(),
	);
	const levelOptions = languageLevels || [];

	// Get enrollment status from the student data
	const enrollmentStatus = (student as any).enrollment_status;

	// Get initials for avatar
	const initials = student.full_name
		? student.full_name
				.split(" ")
				.map((n: string) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "?";

	// Update edited student field locally
	const updateEditedField = async (field: string, value: any) => {
		setEditedStudent({
			...editedStudent,
			[field]: value,
		});
		// Return a resolved promise to match the expected type
		return Promise.resolve();
	};

	// Save all changes to the API
	const saveAllChanges = async () => {
		try {
			// Collect all changes
			const changes: any = {};

			// Check for changes in fields
			if (editedStudent.email !== student.email) {
				changes.email = editedStudent.email;
			}
			if (editedStudent.mobile_phone_number !== student.mobile_phone_number) {
				changes.mobile_phone_number = editedStudent.mobile_phone_number;
			}
			if (editedStudent.city !== student.city) {
				changes.city = editedStudent.city;
			}
			if (
				editedStudent.communication_channel !== student.communication_channel
			) {
				changes.communication_channel = editedStudent.communication_channel;
			}
			if (
				editedStudent.desired_starting_language_level_id !==
				student.desired_starting_language_level_id
			) {
				changes.desired_starting_language_level_id =
					editedStudent.desired_starting_language_level_id;
			}
			if (editedStudent.is_full_beginner !== student.is_full_beginner) {
				changes.is_full_beginner = editedStudent.is_full_beginner;
			}
			if (editedStudent.is_under_16 !== student.is_under_16) {
				changes.is_under_16 = editedStudent.is_under_16;
			}
			if (editedStudent.purpose_to_learn !== student.purpose_to_learn) {
				changes.purpose_to_learn = editedStudent.purpose_to_learn;
			}
			if (editedStudent.initial_channel !== student.initial_channel) {
				changes.initial_channel = editedStudent.initial_channel;
			}

			// If no changes, return early
			if (Object.keys(changes).length === 0) {
				return;
			}

			const response = await fetch(`/api/students/${student.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(changes),
			});

			if (!response.ok) throw new Error("Failed to update");

			const updated = await response.json();
			setStudent(updated);
			setEditedStudent(updated);
			toast.success("Changes saved successfully");
		} catch (error) {
			toast.error("Failed to save changes");
			throw error;
		}
	};

	// Navigate to create forms with pre-filled data
	const navigateToCreateEnrollment = () => {
		const params = new URLSearchParams({
			studentId: student.id,
			studentName: student.full_name,
			email: student.email || "",
			redirectTo: `${pathname}?tab=enrollments`,
		});
		router.push(`/admin/students/enrollments/new?${params.toString()}`);
	};

	const navigateToCreateAssessment = () => {
		const params = new URLSearchParams({
			studentId: student.id,
			studentName: student.full_name,
			level: student.desired_starting_language_level?.code || "",
			redirectTo: `${pathname}?tab=assessments`,
		});
		router.push(`/admin/students/assessments/new?${params.toString()}`);
	};

	const navigateToSetFollowUp = () => {
		const params = new URLSearchParams({
			studentId: student.id,
			studentName: student.full_name,
			email: student.email || "",
			phone: student.mobile_phone_number || "",
			redirectTo: `${pathname}?tab=followups`,
		});
		router.push(
			`/admin/automation/automated-follow-ups/new?${params.toString()}`,
		);
	};

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Enhanced Header with Breadcrumb */}
			<div className="border-b bg-background">
				<div className="px-6 py-3">
					<div className="mb-2 flex items-center gap-2 text-muted-foreground text-sm">
						<Link
							href="/admin/students"
							className="transition-colors hover:text-foreground"
						>
							Students
						</Link>
						<ChevronRight className="h-3 w-3" />
						<span>{student.full_name}</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<span className="font-semibold text-primary text-sm">
									{initials}
								</span>
							</div>
							<div>
								<h1 className="font-semibold text-xl">{student.full_name}</h1>
								{enrollmentStatus && (
									<div className="mt-0.5 flex items-center gap-2">
										<Badge
											variant={
												(ENROLLMENT_STATUS_COLORS as any)[enrollmentStatus] ||
												"default"
											}
											className="h-4 px-1.5 text-[10px]"
										>
											{(ENROLLMENT_STATUS_LABELS as any)[enrollmentStatus] ||
												enrollmentStatus}
										</Badge>
									</div>
								)}
							</div>
						</div>

						{canDeleteStudent && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm">
										<MoreVertical className="h-3.5 w-3.5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuItem className="text-destructive">
										<Trash2 className="mr-2 h-3.5 w-3.5" />
										Delete Student
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
			</div>

			<div className="space-y-4 px-6 py-4">
				{/* Student Information with inline editing */}
				<EditableSection
					title="Student Information"
					canEdit={canEditStudent}
					onEditStart={() => setEditedStudent(student)}
					onSave={saveAllChanges}
					onCancel={() => setEditedStudent(student)}
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
										<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Email:</p>
											<div className="flex items-center gap-1">
												<InlineEditField
													value={editedStudent.email}
													onSave={(value) => updateEditedField("email", value)}
													editing={editing}
													type="text"
													placeholder="Enter email"
												/>
												{!editing && student.email && (
													<CopyButton text={student.email} label="Email" />
												)}
											</div>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Phone:</p>
											<div className="flex items-center gap-1">
												<InlineEditField
													value={editedStudent.mobile_phone_number}
													onSave={(value) =>
														updateEditedField("mobile_phone_number", value)
													}
													editing={editing}
													type="text"
													placeholder="Enter phone"
												/>
												{!editing && student.mobile_phone_number && (
													<CopyButton
														text={student.mobile_phone_number}
														label="Phone"
													/>
												)}
											</div>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">City:</p>
											<InlineEditField
												value={editedStudent.city}
												onSave={(value) => updateEditedField("city", value)}
												editing={editing}
												type="text"
												placeholder="Enter city"
											/>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Default Communication Channel:
											</p>
											{editing ? (
												<InlineEditField
													value={editedStudent.communication_channel}
													onSave={(value) =>
														updateEditedField("communication_channel", value)
													}
													editing={editing}
													type="select"
													options={[
														{ label: "SMS + Email", value: "sms_email" },
														{ label: "Email Only", value: "email" },
														{ label: "SMS Only", value: "sms" },
													]}
												/>
											) : (
												<Badge variant="outline" className="h-5 text-xs">
													{student.communication_channel
														?.replace("_", " + ")
														.toUpperCase() || "—"}
												</Badge>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Learning Profile */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Learning Profile
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<GraduationCap className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Desired Starting Level:
											</p>
											{editing ? (
												<InlineEditField
													value={
														editedStudent.desired_starting_language_level_id
													}
													onSave={(value) =>
														updateEditedField(
															"desired_starting_language_level_id",
															value,
														)
													}
													editing={editing}
													type="select"
													options={levelOptions.map((level) => ({
														label: level.display_name,
														value: level.id,
													}))}
													placeholder={
														languageLevelsLoading
															? "Loading levels..."
															: "Select level"
													}
												/>
											) : (
												<Badge variant="outline" className="h-5 text-xs">
													{student.desired_starting_language_level
														?.display_name ||
														student.desired_starting_language_level?.code?.toUpperCase() ||
														"—"}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<UserCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Registered as Beginner(A0)?
											</p>
											{editing ? (
												<InlineEditField
													value={
														editedStudent.is_full_beginner ? "true" : "false"
													}
													onSave={(value) =>
														updateEditedField(
															"is_full_beginner",
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
														student.is_full_beginner ? "info" : "secondary"
													}
													className="h-5 text-xs"
												>
													{student.is_full_beginner ? "Yes" : "No"}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Baby className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Under 16:</p>
											{editing ? (
												<InlineEditField
													value={editedStudent.is_under_16 ? "true" : "false"}
													onSave={(value) =>
														updateEditedField("is_under_16", value === "true")
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
														student.is_under_16 ? "warning" : "secondary"
													}
													className="h-5 text-xs"
												>
													{student.is_under_16 ? "Yes" : "No"}
												</Badge>
											)}
										</div>
									</div>

									{student.purpose_to_learn && (
										<div className="flex items-start gap-3">
											<Target className="mt-0.5 h-4 w-4 text-muted-foreground" />
											<div className="flex-1 space-y-0.5">
												<p className="text-muted-foreground text-xs">
													Purpose:
												</p>
												<InlineEditField
													value={editedStudent.purpose_to_learn}
													onSave={(value) =>
														updateEditedField("purpose_to_learn", value)
													}
													editing={editing}
													type="textarea"
													placeholder="Enter purpose"
												/>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Preferences & Integrations */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Preferences
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Newsletter:
											</p>
											<Badge
												variant={
													student.added_to_email_newsletter
														? "success"
														: "secondary"
												}
												className="h-5 text-xs"
											>
												{student.added_to_email_newsletter
													? "Subscribed"
													: "Not Subscribed"}
											</Badge>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Zap className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Initial Channel:
											</p>
											{editing ? (
												<InlineEditField
													value={editedStudent.initial_channel || ""}
													onSave={(value) =>
														updateEditedField("initial_channel", value || null)
													}
													editing={editing}
													type="select"
													options={[
														{ label: "Form", value: "form" },
														{ label: "Quiz", value: "quiz" },
														{ label: "Call", value: "call" },
														{ label: "Message", value: "message" },
														{ label: "Email", value: "email" },
														{ label: "Assessment", value: "assessment" },
													]}
													placeholder="Select initial channel"
												/>
											) : (
												<Badge variant="outline" className="h-5 text-xs">
													{student.initial_channel
														? student.initial_channel.charAt(0).toUpperCase() +
															student.initial_channel.slice(1)
														: "—"}
												</Badge>
											)}
										</div>
									</div>
								</div>

								{/* External Integrations - Read only */}
								{(student.stripe_customer_id ||
									student.convertkit_id ||
									student.openphone_contact_id) && (
									<div className="mt-6 space-y-4">
										<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
											Integrations
										</h3>
										<div className="space-y-3">
											{student.stripe_customer_id && (
												<div className="flex items-start gap-3">
													<CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
													<div className="flex-1 space-y-0.5">
														<p className="text-muted-foreground text-xs">
															Stripe:
														</p>
														<code className="rounded bg-muted px-1.5 py-0.5 text-xs">
															{student.stripe_customer_id.slice(0, 14)}...
														</code>
													</div>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</EditableSection>

				{/* Academic & Progress Tabs */}
				<div className="mt-6">
					<Tabs defaultValue="enrollments" className="w-full">
						<div className="mb-4 flex w-full items-center justify-between">
							<TabsList className="grid w-full grid-cols-5">
								<TabsTrigger
									value="enrollments"
									className="flex items-center gap-2"
								>
									<BookOpen className="h-3.5 w-3.5" />
									Enrollments
								</TabsTrigger>
								<TabsTrigger
									value="assessments"
									className="flex items-center gap-2"
								>
									<ClipboardCheck className="h-3.5 w-3.5" />
									Assessments
									{assessmentCount > 0 && (
										<Badge variant="secondary" className="h-4 px-1 text-[10px]">
											{assessmentCount}
										</Badge>
									)}
								</TabsTrigger>
								<TabsTrigger
									value="attendance"
									className="flex items-center gap-2"
								>
									<Calendar className="h-3.5 w-3.5" />
									Attendance
								</TabsTrigger>
								<TabsTrigger
									value="followups"
									className="flex items-center gap-2"
								>
									<Users className="h-3.5 w-3.5" />
									Follow-ups
								</TabsTrigger>
								<TabsTrigger
									value="touchpoints"
									className="flex items-center gap-2"
								>
									<Hand className="h-3.5 w-3.5" />
									Touchpoints
								</TabsTrigger>
							</TabsList>
						</div>

						{/* Enrollments Tab */}
						<TabsContent value="enrollments" className="mt-4">
							<Card className="bg-background">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="font-semibold text-base">
												Course Enrollments
											</CardTitle>
										</div>
										{canEditStudent && (
											<Button size="sm" onClick={navigateToCreateEnrollment}>
												<Plus className="mr-1.5 h-3.5 w-3.5" />
												Add Enrollment
											</Button>
										)}
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<StudentEnrollments studentId={student.id} />
								</CardContent>
							</Card>
						</TabsContent>

						{/* Assessments Tab */}
						<TabsContent value="assessments" className="mt-4">
							<Card className="bg-background">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="font-semibold text-base">
												Language Assessments
											</CardTitle>
											<p className="mt-0.5 text-muted-foreground text-xs">
												{assessmentCount > 0
													? `${assessmentCount} assessment${assessmentCount !== 1 ? "s" : ""} completed`
													: "No assessments scheduled yet"}
											</p>
										</div>
										{canEditStudent && (
											<Button size="sm" onClick={navigateToCreateAssessment}>
												<Plus className="mr-1.5 h-3.5 w-3.5" />
												Schedule Assessment
											</Button>
										)}
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<StudentAssessments
										studentId={student.id}
										canScheduleAssessment={canEditStudent}
									/>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Attendance Tab */}
						<TabsContent value="attendance" className="mt-4">
							<Card className="bg-background">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="font-semibold text-base">
												Attendance Records
											</CardTitle>
											<p className="mt-0.5 text-muted-foreground text-xs">
												Track student's class attendance and participation
											</p>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<StudentAttendance studentId={student.id} />
								</CardContent>
							</Card>
						</TabsContent>

						{/* Follow-ups Tab */}
						<TabsContent value="followups" className="mt-4">
							<Card className="bg-background">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="font-semibold text-base">
												Follow-ups
											</CardTitle>
											<p className="mt-0.5 text-muted-foreground text-xs">
												View and manage follow-ups linked to this student
											</p>
										</div>
										{canEditStudent && (
											<Button size="sm" onClick={navigateToSetFollowUp}>
												<Plus className="mr-1.5 h-3.5 w-3.5" />
												Set Follow-up
											</Button>
										)}
									</div>
								</CardHeader>
								<CardContent>
									<StudentFollowUps studentId={student.id} />
								</CardContent>
							</Card>
						</TabsContent>

						{/* Touchpoints Tab */}
						<TabsContent value="touchpoints" className="mt-4">
							<Card className="bg-background">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="font-semibold text-base">
												Touchpoints
											</CardTitle>
											<p className="mt-0.5 text-muted-foreground text-xs">
												View all touchpoints and interactions for this student
											</p>
										</div>
										{canEditStudent && (
											<Button
												size="sm"
												onClick={() => {
													const params = new URLSearchParams({
														studentId: student.id,
														studentName: student.full_name,
														redirectTo: `${pathname}?tab=touchpoints`,
													});
													router.push(
														`/admin/touchpoints/new?${params.toString()}`,
													);
												}}
											>
												<Plus className="mr-1.5 h-3.5 w-3.5" />
												Log Touchpoint
											</Button>
										)}
									</div>
								</CardHeader>
								<CardContent>
									<StudentTouchpoints studentId={student.id} />
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>

				{/* System Information - Less prominent at the bottom */}
				<div className="mt-8 border-t pt-6">
					<div className="mx-auto max-w-3xl">
						<div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground/70 text-xs">
							<div className="flex items-center gap-2">
								<span>ID:</span>
								<code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono">
									{student.id.slice(0, 8)}
								</code>
							</div>
							{student.user_id && (
								<div className="flex items-center gap-2">
									<span>User:</span>
									<code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono">
										{student.user_id.slice(0, 8)}
									</code>
								</div>
							)}
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Created at:</span>
								<span>
									{format(
										new Date(student.created_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Updated at:</span>
								<span>
									{format(
										new Date(student.updated_at),
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
