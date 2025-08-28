"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CreateTicketDialog } from "@/features/tickets/components/create-ticket-dialog";

import { Plus, Ticket } from "lucide-react";

export function NewButton() {
	const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const handleTicketClick = () => {
		setDropdownOpen(false);

		setIsTicketDialogOpen(true);
	};

	return (
		<>
			<DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="default"
						size="sm"
						className="w-full justify-center gap-2 text-center"
					>
						<Plus size={16} />
						New
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[var(--radix-dropdown-menu-trigger-width)]"
					sideOffset={4}
					onCloseAutoFocus={(e) => {
						// Prevent focus from returning to trigger when dialog opens
						if (isTicketDialogOpen) {
							e.preventDefault();
						}
					}}
				>
					<DropdownMenuItem
						onClick={handleTicketClick}
						onSelect={(e) => {
							// Prevent default to control when dropdown closes
							e.preventDefault();
							handleTicketClick();
						}}
					>
						<Ticket className="mr-2 h-4 w-4" />
						Support Ticket
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<CreateTicketDialog
				open={isTicketDialogOpen}
				onOpenChange={setIsTicketDialogOpen}
			/>
		</>
	);
}
