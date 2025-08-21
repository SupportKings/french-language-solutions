CREATE TYPE "public"."cohort_format" AS ENUM('group', 'private');--> statement-breakpoint
CREATE TYPE "public"."cohort_status" AS ENUM('enrollment_open', 'enrollment_closed', 'class_ended');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('declined_contract', 'dropped_out', 'interested', 'beginner_form_filled', 'contract_abandoned', 'contract_signed', 'payment_abandoned', 'paid', 'welcome_package_sent');--> statement-breakpoint
CREATE TYPE "public"."product_format" AS ENUM('group', 'private', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."product_location" AS ENUM('online', 'in_person', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('for_one_to_one', 'medium', 'medium_plus', 'large');--> statement-breakpoint
CREATE TABLE "cohorts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"format" "cohort_format" NOT NULL,
	"product_id" uuid,
	"google_drive_folder_id" text,
	"starting_level" "language_level",
	"start_date" date,
	"cohort_status" "cohort_status" DEFAULT 'enrollment_open' NOT NULL,
	"current_level" "language_level",
	"room_type" "room_type",
	"airtable_record_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"cohort_id" uuid NOT NULL,
	"status" "enrollment_status" DEFAULT 'interested' NOT NULL,
	"airtable_record_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text NOT NULL,
	"location" "product_location" NOT NULL,
	"format" "product_format" NOT NULL,
	"signup_link_for_self_checkout" text,
	"pandadoc_contract_template_id" text,
	"airtable_record_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE no action ON UPDATE no action;