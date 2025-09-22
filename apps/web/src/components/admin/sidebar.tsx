"use client";
import type * as React from "react";

import Image from "next/image";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Bot, Calendar, GraduationCap, Settings, Users } from "lucide-react";

const data = {
	user: {
		name: "Admin User",
		email: "admin@frenchlanguagesolutions.com",
		avatar: "/avatars/admin.jpg",
	},
	navMain: [
		{
			title: "Students Hub",
			url: "#",
			icon: GraduationCap,
			items: [
				{
					title: "Students/Leads",
					url: "/admin/students",
				},
				{
					title: "Enrollments",
					url: "/admin/students/enrollments",
				},
				{
					title: "Assessments",
					url: "/admin/students/assessments",
				},
			],
		},
		{
			title: "Classes Hub",
			url: "#",
			icon: Calendar,
			items: [
				{
					title: "All Cohorts",
					url: "/admin/cohorts",
				},
				{
					title: "Products & Pricing",
					url: "/admin/cohorts/products",
				},
			],
		},
		{
			title: "Team Members",
			url: "/admin/team-members",
			icon: Users,
			isActive: false,
		},
		{
			title: "Automation",
			url: "#",
			icon: Bot,
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
		},
		{
			title: "Configuration",
			url: "#",
			icon: Settings,
			items: [
				{
					title: "Language Levels",
					url: "/admin/configuration/language-levels",
				},
			],
		},
	],
};

export function AdminSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar variant="inset" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" className="flex h-20 flex-col" asChild>
							<a href="/admin/students">
								<div className="!w-18 flex items-center justify-center overflow-hidden rounded-lg">
									<Image
										src="/logo.png"
										alt="FLS Logo"
										width={100}
										height={100}
										className="size-[150px] object-contain"
									/>
								</div>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
