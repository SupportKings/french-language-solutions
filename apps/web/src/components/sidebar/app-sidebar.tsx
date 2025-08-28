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

import {
	ArrowLeft,
	BrickWallFireIcon,
	ChartLineIcon,
	CreditCard,
	FocusIcon,
	GoalIcon,
	InboxIcon,
	Settings,
	ShieldCheckIcon,
	Ticket,
	Users,
} from "lucide-react";
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
				icon: <Users size={16} />,
				name: "Profile",
				href: "/dashboard/settings/profile",
			},
			{
				icon: <BrickWallFireIcon size={16} />,
				name: "Security & Access",
				href: "/dashboard/settings/security",
			},
		],
	},

	{
		name: "Administration",
		items: [
			{
				icon: <Users size={16} />,
				name: "Team",
				href: "/dashboard/settings/team",
			},
		],
	},
	{
		name: "Coaches",
		items: [
			{
				icon: <ShieldCheckIcon size={16} />,
				name: "Certifications",
				href: "/dashboard/settings/certifications",
			},
			{
				icon: <FocusIcon size={16} />,
				name: "Specializations",
				href: "/dashboard/settings/specializations",
			},
		],
	},
	{
		name: "Clients",
		items: [
			{
				icon: <GoalIcon size={16} />,
				name: "Goals",
				href: "/dashboard/settings/goals",
			},
		],
	},
];

export function AppSidebar({
	session,
	rawPermissions,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	session: Session;
	rawPermissions?: any;
}) {
	const pathname = usePathname();
	const currentArea = pathname.includes("/dashboard/settings")
		? "settings"
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

		// Client Management section
		if (canAccessClients) {
			navItems.push({
				title: "Client Management",
				url: "#",
				icon: Users,
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
				icon: Users,
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
				icon: Ticket,
				items: ticketItems,
			});
		}

		// Overview section - only show if user can access analytics
		if (canAccessAnalytics) {
			navItems.push({
				title: "Overview",
				url: "#",
				icon: ChartLineIcon,
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
				icon: CreditCard,
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
				icon: InboxIcon,
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

								<div className="mt-4">
									<NewButton />
								</div>
								<div className="mt-4">
									<NavMain items={data.mainNav} />
								</div>
								<div className="mt-8">
									<NavCollapsible items={data.navMain} />
								</div>

								{/* Settings button that triggers area switch */}
								<SidebarItemComponent
									href="/dashboard/settings/profile"
									label="Settings"
									icon={<Settings size={16} />}
								/>

								<NavSecondary className="mt-auto" />
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
														icon={item.icon}
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
