import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { getUser } from "@/queries/getUser";

export default async function ProfilePage() {
	const session = await getUser();

	if (!session?.user) {
		redirect("/");
	}

	const supabase = await createClient();
	const { data: student } = await supabase
		.from("students")
		.select("*")
		.eq("user_id", session.user.id)
		.single();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">My Profile</h1>
				<p className="text-muted-foreground">
					Manage your account settings and preferences
				</p>
			</div>

			<div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
				<h3 className="mb-4 font-semibold text-lg">Personal Information</h3>
				<dl className="space-y-4">
					<div>
						<dt className="text-muted-foreground text-sm">Full Name</dt>
						<dd className="font-medium">{student?.full_name || "-"}</dd>
					</div>
					<div>
						<dt className="text-muted-foreground text-sm">Email</dt>
						<dd className="font-medium">{session.user.email}</dd>
					</div>
				</dl>
			</div>
		</div>
	);
}
