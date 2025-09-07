-- Function to decrement step indices after message deletion
CREATE OR REPLACE FUNCTION decrement_sequence_step_indices(
  p_sequence_id uuid,
  p_deleted_step_index int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE template_follow_up_messages
  SET step_index = step_index - 1
  WHERE sequence_id = p_sequence_id
    AND step_index > p_deleted_step_index;
END;
$$;

-- Optional: Atomic function to delete message and decrement indices together
CREATE OR REPLACE FUNCTION delete_message_and_reorder(
  p_message_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sequence_id uuid;
  v_step_index int;
BEGIN
  -- Get the sequence_id and step_index of the message to delete
  SELECT sequence_id, step_index 
  INTO v_sequence_id, v_step_index
  FROM template_follow_up_messages
  WHERE id = p_message_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message not found';
  END IF;
  
  -- Delete the message
  DELETE FROM template_follow_up_messages
  WHERE id = p_message_id;
  
  -- Decrement step indices for messages after the deleted one
  UPDATE template_follow_up_messages
  SET step_index = step_index - 1
  WHERE sequence_id = v_sequence_id
    AND step_index > v_step_index;
END;
$$;