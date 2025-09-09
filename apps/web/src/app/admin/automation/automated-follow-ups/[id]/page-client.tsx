"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { TouchpointsTable } from "@/features/follow-ups/components/TouchpointsTable";
import {
	useAutomatedFollowUp,
	useStopAutomatedFollowUp,
} from "@/features/follow-ups/queries/follow-ups.queries";

import { format } from "date-fns";
import {
	Activity,
	Bot,
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	Layers,
	MessageSquare,
	Send,
	StopCircle,
	User,
	Workflow,
} from "lucide-react";
import { toast } from "sonner";

interface AutomatedFollowUpDetailPageClientProps {
	followUpId: string;
}

// Status badge variant mapping
const getStatusVariant = (status: string) => {
	switch (status) {
		case "activated":
			return "default" as const;
		case "ongoing":
			return "secondary" as const;
		case "answer_received":
			return "success" as const;
		case "disabled":
			return "outline" as const;
		default:
			return "outline" as const;
	}
};

// Format status for display
const formatStatus = (status: string) => {
	switch (status) {
		case "activated":
			return "Activated";
		case "ongoing":
			return "Ongoing";
		case "answer_received":
			return "Answer Received";
		case "disabled":
			return "Disabled";
		default:
			return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
	}
};

export function AutomatedFollowUpDetailPageClient({
	followUpId,
}: AutomatedFollowUpDetailPageClientProps) {
	const router = useRouter();
	const { data: followUpData, isLoading, error, isSuccess } = useAutomatedFollowUp(followUpId);
	const [showStopConfirm, setShowStopConfirm] = useState(false);
	const [isStopping, setIsStopping] = useState(false);

	const stopMutation = useStopAutomatedFollowUp();

	// Handle stop follow-up
	const handleStopFollowUp = async () => {
		setIsStopping(true);
		try {
			await stopMutation.mutateAsync(followUpId);
			toast.success("Automated follow-up stopped successfully");
		} catch (error: any) {
			toast.error(error.message || "Failed to stop automated follow-up");
		} finally {
			setIsStopping(false);
			setShowStopConfirm(false);
		}
	};

	// Show loading skeleton while loading (matching cohort style)
	if (isLoading) {
		return (
			<div className="min-h-screen bg-muted/30">
				{/* Header Skeleton */}
				<div className="border-b bg-background">
					<div className="px-6 py-3">
						<div className="animate-pulse">
							{/* Breadcrumb skeleton */}
							<div className="mb-2 flex items-center gap-2">
								<div className="h-4 w-16 rounded bg-muted" />
								<div className="h-3 w-3 rounded bg-muted" />
								<div className="h-4 w-24 rounded bg-muted" />
							</div>
							{/* Title and badges skeleton */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-full bg-muted" />
									<div>
										<div className="mb-2 h-6 w-32 rounded bg-muted" />
										<div className="flex items-center gap-2">
											<div className="h-4 w-20 rounded bg-muted" />
											<div className="h-4 w-16 rounded bg-muted" />
											<div className="h-4 w-24 rounded bg-muted" />
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<div className="h-9 w-32 rounded bg-muted" />
									<div className="h-9 w-9 rounded bg-muted" />
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Content Skeleton */}
				<div className="space-y-4 px-6 py-4">
					{/* Follow-up Information Section Skeleton */}
					<div className="rounded-lg border bg-card">
						<div className="border-b p-4">
							<div className="h-5 w-40 rounded bg-muted" />
						</div>
						<div className="p-6">
							<div className="grid animate-pulse gap-8 lg:grid-cols-3">
								{[1, 2, 3].map((i) => (
									<div key={i} className="space-y-4">
										<div className="mb-4 h-3 w-24 rounded bg-muted" />
										{[1, 2, 3].map((j) => (
											<div key={j} className="flex items-start gap-3">
												<div className="mt-0.5 h-4 w-4 rounded bg-muted" />
												<div className="flex-1 space-y-1">
													<div className="h-3 w-16 rounded bg-muted" />
													<div className="h-4 w-24 rounded bg-muted" />
												</div>
											</div>
										))}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Show error state
	if ((isSuccess && !followUpData) || error) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-muted/30">
				<div className="text-center">
					<Bot className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<h2 className="mb-2 font-semibold text-lg">Automated follow-up not found</h2>
					<p className="mb-4 text-muted-foreground">
						The automated follow-up you're looking for doesn't exist or couldn't be loaded.
					</p>
					<Button onClick={() => router.push("/admin/automation/automated-follow-ups")}>
						Back to Automated Follow-ups
					</Button>
				</div>
			</div>
		);
	}

	// If somehow we get here without followUp, return null
	if (!followUpData) {
		return null;
	}

	// Get follow-up name and student info - checking both plural and singular forms
	const student = (followUpData as any).students || followUpData.student;
	const sequence = (followUpData as any).sequences || followUpData.template_follow_up_sequences || (followUpData as any).sequence;
	
	const followUpName = sequence?.display_name || "Automated Follow-up";
	const studentName = student?.full_name || "Unknown Student";
	const initials = "AF";

	return (
		<div className="min-h-screen bg-muted/30">
			{/* Enhanced Header with Breadcrumb - matching cohort style exactly */}
			<div className="border-b bg-background">
				<div className="px-6 py-3">
					<div className="mb-2 flex items-center gap-2 text-muted-foreground text-sm">
						<Link
							href="/admin/automation/automated-follow-ups"
							className="transition-colors hover:text-foreground"
						>
							Automated Follow-ups
						</Link>
						<ChevronRight className="h-3 w-3" />
						<span>{followUpName}</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							
							<div>
								<h1 className="font-semibold text-xl">{followUpName}</h1>
								<div className="mt-0.5 flex items-center gap-2">
									<Badge
										variant={getStatusVariant(followUpData.status)}
										className="h-4 px-1.5 text-[10px]"
									>
										{formatStatus(followUpData.status)}
									</Badge>
									<Badge variant="outline" className="h-4 px-1.5 text-[10px]">
										{studentName}
									</Badge>
									{sequence?.subject && (
										<Badge variant="outline" className="h-4 px-1.5 text-[10px]">
											{sequence.subject}
										</Badge>
									)}
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Link href={`/admin/students/${followUpData.student_id || ''}`}>
								<Button variant="outline" size="sm">
									<User className="mr-1.5 h-3.5 w-3.5" />
									View Student
								</Button>
							</Link>
							<Link href={`/admin/automation/sequences/${followUpData.sequence_id || ''}`}>
								<Button variant="outline" size="sm">
									<Layers className="mr-1.5 h-3.5 w-3.5" />
									View Sequence
								</Button>
							</Link>
							{followUpData.status === "activated" || followUpData.status === "ongoing" ? (
								<Button
									variant="destructive"
									size="sm"
									onClick={() => setShowStopConfirm(true)}
								>
									<StopCircle className="mr-1.5 h-3.5 w-3.5" />
									Stop Follow-up
								</Button>
							) : (
								<Button
									variant="outline"
									size="sm"
									disabled
									className="border-red-200 bg-red-50 text-red-700"
								>
									<CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
									Follow-up Stopped
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-4 px-6 py-4">
				{/* Follow-up Information with same structure as cohort */}
				<div className="rounded-lg border bg-card">
					<div className="border-b p-4">
						<h2 className="font-semibold text-lg">Follow-up Information</h2>
					</div>
					<div className="p-6">
						<div className="grid gap-8 lg:grid-cols-2">
							{/* Basic Details */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Basic Details
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Activity className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Status:</p>
											<Badge
												variant={getStatusVariant(followUpData.status)}
												className="h-5 text-xs"
											>
												{formatStatus(followUpData.status)}
											</Badge>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Started At:</p>
											<p className="font-medium text-sm">
												{format(new Date(followUpData.started_at), "MMM d, yyyy")}
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<Send className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Last Message Sent at:</p>
											{followUpData.last_message_sent_at ? (
												<p className="font-medium text-sm">
													{format(new Date(followUpData.last_message_sent_at), "MMM d, yyyy")}
												</p>
											) : (
												<span className="font-medium text-sm">—</span>
											)}
										</div>
									</div>

								</div>
							</div>

							{/* Sequence Information */}
							<div className="space-y-4">
								<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
									Sequence
								</h3>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<Workflow className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div className="flex-1 space-y-0.5">
											<p className="text-muted-foreground text-xs">Follow-up Sequence:</p>
											{sequence ? (
												<Link
													href={`/admin/automation/sequences/${followUpData.sequence_id || ''}`}
													className="flex items-center gap-1 text-primary text-sm hover:underline"
												>
													{sequence.display_name}
												</Link>
											) : (
												<span className="text-muted-foreground text-sm">
													No sequence assigned
												</span>
											)}
										</div>
									</div>

									{sequence?.subject && (
										<div className="flex items-start gap-3">
											<MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
											<div className="flex-1 space-y-0.5">
												<p className="text-muted-foreground text-xs">Subject:</p>
												<p className="font-medium text-sm">{sequence.subject}</p>
											</div>
										</div>
									)}

									{sequence?.first_follow_up_delay_minutes && (
										<div className="flex items-start gap-3">
											<Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
											<div className="flex-1 space-y-0.5">
												<p className="text-muted-foreground text-xs">First Delay:</p>
												<p className="font-medium text-sm">
													{(() => {
														const minutes = sequence.first_follow_up_delay_minutes;
														if (minutes < 60) return `${minutes} minutes`;
														if (minutes < 1440) return `${Math.floor(minutes / 60)} hours`;
														return `${Math.floor(minutes / 1440)} days`;
													})()}
												</p>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Touchpoints Table */}
				<TouchpointsTable followUp={followUpData as any} />

				{/* System Information - Less prominent at the bottom */}
				<div className="mt-8 border-t pt-6">
					<div className="mx-auto max-w-3xl">
						<div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground/70 text-xs">
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Created at:</span>
								<span>
									{format(
										new Date(followUpData.created_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-3 w-3" />
								<span>Updated:</span>
								<span>
									{format(
										new Date(followUpData.updated_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<AlertDialog open={showStopConfirm} onOpenChange={setShowStopConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Stop Automated Follow-up</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to stop this automated follow-up? This will prevent any 
							future scheduled messages from being sent. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isStopping}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleStopFollowUp}
							disabled={isStopping}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isStopping ? "Stopping..." : "Stop Follow-up"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}