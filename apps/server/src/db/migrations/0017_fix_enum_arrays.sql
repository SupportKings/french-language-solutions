-- Drop the JSON columns completely
ALTER TABLE "teachers" DROP COLUMN IF EXISTS "days_available_online";--> statement-breakpoint
ALTER TABLE "teachers" DROP COLUMN IF EXISTS "days_available_in_person";--> statement-breakpoint

-- Add them back as proper enum arrays
ALTER TABLE "teachers" ADD COLUMN "days_available_online" "public"."day_of_week"[];--> statement-breakpoint
ALTER TABLE "teachers" ADD COLUMN "days_available_in_person" "public"."day_of_week"[];