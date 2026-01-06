import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    // IMPORTANT: Read cookies first to ensure they're loaded (Next.js 14 lazy evaluation)
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll() // Force cookies to be read
    
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      // Redirect to login with error
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'auth_failed')
      loginUrl.searchParams.set('details', error.message)
      return NextResponse.redirect(loginUrl)
    }

    // Verify the session was created
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error('Session created but no user found')
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'session_failed')
      return NextResponse.redirect(loginUrl)
    }

    // Check if user's email is verified (skip for OAuth users - they're auto-verified)
    // OAuth users have app_metadata.provider set, email/password users need email_confirmed_at
    const isOAuthUser = user.app_metadata?.provider && user.app_metadata.provider !== 'email'
    if (!isOAuthUser && !user.email_confirmed_at) {
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'email_not_verified')
      loginUrl.searchParams.set('details', 'Please verify your email before signing in.')
      return NextResponse.redirect(loginUrl)
    }

    // Check if this is an email verification
    const type = requestUrl.searchParams.get('type')
    if (type === 'signup' || type === 'email') {
      const redirectUrl = new URL(next, requestUrl.origin)
      redirectUrl.searchParams.set('verified', 'true')
      return NextResponse.redirect(redirectUrl)
    }

    // Success - redirect to intended destination
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // No code, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}

