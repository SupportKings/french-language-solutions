CREATE TABLE "language_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(10) NOT NULL,
	"display_name" varchar(50) NOT NULL,
	"level_group" varchar(2) NOT NULL,
	"level_number" integer,
	"sort_order" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "language_levels_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "cohorts" ADD COLUMN "starting_level_id" uuid;--> statement-breakpoint
ALTER TABLE "cohorts" ADD COLUMN "current_level_id" uuid;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "desired_starting_language_level_id" uuid;--> statement-breakpoint
ALTER TABLE "student_assessments" ADD COLUMN "level_id" uuid;--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_starting_level_id_language_levels_id_fk" FOREIGN KEY ("starting_level_id") REFERENCES "public"."language_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_current_level_id_language_levels_id_fk" FOREIGN KEY ("current_level_id") REFERENCES "public"."language_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_desired_starting_language_level_id_language_levels_id_fk" FOREIGN KEY ("desired_starting_language_level_id") REFERENCES "public"."language_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_level_id_language_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."language_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" DROP COLUMN "attendance_date";--> statement-breakpoint
ALTER TABLE "cohorts" DROP COLUMN "format";--> statement-breakpoint
ALTER TABLE "cohorts" DROP COLUMN "starting_level";--> statement-breakpoint
ALTER TABLE "cohorts" DROP COLUMN "current_level";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "desired_starting_language_level";--> statement-breakpoint
ALTER TABLE "student_assessments" DROP COLUMN "level";--> statement-breakpoint
DROP TYPE "public"."cohort_format";--> statement-breakpoint
DROP TYPE "public"."language_level";