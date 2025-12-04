import { redirect } from "next/navigation";

import { rolesMap } from "@/lib/permissions";

import { PageHeader } from "@/components/admin/page-header";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { getUnreadChatCount } from "@/features/chats/queries/getUnreadChatCount";

import { getUser } from "@/queries/getUser";

// Allowed roles for admin portal
const ALLOWED_ROLES = ["admin", "teacher"];

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Get user's role and verify they have access to admin portal
	const userRole = session.user.role || "";

	// Reject users without admin/teacher role (e.g., students)
	if (!ALLOWED_ROLES.includes(userRole)) {
		redirect("/?error=unauthorized");
	}

	const rolePermissions = rolesMap[userRole as keyof typeof rolesMap];
	const rawPermissions = rolePermissions?.statements || {};

	// Fetch unread chat count
	const unreadChatCount = await getUnreadChatCount(session.user.id);

	return (
		<SidebarProvider>
			<AppSidebar
				session={session}
				rawPermissions={rawPermissions}
				isAdmin={true}
				unreadChatCount={unreadChatCount}
			/>
			<SidebarInset>
				<PageHeader />

				{/* Page Content */}
				<div className="flex flex-1 flex-col gap-4">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
