"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Calendar,
	Clock,
	Users,
	Video,
	MapPin,
	BookOpen,
	Edit,
	Trash,
	ExternalLink,
	User,
	Link2,
	FileText,
} from "lucide-react";
import type { Class } from "../schemas/class.schema";
import { cn } from "@/lib/utils";

interface ClassViewProps {
	classData: Class & { cohort?: any };
	isDrawer?: boolean;
	onClose?: () => void;
}

export function ClassView({ classData, isDrawer = false, onClose }: ClassViewProps) {
	const router = useRouter();

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "scheduled":
				return "default";
			case "in_progress":
				return "secondary";
			case "completed":
				return "success";
			case "cancelled":
				return "destructive";
			default:
				return "outline";
		}
	};

	const getModeBadgeVariant = (mode: string) => {
		switch (mode) {
			case "online":
				return "outline";
			case "in_person":
				return "secondary";
			case "hybrid":
				return "default";
			default:
				return "outline";
		}
	};

	const formatDateTime = (dateTime: string) => {
		try {
			return format(new Date(dateTime), "PPP p");
		} catch {
			return dateTime;
		}
	};

	const content = (
		<div className="space-y-6">
			{/* Header Section */}
			<div>
				<div className="flex items-start justify-between">
					<div>
						<h2 className={cn("text-2xl font-bold tracking-tight", isDrawer && "text-xl")}>
							{classData.name}
						</h2>
						{classData.description && (
							<p className="mt-2 text-muted-foreground">{classData.description}</p>
						)}
					</div>
					<div className="flex items-center gap-2">
						<Badge variant={getStatusBadgeVariant(classData.status)}>
							{classData.status.replace("_", " ")}
						</Badge>
						<Badge variant={getModeBadgeVariant(classData.mode)}>
							{classData.mode === "online" && <Video className="mr-1 h-3 w-3" />}
							{classData.mode === "in_person" && <MapPin className="mr-1 h-3 w-3" />}
							{classData.mode.replace("_", " ")}
						</Badge>
						{!classData.is_active && (
							<Badge variant="secondary">Inactive</Badge>
						)}
					</div>
				</div>
			</div>

			<Separator />

			{/* Schedule Information */}
			<Card className="bg-card/95 backdrop-blur-sm border-border/50">
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Calendar className="h-4 w-4" />
						Schedule
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex items-center gap-4 text-sm">
						<Clock className="h-4 w-4 text-muted-foreground" />
						<div>
							<div className="font-medium">Start Time</div>
							<div className="text-muted-foreground">{formatDateTime(classData.start_time)}</div>
						</div>
					</div>
					<div className="flex items-center gap-4 text-sm">
						<Clock className="h-4 w-4 text-muted-foreground" />
						<div>
							<div className="font-medium">End Time</div>
							<div className="text-muted-foreground">{formatDateTime(classData.end_time)}</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Capacity Information */}
			<Card className="bg-card/95 backdrop-blur-sm border-border/50">
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<Users className="h-4 w-4" />
						Enrollment
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<span className="text-sm text-muted-foreground">Current / Maximum</span>
							<span className="font-semibold">
								{classData.current_enrollment} / {classData.max_students}
							</span>
						</div>
						<div className="w-full bg-secondary rounded-full h-2">
							<div
								className="bg-primary h-2 rounded-full transition-all"
								style={{
									width: `${Math.min(
										(classData.current_enrollment / classData.max_students) * 100,
										100
									)}%`,
								}}
							/>
						</div>
						<p className="text-xs text-muted-foreground">
							{classData.max_students - classData.current_enrollment} spots remaining
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Location & Resources */}
			{(classData.room || classData.meeting_link || classData.materials) && (
				<Card className="bg-card/95 backdrop-blur-sm border-border/50">
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<Link2 className="h-4 w-4" />
							Resources
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{classData.room && (
							<div className="flex items-center gap-4 text-sm">
								<MapPin className="h-4 w-4 text-muted-foreground" />
								<div>
									<div className="font-medium">Room/Location</div>
									<div className="text-muted-foreground">{classData.room}</div>
								</div>
							</div>
						)}
						{classData.meeting_link && (
							<div className="flex items-center gap-4 text-sm">
								<Video className="h-4 w-4 text-muted-foreground" />
								<div>
									<div className="font-medium">Meeting Link</div>
									<a
										href={classData.meeting_link}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline inline-flex items-center gap-1"
									>
										Join Meeting
										<ExternalLink className="h-3 w-3" />
									</a>
								</div>
							</div>
						)}
						{classData.materials && (
							<div className="flex items-center gap-4 text-sm">
								<FileText className="h-4 w-4 text-muted-foreground" />
								<div>
									<div className="font-medium">Materials</div>
									<a
										href={classData.materials}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline inline-flex items-center gap-1"
									>
										View Materials
										<ExternalLink className="h-3 w-3" />
									</a>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Cohort Information */}
			{classData.cohort && (
				<Card className="bg-card/95 backdrop-blur-sm border-border/50">
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<BookOpen className="h-4 w-4" />
							Cohort Details
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Level</span>
								<span className="font-medium">{classData.cohort.starting_level}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Start Date</span>
								<span className="font-medium">{classData.cohort.start_date}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Status</span>
								<Badge variant="outline" className="text-xs">
									{classData.cohort.cohort_status}
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Internal Notes */}
			{classData.notes && (
				<Card className="bg-card/95 backdrop-blur-sm border-border/50">
					<CardHeader>
						<CardTitle className="text-base">Internal Notes</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground whitespace-pre-wrap">
							{classData.notes}
						</p>
					</CardContent>
				</Card>
			)}

			{/* Metadata */}
			<Card className="bg-muted/50">
				<CardContent className="pt-6">
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Created</span>
							<span>{formatDateTime(classData.created_at)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Last Updated</span>
							<span>{formatDateTime(classData.updated_at)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">ID</span>
							<code className="text-xs bg-muted px-1 py-0.5 rounded">
								{classData.id}
							</code>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Actions */}
			<div className="flex gap-3 pt-4">
				<Button
					className="flex-1"
					onClick={() => router.push(`/admin/classes/${classData.id}/edit`)}
				>
					<Edit className="mr-2 h-4 w-4" />
					Edit Class
				</Button>
				<Button
					variant="destructive"
					size="icon"
					onClick={() => {
						// Handle delete
					}}
				>
					<Trash className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);

	if (isDrawer) {
		return (
			<Sheet open onOpenChange={onClose}>
				<SheetContent className="w-full sm:max-w-xl overflow-y-auto">
					<SheetHeader>
						<SheetTitle>Class Details</SheetTitle>
						<SheetDescription>
							View and manage class information
						</SheetDescription>
					</SheetHeader>
					<div className="mt-6">{content}</div>
				</SheetContent>
			</Sheet>
		);
	}

	return content;
}