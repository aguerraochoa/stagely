# Stagely

A web app for music festival groups to plan their day together using the familiar festival timetable grid. Each person marks each artist/set by priority (green/yellow/red), and the app overlays the whole group's preferences directly on the schedule.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Deployment**: Vercel
- **Version Control**: GitHub

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** (v18 or higher) - ✅ You have v24.2.0
2. **npm** - ✅ You have v11.3.0
3. **Git** - ✅ You have v2.39.5
4. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
5. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (for deployment)
6. **GitHub Account** - For version control

## Setup Instructions

### 1. Clone and Install

```bash
# Dependencies are already installed
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Go to **Settings** → **API**
4. Copy your:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (keep this secret!)

### 3. Configure Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
stagely/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── festivals/         # Festival pages
│   ├── groups/            # Group planning pages
│   ├── admin/             # Admin tools for festival creation
│   └── api/               # API routes
├── components/            # React components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions
│   └── supabase/          # Supabase client setup
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Next Steps

1. ✅ Project initialized
2. ✅ Supabase configured
3. ⏳ Set up database schema
4. ⏳ Build authentication
5. ⏳ Create festival management
6. ⏳ Build timetable UI
7. ⏳ Implement group planning features

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

This project is configured for Vercel deployment. Once you push to GitHub:

1. Connect your GitHub repo to Vercel
2. Add your environment variables in Vercel dashboard
3. Deploy!

---

**Note**: Make sure `.env.local` is in your `.gitignore` (it already is) and never commit your secrets!
