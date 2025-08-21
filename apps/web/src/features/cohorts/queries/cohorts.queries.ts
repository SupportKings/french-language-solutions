import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cohortsApi } from "../api/cohorts.api";
import type { CohortQuery, CreateCohort, UpdateCohort } from "../schemas/cohort.schema";

// Query keys factory
export const cohortsKeys = {
	all: ["cohorts"] as const,
	lists: () => [...cohortsKeys.all, "list"] as const,
	list: (params: CohortQuery) => [...cohortsKeys.lists(), params] as const,
	details: () => [...cohortsKeys.all, "detail"] as const,
	detail: (id: string) => [...cohortsKeys.details(), id] as const,
	withSessions: (id: string) => [...cohortsKeys.detail(id), "sessions"] as const,
};

// Server queries for prefetching
export const cohortsQueries = {
	list: (params: CohortQuery) => ({
		queryKey: cohortsKeys.list(params),
		queryFn: () => cohortsApi.list(params),
	}),
	detail: (id: string) => ({
		queryKey: cohortsKeys.detail(id),
		queryFn: () => cohortsApi.getById(id),
	}),
	withSessions: (id: string) => ({
		queryKey: cohortsKeys.withSessions(id),
		queryFn: () => cohortsApi.getWithSessions(id),
	}),
};

// Client hooks
export function useCohorts(params: CohortQuery) {
	console.log("🎣 useCohorts hook called with params:", params);
	console.log("🔑 Query key:", cohortsKeys.list(params));
	
	return useQuery({
		queryKey: cohortsKeys.list(params),
		queryFn: () => {
			console.log("⚡ Query function executing...");
			return cohortsApi.list(params);
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

export function useCohort(id: string) {
	return useQuery({
		queryKey: cohortsKeys.detail(id),
		queryFn: () => cohortsApi.getById(id),
		enabled: !!id,
	});
}

export function useCohortWithSessions(id: string) {
	return useQuery({
		queryKey: cohortsKeys.withSessions(id),
		queryFn: () => cohortsApi.getWithSessions(id),
		enabled: !!id,
	});
}

// Mutations
export function useCreateCohort() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCohort) => cohortsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: cohortsKeys.lists() });
		},
	});
}

export function useUpdateCohort() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateCohort }) =>
			cohortsApi.update(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: cohortsKeys.lists() });
			queryClient.invalidateQueries({ queryKey: cohortsKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: cohortsKeys.withSessions(id) });
		},
	});
}

export function useDeleteCohort() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => cohortsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: cohortsKeys.lists() });
		},
	});
}