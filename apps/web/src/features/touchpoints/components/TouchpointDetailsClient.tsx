"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { EditableSection } from "@/components/inline-edit/EditableSection";
import { InlineEditField } from "@/components/inline-edit/InlineEditField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { format } from "date-fns";
import {
	ArrowLeft,
	Clock,
	Inbox,
	Mail,
	MessageSquare,
	Phone,
	Send,
	User,
} from "lucide-react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";

const channelOptions = [
	{ value: "sms", label: "SMS" },
	{ value: "email", label: "Email" },
	{ value: "whatsapp", label: "WhatsApp" },
	{ value: "call", label: "Call" },
];

const typeOptions = [
	{ value: "inbound", label: "Inbound" },
	{ value: "outbound", label: "Outbound" },
];

const sourceOptions = [
	{ value: "manual", label: "Manual" },
	{ value: "automated", label: "Automated" },
	{ value: "openphone", label: "OpenPhone" },
	{ value: "gmail", label: "Gmail" },
	{ value: "whatsapp_business", label: "WhatsApp Business" },
	{ value: "webhook", label: "Webhook" },
];

const channelColors = {
	sms: "info",
	call: "warning",
	whatsapp: "success",
	email: "secondary",
} as const;

const typeColors = {
	inbound: "success",
	outbound: "info",
} as const;

const channelIcons = {
	sms: Phone,
	call: Phone,
	whatsapp: MessageSquare,
	email: Mail,
};

interface TouchpointDetailsClientProps {
	touchpoint: any;
}

export function TouchpointDetailsClient({
	touchpoint: initialTouchpoint,
}: TouchpointDetailsClientProps) {
	const router = useRouter();
	const [touchpoint, setTouchpoint] = useState(initialTouchpoint);

	// Get redirectTo param from URL
	const [redirectTo] = useQueryState("redirectTo", {
		defaultValue: "/admin/automation/touchpoints",
	});

	const handleUpdate = async (field: string, value: any) => {
		try {
			const apiField = field.includes("_")
				? field
				: field.replace(/([A-Z])/g, "_$1").toLowerCase();

			const response = await fetch(`/api/touchpoints/${touchpoint.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ [apiField]: value }),
			});

			if (!response.ok) throw new Error("Failed to update touchpoint");

			const updated = await response.json();
			setTouchpoint({ ...touchpoint, ...updated });
			toast.success("Touchpoint updated successfully");
		} catch (error) {
			console.error("Error updating touchpoint:", error);
			toast.error("Failed to update touchpoint");
			throw error;
		}
	};

	const ChannelIcon =
		channelIcons[touchpoint.channel as keyof typeof channelIcons] ||
		MessageSquare;
	const TypeIcon = touchpoint.type === "inbound" ? Inbox : Send;

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
			<div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<Link href={redirectTo}>
						<Button variant="ghost" size="sm" className="mb-4">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
					</Link>

					<div className="flex items-start justify-between">
						<div className="flex items-start gap-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
								<ChannelIcon className="h-8 w-8 text-primary" />
							</div>

							<div className="space-y-1">
								<div className="flex items-center gap-3">
									<h1 className="font-bold text-3xl tracking-tight">
										Touchpoint Details
									</h1>
									<Badge
										variant={
											channelColors[
												touchpoint.channel as keyof typeof channelColors
											] as any
										}
										className="px-3 py-1"
									>
										<ChannelIcon className="mr-1 h-3 w-3" />
										{touchpoint.channel?.toUpperCase()}
									</Badge>
									<Badge
										variant={
											typeColors[
												touchpoint.type as keyof typeof typeColors
											] as any
										}
										className="px-3 py-1"
									>
										<TypeIcon className="mr-1 h-3 w-3" />
										{touchpoint.type?.charAt(0).toUpperCase() +
											touchpoint.type?.slice(1)}
									</Badge>
								</div>
								<p className="text-muted-foreground">
									{touchpoint.student?.full_name || "Unknown Student"} •{" "}
									{format(
										new Date(touchpoint.occurred_at),
										"MMM d, yyyy 'at' h:mm a",
									)}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<Link href={`/admin/students/${touchpoint.student_id}`}>
								<Button variant="outline" size="sm">
									<User className="mr-2 h-4 w-4" />
									View Student
								</Button>
							</Link>
						</div>
					</div>
				</div>

				{/* Main Content Card */}
				<Card className="border-border/50 bg-card/95 shadow-xl backdrop-blur-sm">
					<CardContent className="p-0">
						{/* Quick Stats */}
						<div className="border-border/50 border-b bg-muted/30 px-6 py-4">
							<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
								<div className="space-y-1">
									<p className="text-muted-foreground text-xs">Channel</p>
									<Badge
										variant={
											channelColors[
												touchpoint.channel as keyof typeof channelColors
											] as any
										}
									>
										<ChannelIcon className="mr-1 h-3 w-3" />
										{touchpoint.channel?.toUpperCase()}
									</Badge>
								</div>
								<div className="space-y-1">
									<p className="text-muted-foreground text-xs">Type</p>
									<Badge
										variant={
											typeColors[
												touchpoint.type as keyof typeof typeColors
											] as any
										}
									>
										<TypeIcon className="mr-1 h-3 w-3" />
										{touchpoint.type?.charAt(0).toUpperCase() +
											touchpoint.type?.slice(1)}
									</Badge>
								</div>
								<div className="space-y-1">
									<p className="text-muted-foreground text-xs">Source</p>
									<p className="font-medium text-sm">
										{touchpoint.source?.replace("_", " ")?.toUpperCase()}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-muted-foreground text-xs">Occurred</p>
									<p className="font-medium text-sm">
										{format(new Date(touchpoint.occurred_at), "MMM d, h:mm a")}
									</p>
								</div>
							</div>
						</div>

						{/* Message Content */}
						<div className="border-border/50 border-b px-6 py-4">
							<div className="mb-4 flex items-center gap-2">
								<MessageSquare className="h-4 w-4 text-muted-foreground" />
								<h3 className="font-semibold text-base">Message Content</h3>
							</div>
							<div className="rounded-lg bg-muted/50 p-4">
								<p className="whitespace-pre-wrap text-sm leading-relaxed">
									{touchpoint.message || "No message content available"}
								</p>
							</div>
						</div>

						<div className="space-y-4 px-6 py-4">
							{/* Touchpoint Information Section */}
							<EditableSection title="Touchpoint Information">
								{(editing) => (
									<div className="grid gap-8 lg:grid-cols-2">
										<div className="space-y-4">
											<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
												Communication Details
											</h3>
											<div className="space-y-3">
												<div className="flex items-start gap-3">
													<ChannelIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
													<div className="flex-1 space-y-0.5">
														<p className="text-muted-foreground text-xs">
															Channel:
														</p>
														{editing ? (
															<InlineEditField
																value={touchpoint.channel}
																onSave={(value) =>
																	handleUpdate("channel", value)
																}
																editing={editing}
																type="select"
																options={channelOptions}
															/>
														) : (
															<Badge
																variant={
																	channelColors[
																		touchpoint.channel as keyof typeof channelColors
																	] as any
																}
																className="mt-1"
															>
																<ChannelIcon className="mr-1 h-3 w-3" />
																{touchpoint.channel?.toUpperCase()}
															</Badge>
														)}
													</div>
												</div>

												<div className="flex items-start gap-3">
													<TypeIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
													<div className="flex-1 space-y-0.5">
														<p className="text-muted-foreground text-xs">
															Type:
														</p>
														{editing ? (
															<InlineEditField
																value={touchpoint.type}
																onSave={(value) => handleUpdate("type", value)}
																editing={editing}
																type="select"
																options={typeOptions}
															/>
														) : (
															<Badge
																variant={
																	typeColors[
																		touchpoint.type as keyof typeof typeColors
																	] as any
																}
																className="mt-1"
															>
																<TypeIcon className="mr-1 h-3 w-3" />
																{touchpoint.type?.charAt(0).toUpperCase() +
																	touchpoint.type?.slice(1)}
															</Badge>
														)}
													</div>
												</div>

												<div className="flex items-start gap-3">
													<Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
													<div className="flex-1 space-y-0.5">
														<p className="text-muted-foreground text-xs">
															Occurred At:
														</p>
														{editing ? (
															<InlineEditField
																value={
																	touchpoint.occurred_at
																		? new Date(touchpoint.occurred_at)
																				.toISOString()
																				.slice(0, 16)
																		: ""
																}
																onSave={(value) =>
																	handleUpdate(
																		"occurredAt",
																		value
																			? new Date(value).toISOString()
																			: null,
																	)
																}
																editing={editing}
																type="text"
																placeholder="YYYY-MM-DDTHH:MM"
															/>
														) : (
															<p className="font-medium text-sm">
																{format(
																	new Date(touchpoint.occurred_at),
																	"MMMM d, yyyy 'at' h:mm a",
																)}
															</p>
														)}
													</div>
												</div>
											</div>
										</div>

										<div className="space-y-4">
											<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
												Message Content
											</h3>
											<div className="space-y-3">
												{editing ? (
													<InlineEditField
														value={touchpoint.message || ""}
														onSave={(value) =>
															handleUpdate("message", value || null)
														}
														editing={editing}
														type="textarea"
														placeholder="Enter message content..."
													/>
												) : (
													<div className="rounded-lg border bg-muted/10 p-3">
														<p className="whitespace-pre-wrap text-sm">
															{touchpoint.message || "No message content"}
														</p>
													</div>
												)}
											</div>
										</div>
									</div>
								)}
							</EditableSection>

							{/* Student Information */}
							<Card className="border-border/50">
								<CardHeader className="pb-3">
									<CardTitle className="text-base">
										Student Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid gap-6 lg:grid-cols-2">
										<div className="space-y-3">
											<div className="flex items-start gap-3">
												<User className="mt-0.5 h-4 w-4 text-muted-foreground" />
												<div className="flex-1 space-y-0.5">
													<p className="text-muted-foreground text-xs">
														Full Name:
													</p>
													<p className="font-medium text-sm">
														{touchpoint.student?.full_name || "Unknown Student"}
													</p>
												</div>
											</div>

											<div className="flex items-start gap-3">
												<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
												<div className="flex-1 space-y-0.5">
													<p className="text-muted-foreground text-xs">
														Email:
													</p>
													<p className="font-medium text-sm">
														{touchpoint.student?.email || "Not provided"}
													</p>
												</div>
											</div>
										</div>

										<div className="space-y-3">
											<div className="flex items-start gap-3">
												<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
												<div className="flex-1 space-y-0.5">
													<p className="text-muted-foreground text-xs">
														Phone:
													</p>
													<p className="font-medium text-sm">
														{touchpoint.student?.mobile_phone_number ||
															"Not provided"}
													</p>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* System Information */}
							<Card className="border-border/50 bg-muted/10">
								<CardHeader className="pb-3">
									<CardTitle className="text-muted-foreground text-sm">
										System Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
										<div className="space-y-1">
											<p className="text-muted-foreground text-xs">
												Touchpoint ID
											</p>
											<p className="font-mono text-muted-foreground text-xs">
												{touchpoint.id}
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-muted-foreground text-xs">
												Created Date
											</p>
											<p className="text-sm">
												{format(new Date(touchpoint.created_at), "MMM d, yyyy")}
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-muted-foreground text-xs">
												Last Updated
											</p>
											<p className="text-sm">
												{format(
													new Date(
														touchpoint.updated_at || touchpoint.created_at,
													),
													"MMM d, yyyy",
												)}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
