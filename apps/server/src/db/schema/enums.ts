import { pgEnum } from "drizzle-orm/pg-core";

// User roles
export const userRoleEnum = pgEnum("user_role", [
	"admin",
	"support",
	"teacher",
	"student",
]);

// Teacher enums
export const groupClassBonusTermsEnum = pgEnum("group_class_bonus_terms", [
	"per_student_per_hour",
	"per_hour",
]);

export const onboardingStatusEnum = pgEnum("onboarding_status", [
	"new",
	"training_in_progress",
	"onboarded",
	"offboarded",
]);

export const contractTypeEnum = pgEnum("contract_type", [
	"full_time",
	"freelancer",
]);

// Student enums
export const initialChannelEnum = pgEnum("initial_channel", [
	"form",
	"quiz",
	"call",
	"message",
	"email",
	"assessment",
]);

export const communicationChannelEnum = pgEnum("communication_channel", [
	"sms_email",
	"email",
	"sms",
]);

// Language levels - can be expanded later
export const languageLevelEnum = pgEnum("language_level", [
	"a1",
	"a1_plus",
	"a2",
	"a2_plus",
	"b1",
	"b1_plus",
	"b2",
	"b2_plus",
	"c1",
	"c1_plus",
	"c2",
]);