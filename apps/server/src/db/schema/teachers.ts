import {
	pgTable,
	text,
	timestamp,
	uuid,
	integer,
	boolean,
	varchar,
} from "drizzle-orm/pg-core";
import {
	groupClassBonusTermsEnum,
	onboardingStatusEnum,
	contractTypeEnum,
} from "./enums";

export const teachers = pgTable("teachers", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id"), // Optional - references Better Auth user.id when auth needed
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	groupClassBonusTerms: groupClassBonusTermsEnum("group_class_bonus_terms"),
	onboardingStatus: onboardingStatusEnum("onboarding_status")
		.notNull()
		.default("new"),
	googleCalendarId: text("google_calendar_id"),
	maximumHoursPerWeek: integer("maximum_hours_per_week"),
	maximumHoursPerDay: integer("maximum_hours_per_day"),
	qualifiedForUnder16: boolean("qualified_for_under_16").default(false),
	availableForBooking: boolean("available_for_booking").default(true),
	contractType: contractTypeEnum("contract_type"),
	availableForOnlineClasses: boolean("available_for_online_classes").default(
		true,
	),
	availableForInPersonClasses: boolean(
		"available_for_in_person_classes",
	).default(false),
	mobilePhoneNumber: varchar("mobile_phone_number", { length: 20 }), // E.164 format
	adminNotes: text("admin_notes"),
	airtableRecordId: text("airtable_record_id"), // For migration tracking
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});