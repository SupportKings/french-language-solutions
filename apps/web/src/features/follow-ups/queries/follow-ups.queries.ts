import { useMutation, useQueryClient } from "@tanstack/react-query";
import { automatedFollowUpsApi } from "../api/follow-ups.api";
import type {
	CreateAutomatedFollowUpInput,
	UpdateAutomatedFollowUpInput,
} from "../types/follow-up.types";

// Re-export the automated follow-ups queries from the main module
export {
	automatedFollowUpsQueries,
	useAutomatedFollowUp,
	useAutomatedFollowUps,
	useDeleteAutomatedFollowUp,
} from "@/features/automated-follow-ups/queries/automated-follow-ups.queries";

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

// Additional mutations specific to follow-ups module
export function useCreateAutomatedFollowUp() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateAutomatedFollowUpInput) =>
			automatedFollowUpsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["automated-follow-ups", "list"],
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
				queryKey: ["automated-follow-ups", "list"],
			});
			queryClient.invalidateQueries({
				queryKey: ["automated-follow-ups", "detail", id],
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
				queryKey: ["automated-follow-ups", "list"],
			});
			queryClient.invalidateQueries({
				queryKey: ["automated-follow-ups", "detail", id],
			});
		},
	});
}
