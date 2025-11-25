import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { PageHeader, StudentSidebar } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { getUnreadAnnouncementCount } from "@/features/announcements/queries/getUnreadCount";

import { getUser } from "@/queries/getUser";

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
		.select("banned, banReason, image")
		.eq("id", session.user.id)
		.single();

	if (user?.banned) {
		redirect("/?error=access_revoked");
	}

	// Verify user is a student
	const { data: student } = await supabase
		.from("students")
		.select("id, full_name, first_name, email")
		.eq("user_id", session.user.id)
		.single();

	if (!student) {
		redirect("/?error=not_a_student");
	}

	// Get unread announcement count
	const unreadCount = await getUnreadAnnouncementCount(student.id);

	const studentData = {
		id: student.id,
		fullName: student.full_name || "Student",
		email: student.email || "",
		avatar: user?.image || undefined,
	};

	return (
		<SidebarProvider>
			<StudentSidebar student={studentData} unreadAnnouncementCount={unreadCount} />
			<SidebarInset>
				<PageHeader student={studentData} unreadCount={unreadCount} />
				<main className="flex-1 overflow-auto">
					<div className="container max-w-screen-xl py-6 lg:py-8">
						{children}
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
