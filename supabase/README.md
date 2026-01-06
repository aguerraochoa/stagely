# Database Schema

This directory contains SQL migration files for the Stagely database.

## Running Migrations

### Option 1: Via Supabase Dashboard (Recommended for MVP)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `migrations/001_initial_schema.sql`
4. Paste and run it

### Option 2: Via Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
supabase db push
```

## Schema Overview

### Core Tables

- **profiles** - User profiles (extends auth.users)
- **festivals** - Festival information
- **festival_days** - Individual days of multi-day festivals
- **stages** - Stage/venue information per day
- **sets** - Individual performances/shows
- **groups** - Planning groups
- **group_members** - Group membership
- **user_selections** - User priority selections (green/yellow/red)

### Security

All tables use Row Level Security (RLS) with appropriate policies:
- Users can view public data (festivals, sets, etc.)
- Users can only modify their own data
- Group members can view group-related data

### Key Features

- Automatic profile creation on signup
- Unique invite codes for groups
- Automatic timestamp updates
- Proper foreign key constraints and cascading deletes

