import type { Database } from "../../lib/database.types";

export type Cohort = Database["public"]["Tables"]["cohorts"]["Row"];
export type WeeklySession =
	Database["public"]["Tables"]["weekly_sessions"]["Row"];
export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
export type Student = Database["public"]["Tables"]["students"]["Row"];
export type Teacher = Database["public"]["Tables"]["teachers"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type DayOfWeek = Database["public"]["Enums"]["day_of_week"];

export interface FinalizeSetupRequest {
	cohort_id: string;
}

export interface WeeklySessionForCalendar {
	first_event_start_time: string; // ISO datetime string
	first_event_end_time: string; // ISO datetime string
	day_of_week_abbreviation: string; // MO, TU, WE, TH, FR, SA, SU
	teacher_name: string;
	event_summary: string; // Individual summary for this session
}

export interface MakeWebhookPayload {
	cohort_id: string;
	event_summary: string;
	location: string;
	sessions: string; // JSON string of WeeklySessionForCalendar[]
	attendees: string; // JSON string of email array
}

export interface CohortWithDetails extends Cohort {
	product: Product;
	weekly_sessions: Array<
		WeeklySession & {
			teacher: Teacher;
		}
	>;
	enrollments: Array<
		Enrollment & {
			student: Student;
		}
	>;
}
