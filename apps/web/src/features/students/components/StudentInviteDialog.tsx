"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createStudentUser } from "@/features/students/actions/createStudentUser";
import { toggleStudentAccess } from "@/features/students/actions/toggleStudentAccess";
import { studentsKeys } from "@/features/students/queries/students.queries";

import { useQueryClient } from "@tanstack/react-query";
import {
	AlertTriangle,
	Loader2,
	Mail,
	Send,
	Settings,
	ShieldCheck,
	ShieldX,
	UserPlus,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface StudentPortalAccessDialogProps {
	studentId: string;
	studentEmail: string | null;
	studentName: string;
	userId: string | null;
	isBanned: boolean;
}

export function StudentPortalAccessDialog({
	studentId,
	studentEmail,
	studentName,
	userId,
	isBanned,
}: StudentPortalAccessDialogProps) {
	const [open, setOpen] = useState(false);
	const [email, setEmail] = useState(studentEmail || "");
	const [sendInvite, setSendInvite] = useState(true);
	const [revokeReason, setRevokeReason] = useState("");
	const queryClient = useQueryClient();

	const hasUserAccount = !!userId;

	const { execute: executeCreate, isPending: isCreating } = useAction(
		createStudentUser,
		{
			onSuccess: (result) => {
				if (result.data?.success) {
					toast.success(result.data.message);
					setOpen(false);
					queryClient.invalidateQueries({ queryKey: studentsKeys.detail(studentId) });
				}
			},
			onError: ({ error }) => {
				if (error.validationErrors?._errors) {
					toast.error(error.validationErrors._errors[0]);
				} else {
					toast.error("Failed to create student user");
				}
			},
		},
	);

	const { execute: executeToggle, isPending: isToggling } = useAction(
		toggleStudentAccess,
		{
			onSuccess: (result) => {
				if (result.data?.success) {
					toast.success(result.data.message);
					setOpen(false);
					setRevokeReason("");
					queryClient.invalidateQueries({ queryKey: studentsKeys.detail(studentId) });
				}
			},
			onError: ({ error }) => {
				if (error.validationErrors?._errors) {
					toast.error(error.validationErrors._errors[0]);
				} else {
					toast.error("Failed to update student access");
				}
			},
		},
	);

	const isPending = isCreating || isToggling;

	const handleInviteSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		executeCreate({
			studentId,
			email,
			sendInvite,
		});
	};

	const handleRevokeAccess = () => {
		if (!userId) return;
		executeToggle({
			userId,
			action: "revoke",
			reason: revokeReason || undefined,
		});
	};

	const handleRestoreAccess = () => {
		if (!userId) return;
		executeToggle({
			userId,
			action: "restore",
		});
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (newOpen) {
			setEmail(studentEmail || "");
			setSendInvite(true);
			setRevokeReason("");
		}
	};

	// Determine which button/trigger to show
	const getTriggerButton = () => {
		if (!hasUserAccount) {
			return (
				<Button variant="outline" size="sm" className="gap-2">
					<UserPlus className="h-4 w-4" />
					Invite to Portal
				</Button>
			);
		}

		return (
			<Button variant="outline" size="sm" className="gap-2">
				<Settings className="h-4 w-4" />
				Manage Access
			</Button>
		);
	};

	// Render invite form for students without accounts
	const renderInviteContent = () => (
		<>
			<DialogHeader>
				<DialogTitle className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
						<Send className="h-5 w-5 text-primary" />
					</div>
					<span>Invite Student</span>
				</DialogTitle>
				<DialogDescription>
					Send an invitation to <strong>{studentName}</strong> to access the
					student portal. They will receive an email with login instructions.
				</DialogDescription>
			</DialogHeader>

			<form onSubmit={handleInviteSubmit} className="space-y-6">
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email" className="font-medium text-sm">
							Email Address
						</Label>
						<div className="relative">
							<Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="email"
								type="email"
								placeholder="student@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="pl-10"
								disabled={isPending}
								required
							/>
						</div>
						<p className="text-muted-foreground text-xs">
							This email will be used for the student's login credentials.
						</p>
					</div>

					<div className="flex items-start space-x-3 rounded-lg border border-border/50 bg-muted/30 p-4">
						<Checkbox
							id="sendInvite"
							checked={sendInvite}
							onCheckedChange={(checked) => setSendInvite(checked === true)}
							disabled={isPending}
							className="mt-0.5"
						/>
						<div className="space-y-1">
							<Label
								htmlFor="sendInvite"
								className="cursor-pointer font-medium text-sm leading-none"
							>
								Send invitation email
							</Label>
							<p className="text-muted-foreground text-xs">
								The student will receive an email with a link to set up their
								account.
							</p>
						</div>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending || !email.trim()}>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating...
							</>
						) : (
							<>
								<UserPlus className="mr-2 h-4 w-4" />
								Create Account
							</>
						)}
					</Button>
				</DialogFooter>
			</form>
		</>
	);

	// Render revoke access content for active accounts
	const renderRevokeContent = () => (
		<>
			<DialogHeader>
				<DialogTitle className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
						<ShieldX className="h-5 w-5 text-destructive" />
					</div>
					<span>Revoke Portal Access</span>
				</DialogTitle>
				<DialogDescription>
					This will prevent <strong>{studentName}</strong> from logging into
					the student portal. You can restore access at any time.
				</DialogDescription>
			</DialogHeader>

			<div className="space-y-4">
				<div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
					<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
					<div className="space-y-1">
						<p className="font-medium text-amber-800 text-sm dark:text-amber-200">
							The student will lose access immediately
						</p>
						<p className="text-amber-700 text-xs dark:text-amber-300">
							Any active sessions will be terminated and the student won't be
							able to log in until access is restored.
						</p>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="reason" className="font-medium text-sm">
						Reason (optional)
					</Label>
					<Textarea
						id="reason"
						placeholder="e.g., Course completed, Payment issue, etc."
						value={revokeReason}
						onChange={(e) => setRevokeReason(e.target.value)}
						disabled={isPending}
						rows={2}
					/>
					<p className="text-muted-foreground text-xs">
						This will be recorded for internal reference.
					</p>
				</div>
			</div>

			<DialogFooter className="gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={() => setOpen(false)}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button
					variant="destructive"
					onClick={handleRevokeAccess}
					disabled={isPending}
				>
					{isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Revoking...
						</>
					) : (
						<>
							<ShieldX className="mr-2 h-4 w-4" />
							Revoke Access
						</>
					)}
				</Button>
			</DialogFooter>
		</>
	);

	// Render restore access content for banned accounts
	const renderRestoreContent = () => (
		<>
			<DialogHeader>
				<DialogTitle className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50">
						<ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-500" />
					</div>
					<span>Restore Portal Access</span>
				</DialogTitle>
				<DialogDescription>
					Restore <strong>{studentName}</strong>'s access to the student
					portal. They will be able to log in again immediately.
				</DialogDescription>
			</DialogHeader>

			<div className="space-y-4">
				<div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">
					<ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-500" />
					<div className="space-y-1">
						<p className="font-medium text-green-800 text-sm dark:text-green-200">
							Access will be restored immediately
						</p>
						<p className="text-green-700 text-xs dark:text-green-300">
							The student will be able to log into the portal using their
							existing credentials.
						</p>
					</div>
				</div>
			</div>

			<DialogFooter className="gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={() => setOpen(false)}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button onClick={handleRestoreAccess} disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Restoring...
						</>
					) : (
						<>
							<ShieldCheck className="mr-2 h-4 w-4" />
							Restore Access
						</>
					)}
				</Button>
			</DialogFooter>
		</>
	);

	// Determine which content to render
	const renderContent = () => {
		if (!hasUserAccount) {
			return renderInviteContent();
		}
		if (isBanned) {
			return renderRestoreContent();
		}
		return renderRevokeContent();
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger render={getTriggerButton()} />
			<DialogContent className="sm:max-w-md">{renderContent()}</DialogContent>
		</Dialog>
	);
}
