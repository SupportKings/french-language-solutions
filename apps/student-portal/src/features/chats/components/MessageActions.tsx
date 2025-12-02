"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";

interface MessageActionsProps {
	onEdit: () => void;
	onDelete: () => void;
	isDeleting?: boolean;
}

export function MessageActions({
	onEdit,
	onDelete,
	isDeleting = false,
}: MessageActionsProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size="icon"
					variant="ghost"
					className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
				>
					<MoreVertical className="h-4 w-4" />
					<span className="sr-only">Message actions</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-40">
				<DropdownMenuItem onClick={onEdit} className="cursor-pointer">
					<Pencil className="mr-2 h-4 w-4" />
					<span>Edit</span>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={onDelete}
					disabled={isDeleting}
					className="cursor-pointer text-destructive focus:text-destructive"
				>
					<Trash2 className="mr-2 h-4 w-4" />
					<span>Delete</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
