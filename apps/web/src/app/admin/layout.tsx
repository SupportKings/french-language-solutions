import { AdminSidebar } from "@/components/admin/sidebar";
import { PageHeader } from "@/components/admin/page-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<AdminSidebar />
			<SidebarInset>
				<PageHeader />
				
				{/* Page Content */}
				<div className="flex flex-1 flex-col gap-4 p-6">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}