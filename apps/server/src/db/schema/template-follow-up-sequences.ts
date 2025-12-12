import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const templateFollowUpSequences = pgTable(
	"template_follow_up_sequences",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		airtableRecordId: text("airtable_record_id"),
		backendName: text("backend_name"),
		displayName: text("display_name").notNull(),
		subject: text("subject").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
);
