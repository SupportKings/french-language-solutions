import {
	pgTable,
	text,
	timestamp,
	uuid,
	time,
} from "drizzle-orm/pg-core";
import { dayOfWeekEnum } from "./enums";
import { cohorts } from "./cohorts";
import { teachers } from "./teachers";

export const weeklySessions = pgTable("weekly_sessions", {
	id: uuid("id").primaryKey().defaultRandom(),
	cohortId: uuid("cohort_id")
		.notNull()
		.references(() => cohorts.id),
	teacherId: uuid("teacher_id")
		.notNull()
		.references(() => teachers.id),
	dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
	startTime: time("start_time").notNull(), // HH:MM format
	endTime: time("end_time").notNull(), // HH:MM format
	googleCalendarEventId: text("google_calendar_event_id"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});