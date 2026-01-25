-- 1. Add timing columns to festivals
ALTER TABLE festivals ADD COLUMN IF NOT EXISTS start_time TEXT DEFAULT '12:00';
ALTER TABLE festivals ADD COLUMN IF NOT EXISTS end_time TEXT DEFAULT '23:59';

-- 2. Create group_festivals join table
CREATE TABLE IF NOT EXISTS group_festivals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, festival_id)
);

-- 3. Enable RLS on group_festivals
ALTER TABLE group_festivals ENABLE ROW LEVEL SECURITY;

-- Policy: Allow members of a group to see their group's festivals
CREATE POLICY "Allow members to view group festivals" 
ON group_festivals FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = group_festivals.group_id 
    AND group_members.user_id = auth.uid()
  )
);

-- Policy: Allow members of a group to add festivals to it
CREATE POLICY "Allow members to add group festivals" 
ON group_festivals FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = group_festivals.group_id 
    AND group_members.user_id = auth.uid()
  )
);

-- Policy: Allow members of a group to remove festivals from it
CREATE POLICY "Allow members to remove group festivals" 
ON group_festivals FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = group_festivals.group_id 
    AND group_members.user_id = auth.uid()
  )
);
