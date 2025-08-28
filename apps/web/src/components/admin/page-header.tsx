"use client";

import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";

const pageInfo: Record<string, { title: string; description?: string }> = {
	"/admin": {
		title: "Dashboard",
		description: "Welcome to your admin dashboard",
	},
	"/admin/students": {
		title: "Students/Leads",
		description: "Manage your student database",
	},
	"/admin/students/new": {
		title: "New Student",
		description: "Add a new student to the system",
	},
	"/admin/students/enrollments": {
		title: "Enrollments",
		description: "Manage student class enrollments",
	},
	"/admin/students/assessments": {
		title: "Assessments",
		description: "Manage student language assessments",
	},
	"/admin/students/progress": {
		title: "Progress Tracking",
		description: "Track student progress and performance",
	},
	"/admin/classes": {
		title: "All Classes",
		description: "Manage cohorts and their weekly sessions",
	},
	"/admin/classes/products": {
		title: "Products & Pricing",
		description: "Manage products and pricing",
	},
	"/admin/teachers": {
		title: "Teachers",
		description: "Manage your teaching staff",
	},
	"/admin/team": {
		title: "Teachers",
		description: "Manage your teaching staff",
	},
	"/admin/team/support": {
		title: "Support Staff",
		description: "Manage support team members",
	},
	"/admin/team/availability": {
		title: "Team Availability",
		description: "View and manage team schedules",
	},
	"/admin/team/performance": {
		title: "Team Performance",
		description: "Track team performance metrics",
	},
	"/admin/automation/touchpoints": {
		title: "Touchpoints",
		description: "Track all communications with students",
	},
	"/admin/automation/automated-follow-ups": {
		title: "Automated Follow-ups",
		description: "Manage automated follow-ups and student communications",
	},
	"/admin/automation/sequences": {
		title: "Sequences",
		description: "Configure follow-up message sequences and templates",
	},
	"/admin/automation/campaigns": {
		title: "Campaigns",
		description: "Manage marketing campaigns",
	},
	"/admin/automation/communications": {
		title: "Communications",
		description: "Manage automated communications",
	},
	"/admin/control/users": {
		title: "User Management",
		description: "Manage system users",
	},
	"/admin/control/permissions": {
		title: "Permissions",
		description: "Configure user permissions",
	},
	"/admin/control/settings": {
		title: "Settings",
		description: "System settings and configuration",
	},
};

export function PageHeader() {
	const pathname = usePathname();

	// Get the page info based on the current path
	// First try exact match, then try to match by ID pattern
	let info = pageInfo[pathname];

	if (!info) {
		// Check if it's a dynamic route (e.g., /admin/students/[id])
		if (pathname.match(/^\/admin\/students\/[^/]+$/)) {
			info = {
				title: "Student Details",
				description: "View and edit student information",
			};
		} else if (pathname.match(/^\/admin\/classes\/[^/]+$/)) {
			info = {
				title: "Cohort Details",
				description: "View and edit class information",
			};
		} else if (pathname.match(/^\/admin\/teachers\/[^/]+$/)) {
			info = {
				title: "Teacher Details",
				description: "View and edit teacher information",
			};
		} else if (pathname.match(/^\/admin\/team\/[^/]+$/)) {
			info = {
				title: "Team Member Details",
				description: "View and edit team member information",
			};
		} else if (pathname.match(/^\/admin\/automation\/touchpoints\/[^/]+$/)) {
			info = {
				title: "Touchpoint Details",
				description: "View communication details",
			};
		} else if (pathname.match(/^\/admin\/automation\/sequences\/[^/]+$/)) {
			info = {
				title: "Sequence Details",
				description: "View and manage sequence messages",
			};
		} else if (
			pathname.match(/^\/admin\/automation\/automated-follow-ups\/[^/]+$/)
		) {
			info = {
				title: "Follow-up Details",
				description: "View and manage automated follow-up communication",
			};
		} else {
			// Fallback to a generic title based on the path segments
			const segments = pathname.split("/").filter(Boolean);
			if (segments.length > 1) {
				const title = segments[segments.length - 1]
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" ");
				info = { title };
			} else {
				info = { title: "Admin" };
			}
		}
	}

	return (
		<header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 supports-[backdrop-filter]:bg-background/60">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				<div className="h-4 w-px bg-sidebar-border" />
				<div className="flex items-center gap-3">
					<h1 className="font-semibold text-lg">{info.title}</h1>
					{info.description && (
						<>
							<span className="text-muted-foreground text-sm">•</span>
							<p className="text-muted-foreground text-sm">
								{info.description}
							</p>
						</>
					)}
				</div>
			</div>
			<div className="ml-auto flex items-center gap-4 px-4">
				{/* Add user menu, notifications, etc. here */}
			</div>
		</header>
	);
}
