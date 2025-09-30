"use client";

import type * as React from "react";

import { usePathname } from "next/navigation";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
} from "@/components/ui/sidebar";

import { BookOpen, UserCog } from "lucide-react";
import { IconWrapper } from "./icon-wrapper";
import { SidebarItemComponent } from "./sidebar-item";

export function NavSecondary({
	isAdmin = false,
	...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup> & {
	isAdmin?: boolean;
}) {
	const pathname = usePathname();

	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{isAdmin && (
						<SidebarItemComponent
							href="/admin/portal-users"
							label="Portal Users"
							icon={<IconWrapper name="UserCog" size={16} />}
						/>
					)}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
