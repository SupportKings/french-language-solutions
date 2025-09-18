-- Update created_at with airtable_created_at values where they exist
-- Run these queries in your Supabase SQL editor

-- 1. Update students
UPDATE students 
SET created_at = airtable_created_at::timestamp with time zone
WHERE airtable_created_at IS NOT NULL;

-- 2. Update enrollments  
UPDATE enrollments
SET created_at = airtable_created_at::timestamp with time zone
WHERE airtable_created_at IS NOT NULL;

-- 3. Update student_assessments
UPDATE student_assessments
SET created_at = airtable_created_at::timestamp with time zone
WHERE airtable_created_at IS NOT NULL;

-- 4. Update cohorts
-- Note: cohorts doesn't have airtable_created_at field in the import
-- If you want to use start_date as a proxy for created_at:
UPDATE cohorts
SET created_at = start_date::timestamp with time zone  
WHERE start_date IS NOT NULL;

-- 5. Update weekly_sessions
UPDATE weekly_sessions
SET created_at = airtable_created_at::timestamp with time zone
WHERE airtable_created_at IS NOT NULL;

-- 6. Update touchpoints
UPDATE touchpoints
SET created_at = airtable_created_at::timestamp with time zone
WHERE airtable_created_at IS NOT NULL;

-- Verification queries to check the updates:
SELECT 'students' as table_name, COUNT(*) as updated_count 
FROM students 
WHERE airtable_created_at IS NOT NULL;

SELECT 'enrollments' as table_name, COUNT(*) as updated_count
FROM enrollments
WHERE airtable_created_at IS NOT NULL;

SELECT 'student_assessments' as table_name, COUNT(*) as updated_count
FROM student_assessments
WHERE airtable_created_at IS NOT NULL;

SELECT 'cohorts' as table_name, COUNT(*) as updated_count
FROM cohorts  
WHERE start_date IS NOT NULL;

SELECT 'weekly_sessions' as table_name, COUNT(*) as updated_count
FROM weekly_sessions
WHERE airtable_created_at IS NOT NULL;

SELECT 'touchpoints' as table_name, COUNT(*) as updated_count
FROM touchpoints
WHERE airtable_created_at IS NOT NULL;