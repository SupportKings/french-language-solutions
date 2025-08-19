CREATE TYPE "public"."assessment_result" AS ENUM('requested', 'scheduled', 'session_held', 'level_determined');--> statement-breakpoint
CREATE TABLE "student_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"level" "language_level",
	"scheduled_for" date,
	"is_paid" boolean DEFAULT false NOT NULL,
	"result" "assessment_result" DEFAULT 'requested' NOT NULL,
	"notes" text,
	"interview_held_by" uuid,
	"level_checked_by" uuid,
	"meeting_recording_url" text,
	"calendar_event_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_interview_held_by_teachers_id_fk" FOREIGN KEY ("interview_held_by") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_assessments" ADD CONSTRAINT "student_assessments_level_checked_by_teachers_id_fk" FOREIGN KEY ("level_checked_by") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;