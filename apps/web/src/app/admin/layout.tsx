import { PageHeader } from "@/components/admin/page-header";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getUser } from "@/queries/getUser";
import { redirect } from "next/navigation";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getUser();
	
	if (!session) {
		redirect("/sign-in");
	}
	
	return (
		<SidebarProvider>
			<AppSidebar session={session} isAdmin={true} />
			<SidebarInset>
				<PageHeader />

				{/* Page Content */}
				<div className="flex flex-1 flex-col gap-4">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
