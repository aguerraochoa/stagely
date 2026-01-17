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
    <div className="min-h-screen bg-retro-cream text-retro-dark">
      <nav className="bg-white border-b-2 border-retro-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-black uppercase italic tracking-tighter text-retro-dark">
                Stagely
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-retro-dark font-bold">
                {profile?.display_name || profile?.username || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-black uppercase tracking-wider text-retro-dark hover:text-retro-orange transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-retro-dark uppercase italic tracking-tighter mb-2">
            Welcome to Stagely
          </h2>
          <p className="text-retro-dark font-bold text-lg opacity-70">
            Plan your festival day with friends. No more "Where are you?" texts.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Link
              href="/admin"
              className="group p-8 bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-xl hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] transition-all text-left"
            >
              <h3 className="text-xl font-black text-retro-dark mb-2 uppercase italic">
                Admin
              </h3>
              <p className="text-retro-dark/70 font-medium text-sm group-hover:text-retro-dark transition-colors">
                Create and manage festivals.
              </p>
            </Link>

            <Link
              href="/festivals"
              className="group p-8 bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-xl hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] transition-all text-left"
            >
              <div className="w-10 h-1 bg-retro-orange mb-4"></div>
              <h3 className="text-xl font-black text-retro-dark mb-2 uppercase italic">
                Browse Festivals
              </h3>
              <p className="text-retro-dark/70 font-medium text-sm group-hover:text-retro-dark transition-colors">
                Find your next gig and start planning.
              </p>
            </Link>

            <Link
              href="/groups"
              className="group p-8 bg-retro-teal border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-xl hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] transition-all text-left"
            >
              <div className="w-10 h-1 bg-white mb-4"></div>
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-retro-dark mb-2 uppercase italic">
                  My Groups
                </h3>
                <span className="bg-white text-retro-dark text-[10px] font-bold px-2 py-0.5 border border-retro-dark uppercase">Action</span>
              </div>
              <p className="text-retro-dark font-bold text-sm">
                Manage your squads and heat maps.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
