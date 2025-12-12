import { Hono } from "hono";
import { StudentController } from "./controller";

const app = new Hono();
const controller = new StudentController();

// Get all students
app.get("/", (c) => controller.getAll(c));

// Get single student
app.get("/:id", (c) => controller.getById(c));

// Create student
app.post("/", (c) => controller.create(c));

// Update student
app.patch("/:id", (c) => controller.update(c));

// Delete student
app.delete("/:id", (c) => controller.delete(c));

// Search students by email
app.get("/search/email", (c) => controller.searchByEmail(c));

// Search students by Tally form submission ID
app.get("/search/tally-submission-id", (c) =>
	controller.getByTallySubmissionId(c),
);

export default app;
