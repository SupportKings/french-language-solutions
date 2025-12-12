"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { Check, ChevronsUpDown, Search } from "lucide-react";

interface SearchableSelectProps {
	value?: string;
	onValueChange?: (value: string) => void;
	options: { label: string; value: string }[];
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	className?: string;
	disabled?: boolean;
	showOnlyOnSearch?: boolean;
}

export function SearchableSelect({
	value,
	onValueChange,
	options,
	placeholder = "Select option...",
	searchPlaceholder = "Search...",
	emptyMessage = "No results found.",
	className,
	disabled,
	showOnlyOnSearch = false,
}: SearchableSelectProps) {
	const [open, setOpen] = React.useState(false);
	const [searchValue, setSearchValue] = React.useState("");

	const selectedOption = options.find((option) => option.value === value);

	// Filter options based on search
	const filteredOptions = React.useMemo(() => {
		if (showOnlyOnSearch && !searchValue) {
			return [];
		}

		if (!searchValue) {
			return options;
		}

		return options.filter((option) =>
			option.label.toLowerCase().includes(searchValue.toLowerCase()),
		);
	}, [options, searchValue, showOnlyOnSearch]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"w-full justify-between font-normal",
						!value && "text-muted-foreground",
						className,
					)}
				>
					<span className="truncate">
						{selectedOption?.label || placeholder}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start">
				<Command shouldFilter={false}>
					<div className="flex items-center border-b px-3">
						<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
						<input
							className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
							placeholder={searchPlaceholder}
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
						/>
					</div>
					<CommandList>
						{filteredOptions.length === 0 ? (
							<div className="py-6 text-center text-muted-foreground text-sm">
								{showOnlyOnSearch && !searchValue
									? "Type to search..."
									: emptyMessage}
							</div>
						) : (
							<CommandGroup>
								{filteredOptions.map((option) => (
									<CommandItem
										key={option.value}
										value={option.value}
										onSelect={() => {
											onValueChange?.(option.value);
											setOpen(false);
											setSearchValue("");
										}}
									>
										<Check
											className={cn(
												"mr-2 h-4 w-4",
												value === option.value ? "opacity-100" : "opacity-0",
											)}
										/>
										{option.label}
									</CommandItem>
								))}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
