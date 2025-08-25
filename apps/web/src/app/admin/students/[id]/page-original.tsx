import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { StudentEnrollments } from "@/features/students/components/StudentEnrollments";
import { StudentAssessments } from "@/features/students/components/StudentAssessments";

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

	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link href="/admin/students">
						<Button variant="ghost" size="icon">
							<ArrowLeft className="h-4 w-4" />
						</Button>
					</Link>
					<div>
						<h1 className="text-2xl font-bold">{student.full_name}</h1>
						<p className="text-muted-foreground">Student Details</p>
					</div>
				</div>
				<Link href={`/admin/students/${id}/edit`}>
					<Button>
						<Edit className="mr-2 h-4 w-4" />
						Edit Student
					</Button>
				</Link>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<div className="md:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Full Name</p>
									<p className="text-base">{student.full_name}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Email</p>
									<p className="text-base flex items-center gap-2">
										{student.email ? (
											<>
												<Mail className="h-4 w-4 text-muted-foreground" />
												{student.email}
											</>
										) : (
											<span className="text-muted-foreground">Not provided</span>
										)}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Phone</p>
									<p className="text-base flex items-center gap-2">
										{student.mobile_phone_number ? (
											<>
												<Phone className="h-4 w-4 text-muted-foreground" />
												{student.mobile_phone_number}
											</>
										) : (
											<span className="text-muted-foreground">Not provided</span>
										)}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">City</p>
									<p className="text-base flex items-center gap-2">
										{student.city ? (
											<>
												<MapPin className="h-4 w-4 text-muted-foreground" />
												{student.city}
											</>
										) : (
											<span className="text-muted-foreground">Not provided</span>
										)}
									</p>
								</div>
							</div>

							<div className="border-t pt-4">
								<h3 className="font-semibold mb-3">Learning Details</h3>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm font-medium text-muted-foreground">Desired Level</p>
										<Badge variant="outline" className="mt-1">
											{student.desired_starting_language_level?.toUpperCase() || "Not specified"}
										</Badge>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">Full Beginner</p>
										<Badge variant={student.is_full_beginner ? "default" : "secondary"}>
											{student.is_full_beginner ? "Yes" : "No"}
										</Badge>
									</div>
									<div className="col-span-2">
										<p className="text-sm font-medium text-muted-foreground">Purpose to Learn</p>
										<p className="text-base mt-1">
											{student.purpose_to_learn || <span className="text-muted-foreground">Not provided</span>}
										</p>
									</div>
									{student.subjective_deadline_for_student && (
										<div>
											<p className="text-sm font-medium text-muted-foreground">Target Deadline</p>
											<p className="text-base flex items-center gap-2">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												{format(new Date(student.subjective_deadline_for_student), "PPP")}
											</p>
										</div>
									)}
								</div>
							</div>

							<div className="border-t pt-4">
								<h3 className="font-semibold mb-3">Communication Preferences</h3>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm font-medium text-muted-foreground">Preferred Channel</p>
										<Badge>{student.communication_channel?.replace("_", " + ").toUpperCase()}</Badge>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">Newsletter</p>
										<Badge variant={student.added_to_email_newsletter ? "default" : "secondary"}>
											{student.added_to_email_newsletter ? "Subscribed" : "Not Subscribed"}
										</Badge>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">Initial Channel</p>
										<p className="text-base">{student.initial_channel || "Not specified"}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">Under 16</p>
										<Badge variant={student.is_under_16 ? "destructive" : "secondary"}>
											{student.is_under_16 ? "Yes" : "No"}
										</Badge>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>System Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Student ID</p>
								<p className="text-xs font-mono">{student.id}</p>
							</div>
							{student.user_id && (
								<div>
									<p className="text-sm font-medium text-muted-foreground">User ID</p>
									<p className="text-xs font-mono">{student.user_id}</p>
								</div>
							)}
							<div>
								<p className="text-sm font-medium text-muted-foreground">Created</p>
								<p className="text-sm">{format(new Date(student.created_at), "PPp")}</p>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">Last Updated</p>
								<p className="text-sm">{format(new Date(student.updated_at), "PPp")}</p>
							</div>
						</CardContent>
					</Card>

					{(student.stripe_customer_id || student.convertkit_id || student.openphone_contact_id) && (
						<Card>
							<CardHeader>
								<CardTitle>External IDs</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{student.stripe_customer_id && (
									<div>
										<p className="text-sm font-medium text-muted-foreground">Stripe</p>
										<p className="text-xs font-mono">{student.stripe_customer_id}</p>
									</div>
								)}
								{student.convertkit_id && (
									<div>
										<p className="text-sm font-medium text-muted-foreground">ConvertKit</p>
										<p className="text-xs font-mono">{student.convertkit_id}</p>
									</div>
								)}
								{student.openphone_contact_id && (
									<div>
										<p className="text-sm font-medium text-muted-foreground">OpenPhone</p>
										<p className="text-xs font-mono">{student.openphone_contact_id}</p>
									</div>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			</div>

			<Tabs defaultValue="enrollments" className="w-full">
				<TabsList>
					<TabsTrigger value="enrollments">Enrollments</TabsTrigger>
					<TabsTrigger value="assessments">Assessments</TabsTrigger>
					<TabsTrigger value="activity">Activity</TabsTrigger>
				</TabsList>
				<TabsContent value="enrollments" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Enrollments</CardTitle>
						</CardHeader>
						<CardContent>
							<StudentEnrollments studentId={id} />
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="assessments" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Assessments</CardTitle>
						</CardHeader>
						<CardContent>
							<StudentAssessments studentId={id} />
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="activity" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Recent Activity</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">No recent activity</p>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}