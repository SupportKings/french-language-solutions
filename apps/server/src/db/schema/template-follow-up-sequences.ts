import {
	pgTable,
	text,
	timestamp,
	uuid,
	integer,
} from "drizzle-orm/pg-core";

export const templateFollowUpSequences = pgTable("template_follow_up_sequences", {
	id: uuid("id").primaryKey().defaultRandom(),
	displayName: text("display_name").notNull(),
	subject: text("subject").notNull(),
	firstFollowUpDelayMinutes: integer("first_follow_up_delay_minutes").notNull(), // Flexible number field for minutes (30, 60, 1440 for 24 hours, etc.)
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});