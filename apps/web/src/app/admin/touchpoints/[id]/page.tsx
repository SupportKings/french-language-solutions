import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	DetailViewLayout,
	DetailViewHeader,
	DetailViewContent,
	InfoSection,
	InfoField,
	SystemInfoCard,
	RelatedDataCard
} from "@/components/detail-view/DetailViewLayout";
import { 
	MessageSquare,
	Phone,
	Mail,
	User,
	Calendar,
	Hash,
	ExternalLink,
	Bot,
	Database,
	Clock,
	Send,
	Inbox,
	Info
} from "lucide-react";
import { format } from "date-fns";

// Mock data fetcher - replace with actual API call
async function getTouchpoint(id: string) {
	// This would be replaced with actual API call
	const touchpoint = {
		id: id,
		student_id: "student-123",
		channel: "sms",
		type: "outbound",
		message: "Hi! This is a follow-up message regarding your French language course enrollment. How are you finding the materials so far?",
		source: "automated",
		automated_follow_up_id: "follow-up-456",
		external_id: "ext-789",
		external_metadata: JSON.stringify({ provider: "openphone", message_id: "msg-123" }),
		occurred_at: new Date().toISOString(),
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		// Related data
		student: {
			id: "student-123",
			full_name: "Marie Dubois",
			email: "marie@example.com",
			mobile_phone_number: "+33612345678"
		},
		automated_follow_up: {
			id: "follow-up-456",
			sequence_name: "Welcome Sequence",
			status: "activated"
		}
	};
	return touchpoint;
}

// Channel icons mapping
const channelIcons = {
	sms: Phone,
	call: Phone,
	whatsapp: MessageSquare,
	email: Mail
};

// Channel colors mapping
const channelColors = {
	sms: "info",
	call: "warning",
	whatsapp: "success",
	email: "secondary"
} as const;

// Type colors mapping
const typeColors = {
	inbound: "success",
	outbound: "info"
} as const;

// Source colors mapping
const sourceColors = {
	manual: "secondary",
	automated: "info",
	openphone: "warning",
	gmail: "destructive",
	whatsapp_business: "success",
	webhook: "outline"
} as const;

export default async function TouchpointDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const touchpoint = await getTouchpoint(id);

	if (!touchpoint) {
		notFound();
	}

	const ChannelIcon = channelIcons[touchpoint.channel as keyof typeof channelIcons] || MessageSquare;
	const TypeIcon = touchpoint.type === 'inbound' ? Inbox : Send;
	
	// Parse external metadata if available
	let externalData = null;
	try {
		if (touchpoint.external_metadata) {
			externalData = JSON.parse(touchpoint.external_metadata);
		}
	} catch (e) {
		// Invalid JSON
	}

	return (
		<DetailViewLayout>
			{/* Header */}
			<DetailViewHeader
				backUrl="/admin/automation/touchpoints"
				backLabel="Touchpoints"
				title="Touchpoint Details"
				badges={[
					{ 
						label: touchpoint.channel.toUpperCase(),
						variant: channelColors[touchpoint.channel as keyof typeof channelColors]
					},
					{ 
						label: touchpoint.type.charAt(0).toUpperCase() + touchpoint.type.slice(1),
						variant: typeColors[touchpoint.type as keyof typeof typeColors]
					},
					{ 
						label: touchpoint.source.replace('_', ' ').toUpperCase(),
						variant: sourceColors[touchpoint.source as keyof typeof sourceColors]
					}
				]}
				stats={`${format(new Date(touchpoint.occurred_at), "MMM d, yyyy 'at' h:mm a")}`}
				actions={[
					{
						icon: MessageSquare,
						label: "View Conversation",
						onClick: () => console.log("View conversation")
					},
					{
						icon: User,
						label: "View Student",
						href: `/admin/students/${touchpoint.student_id}`
					}
				]}
			/>

			{/* Content */}
			<DetailViewContent>
				{/* Message Content at the top */}
				<Card className="bg-background">
					<CardHeader className="py-3">
						<div className="flex items-center gap-2">
							<ChannelIcon className="h-4 w-4 text-muted-foreground" />
							<CardTitle className="text-base">Message Content</CardTitle>
						</div>
					</CardHeader>
					<CardContent>
						<div className="rounded-lg bg-muted/50 p-4">
							<p className="text-sm leading-relaxed whitespace-pre-wrap">
								{touchpoint.message}
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Touchpoint Information - Full width */}
				<Card className="bg-background">
					<CardHeader className="py-3">
						<CardTitle className="text-sm">Touchpoint Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-6 lg:grid-cols-3">
							{/* Communication Details */}
							<div>
								<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Communication</h3>
								<div className="space-y-2.5">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 text-sm">
											<ChannelIcon className="h-3 w-3 text-muted-foreground" />
											<span className="text-muted-foreground">Channel:</span>
										</div>
										<Badge variant={channelColors[touchpoint.channel as keyof typeof channelColors]} className="h-5 text-xs px-1.5">
											{touchpoint.channel.toUpperCase()}
										</Badge>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 text-sm">
											<TypeIcon className="h-3 w-3 text-muted-foreground" />
											<span className="text-muted-foreground">Direction:</span>
										</div>
										<Badge variant={typeColors[touchpoint.type as keyof typeof typeColors]} className="h-5 text-xs px-1.5">
											{touchpoint.type.charAt(0).toUpperCase() + touchpoint.type.slice(1)}
										</Badge>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 text-sm">
											<Database className="h-3 w-3 text-muted-foreground" />
											<span className="text-muted-foreground">Source:</span>
										</div>
										<Badge variant={sourceColors[touchpoint.source as keyof typeof sourceColors]} className="h-5 text-xs px-1.5">
											{touchpoint.source.replace('_', ' ').toUpperCase()}
										</Badge>
									</div>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 text-sm">
											<Clock className="h-3 w-3 text-muted-foreground" />
											<span className="text-muted-foreground">Occurred:</span>
										</div>
										<span className="font-medium text-sm">{format(new Date(touchpoint.occurred_at), "MMM d, h:mm a")}</span>
									</div>
								</div>
							</div>

							{/* Student Information */}
							<div>
								<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Student</h3>
								<div className="space-y-2.5">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 text-sm">
											<User className="h-3 w-3 text-muted-foreground" />
											<span className="text-muted-foreground">Name:</span>
										</div>
										<Link href={`/admin/students/${touchpoint.student_id}`} className="text-sm font-medium text-primary hover:underline">
											{touchpoint.student.full_name}
										</Link>
									</div>
									{touchpoint.student.email && (
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2 text-sm">
												<Mail className="h-3 w-3 text-muted-foreground" />
												<span className="text-muted-foreground">Email:</span>
											</div>
											<span className="font-medium text-sm truncate max-w-[150px]" title={touchpoint.student.email}>
												{touchpoint.student.email}
											</span>
										</div>
									)}
									{touchpoint.student.mobile_phone_number && (
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2 text-sm">
												<Phone className="h-3 w-3 text-muted-foreground" />
												<span className="text-muted-foreground">Phone:</span>
											</div>
											<span className="font-medium text-sm">{touchpoint.student.mobile_phone_number}</span>
										</div>
									)}
								</div>
							</div>

							{/* Automation & External Info */}
							<div>
								{touchpoint.automated_follow_up && (
									<>
										<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Automation</h3>
										<div className="space-y-2.5">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2 text-sm">
													<Bot className="h-3 w-3 text-muted-foreground" />
													<span className="text-muted-foreground">Sequence:</span>
												</div>
												<Link href={`/admin/automation/automated-follow-ups/${touchpoint.automated_follow_up_id}`} className="text-sm font-medium text-primary hover:underline">
													{touchpoint.automated_follow_up.sequence_name}
												</Link>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-sm text-muted-foreground ml-5">Status:</span>
												<Badge variant="success" className="h-5 text-xs px-1.5">
													{touchpoint.automated_follow_up.status}
												</Badge>
											</div>
										</div>
									</>
								)}
								
								{(touchpoint.external_id || externalData) && (
									<>
										<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 mt-6">External</h3>
										<div className="space-y-2">
											{touchpoint.external_id && (
												<div className="flex items-center justify-between text-sm">
													<span className="text-muted-foreground">External ID:</span>
													<code className="text-xs bg-muted px-1 py-0.5 rounded">
														{touchpoint.external_id.slice(0, 10)}...
													</code>
												</div>
											)}
											{externalData?.provider && (
												<div className="flex items-center justify-between text-sm">
													<span className="text-muted-foreground">Provider:</span>
													<span className="font-medium">{externalData.provider}</span>
												</div>
											)}
										</div>
									</>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* System Information - Less prominent at the bottom */}
				<div className="mt-8 border-t pt-6">
					<div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground/70">
						<div className="flex items-center gap-2">
							<span>ID:</span>
							<code className="bg-muted/50 px-1.5 py-0.5 rounded font-mono">{touchpoint.id.slice(0, 8)}</code>
						</div>
						<div className="flex items-center gap-2">
							<span>Source:</span>
							<span>{touchpoint.source}</span>
						</div>
						<div className="flex items-center gap-2">
							<Clock className="h-3 w-3" />
							<span>Created:</span>
							<span>{format(new Date(touchpoint.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
						</div>
						<div className="flex items-center gap-2">
							<Clock className="h-3 w-3" />
							<span>Updated:</span>
							<span>{format(new Date(touchpoint.updated_at), "MMM d, yyyy 'at' h:mm a")}</span>
						</div>
						{touchpoint.external_id && (
							<div className="flex items-center gap-2">
								<span>External:</span>
								<code className="bg-muted/50 px-1.5 py-0.5 rounded font-mono">{touchpoint.external_id}</code>
							</div>
						)}
					</div>
				</div>
			</DetailViewContent>
		</DetailViewLayout>
	);
}

// Import Link component
import Link from "next/link";