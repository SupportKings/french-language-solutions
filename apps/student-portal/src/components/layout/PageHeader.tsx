"use client";

import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { AnnouncementsPopover } from "./AnnouncementsPopover";

interface PageHeaderProps {
	student: {
		id: string;
		fullName: string;
		email: string;
		avatar?: string;
	};
	unreadCount?: number;
}

const pageInfo: Record<string, { title: string; description?: string }> = {
	"/dashboard": {
		title: "Dashboard",
		description: "Your learning overview",
	},
	"/announcements": {
		title: "Announcements",
	},
	"/settings": {
		title: "Settings",
		description: "Manage your account",
	},
};

export function PageHeader({ student, unreadCount }: PageHeaderProps) {
	const pathname = usePathname();
	const info = pageInfo[pathname] || { title: "Student Portal" };

	const initials = student.fullName
		? student.fullName
				.split(" ")
				.map((n: string) => n[0])
				.join("")
				.slice(0, 2)
				.toUpperCase()
		: "ST";

	return (
		<header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur transition-[width,height] ease-linear supports-[backdrop-filter]:bg-background/60">
			<div className="flex flex-1 items-center gap-2 px-4">
				<SidebarTrigger className="-ml-1" />
				<div className="h-4 w-px bg-border" />
				<div className="flex items-center gap-3">
					<h1 className="font-semibold text-lg">{info.title}</h1>
					{info.description && (
						<>
							<span className="hidden text-muted-foreground text-sm sm:inline">
								·
							</span>
							<p className="hidden text-muted-foreground text-sm sm:inline">
								{info.description}
							</p>
						</>
					)}
				</div>
			</div>

			<div className="flex items-center gap-3 px-4">
				{/* Notification bell popover */}
				<AnnouncementsPopover studentId={student.id} unreadCount={unreadCount} />

				{/* Profile - visible on larger screens */}
				<div className="hidden items-center gap-3 md:flex">
					<div className="text-right">
						<p className="font-medium text-foreground text-sm leading-none">
							{student.fullName}
						</p>
						<p className="text-muted-foreground text-xs">{student.email}</p>
					</div>
					<Avatar className="h-8 w-8 ring-2 ring-border">
						<AvatarImage src={student.avatar} />
						<AvatarFallback className="bg-primary/10 font-medium text-primary text-xs">
							{initials}
						</AvatarFallback>
					</Avatar>
				</div>
			</div>
		</header>
	);
}
