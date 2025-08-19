"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	LayoutDashboard,
	Users,
	GraduationCap,
	Bot,
	Settings,
	ChevronDown,
	Building2,
	Calendar,
	MessageSquare,
	Shield,
	FileText,
	TrendingUp,
	DollarSign,
	ClipboardCheck,
	UserCheck,
	Clock,
	Mail,
	Zap,
	FolderOpen,
} from "lucide-react";

const navigation = [
	{
		name: "Dashboard",
		href: "/admin",
		icon: LayoutDashboard,
	},
	{
		name: "Students Hub",
		icon: GraduationCap,
		children: [
			{ name: "All Students", href: "/admin/students", icon: Users },
			{ name: "Enrollments", href: "/admin/students/enrollments", icon: ClipboardCheck },
			{ name: "Assessments", href: "/admin/students/assessments", icon: FileText },
			{ name: "Progress Tracking", href: "/admin/students/progress", icon: TrendingUp },
		],
	},
	{
		name: "Classes Hub",
		icon: Calendar,
		children: [
			{ name: "Active Classes", href: "/admin/classes", icon: FolderOpen },
			{ name: "Products & Pricing", href: "/admin/classes/products", icon: DollarSign },
			{ name: "Schedule", href: "/admin/classes/schedule", icon: Clock },
			{ name: "Assignments", href: "/admin/classes/assignments", icon: FileText },
		],
	},
	{
		name: "Team Hub",
		icon: Users,
		children: [
			{ name: "Teachers", href: "/admin/team", icon: UserCheck },
			{ name: "Support Staff", href: "/admin/team/support", icon: Users },
			{ name: "Availability", href: "/admin/team/availability", icon: Calendar },
			{ name: "Performance", href: "/admin/team/performance", icon: TrendingUp },
		],
	},
	{
		name: "Automation",
		icon: Bot,
		children: [
			{ name: "Touchpoints", href: "/admin/automation/touchpoints", icon: MessageSquare },
			{ name: "Sequences", href: "/admin/automation/sequences", icon: Zap },
			{ name: "Campaigns", href: "/admin/automation/campaigns", icon: Mail },
			{ name: "Communications", href: "/admin/automation/communications", icon: MessageSquare },
		],
	},
	{
		name: "Control Center",
		icon: Shield,
		children: [
			{ name: "User Management", href: "/admin/control/users", icon: Users },
			{ name: "Permissions", href: "/admin/control/permissions", icon: Shield },
			{ name: "Settings", href: "/admin/control/settings", icon: Settings },
		],
	},
];

export function AdminSidebar() {
	const pathname = usePathname();
	const [expandedSections, setExpandedSections] = useState<string[]>(() => {
		// Auto-expand the section that contains the current path
		const expanded: string[] = [];
		navigation.forEach((item) => {
			if (item.children?.some((child) => pathname.startsWith(child.href))) {
				expanded.push(item.name);
			}
		});
		return expanded;
	});

	const toggleSection = (sectionName: string) => {
		setExpandedSections((prev) =>
			prev.includes(sectionName)
				? prev.filter((name) => name !== sectionName)
				: [...prev, sectionName],
		);
	};

	return (
		<div className="flex h-full w-[260px] flex-col bg-gradient-to-b from-background to-muted/20 border-r border-border/40">
			{/* Logo Section */}
			<div className="flex h-16 items-center px-6 border-b border-border/40">
				<Link href="/admin" className="flex items-center gap-3 group">
					<div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
						<Building2 className="h-5 w-5 text-primary" />
					</div>
					<div>
						<p className="font-semibold text-sm">FLS Admin</p>
						<p className="text-xs text-muted-foreground">Management Portal</p>
					</div>
				</Link>
			</div>

			{/* Navigation */}
			<nav className="flex-1 px-3 py-4 overflow-y-auto">
				<div className="space-y-1">
					{navigation.map((item) => {
						const isActive = pathname === item.href;
						const isExpanded = expandedSections.includes(item.name);
						const hasActiveChild = item.children?.some((child) =>
							pathname.startsWith(child.href),
						);

						if (item.children) {
							return (
								<div key={item.name}>
									<button
										onClick={() => toggleSection(item.name)}
										className={cn(
											"w-full group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
											hasActiveChild
												? "bg-primary/10 text-primary"
												: "text-foreground/70 hover:bg-accent hover:text-foreground",
										)}
									>
										<div
											className={cn(
												"flex h-8 w-8 items-center justify-center rounded-md transition-colors",
												hasActiveChild
													? "bg-primary/20 text-primary"
													: "bg-muted/50 text-muted-foreground group-hover:bg-accent",
											)}
										>
											<item.icon className="h-4 w-4" />
										</div>
										<span className="flex-1 text-left">{item.name}</span>
										<ChevronDown
											className={cn(
												"h-4 w-4 transition-transform duration-200",
												isExpanded && "rotate-180",
											)}
										/>
									</button>
									
									{/* Children items with animation */}
									<div
										className={cn(
											"overflow-hidden transition-all duration-200",
											isExpanded ? "max-h-60" : "max-h-0",
										)}
									>
										<div className="mt-1 space-y-0.5 px-2">
											{item.children.map((child) => {
												const isChildActive = pathname === child.href;
												return (
													<Link
														key={child.href}
														href={child.href}
														className={cn(
															"group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
															isChildActive
																? "bg-primary/10 text-primary font-medium"
																: "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
														)}
													>
														<child.icon className={cn(
															"h-4 w-4",
															isChildActive ? "text-primary" : "text-muted-foreground",
														)} />
														<span>{child.name}</span>
													</Link>
												);
											})}
										</div>
									</div>
								</div>
							);
						}

						// Single items (like Dashboard)
						return (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									"group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
									isActive
										? "bg-primary/10 text-primary"
										: "text-foreground/70 hover:bg-accent hover:text-foreground",
								)}
							>
								<div
									className={cn(
										"flex h-8 w-8 items-center justify-center rounded-md transition-colors",
										isActive
											? "bg-primary/20 text-primary"
											: "bg-muted/50 text-muted-foreground group-hover:bg-accent",
									)}
								>
									<item.icon className="h-4 w-4" />
								</div>
								<span>{item.name}</span>
							</Link>
						);
					})}
				</div>
			</nav>

			{/* User Section */}
			<div className="border-t border-border/40 p-4">
				<div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent/50 transition-colors cursor-pointer">
					<div className="relative">
						<div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
							<span className="text-sm font-medium text-primary">A</span>
						</div>
						<div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium truncate">Admin User</p>
						<p className="text-xs text-muted-foreground truncate">admin@fls.com</p>
					</div>
				</div>
			</div>
		</div>
	);
}