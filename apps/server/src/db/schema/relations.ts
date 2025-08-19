import { relations } from "drizzle-orm";
import { teachers } from "./teachers";
import { students } from "./students";

// For now, we don't define relations with the Better Auth user table
// since it's not managed by Drizzle

// We can add more relations as we add more tables
// For example: classes, enrollments, etc.

// Placeholder for future relations
export const teachersRelations = relations(teachers, ({ many }) => ({
	// Future: classes, schedules, etc.
}));

export const studentsRelations = relations(students, ({ many }) => ({
	// Future: enrollments, assessments, etc.
}));