"use client";

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

import type { LucideIcon } from "lucide-react";
import { SidebarItemComponent } from "./sidebar-item";

export function NavCollapsible({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
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
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  // Function to check if any sub-item is active
  const hasActiveSubItem = (subItems?: { title: string; url: string }[]) => {
    if (!subItems) return false;
    return subItems.some((subItem) => isActive(subItem.url));
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const itemIsActive =
            isActive(item.url) || hasActiveSubItem(item.items);

          // If there's only one item, render it directly without collapsible
          if (item.items?.length === 1) {
            const singleItem = item.items[0];
            const singleItemIsActive = isActive(singleItem.url);

            return (
              <SidebarItemComponent
                key={item.title}
                href={singleItem.url}
                label={singleItem.title}
                icon={<item.icon size={16} />}
              />
            );
          }

          // Multi-item collapsible
          return (
            <SidebarMenuItem key={item.title}>
              <Collapsible defaultOpen={hasActiveSubItem(item.items)}>
                <SidebarMenuButton
                  asChild
                  isActive={itemIsActive}
                  tooltip={item.title}
                  className="group"
                >
                  <CollapsibleTrigger className="w-full">
                    <item.icon />
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
                        const subItemIsActive = isActive(subItem.url);

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
