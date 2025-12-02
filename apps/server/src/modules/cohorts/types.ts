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
	session_id: string; // Supabase ID of the weekly session
	first_event_start_time: string; // ISO datetime string
	first_event_end_time: string; // ISO datetime string
	day_of_week_abbreviation: string; // MO, TU, WE, TH, FR, SA, SU
	teacher_name: string;
	teacher_calendar_id: string | null; // Google Calendar ID for the teacher
	event_summary: string; // Individual summary for this session
}

export interface MakeWebhookPayload {
	cohort_id: string;
	event_summary: string;
	location: string;
	sessions: WeeklySessionForCalendar[]; // Array of session objects
	attendees: string[]; // Array of email strings
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

/**
 * Calendar event from external system (Google Calendar, Make.com)
 */
export interface CalendarEventPayload {
	event_id: string; // Google Calendar event ID (may include recurrence suffix)
	start: string; // ISO datetime (UTC)
	end: string; // ISO datetime (UTC)
}

/**
 * Weekly session data needed for class creation
 */
export interface WeeklySessionData {
	id: string;
	cohort_id: string;
	teacher_id: string | null;
	google_calendar_event_id: string | null;
	calendar_event_url: string | null;
}

/**
 * Calendar event matched with its weekly session
 */
export interface MatchedCalendarEvent {
	event: CalendarEventPayload;
	session: WeeklySessionData;
}
