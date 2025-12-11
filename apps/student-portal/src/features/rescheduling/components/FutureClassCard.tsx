"use client";

import { format } from "date-fns";
import { Calendar, Clock, User } from "lucide-react";

import type { FutureClass } from "../types";
import { formatTimeRange } from "../utils/generateFutureClasses";

interface FutureClassCardProps {
	futureClass: FutureClass;
	isSelected: boolean;
	onSelect: () => void;
}

export function FutureClassCard({
	futureClass,
	isSelected,
	onSelect,
}: FutureClassCardProps) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${
				isSelected
					? "border-primary bg-primary/5 ring-2 ring-primary/20"
					: "border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30"
			}`}
		>
			<div className="space-y-3">
				{/* Date */}
				<div className="flex items-center gap-2">
					<Calendar className="h-4 w-4 text-primary" />
					<span className="font-semibold">
						{format(futureClass.date, "EEEE, MMMM d, yyyy")}
					</span>
				</div>

				{/* Time */}
				<div className="flex items-center gap-2 text-muted-foreground text-sm">
					<Clock className="h-4 w-4" />
					<span>
						{formatTimeRange(futureClass.startTime, futureClass.endTime)}
					</span>
				</div>

				{/* Teacher */}
				{futureClass.teacher && (
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<User className="h-4 w-4" />
						<span>{futureClass.teacher.name}</span>
					</div>
				)}
			</div>
		</button>
	);
}
