import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { AlertCircle, Bot, ChevronRight } from "lucide-react";

interface SequenceActiveFollowUpsProps {
	sequenceId: string;
}

export function SequenceActiveFollowUps({
	sequenceId,
}: SequenceActiveFollowUpsProps) {
	// This would normally fetch data from an API
	// For now, we'll show a placeholder
	const activeFollowUps: any[] = [];

	if (activeFollowUps.length === 0) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="font-medium text-base">Active Follow-ups</h3>
				</div>
				<div className="rounded-lg border bg-muted/30 py-12 text-center">
					<Bot className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<p className="mb-2 font-medium text-sm">No active follow-ups</p>
					<p className="text-muted-foreground text-xs">
						Active follow-ups will appear here when students are enrolled in
						this sequence
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium text-base">
					Active Follow-ups ({activeFollowUps.length})
				</h3>
				<Button size="sm" variant="outline" asChild>
					<Link
						href={`/admin/automation/automated-follow-ups?sequence_id=${sequenceId}`}
					>
						View All
						<ChevronRight className="ml-1 h-3.5 w-3.5" />
					</Link>
				</Button>
			</div>
			<div className="space-y-2">
				{activeFollowUps.map((followUp: any) => (
					<div key={followUp.id} className="rounded-lg border bg-card p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-sm">{followUp.studentName}</p>
								<p className="text-muted-foreground text-xs">
									Started {followUp.startedAgo}
								</p>
							</div>
							<Badge variant="info" className="text-xs">
								Message {followUp.currentStep}/{followUp.totalSteps}
							</Badge>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
