import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
	AnnouncementsPreviewCard,
	ScheduleSection,
	StatsCards,
	WelcomeHeader,
} from "@/features/dashboard/components";
import {
	getStudentEnrollments,
	getStudentStats,
} from "@/features/dashboard/queries";
import { getScheduleClasses } from "@/features/schedule/queries";

import { getUser } from "@/queries/getUser";

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

	// Fetch stats and classes in parallel
	const [stats, classes] = await Promise.all([
		getStudentStats(student.id, cohortIds),
		getScheduleClasses(cohortIds, student.id),
	]);

	const displayName = student.first_name || student.full_name || "Student";

	return (
		<div className="space-y-6">
			{/* Welcome Header */}
			<WelcomeHeader studentName={displayName} />

			{/* Stats Cards */}
			<StatsCards stats={stats} />

			{/* Main Content Grid */}
			<div className="grid gap-6 xl:grid-cols-[1fr_320px]">
				{/* Main Column - Schedule */}
				<div className="space-y-6">
					<ScheduleSection classes={classes} />
				</div>

				{/* Right Sidebar - Announcements */}
				<div className="space-y-6">
					<AnnouncementsPreviewCard />
				</div>
			</div>
		</div>
	);
}
