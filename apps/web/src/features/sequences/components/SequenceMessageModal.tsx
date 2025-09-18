"use client";

import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Info, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import type { SequenceMessage } from "../schemas/sequence.schema";

interface SequenceMessageModalProps {
	open: boolean;
	onClose: () => void;
	sequenceId: string;
	messageToEdit?: SequenceMessage | null;
}

export function SequenceMessageModal({
	open,
	onClose,
	sequenceId,
	messageToEdit,
}: SequenceMessageModalProps) {
	const isEdit = !!messageToEdit;
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState({
		time_delay_hours: 24,
		status: "active" as "active" | "disabled",
		message_content: "",
	});

	// Populate form data when editing
	useEffect(() => {
		if (isEdit && messageToEdit) {
			setFormData({
				time_delay_hours: messageToEdit.time_delay_hours,
				status: messageToEdit.status,
				message_content: messageToEdit.message_content,
			});
		} else if (!isEdit) {
			// Reset form for add mode
			setFormData({
				time_delay_hours: 24,
				status: "active",
				message_content: "",
			});
		}
	}, [isEdit, messageToEdit, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.message_content.trim()) {
			toast.error("Message content is required");
			return;
		}

		if (formData.time_delay_hours < 0) {
			toast.error("Time delay cannot be negative");
			return;
		}

		setIsLoading(true);

		try {
			const url = isEdit
				? `/api/sequences/${sequenceId}/messages/${messageToEdit.id}`
				: `/api/sequences/${sequenceId}/messages`;

			const response = await fetch(url, {
				method: isEdit ? "PATCH" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				throw new Error(`Failed to ${isEdit ? "update" : "add"} message`);
			}

			toast.success(`Message ${isEdit ? "updated" : "added"} successfully!`);
			onClose();
			// Refresh the page to get updated data
			setTimeout(() => {
				window.location.reload();
			}, 100);
		} catch (error) {
			console.error(`Error ${isEdit ? "updating" : "adding"} message:`, error);
			toast.error(`Failed to ${isEdit ? "update" : "add"} message`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			onClose();
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[650px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-lg">
						<MessageSquare className="h-5 w-5 text-primary" />
						{isEdit ? "Edit Follow-up Message" : "Add Follow-up Message"}
					</DialogTitle>
					<DialogDescription>
						Create an automated message that will be sent as part of this
						sequence.
					</DialogDescription>
				</DialogHeader>

				{/* Important Notice */}
				<Alert className="border-primary/20 bg-primary/5">
					<Info className="h-4 w-4 text-primary" />
					<AlertDescription className="text-sm">
						<p className="mb-2 font-medium">Please note:</p>
						<ul className="ml-4 list-disc space-y-1 text-muted-foreground">
							<li>
								Follow-up messages will be sent in the exact order they appear
								in the sequence
							</li>
							<li>
								Each message delay is calculated from the previous message
							</li>
							<li>
								Use template variables to personalize your messages dynamically
							</li>
							<li>
								Test your messages thoroughly before activating the sequence
							</li>
						</ul>
					</AlertDescription>
				</Alert>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Time Delay and Status Row */}
					<div className="grid gap-4 sm:grid-cols-2">
						{/* Time Delay */}
						<div className="space-y-2">
							<Label htmlFor="time_delay">Time Delay *</Label>
							<div className="flex items-center gap-2">
								<Input
									id="time_delay"
									type="number"
									min="0"
									placeholder="24"
									value={formData.time_delay_hours}
									onChange={(e) =>
										setFormData({
											...formData,
											time_delay_hours: Number.parseInt(e.target.value) || 0,
										})
									}
									required
									className="flex-1"
								/>
								<span className="text-muted-foreground text-sm">hours</span>
							</div>
							<p className="text-muted-foreground text-xs">
								Time to wait after the previous message
							</p>
						</div>

						{/* Status */}
						<div className="space-y-2">
							<Label htmlFor="status">Status *</Label>
							<Select
								value={formData.status}
								onValueChange={(value: "active" | "disabled") =>
									setFormData({ ...formData, status: value })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="disabled">Disabled</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-muted-foreground text-xs">
								Active messages will be sent automatically
							</p>
						</div>
					</div>

					{/* Message Content */}
					<div className="space-y-2">
						<Label htmlFor="content">Message Content *</Label>
						<Textarea
							id="content"
							placeholder="Hi {{student_name}},

I wanted to follow up on your enrollment...

Best regards,
"
							value={formData.message_content}
							onChange={(e) =>
								setFormData({ ...formData, message_content: e.target.value })
							}
							rows={10}
							required
							className="resize-none font-mono text-sm"
						/>
						<div className="rounded-lg border border-muted bg-muted/30 p-3">
							<p className="mb-2 font-medium text-xs">
								Available template variables:
							</p>
							<div className="flex flex-wrap gap-2">
								<code className="rounded bg-background px-2 py-1 text-xs">
									{"{{First Name}}"}
								</code>
								<code className="rounded bg-background px-2 py-1 text-xs">
									{"{{Last Name}}"}
								</code>
								<code className="rounded bg-background px-2 py-1 text-xs">
									{"{{Full Name}}"}
								</code>
							</div>
							<p className="mt-2 text-muted-foreground text-xs">
								Variables will be replaced with actual values when messages are
								sent
							</p>
						</div>
					</div>

					{/* Form Actions */}
					<div className="flex justify-end gap-3 border-t pt-6">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading
								? isEdit
									? "Updating..."
									: "Adding..."
								: isEdit
									? "Update Message"
									: "Add Message"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
