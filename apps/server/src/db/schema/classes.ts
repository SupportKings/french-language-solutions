import {
	pgTable,
	text,
	timestamp,
	uuid,
	integer,
} from "drizzle-orm/pg-core";
import { cohorts } from "./cohorts";
import { classStatusEnum } from "./enums";

export const classes = pgTable("classes", {
	id: uuid("id").primaryKey().defaultRandom(),
	cohortId: uuid("cohort_id")
		.notNull()
		.references(() => cohorts.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	description: text("description"),
	startTime: timestamp("start_time").notNull(), // Date and time
	endTime: timestamp("end_time").notNull(), // Date and time
	status: classStatusEnum("status").notNull().default("scheduled"),
	
	// Location & Resources
	googleCalendarEventId: text("google_calendar_event_id"),
	room: text("room"),
	meetingLink: text("meeting_link"),
	googleDriveFolderId: text("google_drive_folder_id"),
	
	// Capacity
	currentEnrollment: integer("current_enrollment").default(0),
	
	// Teacher assignment
	teacherId: uuid("teacher_id"), // FK to teachers table (when created)
	
	// Metadata
	notes: text("notes"),
	
	// Timestamps
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"), // Soft delete
});