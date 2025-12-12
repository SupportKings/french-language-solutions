import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { followUpMessageStatusEnum } from "./enums";
import { templateFollowUpSequences } from "./template-follow-up-sequences";

export const templateFollowUpMessages = pgTable("template_follow_up_messages", {
	id: uuid("id").primaryKey().defaultRandom(),
	airtableRecordId: text("airtable_record_id"),
	sequenceId: uuid("sequence_id")
		.notNull()
		.references(() => templateFollowUpSequences.id),
	stepIndex: integer("step_index").notNull(),
	status: followUpMessageStatusEnum("status").notNull().default("active"),
	timeDelayHours: integer("time_delay_hours").notNull(),
	messageContent: text("message_content").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
