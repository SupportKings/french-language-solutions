"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Loader2, Search, User } from "lucide-react";

interface User {
	id: string;
	name: string | null;
	email: string;
	role: string;
}

interface NewConversationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	users: User[];
	isLoading?: boolean;
	onCreateConversation: (userIds: string[]) => void;
	isCreating?: boolean;
}

export function NewConversationDialog({
	open,
	onOpenChange,
	users,
	isLoading,
	onCreateConversation,
	isCreating,
}: NewConversationDialogProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

	const filteredUsers = users.filter((user) => {
		const searchLower = searchQuery.toLowerCase();
		const name = user.name?.toLowerCase() || "";
		const email = user.email.toLowerCase();
		return name.includes(searchLower) || email.includes(searchLower);
	});

	const handleToggleUser = (userId: string) => {
		setSelectedUserIds((prev) =>
			prev.includes(userId)
				? prev.filter((id) => id !== userId)
				: [...prev, userId],
		);
	};

	const handleCreate = () => {
		if (selectedUserIds.length === 0) return;
		onCreateConversation(selectedUserIds);
	};

	const handleClose = () => {
		setSearchQuery("");
		setSelectedUserIds([]);
		onOpenChange(false);
	};

	const getRoleBadgeColor = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-red-500/10 text-red-700 border-red-200";
			case "teacher":
				return "bg-blue-500/10 text-blue-700 border-blue-200";
			case "student":
				return "bg-green-500/10 text-green-700 border-green-200";
			default:
				return "bg-gray-500/10 text-gray-700 border-gray-200";
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>New Conversation</DialogTitle>
					<DialogDescription>
						Select users to start a conversation with.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Search */}
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Search users..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>

					{/* Selected count */}
					{selectedUserIds.length > 0 && (
						<div className="text-muted-foreground text-sm">
							{selectedUserIds.length} user
							{selectedUserIds.length > 1 ? "s" : ""} selected
						</div>
					)}

					{/* Users list */}
					<ScrollArea className="h-[300px] rounded-lg border">
						{isLoading ? (
							<div className="flex items-center justify-center p-8">
								<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							</div>
						) : filteredUsers.length === 0 ? (
							<div className="flex flex-col items-center justify-center p-8 text-center">
								<User className="mb-2 h-8 w-8 text-muted-foreground" />
								<p className="text-muted-foreground text-sm">
									{searchQuery ? "No users found" : "No users available"}
								</p>
							</div>
						) : (
							<div className="space-y-1 p-2">
								{filteredUsers.map((user) => (
									<div
										key={user.id}
										className={cn(
											"flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
											selectedUserIds.includes(user.id)
												? "border-primary bg-primary/5"
												: "border-transparent",
										)}
										onClick={() => handleToggleUser(user.id)}
									>
										<Checkbox
											checked={selectedUserIds.includes(user.id)}
											onCheckedChange={() => handleToggleUser(user.id)}
											onClick={(e) => e.stopPropagation()}
										/>
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<p className="truncate font-medium text-sm">
													{user.name || user.email.split("@")[0]}
												</p>
												<Badge
													variant="outline"
													className={cn(
														"text-xs",
														getRoleBadgeColor(user.role),
													)}
												>
													{user.role}
												</Badge>
											</div>
											<p className="truncate text-muted-foreground text-xs">
												{user.email}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</ScrollArea>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose} disabled={isCreating}>
						Cancel
					</Button>
					<Button
						onClick={handleCreate}
						disabled={selectedUserIds.length === 0 || isCreating}
					>
						{isCreating ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating...
							</>
						) : (
							"Create Conversation"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
