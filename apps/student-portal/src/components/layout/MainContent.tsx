"use client";

import { usePathname } from "next/navigation";

interface MainContentProps {
	children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
	const pathname = usePathname();
	const isChatsRoute = pathname.startsWith("/chats");

	return (
		<main className="flex-1 overflow-auto">
			{isChatsRoute ? (
				children
			) : (
				<div className="container max-w-screen-xl py-6 lg:py-8">{children}</div>
			)}
		</main>
	);
}
