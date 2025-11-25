import { queryOptions, useQuery } from "@tanstack/react-query";
import {
	getStudentAnnouncements,
	type StudentAnnouncement,
} from "./getStudentAnnouncements";

export const announcementKeys = {
	all: ["student-announcements"] as const,
	byStudent: (studentId: string) =>
		[...announcementKeys.all, studentId] as const,
	detail: (id: string) => [...announcementKeys.all, "detail", id] as const,
};

export const announcementQueries = {
	studentAnnouncements: (studentId: string) =>
		queryOptions({
			queryKey: announcementKeys.byStudent(studentId),
			queryFn: () => getStudentAnnouncements(studentId),
		}),
};

export function useStudentAnnouncements(studentId: string) {
	return useQuery(announcementQueries.studentAnnouncements(studentId));
}

export type { StudentAnnouncement };
