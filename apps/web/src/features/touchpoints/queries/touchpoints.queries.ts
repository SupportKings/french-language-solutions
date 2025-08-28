import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { TouchpointQuery } from "../schemas/touchpoint.schema";

export const touchpointsQueries = {
	all: () => ["touchpoints"] as const,
	lists: () => [...touchpointsQueries.all(), "list"] as const,
	list: (query: TouchpointQuery) =>
		queryOptions({
			queryKey: [...touchpointsQueries.lists(), query] as const,
			queryFn: async () => {
				const params = new URLSearchParams({
					page: query.page.toString(),
					limit: query.limit.toString(),
					...(query.search && { search: query.search }),
				});

				// Add array filters
				if (query.channel) {
					query.channel.forEach((v) => params.append("channel", v));
				}
				if (query.type) {
					query.type.forEach((v) => params.append("type", v));
				}
				if (query.source) {
					query.source.forEach((v) => params.append("source", v));
				}

				const response = await fetch(`/api/touchpoints?${params}`);
				if (!response.ok) throw new Error("Failed to fetch touchpoints");
				return response.json();
			},
		}),
	detail: (id: string) =>
		queryOptions({
			queryKey: [...touchpointsQueries.all(), "detail", id] as const,
			queryFn: async () => {
				const response = await fetch(`/api/touchpoints/${id}`);
				if (!response.ok) throw new Error("Failed to fetch touchpoint");
				return response.json();
			},
		}),
};

export function useTouchpoints(query: TouchpointQuery) {
	return useQuery(touchpointsQueries.list(query));
}

export function useTouchpoint(id: string) {
	return useQuery(touchpointsQueries.detail(id));
}

export function useDeleteTouchpoint() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/touchpoints/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Failed to delete touchpoint");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: touchpointsQueries.lists() });
		},
	});
}
