"use client";

import { IconWrapper } from "@/components/sidebar/icon-wrapper";
import { SidebarItemComponent } from "@/components/sidebar/sidebar-item";

export function NavMain({
	items,
}: {
	items: {
		name: string;
		url: string;
		icon: string;
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
						icon={<IconWrapper name={item.icon} size={16} />}
					/>
				);
			})}
		</div>
	);
}
