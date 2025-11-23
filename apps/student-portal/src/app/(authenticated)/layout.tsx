import { redirect } from "next/navigation";

import { getUser } from "@/queries/getUser";

import { createClient } from "@/lib/supabase/server";

interface StudentData {
	id: string;
	full_name: string;
	email: string;
}

export default async function AuthenticatedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getUser();

	if (!session?.user) {
		redirect("/");
	}

	// Check if user is banned
	const supabase = await createClient();
	const { data: user } = await supabase
		.from("user")
		.select("banned, banReason")
		.eq("id", session.user.id)
		.single();

	if (user?.banned) {
		redirect("/?error=access_revoked");
	}

	// Verify user is a student
	const { data: student } = await supabase
		.from("students")
		.select("id, full_name, email")
		.eq("user_id", session.user.id)
		.single();

	if (!student) {
		// User exists but is not linked to a student record
		redirect("/?error=not_a_student");
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-50 w-full border-border/40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex h-14 max-w-screen-2xl items-center">
					<div className="flex flex-1 items-center justify-between">
						<div className="flex items-center gap-2">
							<span className="font-semibold">Student Portal</span>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-muted-foreground text-sm">
								{student.full_name}
							</span>
						</div>
					</div>
				</div>
			</header>
			<main className="container max-w-screen-2xl py-6">{children}</main>
		</div>
	);
}
