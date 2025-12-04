"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { updateChatNotificationPreferences } from "../actions/updateChatNotificationPreferences";

interface ChatNotificationSettingsProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialEmailEnabled: boolean;
	onPreferencesUpdated?: (emailEnabled: boolean) => void;
}

export function ChatNotificationSettings({
	open,
	onOpenChange,
	initialEmailEnabled,
	onPreferencesUpdated,
}: ChatNotificationSettingsProps) {
	const [emailEnabled, setEmailEnabled] = useState(initialEmailEnabled);

	// Reset state when dialog opens with new initial value
	useEffect(() => {
		setEmailEnabled(initialEmailEnabled);
	}, [initialEmailEnabled, open]);

	const { execute, isPending } = useAction(updateChatNotificationPreferences, {
		onSuccess: ({ data }: any) => {
			if (data) {
				toast.success("Notification preferences updated");
				onPreferencesUpdated?.(data?.emailNotificationsEnabled);
				onOpenChange(false);
			}
		},
		onError: ({ error }) => {
			toast.error(error.serverError || "Failed to update preferences");
			// Revert to initial state on error
			setEmailEnabled(initialEmailEnabled);
		},
	});

	const handleSave = () => {
		execute({
			emailNotificationsEnabled: emailEnabled,
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Chat Notification Settings</DialogTitle>
					<DialogDescription>
						Manage how you receive notifications for chat messages.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* Email Notifications Toggle */}
					<div className="flex items-center justify-between space-x-4">
						<div className="flex-1 space-y-1">
							<Label htmlFor="email-notifications" className="font-medium">
								Email Notifications
							</Label>
							<p className="text-muted-foreground text-sm">
								Receive email notifications when you get new messages
							</p>
						</div>
						<Switch
							id="email-notifications"
							checked={emailEnabled}
							onCheckedChange={setEmailEnabled}
							disabled={isPending}
						/>
					</div>

					{/* Info message */}
					<div className="rounded-lg bg-muted p-3 text-sm">
						<p className="text-muted-foreground">
							{emailEnabled ? (
								<>
									You will receive email notifications for new messages. You can
									disable this anytime.
								</>
							) : (
								<>
									Email notifications are disabled. You&apos;ll only see
									messages when you check the app.
								</>
							)}
						</p>
					</div>
				</div>

				{/* Actions */}
				<div className="flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button type="button" onClick={handleSave} disabled={isPending}>
						{isPending ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
