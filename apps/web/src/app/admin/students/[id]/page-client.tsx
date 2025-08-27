"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { toast } from "sonner";
import { 
	Mail, 
	Phone, 
	MapPin, 
	Calendar,
	GraduationCap,
	Target,
	MessageSquare,
	User,
	Clock,
	CreditCard,
	ChevronRight,
	BookOpen,
	ClipboardCheck,
	MoreVertical,
	Baby,
	Zap,
	UserCircle,
	Plus,
	Trash2
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { format } from "date-fns";
import { StudentEnrollments } from "@/features/students/components/StudentEnrollments";
import { StudentAssessments } from "@/features/students/components/StudentAssessments";
import { StudentAttendance } from "@/features/students/components/StudentAttendance";
import { cn } from "@/lib/utils";
import { CopyButton, CopyButtonSmall } from "@/features/students/components/StudentDetailsClient";

interface StudentDetailsClientProps {
	student: any;
	enrollmentCount: number;
	assessmentCount: number;
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
	assessmentCount 
}: StudentDetailsClientProps) {
	const router = useRouter();
	const [student, setStudent] = useState(initialStudent);
	
	// Get enrollment status from the student data
	const enrollmentStatus = (student as any).enrollment_status;
	
	// Get initials for avatar
	const initials = student.full_name
		.split(' ')
		.map((n: string) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);

	// Update student field
	const updateStudentField = async (field: string, value: any) => {
		try {
			const response = await fetch(`/api/students/${student.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ [field]: value }),
			});

			if (!response.ok) throw new Error("Failed to update");

			const updated = await response.json();
			setStudent(updated);
			toast.success("Updated successfully");
		} catch (error) {
			toast.error("Failed to update");
			throw error;
		}
	};

	// Save contact section
	const saveContactSection = async () => {
		// This would batch update all contact fields
		// For now, fields save individually on blur
	};

	// Navigate to create forms with pre-filled data
	const navigateToCreateEnrollment = () => {
		const params = new URLSearchParams({
			studentId: student.id,
			studentName: student.full_name,
			email: student.email || '',
		});
		router.push(`/admin/students/enrollments/new?${params.toString()}`);
	};

	const navigateToCreateAssessment = () => {
		const params = new URLSearchParams({
			studentId: student.id,
			studentName: student.full_name,
			level: student.desired_starting_language_level || '',
		});
		router.push(`/admin/students/assessments/new?${params.toString()}`);
	};

	const navigateToSetFollowUp = () => {
		const params = new URLSearchParams({
			studentId: student.id,
			studentName: student.full_name,
			email: student.email || '',
			phone: student.mobile_phone_number || '',
		});
		router.push(`/admin/automation/automated-follow-ups/new?${params.toString()}`);
	};

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Enhanced Header with Breadcrumb */}
			<div className="border-b bg-background">
				<div className="px-6 py-3">
					<div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
						<Link href="/admin/students" className="hover:text-foreground transition-colors">
							Students
						</Link>
						<ChevronRight className="h-3 w-3" />
						<span>{student.full_name}</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
								<span className="text-sm font-semibold text-primary">{initials}</span>
							</div>
							<div>
								<h1 className="text-xl font-semibold">{student.full_name}</h1>
								{enrollmentStatus && (
									<div className="flex items-center gap-2 mt-0.5">
										<Badge 
											variant={ENROLLMENT_STATUS_COLORS[enrollmentStatus as keyof typeof ENROLLMENT_STATUS_COLORS] as any} 
											className="h-4 text-[10px] px-1.5"
										>
											{ENROLLMENT_STATUS_LABELS[enrollmentStatus as keyof typeof ENROLLMENT_STATUS_LABELS] || enrollmentStatus}
										</Badge>
									</div>
								)}
							</div>
						</div>
						
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									<MoreVertical className="h-3.5 w-3.5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuItem onClick={navigateToSetFollowUp}>
									<Calendar className="mr-2 h-3.5 w-3.5" />
									Set Follow-up
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="text-destructive">
									<Trash2 className="mr-2 h-3.5 w-3.5" />
									Delete Student
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			<div className="px-6 py-4 space-y-4">
				{/* Student Information with inline editing */}
				<EditableSection title="Student Information">
					{(editing) => (
						<div className="grid gap-8 lg:grid-cols-3">
							{/* Contact Section */}
							<div className="space-y-4">
								<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Email:</p>
											<div className="flex items-center gap-1">
												<InlineEditField
													value={student.email}
													onSave={(value) => updateStudentField("email", value)}
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
										<Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Phone:</p>
											<div className="flex items-center gap-1">
												<InlineEditField
													value={student.mobile_phone_number}
													onSave={(value) => updateStudentField("mobile_phone_number", value)}
													editing={editing}
													type="text"
													placeholder="Enter phone"
												/>
												{!editing && student.mobile_phone_number && (
													<CopyButton text={student.mobile_phone_number} label="Phone" />
												)}
											</div>
										</div>
									</div>
									
									<div className="flex items-start gap-3">
										<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">City:</p>
											<InlineEditField
												value={student.city}
												onSave={(value) => updateStudentField("city", value)}
												editing={editing}
												type="text"
												placeholder="Enter city"
											/>
										</div>
									</div>
									
									<div className="flex items-start gap-3">
										<MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Default Communication Channel:</p>
											{editing ? (
												<InlineEditField
													value={student.communication_channel}
													onSave={(value) => updateStudentField("communication_channel", value)}
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
													{student.communication_channel?.replace("_", " + ").toUpperCase() || "—"}
												</Badge>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Learning Profile */}
							<div className="space-y-4">
								<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Learning Profile</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Level:</p>
											{editing ? (
												<InlineEditField
													value={student.desired_starting_language_level}
													onSave={(value) => updateStudentField("desired_starting_language_level", value)}
													editing={editing}
													type="select"
													options={[
														{ label: "A1", value: "a1" },
														{ label: "A1+", value: "a1_plus" },
														{ label: "A2", value: "a2" },
														{ label: "A2+", value: "a2_plus" },
														{ label: "B1", value: "b1" },
														{ label: "B1+", value: "b1_plus" },
														{ label: "B2", value: "b2" },
														{ label: "B2+", value: "b2_plus" },
														{ label: "C1", value: "c1" },
														{ label: "C1+", value: "c1_plus" },
														{ label: "C2", value: "c2" },
													]}
												/>
											) : (
												<Badge variant="outline" className="h-5 text-xs">
													{student.desired_starting_language_level?.toUpperCase() || "—"}
												</Badge>
											)}
										</div>
									</div>
									
									<div className="flex items-start gap-3">
										<UserCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Registered as Beginner(A0)?</p>
											{editing ? (
												<InlineEditField
													value={student.is_full_beginner ? "true" : "false"}
													onSave={(value) => updateStudentField("is_full_beginner", value === "true")}
													editing={editing}
													type="select"
													options={[
														{ label: "Yes", value: "true" },
														{ label: "No", value: "false" },
													]}
												/>
											) : (
												<Badge variant={student.is_full_beginner ? "info" : "secondary"} className="h-5 text-xs">
													{student.is_full_beginner ? "Yes" : "No"}
												</Badge>
											)}
										</div>
									</div>
									
									<div className="flex items-start gap-3">
										<Baby className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Under 16:</p>
											{editing ? (
												<InlineEditField
													value={student.is_under_16 ? "true" : "false"}
													onSave={(value) => updateStudentField("is_under_16", value === "true")}
													editing={editing}
													type="select"
													options={[
														{ label: "Yes", value: "true" },
														{ label: "No", value: "false" },
													]}
												/>
											) : (
												<Badge variant={student.is_under_16 ? "warning" : "secondary"} className="h-5 text-xs">
													{student.is_under_16 ? "Yes" : "No"}
												</Badge>
											)}
										</div>
									</div>
									
									{student.purpose_to_learn && (
										<div className="flex items-start gap-3">
											<Target className="h-4 w-4 text-muted-foreground mt-0.5" />
											<div className="flex-1 space-y-0.5">
												<p className="text-xs text-muted-foreground">Purpose:</p>
												<InlineEditField
													value={student.purpose_to_learn}
													onSave={(value) => updateStudentField("purpose_to_learn", value)}
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
								<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preferences</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Newsletter:</p>
											<Badge variant={student.added_to_email_newsletter ? "success" : "secondary"} className="h-5 text-xs">
												{student.added_to_email_newsletter ? "Subscribed" : "Not Subscribed"}
											</Badge>
										</div>
									</div>
									
									<div className="flex items-start gap-3">
										<Zap className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Initial Channel:</p>
											<InlineEditField
												value={student.initial_channel || ""}
												onSave={(value) => updateStudentField("initial_channel", value || null)}
												editing={editing}
												type="text"
												placeholder="Enter initial channel"
											/>
										</div>
									</div>
								</div>

								{/* External Integrations - Read only */}
								{(student.stripe_customer_id || student.convertkit_id || student.openphone_contact_id) && (
									<div className="mt-6 space-y-4">
										<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Integrations</h3>
										<div className="space-y-3">
											{student.stripe_customer_id && (
												<div className="flex items-start gap-3">
													<CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
													<div className="flex-1 space-y-0.5">
														<p className="text-xs text-muted-foreground">Stripe:</p>
														<code className="text-xs bg-muted px-1.5 py-0.5 rounded">
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
						<div className="flex items-center justify-between mb-4 w-full">
							<TabsList className="grid grid-cols-3 w-full">
								<TabsTrigger value="enrollments" className="flex items-center gap-2">
									<BookOpen className="h-3.5 w-3.5" />
									Enrollments
									{enrollmentCount > 0 && (
										<Badge variant="secondary" className="h-4 px-1 text-[10px]">
											{enrollmentCount}
										</Badge>
									)}
								</TabsTrigger>
								<TabsTrigger value="assessments" className="flex items-center gap-2">
									<ClipboardCheck className="h-3.5 w-3.5" />
									Assessments
									{assessmentCount > 0 && (
										<Badge variant="secondary" className="h-4 px-1 text-[10px]">
											{assessmentCount}
										</Badge>
									)}
								</TabsTrigger>
								<TabsTrigger value="attendance" className="flex items-center gap-2">
									<Calendar className="h-3.5 w-3.5" />
									Attendance
								</TabsTrigger>
							</TabsList>
						</div>

						{/* Enrollments Tab */}
						<TabsContent value="enrollments" className="mt-4">
							<Card className="bg-background">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="text-base font-semibold">Course Enrollments</CardTitle>
											<p className="text-xs text-muted-foreground mt-0.5">
												{enrollmentCount} active enrollment{enrollmentCount !== 1 ? 's' : ''}
											</p>
										</div>
										<Button size="sm" onClick={navigateToCreateEnrollment}>
											<Plus className="mr-1.5 h-3.5 w-3.5" />
											Add Enrollment
										</Button>
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
											<CardTitle className="text-base font-semibold">Language Assessments</CardTitle>
											<p className="text-xs text-muted-foreground mt-0.5">
												{assessmentCount > 0 ? `${assessmentCount} assessment${assessmentCount !== 1 ? 's' : ''} completed` : 'No assessments scheduled yet'}
											</p>
										</div>
										<Button size="sm" onClick={navigateToCreateAssessment}>
											<Plus className="mr-1.5 h-3.5 w-3.5" />
											Schedule Assessment
										</Button>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<StudentAssessments studentId={student.id} />
								</CardContent>
							</Card>
						</TabsContent>

						{/* Attendance Tab */}
						<TabsContent value="attendance" className="mt-4">
							<Card className="bg-background">
								<CardHeader className="pb-3">
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="text-base font-semibold">Attendance Records</CardTitle>
											<p className="text-xs text-muted-foreground mt-0.5">
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
					</Tabs>
				</div>

				{/* System Information - Less prominent at the bottom */}
				<div className="mt-8 border-t pt-6">
					<div className="max-w-3xl mx-auto">
						<div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground/70">
							<div className="flex items-center gap-2">
								<span>ID:</span>
								<code className="bg-muted/50 px-1.5 py-0.5 rounded font-mono">{student.id.slice(0, 8)}</code>
							</div>
							{student.user_id && (
								<div className="flex items-center gap-2">
									<span>User:</span>
									<code className="bg-muted/50 px-1.5 py-0.5 rounded font-mono">{student.user_id.slice(0, 8)}</code>
								</div>
							)}
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Created:</span>
								<span>{format(new Date(student.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Updated:</span>
								<span>{format(new Date(student.updated_at), "MMM d, yyyy 'at' h:mm a")}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}