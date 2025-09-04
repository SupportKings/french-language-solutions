import { useState } from "react";

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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import {
	ArrowDown,
	ArrowUp,
	Clock,
	Edit,
	MessageSquare,
	MoreVertical,
	Plus,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { SequenceMessage } from "../schemas/sequence.schema";

interface SequenceMessagesSectionProps {
	sequenceId: string;
	messages: SequenceMessage[];
	onEditMessage: (message: SequenceMessage) => void;
	onAddMessage: () => void;
}

// Format delay in hours to a readable format
function formatDelay(hours: number): string {
	if (hours === 0) return "Immediately";
	if (hours < 24) return `${hours}h`;
	const days = Math.floor(hours / 24);
	const remainingHours = hours % 24;
	if (remainingHours === 0) {
		return `${days}d`;
	}
	return `${days}d ${remainingHours}h`;
}

// Status colors
const statusColors = {
	active: "success",
	disabled: "secondary",
} as const;

export function SequenceMessagesSection({
	sequenceId,
	messages,
	onEditMessage,
	onAddMessage,
}: SequenceMessagesSectionProps) {
	const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	// Sort messages by step_index
	const sortedMessages = [...messages].sort(
		(a, b) => a.step_index - b.step_index,
	);

	const handleDeleteMessage = async () => {
		if (!deleteMessageId) return;

		setIsDeleting(true);
		try {
			const response = await fetch(
				`/api/sequences/${sequenceId}/messages/${deleteMessageId}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to delete message");
			}

			toast.success("Message deleted successfully");
			// Refresh the page to get updated data
			window.location.reload();
		} catch (error) {
			toast.error("Failed to delete message");
		} finally {
			setIsDeleting(false);
			setDeleteMessageId(null);
		}
	};

	const handleMoveMessage = async (
		messageId: string,
		direction: "up" | "down",
	) => {
		try {
			const currentIndex = sortedMessages.findIndex((m) => m.id === messageId);
			if (currentIndex === -1) return;

			const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
			if (newIndex < 0 || newIndex >= sortedMessages.length) return;

			// Swap step indices
			const response = await fetch(
				`/api/sequences/${sequenceId}/messages/reorder`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						messageId,
						newIndex,
					}),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to reorder message");
			}

			toast.success("Message order updated");
			window.location.reload();
		} catch (error) {
			toast.error("Failed to reorder message");
		}
	};

	if (sortedMessages.length === 0) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="font-medium text-base">Messages</h3>
					<Button size="sm" onClick={onAddMessage}>
						<Plus className="mr-2 h-4 w-4" />
						Add Message
					</Button>
				</div>
				<div className="rounded-lg border bg-muted/30 py-12 text-center">
					<MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<p className="mb-4 font-medium text-sm">
						No messages in this sequence
					</p>
					<p className="mb-4 text-muted-foreground text-xs">
						Messages will be sent to students enrolled in this sequence
					</p>
					<Button variant="outline" size="sm" onClick={onAddMessage}>
						<Plus className="mr-2 h-4 w-4" />
						Add First Message
					</Button>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="font-medium text-base">
						Messages ({sortedMessages.length})
					</h3>
					<Button size="sm" onClick={onAddMessage}>
						<Plus className="mr-2 h-4 w-4" />
						Add Message
					</Button>
				</div>

				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[50px]">Order</TableHead>
								<TableHead className="w-[100px]">Status</TableHead>
								<TableHead className="w-[120px]">Time Delay</TableHead>
								<TableHead>Message Content</TableHead>
								<TableHead className="w-[50px]" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{sortedMessages.map((message, index) => (
								<TableRow
									key={message.id}
									className="cursor-pointer hover:bg-muted/50"
									onClick={(e) => {
										// Don't open if clicking on the dropdown menu
										if (!(e.target as HTMLElement).closest("button")) {
											onEditMessage(message);
										}
									}}
								>
									<TableCell>
										<span className="font-medium">{index + 1}</span>
									</TableCell>
									<TableCell>
										<Badge
											variant={statusColors[message.status]}
											className="text-xs"
										>
											{message.status}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1 text-sm">
											<Clock className="h-3.5 w-3.5 text-muted-foreground" />
											<span>{formatDelay(message.time_delay_hours)}</span>
										</div>
									</TableCell>
									<TableCell>
										<p className="line-clamp-2 max-w-md text-muted-foreground text-sm">
											{message.message_content}
										</p>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0"
												>
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => onEditMessage(message)}
												>
													<Edit className="mr-2 h-3.5 w-3.5" />
													Edit Message
												</DropdownMenuItem>
												{index > 0 && (
													<DropdownMenuItem
														onClick={() => handleMoveMessage(message.id, "up")}
													>
														<ArrowUp className="mr-2 h-3.5 w-3.5" />
														Move Up
													</DropdownMenuItem>
												)}
												{index < sortedMessages.length - 1 && (
													<DropdownMenuItem
														onClick={() =>
															handleMoveMessage(message.id, "down")
														}
													>
														<ArrowDown className="mr-2 h-3.5 w-3.5" />
														Move Down
													</DropdownMenuItem>
												)}
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-destructive focus:text-destructive"
													onClick={() => setDeleteMessageId(message.id)}
												>
													<Trash2 className="mr-2 h-3.5 w-3.5" />
													Delete Message
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>

			<AlertDialog
				open={deleteMessageId !== null}
				onOpenChange={(open) => !open && setDeleteMessageId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Message</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this message? This action cannot
							be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteMessage}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
