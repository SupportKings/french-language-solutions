import {
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import {
	automatedFollowUpStatusEnum,
} from "./enums";
import { students } from "./students";
import { templateFollowUpSequences } from "./template-follow-up-sequences";

export const automatedFollowUps = pgTable("automated_follow_ups", {
	id: uuid("id").primaryKey().defaultRandom(),
	studentId: uuid("student_id")
		.notNull()
		.references(() => students.id),
	sequenceId: uuid("sequence_id")
		.notNull()
		.references(() => templateFollowUpSequences.id),
	status: automatedFollowUpStatusEnum("status")
		.notNull()
		.default("activated"),
	startedAt: timestamp("started_at").notNull().defaultNow(), // When the follow-up was initiated
	lastMessageSentAt: timestamp("last_message_sent_at"), // Track when the last message was sent
	completedAt: timestamp("completed_at"), // When the sequence was completed or stopped
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});