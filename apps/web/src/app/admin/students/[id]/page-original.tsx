import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { StudentAssessments } from "@/features/students/components/StudentAssessments";
import { StudentEnrollments } from "@/features/students/components/StudentEnrollments";

import { format } from "date-fns";
import {
	ArrowLeft,
	Calendar,
	Edit,
	Mail,
	MapPin,
	Phone,
	User,
} from "lucide-react";

import { getApiUrl } from "@/lib/api-utils";

async function getStudent(id: string) {
	const response = await fetch(getApiUrl(`/api/students/${id}`), {
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
						<h1 className="font-bold text-2xl">{student.full_name}</h1>
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
									<p className="font-medium text-muted-foreground text-sm">
										Full Name
									</p>
									<p className="text-base">{student.full_name}</p>
								</div>
								<div>
									<p className="font-medium text-muted-foreground text-sm">
										Email
									</p>
									<p className="flex items-center gap-2 text-base">
										{student.email ? (
											<>
												<Mail className="h-4 w-4 text-muted-foreground" />
												{student.email}
											</>
										) : (
											<span className="text-muted-foreground">
												Not provided
											</span>
										)}
									</p>
								</div>
								<div>
									<p className="font-medium text-muted-foreground text-sm">
										Phone
									</p>
									<p className="flex items-center gap-2 text-base">
										{student.mobile_phone_number ? (
											<>
												<Phone className="h-4 w-4 text-muted-foreground" />
												{student.mobile_phone_number}
											</>
										) : (
											<span className="text-muted-foreground">
												Not provided
											</span>
										)}
									</p>
								</div>
								<div>
									<p className="font-medium text-muted-foreground text-sm">
										City
									</p>
									<p className="flex items-center gap-2 text-base">
										{student.city ? (
											<>
												<MapPin className="h-4 w-4 text-muted-foreground" />
												{student.city}
											</>
										) : (
											<span className="text-muted-foreground">
												Not provided
											</span>
										)}
									</p>
								</div>
							</div>

							<div className="border-t pt-4">
								<h3 className="mb-3 font-semibold">Learning Details</h3>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="font-medium text-muted-foreground text-sm">
											Desired Level
										</p>
										<Badge variant="outline" className="mt-1">
											{student.desired_starting_language_level?.toUpperCase() ||
												"Not specified"}
										</Badge>
									</div>
									<div>
										<p className="font-medium text-muted-foreground text-sm">
											Full Beginner
										</p>
										<Badge
											variant={
												student.is_full_beginner ? "default" : "secondary"
											}
										>
											{student.is_full_beginner ? "Yes" : "No"}
										</Badge>
									</div>
									<div className="col-span-2">
										<p className="font-medium text-muted-foreground text-sm">
											Purpose to Learn
										</p>
										<p className="mt-1 text-base">
											{student.purpose_to_learn || (
												<span className="text-muted-foreground">
													Not provided
												</span>
											)}
										</p>
									</div>
									{student.subjective_deadline_for_student && (
										<div>
											<p className="font-medium text-muted-foreground text-sm">
												Target Deadline
											</p>
											<p className="flex items-center gap-2 text-base">
												<Calendar className="h-4 w-4 text-muted-foreground" />
												{format(
													new Date(student.subjective_deadline_for_student),
													"PPP",
												)}
											</p>
										</div>
									)}
								</div>
							</div>

							<div className="border-t pt-4">
								<h3 className="mb-3 font-semibold">
									Communication Preferences
								</h3>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="font-medium text-muted-foreground text-sm">
											Preferred Channel
										</p>
										<Badge>
											{student.communication_channel
												?.replace("_", " + ")
												.toUpperCase()}
										</Badge>
									</div>
									<div>
										<p className="font-medium text-muted-foreground text-sm">
											Newsletter
										</p>
										<Badge
											variant={
												student.added_to_email_newsletter
													? "default"
													: "secondary"
											}
										>
											{student.added_to_email_newsletter
												? "Subscribed"
												: "Not Subscribed"}
										</Badge>
									</div>
									<div>
										<p className="font-medium text-muted-foreground text-sm">
											Initial Channel
										</p>
										<p className="text-base">
											{student.initial_channel || "Not specified"}
										</p>
									</div>
									<div>
										<p className="font-medium text-muted-foreground text-sm">
											Under 16
										</p>
										<Badge
											variant={
												student.is_under_16 ? "destructive" : "secondary"
											}
										>
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
								<p className="font-medium text-muted-foreground text-sm">
									Student ID
								</p>
								<p className="font-mono text-xs">{student.id}</p>
							</div>
							{student.user_id && (
								<div>
									<p className="font-medium text-muted-foreground text-sm">
										User ID
									</p>
									<p className="font-mono text-xs">{student.user_id}</p>
								</div>
							)}
							<div>
								<p className="font-medium text-muted-foreground text-sm">
									Created
								</p>
								<p className="text-sm">
									{format(new Date(student.created_at), "PPp")}
								</p>
							</div>
							<div>
								<p className="font-medium text-muted-foreground text-sm">
									Last Updated
								</p>
								<p className="text-sm">
									{format(new Date(student.updated_at), "PPp")}
								</p>
							</div>
						</CardContent>
					</Card>

					{(student.stripe_customer_id ||
						student.convertkit_id ||
						student.openphone_contact_id) && (
						<Card>
							<CardHeader>
								<CardTitle>External IDs</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{student.stripe_customer_id && (
									<div>
										<p className="font-medium text-muted-foreground text-sm">
											Stripe
										</p>
										<p className="font-mono text-xs">
											{student.stripe_customer_id}
										</p>
									</div>
								)}
								{student.convertkit_id && (
									<div>
										<p className="font-medium text-muted-foreground text-sm">
											ConvertKit
										</p>
										<p className="font-mono text-xs">{student.convertkit_id}</p>
									</div>
								)}
								{student.openphone_contact_id && (
									<div>
										<p className="font-medium text-muted-foreground text-sm">
											OpenPhone
										</p>
										<p className="font-mono text-xs">
											{student.openphone_contact_id}
										</p>
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
