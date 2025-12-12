import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { cohorts } from "./cohorts";
import { dayOfWeekEnum } from "./enums";
import { teachers } from "./teachers";

export const weeklySessions = pgTable("weekly_sessions", {
	id: uuid("id").primaryKey().defaultRandom(),
	airtableRecordId: text("airtable_record_id"),
	airtableCreatedAt: timestamp("airtable_created_at"),
	cohortId: uuid("cohort_id")
		.notNull()
		.references(() => cohorts.id),
	teacherId: uuid("teacher_id")
		.notNull()
		.references(() => teachers.id),
	dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
	startTime: text("start_time").notNull(),
	endTime: text("end_time").notNull(),
	googleCalendarEventId: text("google_calendar_event_id"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
