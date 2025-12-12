ALTER TABLE "cohorts" DROP CONSTRAINT "cohorts_starting_level_id_language_levels_id_fk";
--> statement-breakpoint
ALTER TABLE "cohorts" DROP CONSTRAINT "cohorts_current_level_id_language_levels_id_fk";
--> statement-breakpoint
ALTER TABLE "student_assessments" DROP CONSTRAINT "student_assessments_level_id_language_levels_id_fk";
--> statement-breakpoint
ALTER TABLE "students" DROP CONSTRAINT "students_desired_starting_language_level_id_language_levels_id_fk";
--> statement-breakpoint
ALTER TABLE "teachers" ALTER COLUMN "days_available_online" SET DATA TYPE "public"."day_of_week"[] USING "days_available_online"::"public"."day_of_week"[];--> statement-breakpoint
ALTER TABLE "teachers" ALTER COLUMN "days_available_in_person" SET DATA TYPE "public"."day_of_week"[] USING "days_available_in_person"::"public"."day_of_week"[];--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_starting_level_id_language_levels_id_fk" FOREIGN KEY ("starting_level_id") REFERENCES "public"."language_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_current_level_id_language_levels_id_fk" FOREIGN KEY ("current_level_id") REFERENCES "public"."language_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_level_id_language_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."language_levels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_desired_starting_language_level_id_language_levels_id_fk" FOREIGN KEY ("desired_starting_language_level_id") REFERENCES "public"."language_levels"("id") ON DELETE set null ON UPDATE no action;