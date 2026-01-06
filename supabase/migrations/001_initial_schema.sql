-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- FESTIVALS TABLE
-- ============================================
CREATE TABLE festivals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, year)
);

-- Enable RLS
ALTER TABLE festivals ENABLE ROW LEVEL SECURITY;

-- Policies for festivals
CREATE POLICY "Anyone can view festivals"
  ON festivals FOR SELECT
  USING (true);

CREATE POLICY "Users can create festivals"
  ON festivals FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own festivals"
  ON festivals FOR UPDATE
  USING (auth.uid() = created_by);

-- ============================================
-- FESTIVAL_DAYS TABLE
-- ============================================
CREATE TABLE festival_days (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE NOT NULL,
  day_name TEXT NOT NULL, -- e.g., "Friday", "Day 1", "2026-03-15"
  date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(festival_id, day_name)
);

-- Enable RLS
ALTER TABLE festival_days ENABLE ROW LEVEL SECURITY;

-- Policies for festival_days
CREATE POLICY "Anyone can view festival days"
  ON festival_days FOR SELECT
  USING (true);

CREATE POLICY "Users can manage festival days"
  ON festival_days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM festivals
      WHERE festivals.id = festival_days.festival_id
      AND festivals.created_by = auth.uid()
    )
  );

-- ============================================
-- STAGES TABLE
-- ============================================
CREATE TABLE stages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  festival_day_id UUID REFERENCES festival_days(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0, -- For column ordering in timetable
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(festival_day_id, name)
);

-- Enable RLS
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;

-- Policies for stages
CREATE POLICY "Anyone can view stages"
  ON stages FOR SELECT
  USING (true);

CREATE POLICY "Users can manage stages"
  ON stages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM festival_days
      JOIN festivals ON festivals.id = festival_days.festival_id
      WHERE festival_days.id = stages.festival_day_id
      AND festivals.created_by = auth.uid()
    )
  );

-- ============================================
-- SETS TABLE (the actual performances)
-- ============================================
CREATE TABLE sets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  festival_day_id UUID REFERENCES festival_days(id) ON DELETE CASCADE NOT NULL,
  stage_id UUID REFERENCES stages(id) ON DELETE CASCADE NOT NULL,
  artist_name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure sets don't overlap on the same stage (optional constraint)
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Enable RLS
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- Policies for sets
CREATE POLICY "Anyone can view sets"
  ON sets FOR SELECT
  USING (true);

CREATE POLICY "Users can manage sets"
  ON sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM festival_days
      JOIN festivals ON festivals.id = festival_days.festival_id
      WHERE festival_days.id = sets.festival_day_id
      AND festivals.created_by = auth.uid()
    )
  );

-- Index for efficient queries
CREATE INDEX idx_sets_festival_day ON sets(festival_day_id);
CREATE INDEX idx_sets_stage ON sets(stage_id);
CREATE INDEX idx_sets_time ON sets(start_time, end_time);

-- ============================================
-- GROUPS TABLE
-- ============================================
CREATE TABLE groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  festival_day_id UUID REFERENCES festival_days(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  invite_code TEXT UNIQUE NOT NULL, -- For shareable links
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Policies for groups
-- For MVP: Allow creators and anyone to view (we'll restrict in app if needed)
-- Group membership check will be handled in application code
CREATE POLICY "Anyone can view groups"
  ON groups FOR SELECT
  USING (true);

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update groups"
  ON groups FOR UPDATE
  USING (auth.uid() = created_by);

-- ============================================
-- GROUP_MEMBERS TABLE
-- ============================================
CREATE TABLE group_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Policies for group_members
-- For MVP: Allow group creators to see all members, and users to see their own membership
CREATE POLICY "Group creators can view all group members"
  ON group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view own group membership"
  ON group_members FOR SELECT
  USING (group_members.user_id = auth.uid());

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- USER_SELECTIONS TABLE (the core feature!)
-- ============================================
CREATE TABLE user_selections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  set_id UUID REFERENCES sets(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('green', 'yellow', 'red')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, set_id, group_id) -- One selection per user per set per group
);

-- Enable RLS
ALTER TABLE user_selections ENABLE ROW LEVEL SECURITY;

-- Policies for user_selections
-- For MVP: Allow users to view selections in groups they're part of
-- Group membership check will be handled in application code for now
CREATE POLICY "Users can view selections in their groups"
  ON user_selections FOR SELECT
  USING (
    -- User can view their own selections
    user_id = auth.uid()
    -- Or user is viewing selections in a group they created
    OR EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = user_selections.group_id
      AND groups.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can manage own selections"
  ON user_selections FOR ALL
  USING (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX idx_selections_user_group ON user_selections(user_id, group_id);
CREATE INDEX idx_selections_set_group ON user_selections(set_id, group_id);
CREATE INDEX idx_selections_priority ON user_selections(priority);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Removed confusing chars
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_festivals_updated_at BEFORE UPDATE ON festivals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sets_updated_at BEFORE UPDATE ON sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_selections_updated_at BEFORE UPDATE ON user_selections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

