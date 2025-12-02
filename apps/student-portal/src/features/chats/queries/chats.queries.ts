// Query keys factory - safe to use in client and server components
export const chatsKeys = {
	all: ["chats"] as const,
	cohorts: () => [...chatsKeys.all, "cohorts"] as const,
	cohortsInfinite: (searchQuery?: string) =>
		[...chatsKeys.cohorts(), "infinite", searchQuery] as const,
	messages: (cohortId: string) =>
		[...chatsKeys.all, "messages", cohortId] as const,
	members: (cohortId: string) =>
		[...chatsKeys.all, "members", cohortId] as const,
	// Direct messages / private chat keys
	conversations: () => [...chatsKeys.all, "conversations"] as const,
	conversationsInfinite: () =>
		[...chatsKeys.conversations(), "infinite"] as const,
	directMessages: (conversationId: string) =>
		[...chatsKeys.all, "direct-messages", conversationId] as const,
	conversationParticipants: (conversationId: string) =>
		[...chatsKeys.all, "conversation-participants", conversationId] as const,
	notificationPreferences: () =>
		[...chatsKeys.all, "notification-preferences"] as const,
	users: () => [...chatsKeys.all, "users"] as const,
};

// Client-side query configurations using server actions
import { fetchCohortMembers } from "../actions/fetchCohortMembers";
import { fetchConversationParticipants } from "../actions/fetchConversationParticipants";

export const chatsQueries = {
	members: (cohortId: string) => ({
		queryKey: chatsKeys.members(cohortId),
		queryFn: async () => {
			const result = await fetchCohortMembers(cohortId);
			if (!result.success) {
				throw new Error(result.error);
			}
			return result.data;
		},
	}),
	conversationParticipants: (conversationId: string) => ({
		queryKey: chatsKeys.conversationParticipants(conversationId),
		queryFn: async () => {
			const result = await fetchConversationParticipants(conversationId);
			if (!result.success) {
				throw new Error(result.error);
			}
			return result.data;
		},
	}),
};
