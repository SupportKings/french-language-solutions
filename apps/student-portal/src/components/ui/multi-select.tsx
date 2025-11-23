"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { Check, ChevronDown, X } from "lucide-react";

export interface MultiSelectOption {
	label: string;
	value: string;
}

interface MultiSelectProps {
	options: MultiSelectOption[];
	value?: string[];
	onValueChange?: (value: string[]) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export function MultiSelect({
	options,
	value = [],
	onValueChange,
	placeholder = "Select items...",
	className,
	disabled = false,
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);

	const handleSelect = (optionValue: string) => {
		const newValue = value.includes(optionValue)
			? value.filter((v) => v !== optionValue)
			: [...value, optionValue];
		onValueChange?.(newValue);
	};

	const handleRemove = (optionValue: string, e: React.MouseEvent) => {
		e.stopPropagation();
		onValueChange?.(value.filter((v) => v !== optionValue));
	};

	const selectedLabels = value.map((v) => {
		const option = options.find((opt) => opt.value === v);
		return option ? option.label : v;
	});

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					role="combobox"
					aria-expanded={open}
					className={cn(
						"flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
						!value.length && "text-muted-foreground",
						className,
					)}
					disabled={disabled}
					onClick={() => setOpen(!open)}
				>
					<div className="flex flex-1 flex-wrap gap-1">
						{value.length > 0 ? (
							value.map((val) => {
								const option = options.find((opt) => opt.value === val);
								return (
									<Badge
										key={val}
										variant="secondary"
										className="mr-1 h-5 px-1.5 text-xs"
									>
										{option?.label || val}
										<span
											className="ml-1 cursor-pointer rounded-full hover:bg-muted-foreground/20"
											onClick={(e) => handleRemove(val, e)}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													handleRemove(val, e as any);
												}
											}}
											role="button"
											tabIndex={0}
										>
											<X className="h-3 w-3" />
										</span>
									</Badge>
								);
							})
						) : (
							<span>{placeholder}</span>
						)}
					</div>
					<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[--radix-popover-trigger-width] p-0"
				align="start"
			>
				<Command>
					<CommandInput placeholder="Search..." />
					<CommandEmpty>No item found.</CommandEmpty>
					<CommandGroup className="max-h-64 overflow-auto">
						{options.map((option) => (
							<CommandItem
								key={option.value}
								value={option.value}
								onSelect={() => handleSelect(option.value)}
							>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										value.includes(option.value) ? "opacity-100" : "opacity-0",
									)}
								/>
								{option.label}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
