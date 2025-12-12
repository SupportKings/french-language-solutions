import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { cohorts } from "./cohorts";
import { classStatusEnum } from "./enums";
import { teachers } from "./teachers";

export const classes = pgTable("classes", {
	id: uuid("id").primaryKey().defaultRandom(),
	cohortId: uuid("cohort_id")
		.notNull()
		.references(() => cohorts.id, { onDelete: "cascade" }),
	startTime: timestamp("start_time").notNull(), // Date and time
	endTime: timestamp("end_time").notNull(), // Date and time
	status: classStatusEnum("status").notNull().default("scheduled"),

	// Resources
	googleCalendarEventId: text("google_calendar_event_id"),
	meetingLink: text("meeting_link"),
	googleDriveFolderId: text("google_drive_folder_id"),

	// Capacity

	// Teacher assignment
	teacherId: uuid("teacher_id").references(() => teachers.id, {
		onDelete: "set null",
	}),

	// Metadata
	notes: text("notes"),

	// Timestamps
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"), // Soft delete
});
