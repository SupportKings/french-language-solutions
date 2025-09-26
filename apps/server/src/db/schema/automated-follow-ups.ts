import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { automatedFollowUpStatusEnum } from "./enums";
import { students } from "./students";
import { templateFollowUpSequences } from "./template-follow-up-sequences";

export const automatedFollowUps = pgTable("automated_follow_ups", {
	id: uuid("id").primaryKey().defaultRandom(),
	airtableRecordId: text("airtable_record_id"),
	studentId: uuid("student_id")
		.notNull()
		.references(() => students.id),
	sequenceId: uuid("sequence_id")
		.notNull()
		.references(() => templateFollowUpSequences.id),
	status: automatedFollowUpStatusEnum("status").notNull().default("activated"),
	currentStep: integer("current_step").notNull().default(0),
	startedAt: timestamp("started_at").notNull().defaultNow(),
	lastMessageSentAt: timestamp("last_message_sent_at"),
	completedAt: timestamp("completed_at"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
