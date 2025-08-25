import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
	ArrowLeft, 
	Edit, 
	Mail, 
	Phone, 
	MapPin, 
	Calendar,
	GraduationCap,
	Target,
	MessageSquare,
	User,
	Hash,
	Clock,
	CreditCard,
	ChevronRight,
	Trash2,
	UserCheck,
	BookOpen,
	ClipboardCheck,
	MoreVertical,
	Activity,
	AlertCircle,
	Baby,
	Zap,
	UserCircle
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

async function getStudent(id: string) {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
	const response = await fetch(`${baseUrl}/api/students/${id}`, {
		cache: "no-store",
	});

	if (!response.ok) {
		return null;
	}

	return response.json();
}

export default async function StudentDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const student = await getStudent(id);

	if (!student) {
		notFound();
	}

	// Calculate student metrics (would come from actual data)
	const enrollmentCount = 1; // Would be calculated from actual enrollments
	const assessmentCount = 0; // Would be calculated from actual assessments
	const lastActivity = student.updated_at; // Would come from activity log
	const isActive = true; // Would be calculated from enrollment status

	// Get initials for avatar
	const initials = student.full_name
		.split(' ')
		.map((n: string) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);

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
								<div className="flex items-center gap-2 mt-0.5">
									<Badge variant={isActive ? "success" : "secondary"} className="h-4 text-[10px] px-1.5">
										{isActive ? "Active" : "Inactive"}
									</Badge>
									<span className="text-xs text-muted-foreground">
										{enrollmentCount} enrollment{enrollmentCount !== 1 ? 's' : ''} • 
										{assessmentCount} assessment{assessmentCount !== 1 ? 's' : ''}
									</span>
								</div>
							</div>
						</div>
						
						<div className="flex items-center gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm">
										<MoreVertical className="h-3.5 w-3.5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuItem>
										<MessageSquare className="mr-2 h-3.5 w-3.5" />
										Activate Touchpoint
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem className="text-destructive">
										<Trash2 className="mr-2 h-3.5 w-3.5" />
										Delete Student
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							
							<Link href={`/admin/students/${id}/edit`}>
								<Button size="sm">
									<Edit className="mr-1.5 h-3.5 w-3.5" />
									Edit
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>

			<div className="px-6 py-4 space-y-4">
				{/* Student Information at the top - Full width with better spacing */}
				<Card className="bg-background">
					<CardHeader className="pb-4">
						<CardTitle className="text-base font-medium">Student Information</CardTitle>
					</CardHeader>
					<CardContent>
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
												<p className="text-sm font-medium break-all">{student.email || "—"}</p>
												{student.email && (
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
												<p className="text-sm font-medium">{student.mobile_phone_number || "—"}</p>
												{student.mobile_phone_number && (
													<CopyButton text={student.mobile_phone_number} label="Phone" />
												)}
											</div>
										</div>
									</div>
									
									<div className="flex items-start gap-3">
										<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">City:</p>
											<p className="text-sm font-medium">{student.city || "—"}</p>
										</div>
									</div>
									
									<div className="flex items-start gap-3">
										<MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Default Communication Channel:</p>
											{student.communication_channel ? (
												<Badge variant="outline" className="h-5 text-xs">
													{student.communication_channel.replace("_", " + ").toUpperCase()}
												</Badge>
											) : <p className="text-sm font-medium">—</p>}
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
											{student.desired_starting_language_level ? (
												<Badge variant="outline" className="h-5 text-xs">
													{student.desired_starting_language_level.toUpperCase()}
												</Badge>
											) : <p className="text-sm font-medium">—</p>}
										</div>
									</div>
									
									<div className="flex items-start gap-3">
										<UserCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Registered as Beginner (A0)?</p>
											<Badge variant={student.is_full_beginner ? "info" : "secondary"} className="h-5 text-xs">
												{student.is_full_beginner ? "Yes" : "No"}
											</Badge>
										</div>
									</div>
									
									{student.subjective_deadline_for_student && (
										<div className="flex items-start gap-3">
											<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
											<div className="flex-1 space-y-0.5">
												<p className="text-xs text-muted-foreground">Target Date:</p>
												<p className="text-sm font-medium">{format(new Date(student.subjective_deadline_for_student), "MMM d, yyyy")}</p>
											</div>
										</div>
									)}
									
									<div className="flex items-start gap-3">
										<Baby className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1 space-y-0.5">
											<p className="text-xs text-muted-foreground">Under 16:</p>
											<Badge variant={student.is_under_16 ? "warning" : "secondary"} className="h-5 text-xs">
												{student.is_under_16 ? "Yes" : "No"}
											</Badge>
										</div>
									</div>
									
									{student.purpose_to_learn && (
										<div className="flex items-start gap-3">
											<Target className="h-4 w-4 text-muted-foreground mt-0.5" />
											<div className="flex-1 space-y-0.5">
												<p className="text-xs text-muted-foreground">Purpose:</p>
												<p className="text-sm font-medium">{student.purpose_to_learn}</p>
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
									
									{student.initial_channel && (
										<div className="flex items-start gap-3">
											<Zap className="h-4 w-4 text-muted-foreground mt-0.5" />
											<div className="flex-1 space-y-0.5">
												<p className="text-xs text-muted-foreground">Initial Channel:</p>
												<p className="text-sm font-medium">{student.initial_channel}</p>
											</div>
										</div>
									)}
								</div>

								{/* External Integrations */}
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
											{student.convertkit_id && (
												<div className="flex items-start gap-3">
													<Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
													<div className="flex-1 space-y-0.5">
														<p className="text-xs text-muted-foreground">ConvertKit:</p>
														<code className="text-xs bg-muted px-1.5 py-0.5 rounded">{student.convertkit_id}</code>
													</div>
												</div>
											)}
											{student.openphone_contact_id && (
												<div className="flex items-start gap-3">
													<Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
													<div className="flex-1 space-y-0.5">
														<p className="text-xs text-muted-foreground">OpenPhone:</p>
														<code className="text-xs bg-muted px-1.5 py-0.5 rounded">
															{student.openphone_contact_id.slice(0, 14)}...
														</code>
													</div>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Academic & Progress Tabs */}
				<div className="mt-6">
					<Tabs defaultValue="enrollments" className="w-full">
						<div className="flex items-center justify-between mb-4">
							<TabsList className="grid grid-cols-3 w-[400px]">
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
										<Link href={`/admin/students/${id}/enrollments/new`}>
											<Button size="sm">
												<BookOpen className="mr-1.5 h-3.5 w-3.5" />
												Add Enrollment
											</Button>
										</Link>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<StudentEnrollments studentId={id} />
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
										<Link href={`/admin/students/${id}/assessments/new`}>
											<Button size="sm">
												<ClipboardCheck className="mr-1.5 h-3.5 w-3.5" />
												Schedule Assessment
											</Button>
										</Link>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									{assessmentCount === 0 ? (
										<div className="text-center py-8 text-muted-foreground">
											<ClipboardCheck className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
											<p className="text-sm font-medium mb-1">No assessments yet</p>
											<p className="text-xs">Schedule an assessment to evaluate the student's language level</p>
										</div>
									) : (
										<StudentAssessments studentId={id} />
									)}
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
									<StudentAttendance studentId={id} />
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
							{student.airtable_record_id && (
								<div className="flex items-center gap-2">
									<span>Airtable:</span>
									<code className="bg-muted/50 px-1.5 py-0.5 rounded font-mono">{student.airtable_record_id}</code>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}