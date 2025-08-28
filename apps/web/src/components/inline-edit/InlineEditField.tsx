"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Check, Loader2, X } from "lucide-react";

interface InlineEditFieldProps {
	value: any;
	onSave: (value: any) => Promise<void>;
	type?: "text" | "textarea" | "select" | "badge" | "date";
	options?: { label: string; value: string }[];
	className?: string;
	editing?: boolean;
	placeholder?: string;
	required?: boolean;
	variant?: any;
}

export function InlineEditField({
	value,
	onSave,
	type = "text",
	options = [],
	className,
	editing = false,
	placeholder,
	required = false,
	variant,
}: InlineEditFieldProps) {
	const [localValue, setLocalValue] = useState(value);
	const [saving, setSaving] = useState(false);
	const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	useEffect(() => {
		if (editing && inputRef.current) {
			inputRef.current.focus();
			if ("select" in inputRef.current) {
				inputRef.current.select();
			}
		}
	}, [editing]);

	const handleSave = async () => {
		if (required && !localValue) return;
		if (localValue === value) return;

		setSaving(true);
		try {
			await onSave(localValue);
		} catch (error) {
			setLocalValue(value); // Reset on error
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		setLocalValue(value);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && type !== "textarea") {
			e.preventDefault();
			handleSave();
		}
		if (e.key === "Escape") {
			handleCancel();
		}
	};

	if (!editing) {
		// Display mode
		if (type === "badge") {
			return (
				<Badge variant={variant} className="h-5 text-xs">
					{value || "—"}
				</Badge>
			);
		}
		if (type === "date" && value) {
			const date = new Date(value);
			const formatted = date.toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
			return (
				<span className={cn("font-medium text-sm", className)}>
					{formatted}
				</span>
			);
		}
		return (
			<span className={cn("font-medium text-sm", className)}>
				{value || "—"}
			</span>
		);
	}

	// Edit mode
	return (
		<div className="flex items-center gap-2">
			{type === "text" && (
				<Input
					ref={inputRef as any}
					value={localValue || ""}
					onChange={(e) => setLocalValue(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={handleSave}
					placeholder={placeholder}
					className="h-8 text-sm"
					disabled={saving}
				/>
			)}

			{type === "textarea" && (
				<Textarea
					ref={inputRef as any}
					value={localValue || ""}
					onChange={(e) => setLocalValue(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={handleSave}
					placeholder={placeholder}
					className="min-h-[60px] text-sm"
					disabled={saving}
				/>
			)}

			{type === "select" && (
				<Select
					value={localValue}
					onValueChange={(val) => {
						setLocalValue(val);
						onSave(val);
					}}
					disabled={saving}
				>
					<SelectTrigger className="h-8 text-sm">
						<SelectValue placeholder={placeholder} />
					</SelectTrigger>
					<SelectContent>
						{options.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}

			{type === "date" && (
				<Input
					ref={inputRef as any}
					type="date"
					value={localValue || ""}
					onChange={(e) => setLocalValue(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={handleSave}
					placeholder={placeholder}
					className="h-8 text-sm"
					disabled={saving}
				/>
			)}

			{saving && <Loader2 className="h-4 w-4 animate-spin" />}
		</div>
	);
}
