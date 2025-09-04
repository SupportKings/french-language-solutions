import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

import { format } from "date-fns";
import {
	BookOpen,
	Calendar,
	GraduationCap,
	MapPin,
	School,
	Users,
} from "lucide-react";

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
		const [hours, minutes] = timeString.split(":");
		const hour = Number.parseInt(hours);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	} catch {
		return timeString;
	}
};

interface EnrollmentCohortSectionProps {
	cohort: any;
}

export function EnrollmentCohortSection({
	cohort,
}: EnrollmentCohortSectionProps) {
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
					<p className="text-muted-foreground">
						No cohort information available
					</p>
				</CardContent>
			</Card>
		);
	}

	const dayOrder = [
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
		"sunday",
	];
	const sortedSessions =
		cohort.weekly_sessions?.sort((a: any, b: any) => {
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
						<p className="font-medium text-sm">
							{cohort.product?.display_name || "Not set"}
						</p>
					</div>
					<div>
						<div className="font-medium text-muted-foreground text-sm">
							Product Format
						</div>
						<p className="text-sm capitalize">
							{cohort.product?.format || "Not set"}
						</p>
					</div>
					<div>
						<div className="font-medium text-muted-foreground text-sm">
							Location
						</div>
						<p className="text-sm capitalize">
							{cohort.product?.location || "Not set"}
						</p>
					</div>
					<div>
						<div className="font-medium text-muted-foreground text-sm">
							Room Type
						</div>
						<p className="text-sm capitalize">
							{cohort.room_type?.replace(/_/g, " ") || "Not set"}
						</p>
					</div>
				</div>

				{/* Level Information */}
				<div className="grid gap-4 md:grid-cols-2">
					<div className="flex items-start gap-2">
						<BookOpen className="mt-0.5 h-4 w-4 text-muted-foreground" />
						<div>
							<div className="font-medium text-muted-foreground text-sm">
								Starting Level
							</div>
							<p className="font-medium text-sm">
								{cohort.starting_level?.display_name || "Not set"}
								{cohort.starting_level?.code && (
									<span className="ml-2 text-muted-foreground">
										({cohort.starting_level.code})
									</span>
								)}
							</p>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<GraduationCap className="mt-0.5 h-4 w-4 text-muted-foreground" />
						<div>
							<div className="font-medium text-muted-foreground text-sm">
								Current Level
							</div>
							<p className="font-medium text-sm">
								{cohort.current_level?.display_name || "Not set"}
								{cohort.current_level?.code && (
									<span className="ml-2 text-muted-foreground">
										({cohort.current_level.code})
									</span>
								)}
							</p>
						</div>
					</div>
				</div>

				{/* Status and Dates */}
				<div className="grid gap-4 md:grid-cols-2">
					<div className="flex items-start gap-2">
						<Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
						<div>
							<div className="font-medium text-muted-foreground text-sm">
								Start Date
							</div>
							<p className="text-sm">{formatDate(cohort.start_date)}</p>
						</div>
					</div>
					<div className="flex items-start gap-2">
						<Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
						<div>
							<div className="font-medium text-muted-foreground text-sm">
								Cohort Status
							</div>
							<StatusBadge className="mt-1">
								{cohort.cohort_status
									?.replace(/_/g, " ")
									.replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
									"Unknown"}
							</StatusBadge>
						</div>
					</div>
				</div>

				{/* Weekly Sessions */}
				{sortedSessions.length > 0 && (
					<div>
						<h4 className="mb-3 font-medium text-sm">Weekly Sessions</h4>
						<div className="space-y-2">
							{sortedSessions.map((session: any) => (
								<div
									key={session.id}
									className="flex items-center justify-between rounded-lg border p-3"
								>
									<div className="flex items-center gap-4">
										<div>
											<p className="font-medium text-sm capitalize">
												{session.day_of_week}
											</p>
											<p className="text-muted-foreground text-xs">
												{formatTime(session.start_time)} -{" "}
												{formatTime(session.end_time)}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-medium text-sm">
											{session.teacher?.first_name} {session.teacher?.last_name}
										</p>
										<p className="text-muted-foreground text-xs">Teacher</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Student Capacity */}
				{cohort.max_students && (
					<div className="flex items-start gap-2">
						<Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
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
