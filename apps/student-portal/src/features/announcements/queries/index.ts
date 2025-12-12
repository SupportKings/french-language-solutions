import { queryOptions, useQuery } from "@tanstack/react-query";
import {
	getStudentAnnouncements,
	type StudentAnnouncement,
} from "./getStudentAnnouncements";
import { getLatestAnnouncements } from "./getLatestAnnouncements";
import { getUnreadAnnouncements } from "./getUnreadAnnouncements";

export const announcementKeys = {
	all: ["student-announcements"] as const,
	byStudent: (studentId: string) =>
		[...announcementKeys.all, studentId] as const,
	latest: (studentId: string) =>
		[...announcementKeys.all, "latest", studentId] as const,
	unread: (studentId: string) =>
		[...announcementKeys.all, "unread", studentId] as const,
	detail: (id: string) => [...announcementKeys.all, "detail", id] as const,
};

export const announcementQueries = {
	studentAnnouncements: (studentId: string) =>
		queryOptions({
			queryKey: announcementKeys.byStudent(studentId),
			queryFn: () => getStudentAnnouncements(studentId),
		}),
	latestAnnouncements: (studentId: string, limit = 5) =>
		queryOptions({
			queryKey: [...announcementKeys.latest(studentId), limit],
			queryFn: () => getLatestAnnouncements(studentId, limit),
		}),
	unreadAnnouncements: (studentId: string) =>
		queryOptions({
			queryKey: announcementKeys.unread(studentId),
			queryFn: () => getUnreadAnnouncements(studentId),
		}),
};

export function useStudentAnnouncements(studentId: string) {
	return useQuery(announcementQueries.studentAnnouncements(studentId));
}

export function useLatestAnnouncements(studentId: string, limit = 5) {
	return useQuery(announcementQueries.latestAnnouncements(studentId, limit));
}

export function useUnreadAnnouncements(studentId: string) {
	return useQuery(announcementQueries.unreadAnnouncements(studentId));
}

export type { StudentAnnouncement };
