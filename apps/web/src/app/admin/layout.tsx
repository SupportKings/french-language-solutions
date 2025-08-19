import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-screen bg-background">
			{/* Sidebar */}
			<AdminSidebar />
			
			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Top Header */}
				<header className="h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="flex h-full items-center justify-between px-6">
						<h1 className="text-lg font-semibold">French Language Solutions</h1>
						<div className="flex items-center gap-4">
							{/* Add user menu, notifications, etc. here */}
						</div>
					</div>
				</header>
				
				{/* Page Content */}
				<main className="flex-1 overflow-y-auto">
					{children}
				</main>
			</div>
		</div>
	);
}