-- Enable RLS on groups table (Idempotent)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Enable RLS on group_members table (Idempotent)
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- CLEANUP OLD POLICIES & FUNCTIONS
DROP POLICY IF EXISTS "Users can view groups they belong to" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Users can view own membership" ON group_members;

DROP FUNCTION IF EXISTS get_my_group_ids();

-- ---------------------------------------------------------
-- FIX: ADD FOREIGN KEY FOR JOINS
-- ---------------------------------------------------------
-- This allows: supabase.from('group_members').select('profiles:user_id(*)')
-- We check if constraint exists first to be safe (though raw SQL usually errors if dup)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'group_members_user_id_profiles_fk'
    ) THEN
        ALTER TABLE group_members 
        ADD CONSTRAINT group_members_user_id_profiles_fk 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id);
    END IF;
END $$;


-- ---------------------------------------------------------
-- HELPER FUNCTION: Break Infinite Recursion
-- ---------------------------------------------------------
-- This function runs with SECURITY DEFINER, meaning it bypasses RLS.
-- It safely returns the list of group_ids the current user belongs to.
CREATE OR REPLACE FUNCTION get_my_group_ids()
RETURNS uuid[]
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(array_agg(group_id), '{}')
  FROM group_members
  WHERE user_id = auth.uid();
$$;

-- Explicitly grant execute permission
GRANT EXECUTE ON FUNCTION get_my_group_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_group_ids() TO service_role;


-- ---------------------------------------------------------
-- GROUPS POLICIES
-- ---------------------------------------------------------

-- 1. VIEW: Users can view groups they are listed in
CREATE POLICY "Users can view groups they belong to"
ON groups FOR SELECT
USING (
  id = ANY(get_my_group_ids())
);

-- 2. CREATE: Users can create groups
CREATE POLICY "Users can create groups"
ON groups FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- ---------------------------------------------------------
-- GROUP MEMBERS POLICIES
-- ---------------------------------------------------------

-- 1. VIEW: Users can view members of generic groups they belong to
CREATE POLICY "Users can view members of their groups"
ON group_members FOR SELECT
USING (
  group_id = ANY(get_my_group_ids())
);

-- 2. INSERT: Users can join groups (Insert themselves)
CREATE POLICY "Users can join groups"
ON group_members FOR INSERT
WITH CHECK (auth.uid() = user_id);
