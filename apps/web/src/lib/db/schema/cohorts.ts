import {
	pgTable,
	text,
	timestamp,
	uuid,
	date,
} from "drizzle-orm/pg-core";
import {
	cohortFormatEnum,
	cohortStatusEnum,
	roomTypeEnum,
	languageLevelEnum,
} from "./enums";
import { products } from "./products";

export const cohorts = pgTable("cohorts", {
	id: uuid("id").primaryKey().defaultRandom(),
	format: cohortFormatEnum("format").notNull(),
	productId: uuid("product_id").references(() => products.id),
	googleDriveFolderId: text("google_drive_folder_id"),
	startingLevel: languageLevelEnum("starting_level"),
	startDate: date("start_date"),
	cohortStatus: cohortStatusEnum("cohort_status")
		.notNull()
		.default("enrollment_open"),
	currentLevel: languageLevelEnum("current_level"),
	roomType: roomTypeEnum("room_type"),
	airtableRecordId: text("airtable_record_id"), // For migration tracking
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});