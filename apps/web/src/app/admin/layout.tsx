import { redirect } from "next/navigation";

import { rolesMap } from "@/lib/permissions";

import { PageHeader } from "@/components/admin/page-header";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { getUser } from "@/queries/getUser";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getUser();

	if (!session) {
		redirect("/");
	}

	// Get user's role and permissions
	const userRole = session.user.role || "teacher";
	const rolePermissions = rolesMap[userRole as keyof typeof rolesMap];
	const rawPermissions = rolePermissions?.statements || {};

	return (
		<SidebarProvider>
			<AppSidebar
				session={session}
				rawPermissions={rawPermissions}
				isAdmin={true}
			/>
			<SidebarInset>
				<PageHeader />

				{/* Page Content */}
				<div className="flex flex-1 flex-col gap-4">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
