import { Hono } from "hono";
import { TeacherController } from "./controller";

const app = new Hono();
const controller = new TeacherController();

/**
 * POST /api/teachers/available-for-private-classes
 *
 * Find teachers available for private (one-to-one) classes
 *
 * Request body example:
 * {
 *   "format": "online",           // or "in_person"
 *   "duration_minutes": 60,        // class duration in minutes
 *   "day_of_week": "Mon",          // accepts short (Mon) or full (Monday) names
 *   "student_id": "uuid-here",     // student's ID from database
 *   "session_structure": "single"  // or "double" for twice per week
 * }
 *
 * Note: If session_structure is "double", the system will check if teacher
 * can accommodate 2x the duration on the specified day
 */
app.post("/available-for-private-classes", (c) =>
	controller.getAvailableTeachers(c),
);

export default app;
