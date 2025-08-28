"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { ChevronRight, type LucideIcon } from "lucide-react";

interface NavMainItem {
	title: string;
	url?: string;
	icon?: LucideIcon;
	isActive?: boolean;
	items?: {
		title: string;
		url: string;
	}[];
}

interface NavMainProps {
	items: NavMainItem[];
}

export function NavMain({ items }: NavMainProps) {
	const pathname = usePathname();
	const [openItems, setOpenItems] = React.useState<string[]>(() => {
		// Initialize with items that should be open based on current path
		const initialOpen: string[] = [];
		items.forEach((item) => {
			if (item.items) {
				const hasActiveSubItem = item.items.some(
					(subItem) =>
						pathname === subItem.url || pathname.startsWith(subItem.url + "/"),
				);
				if (hasActiveSubItem || item.isActive) {
					initialOpen.push(item.title);
				}
			}
		});
		return initialOpen;
	});

	const toggleItem = (title: string) => {
		setOpenItems((prev) =>
			prev.includes(title)
				? prev.filter((item) => item !== title)
				: [...prev, title],
		);
	};

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				{items.map((item) => {
					const isItemActive = pathname === item.url;
					const hasActiveSubItem = item.items?.some(
						(subItem) => pathname === subItem.url,
					);
					const isOpen = openItems.includes(item.title);

					if (item.items) {
						return (
							<SidebarMenuItem key={item.title}>
								<Collapsible
									open={isOpen}
									onOpenChange={() => toggleItem(item.title)}
									className="group/collapsible w-full"
								>
									<SidebarMenuButton
										onClick={() => toggleItem(item.title)}
										tooltip={item.title}
										isActive={hasActiveSubItem}
										className={cn(
											"w-full",
											hasActiveSubItem &&
												"data-[state=open]:bg-sidebar-accent/50",
										)}
									>
										{item.icon && <item.icon className="h-4 w-4" />}
										<span className="flex-1">{item.title}</span>
										<ChevronRight
											className={cn(
												"ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
												isOpen && "rotate-90",
											)}
										/>
									</SidebarMenuButton>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items.map((subItem) => {
												const isSubItemActive = pathname === subItem.url;
												return (
													<SidebarMenuSubItem key={subItem.title}>
														<SidebarMenuSubButton
															asChild
															isActive={isSubItemActive}
														>
															<Link href={subItem.url}>
																<span>{subItem.title}</span>
															</Link>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												);
											})}
										</SidebarMenuSub>
									</CollapsibleContent>
								</Collapsible>
							</SidebarMenuItem>
						);
					}

					return (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								tooltip={item.title}
								isActive={isItemActive}
							>
								<Link href={item.url || "#"}>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
