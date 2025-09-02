"use client";

import { useQuery } from "@tanstack/react-query";
import { getEnrollment } from "../actions/getEnrollment";

export const enrollmentQueries = {
	detail: (id: string) => ({
		queryKey: ["enrollments", "detail", id],
		queryFn: () => getEnrollment(id),
	}),
};

export function useEnrollment(enrollmentId: string) {
	return useQuery(enrollmentQueries.detail(enrollmentId));
}