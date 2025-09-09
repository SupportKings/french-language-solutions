import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	automatedFollowUpsApi,
	type AutomatedFollowUpQuery,
} from "../api/follow-ups.api";
import type {
	CreateAutomatedFollowUpInput,
	UpdateAutomatedFollowUpInput,
} from "../types/follow-up.types";

// Helper queries for fetching students and sequences
export const studentsQuery = {
	all: () =>
		({
			queryKey: ["students", "all"],
			queryFn: async () => {
				const response = await fetch("/api/students?limit=100");
				if (!response.ok) throw new Error("Failed to fetch students");
				return response.json();
			},
		}) as const,
};

export const sequencesQuery = {
	all: () =>
		({
			queryKey: ["sequences", "all"],
			queryFn: async () => {
				const response = await fetch("/api/sequences?limit=100");
				if (!response.ok) throw new Error("Failed to fetch sequences");
				return response.json();
			},
		}) as const,
};

// Query keys factory
export const automatedFollowUpsKeys = {
	all: ["automated-follow-ups"] as const,
	lists: () => [...automatedFollowUpsKeys.all, "list"] as const,
	list: (params: AutomatedFollowUpQuery) =>
		[...automatedFollowUpsKeys.lists(), params] as const,
	details: () => [...automatedFollowUpsKeys.all, "detail"] as const,
	detail: (id: string) => [...automatedFollowUpsKeys.details(), id] as const,
};

// Queries
export function useAutomatedFollowUps(params: AutomatedFollowUpQuery) {
	return useQuery({
		queryKey: automatedFollowUpsKeys.list(params),
		queryFn: () => automatedFollowUpsApi.list(params),
	});
}

export function useAutomatedFollowUp(id: string) {
	return useQuery({
		queryKey: automatedFollowUpsKeys.detail(id),
		queryFn: () => automatedFollowUpsApi.getById(id),
		enabled: !!id,
	});
}

// Mutations
export function useCreateAutomatedFollowUp() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateAutomatedFollowUpInput) =>
			automatedFollowUpsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: automatedFollowUpsKeys.lists(),
			});
		},
	});
}

export function useUpdateAutomatedFollowUp() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: UpdateAutomatedFollowUpInput;
		}) => automatedFollowUpsApi.update(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({
				queryKey: automatedFollowUpsKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: automatedFollowUpsKeys.detail(id),
			});
		},
	});
}

export function useDeleteAutomatedFollowUp() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => automatedFollowUpsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: automatedFollowUpsKeys.lists(),
			});
		},
	});
}

export function useStopAutomatedFollowUp() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => automatedFollowUpsApi.stop(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({
				queryKey: automatedFollowUpsKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: automatedFollowUpsKeys.detail(id),
			});
		},
	});
}