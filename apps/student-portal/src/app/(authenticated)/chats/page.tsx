import { requireAuth } from "@/lib/auth";

import { getChatNotificationPreferences } from "@/features/chats/queries/getChatNotificationPreferences";
import { getEnrolledTeachers } from "@/features/chats/queries/getEnrolledTeachers";

import { ChatsPageClient } from "./page-client";

export default async function ChatsPage() {
	const user = await requireAuth();

	// Fetch initial data for the page
	const [teachers, notificationPreferences] = await Promise.all([
		getEnrolledTeachers(),
		getChatNotificationPreferences(),
	]);

	return (
		<ChatsPageClient
			currentUserId={user.id}
			teachers={teachers}
			initialNotificationPreferences={notificationPreferences}
		/>
	);
}
