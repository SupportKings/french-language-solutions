import {
	boolean,
	date,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { assessmentResultEnum } from "./enums";
import { languageLevels } from "./language-levels";
import { students } from "./students";
import { teachers } from "./teachers";

export const studentAssessments = pgTable("student_assessments", {
	id: uuid("id").primaryKey().defaultRandom(),
	studentId: uuid("student_id")
		.notNull()
		.references(() => students.id),
	levelId: uuid("level_id").references(() => languageLevels.id, { onDelete: "set null" }),
	scheduledFor: date("scheduled_for"),
	isPaid: boolean("is_paid").notNull().default(false),
	result: assessmentResultEnum("result").notNull().default("requested"),
	notes: text("notes"),
	interviewHeldBy: uuid("interview_held_by").references(() => teachers.id),
	levelCheckedBy: uuid("level_checked_by").references(() => teachers.id),
	meetingRecordingUrl: text("meeting_recording_url"),
	calendarEventUrl: text("calendar_event_url"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
