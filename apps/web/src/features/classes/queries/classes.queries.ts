import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classesApi } from "../api/classes.api";
import type { Class, ClassFormValues, ClassFilters } from "../schemas/class.schema";
import { toast } from "sonner";

// Query keys factory
export const classesKeys = {
	all: ["classes"] as const,
	lists: () => [...classesKeys.all, "list"] as const,
	list: (filters?: ClassFilters) => [...classesKeys.lists(), filters] as const,
	details: () => [...classesKeys.all, "detail"] as const,
	detail: (id: string) => [...classesKeys.details(), id] as const,
};

// Query functions for server-side prefetching
export const classesQueries = {
	list: (filters?: ClassFilters) => ({
		queryKey: classesKeys.list(filters),
		queryFn: () => classesApi.getClasses(filters),
	}),
	detail: (id: string) => ({
		queryKey: classesKeys.detail(id),
		queryFn: () => classesApi.getClass(id),
	}),
};

// Client-side hooks
export function useClasses(filters?: ClassFilters) {
	return useQuery({
		queryKey: classesKeys.list(filters),
		queryFn: () => classesApi.getClasses(filters),
	});
}

export function useClass(id: string) {
	return useQuery({
		queryKey: classesKeys.detail(id),
		queryFn: () => classesApi.getClass(id),
		enabled: !!id,
	});
}

export function useCreateClass() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ClassFormValues) => classesApi.createClass(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: classesKeys.lists() });
			toast.success("Class created successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create class");
		},
	});
}

export function useUpdateClass() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<ClassFormValues> }) =>
			classesApi.updateClass(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: classesKeys.lists() });
			queryClient.invalidateQueries({ queryKey: classesKeys.detail(id) });
			toast.success("Class updated successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update class");
		},
	});
}

export function useDeleteClass() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => classesApi.deleteClass(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: classesKeys.lists() });
			toast.success("Class deleted successfully");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete class");
		},
	});
}