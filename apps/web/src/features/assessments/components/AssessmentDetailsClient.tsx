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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { format } from "date-fns";
import {
	ArrowLeft,
	Calendar,
	CheckCircle,
	ClipboardCheck,
	DollarSign,
	Edit,
	ExternalLink,
	Eye,
	GraduationCap,
	Mail,
	MapPin,
	MoreHorizontal,
	Phone,
	Trash,
	User,
	UserCircle,
	Video,
	XCircle,
} from "lucide-react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";

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


interface AssessmentDetailsClientProps {
	assessment: any;
}

export function AssessmentDetailsClient({
	assessment: initialAssessment,
}: AssessmentDetailsClientProps) {
	const router = useRouter();
	const [assessment, setAssessment] = useState(initialAssessment);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [languageLevels, setLanguageLevels] = useState<any[]>([]);

	// Get redirectTo param from URL
	const [redirectTo] = useQueryState("redirectTo", {
		defaultValue: "/admin/students/assessments",
	});

	// Fetch language levels for the select options
	useEffect(() => {
		const fetchLanguageLevels = async () => {
			try {
				const response = await fetch("/api/language-levels");
				if (response.ok) {
					const result = await response.json();
					setLanguageLevels(result.data || []);
				} else {
					console.error("Failed to fetch language levels:", response.status);
				}
			} catch (error) {
				console.error("Error fetching language levels:", error);
			}
		};

		fetchLanguageLevels();
	}, []);

	// Get student initials for avatar
	const studentInitials =
		assessment.students?.full_name
			?.split(" ")
			.map((n: string) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2) || "ST";

	const handleUpdate = async (field: string, value: any) => {
		try {
			// Convert field names to API format
			const apiField = field.includes("_")
				? field
				: field.replace(/([A-Z])/g, "_$1").toLowerCase();

			const response = await fetch(`/api/assessments/${assessment.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ [apiField]: value }),
			});

			if (!response.ok) throw new Error("Failed to update assessment");

			const updated = await response.json();
			setAssessment((prevAssessment: any) => ({ ...prevAssessment, ...updated }));
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
			router.push(redirectTo);
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
			studentName: assessment.students?.full_name || "",
			redirectTo: redirectTo,
		});
		router.push(
			`/admin/students/assessments/new?${params.toString()}&edit=${assessment.id}`,
		);
	};

	return (
		<>
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
				<div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
					{/* Header */}
					<div className="mb-8">
						<Link href={redirectTo}>
							<Button variant="ghost" size="sm" className="mb-4">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back
							</Button>
						</Link>

						<div className="flex items-start justify-between">
							<div className="flex items-start gap-4">
								{/* Student Avatar */}
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
									<span className="font-semibold text-primary text-xl">
										{studentInitials}
									</span>
								</div>

								<div className="space-y-1">
									<div className="flex items-center gap-3">
										<h1 className="font-bold text-3xl tracking-tight">
											{assessment.students?.full_name || "Assessment Details"}
										</h1>
										<Badge
											variant={
												(resultColors as any)[assessment.result] || "default"
											}
											className="px-3 py-1"
										>
											{(resultLabels as any)[assessment.result] ||
												assessment.result}
										</Badge>
										{assessment.is_paid && (
											<Badge variant="success" className="px-3 py-1">
												<CheckCircle className="mr-1 h-3 w-3" />
												Paid
											</Badge>
										)}
									</div>
									<p className="text-muted-foreground">
										Level:{" "}
										{assessment.language_level?.display_name ||
											assessment.language_level?.code?.toUpperCase() ||
											"To Be Determined"}{" "}
										•{" "}
										{assessment.scheduled_for
											? `Scheduled for ${format(new Date(assessment.scheduled_for), "MMM d, yyyy")}`
											: "Not scheduled"}
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
					<Card className="border-border/50 bg-card/95 shadow-xl backdrop-blur-sm">
						<CardContent className="p-0">
							{/* Quick Stats */}
							<div className="border-border/50 border-b bg-muted/30 px-6 py-4">
								<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
									<div className="space-y-1">
										<p className="text-muted-foreground text-xs">
											Result Status
										</p>
										<Badge
											variant={
												(resultColors as any)[assessment.result] || "default"
											}
										>
											{(resultLabels as any)[assessment.result] ||
												assessment.result}
										</Badge>
									</div>
									<div className="space-y-1">
										<p className="text-muted-foreground text-xs">Level</p>
										<p className="font-medium text-sm">
											{assessment.language_level?.display_name ||
												assessment.language_level?.code?.toUpperCase() ||
												"TBD"}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-muted-foreground text-xs">
											Payment Status
										</p>
										<div className="flex items-center gap-1">
											{assessment.is_paid ? (
												<>
													<CheckCircle className="h-3.5 w-3.5 text-green-600" />
													<span className="font-medium text-green-600 text-sm">
														Paid
													</span>
												</>
											) : (
												<>
													<XCircle className="h-3.5 w-3.5 text-muted-foreground" />
													<span className="font-medium text-muted-foreground text-sm">
														Free
													</span>
												</>
											)}
										</div>
									</div>
									<div className="space-y-1">
										<p className="text-muted-foreground text-xs">
											Scheduled Date
										</p>
										<p className="font-medium text-sm">
											{assessment.scheduled_for
												? format(
														new Date(assessment.scheduled_for),
														"MMM d, yyyy",
													)
												: "Not scheduled"}
										</p>
									</div>
								</div>
							</div>

							<div className="space-y-4 px-6 py-4">
								{/* Assessment Information Section */}
								<EditableSection title="Assessment Information">
									{(editing) => (
										<div className="grid gap-8 lg:grid-cols-2">
											<div className="space-y-4">
												<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
													Assessment Details
												</h3>
												<div className="space-y-3">
													<div className="flex items-start gap-3">
														<ClipboardCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
														<div className="flex-1 space-y-0.5">
															<p className="text-muted-foreground text-xs">
																Result Status:
															</p>
															{editing ? (
																<InlineEditField
																	value={assessment.result}
																	onSave={(value) =>
																		handleUpdate("result", value)
																	}
																	editing={editing}
																	type="select"
																	options={resultOptions}
																/>
															) : (
																<Badge
																	variant={
																		(resultColors as any)[assessment.result] ||
																		"default"
																	}
																	className="mt-1"
																>
																	{(resultLabels as any)[assessment.result] ||
																		assessment.result}
																</Badge>
															)}
														</div>
													</div>

													<div className="flex items-start gap-3">
														<GraduationCap className="mt-0.5 h-4 w-4 text-muted-foreground" />
														<div className="flex-1 space-y-0.5">
															<p className="text-muted-foreground text-xs">
																Level:
															</p>
															{editing ? (
																<InlineEditField
																	value={String(assessment.level_id || "")}
																	onSave={(value) =>
																		handleUpdate("level_id", value || null)
																	}
																	editing={editing}
																	type="select"
																	options={languageLevels.map((level) => ({
																		value: String(level.id),
																		label: level.display_name || level.code?.toUpperCase() || "Unknown",
																	}))}
																	placeholder="Select level"
																/>
															) : assessment.language_level ? (
																<Badge variant="outline" className="mt-1">
																	{assessment.language_level.display_name || assessment.language_level.code?.toUpperCase()}
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
																Scheduled For:
															</p>
															{editing ? (
																<InlineEditField
																	value={assessment.scheduled_for || ""}
																	onSave={(value) =>
																		handleUpdate("scheduledFor", value || null)
																	}
																	editing={editing}
																	type="date"
																/>
															) : assessment.scheduled_for ? (
																<p className="font-medium text-sm">
																	{format(
																		new Date(assessment.scheduled_for),
																		"MMMM d, yyyy",
																	)}
																</p>
															) : (
																<span className="text-muted-foreground text-sm">
																	Not scheduled
																</span>
															)}
														</div>
													</div>

													<div className="flex items-start gap-3">
														<DollarSign className="mt-0.5 h-4 w-4 text-muted-foreground" />
														<div className="flex-1 space-y-0.5">
															<p className="text-muted-foreground text-xs">
																Payment Status:
															</p>
															{editing ? (
																<div className="flex items-center gap-2">
																	<Switch
																		checked={assessment.is_paid}
																		onCheckedChange={(checked) =>
																			handleUpdate("isPaid", checked)
																		}
																	/>
																	<span className="text-sm">
																		{assessment.is_paid ? "Paid" : "Unpaid"}
																	</span>
																</div>
															) : assessment.is_paid ? (
																<Badge variant="success" className="mt-1">
																	<CheckCircle className="mr-1 h-3 w-3" />
																	Paid
																</Badge>
															) : (
																<Badge variant="secondary" className="mt-1">
																	<XCircle className="mr-1 h-3 w-3" />
																	Unpaid
																</Badge>
															)}
														</div>
													</div>
												</div>
											</div>

											<div className="space-y-4">
												<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
													Resources & Links
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
																	value={assessment.calendar_event_url || ""}
																	onSave={(value) =>
																		handleUpdate(
																			"calendarEventUrl",
																			value || null,
																		)
																	}
																	editing={editing}
																	type="text"
																	placeholder="https://calendar.google.com/..."
																/>
															) : assessment.calendar_event_url ? (
																<Button
																	variant="outline"
																	size="sm"
																	className="h-7"
																	onClick={() => window.open(assessment.calendar_event_url, "_blank")}
																>
																	<ExternalLink className="mr-1.5 h-3 w-3" />
																	View Calendar Event
																</Button>
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
																Meeting Recording:
															</p>
															{editing ? (
																<InlineEditField
																	value={assessment.meeting_recording_url || ""}
																	onSave={(value) =>
																		handleUpdate(
																			"meetingRecordingUrl",
																			value || null,
																		)
																	}
																	editing={editing}
																	type="text"
																	placeholder="https://zoom.us/rec/..."
																/>
															) : assessment.meeting_recording_url ? (
																<Button
																	variant="outline"
																	size="sm"
																	className="h-7"
																	onClick={() => window.open(assessment.meeting_recording_url, "_blank")}
																>
																	<Video className="mr-1.5 h-3 w-3" />
																	View Recording
																</Button>
															) : (
																<span className="text-muted-foreground text-sm">
																	No recording available
																</span>
															)}
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
											{editing ? (
												<InlineEditField
													value={assessment.notes || ""}
													onSave={(value) =>
														handleUpdate("notes", value || null)
													}
													editing={editing}
													type="textarea"
													placeholder="Add assessment notes..."
												/>
											) : assessment.notes ? (
												<p className="whitespace-pre-wrap text-sm">
													{assessment.notes}
												</p>
											) : (
												<p className="text-muted-foreground text-sm italic">
													No notes added
												</p>
											)}
										</div>
									)}
								</EditableSection>

								{/* Tabs for Student and Teacher Information */}
								<div className="mt-6">
									<Tabs defaultValue="student" className="w-full">
										<TabsList className="grid w-[300px] grid-cols-2">
											<TabsTrigger
												value="student"
												className="flex items-center gap-2"
											>
												<UserCircle className="h-3.5 w-3.5" />
												Student Info
											</TabsTrigger>
											<TabsTrigger
												value="teacher"
												className="flex items-center gap-2"
											>
												<User className="h-3.5 w-3.5" />
												Teacher Info
											</TabsTrigger>
										</TabsList>

										{/* Student Information Tab */}
										<TabsContent value="student" className="mt-4">
											<Card className="border-border/50">
												<CardHeader className="pb-3">
													<CardTitle className="text-base">
														Student Information
													</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="grid gap-6 lg:grid-cols-2">
														<div className="space-y-3">
															<div className="flex items-start gap-3">
																<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-muted-foreground text-xs">
																		Full Name:
																	</p>
																	<div className="flex items-center gap-2">
																		<p className="font-medium text-sm">
																			{assessment.students?.full_name}
																		</p>
																		<Link
																			href={`/admin/students/${assessment.student_id}`}
																		>
																			<Button
																				variant="ghost"
																				size="sm"
																				className="h-6 px-2"
																			>
																				<Eye className="h-3 w-3" />
																			</Button>
																		</Link>
																	</div>
																</div>
															</div>

															<div className="flex items-start gap-3">
																<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-muted-foreground text-xs">
																		Email:
																	</p>
																	<p className="font-medium text-sm">
																		{assessment.students?.email ||
																			"Not provided"}
																	</p>
																</div>
															</div>
														</div>

														<div className="space-y-3">
															<div className="flex items-start gap-3">
																<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-muted-foreground text-xs">
																		Phone:
																	</p>
																	<p className="font-medium text-sm">
																		{assessment.students?.mobile_phone_number ||
																			"Not provided"}
																	</p>
																</div>
															</div>

															<div className="flex items-start gap-3">
																<MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-muted-foreground text-xs">
																		City:
																	</p>
																	<p className="font-medium text-sm">
																		{assessment.students?.city ||
																			"Not provided"}
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
													<CardTitle className="text-base">
														Teacher Information
													</CardTitle>
												</CardHeader>
												<CardContent>
													{assessment.interview_held_by ||
													assessment.level_checked_by ? (
														<div className="grid gap-6 lg:grid-cols-2">
															{assessment.interview_held_by && (
																<div className="space-y-3">
																	<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
																		Interview Held By
																	</h4>
																	<div className="flex items-start gap-3">
																		<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
																		<div className="flex-1 space-y-0.5">
																			<p className="text-muted-foreground text-xs">
																				Name:
																			</p>
																			<div className="flex items-center gap-2">
																				<p className="font-medium text-sm">
																					{`${assessment.interview_held_by.first_name} ${assessment.interview_held_by.last_name}`}
																				</p>
																				<Link
																					href={`/admin/teachers/${assessment.interview_held_by.id}`}
																				>
																					<Button
																						variant="ghost"
																						size="sm"
																						className="h-6 px-2"
																					>
																						<Eye className="h-3 w-3" />
																					</Button>
																				</Link>
																			</div>
																		</div>
																	</div>
																	<div className="flex items-start gap-3">
																		<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
																		<div className="flex-1 space-y-0.5">
																			<p className="text-muted-foreground text-xs">
																				Email:
																			</p>
																			<p className="font-medium text-sm">
																				{assessment.interview_held_by.email}
																			</p>
																		</div>
																	</div>
																</div>
															)}

															{assessment.level_checked_by && (
																<div className="space-y-3">
																	<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
																		Level Checked By
																	</h4>
																	<div className="flex items-start gap-3">
																		<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
																		<div className="flex-1 space-y-0.5">
																			<p className="text-muted-foreground text-xs">
																				Name:
																			</p>
																			<div className="flex items-center gap-2">
																				<p className="font-medium text-sm">
																					{`${assessment.level_checked_by.first_name} ${assessment.level_checked_by.last_name}`}
																				</p>
																				<Link
																					href={`/admin/teachers/${assessment.level_checked_by.id}`}
																				>
																					<Button
																						variant="ghost"
																						size="sm"
																						className="h-6 px-2"
																					>
																						<Eye className="h-3 w-3" />
																					</Button>
																				</Link>
																			</div>
																		</div>
																	</div>
																	<div className="flex items-start gap-3">
																		<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
																		<div className="flex-1 space-y-0.5">
																			<p className="text-muted-foreground text-xs">
																				Email:
																			</p>
																			<p className="font-medium text-sm">
																				{assessment.level_checked_by.email}
																			</p>
																		</div>
																	</div>
																</div>
															)}
														</div>
													) : (
														<p className="text-muted-foreground text-sm italic">
															No teacher assigned yet
														</p>
													)}
												</CardContent>
											</Card>
										</TabsContent>
									</Tabs>
								</div>

								{/* System Information */}
								<Card className="border-border/50 bg-muted/10">
									<CardHeader className="pb-3">
										<CardTitle className="text-muted-foreground text-sm">
											System Information
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
											<div className="space-y-1">
												<p className="text-muted-foreground text-xs">
													Assessment ID
												</p>
												<p className="font-mono text-muted-foreground text-xs">
													{assessment.id}
												</p>
											</div>
											<div className="space-y-1">
												<p className="text-muted-foreground text-xs">
													Created Date
												</p>
												<p className="text-sm">
													{format(
														new Date(assessment.created_at),
														"MMM d, yyyy",
													)}
												</p>
											</div>
											<div className="space-y-1">
												<p className="text-muted-foreground text-xs">
													Last Updated
												</p>
												<p className="text-sm">
													{format(
														new Date(
															assessment.updated_at || assessment.created_at,
														),
														"MMM d, yyyy",
													)}
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
							Are you sure you want to delete this assessment? This action
							cannot be undone.
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
