import {
	pgTable,
	text,
	timestamp,
	uuid,
	integer,
	boolean,
	varchar,
} from "drizzle-orm/pg-core";

export const languageLevels = pgTable("language_levels", {
	id: uuid("id").primaryKey().defaultRandom(),
	code: varchar("code", { length: 10 }).unique().notNull(), // e.g., 'a0', 'a1.1', 'b2.12'
	displayName: varchar("display_name", { length: 50 }).notNull(), // e.g., 'A0 - Complete Beginner', 'A1.1'
	levelGroup: varchar("level_group", { length: 2 }).notNull(), // 'a0', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});