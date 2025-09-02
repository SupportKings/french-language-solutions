import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";
import { School, Calendar, Users, MapPin, BookOpen, GraduationCap } from "lucide-react";

const formatDate = (dateString: string | null) => {
	if (!dateString) return "Not set";
	try {
		return format(new Date(dateString), "MMM dd, yyyy");
	} catch {
		return "Invalid date";
	}
};

const formatTime = (timeString: string) => {
	if (!timeString) return "";
	try {
		const [hours, minutes] = timeString.split(':');
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	} catch {
		return timeString;
	}
};

interface EnrollmentCohortSectionProps {
	cohort: any;
}

export function EnrollmentCohortSection({ cohort }: EnrollmentCohortSectionProps) {
	if (!cohort) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<School className="h-5 w-5" />
						Cohort Details
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">No cohort information available</p>
				</CardContent>
			</Card>
		);
	}

	const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
	const sortedSessions = cohort.weekly_sessions?.sort((a: any, b: any) => {
		return dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week);
	}) || [];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<School className="h-5 w-5" />
					Cohort Details
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Product Information */}
				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<div className="font-medium text-muted-foreground text-sm">
							Linked Product
						</div>
						<p className="text-sm font-medium">{cohort.product?.display_name || "Not set"}</p>
					</div>
					<div>
						<div className="font-medium text-muted-foreground text-sm">
							Product Format
						</div>
						<p className="text-sm capitalize">{cohort.product?.format || "Not set"}</p>
					</div>
					<div>
						<div className="font-medium text-muted-foreground text-sm">
							Location
						</div>
						<p className="text-sm capitalize">{cohort.product?.location || "Not set"}</p>
					</div>
					<div>
						<div className="font-medium text-muted-foreground text-sm">
							Room Type
						</div>
						<p className="text-sm capitalize">{cohort.room_type?.replace(/_/g, ' ') || "Not set"}</p>
					</div>
				</div>

				{/* Level Information */}
				<div className="grid gap-4 md:grid-cols-2">
					<div className="flex items-start gap-2">
						<BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
						<div>
							<div className="font-medium text-muted-foreground text-sm">
								Starting Level
							</div>
							<p className="text-sm font-medium">
								{cohort.starting_level?.display_name || "Not set"}
								{cohort.starting_level?.code && (
									<span className="text-muted-foreground ml-2">({cohort.starting_level.code})</span>
								)}
							</p>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
						<div>
							<div className="font-medium text-muted-foreground text-sm">
								Current Level
							</div>
							<p className="text-sm font-medium">
								{cohort.current_level?.display_name || "Not set"}
								{cohort.current_level?.code && (
									<span className="text-muted-foreground ml-2">({cohort.current_level.code})</span>
								)}
							</p>
						</div>
					</div>
				</div>

				{/* Status and Dates */}
				<div className="grid gap-4 md:grid-cols-2">
					<div className="flex items-start gap-2">
						<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
						<div>
							<div className="font-medium text-muted-foreground text-sm">
								Start Date
							</div>
							<p className="text-sm">{formatDate(cohort.start_date)}</p>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<Users className="h-4 w-4 text-muted-foreground mt-0.5" />
						<div>
							<div className="font-medium text-muted-foreground text-sm">
								Cohort Status
							</div>
							<StatusBadge className="mt-1">
								{cohort.cohort_status?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Unknown"}
							</StatusBadge>
						</div>
					</div>
				</div>

				{/* Weekly Sessions */}
				{sortedSessions.length > 0 && (
					<div>
						<h4 className="font-medium text-sm mb-3">Weekly Sessions</h4>
						<div className="space-y-2">
							{sortedSessions.map((session: any) => (
								<div key={session.id} className="flex items-center justify-between rounded-lg border p-3">
									<div className="flex items-center gap-4">
										<div>
											<p className="font-medium text-sm capitalize">
												{session.day_of_week}
											</p>
											<p className="text-xs text-muted-foreground">
												{formatTime(session.start_time)} - {formatTime(session.end_time)}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-sm font-medium">
											{session.teacher?.first_name} {session.teacher?.last_name}
										</p>
										<p className="text-xs text-muted-foreground">Teacher</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Student Capacity */}
				{cohort.max_students && (
					<div className="flex items-start gap-2">
						<Users className="h-4 w-4 text-muted-foreground mt-0.5" />
						<div>
							<div className="font-medium text-muted-foreground text-sm">
								Maximum Students
							</div>
							<p className="text-sm">{cohort.max_students} students</p>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}