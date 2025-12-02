// Server-only queries - DO NOT IMPORT IN CLIENT COMPONENTS

import { chatsKeys } from "./chats.queries";
import { getAccessibleCohorts } from "./getAccessibleCohorts";
import { getCohortMembers } from "./getCohortMembers";
import { getMessages } from "./getMessages";

// Server queries for prefetching only
export const chatsServerQueries = {
	cohorts: () => ({
		queryKey: chatsKeys.cohorts(),
		queryFn: () => getAccessibleCohorts(),
	}),
	messages: (cohortId: string) => ({
		queryKey: chatsKeys.messages(cohortId),
		queryFn: () => getMessages({ cohortId }),
	}),
	members: (cohortId: string) => ({
		queryKey: chatsKeys.members(cohortId),
		queryFn: () => getCohortMembers({ cohortId }),
	}),
};
