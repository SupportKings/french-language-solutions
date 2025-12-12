import { useEffect, useState } from "react";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { AnimatePresence, motion } from "motion/react";

interface TimeDisplayProps {
	timestamp: string;
	className?: string;
	showTooltip?: boolean;
}

function formatRelativeTime(date: Date): string {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) {
		return "Less than a minute ago";
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes}m ago`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours}h ago`;
	}

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) {
		return `${diffInDays}d ago`;
	}

	const diffInWeeks = Math.floor(diffInDays / 7);
	if (diffInWeeks < 4) {
		return `${diffInWeeks}w ago`;
	}

	const diffInMonths = Math.floor(diffInDays / 30);
	if (diffInMonths < 12) {
		return `${diffInMonths}mo ago`;
	}

	const diffInYears = Math.floor(diffInDays / 365);
	return `${diffInYears}y ago`;
}

function formatTimestamp(timestamp: string): string {
	if (!timestamp) return "Unknown time";
	// Parse timestamp - handle both UTC and timezone-aware formats
	let date: Date;

	// If timestamp already has timezone info (Z or +/-), use as-is
	if (
		timestamp.includes("Z") ||
		timestamp.includes("+") ||
		timestamp.includes("-")
	) {
		date = new Date(timestamp);
	} else {
		// If no timezone info, treat as UTC by appending Z
		date = new Date(timestamp + "Z");
	}

	if (Number.isNaN(date.getTime())) return "Invalid date";
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
	});
}

export function TimeDisplay({
	timestamp,
	className = "",
	showTooltip = true,
}: TimeDisplayProps) {
	const [relativeTime, setRelativeTime] = useState(() => {
		if (!timestamp) return "Unknown time";

		let date: Date;
		// If timestamp already has timezone info (Z or +/-), use as-is
		if (
			timestamp.includes("Z") ||
			timestamp.includes("+") ||
			timestamp.includes("-")
		) {
			date = new Date(timestamp);
		} else {
			// If no timezone info, treat as UTC by appending Z
			date = new Date(timestamp + "Z");
		}

		if (Number.isNaN(date.getTime())) return "Invalid date";
		return formatRelativeTime(date);
	});

	useEffect(() => {
		if (!timestamp) return;

		const updateTime = () => {
			let date: Date;
			// If timestamp already has timezone info (Z or +/-), use as-is
			if (
				timestamp.includes("Z") ||
				timestamp.includes("+") ||
				timestamp.includes("-")
			) {
				date = new Date(timestamp);
			} else {
				// If no timezone info, treat as UTC by appending Z
				date = new Date(timestamp + "Z");
			}

			if (Number.isNaN(date.getTime())) {
				setRelativeTime("Invalid date");
				return;
			}
			setRelativeTime(formatRelativeTime(date));
		};

		// Update immediately
		updateTime();

		// Update every minute
		const interval = setInterval(updateTime, 60000);

		return () => clearInterval(interval);
	}, [timestamp]);

	const timeContent = (
		<AnimatePresence mode="wait">
			<motion.span
				key={relativeTime}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				transition={{
					duration: 0.2,
					ease: [0.22, 1, 0.36, 1],
				}}
				className={className}
			>
				{relativeTime}
			</motion.span>
		</AnimatePresence>
	);

	if (!showTooltip) {
		return timeContent;
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className="cursor-default">{timeContent}</span>
				</TooltipTrigger>
				<TooltipContent>
					<p>{formatTimestamp(timestamp)}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
