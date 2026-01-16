-- 1. Create a secure function to join a group by code
-- This bypasses the RLS that prevents non-members from "seeing" the group
CREATE OR REPLACE FUNCTION join_group_by_code(code_input text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of creator (postgres)
SET search_path = public
AS $$
DECLARE
  target_group_id uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- 1. Look up the group
  SELECT id INTO target_group_id
  FROM groups
  WHERE invite_code = code_input
  LIMIT 1;

  IF target_group_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  -- 2. Insert membership (idempotent 'ON CONFLICT DO NOTHING' to prevent errors if already joined)
  INSERT INTO group_members (group_id, user_id)
  VALUES (target_group_id, current_user_id)
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN target_group_id;
END;
$$;

-- 2. Grant permission
GRANT EXECUTE ON FUNCTION join_group_by_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION join_group_by_code(text) TO service_role;
