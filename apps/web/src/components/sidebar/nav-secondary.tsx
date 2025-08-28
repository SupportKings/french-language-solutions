"use client";

import type * as React from "react";

import { usePathname } from "next/navigation";

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
} from "@/components/ui/sidebar";

import { BookOpen } from "lucide-react";
import { SidebarItemComponent } from "./sidebar-item";

export function NavSecondary({
	...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	const pathname = usePathname();
	const isActive = pathname === "/dashboard/knowledge-base";

	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					<SidebarItemComponent
						href="/dashboard/knowledge-base"
						label="Knowledge Base"
						icon={<BookOpen size={16} />}
					/>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
