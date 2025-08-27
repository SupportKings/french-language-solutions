"use client"
import * as React from "react"
import {
  Bot,
  Building2,
  Users,
  GraduationCap,
  Calendar,
  Settings,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin User",
    email: "admin@frenchlanguagesolutions.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Students Hub",
      url: "#",
      icon: GraduationCap,
      items: [
        {
          title: "Students/Leads",
          url: "/admin/students",
        },
        {
          title: "Enrollments",
          url: "/admin/students/enrollments",
        },
        {
          title: "Assessments",
          url: "/admin/students/assessments",
        },
        {
          title: "Progress Tracking",
          url: "/admin/students/progress",
        },
      ],
    },
    {
      title: "Classes Hub",
      url: "#",
      icon: Calendar,
      items: [
        {
          title: "All Classes",
          url: "/admin/classes",
        },
        {
          title: "Products & Pricing",
          url: "/admin/classes/products",
        },
      ],
    },
    {
      title: "Teachers",
      url: "/admin/teachers",
      icon: Users,
      isActive: false,
    },
    {
      title: "Automation",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Touchpoints",
          url: "/admin/automation/touchpoints",
        },
        {
          title: "Automated Follow-ups",
          url: "/admin/automation/automated-follow-ups",
        },
        {
          title: "Sequences",
          url: "/admin/automation/sequences",
        },
      ],
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin/students">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">FLS Admin</span>
                  <span className="truncate text-xs">Management Portal</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}