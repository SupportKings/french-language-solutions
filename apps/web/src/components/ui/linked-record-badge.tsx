import Link from "next/link";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

import type { LucideIcon } from "lucide-react";

interface LinkedRecordBadgeProps {
	href: string;
	label: string;
	icon: LucideIcon;
	className?: string;
	title?: string;
	onClick?: (e: React.MouseEvent) => void;
	disabled?: boolean;
}

export function LinkedRecordBadge({
	href,
	label,
	icon: Icon,
	className,
	title,
	onClick,
	disabled = false,
}: LinkedRecordBadgeProps) {
	const badgeContent = (
		<Badge
			variant="secondary"
			className={cn(
				"max-w-full transition-colors",
				disabled
					? "cursor-default"
					: "cursor-pointer hover:bg-primary hover:text-primary-foreground",
				className,
			)}
		>
			<Icon className="mr-1 h-3 w-3 flex-shrink-0" />
			<span className="truncate">{label}</span>
		</Badge>
	);

	if (disabled) {
		return (
			<div
				className="inline-flex w-fit max-w-full items-center"
				title={title || label}
			>
				{badgeContent}
			</div>
		);
	}

	return (
		<Link
			href={href}
			className="inline-flex w-fit max-w-full items-center"
			onClick={(e) => {
				e.stopPropagation();
				onClick?.(e);
			}}
			title={title || label}
		>
			{badgeContent}
		</Link>
	);
}
