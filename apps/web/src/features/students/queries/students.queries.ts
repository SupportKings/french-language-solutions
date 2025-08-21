import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentsApi } from "../api/students.api";
import type { StudentQuery, CreateStudent, UpdateStudent } from "../schemas/student.schema";

// Query keys factory
export const studentsKeys = {
	all: ["students"] as const,
	lists: () => [...studentsKeys.all, "list"] as const,
	list: (params: StudentQuery) => [...studentsKeys.lists(), params] as const,
	details: () => [...studentsKeys.all, "detail"] as const,
	detail: (id: string) => [...studentsKeys.details(), id] as const,
};

// Queries
export function useStudents(params: StudentQuery) {
	return useQuery({
		queryKey: studentsKeys.list(params),
		queryFn: () => studentsApi.list(params),
	});
}

export function useStudent(id: string) {
	return useQuery({
		queryKey: studentsKeys.detail(id),
		queryFn: () => studentsApi.getById(id),
		enabled: !!id,
	});
}

// Mutations
export function useCreateStudent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateStudent) => studentsApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: studentsKeys.lists() });
		},
	});
}

export function useUpdateStudent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateStudent }) =>
			studentsApi.update(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: studentsKeys.lists() });
			queryClient.invalidateQueries({ queryKey: studentsKeys.detail(id) });
		},
	});
}

export function useDeleteStudent() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => studentsApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: studentsKeys.lists() });
		},
	});
}