'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [emailLoading, setEmailLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Check for error/status in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const details = urlParams.get('details')
    const verified = urlParams.get('verified')
    const reset = urlParams.get('reset')

    if (error === 'auth_failed') {
      setMessage(
        details
          ? `Authentication failed: ${details}`
          : 'Authentication failed. Please try again.'
      )
      window.history.replaceState({}, '', '/login')
    } else if (error === 'session_failed') {
      setMessage('Session creation failed. Please try again.')
      window.history.replaceState({}, '', '/login')
    } else if (error === 'email_not_verified') {
      setMessage(details || 'Please verify your email before signing in.')
      window.history.replaceState({}, '', '/login')
    } else if (verified === 'true') {
      setMessage('Email verified successfully! Redirecting...')
      window.history.replaceState({}, '', '/login')
    } else if (verified === 'false') {
      setMessage('Email verification failed. Please try again or request a new verification email.')
      window.history.replaceState({}, '', '/login')
    } else if (reset === 'success') {
      setMessage('Password reset successful! You can now sign in with your new password.')
      window.history.replaceState({}, '', '/login')
    }
  }, [])

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      await new Promise(resolve => setTimeout(resolve, 100))

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const urlParams = new URLSearchParams(window.location.search)
        const nextUrl = urlParams.get('next') || '/'

        if (urlParams.get('verified') === 'true') {
          setTimeout(() => {
            router.push(nextUrl)
            router.refresh()
          }, 1500)
        } else {
          router.push(nextUrl)
          router.refresh()
        }
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters'
    }

    const hasLowercase = /[a-z]/.test(pwd)
    const hasUppercase = /[A-Z]/.test(pwd)
    const hasDigit = /[0-9]/.test(pwd)
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)

    const missing = []
    if (!hasLowercase) missing.push('lowercase letter')
    if (!hasUppercase) missing.push('uppercase letter')
    if (!hasDigit) missing.push('digit')
    if (!hasSymbol) missing.push('symbol')

    if (missing.length > 0) {
      return `Password must include at least one ${missing.join(', ')}`
    }

    return null
  }

  const validateUsername = (user: string): string | null => {
    if (user.length < 3) {
      return 'Username must be at least 3 characters'
    }
    if (user.length > 20) {
      return 'Username must be less than 20 characters'
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(user)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens'
    }
    return null
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setMessage('')

    // Validate username
    const usernameError = validateUsername(username)
    if (usernameError) {
      setMessage(usernameError)
      setEmailLoading(false)
      return
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      setEmailLoading(false)
      return
    }

    // Validate password requirements
    const passwordError = validatePassword(password)
    if (passwordError) {
      setMessage(passwordError)
      setEmailLoading(false)
      return
    }

    // Preserve the next parameter for email verification redirect
    const urlParams = new URLSearchParams(window.location.search)
    const nextUrl = urlParams.get('next') || '/'
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('next', nextUrl)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName || username,
        },
        emailRedirectTo: callbackUrl.toString(),
      },
    })

    if (error) {
      setMessage(error.message)
      setEmailLoading(false)
    } else if (data.user) {
      setMessage('Check your email to verify your account before signing in.')
      // Clear form
      setEmail('')
      setUsername('')
      setDisplayName('')
      setPassword('')
      setConfirmPassword('')
      setEmailLoading(false)
    }
  }

  const handleEmailSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setMessage('')

    let signInEmail = email.trim().toLowerCase()

    // 1. Detect if it's a username (no @)
    if (!signInEmail.includes('@')) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', signInEmail)
        .single()

      if (profileError || !profile?.email) {
        setMessage('Username not found. Please check your spelling or use your email.')
        setEmailLoading(false)
        return
      }
      signInEmail = profile.email
    }

    // 2. Proceed with sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password,
    })

    if (error) {
      setMessage(error.message)
      setEmailLoading(false)
    } else if (data.user) {
      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        setMessage('Please verify your email before signing in. Check your inbox for the verification link.')
        await supabase.auth.signOut()
        setEmailLoading(false)
      } else {
        // Success - redirect to intended destination or home
        const urlParams = new URLSearchParams(window.location.search)
        const nextUrl = urlParams.get('next') || '/'
        router.push(nextUrl)
        router.refresh()
      }
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setMessage('')

    // Preserve the next parameter for OAuth redirect
    const urlParams = new URLSearchParams(window.location.search)
    const nextUrl = urlParams.get('next') || '/'
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('next', nextUrl)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
      },
    })

    if (error) {
      setMessage(error.message)
      setGoogleLoading(false)
    }
    // Note: If successful, user will be redirected to Google, so we don't need to handle success here
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setMessage('')

    if (!resetEmail) {
      setMessage('Please enter your email address')
      setResetLoading(false)
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setMessage(error.message)
      setResetLoading(false)
    } else {
      setMessage('Check your email for a password reset link.')
      setResetEmail('')
      setShowForgotPassword(false)
      setResetLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-retro-cream text-retro-dark">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-black mb-2 text-retro-dark uppercase italic tracking-tighter">
            Stagely
          </h1>
          <p className="text-retro-dark font-bold text-lg opacity-70">
            Plan your festival day with friends
          </p>
        </div>

        <div className="bg-white border-2 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] rounded-xl p-8 space-y-6">
          {/* Toggle between sign in and sign up */}
          <div className="flex gap-2 p-1.5 bg-retro-cream border-2 border-retro-dark rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setMessage('')
                setEmail('')
                setUsername('')
                setDisplayName('')
                setPassword('')
                setConfirmPassword('')
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-black uppercase tracking-wider transition-all ${mode === 'signin'
                ? 'bg-retro-teal text-retro-dark border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] -translate-y-0.5'
                : 'text-retro-dark font-bold hover:bg-black/5'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setMessage('')
                setEmail('')
                setUsername('')
                setDisplayName('')
                setPassword('')
                setConfirmPassword('')
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-black uppercase tracking-wider transition-all ${mode === 'signup'
                ? 'bg-retro-teal text-retro-dark border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] -translate-y-0.5'
                : 'text-retro-dark font-bold hover:bg-black/5'
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Email/Password Form */}
          <form
            onSubmit={mode === 'signup' ? handleEmailSignup : handleEmailSignin}
            className="space-y-4"
          >
            <div>
              <label htmlFor="email" className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                {mode === 'signup' ? 'Email Address' : 'Username or Email'}
              </label>
              <input
                id="email"
                type={mode === 'signup' ? 'email' : 'text'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={emailLoading}
                className="w-full px-4 py-3 border-2 border-retro-dark rounded-lg bg-white text-retro-dark font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all placeholder-retro-dark/30 disabled:opacity-50"
                placeholder={mode === 'signup' ? 'you@example.com' : 'username or email'}
              />
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label htmlFor="username" className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    required
                    disabled={emailLoading}
                    minLength={3}
                    maxLength={20}
                    pattern="[a-zA-Z0-9_-]+"
                    className="w-full px-4 py-3 border-2 border-retro-dark rounded-lg bg-white text-retro-dark font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all placeholder-retro-dark/30 disabled:opacity-50"
                    placeholder="yourusername"
                  />
                  <p className="mt-1 text-[10px] font-bold text-retro-dark/60">
                    3-20 characters, letters, numbers, _, -
                  </p>
                </div>
                <div>
                  <label htmlFor="displayName" className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                    Display Name <span className="text-retro-dark/50 font-medium normal-case tracking-normal">(optional)</span>
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={emailLoading}
                    className="w-full px-4 py-3 border-2 border-retro-dark rounded-lg bg-white text-retro-dark font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all placeholder-retro-dark/30 disabled:opacity-50"
                    placeholder="Your Name"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={emailLoading}
                minLength={8}
                className="w-full px-4 py-3 border-2 border-retro-dark rounded-lg bg-white text-retro-dark font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all placeholder-retro-dark/30 disabled:opacity-50"
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
              />
              {mode === 'signin' && (
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true)
                      setResetEmail(email)
                    }}
                    className="text-xs font-bold text-retro-orange hover:text-retro-dark hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              {mode === 'signup' && (
                <p className="mt-1 text-[10px] font-bold text-retro-dark/60">
                  Must include: uppercase, lowercase, digit, and symbol
                </p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={emailLoading}
                  minLength={8}
                  className="w-full px-4 py-3 border-2 border-retro-dark rounded-lg bg-white text-retro-dark font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all placeholder-retro-dark/30 disabled:opacity-50"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={emailLoading}
              className="w-full py-4 px-4 bg-retro-orange hover:bg-retro-dark text-white border-2 border-retro-dark font-black uppercase tracking-wider rounded-lg shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:shadow-[6px_6px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                mode === 'signup' ? 'Sign Up' : 'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-retro-dark/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-retro-dark font-black uppercase tracking-wider">Or</span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-retro-dark rounded-xl font-bold bg-white text-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:shadow-[6px_6px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {googleLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-bold border-2 border-retro-dark ${message.includes('failed') || message.includes('error') || message.includes('not match') || message.includes('at least') || message.includes('must')
                ? 'bg-retro-orange text-white'
                : message.includes('Check your email') || message.includes('verify')
                  ? 'bg-retro-teal text-retro-dark'
                  : 'bg-retro-cream text-retro-dark'
                }`}
            >
              {message}
            </div>
          )}

          <p className="text-[10px] text-center text-retro-dark/50 font-bold uppercase tracking-wider">
            By signing in, you agree to Stagely&apos;s terms of service
          </p>
        </div>
      </div>
      {/* Forgot Password Modal */}
      {
        showForgotPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 md:p-8 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Reset Password
                </h2>
                <button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmail('')
                    setMessage('')
                  }}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="resetEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={resetLoading}
                    className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {resetLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setResetEmail('')
                      setMessage('')
                    }}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div>
  )
}

