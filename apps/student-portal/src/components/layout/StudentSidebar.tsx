"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";

import { Home, Megaphone, Settings } from "lucide-react";

interface StudentSidebarProps {
	student: {
		id: string;
		fullName: string;
		email: string;
		avatar?: string;
	};
}

const navItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: Home,
	},
	{
		title: "Announcements",
		url: "/announcements",
		icon: Megaphone,
		badge: 2,
	},
];

const bottomNavItems = [
	{
		title: "Settings",
		url: "/settings",
		icon: Settings,
	},
];

export function StudentSidebar({ student }: StudentSidebarProps) {
	const pathname = usePathname();

	const initials = student.fullName
		? student.fullName
				.split(" ")
				.map((n: string) => n[0])
				.join("")
				.slice(0, 2)
				.toUpperCase()
		: "ST";

	return (
		<Sidebar collapsible="icon" className="border-r-0">
			<SidebarHeader className="border-b border-sidebar-border">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
								<span className="font-bold text-sm">FLS</span>
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">Student Portal</span>
								<span className="truncate text-xs text-muted-foreground">
									French Language Solutions
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => {
								const isActive = pathname === item.url;
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={item.title}
										>
											<Link href={item.url}>
												<item.icon className="size-4" />
												<span>{item.title}</span>
												{item.badge && (
													<span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
														{item.badge}
													</span>
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="border-t border-sidebar-border">
				<SidebarMenu>
					{bottomNavItems.map((item) => {
						const isActive = pathname === item.url;
						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
									<Link href={item.url}>
										<item.icon className="size-4" />
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
					<SidebarMenuItem>
						<SidebarMenuButton
							className="group-data-[collapsible=icon]:justify-center"
							tooltip="Profile"
						>
							<Avatar className="size-6">
								<AvatarImage src={student.avatar} />
								<AvatarFallback className="text-[10px] bg-primary/10 text-primary">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{student.fullName}</span>
								<span className="truncate text-xs text-muted-foreground">
									{student.email}
								</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
