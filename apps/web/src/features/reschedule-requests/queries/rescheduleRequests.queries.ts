import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { RescheduleRequest, RescheduleRequestQuery } from "../types";

const RESCHEDULE_REQUESTS_KEY = "reschedule-requests";

export const rescheduleRequestsKeys = {
	all: [RESCHEDULE_REQUESTS_KEY] as const,
	lists: () => [...rescheduleRequestsKeys.all, "list"] as const,
	list: (params: RescheduleRequestQuery) =>
		[...rescheduleRequestsKeys.lists(), params] as const,
};

async function fetchRescheduleRequests(query: RescheduleRequestQuery) {
	const params = new URLSearchParams();

	params.set("page", String(query.page || 1));
	params.set("limit", String(query.limit || 10));

	if (query.status) {
		params.set("status", query.status);
	}
	if (query.cohortId) {
		params.set("cohort_id", query.cohortId);
	}
	if (query.studentId) {
		params.set("student_id", query.studentId);
	}

	const response = await fetch(`/api/reschedule-requests?${params.toString()}`);

	if (!response.ok) {
		throw new Error("Failed to fetch reschedule requests");
	}

	return response.json();
}

export function useRescheduleRequests(query: RescheduleRequestQuery) {
	return useQuery({
		queryKey: rescheduleRequestsKeys.list(query),
		queryFn: async () => {
			const result = await fetchRescheduleRequests(query);

			return {
				data: result.data as RescheduleRequest[],
				count: result.count || 0,
				page: result.page,
				limit: result.limit,
				totalPages: result.totalPages,
			};
		},
	});
}

export function useInvalidateRescheduleRequests() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({
			queryKey: rescheduleRequestsKeys.all,
		});
	};
}
