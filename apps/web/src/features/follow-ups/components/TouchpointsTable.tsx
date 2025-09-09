"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { format } from "date-fns";
import {
	ArrowDown,
	ArrowUp,
	Bot,
	ExternalLink,
	Mail,
	MessageSquare,
	Phone,
	User,
} from "lucide-react";
import type { AutomatedFollowUpWithRelations } from "../types/follow-up.types";

interface TouchpointsTableProps {
	followUp: AutomatedFollowUpWithRelations;
}

// Format touchpoint channel for display
const formatChannel = (channel: string) => {
	switch (channel) {
		case "sms":
			return "SMS";
		case "call":
			return "Call";
		case "whatsapp":
			return "WhatsApp";
		case "email":
			return "Email";
		default:
			return channel;
	}
};

// Get channel icon
const getChannelIcon = (channel: string) => {
	switch (channel) {
		case "sms":
			return MessageSquare;
		case "call":
			return Phone;
		case "whatsapp":
			return MessageSquare;
		case "email":
			return Mail;
		default:
			return MessageSquare;
	}
};

// Format touchpoint type
const formatType = (type: string) => {
	switch (type) {
		case "inbound":
			return "Inbound";
		case "outbound":
			return "Outbound";
		default:
			return type;
	}
};

// Get type icon and color
const getTypeIcon = (type: string) => {
	switch (type) {
		case "inbound":
			return ArrowDown;
		case "outbound":
			return ArrowUp;
		default:
			return ArrowDown;
	}
};

const getTypeVariant = (type: string) => {
	switch (type) {
		case "inbound":
			return "default" as const;
		case "outbound":
			return "secondary" as const;
		default:
			return "outline" as const;
	}
};

// Format source for display
const formatSource = (source: string) => {
	switch (source) {
		case "manual":
			return "Manual";
		case "automated":
			return "Automated";
		case "openphone":
			return "OpenPhone";
		case "gmail":
			return "Gmail";
		case "whatsapp_business":
			return "WhatsApp Business";
		case "webhook":
			return "Webhook";
		default:
			return source;
	}
};

// Get source icon
const getSourceIcon = (source: string) => {
	switch (source) {
		case "manual":
			return User;
		case "automated":
			return Bot;
		default:
			return User;
	}
};

export function TouchpointsTable({ followUp }: TouchpointsTableProps) {
	const touchpoints = followUp.touchpoints || [];

	if (touchpoints.length === 0) {
		return (
			<div className="rounded-lg border bg-card">
				<div className="border-b p-4">
					<h2 className="font-semibold text-lg">Touchpoints</h2>
				</div>
				<div className="p-8 text-center">
					<MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<p className="text-muted-foreground">No touchpoints found</p>
					<p className="mt-2 text-muted-foreground text-sm">
						Touchpoints will appear here once messages are sent or received.
					</p>
				</div>
			</div>
		);
	}

	// Sort touchpoints by occurred_at descending (newest first)
	const sortedTouchpoints = [...touchpoints].sort(
		(a, b) =>
			new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
	);

	return (
		<div className="rounded-lg border bg-card">
			<div className="border-b p-4">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-lg">Touchpoints</h2>
					<Badge variant="secondary" className="text-xs">
						{touchpoints.length}{" "}
						{touchpoints.length === 1 ? "touchpoint" : "touchpoints"}
					</Badge>
				</div>
			</div>

			<div className="space-y-0">
				{sortedTouchpoints.map((touchpoint, index) => {
					const ChannelIcon = getChannelIcon(touchpoint.channel);
					const TypeIcon = getTypeIcon(touchpoint.type);
					const SourceIcon = getSourceIcon(touchpoint.source);
					const isLast = index === sortedTouchpoints.length - 1;

					return (
						<div
							key={touchpoint.id}
							className={`group relative p-4 transition-colors hover:bg-muted/30 ${
								!isLast ? "border-b" : ""
							}`}
						>
							<div className="flex items-start gap-4">
								{/* Channel & Type Icons */}
								<div className="flex flex-col items-center gap-2">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
										<ChannelIcon className="h-4 w-4 text-primary" />
									</div>
									<Badge
										variant={getTypeVariant(touchpoint.type)}
										className="h-5 px-1.5 text-xs"
									>
										<TypeIcon className="mr-1 h-3 w-3" />
										{formatType(touchpoint.type)}
									</Badge>
								</div>

								{/* Content */}
								<div className="min-w-0 flex-1">
									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0 flex-1">
											{/* Header */}
											<div className="mb-2 flex flex-wrap items-center gap-2">
												<Badge variant="outline" className="h-5 px-1.5 text-xs">
													{formatChannel(touchpoint.channel)}
												</Badge>
												<Badge variant="outline" className="h-5 px-1.5 text-xs">
													<SourceIcon className="mr-1 h-3 w-3" />
													{formatSource(touchpoint.source)}
												</Badge>
												<span className="text-muted-foreground text-xs">
													{format(
														new Date(touchpoint.occurred_at),
														"MMM d, yyyy 'at' h:mm a",
													)}
												</span>
											</div>

											{/* Message */}
											<div className="rounded-lg bg-muted/30 p-3">
												<p className="text-sm leading-relaxed">
													{touchpoint.message}
												</p>
											</div>
										</div>

										{/* Action Button */}
										<div className="opacity-0 transition-opacity group-hover:opacity-100">
											<Button variant="ghost" size="sm" asChild>
												<Link
													href={`/admin/automation/touchpoints/${touchpoint.id}`}
												>
													<ExternalLink className="h-3.5 w-3.5" />
												</Link>
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
