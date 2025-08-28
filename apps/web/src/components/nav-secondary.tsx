"use client";

import * as React from "react";

import Link from "next/link";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { LucideIcon } from "lucide-react";

interface NavSecondaryItem {
	title: string;
	url: string;
	icon: LucideIcon;
}

interface NavSecondaryProps {
	items: NavSecondaryItem[];
	className?: string;
}

export function NavSecondary({ items, ...props }: NavSecondaryProps) {
	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => {
						const Icon = item.icon;
						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild size="sm">
									<Link href={item.url}>
										<Icon className="h-4 w-4" />
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
