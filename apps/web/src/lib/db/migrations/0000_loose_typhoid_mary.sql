CREATE TYPE "public"."communication_channel" AS ENUM('sms_email', 'email', 'sms');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('full_time', 'freelancer');--> statement-breakpoint
CREATE TYPE "public"."group_class_bonus_terms" AS ENUM('per_student_per_hour', 'per_hour');--> statement-breakpoint
CREATE TYPE "public"."initial_channel" AS ENUM('form', 'quiz', 'call', 'message', 'email', 'assessment');--> statement-breakpoint
CREATE TYPE "public"."language_level" AS ENUM('a1', 'a1_plus', 'a2', 'a2_plus', 'b1', 'b1_plus', 'b2', 'b2_plus', 'c1', 'c1_plus', 'c2');--> statement-breakpoint
CREATE TYPE "public"."onboarding_status" AS ENUM('new', 'training_in_progress', 'onboarded', 'offboarded');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'support', 'teacher', 'student');--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"group_class_bonus_terms" "group_class_bonus_terms",
	"onboarding_status" "onboarding_status" DEFAULT 'new' NOT NULL,
	"google_calendar_id" text,
	"maximum_hours_per_week" integer,
	"maximum_hours_per_day" integer,
	"qualified_for_under_16" boolean DEFAULT false,
	"available_for_booking" boolean DEFAULT true,
	"contract_type" "contract_type",
	"available_for_online_classes" boolean DEFAULT true,
	"available_for_in_person_classes" boolean DEFAULT false,
	"mobile_phone_number" varchar(20),
	"admin_notes" text,
	"airtable_record_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"full_name" text NOT NULL,
	"first_name" text GENERATED ALWAYS AS (SPLIT_PART(full_name, ' ', 1)) STORED,
	"last_name" text GENERATED ALWAYS AS (CASE 
			WHEN POSITION(' ' IN full_name) > 0 
			THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
			ELSE ''
		END) STORED,
	"email" text,
	"desired_starting_language_level" "language_level",
	"mobile_phone_number" varchar(20),
	"city" text,
	"website_quiz_submission_date" date,
	"added_to_email_newsletter" boolean DEFAULT false,
	"initial_channel" "initial_channel",
	"convertkit_id" text,
	"openphone_contact_id" text,
	"tally_form_submission_id" text,
	"respondent_id" text,
	"stripe_customer_id" text,
	"is_under_16" boolean DEFAULT false,
	"communication_channel" "communication_channel" DEFAULT 'sms_email' NOT NULL,
	"is_full_beginner" boolean DEFAULT false,
	"subjective_deadline_for_student" date,
	"purpose_to_learn" text,
	"airtable_record_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
