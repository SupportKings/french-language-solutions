import { Hono } from "hono";
import { CohortController } from "./controller";

const app = new Hono();
const controller = new CohortController();

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
