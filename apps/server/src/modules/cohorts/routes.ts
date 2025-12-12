import { Hono } from "hono";
import { CohortController } from "./controller";

const app = new Hono();
const controller = new CohortController();

/**
 * GET /api/cohorts/:cohortId/attendees
 *
 * Get all attendees for a cohort (students and teachers)
 *
 * Returns:
 * {
 *   "success": true,
 *   "cohort_id": "uuid-here",
 *   "attendees": ["email1@example.com", "email2@example.com"],
 *   "count": 2
 * }
 */
app.get("/:cohortId/attendees", (c) => controller.getAttendees(c));

/**
 * POST /api/cohorts/finalize-setup
 *
 * Finalize cohort setup and create Google Calendar events
 *
 * Request body:
 * {
 *   "cohort_id": "uuid-here"
 * }
 *
 * Requirements:
 * - Cohort must have a start_date
 * - Cohort must have weekly sessions defined
 * - MAKE_WEBHOOK_URL_COHORT_SETUP env var must be configured
 */
app.post("/finalize-setup", (c) => controller.finalizeSetup(c));

/**
 * GET /api/cohorts/create-tomorrow-classes
 *
 * Automatically create class records for tomorrow's weekly sessions
 *
 * This endpoint will:
 * 1. Find all cohorts with setup_finalized = true and cohort_status != 'class_ended'
 * 2. Filter cohorts that have weekly sessions scheduled for tomorrow
 * 3. Create class records for each matching weekly session
 *
 * Returns:
 * {
 *   "success": true,
 *   "message": "Successfully created 5 classes for tomorrow",
 *   "classesCreated": 5
 * }
 */
app.get("/create-tomorrow-classes", (c) => controller.createTomorrowClasses(c));

/**
 * POST /api/cohorts/create-classes-from-events
 *
 * Create class records from calendar event data
 *
 * Request body:
 * {
 *   "events": [
 *     "{\"event_id\":\"abc123_20251203T161500Z\",\"start\":\"2025-12-03T16:15:00.000Z\",\"end\":\"2025-12-03T17:00:00.000Z\"}",
 *     ...
 *   ]
 * }
 *
 * Returns:
 * {
 *   "success": true,
 *   "message": "Successfully created 5 classes with 15 attendance records",
 *   "classesCreated": 5,
 *   "attendanceRecordsCreated": 15
 * }
 */
app.post("/create-classes-from-events", (c) =>
	controller.createClassesFromEvents(c),
);

export default app;
