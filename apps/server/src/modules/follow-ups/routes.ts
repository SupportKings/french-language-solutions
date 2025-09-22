import { Hono } from "hono";
import { FollowUpController } from "./controller";

const followUpRoutes = new Hono();
const controller = new FollowUpController();

// Set follow-up for a student
followUpRoutes.post("/set", (c) => controller.setFollowUp(c));

// Get all available sequences
followUpRoutes.get("/sequences", (c) => controller.getAllSequences(c));

// Get student's follow-up history
followUpRoutes.get("/student/:studentId", (c) => controller.getStudentFollowUps(c));

// Advance follow-up to next step or complete
followUpRoutes.post("/advance", (c) => controller.advanceFollowUp(c));

// Stop all active follow-ups for a student
followUpRoutes.post("/stop", (c) => controller.stopFollowUps(c));

// Trigger next messages for all ready follow-ups
followUpRoutes.post("/trigger-next-messages", (c) => controller.triggerNextMessages(c));

// Check recent engagements (touchpoints and assessments) and stop follow-ups if found
followUpRoutes.post("/check-recent-engagements-to-stop", (c) => controller.checkRecentEngagementsToStop(c));

export default followUpRoutes;