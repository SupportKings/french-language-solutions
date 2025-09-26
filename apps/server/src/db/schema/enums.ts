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

// Cohort enums

export const cohortStatusEnum = pgEnum("cohort_status", [
	"enrollment_open",
	"enrollment_closed",
	"class_ended",
]);

export const roomTypeEnum = pgEnum("room_type", [
	"for_one_to_one",
	"medium",
	"medium_plus",
	"large",
]);

// Enrollment status
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
	"declined_contract",
	"dropped_out",
	"interested",
	"beginner_form_filled",
	"contract_abandoned",
	"contract_signed",
	"payment_abandoned",
	"paid",
	"welcome_package_sent",
]);

// Assessment result status
export const assessmentResultEnum = pgEnum("assessment_result", [
	"requested",
	"scheduled",
	"session_held",
	"level_determined",
]);

// Day of week enum
export const dayOfWeekEnum = pgEnum("day_of_week", [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
]);

// Follow-up message status
export const followUpMessageStatusEnum = pgEnum("follow_up_message_status", [
	"active",
	"disabled",
]);

// Automated follow-up status
export const automatedFollowUpStatusEnum = pgEnum(
	"automated_follow_up_status",
	["activated", "ongoing", "answer_received", "disabled", "completed"],
);

// Team roles enum
export const teamRolesEnum = pgEnum("team_roles", [
	"Teacher",
	"Evaluator",
	"Marketing/Admin",
	"Exec",
]);

// Touchpoint enums
export const touchpointChannelEnum = pgEnum("touchpoint_channel", [
	"sms",
	"call",
	"whatsapp",
	"email",
]);

export const touchpointTypeEnum = pgEnum("touchpoint_type", [
	"inbound",
	"outbound",
]);

export const touchpointSourceEnum = pgEnum("touchpoint_source", [
	"manual",
	"automated",
	"openphone",
	"gmail",
	"whatsapp_business",
	"webhook",
]);

// Product enums
export const productFormatEnum = pgEnum("product_format", [
	"group",
	"private",
	"hybrid",
]);

export const productLocationEnum = pgEnum("product_location", [
	"online",
	"in_person",
	"hybrid",
]);

// Class enums
export const classStatusEnum = pgEnum("class_status", [
	"scheduled",
	"in_progress",
	"completed",
	"cancelled",
]);

export const classModeEnum = pgEnum("class_mode", [
	"online",
	"in_person",
	"hybrid",
]);
