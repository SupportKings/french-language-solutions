"use client";

import { useSequence } from "../queries/sequences.queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
	MessageSquare, 
	Clock, 
	Mail, 
	Timer,
	CheckCircle,
	XCircle,
	ArrowLeft,
	Edit
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SequenceDetailsProps {
	sequenceId: string;
}

export function SequenceDetails({ sequenceId }: SequenceDetailsProps) {
	const router = useRouter();
	const { data: sequence, isLoading, error } = useSequence(sequenceId);

	const formatDelay = (hours: number) => {
		if (hours < 1) {
			return `${hours * 60} minutes`;
		} else if (hours < 24) {
			return `${hours} hour${hours > 1 ? 's' : ''}`;
		} else {
			const days = Math.floor(hours / 24);
			const remainingHours = hours % 24;
			return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
		}
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
				<Button 
					variant="ghost" 
					onClick={() => router.back()}
					className="gap-2"
				>
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
							<CardTitle className="text-2xl">{sequence.display_name}</CardTitle>
							<CardDescription className="mt-2">
								<div className="flex items-center gap-2">
									<Mail className="h-4 w-4" />
									Subject: {sequence.subject}
								</div>
							</CardDescription>
						</div>
						<div className="text-right">
							<p className="text-sm text-muted-foreground">Created</p>
							<p className="text-sm font-medium">
								{format(new Date(sequence.created_at), "MMM d, yyyy")}
							</p>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
							<Timer className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">First Follow-up Delay</p>
								<p className="font-medium">
									{sequence.first_follow_up_delay_minutes < 60 
										? `${sequence.first_follow_up_delay_minutes} minutes`
										: sequence.first_follow_up_delay_minutes < 1440
										? `${Math.floor(sequence.first_follow_up_delay_minutes / 60)} hours`
										: `${Math.floor(sequence.first_follow_up_delay_minutes / 1440)} days`
									}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
							<MessageSquare className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">Total Messages</p>
								<p className="font-medium">
									{sequence.template_follow_up_messages?.length || 0} messages
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
							<CheckCircle className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">Active Messages</p>
								<p className="font-medium">
									{sequence.template_follow_up_messages?.filter((m: any) => m.status === "active").length || 0} active
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
					{sequence.template_follow_up_messages && sequence.template_follow_up_messages.length > 0 ? (
						<div className="space-y-4">
							{sequence.template_follow_up_messages.map((message: any, index: number) => (
								<div
									key={message.id}
									className="relative"
								>
									{/* Timeline connector */}
									{index < sequence.template_follow_up_messages.length - 1 && (
										<div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border" />
									)}
									
									<div className="flex gap-4">
										{/* Timeline dot */}
										<div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background">
											<span className="text-sm font-medium">{message.step_index}</span>
										</div>
										
										{/* Message content */}
										<div className="flex-1 space-y-2">
											<div className="flex items-center gap-2">
												<Badge 
													variant={message.status === "active" ? "default" : "secondary"}
													className="gap-1"
												>
													{message.status === "active" ? (
														<CheckCircle className="h-3 w-3" />
													) : (
														<XCircle className="h-3 w-3" />
													)}
													{message.status}
												</Badge>
												<div className="flex items-center gap-1 text-sm text-muted-foreground">
													<Clock className="h-3 w-3" />
													Wait {formatDelay(message.time_delay_hours)}
												</div>
											</div>
											
											<Card>
												<CardContent className="pt-4">
													<p className="text-sm whitespace-pre-wrap">{message.message_content}</p>
												</CardContent>
											</Card>
											
											{index < sequence.template_follow_up_messages.length - 1 && (
												<div className="pb-4" />
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
							<p className="mt-2 text-sm text-muted-foreground">
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