"use client";

import { SidebarItemComponent } from "@/components/sidebar/sidebar-item";

import type { LucideIcon } from "lucide-react";

export function NavMain({
	items,
}: {
	items: {
		name: string;
		url: string;
		icon: LucideIcon;
	}[];
}) {
	return (
		<div className="space-y-1">
			{items.map((item) => {
				return (
					<SidebarItemComponent
						key={item.name}
						href={item.url}
						label={item.name}
						icon={<item.icon size={16} />}
					/>
				);
			})}
		</div>
	);
}
