CREATE TYPE "public"."touchpoint_channel" AS ENUM('sms', 'call', 'whatsapp', 'email');--> statement-breakpoint
CREATE TYPE "public"."touchpoint_source" AS ENUM('manual', 'automated', 'openphone', 'gmail', 'whatsapp_business', 'webhook');--> statement-breakpoint
CREATE TYPE "public"."touchpoint_type" AS ENUM('inbound', 'outbound');--> statement-breakpoint
CREATE TABLE "touchpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"channel" "touchpoint_channel" NOT NULL,
	"type" "touchpoint_type" NOT NULL,
	"message" text NOT NULL,
	"source" "touchpoint_source" DEFAULT 'manual' NOT NULL,
	"automated_follow_up_id" uuid,
	"external_id" text,
	"external_metadata" text,
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "touchpoints" ADD CONSTRAINT "touchpoints_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "touchpoints" ADD CONSTRAINT "touchpoints_automated_follow_up_id_automated_follow_ups_id_fk" FOREIGN KEY ("automated_follow_up_id") REFERENCES "public"."automated_follow_ups"("id") ON DELETE no action ON UPDATE no action;