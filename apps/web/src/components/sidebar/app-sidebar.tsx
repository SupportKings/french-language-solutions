"use client";

import type * as React from "react";

import { usePathname } from "next/navigation";

// Use Better Auth's built-in type inference
import type { authClient } from "@/lib/auth-client";

import { Link } from "@/components/fastLink";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { NavCollapsible } from "@/components/sidebar/nav-collapsible";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import { NewButton } from "@/components/sidebar/new-button";
import { Logo } from "@/components/ui/logo";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

import { ArrowLeft } from "lucide-react";
import { IconWrapper } from "./icon-wrapper";
import { NavMain } from "./nav-main";
import { SidebarItemComponent } from "./sidebar-item";

type Session = typeof authClient.$Infer.Session;

// Back to main navigation button
function BackToMainButton() {
	return (
		<Link
			href="/dashboard"
			className="before:-inset-2 relative m-0 inline-flex h-6 min-w-6 shrink-0 cursor-default select-none items-center justify-center whitespace-nowrap rounded-[5px] border border-transparent border-solid bg-transparent py-0 pr-1.5 pl-0.5 font-medium text-[13px] text-muted-foreground transition-all duration-150 before:absolute before:content-[''] hover:bg-accent hover:text-accent-foreground disabled:cursor-default disabled:opacity-60"
		>
			<ArrowLeft className="mr-1.5 h-4 w-4" />
			Back to app
		</Link>
	);
}

// Settings navigation items
const settingsNavItems = [
	{
		name: "Account",
		items: [
			{
				icon: "Users",
				name: "Profile",
				href: "/dashboard/settings/profile",
			},
			{
				icon: "BrickWall",
				name: "Security & Access",
				href: "/dashboard/settings/security",
			},
		],
	},

	{
		name: "Administration",
		items: [
			{
				icon: "Users",
				name: "Team",
				href: "/dashboard/settings/team",
			},
		],
	},
	{
		name: "Coaches",
		items: [
			{
				icon: "ShieldCheck",
				name: "Certifications",
				href: "/dashboard/settings/certifications",
			},
			{
				icon: "Focus",
				name: "Specializations",
				href: "/dashboard/settings/specializations",
			},
		],
	},
	{
		name: "Clients",
		items: [
			{
				icon: "Goal",
				name: "Goals",
				href: "/dashboard/settings/goals",
			},
		],
	},
];

export function AppSidebar({
	session,
	rawPermissions,
	isAdmin = false,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	session: Session;
	rawPermissions?: any;
	isAdmin?: boolean;
}) {
	const pathname = usePathname();
	const currentArea = pathname.includes("/dashboard/settings")
		? "settings"
		: pathname.includes("/admin")
			? "admin"
			: "main";

	const isImpersonating =
		session.session.impersonatedBy !== null &&
		session.session.impersonatedBy !== undefined;

	// Check permissions for different navigation sections
	const canAccessAnalytics =
		rawPermissions?.analytics?.includes("read") || false;
	const canAccessClients = rawPermissions?.clients?.includes("read") || false;
	const canAccessCoaches = rawPermissions?.coaches?.includes("read") || false;
	const canAccessTickets = rawPermissions?.tickets?.includes("read") || false;
	const canAccessBilling = rawPermissions?.billing?.includes("read") || false;
	const canAccessUsers = rawPermissions?.user?.includes("list") || false;
	const canAccessTeamSettings =
		rawPermissions?.user?.includes("create") || false;

	// New permission checks for teacher-specific sections
	const canAccessStudents =
		rawPermissions?.students?.includes("read_all") ||
		rawPermissions?.students?.includes("read_assigned") ||
		false;
	const canAccessCohorts =
		rawPermissions?.cohorts?.includes("read_all") ||
		rawPermissions?.cohorts?.includes("read_assigned") ||
		false;
	const canAccessAssessments =
		rawPermissions?.assessments?.includes("read_all") || false;
	const canAccessTeachers =
		rawPermissions?.teachers?.includes("read_all") || false;
	const canAccessEnrollments =
		rawPermissions?.enrollments?.includes("read_all") || false;
	const canAccessAutomation =
		rawPermissions?.automation?.includes("read") || false;
	const canAccessConfiguration =
		rawPermissions?.system?.includes("configure") || false;

	// Define roles that can see "All Tickets"
	const userRole = session.user.role || "user";
	const canSeeAllTickets = [
		"csRep",
		"csc",
		"csManager",
		"admin",
		"cpo",
	].includes(userRole);

	// Build navigation items dynamically based on permissions
	const buildNavigation = () => {
		const navItems = [];

		// Admin navigation for admin area
		if (isAdmin || currentArea === "admin") {
			// Students Hub - only show if user has access (hidden for teachers)
			const isTeacher = userRole === "teacher";
			if (
				!isTeacher &&
				(canAccessStudents || canAccessEnrollments || canAccessAssessments)
			) {
				const studentHubItems = [];

				if (canAccessStudents) {
					studentHubItems.push({
						title: "Students/Leads",
						url: "/admin/students",
					});
				}

				if (canAccessEnrollments) {
					studentHubItems.push({
						title: "Enrollments",
						url: "/admin/students/enrollments",
					});
				}

				if (canAccessAssessments) {
					studentHubItems.push({
						title: "Assessments",
						url: "/admin/students/assessments",
					});
				}

				if (studentHubItems.length > 0) {
					navItems.push({
						title: "Students Hub",
						url: "#",
						icon: "GraduationCap",
						items: studentHubItems,
					});
				}
			}

			// Classes Hub - only show if user has access to cohorts
			if (canAccessCohorts) {
				navItems.push({
					title: "Classes Hub",
					url: "#",
					icon: "Calendar",
					items: [
						{
							title: "All Cohorts",
							url: "/admin/cohorts",
						},
						{
							title: "Reschedule Requests",
							url: "/admin/reschedule-requests",
						},
						{
							title: "Announcements",
							url: "/admin/announcements",
						},
					],
				});
			}

			// Team Members - only show if user has access to teachers
			if (canAccessTeachers) {
				navItems.push({
					title: "Team Members",
					url: "/admin/team-members",
					icon: "Users",
				});
			}

			// Automation - only show if user has access
			if (canAccessAutomation) {
				navItems.push({
					title: "Automation",
					url: "#",
					icon: "Bot",
					items: [
						{
							title: "Touchpoints",
							url: "/admin/automation/touchpoints",
						},
						{
							title: "Automated Follow-ups",
							url: "/admin/automation/automated-follow-ups",
						},
						{
							title: "Sequences",
							url: "/admin/automation/sequences",
						},
					],
				});
			}

			// Configuration - only show if user has access
			if (canAccessConfiguration) {
				navItems.push({
					title: "Configuration",
					url: "#",
					icon: "Settings",
					items: [
						{
							title: "Products & Pricing",
							url: "/admin/configuration/products",
						},
						{
							title: "Language Levels",
							url: "/admin/configuration/language-levels",
						},
					],
				});
			}

			return navItems;
		}

		// Regular dashboard navigation
		// Client Management section
		if (canAccessClients) {
			navItems.push({
				title: "Client Management",
				url: "#",
				icon: "Users",
				items: [
					{
						title: "Clients",
						url: "/dashboard/clients",
					},
				],
			});
		}

		// Coaches section
		if (canAccessCoaches) {
			navItems.push({
				title: "Coaches",
				url: "#",
				icon: "Users",
				items: [
					{
						title: "Coaches",
						url: "/dashboard/coaches",
					},
					{
						title: "Capacity",
						url: "/dashboard/capacity",
					},
				],
			});
		}

		// Support section
		if (canAccessTickets) {
			const ticketItems = [];

			// Only specific roles can see "All Tickets"
			if (canSeeAllTickets) {
				ticketItems.push({
					title: "All Tickets",
					url: "/dashboard/tickets/all",
				});
			}

			ticketItems.push({
				title: "My Tickets",
				url: "/dashboard/tickets/my-tickets",
			});

			navItems.push({
				title: "Support",
				url: "#",
				icon: "Ticket",
				items: ticketItems,
			});
		}

		// Overview section - only show if user can access analytics
		if (canAccessAnalytics) {
			navItems.push({
				title: "Overview",
				url: "#",
				icon: "ChartLine",
				isActive: true,
				items: [
					{
						title: "Reports & Analytics",
						url: "/dashboard/reports",
					},
				],
			});
		}

		// Finance section
		if (canAccessBilling) {
			navItems.push({
				title: "Finance",
				url: "#",
				icon: "CreditCard",
				items: [
					{
						title: "Billing & Finance",
						url: "/dashboard/finance",
					},
				],
			});
		}

		return navItems;
	};

	// Build navigation data dynamically based on permissions
	const data = {
		navMain: buildNavigation(),
		mainNav: [
			{
				name: "Inbox",
				url: "/dashboard",
				icon: "Inbox",
			},
		],
	};

	return (
		<Sidebar variant="inset" className="w-64" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<Logo width={48} height={48} />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className="overflow-hidden">
				<div className="relative h-full w-full overflow-hidden">
					<div
						className="flex h-full w-[200%] transition-transform duration-300 ease-in-out"
						style={{
							transform:
								currentArea === "settings"
									? "translateX(-50%)"
									: "translateX(0)",
						}}
					>
						{/* Main Area */}
						<div className="h-full w-1/2 px-2">
							<div className="flex h-full flex-col">
								{/* Show impersonation banner at the top if impersonating */}
								{isImpersonating && <ImpersonationBanner session={session} />}

								<div className="">
									<NavCollapsible items={data.navMain} />
								</div>

								<NavSecondary userRole={userRole} className="mt-auto" />
							</div>
						</div>

						{/* Settings Area */}
						<div className="h-full w-1/2 px-2">
							<div className="flex h-full flex-col overflow-y-auto">
								<div className="mb-4">
									<BackToMainButton />
								</div>

								<div className="flex-1 space-y-6">
									{settingsNavItems.map((group) => (
										<div key={group.name} className="space-y-2">
											<h2 className="px-2 font-medium text-muted-foreground text-xs">
												{group.name}
											</h2>
											<div className="space-y-1">
												{group.items.map((item) => (
													<SidebarItemComponent
														key={item.name}
														href={item.href}
														label={item.name}
														icon={<IconWrapper name={item.icon} size={16} />}
													/>
												))}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={session.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
