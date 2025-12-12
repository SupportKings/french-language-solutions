"use server";

import { requireAuth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { createClient } from "@/lib/supabase/server";

import { z } from "zod";

const updateChatNotificationPreferencesSchema = z.object({
	emailNotificationsEnabled: z.boolean(),
});

/**
 * Update email notification preferences for the current user
 * Used by students to opt-in/out of email notifications for direct messages
 */
export const updateChatNotificationPreferences = actionClient
	.inputSchema(updateChatNotificationPreferencesSchema)
	.action(async ({ parsedInput: input }) => {
		const user = await requireAuth();
		const supabase = await createClient();

		console.log("🔵 Updating notification preferences:", {
			user_id: user.id,
			emailNotificationsEnabled: input.emailNotificationsEnabled,
		});

		const { error } = await supabase
			.from("chat_notification_preferences")
			.upsert(
				{
					user_id: user.id,
					email_notifications_enabled: input.emailNotificationsEnabled,
				},
				{
					onConflict: "user_id",
				},
			);

		if (error) {
			console.error("❌ Failed to update preferences:", error);
			throw new Error(
				`Failed to update notification preferences: ${error.message}`,
			);
		}

		console.log("✅ Notification preferences updated successfully");

		return {
			success: true,
			data: {
				emailNotificationsEnabled: input.emailNotificationsEnabled,
			},
		};
	});
