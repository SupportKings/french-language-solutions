"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DetailViewProps {
	children: ReactNode;
	className?: string;
}

export function DetailView({ children, className }: DetailViewProps) {
	return (
		<div className={cn("min-h-screen bg-background", className)}>
			<div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
				{children}
			</div>
		</div>
	);
}

interface DetailViewHeaderProps {
	backUrl: string;
	backLabel?: string;
	title: string;
	subtitle?: string;
	badge?: ReactNode;
	actions?: ReactNode;
}

export function DetailViewHeader({
	backUrl,
	backLabel = "Back",
	title,
	subtitle,
	badge,
	actions
}: DetailViewHeaderProps) {
	return (
		<div className="mb-8">
			<Link href={backUrl}>
				<Button variant="ghost" size="sm" className="mb-4">
					<ArrowLeft className="mr-2 h-4 w-4" />
					{backLabel}
				</Button>
			</Link>
			
			<div className="flex items-start justify-between">
				<div className="space-y-1">
					<div className="flex items-center gap-3">
						<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
						{badge}
					</div>
					{subtitle && (
						<p className="text-muted-foreground">{subtitle}</p>
					)}
				</div>
				{actions && (
					<div className="flex items-center gap-2">
						{actions}
					</div>
				)}
			</div>
		</div>
	);
}

interface DetailViewContentProps {
	children: ReactNode;
	className?: string;
}

export function DetailViewContent({ children, className }: DetailViewContentProps) {
	return (
		<div className={cn("space-y-6", className)}>
			{children}
		</div>
	);
}

interface DetailViewSectionProps {
	title: string;
	description?: string;
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
}

export function DetailViewSection({
	title,
	description,
	actions,
	children,
	className
}: DetailViewSectionProps) {
	return (
		<div className={cn("rounded-lg border bg-card p-6", className)}>
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold">{title}</h2>
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
				</div>
				{actions}
			</div>
			<div>{children}</div>
		</div>
	);
}

interface DetailViewFieldProps {
	label: string;
	value: ReactNode;
	icon?: React.ComponentType<{ className?: string }>;
	action?: ReactNode;
	className?: string;
}

export function DetailViewField({
	label,
	value,
	icon: Icon,
	action,
	className
}: DetailViewFieldProps) {
	return (
		<div className={cn("space-y-1", className)}>
			<p className="text-sm text-muted-foreground">{label}</p>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					{Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
					<p className="text-sm font-medium">{value || "—"}</p>
				</div>
				{action}
			</div>
		</div>
	);
}