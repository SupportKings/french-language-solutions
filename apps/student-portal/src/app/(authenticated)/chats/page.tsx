import { requireAuth } from "@/lib/auth";
import { ChatsPageClient } from "./page-client";
import { getEnrolledTeachers } from "@/features/chats/queries/getEnrolledTeachers";
import { getChatNotificationPreferences } from "@/features/chats/queries/getChatNotificationPreferences";

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
