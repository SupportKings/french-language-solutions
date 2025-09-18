-- Comprehensive SQL Script for created_at Updates with Triggers
-- Run these queries in your Supabase SQL editor

-- ========================================
-- PART 1: UPDATE EXISTING DATA
-- ========================================

-- 1. Update students
UPDATE students 
SET created_at = airtable_created_at::timestamp with time zone
WHERE airtable_created_at IS NOT NULL 
  AND created_at != airtable_created_at::timestamp with time zone;

-- 2. Update enrollments  
UPDATE enrollments
SET created_at = airtable_created_at::timestamp with time zone
WHERE airtable_created_at IS NOT NULL
  AND created_at != airtable_created_at::timestamp with time zone;

-- 3. Update student_assessments
UPDATE student_assessments
SET created_at = airtable_created_at::timestamp with time zone
WHERE airtable_created_at IS NOT NULL
  AND created_at != airtable_created_at::timestamp with time zone;

-- 4. Update cohorts
UPDATE cohorts
SET created_at = airtable_created_at::timestamp with time zone
WHERE airtable_created_at IS NOT NULL
  AND created_at != airtable_created_at::timestamp with time zone;

-- 5. Update weekly_sessions
UPDATE weekly_sessions
SET created_at = airtable_created_at::timestamp with time zone
WHERE airtable_created_at IS NOT NULL
  AND created_at != airtable_created_at::timestamp with time zone;

-- 6. Update touchpoints
UPDATE touchpoints
SET created_at = airtable_created_at::timestamp with time zone
WHERE airtable_created_at IS NOT NULL
  AND created_at != airtable_created_at::timestamp with time zone;

-- ========================================
-- PART 2: DROP EXISTING TRIGGERS (SAFE TO RUN EVEN IF THEY DON'T EXIST)
-- ========================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS set_created_at_from_airtable_trigger ON students;
DROP TRIGGER IF EXISTS set_created_at_from_airtable_trigger ON enrollments;
DROP TRIGGER IF EXISTS set_created_at_from_airtable_trigger ON student_assessments;
DROP TRIGGER IF EXISTS set_created_at_from_airtable_trigger ON cohorts;
DROP TRIGGER IF EXISTS set_created_at_from_airtable_trigger ON weekly_sessions;
DROP TRIGGER IF EXISTS set_created_at_from_airtable_trigger ON touchpoints;

-- ========================================
-- PART 3: CREATE TRIGGER FUNCTION (RUN THIS BEFORE CREATING TRIGGERS!)
-- ========================================

-- Create a generic trigger function that sets created_at from airtable_created_at
CREATE OR REPLACE FUNCTION set_created_at_from_airtable()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set if airtable_created_at exists and is not null
  IF NEW.airtable_created_at IS NOT NULL THEN
    NEW.created_at = NEW.airtable_created_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PART 4: CREATE TRIGGERS FOR EACH TABLE
-- ========================================

-- 1. Trigger for students
CREATE TRIGGER set_created_at_from_airtable_trigger
BEFORE INSERT ON students
FOR EACH ROW
WHEN (NEW.airtable_created_at IS NOT NULL)
EXECUTE FUNCTION set_created_at_from_airtable();

-- 2. Trigger for enrollments
CREATE TRIGGER set_created_at_from_airtable_trigger
BEFORE INSERT ON enrollments
FOR EACH ROW
WHEN (NEW.airtable_created_at IS NOT NULL)
EXECUTE FUNCTION set_created_at_from_airtable();

-- 3. Trigger for student_assessments
CREATE TRIGGER set_created_at_from_airtable_trigger
BEFORE INSERT ON student_assessments
FOR EACH ROW
WHEN (NEW.airtable_created_at IS NOT NULL)
EXECUTE FUNCTION set_created_at_from_airtable();

-- 4. Trigger for cohorts
CREATE TRIGGER set_created_at_from_airtable_trigger
BEFORE INSERT ON cohorts
FOR EACH ROW
WHEN (NEW.airtable_created_at IS NOT NULL)
EXECUTE FUNCTION set_created_at_from_airtable();

-- 5. Trigger for weekly_sessions
CREATE TRIGGER set_created_at_from_airtable_trigger
BEFORE INSERT ON weekly_sessions
FOR EACH ROW
WHEN (NEW.airtable_created_at IS NOT NULL)
EXECUTE FUNCTION set_created_at_from_airtable();

-- 6. Trigger for touchpoints
CREATE TRIGGER set_created_at_from_airtable_trigger
BEFORE INSERT ON touchpoints
FOR EACH ROW
WHEN (NEW.airtable_created_at IS NOT NULL)
EXECUTE FUNCTION set_created_at_from_airtable();

-- ========================================
-- PART 5: VERIFICATION QUERIES
-- ========================================

-- Check how many records were updated
WITH update_stats AS (
  SELECT 
    'students' as table_name,
    COUNT(*) FILTER (WHERE airtable_created_at IS NOT NULL) as has_airtable_date,
    COUNT(*) FILTER (WHERE airtable_created_at IS NOT NULL AND created_at = airtable_created_at::timestamp with time zone) as dates_match,
    COUNT(*) as total_records
  FROM students
  
  UNION ALL
  
  SELECT 
    'enrollments',
    COUNT(*) FILTER (WHERE airtable_created_at IS NOT NULL),
    COUNT(*) FILTER (WHERE airtable_created_at IS NOT NULL AND created_at = airtable_created_at::timestamp with time zone),
    COUNT(*)
  FROM enrollments
  
  UNION ALL
  
  SELECT 
    'student_assessments',
    COUNT(*) FILTER (WHERE airtable_created_at IS NOT NULL),
    COUNT(*) FILTER (WHERE airtable_created_at IS NOT NULL AND created_at = airtable_created_at::timestamp with time zone),
    COUNT(*)
  FROM student_assessments
  
  UNION ALL
  
  SELECT 
    'cohorts',
    COUNT(*) FILTER (WHERE airtable_created_at IS NOT NULL),
    COUNT(*) FILTER (WHERE airtable_created_at IS NOT NULL AND created_at = airtable_created_at::timestamp with time zone),
    COUNT(*)
  FROM cohorts
  
  UNION ALL
  
  SELECT 
    'weekly_sessions',
    COUNT(*) FILTER (WHERE airtable_created_at IS NOT NULL),
    COUNT(*) FILTER (WHERE airtable_created_at IS NOT NULL AND created_at = airtable_created_at::timestamp with time zone),
    COUNT(*)
  FROM weekly_sessions
  
  UNION ALL
  
  SELECT 
    'touchpoints',
    COUNT(*) FILTER (WHERE airtable_created_at IS NOT NULL),
    COUNT(*) FILTER (WHERE airtable_created_at IS NOT NULL AND created_at = airtable_created_at::timestamp with time zone),
    COUNT(*)
  FROM touchpoints
)
SELECT 
  table_name,
  has_airtable_date as "Records with Airtable Date",
  dates_match as "Dates Successfully Updated",
  total_records as "Total Records",
  CASE 
    WHEN has_airtable_date > 0 
    THEN ROUND((dates_match::numeric / has_airtable_date) * 100, 2) 
    ELSE 0 
  END as "Update Success %"
FROM update_stats
ORDER BY table_name;

-- ========================================
-- PART 6: LIST ALL TRIGGERS
-- ========================================

-- Show all triggers on these tables
SELECT 
  trigger_schema,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN (
  'students', 
  'enrollments', 
  'student_assessments', 
  'cohorts', 
  'weekly_sessions', 
  'touchpoints'
)
ORDER BY event_object_table, trigger_name;

-- ========================================
-- PART 7: OPTIONAL - DISABLE TRIGGERS
-- ========================================
-- Uncomment these lines if you want to disable the triggers later

-- ALTER TABLE students DISABLE TRIGGER set_created_at_from_airtable_trigger;
-- ALTER TABLE enrollments DISABLE TRIGGER set_created_at_from_airtable_trigger;
-- ALTER TABLE student_assessments DISABLE TRIGGER set_created_at_from_airtable_trigger;
-- ALTER TABLE cohorts DISABLE TRIGGER set_created_at_from_airtable_trigger;
-- ALTER TABLE weekly_sessions DISABLE TRIGGER set_created_at_from_airtable_trigger;
-- ALTER TABLE touchpoints DISABLE TRIGGER set_created_at_from_airtable_trigger;

-- ========================================
-- PART 8: OPTIONAL - DROP TRIGGERS
-- ========================================
-- Uncomment these lines if you want to remove the triggers completely

-- DROP TRIGGER IF EXISTS set_created_at_from_airtable_trigger ON students;
-- DROP TRIGGER IF EXISTS set_created_at_from_airtable_trigger ON enrollments;
-- DROP TRIGGER IF EXISTS set_created_at_from_airtable_trigger ON student_assessments;
-- DROP TRIGGER IF EXISTS set_created_at_from_airtable_trigger ON cohorts;
-- DROP TRIGGER IF EXISTS set_created_at_from_airtable_trigger ON weekly_sessions;
-- DROP TRIGGER IF EXISTS set_created_at_from_airtable_trigger ON touchpoints;
-- DROP FUNCTION IF EXISTS set_created_at_from_airtable();