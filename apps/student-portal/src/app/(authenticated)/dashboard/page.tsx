import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";

import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
	const session = await getUser();

	if (!session?.user) {
		redirect("/");
	}

	const supabase = await createClient();
	const { data: student } = await supabase
		.from("students")
		.select("id, full_name, email")
		.eq("user_id", session.user.id)
		.single();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">
					Welcome, {student?.full_name || "Student"}
				</h1>
				<p className="text-muted-foreground">
					Your learning dashboard for French Language Solutions
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
					<h3 className="font-semibold text-lg">My Courses</h3>
					<p className="text-muted-foreground text-sm">
						View your enrolled courses and progress
					</p>
				</div>

				<div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
					<h3 className="font-semibold text-lg">Upcoming Sessions</h3>
					<p className="text-muted-foreground text-sm">
						See your scheduled class sessions
					</p>
				</div>

				<div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
					<h3 className="font-semibold text-lg">My Progress</h3>
					<p className="text-muted-foreground text-sm">
						Track your learning journey
					</p>
				</div>
			</div>
		</div>
	);
}
