import { Hono } from "hono";
import { ClassBookingController } from "./controller";

const app = new Hono();
const controller = new ClassBookingController();

// Get available cohorts for booking (optionally pass levelCode as query param)
app.get("/available-beginner-cohorts", (c) => controller.getAvailableBeginnerCohorts(c));

export default app;