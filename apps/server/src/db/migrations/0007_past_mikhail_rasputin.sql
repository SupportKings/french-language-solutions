CREATE TYPE "public"."class_mode" AS ENUM('online', 'in_person', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."class_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "classes" DROP CONSTRAINT "classes_cohort_id_cohorts_id_fk";
--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "status" "class_status" DEFAULT 'scheduled' NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "mode" "class_mode" DEFAULT 'online' NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "meeting_link" text;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "materials" text;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "max_students" integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "current_enrollment" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "teacher_id" uuid;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_cohort_id_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohorts"("id") ON DELETE cascade ON UPDATE no action;