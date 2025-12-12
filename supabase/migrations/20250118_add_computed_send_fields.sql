-- Add computed columns to track when messages should be sent
ALTER TABLE automated_follow_ups 
ADD COLUMN IF NOT EXISTS current_step INTEGER DEFAULT 1;

-- Add a computed column for the scheduled send time
ALTER TABLE automated_follow_ups
ADD COLUMN IF NOT EXISTS next_send_at TIMESTAMP GENERATED ALWAYS AS (
  CASE 
    WHEN status = 'activated' AND last_message_sent_at IS NULL THEN
      -- First message: created_at + delay from step 1
      created_at + (
        SELECT INTERVAL '1 hour' * time_delay_hours
        FROM template_follow_up_messages
        WHERE sequence_id = automated_follow_ups.sequence_id
          AND step_index = 1
          AND status = 'active'
        LIMIT 1
      )
    WHEN status = 'ongoing' AND last_message_sent_at IS NOT NULL THEN
      -- Subsequent messages: last_message_sent_at + delay from current step
      last_message_sent_at + (
        SELECT INTERVAL '1 hour' * time_delay_hours
        FROM template_follow_up_messages
        WHERE sequence_id = automated_follow_ups.sequence_id
          AND step_index = automated_follow_ups.current_step
          AND status = 'active'
        LIMIT 1
      )
    ELSE NULL
  END
) STORED;

-- Add a computed column that indicates if it's time to send
ALTER TABLE automated_follow_ups
ADD COLUMN IF NOT EXISTS should_send_now BOOLEAN GENERATED ALWAYS AS (
  CASE
    WHEN status IN ('activated', 'ongoing') AND next_send_at IS NOT NULL THEN
      NOW() >= next_send_at
    ELSE FALSE
  END
) STORED;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_follow_ups_should_send 
ON automated_follow_ups(should_send_now, status) 
WHERE should_send_now = TRUE;

CREATE INDEX IF NOT EXISTS idx_follow_ups_next_send 
ON automated_follow_ups(next_send_at) 
WHERE status IN ('activated', 'ongoing');