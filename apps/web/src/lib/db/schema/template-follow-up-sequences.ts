import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const templateFollowUpSequences = pgTable(
	"template_follow_up_sequences",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		displayName: text("display_name").notNull(),
		subject: text("subject").notNull(),
		firstFollowUpDelayMinutes: integer("first_follow_up_delay_minutes"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
);
