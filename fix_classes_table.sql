-- This SQL script will fix the classes table schema
-- Run this directly in Supabase SQL Editor if the migration didn't work

-- 1. First, check what columns exist in the classes table
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'classes';

-- 2. Remove unnecessary columns from classes table
ALTER TABLE "classes" DROP COLUMN IF EXISTS "room" CASCADE;
ALTER TABLE "classes" DROP COLUMN IF EXISTS "mode" CASCADE;
ALTER TABLE "classes" DROP COLUMN IF EXISTS "name" CASCADE;
ALTER TABLE "classes" DROP COLUMN IF EXISTS "description" CASCADE;
ALTER TABLE "classes" DROP COLUMN IF EXISTS "materials" CASCADE;
ALTER TABLE "classes" DROP COLUMN IF EXISTS "max_students" CASCADE;
ALTER TABLE "classes" DROP COLUMN IF EXISTS "is_active" CASCADE;

-- 3. Add foreign key constraint for teacher_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'classes_teacher_id_teachers_id_fk'
        AND table_name = 'classes'
    ) THEN
        ALTER TABLE "classes" 
        ADD CONSTRAINT "classes_teacher_id_teachers_id_fk" 
        FOREIGN KEY ("teacher_id") 
        REFERENCES "public"."teachers"("id") 
        ON DELETE SET NULL 
        ON UPDATE NO ACTION;
    END IF;
END $$;

-- 4. Verify the changes
-- After running this, check that the columns are removed:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'classes';

-- Expected remaining columns should be:
-- id, cohort_id, start_time, end_time, status, 
-- google_calendar_event_id, meeting_link, google_drive_folder_id,
-- current_enrollment, teacher_id, notes, created_at, updated_at, deleted_at