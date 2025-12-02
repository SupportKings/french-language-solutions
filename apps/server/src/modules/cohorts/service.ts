import { addDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { supabase } from "../../lib/supabase";
import {
	createClassesWithAttendance,
	type ClassToCreate,
} from "../../lib/utils/class-creation-helper";
import { getBaseEventId } from "../../lib/utils/calendar-event-parser";
import { triggerWebhook } from "../../lib/webhooks";
import type {
	CalendarEventPayload,
	CohortWithDetails,
	MakeWebhookPayload,
	MatchedCalendarEvent,
	WeeklySessionForCalendar,
} from "./types";

// Canadian Eastern Time timezone (only used for determining "tomorrow")
const CANADIAN_TIMEZONE = "America/Toronto";

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
	 * Calculate duration in minutes between start and end time
	 * Times are in format "HH:mm:ss"
	 */
	private calculateDurationMinutes(startTime: string, endTime: string): number {
		const [startHours, startMinutes] = startTime.split(":").map(Number);
		const [endHours, endMinutes] = endTime.split(":").map(Number);

		const startTotalMinutes = startHours * 60 + startMinutes;
		const endTotalMinutes = endHours * 60 + endMinutes;

		return endTotalMinutes - startTotalMinutes;
	}

	/**
	 * Format duration for display (e.g., "45 min", "1 hr", "1.5 hr")
	 */
	private formatDuration(minutes: number): string {
		if (minutes === 60) {
			return "1 hr";
		}
		if (minutes < 60) {
			return `${minutes} min`;
		}
		// For durations over 60 minutes, show as hours with decimal
		const hours = minutes / 60;
		return `${hours} hr`;
	}

	/**
	 * Format name as "First Name Last Initial" with optional period
	 * Examples: "John S", "Laura R."
	 */
	private formatNameWithInitial(
		firstName: string,
		lastName: string,
		addPeriod = false,
	): string {
		const lastInitial = lastName.charAt(0).toUpperCase();
		return `${firstName} ${lastInitial}${addPeriod ? "." : ""}`;
	}

	/**
	 * Filter enrollments to only include active students
	 * Active students have enrollment status: paid, welcome_package_sent, transitioning, or offboarding
	 */
	private getActiveEnrollments(enrollments: CohortWithDetails["enrollments"]) {
		const activeStatuses = [
			"paid",
			"welcome_package_sent",
			"transitioning",
			"offboarding",
		];
		return enrollments.filter((enrollment) =>
			activeStatuses.includes(enrollment.status),
		);
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
				product:products!cohorts_product_id_products_id_fk(*),
				weekly_sessions(
					*,
					teacher:teachers(*)
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

		// Get only active enrollments
		const activeEnrollments = this.getActiveEnrollments(cohort.enrollments);

		// Prepare sessions array for Google Calendar
		const sessions: WeeklySessionForCalendar[] = cohort.weekly_sessions.map(
			(session) => {
				// Validate required fields
				if (!session.day_of_week || !session.start_time || !session.end_time) {
					throw new Error(
						`Invalid session data: missing required fields for session ${session.id}`,
					);
				}

				// Get the first occurrence of this weekday on or after the cohort start date
				const firstEventDate = this.getNextWeekday(
					startDate,
					session.day_of_week,
				);

				// Create ISO datetime strings without timezone conversion
				// Just combine the date with the exact times from the database
				const year = firstEventDate.getFullYear();
				const month = String(firstEventDate.getMonth() + 1).padStart(2, "0");
				const day = String(firstEventDate.getDate()).padStart(2, "0");
				const dateStr = `${year}-${month}-${day}`;

				const firstEventStart = `${dateStr}T${session.start_time}`;
				const firstEventEnd = `${dateStr}T${session.end_time}`;

				const teacherName = `${session.teacher.first_name} ${session.teacher.last_name}`;

				// Calculate session duration
				const durationMinutes = this.calculateDurationMinutes(
					session.start_time,
					session.end_time,
				);
				const formattedDuration = this.formatDuration(durationMinutes);

				// Create event summary based on product format
				let eventSummary: string;

				if (cohort.product.format === "private") {
					// Private Classes: FLS CP [Student Name] – [Teacher Name] – [Class Length]
					// Example: FLS CP John S – Laura R. – 45 min
					const formattedTeacher = this.formatNameWithInitial(
						session.teacher.first_name,
						session.teacher.last_name,
						true, // Add period for teacher
					);

					// Get the first active enrolled student for private class
					if (activeEnrollments.length === 0) {
						const allStatuses = cohort.enrollments
							.map((e) => e.status)
							.join(", ");
						throw new Error(
							`No active students in private class cohort ${cohort.id}. Total enrollments: ${cohort.enrollments.length}, Statuses: [${allStatuses}]. Active statuses must be: paid, welcome_package_sent, transitioning, or offboarding.`,
						);
					}

					const student = activeEnrollments[0]?.student;
					if (!student || !student.first_name) {
						throw new Error(
							`Incomplete student data for private class cohort ${cohort.id}. Student must have at least a first_name. Current data - first_name: ${student?.first_name || "missing"}, last_name: ${student?.last_name || "missing"}`,
						);
					}

					// Format student name - if no last name, just use first name
					const formattedStudent = student.last_name
						? this.formatNameWithInitial(
								student.first_name,
								student.last_name,
								false, // No period for student
							)
						: student.first_name;

					eventSummary = `FLS CP ${formattedStudent} – ${formattedTeacher} – ${formattedDuration}`;
				} else {
					// Group Classes: FLS CG[# of Students] – [Class Length]
					// Example: FLS CG2 – 1 hr
					const numberOfStudents = activeEnrollments.length;
					eventSummary = `FLS CG${numberOfStudents} – ${formattedDuration}`;
				}

				return {
					session_id: session.id, // Supabase ID of the weekly session
					first_event_start_time: firstEventStart,
					first_event_end_time: firstEventEnd,
					day_of_week_abbreviation: this.getDayAbbreviation(
						session.day_of_week,
					),
					teacher_name: teacherName,
					teacher_calendar_id: session.teacher.google_calendar_id || null,
					event_summary: eventSummary,
				};
			},
		);

		// Get attendees from the source of truth endpoint
		const attendees = await this.getAttendees(cohort.id);

		// Location for all events
		const eventLocation =
			cohort.product.location === "online" ? "Online" : cohort.product.location;

		// Generic summary for the cohort (Make.com should use individual session summaries instead)
		// Use the first session's summary as the generic fallback
		const event_summary = sessions[0]?.event_summary || `FLS - ${productName}`;

		return {
			cohort_id: cohort.id,
			event_summary,
			location: eventLocation,
			sessions: sessions, // Array of session objects
			attendees: attendees, // Array of email strings
		};
	}

	/**
	 * Sends webhook to Make.com to create Google Calendar events
	 *
	 * Sessions are sent as an array of objects with calendar event details
	 * Attendees are sent as an array of email strings
	 * This format allows Make.com to easily iterate and process the data
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
	 * Get all attendees for a cohort (students + teachers)
	 * Returns an array of email addresses
	 * Only includes students with 'paid' or 'welcome_package_sent' enrollment status
	 */
	async getAttendees(cohortId: string): Promise<string[]> {
		const attendees: string[] = [];

		// Fetch enrollments with student data directly
		const { data: enrollments, error: enrollmentError } = await supabase
			.from("enrollments")
			.select(`
				id,
				status,
				students!inner(
					id,
					email
				)
			`)
			.eq("cohort_id", cohortId)
			.in("status", ["paid", "welcome_package_sent"]);

		if (enrollmentError) {
			console.error("Error fetching enrollments:", enrollmentError);
		} else if (enrollments) {
			console.log(
				`Found ${enrollments.length} paid/welcome_package_sent enrollments`,
			);
			enrollments.forEach((enrollment: any) => {
				if (enrollment.students?.email) {
					attendees.push(enrollment.students.email);
					console.log(`Added student email: ${enrollment.students.email}`);
				}
			});
		}

		// Fetch weekly sessions with teacher data
		const { data: sessions, error: sessionError } = await supabase
			.from("weekly_sessions")
			.select(`
				id,
				teachers!inner(
					id,
					email
				)
			`)
			.eq("cohort_id", cohortId);

		if (sessionError) {
			console.error("Error fetching sessions:", sessionError);
		} else if (sessions) {
			console.log(`Found ${sessions.length} weekly sessions`);

			// Collect unique teacher emails
			const teacherEmails = new Set<string>();
			sessions.forEach((session: any) => {
				if (session.teachers?.email) {
					teacherEmails.add(session.teachers.email);
				}
			});

			console.log(`Found ${teacherEmails.size} unique teachers`);

			// Add teacher emails to attendees
			teacherEmails.forEach((email) => {
				attendees.push(email);
				console.log(`Added teacher email: ${email}`);
			});
		}

		// Return unique emails
		const uniqueAttendees = [...new Set(attendees)];
		console.log(
			`Total unique attendees for cohort ${cohortId}: ${uniqueAttendees.length}`,
		);
		return uniqueAttendees;
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

	/**
	 * Gets tomorrow's day of the week as a lowercase string matching the database enum
	 * Uses Canadian Eastern Time to determine "tomorrow"
	 */
	private getTomorrowDayOfWeek(): string {
		// Get current time in Canadian timezone
		const nowInCanada = toZonedTime(new Date(), CANADIAN_TIMEZONE);
		const tomorrow = addDays(nowInCanada, 1);
		const dayIndex = tomorrow.getDay();
		const days = [
			"sunday",
			"monday",
			"tuesday",
			"wednesday",
			"thursday",
			"friday",
			"saturday",
		];
		const tomorrowDay = days[dayIndex];
		console.log(
			`[Auto-Create Classes] Today in Canada: ${nowInCanada.toISOString()}, Tomorrow: ${tomorrow.toISOString()}, Day: ${tomorrowDay}`,
		);
		return tomorrowDay;
	}

	/**
	 * Finds all cohorts that have weekly sessions tomorrow
	 * Only returns active cohorts (setup_finalized = true, cohort_status != 'class_ended')
	 */
	async getTomorrowsCohorts(): Promise<
		Array<{
			cohort: CohortWithDetails;
			tomorrowSessions: Array<CohortWithDetails["weekly_sessions"][number]>;
		}>
	> {
		const tomorrowDay = this.getTomorrowDayOfWeek();

		// Get tomorrow's date in Canadian timezone for filtering
		const nowInCanada = toZonedTime(new Date(), CANADIAN_TIMEZONE);
		const tomorrow = addDays(nowInCanada, 1);
		const tomorrowDate = tomorrow.toISOString().split("T")[0]; // Format as YYYY-MM-DD

		// Fetch all active cohorts with weekly sessions
		const { data: cohorts, error } = await supabase
			.from("cohorts")
			.select(`
				*,
				product:products!cohorts_product_id_products_id_fk(*),
				weekly_sessions(
					*,
					teacher:teachers(*)
				),
				enrollments!enrollments_cohort_id_fkey(
					*,
					student:students!enrollments_student_id_fkey(*)
				)
			`)
			.eq("setup_finalized", true)
			.neq("cohort_status", "class_ended")
			.lte("start_date", tomorrowDate);

		if (error || !cohorts) {
			console.error("[Auto-Create Classes] Error fetching cohorts:", error);
			return [];
		}

		console.log(
			`[Auto-Create Classes] Found ${cohorts.length} active cohorts (setup_finalized=true, status!=class_ended)`,
		);

		// Filter cohorts that have sessions matching tomorrow's day
		const result = cohorts
			.map((cohort) => {
				const tomorrowSessions = (cohort.weekly_sessions || []).filter(
					(session: any) => session.day_of_week === tomorrowDay,
				);

				if (tomorrowSessions.length > 0) {
					return {
						cohort: cohort as unknown as CohortWithDetails,
						tomorrowSessions,
					};
				}
				return null;
			})
			.filter(Boolean) as Array<{
			cohort: CohortWithDetails;
			tomorrowSessions: Array<CohortWithDetails["weekly_sessions"][number]>;
		}>;

		console.log(
			`[Auto-Create Classes] ${result.length} cohorts have sessions scheduled for ${tomorrowDay}`,
		);
		return result;
	}

	/**
	 * Creates class records for tomorrow's weekly sessions
	 * Returns the number of classes created
	 * Uses Canadian Eastern Time to determine "tomorrow"
	 */
	async createClassesForTomorrow(): Promise<{
		success: boolean;
		message: string;
		classesCreated: number;
	}> {
		try {
			console.log("[Auto-Create Classes] Starting class creation process...");
			const tomorrowsCohorts = await this.getTomorrowsCohorts();

			if (tomorrowsCohorts.length === 0) {
				console.log(
					"[Auto-Create Classes] No cohorts found with sessions for tomorrow",
				);
				return {
					success: true,
					message: "No cohorts with sessions scheduled for tomorrow",
					classesCreated: 0,
				};
			}

			// Get tomorrow in Canadian timezone
			const nowInCanada = toZonedTime(new Date(), CANADIAN_TIMEZONE);
			const tomorrow = addDays(nowInCanada, 1);

			const classesToCreate: Array<{
				cohort_id: string;
				teacher_id: string | null;
				start_time: string;
				end_time: string;
				google_calendar_event_id: string | null;
				meeting_link: string | null;
				status: "scheduled";
			}> = [];

			// Prepare all class records
			for (const { cohort, tomorrowSessions } of tomorrowsCohorts) {
				console.log(
					`[Auto-Create Classes] Processing cohort ${cohort.id} (${cohort.nickname || "unnamed"}) with ${tomorrowSessions.length} sessions`,
				);

				for (const session of tomorrowSessions) {
					// Create datetime for tomorrow with session times
					// Get YYYY-MM-DD format for tomorrow
					const year = tomorrow.getFullYear();
					const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
					const day = String(tomorrow.getDate()).padStart(2, "0");
					const tomorrowDateStr = `${year}-${month}-${day}`;

					// Combine date with session times (format: "HH:mm:ss")
					// Store times exactly as they are without timezone conversion
					const startTimeStr = `${tomorrowDateStr}T${session.start_time!}`;
					const endTimeStr = `${tomorrowDateStr}T${session.end_time!}`;

					console.log(
						`[Auto-Create Classes]   - Session ${session.id}: ${startTimeStr} to ${endTimeStr}, teacher: ${session.teacher_id}`,
					);

					classesToCreate.push({
						cohort_id: cohort.id,
						teacher_id: session.teacher_id,
						start_time: startTimeStr,
						end_time: endTimeStr,
						google_calendar_event_id: session.google_calendar_event_id,
						meeting_link: session.calendar_event_url,
						status: "scheduled",
					});
				}
			}

			console.log(
				`[Auto-Create Classes] Inserting ${classesToCreate.length} classes into database...`,
			);

			// Bulk insert all classes
			const { data: createdClasses, error } = await supabase
				.from("classes")
				.insert(classesToCreate)
				.select();

			if (error) {
				console.error("[Auto-Create Classes] Error creating classes:", error);
				return {
					success: false,
					message: `Failed to create classes: ${error.message}`,
					classesCreated: 0,
				};
			}

			console.log(
				`[Auto-Create Classes] ✓ Successfully created ${createdClasses?.length || 0} classes`,
			);

			// Create attendance records for each class
			const attendanceRecords: Array<{
				class_id: string;
				cohort_id: string;
				student_id: string;
				status: "unset";
				homework_completed: boolean;
			}> = [];

			// Map class IDs back to their cohorts for attendance creation
			const classIdToCohortMap = new Map<
				string,
				{ cohortId: string; students: string[] }
			>();

			// Build map of class ID to cohort and its enrolled students
			for (let i = 0; i < tomorrowsCohorts.length; i++) {
				const { cohort } = tomorrowsCohorts[i];
				const enrolledStudents = cohort.enrollments
					.filter(
						(enrollment: any) =>
							enrollment.status === "paid" ||
							enrollment.status === "welcome_package_sent",
					)
					.map((enrollment: any) => enrollment.student_id);

				// Find all classes created for this cohort
				const cohortClasses =
					createdClasses?.filter((c) => c.cohort_id === cohort.id) || [];

				for (const classRecord of cohortClasses) {
					classIdToCohortMap.set(classRecord.id, {
						cohortId: cohort.id,
						students: enrolledStudents,
					});
				}

				console.log(
					`[Auto-Create Classes] Cohort ${cohort.id}: ${enrolledStudents.length} enrolled students (paid/welcome_package_sent)`,
				);
			}

			// Create attendance records for all students in all classes
			for (const [classId, { cohortId, students }] of classIdToCohortMap) {
				for (const studentId of students) {
					attendanceRecords.push({
						class_id: classId,
						cohort_id: cohortId,
						student_id: studentId,
						status: "unset",
						homework_completed: false,
					});
				}
			}

			console.log(
				`[Auto-Create Classes] Creating ${attendanceRecords.length} attendance records...`,
			);

			// Bulk insert attendance records
			if (attendanceRecords.length > 0) {
				const { error: attendanceError } = await supabase
					.from("attendance_records")
					.insert(attendanceRecords);

				if (attendanceError) {
					console.error(
						"[Auto-Create Classes] Error creating attendance records:",
						attendanceError,
					);
					return {
						success: false,
						message: `Classes created but failed to create attendance records: ${attendanceError.message}`,
						classesCreated: createdClasses?.length || 0,
					};
				}

				console.log(
					`[Auto-Create Classes] ✓ Successfully created ${attendanceRecords.length} attendance records`,
				);
			}

			return {
				success: true,
				message: `Successfully created ${createdClasses?.length || 0} classes with ${attendanceRecords.length} attendance records for tomorrow`,
				classesCreated: createdClasses?.length || 0,
			};
		} catch (error) {
			console.error("[Auto-Create Classes] Unexpected error:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return {
				success: false,
				message: errorMessage,
				classesCreated: 0,
			};
		}
	}

	/**
	 * Create class records from calendar event data
	 * Used by external integrations (Make.com, Google Calendar webhooks)
	 *
	 * @param calendarEvents - Array of stringified JSON objects with event data
	 * @returns Result with success status and counts of created records
	 */
	async createClassesFromCalendarEvents(
		calendarEvents: string[],
	): Promise<{
		success: boolean;
		message: string;
		classesCreated: number;
		attendanceRecordsCreated: number;
	}> {
		try {
			console.log(
				`[Create Classes from Events] Processing ${calendarEvents.length} events...`,
			);

			// Step 1: Parse and validate events
			const parsedEvents = this.parseCalendarEventPayloads(calendarEvents);
			console.log(
				`[Create Classes from Events] Parsed ${parsedEvents.length} valid events`,
			);

			// Step 2: Deduplicate by base event ID (keep first occurrence)
			const uniqueEvents = this.deduplicateEventsByBaseId(parsedEvents);
			console.log(
				`[Create Classes from Events] ${uniqueEvents.length} unique events after deduplication`,
			);

			// Step 3: Match events to weekly sessions
			const matchedEvents = await this.matchEventsToSessions(uniqueEvents);
			console.log(
				`[Create Classes from Events] Matched ${matchedEvents.length} events to sessions`,
			);

			if (matchedEvents.length === 0) {
				return {
					success: true,
					message: "No matching sessions found for provided events",
					classesCreated: 0,
					attendanceRecordsCreated: 0,
				};
			}

			// Step 4: Prepare class records
			const classesToCreate = this.prepareClassesFromEvents(matchedEvents);

			// Step 5: Create classes with attendance using shared helper
			return await createClassesWithAttendance(classesToCreate);
		} catch (error) {
			console.error("[Create Classes from Events] Unexpected error:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return {
				success: false,
				message: errorMessage,
				classesCreated: 0,
				attendanceRecordsCreated: 0,
			};
		}
	}

	/**
	 * Parse and validate incoming calendar event strings
	 */
	private parseCalendarEventPayloads(
		events: string[],
	): CalendarEventPayload[] {
		const parsed: CalendarEventPayload[] = [];

		for (let i = 0; i < events.length; i++) {
			try {
				const event = JSON.parse(events[i]);

				// Validate required fields
				if (!event.event_id || !event.start || !event.end) {
					console.warn(
						`[Create Classes from Events] Skipping event ${i}: missing required fields`,
					);
					continue;
				}

				// Validate date formats
				if (Number.isNaN(Date.parse(event.start)) || Number.isNaN(Date.parse(event.end))) {
					console.warn(
						`[Create Classes from Events] Skipping event ${i}: invalid date format`,
					);
					continue;
				}

				parsed.push({
					event_id: event.event_id,
					start: event.start,
					end: event.end,
					hangout_link: event.hangout_link || null,
				});
			} catch (error) {
				console.warn(
					`[Create Classes from Events] Failed to parse event ${i}:`,
					error,
				);
				continue;
			}
		}

		return parsed;
	}

	/**
	 * Deduplicate events by base event ID
	 * If multiple events have same base ID, keeps only the first occurrence
	 */
	private deduplicateEventsByBaseId(
		events: CalendarEventPayload[],
	): CalendarEventPayload[] {
		const seenBaseIds = new Set<string>();
		const unique: CalendarEventPayload[] = [];

		for (const event of events) {
			const baseId = getBaseEventId(event.event_id);

			if (!seenBaseIds.has(baseId)) {
				seenBaseIds.add(baseId);
				unique.push(event);
			}
		}

		return unique;
	}

	/**
	 * Match calendar events to weekly sessions by google_calendar_event_id
	 * Also validates that cohorts are active (setup_finalized=true, status!=class_ended)
	 */
	private async matchEventsToSessions(
		events: CalendarEventPayload[],
	): Promise<MatchedCalendarEvent[]> {
		// Extract base event IDs
		const baseEventIds = events.map((e) => getBaseEventId(e.event_id));

		// Fetch matching weekly sessions with cohort information
		const { data: sessions, error } = await supabase
			.from("weekly_sessions")
			.select(
				`
      id,
      cohort_id,
      teacher_id,
      google_calendar_event_id,
      calendar_event_url,
      cohorts!inner(
        id,
        setup_finalized,
        cohort_status
      )
    `,
			)
			.in("google_calendar_event_id", baseEventIds);

		if (error) {
			console.error(
				"[Create Classes from Events] Error fetching sessions:",
				error,
			);
			throw new Error(`Failed to fetch sessions: ${error.message}`);
		}

		// Match events to sessions and validate cohort status
		const matched: MatchedCalendarEvent[] = [];

		for (const event of events) {
			const baseEventId = getBaseEventId(event.event_id);
			const session = sessions?.find(
				(s) => s.google_calendar_event_id === baseEventId,
			);

			if (!session) {
				console.warn(
					`[Create Classes from Events] No session found for event ${event.event_id} (base: ${baseEventId})`,
				);
				continue;
			}

			// Validate cohort status
			const cohort = (session as any).cohorts;
			if (!cohort.setup_finalized) {
				console.warn(
					`[Create Classes from Events] Skipping event ${event.event_id}: cohort ${session.cohort_id} setup not finalized`,
				);
				continue;
			}

			if (cohort.cohort_status === "class_ended") {
				console.warn(
					`[Create Classes from Events] Skipping event ${event.event_id}: cohort ${session.cohort_id} status is class_ended`,
				);
				continue;
			}

			matched.push({ event, session });
		}

		return matched;
	}

	/**
	 * Convert matched events to class records ready for insertion
	 * Converts UTC times from events to Canadian Eastern Time before storing
	 */
	private prepareClassesFromEvents(
		matchedEvents: MatchedCalendarEvent[],
	): ClassToCreate[] {
		return matchedEvents.map(({ event, session }) => {
			// Convert UTC times to Canadian Eastern Time
			const utcStartTime = new Date(event.start);
			const utcEndTime = new Date(event.end);

			// Convert to Canadian timezone
			const canadianStartTime = toZonedTime(utcStartTime, CANADIAN_TIMEZONE);
			const canadianEndTime = toZonedTime(utcEndTime, CANADIAN_TIMEZONE);

			// Format as ISO string without timezone info (database will store as-is)
			// Format: YYYY-MM-DDTHH:mm:ss
			const startTimeStr = canadianStartTime.toISOString().slice(0, 19);
			const endTimeStr = canadianEndTime.toISOString().slice(0, 19);

			console.log(
				`[Create Classes from Events] Converting times for event ${event.event_id}:`,
			);
			console.log(`  UTC: ${event.start} -> Canadian: ${startTimeStr}`);
			console.log(`  UTC: ${event.end} -> Canadian: ${endTimeStr}`);

			return {
				cohort_id: session.cohort_id,
				teacher_id: session.teacher_id,
				start_time: startTimeStr,
				end_time: endTimeStr,
				google_calendar_event_id: event.event_id,
				meeting_link: session.calendar_event_url,
				hangout_link: event.hangout_link || null,
				status: "scheduled" as const,
			};
		});
	}
}
