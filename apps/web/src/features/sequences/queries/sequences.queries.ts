import {
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { CreateSequence, SequenceQuery } from "../schemas/sequence.schema";

export const sequencesQueries = {
	all: () => ["sequences"] as const,
	lists: () => [...sequencesQueries.all(), "list"] as const,
	list: (query: SequenceQuery) =>
		queryOptions({
			queryKey: [...sequencesQueries.lists(), query] as const,
			queryFn: async () => {
				const params = new URLSearchParams({
					page: query.page.toString(),
					limit: query.limit.toString(),
					...(query.search && { search: query.search }),
				});

				const response = await fetch(`/api/sequences?${params}`);
				if (!response.ok) throw new Error("Failed to fetch sequences");
				return response.json();
			},
		}),
	detail: (id: string) =>
		queryOptions({
			queryKey: [...sequencesQueries.all(), "detail", id] as const,
			queryFn: async () => {
				const response = await fetch(`/api/sequences/${id}`);
				if (!response.ok) throw new Error("Failed to fetch sequence");
				return response.json();
			},
		}),
};

export function useSequences(query: SequenceQuery) {
	return useQuery(sequencesQueries.list(query));
}

export function useSequence(id: string) {
	return useQuery(sequencesQueries.detail(id));
}

export function useCreateSequence() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateSequence) => {
			const response = await fetch("/api/sequences", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
			if (!response.ok) throw new Error("Failed to create sequence");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: sequencesQueries.lists() });
		},
	});
}

export function useDeleteSequence() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/sequences/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Failed to delete sequence");
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: sequencesQueries.lists() });
		},
	});
}
