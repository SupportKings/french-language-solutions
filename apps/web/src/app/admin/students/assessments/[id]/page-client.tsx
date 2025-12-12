"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
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
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LinkedRecordBadge } from "@/components/ui/linked-record-badge";

import { format } from "date-fns";
import {
	BookOpen,
	Calendar,
	CheckCircle,
	ChevronRight,
	Clock,
	CreditCard,
	ExternalLink,
	FileText,
	GraduationCap,
	Mail,
	MoreVertical,
	Phone,
	Trash2,
	User,
	Video,
	XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AssessmentDetailsClientProps {
	assessment: any;
	permissions?: any;
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

export default function AssessmentDetailsClient({
	assessment: initialAssessment,
	permissions,
}: AssessmentDetailsClientProps) {
	// Check if user can edit assessments
	const canEditAssessment = permissions?.assessments?.includes("write");
	const router = useRouter();
	const [assessment, setAssessment] = useState(initialAssessment);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [languageLevels, setLanguageLevels] = useState<any[]>([]);
	// Local state for edited values
	const [editedAssessment, setEditedAssessment] =
		useState<any>(initialAssessment);

	// Update the assessment when data changes
	useEffect(() => {
		if (initialAssessment) {
			setAssessment(initialAssessment);
			setEditedAssessment(initialAssessment);
		}
	}, [initialAssessment]);

	// Fetch language levels from API
	useEffect(() => {
		const fetchLanguageLevels = async () => {
			try {
				const response = await fetch("/api/language-levels");
				if (response.ok) {
					const result = await response.json();
					setLanguageLevels(result.data || []);
				}
			} catch (error) {
				console.error("Error fetching language levels:", error);
			}
		};

		fetchLanguageLevels();
	}, []);

	// Update edited assessment field locally
	const updateEditedField = async (field: string, value: any) => {
		setEditedAssessment({
			...editedAssessment,
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
			if (editedAssessment.result !== assessment.result) {
				changes.result = editedAssessment.result;
			}
			if (editedAssessment.level_id !== assessment.level_id) {
				changes.level_id = editedAssessment.level_id;
			}
			if (editedAssessment.scheduled_for !== assessment.scheduled_for) {
				changes.scheduled_for = editedAssessment.scheduled_for;
			}
			if (editedAssessment.is_paid !== assessment.is_paid) {
				changes.is_paid = editedAssessment.is_paid;
			}
			if (
				editedAssessment.calendar_event_url !== assessment.calendar_event_url
			) {
				changes.calendar_event_url = editedAssessment.calendar_event_url;
			}
			if (
				editedAssessment.meeting_recording_url !==
				assessment.meeting_recording_url
			) {
				changes.meeting_recording_url = editedAssessment.meeting_recording_url;
			}
			if (editedAssessment.notes !== assessment.notes) {
				changes.notes = editedAssessment.notes;
			}

			// If no changes, return early
			if (Object.keys(changes).length === 0) {
				return;
			}

			const response = await fetch(`/api/assessments/${assessment.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(changes),
			});

			if (!response.ok) throw new Error("Failed to update assessment");

			const updated = await response.json();
			setAssessment(updated);
			setEditedAssessment(updated);
			toast.success("Changes saved successfully");
		} catch (error) {
			toast.error("Failed to save changes");
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
			router.push("/admin/students/assessments");
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
					<div className="mb-2 flex items-center gap-2">
						<BackButton />
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<Link
								href="/admin/students/assessments"
								className="transition-colors hover:text-foreground"
							>
								Assessments
							</Link>
							<ChevronRight className="h-3 w-3" />
							<Link
								href={`/admin/students/${assessment.student_id}`}
								className="transition-colors hover:text-foreground"
							>
								{assessment.students?.full_name || "Student"}
							</Link>
							<ChevronRight className="h-3 w-3" />
						</div>
						<span>Assessment Details</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
								<GraduationCap className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h1 className="font-semibold text-xl">
									{assessment.students?.full_name || "Unknown Student"} -
									Assessment
								</h1>
								<div className="mt-0.5 flex items-center gap-2">
									<Badge
										variant={
											(RESULT_COLORS as any)[assessment.result] || "default"
										}
										className="h-4 px-1.5 text-[10px]"
									>
										{(RESULT_LABELS as any)[assessment.result] ||
											assessment.result}
									</Badge>
									{assessment.language_level && (
										<Badge variant="outline" className="h-4 px-1.5 text-[10px]">
											Level{" "}
											{assessment.language_level.display_name ||
												assessment.language_level.code?.toUpperCase()}
										</Badge>
									)}
									<Badge
										variant={assessment.is_paid ? "success" : "secondary"}
										className="h-4 px-1.5 text-[10px]"
									>
										{assessment.is_paid ? "Paid" : "Unpaid"}
									</Badge>
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
								{canEditAssessment && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => setDeleteDialogOpen(true)}
										>
											<Trash2 className="mr-2 h-3.5 w-3.5" />
											Delete Assessment
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			<div className="space-y-4 px-6 py-4">
				{/* Assessment Information */}
				<EditableSection
					title="Assessment Information"
					canEdit={canEditAssessment}
					onEditStart={() => setEditedAssessment(assessment)}
					onSave={saveAllChanges}
					onCancel={() => setEditedAssessment(assessment)}
				>
					{(editing) => (
						<div className="grid gap-8 lg:grid-cols-3">
							{/* Assessment Details */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Assessment Details
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<BookOpen className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Status:</p>
											{editing ? (
												<InlineEditField
													value={editedAssessment.result}
													onSave={(value) => updateEditedField("result", value)}
													editing={editing}
													type="select"
													options={[
														{ label: "Requested", value: "requested" },
														{ label: "Scheduled", value: "scheduled" },
														{ label: "Session Held", value: "session_held" },
														{
															label: "Level Determined",
															value: "level_determined",
														},
													]}
												/>
											) : (
												<Badge
													variant={
														(RESULT_COLORS as any)[assessment.result] ||
														"default"
													}
												>
													{(RESULT_LABELS as any)[assessment.result] ||
														assessment.result}
												</Badge>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<GraduationCap className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Determined Level:
											</p>
											{editing ? (
												<InlineEditField
													value={editedAssessment.level_id || ""}
													onSave={(value) =>
														updateEditedField("level_id", value || null)
													}
													editing={editing}
													type="select"
													options={languageLevels.map((level) => ({
														value: level.id,
														label:
															level.display_name || level.code?.toUpperCase(),
													}))}
													placeholder="Select level"
												/>
											) : assessment.language_level ? (
												<Badge variant="outline">
													{assessment.language_level.display_name ||
														assessment.language_level.code?.toUpperCase()}
												</Badge>
											) : (
												<span className="text-muted-foreground text-sm">
													Not determined
												</span>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Scheduled Date:
											</p>
											<InlineEditField
												value={editedAssessment.scheduled_for || ""}
												onSave={(value) =>
													updateEditedField("scheduled_for", value || null)
												}
												editing={editing}
												type="date"
												placeholder="Select date"
											/>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Payment Status:
											</p>
											{editing ? (
												<InlineEditField
													value={editedAssessment.is_paid ? "true" : "false"}
													onSave={(value) =>
														updateEditedField("is_paid", value === "true")
													}
													editing={editing}
													type="select"
													options={[
														{ label: "Paid", value: "true" },
														{ label: "Unpaid", value: "false" },
													]}
												/>
											) : assessment.is_paid ? (
												<div className="flex items-center gap-1.5 text-green-600">
													<CheckCircle className="h-4 w-4" />
													<span className="font-medium text-sm">Paid</span>
												</div>
											) : (
												<div className="flex items-center gap-1.5 text-orange-600">
													<XCircle className="h-4 w-4" />
													<span className="text-sm">Unpaid</span>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Student Information */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Student Information
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Name:</p>
											<LinkedRecordBadge
												href={`/admin/students/${assessment.student_id}`}
												label={assessment.students?.full_name || "Unknown"}
												icon={User}
												title={assessment.students?.email || "No email"}
											/>
										</div>
									</div>

									{assessment.students?.email && (
										<div className="flex items-start gap-3">
											<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
											<div className="flex-1 space-y-0.5">
												<p className="text-muted-foreground text-xs">Email:</p>
												<p className="text-sm">{assessment.students.email}</p>
											</div>
										</div>
									)}

									{assessment.students?.mobile_phone_number && (
										<div className="flex items-start gap-3">
											<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
											<div className="flex-1 space-y-0.5">
												<p className="text-muted-foreground text-xs">Phone:</p>
												<p className="text-sm">
													{assessment.students.mobile_phone_number}
												</p>
											</div>
										</div>
									)}

									{(assessment.students?.desired_starting_language_level ||
										assessment.students
											?.desired_starting_language_level_id) && (
										<div className="flex items-start gap-3">
											<GraduationCap className="mt-0.5 h-4 w-4 text-muted-foreground" />
											<div className="flex-1 space-y-0.5">
												<p className="text-muted-foreground text-xs">
													Desired Level:
												</p>
												<Badge variant="outline">
													{typeof assessment.students
														.desired_starting_language_level === "object"
														? assessment.students
																.desired_starting_language_level.display_name ||
															assessment.students.desired_starting_language_level.code?.toUpperCase()
														: assessment.students.desired_starting_language_level?.toUpperCase() ||
															"N/A"}
												</Badge>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Links & Notes */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Resources & Notes
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Calendar Event:
											</p>
											{editing ? (
												<InlineEditField
													value={editedAssessment.calendar_event_url || ""}
													onSave={(value) =>
														updateEditedField(
															"calendar_event_url",
															value || null,
														)
													}
													editing={editing}
													type="text"
													placeholder="Enter calendar event URL"
												/>
											) : assessment.calendar_event_url ? (
												<a
													href={assessment.calendar_event_url}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1.5 text-primary text-sm hover:underline"
												>
													<ExternalLink className="h-3.5 w-3.5" />
													Open Event
												</a>
											) : (
												<span className="text-muted-foreground text-sm">
													No calendar event
												</span>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Video className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">
												Recording URL:
											</p>
											{editing ? (
												<InlineEditField
													value={editedAssessment.meeting_recording_url || ""}
													onSave={(value) =>
														updateEditedField(
															"meeting_recording_url",
															value || null,
														)
													}
													editing={editing}
													type="text"
													placeholder="Enter recording URL"
												/>
											) : assessment.meeting_recording_url ? (
												<a
													href={assessment.meeting_recording_url}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1.5 text-primary text-sm hover:underline"
												>
													<ExternalLink className="h-3.5 w-3.5" />
													Watch Recording
												</a>
											) : (
												<span className="text-muted-foreground text-sm">
													No recording
												</span>
											)}
										</div>
									</div>

									<div className="flex items-start gap-3">
										<FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Notes:</p>
											<InlineEditField
												value={editedAssessment.notes || ""}
												onSave={(value) =>
													updateEditedField("notes", value || null)
												}
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
					<div className="mx-auto max-w-3xl">
						<div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground/70 text-xs">
							<div className="flex items-center gap-2">
								<span>ID:</span>
								<code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono">
									{assessment.id.slice(0, 8)}
								</code>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Created:</span>
								<span>
									{format(
										new Date(assessment.created_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Updated at:</span>
								<span>
									{format(
										new Date(assessment.updated_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
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
							Are you sure you want to delete this assessment? This action
							cannot be undone.
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
