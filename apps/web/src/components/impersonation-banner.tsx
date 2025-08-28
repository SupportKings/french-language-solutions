"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { roleDisplayNames } from "@/lib/permissions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Loader2, LogOut, User } from "lucide-react";

// Use Better Auth's built-in type inference
type Session = typeof authClient.$Infer.Session;

// Get initials from user name
function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

// Stop impersonation button
function StopImpersonationButton() {
	const [isStoppingImpersonation, setIsStoppingImpersonation] = useState(false);

	const handleStopImpersonation = async () => {
		setIsStoppingImpersonation(true);

		await authClient.admin.stopImpersonating(
			{},
			{
				onSuccess: () => {
					// We wrap our navigate in a setTimeout 0. This forces the code to run on the next tick,
					// which protects us against some edge cases where you are signed in but the cookie isn't set yet
					setTimeout(() => {
						window.location.href = "/dashboard";
					}, 0);
					// Don't set isStoppingImpersonation to false here - keep the loading state during redirect
				},
				onError: (error) => {
					console.error(
						"Error stopping impersonation:",
						error.error.message || error.error,
					);
					setIsStoppingImpersonation(false); // Only stop loading on error
				},
			},
		);
	};

	return (
		<Button
			variant="destructive"
			size="sm"
			onClick={handleStopImpersonation}
			disabled={isStoppingImpersonation}
			className="w-full border-orange-500 bg-orange-500 text-white hover:border-orange-600 hover:bg-orange-600"
		>
			{isStoppingImpersonation ? (
				<Loader2 size={16} className="mr-2 animate-spin" />
			) : (
				<LogOut size={16} className="mr-2" />
			)}
			{isStoppingImpersonation ? "Stopping..." : "Stop Impersonation"}
		</Button>
	);
}

interface ImpersonationBannerProps {
	session: Session;
}

export function ImpersonationBanner({ session }: ImpersonationBannerProps) {
	return (
		<div className="mb-4 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 dark:border-orange-800 dark:from-orange-900/20 dark:to-amber-900/20">
			{/* Header */}
			<div className="mb-3 flex items-center gap-2">
				<div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
					<User size={12} className="text-orange-600 dark:text-orange-400" />
				</div>
				<span className="font-semibold text-orange-700 text-xs uppercase tracking-wide dark:text-orange-300">
					Impersonating User
				</span>
			</div>

			{/* User Info */}
			<div className="mb-3 flex items-center gap-3">
				<div className="relative">
					<Avatar className="h-10 w-10 border-2 border-orange-200 dark:border-orange-800">
						<AvatarImage
							src={session.user.image || undefined}
							alt={session.user.name}
						/>
						<AvatarFallback className="font-medium text-xs">
							{getInitials(session.user.name)}
						</AvatarFallback>
					</Avatar>
					{/* Impersonation indicator */}
					<div className="-bottom-1 -right-1 absolute h-4 w-4 rounded-full border-2 border-white bg-orange-500 dark:border-gray-900" />
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<p className="truncate font-medium text-gray-900 text-sm dark:text-gray-100">
							{session.user.name}
						</p>
						<Badge
							variant="outline"
							className="border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
						>
							{Array.isArray(session.user.role)
								? session.user.role
										.map(
											(role) =>
												roleDisplayNames[role as keyof typeof roleDisplayNames],
										)
										.join(", ")
								: session.user.role
									? roleDisplayNames[
											session.user.role as keyof typeof roleDisplayNames
										]
									: ""}
						</Badge>
					</div>
					<p className="truncate text-gray-500 text-xs dark:text-gray-400">
						{session.user.email}
					</p>
				</div>
			</div>

			{/* Stop Button */}
			<StopImpersonationButton />
		</div>
	);
}
