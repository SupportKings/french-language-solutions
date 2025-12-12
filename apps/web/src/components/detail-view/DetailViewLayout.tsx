import type { ReactNode } from "react";

import Link from "next/link";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Edit, MoreVertical } from "lucide-react";

// Main Layout Component
interface DetailViewLayoutProps {
	children: ReactNode;
	className?: string;
}

export function DetailViewLayout({
	children,
	className,
}: DetailViewLayoutProps) {
	return (
		<div className={cn("min-h-screen bg-muted/30", className)}>{children}</div>
	);
}

// Header Component
interface DetailViewHeaderProps {
	backUrl: string;
	backLabel?: string;
	title: string;
	subtitle?: string;
	avatar?: {
		initials: string;
		className?: string;
	};
	badges?: {
		label: string;
		variant?:
			| "default"
			| "secondary"
			| "destructive"
			| "outline"
			| "success"
			| "warning"
			| "info";
		className?: string;
	}[];
	stats?: string;
	actions?: {
		icon: LucideIcon;
		label: string;
		onClick?: () => void;
		href?: string;
		destructive?: boolean;
	}[];
	editUrl?: string;
}

export function DetailViewHeader({
	backUrl,
	backLabel = "Back",
	title,
	subtitle,
	avatar,
	badges = [],
	stats,
	actions = [],
	editUrl,
}: DetailViewHeaderProps) {
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

				{/* Main Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{/* Avatar */}
						{avatar && (
							<div
								className={cn(
									"flex h-10 w-10 items-center justify-center rounded-full bg-primary/10",
									avatar.className,
								)}
							>
								<span className="font-semibold text-primary text-sm">
									{avatar.initials}
								</span>
							</div>
						)}

						{/* Title and Badges */}
						<div>
							<h1 className="font-semibold text-xl">{title}</h1>
							{(subtitle || badges.length > 0 || stats) && (
								<div className="mt-0.5 flex items-center gap-2">
									{subtitle && (
										<span className="text-muted-foreground text-sm">
											{subtitle}
										</span>
									)}
									{badges.map((badge, i) => (
										<Badge
											key={i}
											variant={badge.variant}
											className={cn("h-4 px-1.5 text-[10px]", badge.className)}
										>
											{badge.label}
										</Badge>
									))}
									{stats && (
										<span className="text-muted-foreground text-xs">
											{stats}
										</span>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2">
						{actions.length > 0 && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm">
										<MoreVertical className="h-3.5 w-3.5" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									{actions.map((action, i) => {
										const Icon = action.icon;
										const isDestructive = action.destructive;

										return (
											<div key={i}>
												{isDestructive && i > 0 && <DropdownMenuSeparator />}
												{action.href ? (
													<Link href={action.href}>
														<DropdownMenuItem
															className={
																isDestructive ? "text-destructive" : ""
															}
														>
															<Icon className="mr-2 h-3.5 w-3.5" />
															{action.label}
														</DropdownMenuItem>
													</Link>
												) : (
													<DropdownMenuItem
														onClick={action.onClick}
														className={isDestructive ? "text-destructive" : ""}
													>
														<Icon className="mr-2 h-3.5 w-3.5" />
														{action.label}
													</DropdownMenuItem>
												)}
											</div>
										);
									})}
								</DropdownMenuContent>
							</DropdownMenu>
						)}

						{editUrl && (
							<Link href={editUrl}>
								<Button size="sm">
									<Edit className="mr-1.5 h-3.5 w-3.5" />
									Edit
								</Button>
							</Link>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

// Content Container
interface DetailViewContentProps {
	children: ReactNode;
	className?: string;
}

export function DetailViewContent({
	children,
	className,
}: DetailViewContentProps) {
	return <div className={cn("space-y-4 px-6 py-4", className)}>{children}</div>;
}

// Related Data Cards (for enrollments, assessments, etc.)
interface RelatedDataCardProps {
	title: string;
	subtitle?: string;
	count?: number;
	actionLabel?: string;
	actionIcon?: LucideIcon;
	actionHref?: string;
	onAction?: () => void;
	children: ReactNode;
	className?: string;
}

export function RelatedDataCard({
	title,
	subtitle,
	count,
	actionLabel,
	actionIcon: ActionIcon,
	actionHref,
	onAction,
	children,
	className,
}: RelatedDataCardProps) {
	return (
		<Card className={cn("bg-background", className)}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="font-semibold text-base">{title}</CardTitle>
						{subtitle && (
							<p className="mt-0.5 text-muted-foreground text-xs">{subtitle}</p>
						)}
					</div>
					{(actionLabel || actionHref) &&
						(actionHref ? (
							<Link href={actionHref}>
								<Button size="sm" variant="outline">
									{ActionIcon && <ActionIcon className="mr-1.5 h-3.5 w-3.5" />}
									{actionLabel}
								</Button>
							</Link>
						) : (
							<Button size="sm" variant="outline" onClick={onAction}>
								{ActionIcon && <ActionIcon className="mr-1.5 h-3.5 w-3.5" />}
								{actionLabel}
							</Button>
						))}
				</div>
			</CardHeader>
			<CardContent className="pt-0">{children}</CardContent>
		</Card>
	);
}

// Info Section Component
interface InfoSectionProps {
	title: string;
	icon?: LucideIcon;
	children: ReactNode;
	className?: string;
}

export function InfoSection({
	title,
	icon: Icon,
	children,
	className,
}: InfoSectionProps) {
	return (
		<div className={className}>
			<h3 className="mb-2 flex items-center gap-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
				{Icon && <Icon className="h-3 w-3" />}
				{title}
			</h3>
			<div className="space-y-2">{children}</div>
		</div>
	);
}

// Info Field Component
interface InfoFieldProps {
	label: string;
	value: ReactNode;
	icon?: LucideIcon;
	copyable?: boolean;
	className?: string;
}

export function InfoField({
	label,
	value,
	icon: Icon,
	className,
}: InfoFieldProps) {
	return (
		<div className={cn("flex items-center gap-2 text-sm", className)}>
			{Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
			<span className="text-muted-foreground">{label}:</span>
			<span className="font-medium">{value || "—"}</span>
		</div>
	);
}

// Overview Card Component
interface OverviewItemProps {
	label: string;
	value: string | number;
	icon?: LucideIcon;
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

export function OverviewCard({
	title = "Overview",
	items,
}: {
	title?: string;
	items: OverviewItemProps[];
}) {
	return (
		<Card className="bg-background">
			<CardHeader className="py-3">
				<CardTitle className="text-sm">{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{items.map((item, i) => (
					<div key={i} className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							{item.icon && <item.icon className="h-3.5 w-3.5" />}
							<span>{item.label}</span>
						</div>
						<div className="flex items-center gap-1">
							<span className="font-semibold text-lg">{item.value}</span>
							{item.badge && (
								<Badge
									variant={item.badge.variant}
									className="h-4 px-1 text-[10px]"
								>
									{item.badge.label}
								</Badge>
							)}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}

// System Info Card Component
interface SystemInfoProps {
	id: string;
	userId?: string;
	createdAt: string;
	updatedAt: string;
	additionalFields?: { label: string; value: string }[];
}

export function SystemInfoCard({
	id,
	userId,
	createdAt,
	updatedAt,
	additionalFields = [],
}: SystemInfoProps) {
	return (
		<Card className="bg-background">
			<CardHeader className="py-3">
				<CardTitle className="text-sm">System</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				<div className="group flex items-center justify-between">
					<span className="text-muted-foreground text-sm">ID:</span>
					<div className="flex items-center gap-1">
						<code className="rounded bg-muted px-1 py-0.5 text-xs">
							{id.slice(0, 8)}...
						</code>
					</div>
				</div>
				{userId && (
					<div className="text-sm">
						<span className="text-muted-foreground">User:</span>
						<code className="ml-2 rounded bg-muted px-1 py-0.5 text-xs">
							{userId.slice(0, 8)}...
						</code>
					</div>
				)}
				{additionalFields.map((field, i) => (
					<div key={i} className="text-sm">
						<span className="text-muted-foreground">{field.label}:</span>
						<span className="ml-2">{field.value}</span>
					</div>
				))}
				<div className="text-sm">
					<span className="text-muted-foreground">Created at:</span>
					<span className="ml-2">{createdAt}</span>
				</div>
				<div className="text-sm">
					<span className="text-muted-foreground">Updated at:</span>
					<span className="ml-2">{updatedAt}</span>
				</div>
			</CardContent>
		</Card>
	);
}
