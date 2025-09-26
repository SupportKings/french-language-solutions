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

export default app;
