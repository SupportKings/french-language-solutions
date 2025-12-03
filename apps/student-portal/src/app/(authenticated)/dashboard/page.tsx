import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { announcementQueries } from "@/features/announcements/queries";
import {
	AnnouncementsPreviewCard,
	CohortDetailsCard,
	ScheduleSection,
	StatsCards,
	WelcomeHeader,
} from "@/features/dashboard/components";
import {
	getCohortDetails,
	getStudentEnrollments,
	getStudentStats,
} from "@/features/dashboard/queries";
import { getScheduleClasses } from "@/features/schedule/queries";

import { getUser } from "@/queries/getUser";

import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";

export default async function DashboardPage() {
	const session = await getUser();

	if (!session?.user) {
		redirect("/");
	}

	const supabase = await createClient();
	const { data: student } = await supabase
		.from("students")
		.select("id, full_name, first_name, email")
		.eq("user_id", session.user.id)
		.single();

	if (!student) {
		redirect("/");
	}

	// Fetch enrollments to get cohort IDs
	const enrollments = await getStudentEnrollments(student.id);
	const cohortIds = enrollments.map((e) => e.cohortId);

	// Prefetch announcements and fetch stats/classes/cohort details in parallel
	const queryClient = new QueryClient();
	const [, stats, classes, cohortDetails] = await Promise.all([
		queryClient.prefetchQuery(
			announcementQueries.studentAnnouncements(student.id),
		),
		getStudentStats(student.id, cohortIds),
		getScheduleClasses(cohortIds, student.id),
		getCohortDetails(student.id),
	]);

	const displayName = student.first_name || student.full_name || "Student";

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div className="space-y-6">
				{/* Welcome Header */}
				<WelcomeHeader studentName={displayName} stats={stats} />

				{/* Cohort Details */}
				{cohortDetails && <CohortDetailsCard details={cohortDetails} />}

				{/* Main Content Grid */}
				<div className="grid gap-6 xl:grid-cols-[1fr_320px]">
					{/* Main Column - Schedule */}
					<div className="space-y-6">
						<ScheduleSection classes={classes} />
					</div>

					{/* Right Sidebar - Announcements */}
					<div className="space-y-6">
						<AnnouncementsPreviewCard studentId={student.id} />
					</div>
				</div>
			</div>
		</HydrationBoundary>
	);
}
