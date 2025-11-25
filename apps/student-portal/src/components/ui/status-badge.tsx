import { cn } from "@/lib/utils";

import { Badge } from "./badge";

interface StatusBadgeProps {
	children: React.ReactNode;
	className?: string;
	variant?:
		| "default"
		| "secondary"
		| "destructive"
		| "outline"
		| "success"
		| "warning"
		| "info";
}

export function StatusBadge({
	children,
	className,
	variant = "secondary",
}: StatusBadgeProps) {
	// Determine variant based on status text if not explicitly set
	const statusText = typeof children === "string" ? children.toLowerCase() : "";

	let autoVariant = variant;
	if (variant === "secondary") {
		if (
			statusText.includes("paid") ||
			statusText.includes("completed") ||
			statusText.includes("active") ||
			statusText.includes("welcome")
		) {
			autoVariant = "success";
		} else if (
			statusText.includes("declined") ||
			statusText.includes("dropped") ||
			statusText.includes("cancelled") ||
			statusText.includes("abandoned")
		) {
			autoVariant = "destructive";
		} else if (
			statusText.includes("interested") ||
			statusText.includes("in_progress") ||
			statusText.includes("signed") ||
			statusText.includes("scheduled") ||
			statusText.includes("transitioning") ||
			statusText.includes("offboarding")
		) {
			autoVariant = "warning";
		} else if (statusText.includes("open") || statusText.includes("filled")) {
			autoVariant = "info";
		}
	}

	return (
		<Badge variant={autoVariant} className={cn("capitalize", className)}>
			{children}
		</Badge>
	);
}
