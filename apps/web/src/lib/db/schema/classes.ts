import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { cohorts } from "./cohorts";

export const classes = pgTable("classes", {
	id: uuid("id").primaryKey().defaultRandom(),
	cohortId: uuid("cohort_id")
		.notNull()
		.references(() => cohorts.id),
	startTime: timestamp("start_time").notNull(), // Date and time
	endTime: timestamp("end_time").notNull(), // Date and time
	googleCalendarEventId: text("google_calendar_event_id"),
	googleDriveFolderId: text("google_drive_folder_id"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
