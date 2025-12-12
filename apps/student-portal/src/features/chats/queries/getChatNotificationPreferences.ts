import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import type { ChatNotificationPreferences } from "../types";

/**
 * Get email notification preferences for the current user
 * Returns default (false) if no preferences exist
 */
export async function getChatNotificationPreferences(): Promise<ChatNotificationPreferences> {
	const user = await requireAuth();
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("chat_notification_preferences")
		.select("email_notifications_enabled")
		.eq("user_id", user.id)
		.maybeSingle();

	if (error && error.code !== "PGRST116") {
		// PGRST116 is "no rows returned", which is OK
		throw new Error(
			`Failed to fetch notification preferences: ${error.message}`,
		);
	}

	return {
		emailNotificationsEnabled: data?.email_notifications_enabled ?? false,
	};
}
