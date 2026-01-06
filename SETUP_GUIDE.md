# Stagely Setup Guide

## Step-by-Step Configuration Instructions

### 1. Configure Google OAuth in Supabase

#### A. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - For local development: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`
   - **Also add Supabase callback**: `https://mrxtbipshyjlfkjsrlsb.supabase.co/auth/v1/callback`
7. Copy your **Client ID** and **Client Secret**

#### B. Configure in Supabase Dashboard

1. Go to your Supabase project: https://app.supabase.com/project/mrxtbipshyjlfkjsrlsb
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to enable it
4. Enter your Google **Client ID** and **Client Secret**
5. Click **Save**

#### C. Configure Redirect URLs in Supabase

1. Still in **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (for local dev)
   - `https://yourdomain.com/auth/callback` (for production)
3. Add to **Site URL**: `http://localhost:3000` (or your production URL)

### 2. Configure Email Settings

#### A. Email Templates (Optional - Customize)

1. Go to **Authentication** → **Email Templates**
2. Customize templates if desired:
   - **Confirm signup** - Email verification
   - **Reset password** - Password reset
   - **Magic link** - If you use magic links later

#### B. Email Provider Settings

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**:
   - ✅ Enable **Enable email confirmations** (recommended)
   - ✅ Enable **Secure email change** (recommended)
3. Under **SMTP Settings** (optional - for custom email):
   - You can use Supabase's default email service
   - Or configure custom SMTP for branded emails

### 3. Handle Username for OAuth Users

When users sign in with Google, they won't have a username yet. The profile trigger will create a default username, but you may want to prompt them to set one.

**Current behavior:**
- OAuth users get a default username like `user_abc12345` (first 8 chars of their UUID)
- They can update it later in their profile

**To improve this later:**
- Add a "Set Username" page that redirects OAuth users after first login
- Or prompt them in the home page if username is still default

### 4. Test the Setup

#### Test Email/Password Auth:
1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Sign Up"
4. Enter email, username, password
5. Check your email for verification link
6. Click the link to verify
7. Sign in with your credentials

#### Test Google OAuth:
1. Go to `http://localhost:3000/login`
2. Click "Continue with Google"
3. You should be redirected to Google
4. Sign in with Google
5. You'll be redirected back to your app
6. Check that your profile was created in Supabase

### 5. Verify Database Setup

1. Go to **Table Editor** in Supabase
2. Check the `profiles` table:
   - Should have a row for your test user
   - Username should be set
   - Display name should be set (or default to username)

### 6. Production Deployment

When deploying to Vercel:

1. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (if needed)

2. Update Supabase redirect URLs:
   - Add your production domain to **Redirect URLs**
   - Update **Site URL** to your production domain

3. Update Google OAuth:
   - Add production callback URL to Google Cloud Console

## Troubleshooting

### Google OAuth not working?
- Check that redirect URLs match exactly (including http vs https)
- Verify Client ID and Secret are correct
- Check browser console for errors
- Verify Supabase callback URL is added

### Email verification not sending?
- Check spam folder
- Verify email confirmation is enabled in Supabase
- Check Supabase logs for email sending errors
- Try using a different email provider

### Username issues?
- Check that the profile trigger is working (should auto-create on signup)
- Verify username uniqueness constraint
- Check database logs for errors

## Next Steps

After setup is complete:
1. ✅ Test email/password signup
2. ✅ Test Google OAuth
3. ✅ Verify profiles are created
4. ⏭️ Build user profile management
5. ⏭️ Build festival admin tools

