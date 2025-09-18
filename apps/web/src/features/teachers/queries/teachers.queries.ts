import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	Teacher,
	TeacherFormData,
	TeacherQuery,
} from "../schemas/teacher.schema";

const TEACHER_QUERY_KEY = "teachers";

// Query keys factory
export const teachersKeys = {
	all: [TEACHER_QUERY_KEY] as const,
	lists: () => [...teachersKeys.all, "list"] as const,
	list: (params: TeacherQuery) => [...teachersKeys.lists(), params] as const,
	details: () => [...teachersKeys.all, "detail"] as const,
	detail: (id: string) => [...teachersKeys.details(), id] as const,
};

// Server queries for prefetching
export const teachersQueries = {
	list: (params: Partial<TeacherQuery> = {}) => {
		const defaultParams: TeacherQuery = {
			page: 1,
			limit: 100, // Get all teachers for filter dropdown
			sortBy: "first_name",
			sortOrder: "asc",
			...params,
		};

		return {
			queryKey: teachersKeys.list(defaultParams),
			queryFn: async () => {
				const searchParams = new URLSearchParams();
				Object.entries(defaultParams).forEach(([key, value]) => {
					if (value !== undefined && value !== null && value !== "") {
						if (Array.isArray(value)) {
							value.forEach((v) => searchParams.append(key, String(v)));
						} else {
							searchParams.append(key, String(value));
						}
					}
				});

				const response = await fetch(`/api/teachers?${searchParams}`);
				if (!response.ok) {
					throw new Error("Failed to fetch teachers");
				}
				return response.json();
			},
		};
	},
};

// Fetch teachers list
export function useTeachers(query: TeacherQuery) {
	return useQuery({
		queryKey: [TEACHER_QUERY_KEY, query],
		queryFn: async () => {
			const params = new URLSearchParams();
			Object.entries(query).forEach(([key, value]) => {
				if (value !== undefined && value !== null && value !== "") {
					// Handle arrays for multi-select filters
					if (Array.isArray(value)) {
						value.forEach((v) => params.append(key, String(v)));
					} else {
						params.append(key, String(value));
					}
				}
			});

			const response = await fetch(`/api/teachers?${params}`);
			if (!response.ok) {
				throw new Error("Failed to fetch teachers");
			}
			return response.json();
		},
	});
}

// Fetch single teacher
export function useTeacher(id: string) {
	return useQuery({
		queryKey: [TEACHER_QUERY_KEY, id],
		queryFn: async () => {
			const response = await fetch(`/api/teachers/${id}`);
			if (!response.ok) {
				throw new Error("Failed to fetch teacher");
			}
			return response.json();
		},
		enabled: !!id,
	});
}

// Create teacher
export function useCreateTeacher() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: TeacherFormData) => {
			const response = await fetch("/api/teachers", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to create teacher");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [TEACHER_QUERY_KEY] });
		},
	});
}

// Update teacher
export function useUpdateTeacher() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: string; data: TeacherFormData }) => {
			const response = await fetch(`/api/teachers/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to update teacher");
			}

			return response.json();
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: [TEACHER_QUERY_KEY] });
			queryClient.invalidateQueries({
				queryKey: [TEACHER_QUERY_KEY, variables.id],
			});
		},
	});
}

// Delete teacher
export function useDeleteTeacher() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const response = await fetch(`/api/teachers/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete teacher");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [TEACHER_QUERY_KEY] });
		},
	});
}
