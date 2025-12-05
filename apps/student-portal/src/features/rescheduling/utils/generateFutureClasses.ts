import {
	addDays,
	addHours,
	addWeeks,
	format,
	getDay,
	isAfter,
	isBefore,
	parseISO,
	setHours,
	setMinutes,
	startOfDay,
} from "date-fns";

import type { FutureClass, RescheduleRequest, WeeklySession } from "../types";

// Map day names to day numbers (0 = Sunday, 1 = Monday, etc.)
const DAY_MAP: Record<string, number> = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
};

/**
 * Generate future class instances for the next 2 weeks based on weekly session patterns
 * Filters out:
 * - Classes within the next 24 hours
 * - Classes that already have a reschedule request
 * - Classes before cohort start date
 */
export function generateFutureClasses(
	weeklySessions: WeeklySession[],
	cohortId: string,
	cohortStartDate: string | null,
	existingRequests: RescheduleRequest[],
): FutureClass[] {
	const now = new Date();
	const twentyFourHoursFromNow = addHours(now, 24);
	const twoWeeksFromNow = addWeeks(now, 2);
	const cohortStart = cohortStartDate ? parseISO(cohortStartDate) : null;

	// Get dates that already have requests (non-cancelled)
	const requestedDates = new Set(
		existingRequests
			.filter((r) => r.status !== "cancelled")
			.map((r) => r.originalClassDate),
	);

	const futureClasses: FutureClass[] = [];

	// For each weekly session, find all occurrences in the next 2 weeks
	for (const session of weeklySessions) {
		if (!session.dayOfWeek || !session.startTime || !session.endTime) {
			continue;
		}

		const targetDayNumber = DAY_MAP[session.dayOfWeek.toLowerCase()];
		if (targetDayNumber === undefined) {
			continue;
		}

		// Parse time from HH:mm:ss format
		const [startHour, startMinute] = session.startTime.split(":").map(Number);
		const [endHour, endMinute] = session.endTime.split(":").map(Number);

		// Find all occurrences of this day in the next 2 weeks
		let currentDate = startOfDay(now);
		const endDate = twoWeeksFromNow;

		while (isBefore(currentDate, endDate)) {
			if (getDay(currentDate) === targetDayNumber) {
				// Create the full datetime for this class
				let classDateTime = setHours(currentDate, startHour);
				classDateTime = setMinutes(classDateTime, startMinute);

				// Create ISO string for comparison
				const classDateTimeISO = classDateTime.toISOString();

				// Check all conditions
				const isAfter24Hours = isAfter(classDateTime, twentyFourHoursFromNow);
				const isAfterCohortStart = !cohortStart || isAfter(classDateTime, cohortStart);
				const hasNoExistingRequest = !requestedDates.has(classDateTimeISO);

				if (isAfter24Hours && isAfterCohortStart && hasNoExistingRequest) {
					futureClasses.push({
						date: classDateTime,
						startTime: session.startTime.substring(0, 5), // HH:mm
						endTime: session.endTime.substring(0, 5), // HH:mm
						dayOfWeek: session.dayOfWeek,
						teacher: session.teacherId && session.teacherName
							? { id: session.teacherId, name: session.teacherName }
							: null,
						weeklySessionId: session.id,
						cohortId,
					});
				}
			}

			currentDate = addDays(currentDate, 1);
		}
	}

	// Sort by date ascending
	return futureClasses.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Format a future class date for display
 */
export function formatClassDate(date: Date): string {
	return format(date, "EEEE, MMMM d, yyyy");
}

/**
 * Format time range for display
 */
export function formatTimeRange(startTime: string, endTime: string): string {
	// Convert HH:mm to display format
	const formatTime = (time: string) => {
		const [hours, minutes] = time.split(":").map(Number);
		const period = hours >= 12 ? "PM" : "AM";
		const displayHours = hours % 12 || 12;
		return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
	};

	return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}
