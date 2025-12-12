"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

import { ChevronsUpDown, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

// Use Better Auth's built-in type inference
type Session = typeof authClient.$Infer.Session;

function toggleTheme(
	theme: "system" | "light" | "dark",
	setTheme: (theme: "system" | "light" | "dark") => void,
) {
	if (!document?.startViewTransition) {
		setTheme(theme);
		return;
	}

	document.startViewTransition?.(() => {
		setTheme(theme);
	});
}

const themes = [
	{
		key: "system" as const,
		icon: Monitor,
		label: "System theme",
	},
	{
		key: "light" as const,
		icon: Sun,
		label: "Light theme",
	},
	{
		key: "dark" as const,
		icon: Moon,
		label: "Dark theme",
	},
];

export function NavUser({ user }: { user: Session["user"] }) {
	const { isMobile } = useSidebar();
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);

		await authClient.signOut({
			fetchOptions: {
				onError: (error) => {
					console.error("Logout failed:", error);
					setIsLoggingOut(false);
				},
				onSuccess: () => {
					// We wrap our navigate in a setTimeout 0. This forces the code to run on the next tick,
					// which protects us against some edge cases where you are signed out but the cookie isn't cleared yet
					// causing you to bounce between routes over and over.
					setTimeout(() => {
						router.push("/");
					}, 0);
				},
			},
		});
	};

	const handleThemeChange = (newTheme: "system" | "light" | "dark") => {
		toggleTheme(newTheme, setTheme);
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.image || undefined} alt={user.name} />
								<AvatarFallback className="rounded-lg">
									{user.name.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{user.name}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={user.image || undefined} alt={user.name} />
									<AvatarFallback className="rounded-lg">
										{user.name.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{user.name}</span>
									<span className="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />

						{/* Theme Switcher */}
						<DropdownMenuGroup>
							<DropdownMenuLabel className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
								Theme
							</DropdownMenuLabel>
							<div className="px-2 py-1">
								<div className="flex justify-center gap-1 rounded-md border p-1">
									{themes.map(({ key, icon: Icon, label }) => (
										<button
											key={key}
											type="button"
											onClick={() => handleThemeChange(key)}
											className={cn(
												"flex h-8 w-8 items-center justify-center rounded-sm font-medium text-sm transition-colors",
												theme === key
													? "bg-secondary text-secondary-foreground"
													: "hover:bg-muted",
											)}
											title={label}
										>
											<Icon className="h-4 w-4" />
										</button>
									))}
								</div>
							</div>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
							<LogOut className="mr-2 h-4 w-4" />
							{isLoggingOut ? "Signing out..." : "Sign out"}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
