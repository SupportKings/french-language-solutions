import Link from "next/link";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

import type { LucideIcon } from "lucide-react";

interface LinkedRecordBadgeProps {
	href: string;
	label: string;
	icon: LucideIcon;
	className?: string;
	onClick?: (e: React.MouseEvent) => void;
}

export function LinkedRecordBadge({
	href,
	label,
	icon: Icon,
	className,
	onClick,
}: LinkedRecordBadgeProps) {
	return (
		<Link
			href={href}
			className="inline-flex items-center"
			onClick={(e) => {
				e.stopPropagation();
				onClick?.(e);
			}}
		>
			<Badge
				variant="secondary"
				className={cn(
					"cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground",
					className,
				)}
			>
				<Icon className="mr-1 h-3 w-3" />
				{label}
			</Badge>
		</Link>
	);
}
