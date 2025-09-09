import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { AutomatedFollowUpQuery } from "../schemas/automated-follow-up.schema";

export const automatedFollowUpsQueries = {
	all: () => ["automated-follow-ups"] as const,
	lists: () => [...automatedFollowUpsQueries.all(), "list"] as const,
	list: (query: AutomatedFollowUpQuery) =>
		queryOptions({
			queryKey: [...automatedFollowUpsQueries.lists(), query] as const,
			queryFn: async () => {
				const params = new URLSearchParams({
					page: query.page.toString(),
					limit: query.limit.toString(),
					...(query.search && { search: query.search }),
				});

				// Add array filters
				if (query.status) {
					query.status.forEach((v) => params.append("status", v));
				}
				if (query.sequence_id) {
					query.sequence_id.forEach((v) => params.append("sequence_id", v));
				}

				const response = await fetch(`/api/automated-follow-ups?${params}`);
				if (!response.ok)
					throw new Error("Failed to fetch automated follow-ups");
				return response.json();
			},
		}),
	detail: (id: string) =>
		queryOptions({
			queryKey: [...automatedFollowUpsQueries.all(), "detail", id] as const,
			queryFn: async () => {
				const response = await fetch(`/api/automated-follow-ups/${id}`);
				if (!response.ok)
					throw new Error("Failed to fetch automated follow-up");
				return response.json();
			},
		}),
};

export function useAutomatedFollowUps(query: AutomatedFollowUpQuery) {
	return useQuery(automatedFollowUpsQueries.list(query));
}

export function useAutomatedFollowUp(id: string) {
	return useQuery(automatedFollowUpsQueries.detail(id));
}

export function useDeleteAutomatedFollowUp() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/automated-follow-ups/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Failed to delete automated follow-up");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: automatedFollowUpsQueries.lists(),
			});
		},
	});
}
