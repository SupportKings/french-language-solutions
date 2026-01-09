"use client";

import { useState } from "react";

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
import { Label } from "@/components/ui/label";

import { createTeacherUser } from "@/features/teachers/actions/createTeacherUser";

import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface CreateUserDialogProps {
	teacherId: string;
	teacherName: string;
	teacherEmail?: string;
	teacherRoles?: string[];
	onSuccess?: () => void;
}

// Derive auth role from team roles
function deriveAuthRole(teamRoles?: string[]): "super_admin" | "admin" | "teacher" {
	if (!teamRoles || teamRoles.length === 0) return "teacher";
	// Super Admin gets super_admin access
	if (teamRoles.includes("Super Admin")) {
		return "super_admin";
	}
	// Marketing/Admin gets admin access
	if (teamRoles.includes("Marketing/Admin")) {
		return "admin";
	}
	return "teacher";
}

export function CreateUserDialog({
	teacherId,
	teacherName,
	teacherEmail,
	teacherRoles,
	onSuccess,
}: CreateUserDialogProps) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState(teacherEmail || "");
	const [sendInvite, setSendInvite] = useState(true);

	// Auto-derive role from team roles
	const derivedRole = deriveAuthRole(teacherRoles);

	const handleOpen = (isOpen: boolean) => {
		setOpen(isOpen);
		// Reset email to teacherEmail when dialog opens
		if (isOpen && teacherEmail) {
			setEmail(teacherEmail);
		}
	};

	const handleCreateUser = async () => {
		if (!email) {
			toast.error("Please enter an email address");
			return;
		}

		setLoading(true);
		console.log("Creating user with sendInvite:", sendInvite, "derivedRole:", derivedRole);
		try {
			const result = await createTeacherUser({
				teacherId,
				email,
				role: derivedRole,
				sendInvite,
			});

			if (result?.data?.success) {
				toast.success(result.data.message);
				setOpen(false);
				setEmail(teacherEmail || "");
				setSendInvite(true);
				console.log("User created successfully, calling onSuccess callback");
				// Give the database a moment to update before refreshing
				setTimeout(() => {
					onSuccess?.();
				}, 500);
			} else if (result?.validationErrors) {
				const errors = result.validationErrors._errors || [];
				toast.error(errors[0] || "Failed to create user");
			}
		} catch (error) {
			toast.error("Failed to create user");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Button variant="default" size="sm" onClick={() => handleOpen(true)}>
				<UserPlus className="mr-2 h-3.5 w-3.5" />
				Create User Account
			</Button>

			<Dialog open={open} onOpenChange={handleOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create User Account</DialogTitle>
						<DialogDescription>
							Create a user account for {teacherName}. They will be able to
							login using email OTP authentication.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email Address *</Label>
							<Input
								id="email"
								type="email"
								placeholder="teacher@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={loading}
							/>
						</div>

						<div className="space-y-2">
							<Label>Portal Access Level</Label>
							<div className="flex items-center gap-2">
								<Badge variant={derivedRole === "teacher" ? "secondary" : "default"}>
									{derivedRole === "super_admin"
										? "Super Admin Access"
										: derivedRole === "admin"
											? "Admin Access"
											: "Teacher Access"}
								</Badge>
							</div>
							<p className="text-muted-foreground text-xs">
								Based on team role: {teacherRoles?.length ? teacherRoles.join(", ") : "No role assigned"}
							</p>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="sendInvite"
								checked={sendInvite}
								onCheckedChange={(checked) => setSendInvite(checked as boolean)}
								disabled={loading}
							/>
							<Label
								htmlFor="sendInvite"
								className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Send invitation email
							</Label>
						</div>

						<p className="text-muted-foreground text-sm">
							The user will be able to login using their email address and a
							one-time password sent to their inbox.
						</p>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button onClick={handleCreateUser} disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Create User
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
