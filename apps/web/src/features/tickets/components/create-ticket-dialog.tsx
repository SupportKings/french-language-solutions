"use client";

import { useState } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface CreateTicketDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateTicketDialog({
	open,
	onOpenChange,
}: CreateTicketDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Ticket</DialogTitle>
				</DialogHeader>
				<div className="py-4">
					<p>Ticket creation form will go here</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
