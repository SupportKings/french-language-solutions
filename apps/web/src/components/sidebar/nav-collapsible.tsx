"use client";

import * as React from "react";

import { usePathname } from "next/navigation";

import { Link } from "@/components/fastLink";
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

import { ChevronIcon } from "@/icons/collapsibleIcon";

import { IconWrapper } from "./icon-wrapper";
import { SidebarItemComponent } from "./sidebar-item";

export function NavCollapsible({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon: string;
		isActive?: boolean;
		items?: {
			title: string;
			url: string;
		}[];
	}[];
}) {
	const pathname = usePathname();

	// Function to check if a URL is active
	const isActive = (url: string) => {
		// Skip placeholder URLs
		if (url === "#") return false;

		if (url === "/dashboard") {
			return pathname === "/dashboard";
		}

		// For exact match check
		if (pathname === url) return true;

		// For parent-child relationship, be more specific
		// e.g., /admin/students should be active for /admin/students/enrollments
		// but NOT for /admin/students itself when we're on /admin/students/enrollments
		return false;
	};

	// Function to check if any sub-item is active
	const hasActiveSubItem = (subItems?: { title: string; url: string }[]) => {
		if (!subItems) return false;
		// Check for exact match with current pathname
		return subItems.some(
			(subItem) =>
				pathname === subItem.url || pathname.startsWith(subItem.url + "/"),
		);
	};

	// Track open state for each collapsible item
	const [openItems, setOpenItems] = React.useState<Record<string, boolean>>(
		() => {
			const initialState: Record<string, boolean> = {};
			items.forEach((item) => {
				if (item.items && item.items.length > 0) {
					initialState[item.title] = hasActiveSubItem(item.items);
				}
			});
			return initialState;
		},
	);

	return (
		<SidebarGroup>
			<SidebarMenu>
				{items.map((item) => {
					const itemIsActive =
						isActive(item.url) || hasActiveSubItem(item.items);

					// Skip the single-item optimization to keep Configuration as a section
					// This ensures items like "Language Levels" stay under "Configuration"

					// If item has no sub-items and has a valid URL, make it a direct link
					if (!item.items?.length && item.url && item.url !== "#") {
						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									asChild
									isActive={
										pathname === item.url || pathname.startsWith(item.url + "/")
									}
									tooltip={item.title}
								>
									<Link prefetch={true} href={item.url}>
										<IconWrapper name={item.icon} />
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					}

					// Multi-item collapsible
					return (
						<SidebarMenuItem key={item.title}>
							<Collapsible
								open={openItems[item.title] ?? false}
								onOpenChange={(open) => {
									setOpenItems((prev) => ({ ...prev, [item.title]: open }));
								}}
							>
								<SidebarMenuButton
									asChild
									isActive={itemIsActive}
									tooltip={item.title}
									className="group"
								>
									<CollapsibleTrigger className="w-full">
										<IconWrapper name={item.icon} />
										<span>{item.title}</span>
										{item.items?.length ? (
											<ChevronIcon className="ml-auto size-3 transition-all ease-out group-data-[panel-open]:rotate-90" />
										) : null}
									</CollapsibleTrigger>
								</SidebarMenuButton>
								{item.items?.length ? (
									<CollapsibleContent className="flex h-[var(--collapsible-panel-height)] flex-col justify-end overflow-hidden text-sm transition-all ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
										<SidebarMenuSub>
											{item.items?.map((subItem) => {
												// More precise active state detection
												// Check if this is the most specific match among all sub-items
												let subItemIsActive = false;

												if (pathname === subItem.url) {
													// Exact match
													subItemIsActive = true;
												} else if (pathname.startsWith(subItem.url + "/")) {
													// Check if this is the most specific match
													// by ensuring no other sub-item has a longer matching URL
													subItemIsActive = !item.items?.some(
														(otherItem) =>
															otherItem.url !== subItem.url &&
															otherItem.url.length > subItem.url.length &&
															pathname.startsWith(otherItem.url),
													);
												}

												return (
													<SidebarMenuSubItem key={subItem.title}>
														<SidebarMenuSubButton
															asChild
															isActive={subItemIsActive}
														>
															<Link prefetch={true} href={subItem.url}>
																<span>{subItem.title}</span>
															</Link>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												);
											})}
										</SidebarMenuSub>
									</CollapsibleContent>
								) : null}
							</Collapsible>
						</SidebarMenuItem>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
