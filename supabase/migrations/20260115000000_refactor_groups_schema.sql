-- 1. Remove festival_day_id from groups (Groups are now festival-agnostic)
ALTER TABLE groups 
DROP COLUMN festival_day_id CASCADE;

-- 2. Remove group_id from user_selections (Selections are now personal to the user)
-- Using CASCADE to remove dependent RLS policies
ALTER TABLE user_selections
DROP COLUMN group_id CASCADE;

-- 3. Add constraint to ensure one selection per user per set
ALTER TABLE user_selections
ADD CONSTRAINT user_selections_unique_user_set UNIQUE (user_id, set_id);

-- 4. Enable RLS (just in case)
ALTER TABLE user_selections ENABLE ROW LEVEL SECURITY;

-- 5. Add new policies for user_selections

-- Allow users to view their own selections
CREATE POLICY "Users can view own selections"
ON user_selections FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to create their own selections
CREATE POLICY "Users can insert own selections"
ON user_selections FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own selections
CREATE POLICY "Users can update own selections"
ON user_selections FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own selections
CREATE POLICY "Users can delete own selections"
ON user_selections FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to view selections of members in the same groups
-- This matches the logic we need for the Group Planner (seeing friend's votes)
CREATE POLICY "Users can view selections of group members"
ON user_selections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members my_groups
    JOIN group_members their_groups ON my_groups.group_id = their_groups.group_id
    WHERE my_groups.user_id = auth.uid()
    AND their_groups.user_id = user_selections.user_id
  )
);
