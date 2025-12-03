export type RescheduleRequestStatus =
	| "pending"
	| "approved"
	| "rejected"
	| "cancelled";

export interface RescheduleRequest {
	id: string;
	student_id: string;
	cohort_id: string;
	original_class_date: string;
	proposed_datetime: string;
	reason: string | null;
	status: RescheduleRequestStatus;
	teacher_notes: string | null;
	created_at: string | null;
	updated_at: string | null;
	student: {
		id: string;
		full_name: string | null;
		first_name: string | null;
		email: string | null;
	};
	cohort: {
		id: string;
		nickname: string | null;
		product: {
			display_name: string;
		} | null;
	};
}

export interface RescheduleRequestQuery {
	status?: RescheduleRequestStatus;
	cohortId?: string;
	page?: number;
	limit?: number;
}
