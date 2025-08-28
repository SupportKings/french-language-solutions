import { notFound } from "next/navigation";

import {
	DetailViewContent,
	DetailViewHeader,
	DetailViewLayout,
	InfoField,
	InfoSection,
	OverviewCard,
	RelatedDataCard,
	SystemInfoCard,
} from "@/components/detail-view/DetailViewLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { format, formatDistanceToNow } from "date-fns";
import {
	Activity,
	AlertCircle,
	Bot,
	Calendar,
	CheckCircle,
	Clock,
	Layers,
	MessageSquare,
	Pause,
	Play,
	Send,
	User,
	XCircle,
	Zap,
} from "lucide-react";

// Mock data fetcher - replace with actual API call
async function getFollowUp(id: string) {
	// This would be replaced with actual API call
	const followUp = {
		id: id,
		student_id: "student-123",
		sequence_id: "sequence-456",
		status: "activated", // activated, in_progress, completed, stopped
		started_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
		last_message_sent_at: new Date(
			Date.now() - 24 * 60 * 60 * 1000,
		).toISOString(), // 1 day ago
		completed_at: null,
		created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
		updated_at: new Date().toISOString(),
		// Related data
		student: {
			id: "student-123",
			full_name: "Marie Dubois",
			email: "marie@example.com",
			mobile_phone_number: "+33612345678",
			desired_starting_language_level: {
				code: "b1.1",
				display_name: "B1.1",
				id: "some-uuid",
			},
		},
		sequence: {
			id: "sequence-456",
			display_name: "Welcome Sequence",
			subject: "Getting Started with French",
			first_follow_up_delay_minutes: 1440, // 24 hours
			total_messages: 5,
			messages_sent: 2,
		},
		touchpoints: [
			{
				id: "touch-1",
				message:
					"Welcome to French Language Solutions! We're excited to have you.",
				channel: "sms",
				type: "outbound",
				occurred_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
			},
			{
				id: "touch-2",
				message: "Here are your learning materials for Week 1.",
				channel: "email",
				type: "outbound",
				occurred_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
			},
		],
	};
	return followUp;
}

// Status icons and colors
const statusConfig = {
	activated: { icon: Play, color: "info", label: "Activated" },
	in_progress: { icon: Activity, color: "warning", label: "In Progress" },
	completed: { icon: CheckCircle, color: "success", label: "Completed" },
	stopped: { icon: XCircle, color: "destructive", label: "Stopped" },
} as const;

// Channel icons
const channelIcons = {
	sms: MessageSquare,
	email: Send,
	whatsapp: MessageSquare,
	call: MessageSquare,
};

export default async function FollowUpDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const followUp = await getFollowUp(id);

	if (!followUp) {
		notFound();
	}

	const statusInfo = statusConfig[followUp.status as keyof typeof statusConfig];
	const StatusIcon = statusInfo.icon;

	// Calculate progress
	const progress =
		followUp.sequence.total_messages > 0
			? (followUp.sequence.messages_sent / followUp.sequence.total_messages) *
				100
			: 0;

	// Calculate time since last message
	const timeSinceLastMessage = followUp.last_message_sent_at
		? formatDistanceToNow(new Date(followUp.last_message_sent_at), {
				addSuffix: true,
			})
		: "No messages sent";

	return (
		<DetailViewLayout>
			{/* Header */}
			<DetailViewHeader
				backUrl="/admin/automation/automated-follow-ups"
				backLabel="Follow-ups"
				title={followUp.sequence.display_name}
				subtitle={`Automated follow-up for ${followUp.student.full_name}`}
				avatar={{ initials: "AF" }}
				badges={[
					{
						label: statusInfo.label,
						variant: statusInfo.color,
					},
				]}
				stats={`${followUp.sequence.messages_sent} of ${followUp.sequence.total_messages} messages sent`}
				actions={[
					{
						icon:
							followUp.status === "activated" ||
							followUp.status === "in_progress"
								? Pause
								: Play,
						label:
							followUp.status === "activated" ||
							followUp.status === "in_progress"
								? "Pause"
								: "Resume",
						onClick: () => console.log("Toggle status"),
					},
					{
						icon: User,
						label: "View Student",
						href: `/admin/students/${followUp.student_id}`,
					},
					{
						icon: Layers,
						label: "View Sequence",
						href: `/admin/automation/sequences/${followUp.sequence_id}`,
					},
					{
						icon: XCircle,
						label: "Stop Follow-up",
						onClick: () => console.log("Stop"),
						destructive: true,
					},
				]}
			/>

			{/* Content */}
			<DetailViewContent>
				{/* Progress Overview at the top */}
				<Card className="bg-background">
					<CardHeader className="py-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Zap className="h-4 w-4 text-muted-foreground" />
								<CardTitle className="text-base">Progress Overview</CardTitle>
							</div>
							<Badge variant={statusInfo.color}>
								<StatusIcon className="mr-1 h-3 w-3" />
								{statusInfo.label}
							</Badge>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{/* Progress Bar */}
							<div>
								<div className="mb-2 flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Messages Sent</span>
									<span className="font-medium">
										{followUp.sequence.messages_sent} /{" "}
										{followUp.sequence.total_messages}
									</span>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-muted">
									<div
										className="h-full bg-primary transition-all duration-300"
										style={{ width: `${progress}%` }}
									/>
								</div>
							</div>

							{/* Key Metrics */}
							<div className="grid gap-4 sm:grid-cols-3">
								<div className="rounded-lg border bg-muted/10 p-3">
									<div className="mb-1 flex items-center gap-2">
										<Clock className="h-3.5 w-3.5 text-muted-foreground" />
										<p className="text-muted-foreground text-xs">Started</p>
									</div>
									<p className="font-medium text-sm">
										{format(new Date(followUp.started_at), "MMM d, yyyy")}
									</p>
								</div>
								<div className="rounded-lg border bg-muted/10 p-3">
									<div className="mb-1 flex items-center gap-2">
										<Send className="h-3.5 w-3.5 text-muted-foreground" />
										<p className="text-muted-foreground text-xs">
											Last Message
										</p>
									</div>
									<p className="font-medium text-sm">{timeSinceLastMessage}</p>
								</div>
								<div className="rounded-lg border bg-muted/10 p-3">
									<div className="mb-1 flex items-center gap-2">
										<Activity className="h-3.5 w-3.5 text-muted-foreground" />
										<p className="text-muted-foreground text-xs">Next Action</p>
									</div>
									<p className="font-medium text-sm">
										{followUp.status === "activated" ||
										followUp.status === "in_progress"
											? "Scheduled"
											: followUp.status === "completed"
												? "Completed"
												: "Paused"}
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Touchpoints History */}
				<div className="grid gap-4 lg:grid-cols-2">
					<RelatedDataCard
						title="Message History"
						subtitle={`${followUp.touchpoints.length} messages sent`}
						actionLabel="View All"
						actionIcon={MessageSquare}
						actionHref={`/admin/automation/touchpoints?follow_up_id=${followUp.id}`}
					>
						<div className="max-h-64 space-y-2 overflow-y-auto">
							{followUp.touchpoints.map((touchpoint) => {
								const ChannelIcon =
									channelIcons[
										touchpoint.channel as keyof typeof channelIcons
									] || MessageSquare;
								return (
									<div
										key={touchpoint.id}
										className="rounded-lg border bg-muted/10 p-3 transition-colors hover:bg-muted/20"
									>
										<div className="mb-2 flex items-start justify-between">
											<div className="flex items-center gap-2">
												<ChannelIcon className="h-3.5 w-3.5 text-muted-foreground" />
												<Badge
													variant="outline"
													className="h-5 px-1.5 text-[10px]"
												>
													{touchpoint.channel}
												</Badge>
											</div>
											<span className="text-muted-foreground text-xs">
												{format(
													new Date(touchpoint.occurred_at),
													"MMM d, h:mm a",
												)}
											</span>
										</div>
										<p className="line-clamp-2 text-muted-foreground text-xs">
											{touchpoint.message}
										</p>
									</div>
								);
							})}
							{followUp.touchpoints.length === 0 && (
								<div className="py-4 text-center">
									<AlertCircle className="mx-auto mb-2 h-5 w-5 text-muted-foreground/50" />
									<p className="text-muted-foreground text-xs">
										No messages sent yet
									</p>
								</div>
							)}
						</div>
					</RelatedDataCard>

					{/* Sequence Details */}
					<RelatedDataCard
						title="Sequence Details"
						subtitle={followUp.sequence.subject}
						actionLabel="View"
						actionIcon={Layers}
						actionHref={`/admin/automation/sequences/${followUp.sequence_id}`}
					>
						<div className="space-y-3">
							<div className="rounded-lg border bg-muted/10 p-3">
								<p className="mb-1 text-muted-foreground text-xs">
									Sequence Name
								</p>
								<p className="font-medium text-sm">
									{followUp.sequence.display_name}
								</p>
							</div>
							<div className="rounded-lg border bg-muted/10 p-3">
								<p className="mb-1 text-muted-foreground text-xs">Subject</p>
								<p className="font-medium text-sm">
									{followUp.sequence.subject}
								</p>
							</div>
							<div className="rounded-lg border bg-muted/10 p-3">
								<p className="mb-1 text-muted-foreground text-xs">
									First Follow-up Delay
								</p>
								<p className="font-medium text-sm">
									{followUp.sequence.first_follow_up_delay_minutes < 60
										? `${followUp.sequence.first_follow_up_delay_minutes} minutes`
										: followUp.sequence.first_follow_up_delay_minutes < 1440
											? `${Math.floor(followUp.sequence.first_follow_up_delay_minutes / 60)} hours`
											: `${Math.floor(followUp.sequence.first_follow_up_delay_minutes / 1440)} days`}
								</p>
							</div>
						</div>
					</RelatedDataCard>
				</div>

				<div className="grid gap-4 lg:grid-cols-3">
					{/* Main Content - 2 columns */}
					<div className="space-y-4 lg:col-span-2">
						<Card className="bg-background">
							<CardHeader className="py-3">
								<CardTitle className="text-sm">Follow-up Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Student Information */}
								<InfoSection title="Student" icon={User}>
									<InfoField
										label="Name"
										value={
											<Link
												href={`/admin/students/${followUp.student_id}`}
												className="text-primary hover:underline"
											>
												{followUp.student.full_name}
											</Link>
										}
									/>
									{followUp.student.email && (
										<InfoField label="Email" value={followUp.student.email} />
									)}
									{followUp.student.mobile_phone_number && (
										<InfoField
											label="Phone"
											value={followUp.student.mobile_phone_number}
										/>
									)}
									{followUp.student.desired_starting_language_level && (
										<InfoField
											label="Level"
											value={
												<Badge variant="outline" className="h-5 px-1.5 text-xs">
													{(() => {
														const level =
															followUp.student.desired_starting_language_level;
														if (typeof level === "object" && level !== null) {
															return (
																(level as any).display_name ||
																(level as any).code?.toUpperCase() ||
																"N/A"
															);
														}
														if (typeof level === "string") {
															return (level as string).toUpperCase();
														}
														return "N/A";
													})()}
												</Badge>
											}
										/>
									)}
								</InfoSection>

								{/* Timeline */}
								<div className="border-t pt-4">
									<InfoSection title="Timeline" icon={Calendar}>
										<InfoField
											label="Started"
											value={format(new Date(followUp.started_at), "PPpp")}
											icon={Play}
										/>
										{followUp.last_message_sent_at && (
											<InfoField
												label="Last Message Sent"
												value={format(
													new Date(followUp.last_message_sent_at),
													"PPpp",
												)}
												icon={Send}
											/>
										)}
										{followUp.completed_at && (
											<InfoField
												label="Completed"
												value={format(new Date(followUp.completed_at), "PPpp")}
												icon={CheckCircle}
											/>
										)}
									</InfoSection>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar - 1 column */}
					<div className="space-y-4">
						{/* Status Overview */}
						<OverviewCard
							items={[
								{
									label: "Status",
									value: statusInfo.label,
									icon: StatusIcon,
									badge: { label: "Active", variant: statusInfo.color },
								},
								{
									label: "Messages",
									value: `${followUp.sequence.messages_sent}/${followUp.sequence.total_messages}`,
									icon: MessageSquare,
								},
								{
									label: "Duration",
									value: formatDistanceToNow(new Date(followUp.started_at)),
									icon: Clock,
								},
							]}
						/>

						{/* System Info */}
						<SystemInfoCard
							id={followUp.id}
							createdAt={format(new Date(followUp.created_at), "MMM d, yyyy")}
							updatedAt={format(new Date(followUp.updated_at), "MMM d, yyyy")}
							additionalFields={[{ label: "Status", value: followUp.status }]}
						/>
					</div>
				</div>
			</DetailViewContent>
		</DetailViewLayout>
	);
}

// Import Link component
import Link from "next/link";
