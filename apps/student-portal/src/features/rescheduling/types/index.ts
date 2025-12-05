export type RescheduleRequestStatus =
	| "pending"
	| "approved"
	| "rejected"
	| "cancelled";

export interface RescheduleRequest {
	id: string;
	studentId: string;
	cohortId: string;
	originalClassDate: string;
	proposedDatetime: string;
	reason: string | null;
	status: RescheduleRequestStatus;
	adminNotes: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface FutureClass {
	date: Date;
	startTime: string; // HH:mm format
	endTime: string; // HH:mm format
	dayOfWeek: string;
	teacher: {
		id: string;
		name: string;
	} | null;
	weeklySessionId: string;
	cohortId: string;
}

export interface PrivateEnrollment {
	enrollmentId: string;
	cohortId: string;
	cohortNickname: string | null;
	cohortStartDate: string | null;
	productFormat: string;
	weeklySessions: WeeklySession[];
	teacher: {
		id: string;
		name: string;
	} | null;
}

export interface WeeklySession {
	id: string;
	dayOfWeek: string;
	startTime: string;
	endTime: string;
	teacherId: string | null;
	teacherName: string | null;
}
