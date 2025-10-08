import { format as dateFnsFormat } from "date-fns";

/**
 * Parses a YYYY-MM-DD date string as a local date, avoiding timezone shifts.
 *
 * When you use `new Date("2025-10-02")`, JavaScript interprets it as UTC midnight,
 * which can result in the previous day when displayed in timezones like EST (UTC-5).
 * This function creates the date in the local timezone instead.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export function parseDateString(dateString: string): Date {
	const parts = dateString.split("-");
	const [year, month, day] = parts;
	// Create date in local timezone
	return new Date(
		Number.parseInt(year),
		Number.parseInt(month) - 1,
		Number.parseInt(day),
	);
}

/**
 * Formats a Date object to YYYY-MM-DD string in local timezone.
 *
 * This avoids timezone conversion issues when storing date-only values.
 *
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateString(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * Formats a date string for display, handling both date-only and timestamp formats correctly.
 *
 * Automatically detects:
 * - Date-only strings (YYYY-MM-DD): Parses in local timezone to avoid shifts
 * - Timestamp strings (ISO 8601 with time): Uses standard Date parsing
 *
 * @param dateString - Date string in YYYY-MM-DD or ISO 8601 format, or null
 * @param formatString - date-fns format string (default: "MMM dd, yyyy")
 * @param nullText - Text to display when date is null (default: "Not set")
 * @returns Formatted date string
 */
export function formatDate(
	dateString: string | null,
	formatString = "MMM dd, yyyy",
	nullText = "Not set",
): string {
	if (!dateString) return nullText;
	try {
		// Check if it's a date-only string (YYYY-MM-DD) or a timestamp (has T or time component)
		const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString);

		if (isDateOnly) {
			// Date-only string: parse in local timezone
			return dateFnsFormat(parseDateString(dateString), formatString);
		}

		// Timestamp string: use standard Date parsing (has timezone info)
		return dateFnsFormat(new Date(dateString), formatString);
	} catch {
		return "Invalid date";
	}
}
