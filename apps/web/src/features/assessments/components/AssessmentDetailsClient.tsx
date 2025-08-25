"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import { 
	User, 
	Calendar, 
	GraduationCap, 
	Mail,
	Phone,
	MapPin,
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	Eye,
	Edit,
	Trash,
	MoreHorizontal,
	FileText,
	Video,
	ExternalLink,
	DollarSign,
	ArrowLeft,
	UserCircle,
	ClipboardCheck,
	BookOpen,
	Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const resultColors = {
	requested: "secondary",
	scheduled: "default",
	session_held: "outline",
	level_determined: "success",
};

const resultLabels = {
	requested: "Requested",
	scheduled: "Scheduled",
	session_held: "Session Held",
	level_determined: "Level Determined",
};

const resultOptions = Object.entries(resultLabels).map(([value, label]) => ({
	value,
	label,
}));

const levelOptions = [
	{ value: "a1", label: "A1" },
	{ value: "a1_plus", label: "A1+" },
	{ value: "a2", label: "A2" },
	{ value: "a2_plus", label: "A2+" },
	{ value: "b1", label: "B1" },
	{ value: "b1_plus", label: "B1+" },
	{ value: "b2", label: "B2" },
	{ value: "b2_plus", label: "B2+" },
	{ value: "c1", label: "C1" },
	{ value: "c1_plus", label: "C1+" },
	{ value: "c2", label: "C2" },
];

interface AssessmentDetailsClientProps {
	assessment: any;
}

export function AssessmentDetailsClient({ assessment: initialAssessment }: AssessmentDetailsClientProps) {
	const router = useRouter();
	const [assessment, setAssessment] = useState(initialAssessment);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	// Get student initials for avatar
	const studentInitials = assessment.students?.full_name
		?.split(' ')
		.map((n: string) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2) || 'ST';

	const handleUpdate = async (field: string, value: any) => {
		try {
			// Convert field names to API format
			const apiField = field.includes('_') ? field : 
				field.replace(/([A-Z])/g, '_$1').toLowerCase();

			const response = await fetch(`/api/assessments/${assessment.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ [apiField]: value }),
			});

			if (!response.ok) throw new Error("Failed to update assessment");

			const updated = await response.json();
			setAssessment({ ...assessment, ...updated });
			toast.success("Assessment updated successfully");
		} catch (error) {
			console.error("Error updating assessment:", error);
			toast.error("Failed to update assessment");
			throw error;
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const response = await fetch(`/api/assessments/${assessment.id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete assessment");

			toast.success("Assessment deleted successfully");
			router.push("/admin/students/assessments");
		} catch (error) {
			console.error("Error deleting assessment:", error);
			toast.error("Failed to delete assessment");
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	const navigateToEdit = () => {
		const params = new URLSearchParams({
			studentId: assessment.student_id,
			studentName: assessment.students?.full_name || '',
		});
		router.push(`/admin/students/assessments/new?${params.toString()}&edit=${assessment.id}`);
	};

	return (
		<>
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
				<div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
					{/* Header */}
					<div className="mb-8">
						<Link href="/admin/students/assessments">
							<Button variant="ghost" size="sm" className="mb-4">
								<ArrowLeft className="mr-2 h-4 w-4" />
								All Assessments
							</Button>
						</Link>
						
						<div className="flex items-start justify-between">
							<div className="flex items-start gap-4">
								{/* Student Avatar */}
								<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
									<span className="text-xl font-semibold text-primary">
										{studentInitials}
									</span>
								</div>
								
								<div className="space-y-1">
									<div className="flex items-center gap-3">
										<h1 className="text-3xl font-bold tracking-tight">
											{assessment.students?.full_name || 'Assessment Details'}
										</h1>
										<Badge variant={resultColors[assessment.result] as any} className="px-3 py-1">
											{resultLabels[assessment.result]}
										</Badge>
										{assessment.is_paid && (
											<Badge variant="success" className="px-3 py-1">
												<CheckCircle className="mr-1 h-3 w-3" />
												Paid
											</Badge>
										)}
									</div>
									<p className="text-muted-foreground">
										Level: {assessment.level ? assessment.level.toUpperCase() : 'To Be Determined'} • 
										{' '}{assessment.scheduled_for ? 
											`Scheduled for ${format(new Date(assessment.scheduled_for), "MMM d, yyyy")}` : 
											'Not scheduled'}
									</p>
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-2">
								<Link href={`/admin/students/${assessment.student_id}`}>
									<Button variant="outline" size="sm">
										<Eye className="mr-2 h-4 w-4" />
										View Student
									</Button>
								</Link>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={navigateToEdit}>
											<Edit className="mr-2 h-4 w-4" />
											Edit Assessment
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem 
											onClick={() => setShowDeleteDialog(true)}
											className="text-destructive"
										>
											<Trash className="mr-2 h-4 w-4" />
											Delete Assessment
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</div>

					{/* Main Content Card */}
					<Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
						<CardContent className="p-0">
							{/* Quick Stats */}
							<div className="border-b border-border/50 bg-muted/30 px-6 py-4">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
									<div className="space-y-1">
										<p className="text-xs text-muted-foreground">Result Status</p>
										<Badge variant={resultColors[assessment.result] as any}>
											{resultLabels[assessment.result]}
										</Badge>
									</div>
									<div className="space-y-1">
										<p className="text-xs text-muted-foreground">Level</p>
										<p className="text-sm font-medium">
											{assessment.level ? assessment.level.toUpperCase() : "TBD"}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-xs text-muted-foreground">Payment Status</p>
										<div className="flex items-center gap-1">
											{assessment.is_paid ? (
												<>
													<CheckCircle className="h-3.5 w-3.5 text-green-600" />
													<span className="text-sm font-medium text-green-600">Paid</span>
												</>
											) : (
												<>
													<XCircle className="h-3.5 w-3.5 text-muted-foreground" />
													<span className="text-sm font-medium text-muted-foreground">Unpaid</span>
												</>
											)}
										</div>
									</div>
									<div className="space-y-1">
										<p className="text-xs text-muted-foreground">Scheduled Date</p>
										<p className="text-sm font-medium">
											{assessment.scheduled_for ? 
												format(new Date(assessment.scheduled_for), "MMM d, yyyy") : 
												"Not scheduled"}
										</p>
									</div>
								</div>
							</div>

							<div className="px-6 py-4 space-y-4">
								{/* Assessment Information Section */}
								<EditableSection title="Assessment Information">
									{(editing) => (
										<div className="grid gap-8 lg:grid-cols-2">
											<div className="space-y-4">
												<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
													Assessment Details
												</h3>
												<div className="space-y-3">
													<div className="flex items-start gap-3">
														<ClipboardCheck className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div className="flex-1 space-y-0.5">
															<p className="text-xs text-muted-foreground">Result Status:</p>
															<InlineEditField
																value={assessment.result}
																onSave={(value) => handleUpdate("result", value)}
																editing={editing}
																type="select"
																options={resultOptions}
																renderValue={(value) => (
																	<Badge variant={resultColors[value] as any} className="mt-1">
																		{resultLabels[value]}
																	</Badge>
																)}
															/>
														</div>
													</div>

													<div className="flex items-start gap-3">
														<GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div className="flex-1 space-y-0.5">
															<p className="text-xs text-muted-foreground">Level:</p>
															<InlineEditField
																value={assessment.level || ""}
																onSave={(value) => handleUpdate("level", value || null)}
																editing={editing}
																type="select"
																options={levelOptions}
																placeholder="Select level"
																renderValue={(value) => 
																	value ? (
																		<Badge variant="outline" className="mt-1">
																			{value.toUpperCase()}
																		</Badge>
																	) : (
																		<span className="text-sm text-muted-foreground">Not determined</span>
																	)
																}
															/>
														</div>
													</div>

													<div className="flex items-start gap-3">
														<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div className="flex-1 space-y-0.5">
															<p className="text-xs text-muted-foreground">Scheduled For:</p>
															<InlineEditField
																value={assessment.scheduled_for || ""}
																onSave={(value) => handleUpdate("scheduledFor", value || null)}
																editing={editing}
																type="date"
																renderValue={(value) => 
																	value ? (
																		<p className="text-sm font-medium">
																			{format(new Date(value), "MMMM d, yyyy")}
																		</p>
																	) : (
																		<span className="text-sm text-muted-foreground">Not scheduled</span>
																	)
																}
															/>
														</div>
													</div>

													<div className="flex items-start gap-3">
														<DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div className="flex-1 space-y-0.5">
															<p className="text-xs text-muted-foreground">Payment Status:</p>
															<InlineEditField
																value={assessment.is_paid}
																onSave={(value) => handleUpdate("isPaid", value)}
																editing={editing}
																type="switch"
																renderValue={(value) => 
																	value ? (
																		<Badge variant="success" className="mt-1">
																			<CheckCircle className="mr-1 h-3 w-3" />
																			Paid
																		</Badge>
																	) : (
																		<Badge variant="secondary" className="mt-1">
																			<XCircle className="mr-1 h-3 w-3" />
																			Unpaid
																		</Badge>
																	)
																}
															/>
														</div>
													</div>
												</div>
											</div>

											<div className="space-y-4">
												<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
													Resources & Links
												</h3>
												<div className="space-y-3">
													<div className="flex items-start gap-3">
														<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div className="flex-1 space-y-0.5">
															<p className="text-xs text-muted-foreground">Calendar Event:</p>
															<InlineEditField
																value={assessment.calendar_event_url || ""}
																onSave={(value) => handleUpdate("calendarEventUrl", value || null)}
																editing={editing}
																type="url"
																placeholder="https://calendar.google.com/..."
																renderValue={(value) => 
																	value ? (
																		<a 
																			href={value} 
																			target="_blank" 
																			rel="noopener noreferrer"
																			className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
																		>
																			<ExternalLink className="h-3 w-3" />
																			View Calendar Event
																		</a>
																	) : (
																		<span className="text-sm text-muted-foreground">No calendar event</span>
																	)
																}
															/>
														</div>
													</div>

													<div className="flex items-start gap-3">
														<Video className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div className="flex-1 space-y-0.5">
															<p className="text-xs text-muted-foreground">Meeting Recording:</p>
															<InlineEditField
																value={assessment.meeting_recording_url || ""}
																onSave={(value) => handleUpdate("meetingRecordingUrl", value || null)}
																editing={editing}
																type="url"
																placeholder="https://zoom.us/rec/..."
																renderValue={(value) => 
																	value ? (
																		<a 
																			href={value} 
																			target="_blank" 
																			rel="noopener noreferrer"
																			className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
																		>
																			<Video className="h-3 w-3" />
																			View Recording
																		</a>
																	) : (
																		<span className="text-sm text-muted-foreground">No recording available</span>
																	)
																}
															/>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</EditableSection>

								{/* Notes Section */}
								<EditableSection title="Assessment Notes">
									{(editing) => (
										<div className="space-y-2">
											<InlineEditField
												value={assessment.notes || ""}
												onSave={(value) => handleUpdate("notes", value || null)}
												editing={editing}
												type="textarea"
												placeholder="Add assessment notes..."
												renderValue={(value) => 
													value ? (
														<p className="text-sm whitespace-pre-wrap">{value}</p>
													) : (
														<p className="text-sm text-muted-foreground italic">No notes added</p>
													)
												}
											/>
										</div>
									)}
								</EditableSection>

								{/* Tabs for Student and Teacher Information */}
								<div className="mt-6">
									<Tabs defaultValue="student" className="w-full">
										<TabsList className="grid grid-cols-2 w-[300px]">
											<TabsTrigger value="student" className="flex items-center gap-2">
												<UserCircle className="h-3.5 w-3.5" />
												Student Info
											</TabsTrigger>
											<TabsTrigger value="teacher" className="flex items-center gap-2">
												<User className="h-3.5 w-3.5" />
												Teacher Info
											</TabsTrigger>
										</TabsList>

										{/* Student Information Tab */}
										<TabsContent value="student" className="mt-4">
											<Card className="border-border/50">
												<CardHeader className="pb-3">
													<CardTitle className="text-base">Student Information</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="grid gap-6 lg:grid-cols-2">
														<div className="space-y-3">
															<div className="flex items-start gap-3">
																<User className="h-4 w-4 text-muted-foreground mt-0.5" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-xs text-muted-foreground">Full Name:</p>
																	<div className="flex items-center gap-2">
																		<p className="text-sm font-medium">
																			{assessment.students?.full_name}
																		</p>
																		<Link href={`/admin/students/${assessment.student_id}`}>
																			<Button variant="ghost" size="sm" className="h-6 px-2">
																				<Eye className="h-3 w-3" />
																			</Button>
																		</Link>
																	</div>
																</div>
															</div>

															<div className="flex items-start gap-3">
																<Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-xs text-muted-foreground">Email:</p>
																	<p className="text-sm font-medium">
																		{assessment.students?.email || "Not provided"}
																	</p>
																</div>
															</div>
														</div>

														<div className="space-y-3">
															<div className="flex items-start gap-3">
																<Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-xs text-muted-foreground">Phone:</p>
																	<p className="text-sm font-medium">
																		{assessment.students?.mobile_phone_number || "Not provided"}
																	</p>
																</div>
															</div>

															<div className="flex items-start gap-3">
																<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-xs text-muted-foreground">City:</p>
																	<p className="text-sm font-medium">
																		{assessment.students?.city || "Not provided"}
																	</p>
																</div>
															</div>
														</div>
													</div>
												</CardContent>
											</Card>
										</TabsContent>

										{/* Teacher Information Tab */}
										<TabsContent value="teacher" className="mt-4">
											<Card className="border-border/50">
												<CardHeader className="pb-3">
													<CardTitle className="text-base">Teacher Information</CardTitle>
												</CardHeader>
												<CardContent>
													{assessment.interview_held_by || assessment.level_checked_by ? (
														<div className="grid gap-6 lg:grid-cols-2">
															{assessment.interview_held_by && (
																<div className="space-y-3">
																	<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
																		Interview Held By
																	</h4>
																	<div className="flex items-start gap-3">
																		<User className="h-4 w-4 text-muted-foreground mt-0.5" />
																		<div className="flex-1 space-y-0.5">
																			<p className="text-xs text-muted-foreground">Name:</p>
																			<div className="flex items-center gap-2">
																				<p className="text-sm font-medium">
																					{`${assessment.interview_held_by.first_name} ${assessment.interview_held_by.last_name}`}
																				</p>
																				<Link href={`/admin/teachers/${assessment.interview_held_by.id}`}>
																					<Button variant="ghost" size="sm" className="h-6 px-2">
																						<Eye className="h-3 w-3" />
																					</Button>
																				</Link>
																			</div>
																		</div>
																	</div>
																	<div className="flex items-start gap-3">
																		<Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
																		<div className="flex-1 space-y-0.5">
																			<p className="text-xs text-muted-foreground">Email:</p>
																			<p className="text-sm font-medium">
																				{assessment.interview_held_by.email}
																			</p>
																		</div>
																	</div>
																</div>
															)}

															{assessment.level_checked_by && (
																<div className="space-y-3">
																	<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
																		Level Checked By
																	</h4>
																	<div className="flex items-start gap-3">
																		<User className="h-4 w-4 text-muted-foreground mt-0.5" />
																		<div className="flex-1 space-y-0.5">
																			<p className="text-xs text-muted-foreground">Name:</p>
																			<div className="flex items-center gap-2">
																				<p className="text-sm font-medium">
																					{`${assessment.level_checked_by.first_name} ${assessment.level_checked_by.last_name}`}
																				</p>
																				<Link href={`/admin/teachers/${assessment.level_checked_by.id}`}>
																					<Button variant="ghost" size="sm" className="h-6 px-2">
																						<Eye className="h-3 w-3" />
																					</Button>
																				</Link>
																			</div>
																		</div>
																	</div>
																	<div className="flex items-start gap-3">
																		<Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
																		<div className="flex-1 space-y-0.5">
																			<p className="text-xs text-muted-foreground">Email:</p>
																			<p className="text-sm font-medium">
																				{assessment.level_checked_by.email}
																			</p>
																		</div>
																	</div>
																</div>
															)}
														</div>
													) : (
														<p className="text-sm text-muted-foreground italic">No teacher assigned yet</p>
													)}
												</CardContent>
											</Card>
										</TabsContent>
									</Tabs>
								</div>

								{/* System Information */}
								<Card className="border-border/50 bg-muted/10">
									<CardHeader className="pb-3">
										<CardTitle className="text-sm text-muted-foreground">System Information</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
											<div className="space-y-1">
												<p className="text-xs text-muted-foreground">Assessment ID</p>
												<p className="text-xs font-mono text-muted-foreground">
													{assessment.id}
												</p>
											</div>
											<div className="space-y-1">
												<p className="text-xs text-muted-foreground">Created Date</p>
												<p className="text-sm">
													{format(new Date(assessment.created_at), "MMM d, yyyy")}
												</p>
											</div>
											<div className="space-y-1">
												<p className="text-xs text-muted-foreground">Last Updated</p>
												<p className="text-sm">
													{format(new Date(assessment.updated_at || assessment.created_at), "MMM d, yyyy")}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Assessment</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this assessment? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
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
		</>
	);
}