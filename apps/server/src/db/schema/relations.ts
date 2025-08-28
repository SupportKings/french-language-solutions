import { relations } from "drizzle-orm";
import { automatedFollowUps } from "./automated-follow-ups";
import { classes } from "./classes";
import { cohorts } from "./cohorts";
import { enrollments } from "./enrollments";
import { products } from "./products";
import { studentAssessments } from "./student-assessments";
import { students } from "./students";
import { teachers } from "./teachers";
import { templateFollowUpMessages } from "./template-follow-up-messages";
import { templateFollowUpSequences } from "./template-follow-up-sequences";
import { weeklySessions } from "./weekly-sessions";

// Teacher relations
export const teachersRelations = relations(teachers, ({ many }) => ({
	weeklySessions: many(weeklySessions),
	assessmentsAsInterviewer: many(studentAssessments, {
		relationName: "interviewHeldBy",
	}),
	assessmentsAsLevelChecker: many(studentAssessments, {
		relationName: "levelCheckedBy",
	}),
}));

// Student relations
export const studentsRelations = relations(students, ({ many }) => ({
	enrollments: many(enrollments),
	assessments: many(studentAssessments),
	automatedFollowUps: many(automatedFollowUps),
}));

// Product relations
export const productsRelations = relations(products, ({ many }) => ({
	cohorts: many(cohorts),
}));

// Cohort relations
export const cohortsRelations = relations(cohorts, ({ one, many }) => ({
	product: one(products, {
		fields: [cohorts.productId],
		references: [products.id],
	}),
	enrollments: many(enrollments),
	weeklySessions: many(weeklySessions),
	classes: many(classes),
}));

// Enrollment relations
export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
	student: one(students, {
		fields: [enrollments.studentId],
		references: [students.id],
	}),
	cohort: one(cohorts, {
		fields: [enrollments.cohortId],
		references: [cohorts.id],
	}),
}));

// Weekly Sessions relations
export const weeklySessionsRelations = relations(weeklySessions, ({ one }) => ({
	cohort: one(cohorts, {
		fields: [weeklySessions.cohortId],
		references: [cohorts.id],
	}),
	teacher: one(teachers, {
		fields: [weeklySessions.teacherId],
		references: [teachers.id],
	}),
}));

// Classes relations
export const classesRelations = relations(classes, ({ one }) => ({
	cohort: one(cohorts, {
		fields: [classes.cohortId],
		references: [cohorts.id],
	}),
}));

// Student Assessments relations
export const studentAssessmentsRelations = relations(
	studentAssessments,
	({ one }) => ({
		student: one(students, {
			fields: [studentAssessments.studentId],
			references: [students.id],
		}),
		interviewHeldBy: one(teachers, {
			fields: [studentAssessments.interviewHeldBy],
			references: [teachers.id],
			relationName: "interviewHeldBy",
		}),
		levelCheckedBy: one(teachers, {
			fields: [studentAssessments.levelCheckedBy],
			references: [teachers.id],
			relationName: "levelCheckedBy",
		}),
	}),
);

// Template Follow-up Sequences relations
export const templateFollowUpSequencesRelations = relations(
	templateFollowUpSequences,
	({ many }) => ({
		messages: many(templateFollowUpMessages),
		automatedFollowUps: many(automatedFollowUps),
	}),
);

// Template Follow-up Messages relations
export const templateFollowUpMessagesRelations = relations(
	templateFollowUpMessages,
	({ one }) => ({
		sequence: one(templateFollowUpSequences, {
			fields: [templateFollowUpMessages.sequenceId],
			references: [templateFollowUpSequences.id],
		}),
	}),
);

// Automated Follow-ups relations
export const automatedFollowUpsRelations = relations(
	automatedFollowUps,
	({ one }) => ({
		student: one(students, {
			fields: [automatedFollowUps.studentId],
			references: [students.id],
		}),
		sequence: one(templateFollowUpSequences, {
			fields: [automatedFollowUps.sequenceId],
			references: [templateFollowUpSequences.id],
		}),
	}),
);
