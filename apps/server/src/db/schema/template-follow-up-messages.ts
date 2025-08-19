import {
	pgTable,
	text,
	timestamp,
	uuid,
	integer,
} from "drizzle-orm/pg-core";
import {
	followUpMessageStatusEnum,
} from "./enums";
import { templateFollowUpSequences } from "./template-follow-up-sequences";

export const templateFollowUpMessages = pgTable("template_follow_up_messages", {
	id: uuid("id").primaryKey().defaultRandom(),
	sequenceId: uuid("sequence_id")
		.notNull()
		.references(() => templateFollowUpSequences.id),
	stepIndex: integer("step_index").notNull(), // Which step in the sequence (1, 2, 3, etc.)
	status: followUpMessageStatusEnum("status")
		.notNull()
		.default("active"),
	timeDelayHours: integer("time_delay_hours").notNull(), // Hours to wait before sending this message
	messageContent: text("message_content").notNull(), // The actual message template
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});