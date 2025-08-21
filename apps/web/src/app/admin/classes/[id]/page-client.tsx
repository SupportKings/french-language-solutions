"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
	ChevronLeft, 
	Edit,
	Calendar,
	Clock,
	Users,
	MapPin,
	BookOpen,
	GraduationCap,
	Settings
} from "lucide-react";
import { useCohort, useCohortWithSessions } from "@/features/cohorts/queries/cohorts.queries";
import type { CohortStatus, RoomType } from "@/features/cohorts/schemas/cohort.schema";

interface CohortDetailPageClientProps {
	cohortId: string;
}

// Status badge variant mapping
const getStatusVariant = (status: CohortStatus) => {
	switch (status) {
		case "enrollment_open":
			return "default";
		case "enrollment_closed":
			return "secondary";
		case "class_ended":
			return "outline";
		default:
			return "outline";
	}
};

// Room type badge variant
const getRoomTypeVariant = (roomType: RoomType) => {
	switch (roomType) {
		case "for_one_to_one":
			return "default";
		case "medium":
			return "secondary";
		case "medium_plus":
			return "secondary";
		case "large":
			return "outline";
		default:
			return "outline";
	}
};

// Format status for display
const formatStatus = (status: CohortStatus) => {
	return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
};

// Format level for display
const formatLevel = (level: string | null) => {
	if (!level) return "Not specified";
	return level.replace("_", "+").toUpperCase();
};

export function CohortDetailPageClient({ cohortId }: CohortDetailPageClientProps) {
	const router = useRouter();
	const { data: cohort, isLoading } = useCohort(cohortId);
	const { data: cohortWithSessions, isLoading: isLoadingSessions } = useCohortWithSessions(cohortId);

	if (isLoading) {
		return (
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Skeleton className="h-4 w-24" />
				</div>
				
				{/* Main content */}
				<div className="grid gap-6 md:grid-cols-3">
					<div className="md:col-span-2 space-y-6">
						<Skeleton className="h-48 w-full" />
						<Skeleton className="h-32 w-full" />
					</div>
					<div className="space-y-6">
						<Skeleton className="h-32 w-full" />
					</div>
				</div>
			</div>
		);
	}

	if (!cohort) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Link
						href="/admin/classes"
						className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ChevronLeft className="mr-1 h-4 w-4" />
						Back to Classes
					</Link>
				</div>
				<div className="text-center py-12">
					<p className="text-lg font-semibold">Cohort not found</p>
					<p className="text-muted-foreground">The cohort you're looking for doesn't exist.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link
						href="/admin/classes"
						className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ChevronLeft className="mr-1 h-4 w-4" />
						Back to All Classes
					</Link>
				</div>
				<Button onClick={() => router.push(`/admin/classes/${cohortId}/edit`)}>
					<Edit className="mr-2 h-4 w-4" />
					Edit Cohort
				</Button>
			</div>

			{/* Cohort Header Info */}
			<div className="rounded-xl border bg-card/50 backdrop-blur-sm p-6">
				<div className="flex items-start justify-between">
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">
							{cohort.format.charAt(0).toUpperCase() + cohort.format.slice(1)} Cohort
						</h1>
						<p className="text-muted-foreground mt-1">
							{formatLevel(cohort.starting_level)} → {formatLevel(cohort.current_level)}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant={getStatusVariant(cohort.cohort_status)}>
							{formatStatus(cohort.cohort_status)}
						</Badge>
						{cohort.room_type && (
							<Badge variant={getRoomTypeVariant(cohort.room_type)}>
								<MapPin className="mr-1 h-3 w-3" />
								{cohort.room_type.replace("_", " ")}
							</Badge>
						)}
					</div>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid gap-6 md:grid-cols-3">
				{/* Left Column - Main Details */}
				<div className="md:col-span-2 space-y-6">
					{/* Cohort Details */}
					<Card className="p-6">
						<div className="flex items-center gap-2 mb-4">
							<Users className="h-5 w-5 text-muted-foreground" />
							<h3 className="font-semibold">Cohort Details</h3>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<label className="text-sm font-medium text-muted-foreground">Format</label>
								<p className="mt-1">{cohort.format.charAt(0).toUpperCase() + cohort.format.slice(1)}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-muted-foreground">Status</label>
								<p className="mt-1">{formatStatus(cohort.cohort_status)}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-muted-foreground">Starting Level</label>
								<p className="mt-1">{formatLevel(cohort.starting_level)}</p>
							</div>
							<div>
								<label className="text-sm font-medium text-muted-foreground">Current Level</label>
								<p className="mt-1">{formatLevel(cohort.current_level)}</p>
							</div>
							{cohort.start_date && (
								<div>
									<label className="text-sm font-medium text-muted-foreground">Start Date</label>
									<p className="mt-1">{new Date(cohort.start_date).toLocaleDateString()}</p>
								</div>
							)}
							{cohort.room_type && (
								<div>
									<label className="text-sm font-medium text-muted-foreground">Room Type</label>
									<p className="mt-1">{cohort.room_type.replace("_", " ")}</p>
								</div>
							)}
						</div>
					</Card>

					{/* Weekly Sessions */}
					<Card className="p-6">
						<div className="flex items-center gap-2 mb-4">
							<Clock className="h-5 w-5 text-muted-foreground" />
							<h3 className="font-semibold">Weekly Sessions</h3>
						</div>
						{isLoadingSessions ? (
							<div className="space-y-3">
								{Array.from({ length: 2 }).map((_, i) => (
									<Skeleton key={i} className="h-16 w-full" />
								))}
							</div>
						) : (
							<div className="space-y-3">
								{/* Mock weekly sessions - will be replaced with real data from cohortWithSessions */}
								<div className="rounded-lg border bg-muted/50 p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<div>
												<p className="font-medium">Monday 10:00 - 11:30</p>
												<p className="text-sm text-muted-foreground">90 minutes • Online</p>
											</div>
										</div>
										<Button size="sm" variant="outline">
											<Settings className="h-4 w-4 mr-2" />
											Manage Classes
										</Button>
									</div>
								</div>
								<div className="rounded-lg border bg-muted/50 p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<div>
												<p className="font-medium">Wednesday 14:00 - 15:30</p>
												<p className="text-sm text-muted-foreground">90 minutes • Online</p>
											</div>
										</div>
										<Button size="sm" variant="outline">
											<Settings className="h-4 w-4 mr-2" />
											Manage Classes
										</Button>
									</div>
								</div>
							</div>
						)}
					</Card>
				</div>

				{/* Right Column - Sidebar */}
				<div className="space-y-6">
					{/* Quick Actions */}
					<Card className="p-4">
						<h3 className="font-semibold mb-3">Quick Actions</h3>
						<div className="space-y-2">
							<Button variant="outline" size="sm" className="w-full justify-start">
								<BookOpen className="mr-2 h-4 w-4" />
								View Students
							</Button>
							<Button variant="outline" size="sm" className="w-full justify-start">
								<GraduationCap className="mr-2 h-4 w-4" />
								View Progress
							</Button>
							<Button variant="outline" size="sm" className="w-full justify-start">
								<Calendar className="mr-2 h-4 w-4" />
								Schedule Session
							</Button>
						</div>
					</Card>

					{/* Metadata */}
					<Card className="p-4">
						<h3 className="font-semibold mb-3">Metadata</h3>
						<div className="space-y-3 text-sm">
							<div>
								<label className="font-medium text-muted-foreground">Created</label>
								<p>{new Date(cohort.created_at).toLocaleDateString()}</p>
							</div>
							<div>
								<label className="font-medium text-muted-foreground">Last Updated</label>
								<p>{new Date(cohort.updated_at).toLocaleDateString()}</p>
							</div>
							{cohort.airtable_record_id && (
								<div>
									<label className="font-medium text-muted-foreground">Airtable ID</label>
									<p className="font-mono text-xs">{cohort.airtable_record_id}</p>
								</div>
							)}
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}