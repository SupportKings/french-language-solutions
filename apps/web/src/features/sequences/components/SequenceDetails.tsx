"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { format } from "date-fns";
import {
	ArrowLeft,
	CheckCircle,
	Clock,
	Edit,
	Mail,
	MessageSquare,
	Timer,
	XCircle,
} from "lucide-react";
import { useSequence } from "../queries/sequences.queries";

interface SequenceDetailsProps {
	sequenceId: string;
}

export function SequenceDetails({ sequenceId }: SequenceDetailsProps) {
	const router = useRouter();
	const { data: sequence, isLoading, error } = useSequence(sequenceId);

	const formatDelay = (hours: number) => {
		if (hours < 1) {
			return `${hours * 60} minutes`;
		}
		if (hours < 24) {
			return `${hours} hour${hours > 1 ? "s" : ""}`;
		}
		const days = Math.floor(hours / 24);
		const remainingHours = hours % 24;
		return `${days} day${days > 1 ? "s" : ""}${remainingHours > 0 ? ` ${remainingHours}h` : ""}`;
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Skeleton className="h-10 w-24" />
					<Skeleton className="h-10 w-32" />
				</div>
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-64" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-32 w-full" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error || !sequence) {
		return (
			<Card>
				<CardContent className="py-10">
					<p className="text-center text-muted-foreground">
						Failed to load sequence details
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Actions bar */}
			<div className="flex items-center justify-between">
				<Button variant="ghost" onClick={() => router.back()} className="gap-2">
					<ArrowLeft className="h-4 w-4" />
					Back
				</Button>
				<Link href={`/admin/automation/sequences/${sequenceId}/edit`}>
					<Button className="gap-2">
						<Edit className="h-4 w-4" />
						Edit Sequence
					</Button>
				</Link>
			</div>

			{/* Sequence overview card */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div>
							<CardTitle className="text-2xl">
								{sequence.display_name}
							</CardTitle>
							<CardDescription className="mt-2">
								<div className="flex items-center gap-2">
									<Mail className="h-4 w-4" />
									Subject: {sequence.subject}
								</div>
							</CardDescription>
						</div>
						<div className="text-right">
							<p className="text-muted-foreground text-sm">Created</p>
							<p className="font-medium text-sm">
								{format(new Date(sequence.created_at), "MMM d, yyyy")}
							</p>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
							<Timer className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-sm">
									First Follow-up Delay
								</p>
								<p className="font-medium">
									{sequence.first_follow_up_delay_minutes < 60
										? `${sequence.first_follow_up_delay_minutes} minutes`
										: sequence.first_follow_up_delay_minutes < 1440
											? `${Math.floor(sequence.first_follow_up_delay_minutes / 60)} hours`
											: `${Math.floor(sequence.first_follow_up_delay_minutes / 1440)} days`}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
							<MessageSquare className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-sm">Total Messages</p>
								<p className="font-medium">
									{sequence.template_follow_up_messages?.length || 0} messages
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
							<CheckCircle className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-muted-foreground text-sm">Active Messages</p>
								<p className="font-medium">
									{sequence.template_follow_up_messages?.filter(
										(m: any) => m.status === "active",
									).length || 0}{" "}
									active
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Messages timeline */}
			<Card>
				<CardHeader>
					<CardTitle>Message Sequence</CardTitle>
					<CardDescription>
						The messages that will be sent in this follow-up sequence
					</CardDescription>
				</CardHeader>
				<CardContent>
					{sequence.template_follow_up_messages &&
					sequence.template_follow_up_messages.length > 0 ? (
						<div className="space-y-4">
							{sequence.template_follow_up_messages.map(
								(message: any, index: number) => (
									<div key={message.id} className="relative">
										{/* Timeline connector */}
										{index <
											sequence.template_follow_up_messages.length - 1 && (
											<div className="absolute top-10 bottom-0 left-5 w-0.5 bg-border" />
										)}

										<div className="flex gap-4">
											{/* Timeline dot */}
											<div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
												<span className="font-medium text-sm">
													{message.step_index}
												</span>
											</div>

											{/* Message content */}
											<div className="flex-1 space-y-2">
												<div className="flex items-center gap-2">
													<Badge
														variant={
															message.status === "active"
																? "default"
																: "secondary"
														}
														className="gap-1"
													>
														{message.status === "active" ? (
															<CheckCircle className="h-3 w-3" />
														) : (
															<XCircle className="h-3 w-3" />
														)}
														{message.status}
													</Badge>
													<div className="flex items-center gap-1 text-muted-foreground text-sm">
														<Clock className="h-3 w-3" />
														Wait {formatDelay(message.time_delay_hours)}
													</div>
												</div>

												<Card>
													<CardContent className="pt-4">
														<p className="whitespace-pre-wrap text-sm">
															{message.message_content}
														</p>
													</CardContent>
												</Card>

												{index <
													sequence.template_follow_up_messages.length - 1 && (
													<div className="pb-4" />
												)}
											</div>
										</div>
									</div>
								),
							)}
						</div>
					) : (
						<div className="py-8 text-center">
							<MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
							<p className="mt-2 text-muted-foreground text-sm">
								No messages configured for this sequence
							</p>
							<Link href={`/admin/automation/sequences/${sequenceId}/edit`}>
								<Button variant="outline" size="sm" className="mt-4">
									Add Messages
								</Button>
							</Link>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
