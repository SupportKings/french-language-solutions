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
import { Logo } from "@/components/ui/logo";
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
	useSidebar,
} from "@/components/ui/sidebar";

import {
	ChevronsUpDown,
	Home,
	LogOut,
	Megaphone,
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
}: StudentSidebarProps) {
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

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
		<Sidebar collapsible="icon" className="border-r">
			<SidebarHeader
				className={`border-sidebar-border border-b py-4 ${isCollapsed ? "px-2" : "px-4"}`}
			>
				<SidebarMenu>
					<SidebarMenuItem
						className={isCollapsed ? "flex justify-center" : ""}
					>
						<SidebarMenuButton
							size="lg"
							className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${isCollapsed ? "!w-auto justify-center px-0" : "px-2"}`}
						>
							<Logo
								width={isCollapsed ? 32 : 36}
								height={isCollapsed ? 32 : 36}
								className="shrink-0"
							/>
							{!isCollapsed && (
								<div className="grid flex-1 gap-0.5 text-left text-sm leading-tight">
									<span className="truncate font-bold text-sm">Student Portal</span>
									<span className="truncate text-muted-foreground text-xs">
										French Language Solutions
									</span>
								</div>
							)}
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent className={`py-4 ${isCollapsed ? "px-2" : "px-3"}`}>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu className="gap-1">
							{navItems.map((item) => {
								const isActive = pathname === item.url;
								return (
									<SidebarMenuItem
										key={item.title}
										className={isCollapsed ? "flex justify-center" : ""}
									>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={item.title}
											className={`h-10 ${isCollapsed ? "!w-auto justify-center px-2" : "px-3"}`}
										>
											<Link href={item.url}>
												<item.icon className="size-4.5 shrink-0" />
												{!isCollapsed && (
													<span className="font-medium">{item.title}</span>
												)}
												{!isCollapsed &&
													typeof item.badge === "number" &&
													item.badge > 0 && (
														<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 font-bold text-[10px] text-destructive-foreground shadow-sm">
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

			<SidebarFooter
				className={`border-sidebar-border border-t py-3 ${isCollapsed ? "px-2" : "px-3"}`}
			>
				<SidebarMenu className="gap-1">
					{bottomNavItems.map((item) => {
						const isActive = pathname === item.url;
						return (
							<SidebarMenuItem
								key={item.title}
								className={isCollapsed ? "flex justify-center" : ""}
							>
								<SidebarMenuButton
									asChild
									isActive={isActive}
									tooltip={item.title}
									className={`h-10 ${isCollapsed ? "!w-auto justify-center px-2" : "px-3"}`}
								>
									<Link href={item.url}>
										<item.icon className="size-4.5 shrink-0" />
										{!isCollapsed && (
											<span className="font-medium">{item.title}</span>
										)}
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
					<SidebarMenuItem className={isCollapsed ? "flex justify-center" : ""}>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${isCollapsed ? "!w-auto justify-center px-0" : "px-2"}`}
								>
									<Avatar className="h-9 w-9 shrink-0 rounded-lg shadow-sm">
										<AvatarImage src={student.avatar} alt={student.fullName} />
										<AvatarFallback className="rounded-lg bg-primary/10 font-semibold text-primary text-sm">
											{initials}
										</AvatarFallback>
									</Avatar>
									{!isCollapsed && (
										<>
											<div className="grid flex-1 gap-0.5 text-left text-sm leading-tight">
												<span className="truncate font-semibold text-sm">
													{student.fullName}
												</span>
												<span className="truncate text-muted-foreground text-xs">
													{student.email}
												</span>
											</div>
											<ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
										</>
									)}
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
