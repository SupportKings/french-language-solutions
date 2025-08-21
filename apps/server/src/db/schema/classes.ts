import {
	pgTable,
	text,
	timestamp,
	uuid,
	boolean,
	integer,
	decimal,
} from "drizzle-orm/pg-core";
import { cohorts } from "./cohorts";
import { classStatusEnum, classModeEnum } from "./enums";

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
	mode: classModeEnum("mode").notNull().default("online"),
	
	// Location & Resources
	googleCalendarEventId: text("google_calendar_event_id"),
	room: text("room"),
	meetingLink: text("meeting_link"),
	googleDriveFolderId: text("google_drive_folder_id"),
	materials: text("materials"),
	
	// Capacity
	maxStudents: integer("max_students").default(10),
	currentEnrollment: integer("current_enrollment").default(0),
	
	// Teacher assignment
	teacherId: uuid("teacher_id"), // FK to teachers table (when created)
	
	// Metadata
	isActive: boolean("is_active").default(true),
	notes: text("notes"),
	
	// Timestamps
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"), // Soft delete
});