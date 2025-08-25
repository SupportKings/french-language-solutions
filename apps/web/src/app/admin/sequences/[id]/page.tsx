import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DetailViewLayout,
	DetailViewHeader,
	DetailViewContent,
	RelatedDataCard,
	InfoSection,
	InfoField,
	OverviewCard,
	SystemInfoCard
} from "@/components/detail-view/DetailViewLayout";
import { 
	Layers,
	MessageSquare,
	Clock,
	Calendar,
	Users,
	Play,
	Edit,
	Copy,
	Trash2,
	Plus,
	Bot,
	Zap,
	Activity,
	Target,
	Mail,
	FileText,
	ChevronRight,
	Hash,
	AlertCircle
} from "lucide-react";
import { format } from "date-fns";

// Mock data fetcher - replace with actual API call
async function getSequence(id: string) {
	// This would be replaced with actual API call
	const sequence = {
		id: id,
		display_name: "Welcome Sequence",
		subject: "Getting Started with French Language Learning",
		first_follow_up_delay_minutes: 1440, // 24 hours
		created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
		updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
		// Related data
		messages: [
			{
				id: "msg-1",
				order: 1,
				title: "Welcome Message",
				content: "Welcome to French Language Solutions! We're thrilled to have you join our community of learners.",
				delay_minutes: 0,
				channel: "email"
			},
			{
				id: "msg-2",
				order: 2,
				title: "Learning Materials",
				content: "Here are your personalized learning materials for Week 1. Let's start with the basics!",
				delay_minutes: 1440, // 24 hours
				channel: "email"
			},
			{
				id: "msg-3",
				order: 3,
				title: "Check-in",
				content: "How's your first week going? Do you have any questions about the materials?",
				delay_minutes: 10080, // 7 days
				channel: "sms"
			},
			{
				id: "msg-4",
				order: 4,
				title: "Tips & Tricks",
				content: "Here are some proven tips to accelerate your French learning journey.",
				delay_minutes: 20160, // 14 days
				channel: "email"
			},
			{
				id: "msg-5",
				order: 5,
				title: "Progress Review",
				content: "Let's schedule a call to review your progress and adjust your learning plan.",
				delay_minutes: 43200, // 30 days
				channel: "sms"
			}
		],
		active_follow_ups: 12,
		completed_follow_ups: 28,
		total_students_enrolled: 40,
		average_completion_rate: 70,
		// Statistics
		stats: {
			total_messages_sent: 156,
			open_rate: 68,
			response_rate: 42,
			completion_rate: 70
		}
	};
	return sequence;
}

// Format delay for display
function formatDelay(minutes: number): string {
	if (minutes === 0) return "Immediately";
	if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
	if (minutes < 1440) {
		const hours = Math.floor(minutes / 60);
		return `${hours} hour${hours !== 1 ? 's' : ''}`;
	}
	const days = Math.floor(minutes / 1440);
	return `${days} day${days !== 1 ? 's' : ''}`;
}

// Channel colors
const channelColors = {
	email: "secondary",
	sms: "info",
	whatsapp: "success",
	call: "warning"
} as const;

export default async function SequenceDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const sequence = await getSequence(id);

	if (!sequence) {
		notFound();
	}

	const totalFollowUps = sequence.active_follow_ups + sequence.completed_follow_ups;

	return (
		<DetailViewLayout>
			{/* Header */}
			<DetailViewHeader
				backUrl="/admin/automation/sequences"
				backLabel="Sequences"
				title={sequence.display_name}
				subtitle={sequence.subject}
				avatar={{ initials: "SQ" }}
				badges={[
					{ 
						label: `${sequence.messages.length} Messages`,
						variant: "info"
					},
					{ 
						label: `${sequence.active_follow_ups} Active`,
						variant: "success"
					}
				]}
				stats={`${sequence.total_students_enrolled} students enrolled • ${sequence.average_completion_rate}% completion rate`}
				actions={[
					{
						icon: Copy,
						label: "Duplicate Sequence",
						onClick: () => console.log("Duplicate")
					},
					{
						icon: Plus,
						label: "Add Message",
						onClick: () => console.log("Add message")
					},
					{
						icon: Users,
						label: "View Enrollments",
						href: `/admin/automation/automated-follow-ups?sequence_id=${sequence.id}`
					},
					{
						icon: Trash2,
						label: "Delete Sequence",
						onClick: () => console.log("Delete"),
						destructive: true
					}
				]}
				editUrl={`/admin/automation/sequences/${sequence.id}/edit`}
			/>

			{/* Content */}
			<DetailViewContent>
				{/* Performance Overview */}
				<Card className="bg-background">
					<CardHeader className="py-3">
						<div className="flex items-center gap-2">
							<Activity className="h-4 w-4 text-muted-foreground" />
							<CardTitle className="text-base">Performance Overview</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 sm:grid-cols-4">
							<div className="rounded-lg border bg-muted/10 p-3">
								<div className="flex items-center gap-2 mb-1">
									<Mail className="h-3.5 w-3.5 text-muted-foreground" />
									<p className="text-xs text-muted-foreground">Messages Sent</p>
								</div>
								<p className="text-lg font-semibold">{sequence.stats.total_messages_sent}</p>
							</div>
							<div className="rounded-lg border bg-muted/10 p-3">
								<div className="flex items-center gap-2 mb-1">
									<Target className="h-3.5 w-3.5 text-muted-foreground" />
									<p className="text-xs text-muted-foreground">Open Rate</p>
								</div>
								<p className="text-lg font-semibold">{sequence.stats.open_rate}%</p>
							</div>
							<div className="rounded-lg border bg-muted/10 p-3">
								<div className="flex items-center gap-2 mb-1">
									<MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
									<p className="text-xs text-muted-foreground">Response Rate</p>
								</div>
								<p className="text-lg font-semibold">{sequence.stats.response_rate}%</p>
							</div>
							<div className="rounded-lg border bg-muted/10 p-3">
								<div className="flex items-center gap-2 mb-1">
									<Zap className="h-3.5 w-3.5 text-muted-foreground" />
									<p className="text-xs text-muted-foreground">Completion Rate</p>
								</div>
								<p className="text-lg font-semibold">{sequence.stats.completion_rate}%</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Message Sequence */}
				<Card className="bg-background">
					<CardHeader className="py-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Layers className="h-4 w-4 text-muted-foreground" />
								<CardTitle className="text-base">Message Sequence</CardTitle>
							</div>
							<Button size="sm" variant="outline">
								<Plus className="mr-1.5 h-3.5 w-3.5" />
								Add Message
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{sequence.messages.map((message, index) => (
								<div key={message.id} className="relative">
									{/* Connection line */}
									{index < sequence.messages.length - 1 && (
										<div className="absolute left-4 top-10 bottom-0 w-px bg-border" />
									)}
									
									<div className="flex gap-3">
										{/* Step indicator */}
										<div className="flex-shrink-0">
											<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
												<span className="text-xs font-semibold text-primary">{message.order}</span>
											</div>
										</div>

										{/* Message content */}
										<div className="flex-1 rounded-lg border bg-muted/10 hover:bg-muted/20 transition-colors p-4">
											<div className="flex items-start justify-between mb-2">
												<div>
													<h4 className="text-sm font-medium">{message.title}</h4>
													<div className="flex items-center gap-2 mt-1">
														<Badge variant={channelColors[message.channel as keyof typeof channelColors]} className="h-5 text-[10px] px-1.5">
															{message.channel.toUpperCase()}
														</Badge>
														<span className="text-xs text-muted-foreground">
															<Clock className="inline h-3 w-3 mr-1" />
															{formatDelay(message.delay_minutes)}
															{index > 0 && " after previous"}
														</span>
													</div>
												</div>
												<div className="flex gap-1">
													<Button size="sm" variant="ghost" className="h-7 w-7 p-0">
														<Edit className="h-3.5 w-3.5" />
													</Button>
													<Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive">
														<Trash2 className="h-3.5 w-3.5" />
													</Button>
												</div>
											</div>
											<p className="text-xs text-muted-foreground line-clamp-2">
												{message.content}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<div className="grid gap-4 lg:grid-cols-3">
					{/* Main Content - 2 columns */}
					<div className="lg:col-span-2 space-y-4">
						{/* Active Follow-ups */}
						<RelatedDataCard
							title="Active Follow-ups"
							subtitle={`${sequence.active_follow_ups} currently running`}
							actionLabel="View All"
							actionIcon={Bot}
							actionHref={`/admin/automation/automated-follow-ups?sequence_id=${sequence.id}&status=active`}
						>
							{sequence.active_follow_ups > 0 ? (
								<div className="space-y-2">
									<div className="rounded-lg border bg-muted/10 p-3">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium">Marie Dubois</p>
												<p className="text-xs text-muted-foreground">Started 2 days ago</p>
											</div>
											<Badge variant="info" className="h-5 text-[10px] px-1.5">
												Message 2/5
											</Badge>
										</div>
									</div>
									<div className="rounded-lg border bg-muted/10 p-3">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium">Pierre Martin</p>
												<p className="text-xs text-muted-foreground">Started 5 days ago</p>
											</div>
											<Badge variant="info" className="h-5 text-[10px] px-1.5">
												Message 3/5
											</Badge>
										</div>
									</div>
									<div className="rounded-lg border bg-muted/10 p-3">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium">Sophie Laurent</p>
												<p className="text-xs text-muted-foreground">Started 1 week ago</p>
											</div>
											<Badge variant="warning" className="h-5 text-[10px] px-1.5">
												Message 4/5
											</Badge>
										</div>
									</div>
								</div>
							) : (
								<div className="text-center py-4">
									<AlertCircle className="h-5 w-5 text-muted-foreground/50 mx-auto mb-2" />
									<p className="text-xs text-muted-foreground">No active follow-ups</p>
								</div>
							)}
						</RelatedDataCard>
					</div>

					{/* Sidebar - 1 column */}
					<div className="space-y-4">
						{/* Sequence Stats */}
						<OverviewCard
							items={[
								{
									label: "Total Enrollments",
									value: sequence.total_students_enrolled,
									icon: Users
								},
								{
									label: "Active",
									value: sequence.active_follow_ups,
									icon: Play,
									badge: { label: "Running", variant: "success" }
								},
								{
									label: "Completed",
									value: sequence.completed_follow_ups,
									icon: Zap
								}
							]}
						/>

						{/* Configuration */}
						<Card className="bg-background">
							<CardHeader className="py-3">
								<CardTitle className="text-sm">Configuration</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<p className="text-xs text-muted-foreground mb-1">First Follow-up Delay</p>
									<p className="text-sm font-medium">
										{formatDelay(sequence.first_follow_up_delay_minutes)}
									</p>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">Total Messages</p>
									<p className="text-sm font-medium">{sequence.messages.length}</p>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">Channels Used</p>
									<div className="flex gap-1 mt-1">
										{Array.from(new Set(sequence.messages.map(m => m.channel))).map(channel => (
											<Badge key={channel} variant="outline" className="h-5 text-[10px] px-1.5">
												{channel}
											</Badge>
										))}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* System Info */}
						<SystemInfoCard
							id={sequence.id}
							createdAt={format(new Date(sequence.created_at), "MMM d, yyyy")}
							updatedAt={format(new Date(sequence.updated_at), "MMM d, yyyy")}
						/>
					</div>
				</div>
			</DetailViewContent>
		</DetailViewLayout>
	);
}

// Import Link component
import Link from "next/link";