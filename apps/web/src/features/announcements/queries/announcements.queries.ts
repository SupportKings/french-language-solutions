import { queryOptions } from "@tanstack/react-query";
import type {
	AnnouncementFilters,
	AnnouncementWithDetails,
} from "./getAnnouncements";
import type { StudentReadStatus } from "./getReadStatsList";

// API functions for client-side use
async function fetchAnnouncements(
	filters?: AnnouncementFilters,
): Promise<AnnouncementWithDetails[]> {
	const params = new URLSearchParams();

	if (filters?.scope) {
		params.append("scope", filters.scope);
	}
	if (filters?.cohortId) {
		params.append("cohortId", filters.cohortId);
	}
	if (filters?.authorId) {
		params.append("authorId", filters.authorId);
	}
	if (filters?.isPinned !== undefined) {
		params.append("isPinned", String(filters.isPinned));
	}

	const url = `/api/announcements?${params.toString()}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error("Failed to fetch announcements");
	}

	return response.json();
}

async function fetchReadStats(id: string): Promise<StudentReadStatus[]> {
	const response = await fetch(`/api/announcements/${id}/read-stats`);

	if (!response.ok) {
		throw new Error("Failed to fetch read stats");
	}

	return response.json();
}

// Query keys factory
export const announcementsKeys = {
	all: ["announcements"] as const,
	lists: () => [...announcementsKeys.all, "list"] as const,
	list: (filters?: AnnouncementFilters) =>
		[...announcementsKeys.lists(), filters] as const,
	details: () => [...announcementsKeys.all, "detail"] as const,
	detail: (id: string) => [...announcementsKeys.details(), id] as const,
	readStats: (id: string) =>
		[...announcementsKeys.detail(id), "readStats"] as const,
};

// Query options for use in both server and client components
export const announcementsQueries = {
	list: (filters?: AnnouncementFilters) =>
		queryOptions({
			queryKey: announcementsKeys.list(filters),
			queryFn: () => fetchAnnouncements(filters),
		}),
	readStats: (id: string) =>
		queryOptions({
			queryKey: announcementsKeys.readStats(id),
			queryFn: () => fetchReadStats(id),
		}),
};
