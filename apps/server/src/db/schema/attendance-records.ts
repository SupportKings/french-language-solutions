import { relations } from "drizzle-orm";
import {
	boolean,
	date,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { classes } from "./classes";
import { cohorts } from "./cohorts";
import { students } from "./students";
import { teachers } from "./teachers";

// Attendance status enum
export const attendanceStatusEnum = [
	"unset",
	"attended",
	"not_attended",
] as const;
export type AttendanceStatus = (typeof attendanceStatusEnum)[number];

// Attendance records table
export const attendanceRecords = pgTable("attendance_records", {
	// Primary key
	id: uuid("id").defaultRandom().primaryKey(),

	// Foreign keys
	studentId: uuid("student_id")
		.notNull()
		.references(() => students.id, { onDelete: "cascade" }),
	cohortId: uuid("cohort_id")
		.notNull()
		.references(() => cohorts.id, { onDelete: "cascade" }),
	classId: uuid("class_id").references(() => classes.id, {
		onDelete: "cascade",
	}),

	// Attendance data
	status: varchar("status", { length: 20 }).notNull().default("unset"),

	// Additional fields
	notes: text("notes"),
	homeworkCompleted: boolean("homework_completed").default(false),
	markedBy: uuid("marked_by").references(() => teachers.id, {
		onDelete: "set null",
	}), // References teachers.id
	markedAt: timestamp("marked_at", { withTimezone: true }),

	// Metadata
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

// Relations
export const attendanceRecordsRelations = relations(
	attendanceRecords,
	({ one }) => ({
		student: one(students, {
			fields: [attendanceRecords.studentId],
			references: [students.id],
		}),
		cohort: one(cohorts, {
			fields: [attendanceRecords.cohortId],
			references: [cohorts.id],
		}),
		class: one(classes, {
			fields: [attendanceRecords.classId],
			references: [classes.id],
		}),
		teacher: one(teachers, {
			fields: [attendanceRecords.markedBy],
			references: [teachers.id],
		}),
	}),
);

// Type exports
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;
