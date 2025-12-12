// Attendance record types
export type AttendanceStatus = "unset" | "attended" | "not_attended";

export interface AttendanceRecord {
	id: string;
	student_id: string;
	cohort_id: string;
	class_id?: string | null;
	attendance_date: string; // ISO date string (YYYY-MM-DD)
	status: AttendanceStatus;
	notes?: string | null;
	marked_by?: string | null;
	marked_at?: string | null; // ISO datetime string
	created_at: string;
	updated_at: string;
}

// For creating new attendance records
export interface CreateAttendanceRecord {
	student_id: string;
	cohort_id: string;
	class_id?: string | null;
	attendance_date: string;
	status?: AttendanceStatus;
	notes?: string | null;
}

// For updating attendance records
export interface UpdateAttendanceRecord {
	status?: AttendanceStatus;
	notes?: string | null;
	marked_by?: string;
	marked_at?: string;
}

// Attendance record with related data
export interface AttendanceRecordWithRelations extends AttendanceRecord {
	student?: {
		id: string;
		full_name: string;
		email?: string;
	};
	cohort?: {
		id: string;
		format: string;
		starting_level: string;
		current_level?: string;
	};
	class?: {
		id: string;
		date: string;
		start_time: string;
		end_time: string;
	} | null;
	marked_by_user?: {
		id: string;
		name: string;
		email: string;
	} | null;
}

// For bulk attendance operations
export interface BulkAttendanceUpdate {
	cohort_id: string;
	attendance_date: string;
	records: {
		student_id: string;
		status: AttendanceStatus;
		notes?: string | null;
	}[];
}

// Attendance statistics
export interface AttendanceStats {
	student_id: string;
	cohort_id: string;
	total_classes: number;
	attended: number;
	not_attended: number;
	unset: number;
	attendance_rate: number; // Percentage (0-100)
}

// For attendance reports
export interface AttendanceReport {
	cohort_id: string;
	date_range: {
		start_date: string;
		end_date: string;
	};
	students: {
		student_id: string;
		student_name: string;
		attendance_records: {
			date: string;
			status: AttendanceStatus;
			notes?: string;
		}[];
		stats: AttendanceStats;
	}[];
}

// Helper type for UI components
export interface AttendanceGridData {
	cohort_id: string;
	dates: string[]; // Array of dates for the period
	students: {
		id: string;
		name: string;
		email?: string;
		attendance: {
			[date: string]: {
				status: AttendanceStatus;
				notes?: string;
				record_id?: string;
			};
		};
	}[];
}
