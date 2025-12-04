import { redirect } from "next/navigation";

import { getAllUsers } from "@/features/chats/queries/getAllUsers";
import { getChatNotificationPreferences } from "@/features/chats/queries/getChatNotificationPreferences";

import { getUser } from "@/queries/getUser";

import { ChatsListPageClient } from "./page-client";

export default async function ChatsListPage() {
	const session = await getUser();

	if (!session) {
		redirect("/?error=unauthorized");
	}

	// Fetch all users for the new conversation dialog
	const users = await getAllUsers();

	// Fetch notification preferences
	const notificationPreferences = await getChatNotificationPreferences();

	return (
		<ChatsListPageClient
			currentUserId={session.user.id}
			users={users}
			initialNotificationPreferences={notificationPreferences}
		/>
	);
}
