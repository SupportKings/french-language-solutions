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
	userRole,
	...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup> & {
	userRole?: string;
}) {
	const pathname = usePathname();

	// Only show portal users to admins and super_admins
	const canAccessPortalUsers =
		userRole === "admin" || userRole === "super_admin";

	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{canAccessPortalUsers && (
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
