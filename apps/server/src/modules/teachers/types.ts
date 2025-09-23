import type { Database } from "../../lib/database.types";

export type Teacher = Database["public"]["Tables"]["teachers"]["Row"];
export type WeeklySession =
	Database["public"]["Tables"]["weekly_sessions"]["Row"];
export type Cohort = Database["public"]["Tables"]["cohorts"]["Row"];
export type Student = Database["public"]["Tables"]["students"]["Row"];

export type ClassFormat = "online" | "in_person";
export type SessionStructure = "single" | "double";
export type DayOfWeek = Database["public"]["Enums"]["day_of_week"];

export interface GetAvailableTeachersRequest {
	format: ClassFormat;
	duration_minutes: number;
	day_of_week: string;
	student_id: string;
	session_structure: SessionStructure;
}

export interface TeacherWithWorkload extends Teacher {
	weekly_sessions: Array<{
		id: string;
		cohort_id: string;
		day_of_week: DayOfWeek;
		start_time: string;
		end_time: string;
		cohort: {
			id: string;
			cohort_status: Database["public"]["Enums"]["cohort_status"];
		};
	}>;
	current_weekly_hours: number;
	daily_hours: Record<DayOfWeek, number>;
}

export interface AvailableTeacher {
	id: string;
	first_name: string;
	last_name: string;
	google_calendar_id: string;
}
