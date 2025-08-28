-- Create language_levels table
CREATE TABLE IF NOT EXISTS "language_levels" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" VARCHAR(10) UNIQUE NOT NULL,
  "display_name" VARCHAR(50) NOT NULL,
  "level_group" VARCHAR(2) NOT NULL,
  "level_number" INTEGER,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Seed all 73 language levels (1 for A0 + 12 each for A1, A2, B1, B2, C1, C2)
INSERT INTO "language_levels" ("code", "display_name", "level_group", "level_number") VALUES
-- A0
('a0', 'A0 - Complete Beginner', 'a0', NULL),
-- A1 levels (1-12)
('a1.1', 'A1.1', 'a1', 1),
('a1.2', 'A1.2', 'a1', 2),
('a1.3', 'A1.3', 'a1', 3),
('a1.4', 'A1.4', 'a1', 4),
('a1.5', 'A1.5', 'a1', 5),
('a1.6', 'A1.6', 'a1', 6),
('a1.7', 'A1.7', 'a1', 7),
('a1.8', 'A1.8', 'a1', 8),
('a1.9', 'A1.9', 'a1', 9),
('a1.10', 'A1.10', 'a1', 10),
('a1.11', 'A1.11', 'a1', 11),
('a1.12', 'A1.12', 'a1', 12),
-- A2 levels (13-24)
('a2.1', 'A2.1', 'a2', 1),
('a2.2', 'A2.2', 'a2', 2),
('a2.3', 'A2.3', 'a2', 3),
('a2.4', 'A2.4', 'a2', 4),
('a2.5', 'A2.5', 'a2', 5),
('a2.6', 'A2.6', 'a2', 6),
('a2.7', 'A2.7', 'a2', 7),
('a2.8', 'A2.8', 'a2', 8),
('a2.9', 'A2.9', 'a2', 9),
('a2.10', 'A2.10', 'a2', 10),
('a2.11', 'A2.11', 'a2', 11),
('a2.12', 'A2.12', 'a2', 12),
-- B1 levels (25-36)
('b1.1', 'B1.1', 'b1', 1),
('b1.2', 'B1.2', 'b1', 2),
('b1.3', 'B1.3', 'b1', 3),
('b1.4', 'B1.4', 'b1', 4),
('b1.5', 'B1.5', 'b1', 5),
('b1.6', 'B1.6', 'b1', 6),
('b1.7', 'B1.7', 'b1', 7),
('b1.8', 'B1.8', 'b1', 8),
('b1.9', 'B1.9', 'b1', 9),
('b1.10', 'B1.10', 'b1', 10),
('b1.11', 'B1.11', 'b1', 11),
('b1.12', 'B1.12', 'b1', 12),
-- B2 levels (37-48)
('b2.1', 'B2.1', 'b2', 1),
('b2.2', 'B2.2', 'b2', 2),
('b2.3', 'B2.3', 'b2', 3),
('b2.4', 'B2.4', 'b2', 4),
('b2.5', 'B2.5', 'b2', 5),
('b2.6', 'B2.6', 'b2', 6),
('b2.7', 'B2.7', 'b2', 7),
('b2.8', 'B2.8', 'b2', 8),
('b2.9', 'B2.9', 'b2', 9),
('b2.10', 'B2.10', 'b2', 10),
('b2.11', 'B2.11', 'b2', 11),
('b2.12', 'B2.12', 'b2', 12),
-- C1 levels (49-60)
('c1.1', 'C1.1', 'c1', 1),
('c1.2', 'C1.2', 'c1', 2),
('c1.3', 'C1.3', 'c1', 3),
('c1.4', 'C1.4', 'c1', 4),
('c1.5', 'C1.5', 'c1', 5),
('c1.6', 'C1.6', 'c1', 6),
('c1.7', 'C1.7', 'c1', 7),
('c1.8', 'C1.8', 'c1', 8),
('c1.9', 'C1.9', 'c1', 9),
('c1.10', 'C1.10', 'c1', 10),
('c1.11', 'C1.11', 'c1', 11),
('c1.12', 'C1.12', 'c1', 12),
-- C2 levels (61-72)
('c2.1', 'C2.1', 'c2', 1),
('c2.2', 'C2.2', 'c2', 2),
('c2.3', 'C2.3', 'c2', 3),
('c2.4', 'C2.4', 'c2', 4),
('c2.5', 'C2.5', 'c2', 5),
('c2.6', 'C2.6', 'c2', 6),
('c2.7', 'C2.7', 'c2', 7),
('c2.8', 'C2.8', 'c2', 8),
('c2.9', 'C2.9', 'c2', 9),
('c2.10', 'C2.10', 'c2', 10),
('c2.11', 'C2.11', 'c2', 11),
('c2.12', 'C2.12', 'c2', 12);

-- Add new foreign key columns
ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "desired_starting_language_level_id" UUID REFERENCES "language_levels"("id");
ALTER TABLE "cohorts" ADD COLUMN IF NOT EXISTS "starting_level_id" UUID REFERENCES "language_levels"("id");
ALTER TABLE "cohorts" ADD COLUMN IF NOT EXISTS "current_level_id" UUID REFERENCES "language_levels"("id");
ALTER TABLE "student_assessments" ADD COLUMN IF NOT EXISTS "level_id" UUID REFERENCES "language_levels"("id");

-- Migrate existing data with proper mapping
-- Map old enum values to new language level IDs
UPDATE "students" SET "desired_starting_language_level_id" = (
  SELECT "id" FROM "language_levels" WHERE "code" = 
    CASE 
      WHEN "desired_starting_language_level" = 'a1' THEN 'a1.1'
      WHEN "desired_starting_language_level" = 'a1_plus' THEN 'a1.6'
      WHEN "desired_starting_language_level" = 'a2' THEN 'a2.1'
      WHEN "desired_starting_language_level" = 'a2_plus' THEN 'a2.6'
      WHEN "desired_starting_language_level" = 'b1' THEN 'b1.1'
      WHEN "desired_starting_language_level" = 'b1_plus' THEN 'b1.6'
      WHEN "desired_starting_language_level" = 'b2' THEN 'b2.1'
      WHEN "desired_starting_language_level" = 'b2_plus' THEN 'b2.6'
      WHEN "desired_starting_language_level" = 'c1' THEN 'c1.1'
      WHEN "desired_starting_language_level" = 'c1_plus' THEN 'c1.6'
      WHEN "desired_starting_language_level" = 'c2' THEN 'c2.1'
    END
) WHERE "desired_starting_language_level" IS NOT NULL;

UPDATE "cohorts" SET "starting_level_id" = (
  SELECT "id" FROM "language_levels" WHERE "code" = 
    CASE 
      WHEN "starting_level" = 'a1' THEN 'a1.1'
      WHEN "starting_level" = 'a1_plus' THEN 'a1.6'
      WHEN "starting_level" = 'a2' THEN 'a2.1'
      WHEN "starting_level" = 'a2_plus' THEN 'a2.6'
      WHEN "starting_level" = 'b1' THEN 'b1.1'
      WHEN "starting_level" = 'b1_plus' THEN 'b1.6'
      WHEN "starting_level" = 'b2' THEN 'b2.1'
      WHEN "starting_level" = 'b2_plus' THEN 'b2.6'
      WHEN "starting_level" = 'c1' THEN 'c1.1'
      WHEN "starting_level" = 'c1_plus' THEN 'c1.6'
      WHEN "starting_level" = 'c2' THEN 'c2.1'
    END
) WHERE "starting_level" IS NOT NULL;

UPDATE "cohorts" SET "current_level_id" = (
  SELECT "id" FROM "language_levels" WHERE "code" = 
    CASE 
      WHEN "current_level" = 'a1' THEN 'a1.1'
      WHEN "current_level" = 'a1_plus' THEN 'a1.6'
      WHEN "current_level" = 'a2' THEN 'a2.1'
      WHEN "current_level" = 'a2_plus' THEN 'a2.6'
      WHEN "current_level" = 'b1' THEN 'b1.1'
      WHEN "current_level" = 'b1_plus' THEN 'b1.6'
      WHEN "current_level" = 'b2' THEN 'b2.1'
      WHEN "current_level" = 'b2_plus' THEN 'b2.6'
      WHEN "current_level" = 'c1' THEN 'c1.1'
      WHEN "current_level" = 'c1_plus' THEN 'c1.6'
      WHEN "current_level" = 'c2' THEN 'c2.1'
    END
) WHERE "current_level" IS NOT NULL;

UPDATE "student_assessments" SET "level_id" = (
  SELECT "id" FROM "language_levels" WHERE "code" = 
    CASE 
      WHEN "level" = 'a1' THEN 'a1.1'
      WHEN "level" = 'a1_plus' THEN 'a1.6'
      WHEN "level" = 'a2' THEN 'a2.1'
      WHEN "level" = 'a2_plus' THEN 'a2.6'
      WHEN "level" = 'b1' THEN 'b1.1'
      WHEN "level" = 'b1_plus' THEN 'b1.6'
      WHEN "level" = 'b2' THEN 'b2.1'
      WHEN "level" = 'b2_plus' THEN 'b2.6'
      WHEN "level" = 'c1' THEN 'c1.1'
      WHEN "level" = 'c1_plus' THEN 'c1.6'
      WHEN "level" = 'c2' THEN 'c2.1'
    END
) WHERE "level" IS NOT NULL;

-- Drop old columns
ALTER TABLE "students" DROP COLUMN IF EXISTS "desired_starting_language_level";
ALTER TABLE "cohorts" DROP COLUMN IF EXISTS "starting_level";
ALTER TABLE "cohorts" DROP COLUMN IF EXISTS "current_level";
ALTER TABLE "cohorts" DROP COLUMN IF EXISTS "format";
ALTER TABLE "student_assessments" DROP COLUMN IF EXISTS "level";
ALTER TABLE "attendance_records" DROP COLUMN IF EXISTS "attendance_date";

-- Drop unused enums (this will fail if still in use, which is expected)
DO $$ 
BEGIN
    DROP TYPE IF EXISTS "language_level";
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
    DROP TYPE IF EXISTS "cohort_format";
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;