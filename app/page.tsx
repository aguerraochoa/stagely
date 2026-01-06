'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        // Check if we just came from auth callback
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('auth') === 'success' || urlParams.get('verified') === 'true') {
          // Clear the query param
          window.history.replaceState({}, '', '/')
          // Refresh the session
          await supabase.auth.refreshSession()
        }

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error getting user:', error)
          setLoading(false)
          router.push('/login')
          return
        }

        if (!user) {
          setLoading(false)
          router.push('/login')
          return
        }

        setUser(user)
        
        // Fetch user profile
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (!profileError && profileData) {
            setProfile(profileData)
          }
        } catch (err) {
          console.error('Error fetching profile:', err)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error getting user:', error)
        setLoading(false)
        router.push('/login')
      }
    }
    getUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-rose-800 dark:from-rose-400 dark:to-rose-600 bg-clip-text text-transparent">
                Stagely
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-600 dark:text-slate-400">
                {profile?.display_name || profile?.username || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Welcome to Stagely!
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Plan your festival day with friends
          </p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link
              href="/festivals"
              className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-400 transition-colors"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Browse Festivals
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                View and explore festivals
              </p>
            </Link>
            
            <Link
              href="/groups"
              className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-400 transition-colors"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                My Groups
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Manage your planning groups
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
