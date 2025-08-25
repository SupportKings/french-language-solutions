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
	Inbox
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

				<div className="grid gap-4 lg:grid-cols-3">
					{/* Main Content - 2 columns */}
					<div className="lg:col-span-2 space-y-4">
						{/* Touchpoint Information */}
						<Card className="bg-background">
							<CardHeader className="py-3">
								<CardTitle className="text-sm">Touchpoint Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Communication Details */}
								<InfoSection title="Communication Details" icon={MessageSquare}>
									<div className="grid gap-3 sm:grid-cols-2">
										<div className="flex items-center gap-2">
											<ChannelIcon className="h-4 w-4 text-muted-foreground" />
											<div>
												<p className="text-xs text-muted-foreground">Channel</p>
												<Badge variant={channelColors[touchpoint.channel as keyof typeof channelColors]} className="mt-0.5">
													{touchpoint.channel.toUpperCase()}
												</Badge>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<TypeIcon className="h-4 w-4 text-muted-foreground" />
											<div>
												<p className="text-xs text-muted-foreground">Direction</p>
												<Badge variant={typeColors[touchpoint.type as keyof typeof typeColors]} className="mt-0.5">
													{touchpoint.type.charAt(0).toUpperCase() + touchpoint.type.slice(1)}
												</Badge>
											</div>
										</div>
									</div>
									<InfoField 
										label="Source" 
										value={
											<Badge variant={sourceColors[touchpoint.source as keyof typeof sourceColors]}>
												{touchpoint.source.replace('_', ' ').toUpperCase()}
											</Badge>
										} 
										icon={Database} 
									/>
									<InfoField 
										label="Occurred At" 
										value={format(new Date(touchpoint.occurred_at), "PPpp")} 
										icon={Clock} 
									/>
								</InfoSection>

								{/* Student Information */}
								<div className="border-t pt-4">
									<InfoSection title="Student" icon={User}>
										<InfoField 
											label="Name" 
											value={
												<Link href={`/admin/students/${touchpoint.student_id}`} className="text-primary hover:underline">
													{touchpoint.student.full_name}
												</Link>
											} 
										/>
										{touchpoint.student.email && (
											<InfoField label="Email" value={touchpoint.student.email} icon={Mail} />
										)}
										{touchpoint.student.mobile_phone_number && (
											<InfoField label="Phone" value={touchpoint.student.mobile_phone_number} icon={Phone} />
										)}
									</InfoSection>
								</div>

								{/* Automation Information */}
								{touchpoint.automated_follow_up && (
									<div className="border-t pt-4">
										<InfoSection title="Automation" icon={Bot}>
											<InfoField 
												label="Sequence" 
												value={
													<Link href={`/admin/automation/automated-follow-ups/${touchpoint.automated_follow_up_id}`} className="text-primary hover:underline">
														{touchpoint.automated_follow_up.sequence_name}
													</Link>
												} 
											/>
											<InfoField 
												label="Status" 
												value={
													<Badge variant="success">
														{touchpoint.automated_follow_up.status}
													</Badge>
												} 
											/>
										</InfoSection>
									</div>
								)}

								{/* External Integration */}
								{(touchpoint.external_id || externalData) && (
									<div className="border-t pt-4">
										<InfoSection title="External Integration" icon={ExternalLink}>
											{touchpoint.external_id && (
												<InfoField label="External ID" value={touchpoint.external_id} icon={Hash} />
											)}
											{externalData && (
												<>
													{externalData.provider && (
														<InfoField label="Provider" value={externalData.provider} />
													)}
													{externalData.message_id && (
														<InfoField label="Message ID" value={externalData.message_id} />
													)}
												</>
											)}
										</InfoSection>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Sidebar - 1 column */}
					<div className="space-y-4">
						{/* Related Follow-ups */}
						{touchpoint.automated_follow_up && (
							<RelatedDataCard
								title="Related Follow-up"
								subtitle="Part of automated sequence"
								actionLabel="View"
								actionIcon={ExternalLink}
								actionHref={`/admin/automation/automated-follow-ups/${touchpoint.automated_follow_up_id}`}
							>
								<div className="space-y-2">
									<div className="rounded-lg border bg-muted/10 p-3">
										<p className="text-sm font-medium">{touchpoint.automated_follow_up.sequence_name}</p>
										<Badge variant="success" className="mt-1 h-4 text-[10px] px-1.5">
											{touchpoint.automated_follow_up.status}
										</Badge>
									</div>
								</div>
							</RelatedDataCard>
						)}

						{/* System Info */}
						<SystemInfoCard
							id={touchpoint.id}
							createdAt={format(new Date(touchpoint.created_at), "MMM d, yyyy")}
							updatedAt={format(new Date(touchpoint.updated_at), "MMM d, yyyy")}
							additionalFields={[
								{ label: "Source", value: touchpoint.source }
							]}
						/>
					</div>
				</div>
			</DetailViewContent>
		</DetailViewLayout>
	);
}

// Import Link component
import Link from "next/link";