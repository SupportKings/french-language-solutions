-- Add new columns to cohorts table
ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 10;
ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS setup_finalized BOOLEAN DEFAULT FALSE;

-- Remove unnecessary columns from classes table
ALTER TABLE classes DROP COLUMN IF EXISTS max_students;
ALTER TABLE classes DROP COLUMN IF EXISTS is_active;
ALTER TABLE classes DROP COLUMN IF EXISTS materials;
ALTER TABLE classes DROP COLUMN IF EXISTS mode;