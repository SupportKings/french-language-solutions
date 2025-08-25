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
	Building,
	Users,
	Mail,
	Phone,
	MapPin,
	Clock,
	CheckCircle,
	Eye,
	Edit,
	Trash,
	MoreHorizontal,
	ArrowLeft,
	BookOpen,
	UserCircle,
	School,
	AlertCircle
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

export function EnrollmentDetailsClient({ enrollment: initialEnrollment }: EnrollmentDetailsClientProps) {
	const router = useRouter();
	const [enrollment, setEnrollment] = useState(initialEnrollment);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	// Get student initials for avatar
	const studentInitials = enrollment.students?.full_name
		?.split(' ')
		.map((n: string) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2) || 'ST';

	const handleUpdate = async (field: string, value: any) => {
		try {
			const response = await fetch(`/api/enrollments/${enrollment.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ [field]: value }),
			});

			if (!response.ok) throw new Error("Failed to update enrollment");

			const updated = await response.json();
			setEnrollment({ ...enrollment, ...updated });
			toast.success("Enrollment updated successfully");
		} catch (error) {
			console.error("Error updating enrollment:", error);
			toast.error("Failed to update enrollment");
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
			router.push("/admin/students/enrollments");
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
			studentName: enrollment.students?.full_name || '',
			cohortId: enrollment.cohort_id,
		});
		router.push(`/admin/students/enrollments/new?${params.toString()}&edit=${enrollment.id}`);
	};

	return (
		<>
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
				<div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
					{/* Header */}
					<div className="mb-8">
						<Link href="/admin/students/enrollments">
							<Button variant="ghost" size="sm" className="mb-4">
								<ArrowLeft className="mr-2 h-4 w-4" />
								All Enrollments
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
											{enrollment.students?.full_name || 'Enrollment Details'}
										</h1>
										<Badge variant={statusColors[enrollment.status] as any} className="px-3 py-1">
											{statusLabels[enrollment.status]}
										</Badge>
									</div>
									<p className="text-muted-foreground">
										{enrollment.cohorts?.format === 'group' ? 'Group Class' : 'Private Class'} • 
										{' '}{enrollment.cohorts?.starting_level?.toUpperCase() || 'Level TBD'}
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
					<Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-xl">
						<CardContent className="p-0">
							{/* Quick Stats */}
							<div className="border-b border-border/50 bg-muted/30 px-6 py-4">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
									<div className="space-y-1">
										<p className="text-xs text-muted-foreground">Enrolled Date</p>
										<p className="text-sm font-medium">
											{format(new Date(enrollment.created_at), "MMM d, yyyy")}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-xs text-muted-foreground">Start Date</p>
										<p className="text-sm font-medium">
											{enrollment.cohorts?.start_date ? 
												format(new Date(enrollment.cohorts.start_date), "MMM d, yyyy") : 
												"Not scheduled"}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-xs text-muted-foreground">Cohort Status</p>
										<p className="text-sm font-medium">
											{enrollment.cohorts?.cohort_status?.replace(/_/g, ' ') || "Unknown"}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-xs text-muted-foreground">Room Type</p>
										<p className="text-sm font-medium">
											{enrollment.cohorts?.room_type?.replace(/_/g, ' ') || "Not set"}
										</p>
									</div>
								</div>
							</div>

							<div className="px-6 py-4 space-y-4">
								{/* Enrollment Status Section */}
								<EditableSection title="Enrollment Status">
									{(editing) => (
										<div className="grid gap-8 lg:grid-cols-2">
											<div className="space-y-4">
												<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
													Status Information
												</h3>
												<div className="space-y-3">
													<div className="flex items-start gap-3">
														<CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div className="flex-1 space-y-0.5">
															<p className="text-xs text-muted-foreground">Enrollment Status:</p>
															<InlineEditField
																value={enrollment.status}
																onSave={(value) => handleUpdate("status", value)}
																editing={editing}
																type="select"
																options={statusOptions}
																renderValue={(value) => (
																	<Badge variant={statusColors[value] as any} className="mt-1">
																		{statusLabels[value]}
																	</Badge>
																)}
															/>
														</div>
													</div>

													<div className="flex items-start gap-3">
														<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div className="flex-1 space-y-0.5">
															<p className="text-xs text-muted-foreground">Enrolled Date:</p>
															<p className="text-sm font-medium">
																{format(new Date(enrollment.created_at), "MMMM d, yyyy")}
															</p>
														</div>
													</div>

													<div className="flex items-start gap-3">
														<Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div className="flex-1 space-y-0.5">
															<p className="text-xs text-muted-foreground">Last Updated:</p>
															<p className="text-sm font-medium">
																{format(new Date(enrollment.updated_at || enrollment.created_at), "MMMM d, yyyy")}
															</p>
														</div>
													</div>
												</div>
											</div>

											<div className="space-y-4">
												<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
													System Information
												</h3>
												<div className="space-y-3">
													<div className="flex items-start gap-3">
														<AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div className="flex-1 space-y-0.5">
															<p className="text-xs text-muted-foreground">Enrollment ID:</p>
															<p className="text-sm font-mono text-muted-foreground">
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
										<TabsList className="grid grid-cols-2 w-[300px]">
											<TabsTrigger value="student" className="flex items-center gap-2">
												<UserCircle className="h-3.5 w-3.5" />
												Student Info
											</TabsTrigger>
											<TabsTrigger value="cohort" className="flex items-center gap-2">
												<School className="h-3.5 w-3.5" />
												Cohort Info
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
																			{enrollment.students?.full_name}
																		</p>
																		<Link href={`/admin/students/${enrollment.student_id}`}>
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
																		{enrollment.students?.email || "Not provided"}
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
																		{enrollment.students?.mobile_phone_number || "Not provided"}
																	</p>
																</div>
															</div>

															<div className="flex items-start gap-3">
																<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-xs text-muted-foreground">City:</p>
																	<p className="text-sm font-medium">
																		{enrollment.students?.city || "Not provided"}
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
													<CardTitle className="text-base">Cohort Information</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="grid gap-6 lg:grid-cols-2">
														<div className="space-y-3">
															<div className="flex items-start gap-3">
																<Users className="h-4 w-4 text-muted-foreground mt-0.5" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-xs text-muted-foreground">Format:</p>
																	<p className="text-sm font-medium">
																		{enrollment.cohorts?.format === 'group' ? 'Group Class' : 'Private Class'}
																	</p>
																</div>
															</div>

															<div className="flex items-start gap-3">
																<GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-xs text-muted-foreground">Starting Level:</p>
																	<p className="text-sm font-medium">
																		{enrollment.cohorts?.starting_level?.toUpperCase() || "Not set"}
																	</p>
																</div>
															</div>

															<div className="flex items-start gap-3">
																<GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-xs text-muted-foreground">Current Level:</p>
																	<p className="text-sm font-medium">
																		{enrollment.cohorts?.current_level?.toUpperCase() || "Not set"}
																	</p>
																</div>
															</div>
														</div>

														<div className="space-y-3">
															<div className="flex items-start gap-3">
																<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-xs text-muted-foreground">Start Date:</p>
																	<p className="text-sm font-medium">
																		{enrollment.cohorts?.start_date ? 
																			format(new Date(enrollment.cohorts.start_date), "MMMM d, yyyy") : 
																			"Not scheduled"}
																	</p>
																</div>
															</div>

															<div className="flex items-start gap-3">
																<Building className="h-4 w-4 text-muted-foreground mt-0.5" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-xs text-muted-foreground">Room Type:</p>
																	<p className="text-sm font-medium">
																		{enrollment.cohorts?.room_type?.replace(/_/g, ' ') || "Not set"}
																	</p>
																</div>
															</div>

															<div className="flex items-start gap-3">
																<CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
																<div className="flex-1 space-y-0.5">
																	<p className="text-xs text-muted-foreground">Cohort Status:</p>
																	<Badge variant="outline" className="mt-1">
																		{enrollment.cohorts?.cohort_status?.replace(/_/g, ' ') || "Unknown"}
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
							Are you sure you want to delete this enrollment? This action cannot be undone.
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