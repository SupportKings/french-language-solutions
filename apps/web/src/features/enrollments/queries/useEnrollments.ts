"use client";

import { useQuery } from "@tanstack/react-query";

export const enrollmentQueries = {
	detail: (id: string) => ({
		queryKey: ["enrollments", "detail", id],
		queryFn: async ({ signal }: { signal: AbortSignal }) => {
			const response = await fetch(`/api/enrollments/${id}`, {
				signal,
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const error = await response.json().catch(() => ({}));
				throw new Error(
					error.error || `Failed to fetch enrollment: ${response.status}`,
				);
			}

			return response.json();
		},
	}),
};

export function useEnrollment(enrollmentId: string) {
	return useQuery(enrollmentQueries.detail(enrollmentId));
}
