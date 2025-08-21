CREATE TYPE "public"."automated_follow_up_status" AS ENUM('activated', 'ongoing', 'answer_received', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."follow_up_message_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TABLE "automated_follow_ups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"sequence_id" uuid NOT NULL,
	"status" "automated_follow_up_status" DEFAULT 'activated' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"last_message_sent_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_follow_up_sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text NOT NULL,
	"subject" text NOT NULL,
	"first_follow_up_delay_minutes" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_follow_up_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence_id" uuid NOT NULL,
	"step_index" integer NOT NULL,
	"status" "follow_up_message_status" DEFAULT 'active' NOT NULL,
	"time_delay_hours" integer NOT NULL,
	"message_content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "automated_follow_ups" ADD CONSTRAINT "automated_follow_ups_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automated_follow_ups" ADD CONSTRAINT "automated_follow_ups_sequence_id_template_follow_up_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."template_follow_up_sequences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_follow_up_messages" ADD CONSTRAINT "template_follow_up_messages_sequence_id_template_follow_up_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."template_follow_up_sequences"("id") ON DELETE no action ON UPDATE no action;