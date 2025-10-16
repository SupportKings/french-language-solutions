-- Drop the old trigger first
DROP TRIGGER IF EXISTS trg_update_enrollment_completion ON public.enrollments;

-- Update the function to calculate percentage based on required items only
-- and to check the appropriate checklist based on status
CREATE OR REPLACE FUNCTION update_enrollment_completion()
RETURNS TRIGGER AS $$
DECLARE
  checklist_to_use jsonb;
  total_required integer := 0;
  completed_required integer := 0;
  item_key text;
  item_value jsonb;
  status_changed boolean := false;
BEGIN
  -- Check if this is an update and if the status changed
  IF TG_OP = 'UPDATE' THEN
    status_changed := (OLD.status IS DISTINCT FROM NEW.status);
  END IF;

  -- Determine which checklist to use based on NEW status
  IF NEW.status = 'transitioning' THEN
    checklist_to_use := NEW.transition_checklist;
  ELSIF NEW.status = 'offboarding' THEN
    checklist_to_use := NEW.offboarding_checklist;
  ELSE
    checklist_to_use := NEW.enrollment_checklist;
  END IF;

  -- If status changed, the checklists should have been reset by the application
  -- But we still recalculate to ensure consistency

  -- Return early if checklist is null or empty
  IF checklist_to_use IS NULL OR checklist_to_use = '{}'::jsonb THEN
    NEW.completion_percentage := 0;
    RETURN NEW;
  END IF;

  -- Iterate through all items in the checklist
  FOR item_key, item_value IN SELECT * FROM jsonb_each(checklist_to_use)
  LOOP
    -- Skip if item_value is not a valid object
    IF item_value IS NULL OR jsonb_typeof(item_value) != 'object' THEN
      CONTINUE;
    END IF;

    -- Check if 'required' field exists and is true
    IF (item_value ? 'required') AND (item_value->>'required')::boolean = true THEN
      total_required := total_required + 1;

      -- Check if this required item is completed
      IF (item_value ? 'completed') AND (item_value->>'completed')::boolean = true THEN
        completed_required := completed_required + 1;
      END IF;
    END IF;
  END LOOP;

  -- Calculate percentage (avoid division by zero)
  IF total_required = 0 THEN
    NEW.completion_percentage := 100; -- If no required items, consider it 100% complete
  ELSE
    NEW.completion_percentage := ROUND((completed_required::numeric / total_required::numeric) * 100);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the updated trigger to fire on all checklist changes and status changes
CREATE TRIGGER trg_update_enrollment_completion
  BEFORE INSERT OR UPDATE OF status, enrollment_checklist, transition_checklist, offboarding_checklist
  ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollment_completion();

-- Backfill existing enrollments with correct completion percentage
UPDATE public.enrollments
SET updated_at = updated_at; -- Trigger the update to recalculate percentages
