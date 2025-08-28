"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { toast } from "sonner";
import {
	Calendar,
	ChevronRight,
	Clock,
	CreditCard,
	ExternalLink,
	GraduationCap,
	Mail,
	MoreVertical,
	Phone,
	Trash2,
	User,
	Video,
	CheckCircle,
	XCircle,
	FileText,
	UserCheck,
	BookOpen,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { format } from "date-fns";

interface AssessmentDetailsClientProps {
	assessment: any;
}

// Assessment result configuration
const RESULT_LABELS = {
	requested: "Requested",
	scheduled: "Scheduled",
	session_held: "Session Held",
	level_determined: "Level Determined",
};

const RESULT_COLORS = {
	requested: "secondary",
	scheduled: "default",
	session_held: "outline",
	level_determined: "success",
};

// Language level options
const LEVEL_OPTIONS = [
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
];

export default function AssessmentDetailsClient({
	assessment: initialAssessment,
}: AssessmentDetailsClientProps) {
	const router = useRouter();
	const [assessment, setAssessment] = useState(initialAssessment);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Update assessment field
	const updateAssessmentField = async (field: string, value: any) => {
		try {
			const response = await fetch(`/api/assessments/${assessment.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ [field]: value }),
			});

			if (!response.ok) throw new Error("Failed to update");

			const updated = await response.json();
			setAssessment(updated);
			toast.success("Updated successfully");
		} catch (error) {
			toast.error("Failed to update");
			throw error;
		}
	};

	// Delete assessment
	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const response = await fetch(`/api/assessments/${assessment.id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete");

			toast.success("Assessment deleted successfully");
			router.push("/admin/assessments");
		} catch (error) {
			toast.error("Failed to delete assessment");
			setIsDeleting(false);
		}
	};

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Header with Breadcrumb */}
			<div className="border-b bg-background">
				<div className="px-6 py-3">
					<div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
						<Link href="/admin/assessments" className="hover:text-foreground transition-colors">
							Assessments
						</Link>
						<ChevronRight className="h-3 w-3" />
						<Link
							href={`/admin/students/${assessment.student_id}`}
							className="hover:text-foreground transition-colors"
						>
							{assessment.students?.full_name || "Student"}
						</Link>
						<ChevronRight className="h-3 w-3" />
						<span>Assessment Details</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
								<GraduationCap className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h1 className="text-xl font-semibold">
									{assessment.students?.full_name || "Unknown Student"} - Assessment
								</h1>
								<div className="flex items-center gap-2 mt-0.5">
									<Badge
										variant={(RESULT_COLORS as any)[assessment.result] || "default"}
										className="h-4 text-[10px] px-1.5"
									>
										{(RESULT_LABELS as any)[assessment.result] || assessment.result}
									</Badge>
									{assessment.level && (
										<Badge variant="outline" className="h-4 text-[10px] px-1.5">
											Level {assessment.level.toUpperCase()}
										</Badge>
									)}
									{assessment.is_paid && (
										<Badge variant="success" className="h-4 text-[10px] px-1.5">
											Paid
										</Badge>
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
								<DropdownMenuItem asChild>
									<Link href={`/admin/students/${assessment.student_id}`}>
										<User className="mr-2 h-3.5 w-3.5" />
										View Student Profile
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => setDeleteDialogOpen(true)}
								>
									<Trash2 className="mr-2 h-3.5 w-3.5" />
									Delete Assessment
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			<div className="px-6 py-4 space-y-4">
				{/* Assessment Information */}
				<EditableSection title="Assessment Information">
					{(editing) => (
						<div className="grid gap-8 lg:grid-cols-3">
							{/* Assessment Details */}
							<div className="space-y-4">
								<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
									Assessment Details
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Status:</p>
											{editing ? (
												<InlineEditField
													value={assessment.result}
													onSave={(value) => updateAssessmentField("result", value)}
													editing={editing}
													type="select"
													options={[
														{ label: "Requested", value: "requested" },
														{ label: "Scheduled", value: "scheduled" },
														{ label: "Session Held", value: "session_held" },
														{ label: "Level Determined", value: "level_determined" },
													]}
												/>
											) : (
												<Badge variant={(RESULT_COLORS as any)[assessment.result] || "default"}>
													{(RESULT_LABELS as any)[assessment.result] || assessment.result}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Determined Level:</p>
											{editing ? (
												<InlineEditField
													value={assessment.level || "not_set"}
													onSave={(value) => updateAssessmentField("level", value === "not_set" ? null : value)}
													editing={editing}
													type="select"
													options={[
														{ label: "Not Set", value: "not_set" },
														...LEVEL_OPTIONS,
													]}
												/>
											) : assessment.level ? (
												<Badge variant="outline">{assessment.level.toUpperCase()}</Badge>
											) : (
												<span className="text-sm text-muted-foreground">Not determined</span>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Scheduled Date:</p>
											<InlineEditField
												value={assessment.scheduled_for || ""}
												onSave={(value) => updateAssessmentField("scheduled_for", value || null)}
												editing={editing}
												type="date"
												placeholder="Select date"
											/>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Payment Status:</p>
											{editing ? (
												<InlineEditField
													value={assessment.is_paid ? "true" : "false"}
													onSave={(value) => updateAssessmentField("is_paid", value === "true")}
													editing={editing}
													type="select"
													options={[
														{ label: "Paid", value: "true" },
														{ label: "Not Paid", value: "false" },
													]}
												/>
											) : assessment.is_paid ? (
												<div className="flex items-center gap-1.5 text-green-600">
													<CheckCircle className="h-4 w-4" />
													<span className="text-sm font-medium">Paid</span>
												</div>
											) : (
												<div className="flex items-center gap-1.5 text-muted-foreground">
													<XCircle className="h-4 w-4" />
													<span className="text-sm">Not Paid</span>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Student Information */}
							<div className="space-y-4">
								<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
									Student Information
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<User className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Name:</p>
											<Link
												href={`/admin/students/${assessment.student_id}`}
												className="text-sm font-medium hover:text-primary transition-colors hover:underline"
											>
												{assessment.students?.full_name || "Unknown"}
											</Link>
										</div>
									</div>

									{assessment.students?.email && (
										<div className="flex items-start gap-3">
											<Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
											<div className="flex-1 space-y-0.5">
												<p className="text-xs text-muted-foreground">Email:</p>
												<p className="text-sm">{assessment.students.email}</p>
											</div>
										</div>
									)}

									{assessment.students?.mobile_phone_number && (
										<div className="flex items-start gap-3">
											<Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
											<div className="flex-1 space-y-0.5">
												<p className="text-xs text-muted-foreground">Phone:</p>
												<p className="text-sm">{assessment.students.mobile_phone_number}</p>
											</div>
										</div>
									)}

									{(assessment.students?.desired_starting_language_level || assessment.students?.desired_starting_language_level_id) && (
										<div className="flex items-start gap-3">
											<GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
											<div className="flex-1 space-y-0.5">
												<p className="text-xs text-muted-foreground">Desired Level:</p>
												<Badge variant="outline">
													{typeof assessment.students.desired_starting_language_level === 'object' 
														? (assessment.students.desired_starting_language_level.display_name || assessment.students.desired_starting_language_level.code?.toUpperCase())
														: assessment.students.desired_starting_language_level?.toUpperCase() || 'N/A'}
												</Badge>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Links & Notes */}
							<div className="space-y-4">
								<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
									Resources & Notes
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Calendar Event:</p>
											<InlineEditField
												value={assessment.calendar_event_url || ""}
												onSave={(value) => updateAssessmentField("calendar_event_url", value || null)}
												editing={editing}
												type="text"
												placeholder="Enter calendar event URL"
											/>
											{!editing && assessment.calendar_event_url && (
												<a
													href={assessment.calendar_event_url}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
												>
													<ExternalLink className="h-3 w-3" />
													Open Event
												</a>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Video className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Recording URL:</p>
											<InlineEditField
												value={assessment.meeting_recording_url || ""}
												onSave={(value) => updateAssessmentField("meeting_recording_url", value || null)}
												editing={editing}
												type="text"
												placeholder="Enter recording URL"
											/>
											{!editing && assessment.meeting_recording_url && (
												<a
													href={assessment.meeting_recording_url}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
												>
													<ExternalLink className="h-3 w-3" />
													Watch Recording
												</a>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Notes:</p>
											<InlineEditField
												value={assessment.notes || ""}
												onSave={(value) => updateAssessmentField("notes", value || null)}
												editing={editing}
												type="textarea"
												placeholder="Enter assessment notes"
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</EditableSection>

				{/* System Information */}
				<div className="mt-8 border-t pt-6">
					<div className="max-w-3xl mx-auto">
						<div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground/70">
							<div className="flex items-center gap-2">
								<span>ID:</span>
								<code className="bg-muted/50 px-1.5 py-0.5 rounded font-mono">
									{assessment.id.slice(0, 8)}
								</code>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Created:</span>
								<span>{format(new Date(assessment.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Updated:</span>
								<span>{format(new Date(assessment.updated_at), "MMM d, yyyy 'at' h:mm a")}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Assessment</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this assessment? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}