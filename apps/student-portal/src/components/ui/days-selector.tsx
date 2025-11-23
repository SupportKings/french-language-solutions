"use client";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const DAYS_OF_WEEK = [
	{ label: "Mon", value: "monday", fullLabel: "Monday" },
	{ label: "Tue", value: "tuesday", fullLabel: "Tuesday" },
	{ label: "Wed", value: "wednesday", fullLabel: "Wednesday" },
	{ label: "Thu", value: "thursday", fullLabel: "Thursday" },
	{ label: "Fri", value: "friday", fullLabel: "Friday" },
	{ label: "Sat", value: "saturday", fullLabel: "Saturday" },
	{ label: "Sun", value: "sunday", fullLabel: "Sunday" },
];

interface DaysSelectorProps {
	value: string[];
	onChange: (days: string[]) => void;
	className?: string;
	disabled?: boolean;
}

export function DaysSelector({
	value = [],
	onChange,
	className,
	disabled,
}: DaysSelectorProps) {
	const handleValueChange = (newValue: string[]) => {
		onChange(newValue);
	};

	return (
		<div className={cn("space-y-1", className)}>
			<ToggleGroup
				type="multiple"
				value={value}
				onValueChange={handleValueChange}
				className="flex flex-wrap justify-start"
				disabled={disabled}
			>
				{DAYS_OF_WEEK.map((day) => (
					<ToggleGroupItem
						key={day.value}
						value={day.value}
						variant="outline"
						size="sm"
						className="h-10 px-4 font-medium text-sm transition-all duration-200 hover:shadow-sm data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md"
						title={day.fullLabel}
					>
						{day.label}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}

interface DaysDisplayProps {
	value: string[];
	className?: string;
	emptyText?: string;
}

export function DaysDisplay({
	value = [],
	className,
	emptyText = "No days selected",
}: DaysDisplayProps) {
	if (!value || value.length === 0) {
		return (
			<span className={cn("text-muted-foreground text-sm", className)}>
				{emptyText}
			</span>
		);
	}

	const sortedDays = DAYS_OF_WEEK.filter((day) => value.includes(day.value));

	return (
		<div className={cn("flex flex-wrap gap-1", className)}>
			{sortedDays.map((day) => (
				<Badge key={day.value} variant="secondary" className="text-xs">
					{day.label}
				</Badge>
			))}
		</div>
	);
}

export { DAYS_OF_WEEK };
