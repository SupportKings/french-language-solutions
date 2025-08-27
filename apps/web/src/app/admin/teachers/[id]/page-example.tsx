import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	DetailViewLayout,
	DetailViewHeader,
	DetailViewContent,
	RelatedDataCard,
	InfoSection,
	InfoField,
	OverviewCard,
	SystemInfoCard
} from "@/components/detail-view/DetailViewLayout";
import { 
	Mail, 
	Phone, 
	MapPin,
	Calendar,
	Briefcase,
	Clock,
	Video,
	Shield,
	BookOpen,
	UserCheck,
	Trash2,
	MessageSquare,
	ClipboardCheck
} from "lucide-react";
import { format } from "date-fns";

// This would come from your API
async function getTeacher(id: string) {
	// Fetch teacher data
	const teacher = {
		id: "abc123",
		first_name: "John",
		last_name: "Doe",
		email: "john.doe@example.com",
		mobile_phone_number: "+1234567890",
		city: "Paris",
		onboarding_status: "onboarded",
		contract_type: "full_time",
		available_for_booking: true,
		qualified_for_under_16: true,
		available_for_online_classes: true,
		available_for_in_person_classes: true,
		maximum_hours_per_week: 35,
		maximum_hours_per_day: 8,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};
	return teacher;
}

export default async function TeacherDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const teacher = await getTeacher(id);

	if (!teacher) {
		notFound();
	}

	// Calculate metrics
	const classCount = 12; // Would come from actual data
	const studentCount = 45; // Would come from actual data
	const hoursThisWeek = 28; // Would come from actual data

	// Get initials for avatar
	const initials = `${teacher.first_name[0]}${teacher.last_name[0]}`.toUpperCase();

	return (
		<DetailViewLayout>
			{/* Header */}
			<DetailViewHeader
				backUrl="/admin/teachers"
				backLabel="Teachers"
				title={`${teacher.first_name} ${teacher.last_name}`}
				avatar={{ initials }}
				badges={[
					{ 
						label: teacher.onboarding_status === "onboarded" ? "Active" : "Inactive",
						variant: teacher.onboarding_status === "onboarded" ? "success" : "secondary"
					},
					...(teacher.qualified_for_under_16 ? [{ 
						label: "U16 Qualified",
						variant: "info" as const
					}] : [])
				]}
				stats={`${classCount} classes • ${studentCount} students`}
				actions={[
					{
						icon: MessageSquare,
						label: "Send Message",
						onClick: () => console.log("Send message")
					},
					{
						icon: ClipboardCheck,
						label: "Schedule Assessment",
						href: `/admin/teachers/${id}/assessments/new`
					},
					{
						icon: BookOpen,
						label: "Assign to Class",
						onClick: () => console.log("Assign to class")
					},
					{
						icon: Trash2,
						label: "Delete Teacher",
						onClick: () => console.log("Delete"),
						destructive: true
					}
				]}
				editUrl={`/admin/teachers/${id}/edit`}
			/>

			{/* Content */}
			<DetailViewContent>
				{/* Classes and Schedule at the top */}
				<div className="grid gap-4 lg:grid-cols-2">
					<RelatedDataCard
						title="Classes"
						subtitle={`${classCount} active classes`}
						actionLabel="View All"
						actionIcon={BookOpen}
						actionHref={`/admin/teachers/${id}/classes`}
					>
						{/* Class list component would go here */}
						<div className="text-center py-4 text-muted-foreground">
							<p className="text-xs">Class schedule will appear here</p>
						</div>
					</RelatedDataCard>

					<RelatedDataCard
						title="Availability"
						subtitle="Weekly schedule"
						actionLabel="Edit"
						actionIcon={Calendar}
						actionHref={`/admin/teachers/${id}/availability`}
					>
						{/* Availability component would go here */}
						<div className="text-center py-4 text-muted-foreground">
							<p className="text-xs">Availability calendar will appear here</p>
						</div>
					</RelatedDataCard>
				</div>

				{/* Main Info and Sidebar */}
				<div className="grid gap-4 lg:grid-cols-3">
					{/* Main Content - 2 columns */}
					<div className="lg:col-span-2 space-y-4">
						<Card className="bg-background">
							<CardHeader className="py-3">
								<CardTitle className="text-sm">Teacher Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Contact Section */}
								<InfoSection title="Contact" icon={Mail}>
									<InfoField label="Email" value={teacher.email} icon={Mail} />
									<InfoField label="Phone" value={teacher.mobile_phone_number} icon={Phone} />
									<InfoField label="City" value={teacher.city} icon={MapPin} />
								</InfoSection>

								{/* Employment Section */}
								<div className="border-t pt-4">
									<InfoSection title="Employment" icon={Briefcase}>
										<InfoField 
											label="Contract" 
											value={
												<Badge variant="outline" className="h-5 text-xs px-1.5">
													{teacher.contract_type === "full_time" ? "Full Time" : "Freelancer"}
												</Badge>
											} 
											icon={Briefcase} 
										/>
										<InfoField 
											label="Status" 
											value={
												<Badge variant={teacher.onboarding_status === "onboarded" ? "success" : "warning"} className="h-5 text-xs px-1.5">
													{teacher.onboarding_status === "onboarded" ? "Onboarded" : "Training"}
												</Badge>
											} 
											icon={UserCheck} 
										/>
										<InfoField label="Max Hours/Week" value={`${teacher.maximum_hours_per_week}h`} icon={Clock} />
										<InfoField label="Max Hours/Day" value={`${teacher.maximum_hours_per_day}h`} icon={Clock} />
									</InfoSection>
								</div>

								{/* Qualifications Section */}
								<div className="border-t pt-4">
									<InfoSection title="Qualifications">
										<div className="flex flex-wrap gap-2">
											{teacher.available_for_booking && (
												<Badge variant="success" className="h-5 text-xs px-2">
													Available for Booking
												</Badge>
											)}
											{teacher.qualified_for_under_16 && (
												<Badge variant="info" className="h-5 text-xs px-2">
													<Shield className="mr-1 h-3 w-3" />
													Under 16 Qualified
												</Badge>
											)}
											{teacher.available_for_online_classes && (
												<Badge variant="outline" className="h-5 text-xs px-2">
													<Video className="mr-1 h-3 w-3" />
													Online Classes
												</Badge>
											)}
											{teacher.available_for_in_person_classes && (
												<Badge variant="outline" className="h-5 text-xs px-2">
													<MapPin className="mr-1 h-3 w-3" />
													In-Person Classes
												</Badge>
											)}
										</div>
									</InfoSection>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar - 1 column */}
					<div className="space-y-4">
						{/* Overview */}
						<OverviewCard
							items={[
								{
									label: "Classes",
									value: classCount,
									icon: BookOpen,
									badge: classCount > 0 ? { label: "Active", variant: "success" } : undefined
								},
								{
									label: "Students",
									value: studentCount,
									icon: UserCheck
								},
								{
									label: "Hours This Week",
									value: `${hoursThisWeek}/${teacher.maximum_hours_per_week}`,
									icon: Clock
								}
							]}
						/>

						{/* System Info */}
						<SystemInfoCard
							id={teacher.id}
							createdAt={format(new Date(teacher.created_at), "MMM d, yyyy")}
							updatedAt={format(new Date(teacher.updated_at), "MMM d, yyyy")}
						/>
					</div>
				</div>
			</DetailViewContent>
		</DetailViewLayout>
	);
}