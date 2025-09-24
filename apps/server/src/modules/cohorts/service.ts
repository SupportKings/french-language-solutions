import { addDays } from "date-fns";
import { supabase } from "../../lib/supabase";
import { triggerWebhook } from "../../lib/webhooks";
import type {
	CohortWithDetails,
	MakeWebhookPayload,
	WeeklySessionForCalendar,
} from "./types";

export class CohortService {
	/**
	 * Maps day_of_week to Google Calendar RRULE format abbreviations
	 */
	private getDayAbbreviation(day: string): string {
		const dayMap: Record<string, string> = {
			monday: "MO",
			tuesday: "TU",
			wednesday: "WE",
			thursday: "TH",
			friday: "FR",
			saturday: "SA",
			sunday: "SU",
		};
		return dayMap[day.toLowerCase()] || "";
	}

	/**
	 * Gets the next occurrence of a specific weekday from a given date
	 */
	private getNextWeekday(startDate: Date, targetDay: string): Date {
		const dayMap: Record<string, number> = {
			sunday: 0,
			monday: 1,
			tuesday: 2,
			wednesday: 3,
			thursday: 4,
			friday: 5,
			saturday: 6,
		};

		const targetDayNumber = dayMap[targetDay.toLowerCase()];
		const startDayNumber = startDate.getDay();

		if (targetDayNumber === undefined) {
			throw new Error(`Invalid day: ${targetDay}`);
		}

		// If the target day is today or in the future this week
		if (targetDayNumber >= startDayNumber) {
			return addDays(startDate, targetDayNumber - startDayNumber);
		}
		// If the target day is in the next week
		return addDays(startDate, 7 - startDayNumber + targetDayNumber);
	}

	/**
	 * Fetches cohort with all related data needed for calendar setup
	 */
	async getCohortWithDetails(
		cohortId: string,
	): Promise<CohortWithDetails | null> {
		const { data: cohort, error } = await supabase
			.from("cohorts")
			.select(`
				*,
				product:products!cohorts_product_id_fkey(*),
				weekly_sessions!weekly_sessions_cohort_id_fkey(
					*,
					teacher:teachers!weekly_sessions_teacher_id_fkey(*)
				),
				enrollments!enrollments_cohort_id_fkey(
					*,
					student:students!enrollments_student_id_fkey(*)
				)
			`)
			.eq("id", cohortId)
			.single();

		if (error || !cohort) {
			console.error("Error fetching cohort:", error);
			return null;
		}

		return cohort as unknown as CohortWithDetails;
	}

	/**
	 * Prepares webhook payload for Make.com to create Google Calendar events
	 */
	async prepareMakeWebhookPayload(
		cohort: CohortWithDetails,
	): Promise<MakeWebhookPayload> {
		if (!cohort.start_date) {
			throw new Error("Cohort start date is required to finalize setup");
		}

		const startDate = new Date(cohort.start_date);

		// Get product info for event summary
		const productName = cohort.product.display_name;
		const location =
			cohort.product.location === "online" ? "Online" : "In-Person";

		// Prepare sessions array for Google Calendar
		const sessions: WeeklySessionForCalendar[] = cohort.weekly_sessions.map(
			(session) => {
				// Get the first occurrence of this weekday on or after the cohort start date
				const firstEventDate = this.getNextWeekday(
					startDate,
					session.day_of_week,
				);

				// Parse the time strings (assuming format is "HH:mm:ss")
				const [startHour, startMinute] = session.start_time
					.split(":")
					.map(Number);
				const [endHour, endMinute] = session.end_time.split(":").map(Number);

				// Create full datetime for first event
				const firstEventStart = new Date(firstEventDate);
				firstEventStart.setHours(startHour, startMinute, 0, 0);

				const firstEventEnd = new Date(firstEventDate);
				firstEventEnd.setHours(endHour, endMinute, 0, 0);

				const teacherName = `${session.teacher.first_name} ${session.teacher.last_name}`;

				// Format day name properly
				const dayName =
					session.day_of_week.charAt(0).toUpperCase() +
					session.day_of_week.slice(1);

				// Create event summary for this specific session
				// Format: "1-1 - Online: Monday / Léa Emeriau"
				const eventSummary = `${productName} - ${location}: ${dayName} / ${teacherName}`;

				return {
					first_event_start_time: firstEventStart.toISOString(),
					first_event_end_time: firstEventEnd.toISOString(),
					day_of_week_abbreviation: this.getDayAbbreviation(
						session.day_of_week,
					),
					teacher_name: teacherName,
					event_summary: eventSummary,
				};
			},
		);

		// Collect all attendee emails
		const attendees: string[] = [];

		// Add student emails
		cohort.enrollments.forEach((enrollment) => {
			if (enrollment.student.email) {
				attendees.push(enrollment.student.email);
			}
		});

		// Add teacher emails (from weekly sessions)
		const teacherUserIds = new Set<string>();
		cohort.weekly_sessions.forEach((session) => {
			if (session.teacher.user_id) {
				teacherUserIds.add(session.teacher.user_id);
			}
		});

		// Fetch teacher emails from user table
		if (teacherUserIds.size > 0) {
			const { data: users } = await supabase
				.from("user")
				.select("email")
				.in("id", Array.from(teacherUserIds));

			if (users) {
				users.forEach((user) => {
					if (user.email) {
						attendees.push(user.email);
					}
				});
			}
		}

		// Location for all events
		const eventLocation =
			cohort.product.location === "online" ? "Online" : cohort.product.location;

		// Generic summary for the cohort (Make.com can override with individual session summaries)
		const event_summary = `${productName} - ${location}`;

		return {
			cohort_id: cohort.id,
			event_summary,
			location: eventLocation,
			sessions: JSON.stringify(sessions), // Convert to JSON string for Make.com
			attendees: JSON.stringify(attendees), // Convert to JSON string for Make.com
		};
	}

	/**
	 * Sends webhook to Make.com to create Google Calendar events
	 *
	 * The sessions and attendees are sent as JSON strings so Make.com can
	 * parse them directly into arrays/collections without additional operations
	 */
	async sendToMakeWebhook(payload: MakeWebhookPayload): Promise<boolean> {
		const webhookResult = await triggerWebhook("make", "cohortSetup", payload);
		return webhookResult.success;
	}

	/**
	 * Updates cohort setup_finalized status in database
	 */
	async updateCohortSetupStatus(
		cohortId: string,
		finalized: boolean,
	): Promise<boolean> {
		const { error } = await supabase
			.from("cohorts")
			.update({ setup_finalized: finalized })
			.eq("id", cohortId);

		if (error) {
			console.error("Error updating cohort setup status:", error);
			return false;
		}

		return true;
	}

	/**
	 * Main method to finalize cohort setup
	 */
	async finalizeSetup(
		cohortId: string,
	): Promise<{ success: boolean; message: string }> {
		try {
			// 1. Fetch cohort with all details
			const cohort = await this.getCohortWithDetails(cohortId);

			if (!cohort) {
				return { success: false, message: "Cohort not found" };
			}

			if (!cohort.start_date) {
				return {
					success: false,
					message: "Cohort start date is required to finalize setup",
				};
			}

			if (cohort.weekly_sessions.length === 0) {
				return {
					success: false,
					message: "No weekly sessions found for this cohort",
				};
			}

			// 2. Prepare webhook payload
			const webhookPayload = await this.prepareMakeWebhookPayload(cohort);

			// 3. Send to Make.com using the new webhook helper
			const webhookResult = await triggerWebhook(
				"make",
				"cohortSetup",
				webhookPayload,
			);

			if (!webhookResult.success) {
				return {
					success: false,
					message: webhookResult.error || "Failed to create calendar events",
				};
			}

			// 4. Update cohort status
			const updateSuccess = await this.updateCohortSetupStatus(cohortId, true);

			if (!updateSuccess) {
				return {
					success: false,
					message: "Calendar events created but failed to update cohort status",
				};
			}

			return { success: true, message: "Cohort setup finalized successfully" };
		} catch (error) {
			console.error("Error finalizing cohort setup:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return { success: false, message: errorMessage };
		}
	}
}
