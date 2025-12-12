// Shared types for student portal

export interface Teacher {
	id: string;
	name: string;
	avatar?: string;
}

export interface AttendanceRecord {
	id: string;
	status: string;
	homeworkCompleted: boolean | null;
	homeworkCompletedAt: string | null;
	notes: string | null;
}

export interface ClassSession {
	id: string;
	cohortId: string;
	format: "group" | "private" | "hybrid";
	level: string;
	startTime: string;
	endTime: string;
	teacher: Teacher;
	meetingLink?: string;
	hangoutLink?: string;
	status: "scheduled" | "in_progress" | "completed" | "cancelled";
	notes?: string;
	location?: "online" | "in_person";
	attendanceRecord?: AttendanceRecord;
}

export interface Announcement {
	id: string;
	title: string;
	content: string;
	author: {
		id: string;
		name: string;
		role: "admin" | "teacher";
		avatar?: string;
	};
	scope: "school_wide" | "cohort";
	cohortId?: string;
	cohortName?: string;
	isPinned: boolean;
	isRead: boolean;
	createdAt: string;
	attachments?: {
		id: string;
		name: string;
		url: string;
		type: "image" | "video" | "document";
	}[];
}

export interface StudentStats {
	attendanceRate: number;
	completionRate: number;
	currentLevel: string;
	totalClasses: number;
	completedClasses: number;
	upcomingClasses: number;
}

export interface WorkplanItem {
	id: string;
	type: "class" | "assignment" | "evaluation";
	title: string;
	subtitle?: string;
	dueDate: string;
	cohortName?: string;
	isCompleted: boolean;
}
