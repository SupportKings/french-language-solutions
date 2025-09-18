-- Create trigger function that sets created_at from airtable_created_at
CREATE OR REPLACE FUNCTION set_created_at_from_airtable()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.airtable_created_at IS NOT NULL THEN
    NEW.created_at = NEW.airtable_created_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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