import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import {
	contractTypeEnum,
	dayOfWeekEnum,
	groupClassBonusTermsEnum,
	onboardingStatusEnum,
	teamRolesEnum,
} from "./enums";

export const teachers = pgTable("teachers", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id"),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	role: teamRolesEnum("role").array(),
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
	maxStudentsInPerson: integer("max_students_in_person"),
	maxStudentsOnline: integer("max_students_online"),
	daysAvailableOnline: dayOfWeekEnum("days_available_online").array(),
	daysAvailableInPerson: dayOfWeekEnum("days_available_in_person").array(),
	mobilePhoneNumber: varchar("mobile_phone_number", { length: 20 }),
	adminNotes: text("admin_notes"),
	airtableRecordId: text("airtable_record_id"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
