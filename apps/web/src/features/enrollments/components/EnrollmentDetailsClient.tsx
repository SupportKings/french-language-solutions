"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { format } from "date-fns";
import {
	AlertCircle,
	ArrowLeft,
	BookOpen,
	Building,
	Calendar,
	CheckCircle,
	Clock,
	Edit,
	Eye,
	GraduationCap,
	Mail,
	MapPin,
	MoreHorizontal,
	Phone,
	School,
	Trash,
	User,
	UserCircle,
	Users,
} from "lucide-react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";

const statusColors = {
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

const statusLabels = {
	declined_contract: "Declined Contract",
	dropped_out: "Dropped Out",
	interested: "Interested",
	beginner_form_filled: "Form Filled",
	contract_abandoned: "Contract Abandoned",
	contract_signed: "Contract Signed",
	payment_abandoned: "Payment Abandoned",
	paid: "Paid",
	welcome_package_sent: "Welcome Package Sent",
};

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
	value,
	label,
}));

interface EnrollmentDetailsClientProps {
	enrollment: any;
}

export function EnrollmentDetailsClient({
	enrollment: initialEnrollment,
}: EnrollmentDetailsClientProps) {
	const router = useRouter();
	const [enrollment, setEnrollment] = useState(initialEnrollment);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	// Local state for edited values
	const [editedEnrollment, setEditedEnrollment] =
		useState<any>(initialEnrollment);

	// Update the enrollment when data changes
	useEffect(() => {
		if (initialEnrollment) {
			setEnrollment(initialEnrollment);
			setEditedEnrollment(initialEnrollment);
		}
	}, [initialEnrollment]);

	// Get redirectTo param from URL
	const [redirectTo] = useQueryState("redirectTo", {
		defaultValue: "/admin/students/enrollments",
	});

	// Get student initials for avatar
	const studentInitials =
		enrollment.students?.full_name
			?.split(" ")
			.map((n: string) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2) || "ST";

	// Update edited enrollment field locally
	const updateEditedField = async (field: string, value: any) => {
		setEditedEnrollment({
			...editedEnrollment,
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
			if (editedEnrollment.status !== enrollment.status) {
				changes.status = editedEnrollment.status;
			}

			// If no changes, return early
			if (Object.keys(changes).length === 0) {
				return;
			}

			const response = await fetch(`/api/enrollments/${enrollment.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(changes),
			});

			if (!response.ok) throw new Error("Failed to update enrollment");

			const updated = await response.json();
			setEnrollment(updated);
			setEditedEnrollment(updated);
			toast.success("Changes saved successfully");
		} catch (error) {
			console.error("Error updating enrollment:", error);
			toast.error("Failed to save changes");
			throw error;
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const response = await fetch(`/api/enrollments/${enrollment.id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete enrollment");

			toast.success("Enrollment deleted successfully");
			router.push(redirectTo);
		} catch (error) {
			console.error("Error deleting enrollment:", error);
			toast.error("Failed to delete enrollment");
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	const navigateToEdit = () => {
		const params = new URLSearchParams({
			studentId: enrollment.student_id,
			studentName: enrollment.students?.full_name || "",
			cohortId: enrollment.cohort_id,
			redirectTo: redirectTo,
		});
		router.push(
			`/admin/students/enrollments/new?${params.toString()}&edit=${enrollment.id}`,
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
											{enrollment.students?.full_name || "Enrollment Details"}
										</h1>
										<Badge
											variant={(statusColors as any)[enrollment.status]}
											className="px-3 py-1"
										>
											{(statusLabels as any)[enrollment.status]}
										</Badge>
									</div>
									<p className="text-muted-foreground">
										{enrollment.cohorts?.products?.format === "group"
											? "Group Class"
											: "Private Class"}{" "}
										•{" "}
										{enrollment.cohorts?.starting_level?.display_name ||
											enrollment.cohorts?.starting_level?.code?.toUpperCase() ||
											"Level TBD"}
									</p>
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-2">
								<Link href={`/admin/students/${enrollment.student_id}`}>
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
											Edit Enrollment
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => setShowDeleteDialog(true)}
											className="text-destructive"
										>
											<Trash className="mr-2 h-4 w-4" />
											Delete Enrollment
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
											Enrolled Date
										</p>
										<p className="font-medium text-sm">
											{format(new Date(enrollment.created_at), "MMM d, yyyy")}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-muted-foreground text-xs">Start Date</p>
										<p className="font-medium text-sm">
											{enrollment.cohorts?.start_date
												? formatDate(
														enrollment.cohorts.start_date,
														"MMM d, yyyy",
													)
												: "Not scheduled"}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-muted-foreground text-xs">
											Cohort Status
										</p>
										<p className="font-medium text-sm">
											{enrollment.cohorts?.cohort_status?.replace(/_/g, " ") ||
												"Unknown"}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-muted-foreground text-xs">Room Type</p>
										<p className="font-medium text-sm">
											{enrollment.cohorts?.room_type?.replace(/_/g, " ") ||
												"Not set"}
										</p>
									</div>
								</div>
							</div>

							<div className="space-y-4 px-6 py-4">
								{/* Enrollment Status Section */}
								<EditableSection
									title="Enrollment Status"
									onEditStart={() => {
										// Reset to current values when starting to edit
										setEditedEnrollment(enrollment);
									}}
									onSave={saveAllChanges}
									onCancel={() => {
										// Reset to original values when canceling
										setEditedEnrollment(enrollment);
									}}
								>
									{(editing) => (
										<div className="grid gap-8 lg:grid-cols-2">
											<div className="space-y-4">
												<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
													Status Information
												</h3>
												<div className="space-y-3">
													<div className="flex items-start gap-3">
														<CheckCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
														<div className="flex-1 space-y-0.5">
															<p className="text-muted-foreground text-xs">
																Enrollment Status:
															</p>
															{editing ? (
																<InlineEditField
																	value={editedEnrollment.status}
																	onSave={(value) =>
																		updateEditedField("status", value)
																	}
																	editing={editing}
																	type="select"
																	options={statusOptions}
																/>
															) : (
																<Badge
																	variant={
																		(statusColors as any)[enrollment.status]
																	}
																	className="mt-1"
																>
																	{(statusLabels as any)[enrollment.status]}
																</Badge>
															)}
														</div>
													</div>

													<div className="flex items-start gap-3">
														<Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
														<div className="flex-1 space-y-0.5">
															<p className="text-muted-foreground text-xs">
																Enrolled Date:
															</p>
															<p className="font-medium text-sm">
																{format(
																	new Date(enrollment.created_at),
																	"MMMM d, yyyy",
																)}
															</p>
														</div>
													</div>

													<div className="flex items-start gap-3">
														<Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
														<div className="flex-1 space-y-0.5">
															<p className="text-muted-foreground text-xs">
																Last Updated:
															</p>
															<p className="font-medium text-sm">
																{format(
																	new Date(
																		enrollment.updated_at ||
																			enrollment.created_at,
																	),
																	"MMMM d, yyyy",
																)}
															</p>
														</div>
													</div>
												</div>
											</div>

											<div className="space-y-4">
												<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
													System Information
												</h3>
												<div className="space-y-3">
													<div className="flex items-start gap-3">
														<AlertCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
														<div className="flex-1 space-y-0.5">
															<p className="text-muted-foreground text-xs">
																Enrollment ID:
															</p>
															<p className="font-mono text-muted-foreground text-sm">
																{enrollment.id}
															</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</EditableSection>

								{/* Tabs for Student and Cohort Information */}
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
												value="cohort"
												className="flex items-center gap-2"
											>
												<School className="h-3.5 w-3.5" />
												Cohort Info
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
																			{enrollment.students?.full_name}
																		</p>
																		<Link
																			href={`/admin/students/${enrollment.student_id}`}
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
																		{enrollment.students?.email ||
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
																		{enrollment.students?.mobile_phone_number ||
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
																		{enrollment.students?.city ||
																			"Not provided"}
																	</p>
																</div>
															</div>
														</div>
													</div>
												</CardContent>
											</Card>
										</TabsContent>

										{/* Cohort Information Tab */}
										<TabsContent value="cohort" className="mt-4">
											<Card className="border-border/50">
												<CardHeader className="pb-3">
													<CardTitle className="text-base">
														Cohort Information
													</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="grid gap-6 lg:grid-cols-2">
														<div className="space-y-3">
															<div className="flex items-start gap-3">
																<Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-muted-foreground text-xs">
																		Format:
																	</p>
																	<p className="font-medium text-sm">
																		{enrollment.cohorts?.products?.format ===
																		"group"
																			? "Group Class"
																			: "Private Class"}
																	</p>
																</div>
															</div>

															<div className="flex items-start gap-3">
																<GraduationCap className="mt-0.5 h-4 w-4 text-muted-foreground" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-muted-foreground text-xs">
																		Starting Level:
																	</p>
																	<p className="font-medium text-sm">
																		{enrollment.cohorts?.starting_level
																			?.display_name ||
																			enrollment.cohorts?.starting_level?.code?.toUpperCase() ||
																			"Not set"}
																	</p>
																</div>
															</div>

															<div className="flex items-start gap-3">
																<GraduationCap className="mt-0.5 h-4 w-4 text-muted-foreground" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-muted-foreground text-xs">
																		Current Level:
																	</p>
																	<p className="font-medium text-sm">
																		{enrollment.cohorts?.current_level
																			?.display_name ||
																			enrollment.cohorts?.current_level?.code?.toUpperCase() ||
																			"Not set"}
																	</p>
																</div>
															</div>
														</div>

														<div className="space-y-3">
															<div className="flex items-start gap-3">
																<Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-muted-foreground text-xs">
																		Start Date:
																	</p>
																	<p className="font-medium text-sm">
																		{enrollment.cohorts?.start_date
																			? format(
																					new Date(
																						enrollment.cohorts.start_date,
																					),
																					"MMMM d, yyyy",
																				)
																			: "Not scheduled"}
																	</p>
																</div>
															</div>

															<div className="flex items-start gap-3">
																<Building className="mt-0.5 h-4 w-4 text-muted-foreground" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-muted-foreground text-xs">
																		Room Type:
																	</p>
																	<p className="font-medium text-sm">
																		{enrollment.cohorts?.room_type?.replace(
																			/_/g,
																			" ",
																		) || "Not set"}
																	</p>
																</div>
															</div>

															<div className="flex items-start gap-3">
																<CheckCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-muted-foreground text-xs">
																		Cohort Status:
																	</p>
																	<Badge variant="outline" className="mt-1">
																		{enrollment.cohorts?.cohort_status?.replace(
																			/_/g,
																			" ",
																		) || "Unknown"}
																	</Badge>
																</div>
															</div>
														</div>
													</div>
												</CardContent>
											</Card>
										</TabsContent>
									</Tabs>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Enrollment</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this enrollment? This action
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
