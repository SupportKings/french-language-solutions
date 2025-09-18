-- Create a view that shows all messages ready to send
CREATE OR REPLACE VIEW pending_follow_up_messages AS
WITH message_schedule AS (
  SELECT 
    af.id as follow_up_id,
    af.student_id,
    af.sequence_id,
    af.status,
    af.current_step,
    af.last_message_sent_at,
    af.created_at,
    tfm.id as message_id,
    tfm.step_index,
    tfm.time_delay_hours,
    tfm.message_content,
    -- Calculate when this message should be sent
    CASE 
      WHEN af.status = 'activated' AND af.last_message_sent_at IS NULL AND tfm.step_index = 1 THEN
        af.created_at + (tfm.time_delay_hours * INTERVAL '1 hour')
      WHEN af.status = 'ongoing' AND tfm.step_index = af.current_step THEN
        af.last_message_sent_at + (tfm.time_delay_hours * INTERVAL '1 hour')
      ELSE NULL
    END as scheduled_send_time
  FROM automated_follow_ups af
  INNER JOIN template_follow_up_messages tfm 
    ON tfm.sequence_id = af.sequence_id
  WHERE af.status IN ('activated', 'ongoing')
    AND tfm.status = 'active'
    AND (
      -- First message condition
      (af.status = 'activated' AND af.last_message_sent_at IS NULL AND tfm.step_index = 1)
      OR 
      -- Next message condition
      (af.status = 'ongoing' AND tfm.step_index = af.current_step)
    )
)
SELECT 
  *,
  -- The magic boolean field!
  (NOW() >= scheduled_send_time) as should_send_now,
  -- How long until send time (useful for debugging)
  EXTRACT(EPOCH FROM (scheduled_send_time - NOW())) / 60 as minutes_until_send
FROM message_schedule
WHERE scheduled_send_time IS NOT NULL;

-- Create an index on the base tables to speed up the view
CREATE INDEX IF NOT EXISTS idx_template_messages_active 
ON template_follow_up_messages(sequence_id, step_index, status);

-- Function to get all messages that should be sent now
CREATE OR REPLACE FUNCTION get_messages_to_send()
RETURNS TABLE (
  follow_up_id UUID,
  student_id UUID,
  message_id UUID,
  message_content TEXT,
  step_index INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.follow_up_id,
    p.student_id,
    p.message_id,
    p.message_content,
    p.step_index
  FROM pending_follow_up_messages p
  WHERE p.should_send_now = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Simple query to check what needs to be sent
-- Your backend can just run: SELECT * FROM pending_follow_up_messages WHERE should_send_now = TRUE;