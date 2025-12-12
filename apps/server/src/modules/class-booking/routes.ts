import { Hono } from "hono";
import { ClassBookingController } from "./controller";

const app = new Hono();
const controller = new ClassBookingController();

// Get available cohorts for booking (optionally pass levelCode as query param)
app.get("/available-beginner-cohorts", (c) =>
	controller.getAvailableBeginnerCohorts(c),
);

// Process abandoned contracts and payments
app.get("/process-abandoned-enrollments", (c) =>
	controller.processAbandonedEnrollments(c),
);

// Get Stripe payment URL for an enrollment
app.get("/enrollment/:enrollmentId/payment-url", (c) =>
	controller.getPaymentUrl(c),
);

export default app;
