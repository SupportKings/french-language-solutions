import { cn } from "@/lib/utils";

interface ProgressBarProps {
	value: number;
	className?: string;
	showLabel?: boolean;
	size?: "sm" | "md" | "lg";
}

/**
 * Get color based on completion percentage
 */
function getProgressColor(value: number): string {
	if (value >= 80) return "bg-green-500";
	if (value >= 60) return "bg-blue-500";
	if (value >= 40) return "bg-yellow-500";
	if (value >= 20) return "bg-orange-500";
	return "bg-red-500";
}

/**
 * Progress bar component with conditional coloring based on percentage
 */
export function ProgressBar({
	value,
	className,
	showLabel = true,
	size = "md",
}: ProgressBarProps) {
	// Clamp value between 0 and 100
	const percentage = Math.min(100, Math.max(0, value));

	const sizeClasses = {
		sm: "h-1.5",
		md: "h-2",
		lg: "h-3",
	};

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<div
				className={cn(
					"relative w-full overflow-hidden rounded-full bg-muted/50",
					sizeClasses[size],
				)}
			>
				<div
					className={cn(
						"h-full rounded-full transition-all duration-500 ease-out",
						getProgressColor(percentage),
					)}
					style={{ width: `${percentage}%` }}
				/>
			</div>
			{showLabel && (
				<span className="min-w-[3ch] font-medium text-muted-foreground text-xs">
					{Math.round(percentage)}%
				</span>
			)}
		</div>
	);
}
