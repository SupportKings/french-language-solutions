-- Simplified version that uses HTTP webhooks to notify backend when messages should be sent
-- The backend will handle the scheduling logic

-- First, ensure current_step column exists
ALTER TABLE automated_follow_ups 
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Configuration table for backend URLs (optional - can also use Supabase Vault)
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default backend URL (update this with your actual backend URL)
INSERT INTO system_config (key, value) 
VALUES ('backend_url', 'http://localhost:3000')
ON CONFLICT (key) DO NOTHING;

INSERT INTO system_config (key, value) 
VALUES ('backend_auth_token', 'your-secret-token')
ON CONFLICT (key) DO NOTHING;

-- Function to notify backend when a follow-up needs attention
CREATE OR REPLACE FUNCTION notify_backend_follow_up_event()
RETURNS TRIGGER AS $$
DECLARE
  backend_url TEXT;
  auth_token TEXT;
  event_type TEXT;
  first_message RECORD;
  next_message RECORD;
  should_trigger BOOLEAN := FALSE;
  time_until_send INTERVAL;
BEGIN
  -- Get backend configuration
  SELECT value INTO backend_url FROM system_config WHERE key = 'backend_url';
  SELECT value INTO auth_token FROM system_config WHERE key = 'backend_auth_token';
  
  -- Determine event type and check conditions
  IF TG_OP = 'INSERT' AND NEW.status = 'activated' THEN
    -- New follow-up created, check for first message
    SELECT * INTO first_message
    FROM template_follow_up_messages
    WHERE sequence_id = NEW.sequence_id
      AND step_index = 1
      AND status = 'active'
    LIMIT 1;
    
    IF first_message IS NOT NULL THEN
      event_type := 'follow_up_activated';
      should_trigger := TRUE;
      time_until_send := (first_message.time_delay_hours || ' hours')::INTERVAL;
    END IF;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check for status changes or step progression
    IF NEW.status = 'ongoing' AND NEW.current_step != COALESCE(OLD.current_step, 0) THEN
      -- Follow-up has progressed to next step
      SELECT * INTO next_message
      FROM template_follow_up_messages
      WHERE sequence_id = NEW.sequence_id
        AND step_index = NEW.current_step
        AND status = 'active'
      LIMIT 1;
      
      IF next_message IS NOT NULL THEN
        event_type := 'follow_up_step_advanced';
        should_trigger := TRUE;
        time_until_send := (next_message.time_delay_hours || ' hours')::INTERVAL;
      END IF;
      
    ELSIF NEW.status != OLD.status THEN
      -- Status changed
      event_type := 'follow_up_status_changed';
      should_trigger := TRUE;
    END IF;
  END IF;
  
  -- Send webhook to backend if conditions are met
  IF should_trigger THEN
    PERFORM net.http_post(
      url := backend_url || '/api/webhooks/follow-up-event',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || auth_token
      ),
      body := jsonb_build_object(
        'event_type', event_type,
        'follow_up_id', NEW.id,
        'student_id', NEW.student_id,
        'sequence_id', NEW.sequence_id,
        'current_step', NEW.current_step,
        'status', NEW.status,
        'last_message_sent_at', NEW.last_message_sent_at,
        'created_at', NEW.created_at,
        'scheduled_send_time', CASE 
          WHEN time_until_send IS NOT NULL THEN 
            to_char(NOW() + time_until_send, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
          ELSE NULL 
        END,
        'trigger_operation', TG_OP,
        'timestamp', to_char(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function specifically for checking if messages should be sent
CREATE OR REPLACE FUNCTION check_and_send_pending_messages()
RETURNS TABLE (
  follow_up_id UUID,
  should_send BOOLEAN,
  message_step INTEGER,
  scheduled_time TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  -- Check for first messages to send
  SELECT 
    af.id as follow_up_id,
    (NOW() >= af.created_at + (tfm.time_delay_hours || ' hours')::INTERVAL) as should_send,
    tfm.step_index as message_step,
    (af.created_at + (tfm.time_delay_hours || ' hours')::INTERVAL) as scheduled_time
  FROM automated_follow_ups af
  JOIN template_follow_up_messages tfm ON tfm.sequence_id = af.sequence_id
  WHERE af.status = 'activated'
    AND af.last_message_sent_at IS NULL
    AND tfm.step_index = 1
    AND tfm.status = 'active'
  
  UNION ALL
  
  -- Check for subsequent messages to send
  SELECT 
    af.id as follow_up_id,
    (NOW() >= af.last_message_sent_at + (tfm.time_delay_hours || ' hours')::INTERVAL) as should_send,
    tfm.step_index as message_step,
    (af.last_message_sent_at + (tfm.time_delay_hours || ' hours')::INTERVAL) as scheduled_time
  FROM automated_follow_ups af
  JOIN template_follow_up_messages tfm ON tfm.sequence_id = af.sequence_id
  WHERE af.status = 'ongoing'
    AND af.last_message_sent_at IS NOT NULL
    AND tfm.step_index = af.current_step
    AND tfm.status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to manually trigger message sending for a specific follow-up
CREATE OR REPLACE FUNCTION send_follow_up_message(follow_up_id UUID)
RETURNS JSONB AS $$
DECLARE
  backend_url TEXT;
  auth_token TEXT;
  follow_up RECORD;
  message RECORD;
  result JSONB;
BEGIN
  -- Get configuration
  SELECT value INTO backend_url FROM system_config WHERE key = 'backend_url';
  SELECT value INTO auth_token FROM system_config WHERE key = 'backend_auth_token';
  
  -- Get follow-up details
  SELECT * INTO follow_up
  FROM automated_follow_ups
  WHERE id = follow_up_id;
  
  IF follow_up IS NULL THEN
    RETURN jsonb_build_object('error', 'Follow-up not found');
  END IF;
  
  -- Get the appropriate message
  SELECT * INTO message
  FROM template_follow_up_messages
  WHERE sequence_id = follow_up.sequence_id
    AND step_index = CASE 
      WHEN follow_up.last_message_sent_at IS NULL THEN 1
      ELSE follow_up.current_step
    END
    AND status = 'active'
  LIMIT 1;
  
  IF message IS NULL THEN
    RETURN jsonb_build_object('error', 'No active message found for current step');
  END IF;
  
  -- Send request to backend
  SELECT net.http_post(
    url := backend_url || '/api/follow-ups/send-message',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || auth_token
    ),
    body := jsonb_build_object(
      'follow_up_id', follow_up.id,
      'student_id', follow_up.student_id,
      'sequence_id', follow_up.sequence_id,
      'current_step', follow_up.current_step,
      'message_id', message.id,
      'message_content', message.message_content,
      'step_index', message.step_index
    )
  ) INTO result;
  
  RETURN jsonb_build_object(
    'success', true,
    'follow_up_id', follow_up.id,
    'message_step', message.step_index,
    'request_sent', NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS notify_follow_up_created ON automated_follow_ups;
CREATE TRIGGER notify_follow_up_created
  AFTER INSERT ON automated_follow_ups
  FOR EACH ROW
  EXECUTE FUNCTION notify_backend_follow_up_event();

DROP TRIGGER IF EXISTS notify_follow_up_updated ON automated_follow_ups;
CREATE TRIGGER notify_follow_up_updated
  AFTER UPDATE ON automated_follow_ups
  FOR EACH ROW
  WHEN (
    NEW.status IS DISTINCT FROM OLD.status OR 
    NEW.current_step IS DISTINCT FROM OLD.current_step OR
    NEW.last_message_sent_at IS DISTINCT FROM OLD.last_message_sent_at
  )
  EXECUTE FUNCTION notify_backend_follow_up_event();

-- Create a view for monitoring follow-up status
CREATE OR REPLACE VIEW follow_up_message_schedule AS
SELECT 
  af.id as follow_up_id,
  af.student_id,
  af.sequence_id,
  af.status,
  af.current_step,
  af.last_message_sent_at,
  af.created_at,
  tfm.step_index as next_message_step,
  tfm.time_delay_hours,
  tfm.message_content as next_message_content,
  CASE 
    WHEN af.last_message_sent_at IS NULL THEN 
      af.created_at + (tfm.time_delay_hours || ' hours')::INTERVAL
    ELSE 
      af.last_message_sent_at + (tfm.time_delay_hours || ' hours')::INTERVAL
  END as scheduled_send_time,
  CASE 
    WHEN af.last_message_sent_at IS NULL THEN 
      NOW() >= (af.created_at + (tfm.time_delay_hours || ' hours')::INTERVAL)
    ELSE 
      NOW() >= (af.last_message_sent_at + (tfm.time_delay_hours || ' hours')::INTERVAL)
  END as should_send_now
FROM automated_follow_ups af
LEFT JOIN template_follow_up_messages tfm ON 
  tfm.sequence_id = af.sequence_id AND 
  tfm.step_index = CASE 
    WHEN af.status = 'activated' AND af.last_message_sent_at IS NULL THEN 1
    WHEN af.status = 'ongoing' THEN af.current_step
    ELSE NULL
  END AND
  tfm.status = 'active'
WHERE af.status IN ('activated', 'ongoing');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_automated_follow_ups_status_created 
ON automated_follow_ups(status, created_at) 
WHERE status = 'activated';

CREATE INDEX IF NOT EXISTS idx_automated_follow_ups_status_last_msg 
ON automated_follow_ups(status, last_message_sent_at) 
WHERE status = 'ongoing';

CREATE INDEX IF NOT EXISTS idx_template_messages_sequence_active 
ON template_follow_up_messages(sequence_id, step_index) 
WHERE status = 'active';

-- Comments for documentation
COMMENT ON FUNCTION notify_backend_follow_up_event() IS 'Sends webhook to backend when follow-up events occur (creation, status change, step advancement)';
COMMENT ON FUNCTION check_and_send_pending_messages() IS 'Returns list of follow-ups that have messages ready to send based on time delays';
COMMENT ON FUNCTION send_follow_up_message(UUID) IS 'Manually trigger message sending for a specific follow-up';
COMMENT ON VIEW follow_up_message_schedule IS 'Monitor view showing all pending follow-up messages and their scheduled send times';