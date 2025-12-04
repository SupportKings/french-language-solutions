/**
 * Extract base event ID from Google Calendar event ID
 *
 * Google Calendar recurring events have IDs in the format:
 * "base_event_id_YYYYMMDDTHHMMSSZ"
 *
 * This function extracts just the base_event_id part.
 *
 * @example
 * getBaseEventId("h5t2beb6u394fvup36517igal4_20251203T205500Z") // "h5t2beb6u394fvup36517igal4"
 * getBaseEventId("simple_event_id") // "simple_event_id"
 */
export function getBaseEventId(eventId: string): string {
	const underscoreIndex = eventId.indexOf("_");
	if (underscoreIndex === -1) {
		return eventId; // No underscore, return as-is
	}
	return eventId.substring(0, underscoreIndex);
}

/**
 * Validate calendar event ID format
 *
 * @param eventId - The event ID to validate
 * @returns true if the event ID is valid
 */
export function isValidCalendarEventId(eventId: string): boolean {
	return typeof eventId === "string" && eventId.length > 0;
}
