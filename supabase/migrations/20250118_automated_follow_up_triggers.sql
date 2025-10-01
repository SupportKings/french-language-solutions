-- First, we need to ensure current_step column exists (if not already)
ALTER TABLE automated_follow_ups 
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;

-- Create function to call backend endpoint for sending follow-up messages
CREATE OR REPLACE FUNCTION trigger_send_follow_up_message()
RETURNS void AS $$
DECLARE
  backend_url TEXT;
  auth_token TEXT;
BEGIN
  -- Get backend URL from environment or use default
  backend_url := current_setting('app.backend_url', true);
  IF backend_url IS NULL THEN
    backend_url := 'https://your-backend-url.com'; -- Replace with actual backend URL
  END IF;
  
  -- Get auth token if needed
  auth_token := current_setting('app.backend_auth_token', true);
  
  -- Make HTTP request to backend
  PERFORM net.http_post(
    url := backend_url || '/api/follow-ups/send-next-message',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(auth_token, '')
    ),
    body := jsonb_build_object(
      'follow_up_id', NEW.id,
      'student_id', NEW.student_id,
      'sequence_id', NEW.sequence_id,
      'current_step', NEW.current_step,
      'status', NEW.status
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if it's time to send the first message
CREATE OR REPLACE FUNCTION check_first_message_schedule()
RETURNS TRIGGER AS $$
DECLARE
  first_message RECORD;
  time_to_send BOOLEAN;
BEGIN
  -- Only process if status is 'activated' and no message has been sent yet
  IF NEW.status = 'activated' AND NEW.last_message_sent_at IS NULL THEN
    -- Get the first template message (step_index = 1)
    SELECT * INTO first_message
    FROM template_follow_up_messages
    WHERE sequence_id = NEW.sequence_id
      AND step_index = 1
      AND status = 'active'
    LIMIT 1;
    
    IF first_message IS NOT NULL THEN
      -- Check if it's time to send (created_at + delay hours)
      time_to_send := NOW() >= (NEW.created_at + (first_message.time_delay_hours || ' hours')::INTERVAL);
      
      IF time_to_send THEN
        -- Trigger the backend to send the message
        PERFORM trigger_send_follow_up_message();
      ELSE
        -- Schedule a job to send the message later
        PERFORM cron.schedule(
          'send_first_message_' || NEW.id,
          -- Run at the scheduled time
          to_char(NEW.created_at + (first_message.time_delay_hours || ' hours')::INTERVAL, 'MI HH DD MM *'),
          $$SELECT trigger_send_follow_up_message_by_id('$$ || NEW.id || $$')$$
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check and schedule the next message
CREATE OR REPLACE FUNCTION check_next_message_schedule()
RETURNS TRIGGER AS $$
DECLARE
  next_message RECORD;
  schedule_time TIMESTAMP;
BEGIN
  -- Only process if status is 'ongoing' and current_step has changed
  IF NEW.status = 'ongoing' AND NEW.current_step != OLD.current_step THEN
    -- Get the next template message
    SELECT * INTO next_message
    FROM template_follow_up_messages
    WHERE sequence_id = NEW.sequence_id
      AND step_index = NEW.current_step
      AND status = 'active'
    LIMIT 1;
    
    IF next_message IS NOT NULL THEN
      -- Calculate when to send the next message
      schedule_time := NOW() + (next_message.time_delay_hours || ' hours')::INTERVAL;
      
      -- Schedule a cron job for this specific follow-up
      PERFORM cron.schedule(
        'send_message_' || NEW.id || '_step_' || NEW.current_step,
        to_char(schedule_time, 'MI HH DD MM *'),
        $$SELECT trigger_send_follow_up_message_by_id('$$ || NEW.id || $$')$$
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function to trigger message sending for a specific follow-up
CREATE OR REPLACE FUNCTION trigger_send_follow_up_message_by_id(follow_up_id UUID)
RETURNS void AS $$
DECLARE
  backend_url TEXT;
  auth_token TEXT;
  follow_up RECORD;
BEGIN
  -- Get the follow-up record
  SELECT * INTO follow_up
  FROM automated_follow_ups
  WHERE id = follow_up_id;
  
  IF follow_up IS NULL THEN
    RAISE EXCEPTION 'Follow-up not found: %', follow_up_id;
  END IF;
  
  -- Get backend URL and auth token
  backend_url := current_setting('app.backend_url', true);
  IF backend_url IS NULL THEN
    backend_url := 'https://your-backend-url.com'; -- Replace with actual backend URL
  END IF;
  
  auth_token := current_setting('app.backend_auth_token', true);
  
  -- Make HTTP request to backend
  PERFORM net.http_post(
    url := backend_url || '/api/follow-ups/send-next-message',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(auth_token, '')
    ),
    body := jsonb_build_object(
      'follow_up_id', follow_up.id,
      'student_id', follow_up.student_id,
      'sequence_id', follow_up.sequence_id,
      'current_step', follow_up.current_step,
      'status', follow_up.status
    )
  );
  
  -- Clean up the cron job after execution
  PERFORM cron.unschedule('send_message_' || follow_up_id || '_step_' || follow_up.current_step);
  PERFORM cron.unschedule('send_first_message_' || follow_up_id);
END;
$$ LANGUAGE plpgsql;

-- Create triggers on the automated_follow_ups table
DROP TRIGGER IF EXISTS trigger_first_message ON automated_follow_ups;
CREATE TRIGGER trigger_first_message
  AFTER INSERT ON automated_follow_ups
  FOR EACH ROW
  EXECUTE FUNCTION check_first_message_schedule();

DROP TRIGGER IF EXISTS trigger_next_message ON automated_follow_ups;
CREATE TRIGGER trigger_next_message
  AFTER UPDATE ON automated_follow_ups
  FOR EACH ROW
  WHEN (NEW.current_step IS DISTINCT FROM OLD.current_step OR NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION check_next_message_schedule();

-- Function to process all pending follow-ups (can be called periodically)
CREATE OR REPLACE FUNCTION process_pending_follow_ups()
RETURNS void AS $$
DECLARE
  follow_up RECORD;
  message RECORD;
  should_send BOOLEAN;
BEGIN
  -- Process activated follow-ups that haven't sent their first message
  FOR follow_up IN 
    SELECT af.*, tfm.time_delay_hours
    FROM automated_follow_ups af
    JOIN template_follow_up_messages tfm ON tfm.sequence_id = af.sequence_id
    WHERE af.status = 'activated' 
      AND af.last_message_sent_at IS NULL
      AND tfm.step_index = 1
      AND tfm.status = 'active'
  LOOP
    -- Check if it's time to send
    should_send := NOW() >= (follow_up.created_at + (follow_up.time_delay_hours || ' hours')::INTERVAL);
    
    IF should_send THEN
      PERFORM trigger_send_follow_up_message_by_id(follow_up.id);
    END IF;
  END LOOP;
  
  -- Process ongoing follow-ups for next messages
  FOR follow_up IN 
    SELECT af.*, tfm.time_delay_hours
    FROM automated_follow_ups af
    JOIN template_follow_up_messages tfm ON tfm.sequence_id = af.sequence_id
    WHERE af.status = 'ongoing' 
      AND af.last_message_sent_at IS NOT NULL
      AND tfm.step_index = af.current_step
      AND tfm.status = 'active'
  LOOP
    -- Check if it's time to send the next message
    should_send := NOW() >= (follow_up.last_message_sent_at + (follow_up.time_delay_hours || ' hours')::INTERVAL);
    
    IF should_send THEN
      PERFORM trigger_send_follow_up_message_by_id(follow_up.id);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule a cron job to run the processor every hour
SELECT cron.schedule(
  'process_follow_ups',
  '0 * * * *', -- Every hour at minute 0
  'SELECT process_pending_follow_ups()'
);

-- Create an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_automated_follow_ups_status_last_message 
ON automated_follow_ups(status, last_message_sent_at) 
WHERE status IN ('activated', 'ongoing');

CREATE INDEX IF NOT EXISTS idx_template_follow_up_messages_sequence_step 
ON template_follow_up_messages(sequence_id, step_index) 
WHERE status = 'active';

-- Comments for documentation
COMMENT ON FUNCTION check_first_message_schedule() IS 'Checks if it''s time to send the first message in a follow-up sequence when status is activated';
COMMENT ON FUNCTION check_next_message_schedule() IS 'Schedules the next message when a follow-up moves to ongoing status or advances to the next step';
COMMENT ON FUNCTION trigger_send_follow_up_message_by_id(UUID) IS 'Sends HTTP request to backend to trigger message sending for a specific follow-up';
COMMENT ON FUNCTION process_pending_follow_ups() IS 'Batch processor for checking all pending follow-ups - runs hourly via pg_cron';