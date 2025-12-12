import {
	boolean,
	date,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { cohortStatusEnum, roomTypeEnum } from "./enums";
import { languageLevels } from "./language-levels";
import { products } from "./products";

export const cohorts = pgTable("cohorts", {
	id: uuid("id").primaryKey().defaultRandom(),
	productId: uuid("product_id").references(() => products.id),
	googleDriveFolderId: text("google_drive_folder_id"),
	startingLevelId: uuid("starting_level_id").references(
		() => languageLevels.id,
		{ onDelete: "set null" },
	),
	startDate: date("start_date"),
	cohortStatus: cohortStatusEnum("cohort_status")
		.notNull()
		.default("enrollment_open"),
	currentLevelId: uuid("current_level_id").references(() => languageLevels.id, {
		onDelete: "set null",
	}),
	roomType: roomTypeEnum("room_type"),
	maxStudents: integer("max_students").default(10),
	setupFinalized: boolean("setup_finalized").default(false),
	airtableRecordId: text("airtable_record_id"), // For migration tracking
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
