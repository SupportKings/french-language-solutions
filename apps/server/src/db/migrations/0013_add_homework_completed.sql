-- Add homework_completed field to attendance_records table
ALTER TABLE "attendance_records" 
ADD COLUMN "homework_completed" boolean DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS "idx_attendance_homework" 
ON "attendance_records" ("homework_completed");

-- Update existing records to have false as default
UPDATE "attendance_records" 
SET "homework_completed" = false 
WHERE "homework_completed" IS NULL;