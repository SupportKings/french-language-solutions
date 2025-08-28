import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { cohorts } from "./cohorts";
import { enrollmentStatusEnum } from "./enums";
import { students } from "./students";

export const enrollments = pgTable("enrollments", {
	id: uuid("id").primaryKey().defaultRandom(),
	studentId: uuid("student_id")
		.notNull()
		.references(() => students.id),
	cohortId: uuid("cohort_id")
		.notNull()
		.references(() => cohorts.id),
	status: enrollmentStatusEnum("status").notNull().default("interested"),
	airtableRecordId: text("airtable_record_id"), // For migration tracking
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
