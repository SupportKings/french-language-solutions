-- Add indexes on created_at columns for efficient sorting (descending)
-- These indexes will improve query performance when sorting by created_at DESC

-- 1. Students table
CREATE INDEX IF NOT EXISTS idx_students_created_at_desc 
ON students(created_at DESC);

-- 2. Enrollments table
CREATE INDEX IF NOT EXISTS idx_enrollments_created_at_desc 
ON enrollments(created_at DESC);

-- 3. Student assessments table
CREATE INDEX IF NOT EXISTS idx_student_assessments_created_at_desc 
ON student_assessments(created_at DESC);

-- 4. Cohorts table
CREATE INDEX IF NOT EXISTS idx_cohorts_created_at_desc 
ON cohorts(created_at DESC);

-- 5. Weekly sessions table
CREATE INDEX IF NOT EXISTS idx_weekly_sessions_created_at_desc 
ON weekly_sessions(created_at DESC);

-- 6. Touchpoints table
CREATE INDEX IF NOT EXISTS idx_touchpoints_created_at_desc 
ON touchpoints(created_at DESC);

-- 7. Classes table (also part of the session management)
CREATE INDEX IF NOT EXISTS idx_classes_created_at_desc 
ON classes(created_at DESC);

-- 8. Automated follow ups (related to touchpoints)
CREATE INDEX IF NOT EXISTS idx_automated_follow_ups_created_at_desc 
ON automated_follow_ups(created_at DESC);

-- Verify all indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%_created_at_desc'
ORDER BY tablename;

-- Sample queries to verify sorting works correctly
-- These queries will use the new indexes for fast sorting

-- Test students sorting
SELECT id, first_name, last_name, created_at 
FROM students 
ORDER BY created_at DESC 
LIMIT 5;

-- Test enrollments sorting
SELECT id, student_id, cohort_id, status, created_at 
FROM enrollments 
ORDER BY created_at DESC 
LIMIT 5;

-- Test student_assessments sorting
SELECT id, student_id, result, created_at 
FROM student_assessments 
ORDER BY created_at DESC 
LIMIT 5;

-- Test cohorts sorting
SELECT id, cohort_status, created_at 
FROM cohorts 
ORDER BY created_at DESC 
LIMIT 5;

-- Test weekly_sessions sorting
SELECT id, cohort_id, day_of_week, created_at 
FROM weekly_sessions 
ORDER BY created_at DESC 
LIMIT 5;

-- Test touchpoints sorting
SELECT id, student_id, type, channel, created_at 
FROM touchpoints 
ORDER BY created_at DESC 
LIMIT 5;