import type { ReactNode } from "react";

import Link from "next/link";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import type { LucideIcon } from "lucide-react";
import { AlertCircle, ArrowLeft, Info, Loader2, Save } from "lucide-react";

// Main Layout Component
interface FormLayoutProps {
	children: ReactNode;
	className?: string;
}

export function FormLayout({ children, className }: FormLayoutProps) {
	return (
		<div className={cn("min-h-screen bg-muted/30", className)}>{children}</div>
	);
}

// Header Component
interface FormHeaderProps {
	backUrl: string;
	backLabel?: string;
	title: string;
	subtitle?: string;
	badge?: {
		label: string;
		variant?:
			| "default"
			| "secondary"
			| "destructive"
			| "outline"
			| "success"
			| "warning"
			| "info";
	};
}

export function FormHeader({
	backUrl,
	backLabel = "Back",
	title,
	subtitle,
	badge,
}: FormHeaderProps) {
	return (
		<div className="border-b bg-background">
			<div className="px-6 py-3">
				{/* Breadcrumb */}
				<div className="mb-2 flex items-center gap-2 text-muted-foreground text-sm">
					<Link
						href={backUrl}
						className="transition-colors hover:text-foreground"
					>
						{backLabel}
					</Link>
					<span>/</span>
					<span>{title}</span>
				</div>

				{/* Title */}
				<div className="flex items-center gap-3">
					<h1 className="font-semibold text-xl">{title}</h1>
					{badge && (
						<Badge variant={badge.variant} className="h-5 px-2 text-xs">
							{badge.label}
						</Badge>
					)}
				</div>
				{subtitle && (
					<p className="mt-0.5 text-muted-foreground text-sm">{subtitle}</p>
				)}
			</div>
		</div>
	);
}

// Content Container
interface FormContentProps {
	children: ReactNode;
	className?: string;
}

export function FormContent({ children, className }: FormContentProps) {
	return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

// Form Section Component
interface FormSectionProps {
	title: string;
	description?: string;
	icon?: LucideIcon;
	required?: boolean;
	children: ReactNode;
	className?: string;
}

export function FormSection({
	title,
	description,
	icon: Icon,
	required,
	children,
	className,
}: FormSectionProps) {
	return (
		<Card className={cn("bg-background", className)}>
			<CardHeader className="py-3">
				<div className="flex items-center gap-2">
					{Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
					<CardTitle className="text-base">
						{title}
						{required && <span className="ml-1 text-destructive">*</span>}
					</CardTitle>
				</div>
				{description && (
					<CardDescription className="mt-1 text-xs">
						{description}
					</CardDescription>
				)}
			</CardHeader>
			<CardContent className="space-y-4">{children}</CardContent>
		</Card>
	);
}

// Form Field Component
interface FormFieldProps {
	label: string;
	required?: boolean;
	error?: string;
	hint?: string;
	className?: string;
	children: ReactNode;
}

export function FormField({
	label,
	required,
	error,
	hint,
	className,
	children,
}: FormFieldProps) {
	return (
		<div className={cn("space-y-1.5", className)}>
			<Label className="font-medium text-sm">
				{label}
				{required && <span className="ml-1 text-destructive">*</span>}
			</Label>
			{children}
			{hint && !error && (
				<p className="text-muted-foreground text-xs">{hint}</p>
			)}
			{error && (
				<p className="flex items-center gap-1 text-destructive text-xs">
					<AlertCircle className="h-3 w-3" />
					{error}
				</p>
			)}
		</div>
	);
}

// Form Row Component (for side-by-side fields)
interface FormRowProps {
	children: ReactNode;
	className?: string;
}

export function FormRow({ children, className }: FormRowProps) {
	return (
		<div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>
	);
}

// Form Actions Component
interface FormActionsProps {
	primaryLabel?: string;
	primaryIcon?: LucideIcon;
	primaryLoading?: boolean;
	primaryDisabled?: boolean;
	onPrimaryClick?: () => void;
	primaryType?: "button" | "submit";

	secondaryLabel?: string;
	secondaryHref?: string;
	onSecondaryClick?: () => void;

	showDivider?: boolean;
	className?: string;
}

export function FormActions({
	primaryLabel = "Save",
	primaryIcon: PrimaryIcon = Save,
	primaryLoading = false,
	primaryDisabled = false,
	onPrimaryClick,
	primaryType = "submit",

	secondaryLabel = "Cancel",
	secondaryHref,
	onSecondaryClick,

	showDivider = true,
	className,
}: FormActionsProps) {
	return (
		<>
			{showDivider && <div className="border-t" />}
			<div
				className={cn(
					"flex items-center justify-between bg-muted/50 px-6 py-4",
					className,
				)}
			>
				<div>
					{secondaryHref ? (
						<Link href={secondaryHref}>
							<Button variant="outline" size="sm">
								{secondaryLabel}
							</Button>
						</Link>
					) : (
						<Button
							variant="outline"
							size="sm"
							onClick={onSecondaryClick}
							type="button"
						>
							{secondaryLabel}
						</Button>
					)}
				</div>
				<Button
					size="sm"
					disabled={primaryDisabled || primaryLoading}
					onClick={onPrimaryClick}
					type={primaryType}
				>
					{primaryLoading ? (
						<>
							<Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
							Processing...
						</>
					) : (
						<>
							<PrimaryIcon className="mr-1.5 h-3.5 w-3.5" />
							{primaryLabel}
						</>
					)}
				</Button>
			</div>
		</>
	);
}

// Info Banner Component
interface InfoBannerProps {
	title?: string;
	message: string;
	variant?: "info" | "warning" | "error" | "success";
	className?: string;
}

export function InfoBanner({
	title,
	message,
	variant = "info",
	className,
}: InfoBannerProps) {
	const variants = {
		info: "bg-blue-50 border-blue-200 text-blue-800",
		warning: "bg-amber-50 border-amber-200 text-amber-800",
		error: "bg-red-50 border-red-200 text-red-800",
		success: "bg-green-50 border-green-200 text-green-800",
	};

	const icons = {
		info: Info,
		warning: AlertCircle,
		error: AlertCircle,
		success: Info,
	};

	const Icon = icons[variant];

	return (
		<div
			className={cn(
				"flex items-start gap-2 rounded-lg border p-3",
				variants[variant],
				className,
			)}
		>
			<Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
			<div className="text-sm">
				{title && <p className="mb-0.5 font-medium">{title}</p>}
				<p>{message}</p>
			</div>
		</div>
	);
}

// Switch Field Component
interface SwitchFieldProps {
	label: string;
	description?: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
	className?: string;
}

export function SwitchField({
	label,
	description,
	checked,
	onCheckedChange,
	disabled,
	className,
}: SwitchFieldProps) {
	return (
		<div
			className={cn("flex items-center justify-between space-x-2", className)}
		>
			<div className="space-y-0.5">
				<Label htmlFor={label} className="font-medium text-sm">
					{label}
				</Label>
				{description && (
					<p className="text-muted-foreground text-xs">{description}</p>
				)}
			</div>
			<Switch
				id={label}
				checked={checked}
				onCheckedChange={onCheckedChange}
				disabled={disabled}
			/>
		</div>
	);
}

// Select Field Helper
interface SelectFieldProps {
	placeholder?: string;
	value?: string;
	onValueChange: (value: string) => void;
	options: { label: string; value: string }[];
	disabled?: boolean;
	className?: string;
}

export function SelectField({
	placeholder = "Select an option",
	value,
	onValueChange,
	options,
	disabled,
	className,
}: SelectFieldProps) {
	return (
		<Select value={value} onValueChange={onValueChange} disabled={disabled}>
			<SelectTrigger className={cn("h-9", className)}>
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
	);
}

// Input Field Helper
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
	error?: boolean;
}

export function InputField({ error, className, ...props }: InputFieldProps) {
	return (
		<Input
			className={cn(
				"h-9",
				error && "border-destructive focus:ring-destructive",
				className,
			)}
			{...props}
		/>
	);
}

// Textarea Field Helper
interface TextareaFieldProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	error?: boolean;
}

export function TextareaField({
	error,
	className,
	...props
}: TextareaFieldProps) {
	return (
		<Textarea
			className={cn(
				"min-h-[80px] resize-none",
				error && "border-destructive focus:ring-destructive",
				className,
			)}
			{...props}
		/>
	);
}
