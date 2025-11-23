import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";

import { createClient } from "@/lib/supabase/server";

import {
	AnnouncementsPreviewCard,
	MiniCalendar,
	ScheduleSection,
	StatsCards,
	TodayWorkplan,
	WelcomeHeader,
} from "@/features/dashboard/components";

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

	const displayName = student?.first_name || student?.full_name || "Student";

	return (
		<div className="space-y-6">
			{/* Welcome Header */}
			<WelcomeHeader studentName={displayName} />

			{/* Stats Cards */}
			<StatsCards />

			{/* Main Content Grid */}
			<div className="grid gap-6 xl:grid-cols-[1fr_320px]">
				{/* Main Column - Schedule */}
				<div className="space-y-6">
					<ScheduleSection />
				</div>

				{/* Right Sidebar - Calendar, Workplan, Announcements */}
				<div className="space-y-6">
					<MiniCalendar />
					<TodayWorkplan />
					<AnnouncementsPreviewCard />
				</div>
			</div>
		</div>
	);
}
