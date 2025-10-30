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

export default app;
