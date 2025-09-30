"use client";

import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
	id: string;
	name: string;
	email: string;
	image: string | null;
	role: string | null;
}

async function fetchUsers(): Promise<User[]> {
	const response = await fetch("/api/users");
	if (!response.ok) {
		throw new Error("Failed to fetch users");
	}
	return response.json();
}

export function NavUsersList() {
	const { data: users, isLoading } = useQuery({
		queryKey: ["portal-users"],
		queryFn: fetchUsers,
	});

	if (isLoading) {
		return (
			<SidebarGroup>
				<SidebarGroupLabel>Portal Users</SidebarGroupLabel>
				<SidebarGroupContent>
					<div className="px-4 py-2 text-sm text-muted-foreground">
						Loading...
					</div>
				</SidebarGroupContent>
			</SidebarGroup>
		);
	}

	if (!users || users.length === 0) {
		return null;
	}

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Portal Users ({users.length})</SidebarGroupLabel>
			<SidebarGroupContent>
				<ScrollArea className="h-[200px]">
					<SidebarMenu>
						{users.map((user) => (
							<SidebarMenuItem key={user.id}>
								<SidebarMenuButton className="h-12">
									<Avatar className="size-6">
										<AvatarImage src={user.image || undefined} alt={user.name} />
										<AvatarFallback className="text-xs">
											{user.name
												.split(" ")
												.map((n) => n[0])
												.join("")
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="flex flex-col items-start overflow-hidden">
										<span className="truncate text-sm font-medium">
											{user.name}
										</span>
										<span className="truncate text-xs text-muted-foreground">
											{user.role || "User"}
										</span>
									</div>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</ScrollArea>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
