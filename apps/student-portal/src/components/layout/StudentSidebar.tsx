"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import {
	ChevronsUpDown,
	Home,
	LogOut,
	Megaphone,
	MessageCircle,
	Settings,
	User,
} from "lucide-react";

interface StudentSidebarProps {
	student: {
		id: string;
		fullName: string;
		email: string;
		avatar?: string;
	};
	unreadAnnouncementCount?: number;
	unreadChatCount?: number;
}

const bottomNavItems = [
	{
		title: "Settings",
		url: "/settings",
		icon: Settings,
	},
];

export function StudentSidebar({
	student,
	unreadAnnouncementCount,
	unreadChatCount,
}: StudentSidebarProps) {
	const navItems = [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: Home,
			badge: undefined as number | undefined,
		},
		{
			title: "Announcements",
			url: "/announcements",
			icon: Megaphone,
			badge: unreadAnnouncementCount,
		},
		{
			title: "Chats",
			url: "/chats",
			icon: MessageCircle,
			badge: unreadChatCount,
		},
	];
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
			<SidebarHeader className="border-sidebar-border border-b">
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
								<span className="truncate text-muted-foreground text-xs">
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
												{typeof item.badge === "number" && item.badge > 0 && (
													<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 font-bold text-[10px] text-destructive-foreground">
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

			<SidebarFooter className="border-sidebar-border border-t">
				<SidebarMenu>
					{bottomNavItems.map((item) => {
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
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage src={student.avatar} alt={student.fullName} />
										<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs">
											{initials}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">
											{student.fullName}
										</span>
										<span className="truncate text-muted-foreground text-xs">
											{student.email}
										</span>
									</div>
									<ChevronsUpDown className="ml-auto size-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
								side="bottom"
								align="end"
								sideOffset={4}
							>
								<DropdownMenuLabel className="p-0 font-normal">
									<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
										<Avatar className="h-8 w-8 rounded-lg">
											<AvatarImage
												src={student.avatar}
												alt={student.fullName}
											/>
											<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs">
												{initials}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{student.fullName}
											</span>
											<span className="truncate text-muted-foreground text-xs">
												{student.email}
											</span>
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuItem asChild>
										<Link href="/settings">
											<User className="mr-2 size-4" />
											Profile
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href="/settings">
											<Settings className="mr-2 size-4" />
											Settings
										</Link>
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => {
										authClient.signOut({
											fetchOptions: {
												onSuccess: () => {
													window.location.href = "/";
												},
											},
										});
									}}
								>
									<LogOut className="mr-2 size-4" />
									Log out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
