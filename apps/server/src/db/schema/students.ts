import {
	pgTable,
	text,
	timestamp,
	uuid,
	boolean,
	varchar,
	date,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
	initialChannelEnum,
	communicationChannelEnum,
} from "./enums";
import { languageLevels } from "./language-levels";

export const students = pgTable("students", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id"), // Optional - references Better Auth user.id when auth needed
	fullName: text("full_name").notNull(),
	// Generated columns for first and last name
	firstName: text("first_name").generatedAlwaysAs(
		sql`SPLIT_PART(full_name, ' ', 1)`,
	),
	lastName: text("last_name").generatedAlwaysAs(
		sql`CASE 
			WHEN POSITION(' ' IN full_name) > 0 
			THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
			ELSE ''
		END`,
	),
	email: text("email"), // Separate from auth email - students might not have auth
	desiredStartingLanguageLevelId: uuid("desired_starting_language_level_id")
		.references(() => languageLevels.id),
	mobilePhoneNumber: varchar("mobile_phone_number", { length: 20 }), // E.164 format
	city: text("city"),
	websiteQuizSubmissionDate: date("website_quiz_submission_date"),
	addedToEmailNewsletter: boolean("added_to_email_newsletter").default(false),
	initialChannel: initialChannelEnum("initial_channel"),
	convertkitId: text("convertkit_id"),
	openphoneContactId: text("openphone_contact_id"),
	tallyFormSubmissionId: text("tally_form_submission_id"),
	respondentId: text("respondent_id"),
	stripeCustomerId: text("stripe_customer_id"),
	isUnder16: boolean("is_under_16").default(false),
	communicationChannel: communicationChannelEnum("communication_channel")
		.notNull()
		.default("sms_email"),
	isFullBeginner: boolean("is_full_beginner").default(false),
	subjectiveDeadlineForStudent: date("subjective_deadline_for_student"),
	purposeToLearn: text("purpose_to_learn"),
	airtableRecordId: text("airtable_record_id"), // For migration tracking
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	deletedAt: timestamp("deleted_at"), // Soft delete
});