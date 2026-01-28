'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Profile as DbProfile } from '@/types/database.types'
import { RetroBouncingDots } from '@/app/components/RetroBouncingDots'

type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

type FestivalPreview = {
  id: string
  name: string
  year: number
  created_at: string
}

type GroupPreview = {
  id: string
  name: string
  created_at: string
}

const getInitials = (profile: Profile) => {
  const name = profile.display_name || profile.username || '?';
  if (!name || name === '?') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<DbProfile | null>(null)
  const [featuredFestivals, setFeaturedFestivals] = useState<FestivalPreview[]>([])
  const [recentGroups, setRecentGroups] = useState<GroupPreview[]>([])
  const [sectionsLoading, setSectionsLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        let mounted = true

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

        // Fetch "dashboard" data in parallel
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        const festivalsPromise = supabase
          .from('festivals')
          .select('id, name, year, created_at')
          .order('year', { ascending: false })
          .order('name', { ascending: true })
          .limit(3)

        const membershipsPromise = supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id)

        const [profileRes, festivalsRes, membershipsRes] = await Promise.all([
          profilePromise,
          festivalsPromise,
          membershipsPromise,
        ])

        if (!mounted) return

        if (!profileRes.error && profileRes.data) {
          setProfile(profileRes.data)
        }

        if (!festivalsRes.error && festivalsRes.data) {
          setFeaturedFestivals(festivalsRes.data as FestivalPreview[])
        }

        const groupIds = (membershipsRes.data || []).map((m) => m.group_id).slice(0, 50)
        if (groupIds.length > 0) {
          const { data: groupsData, error: groupsError } = await supabase
            .from('groups')
            .select('id, name, created_at')
            .in('id', groupIds)
            .order('created_at', { ascending: false })
            .limit(3)

          if (!groupsError && groupsData) {
            setRecentGroups(groupsData as GroupPreview[])
          }
        }

        setSectionsLoading(false)

        setLoading(false)

        return () => {
          mounted = false
        }
      } catch (error) {
        console.error('Error getting user:', error)
        setSectionsLoading(false)
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
        <RetroBouncingDots />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-retro-cream text-retro-dark">
      <nav className="bg-white border-b-2 border-retro-dark sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/">
                <img src="/icon.png" alt="Stagely Logo" className="h-8 w-auto" />
              </Link>
              <div className="h-6 w-0.5 bg-retro-dark/20"></div>
              <span className="text-retro-dark font-black uppercase italic tracking-tighter text-xl hidden sm:inline">Stagely</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Admin Link */}
              <Link
                href="/admin"
                className="w-8 h-8 rounded-full border-2 border-retro-dark bg-retro-orange flex items-center justify-center hover:-translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]"
                title="Admin"
              >
                <svg className="w-4 h-4 text-retro-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              {/* Profile Link */}
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full border-2 border-retro-dark bg-retro-teal flex items-center justify-center text-[10px] font-black hover:-translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]"
                title="My Profile"
              >
                {profile ? getInitials(profile) : '?'}
              </Link>

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative">
        {/* subtle background stickers */}
        <div className="pointer-events-none absolute -top-6 right-6 hidden lg:block">
          <div className="w-44 h-16 bg-white/70 border-2 border-retro-dark rotate-6 shadow-[6px_6px_0px_0px_rgba(26,44,50,1)]"></div>
        </div>
        <div className="pointer-events-none absolute top-44 -left-6 hidden lg:block">
          <div className="w-28 h-28 bg-retro-teal/40 border-2 border-retro-dark -rotate-6 shadow-[6px_6px_0px_0px_rgba(26,44,50,1)]"></div>
        </div>

        {/* Hero Section */}
        <div className="text-center py-8 md:py-16">
          {/* Decorative Tag */}
          <div className="inline-block bg-retro-orange border-2 border-retro-dark px-4 py-2 font-black text-sm uppercase transform -rotate-2 shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] mb-6">
            🎵 FESTIVAL_PLANNER
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase mb-6 leading-tight">
            Plan Your
            <span className="block bg-retro-teal border-4 border-retro-dark inline-block px-4 py-2 transform rotate-1 shadow-[6px_6px_0px_0px_rgba(26,44,50,1)] mt-2 italic">
              Festival Day
            </span>
          </h1>

          <p className="text-lg md:text-xl font-bold text-retro-dark mb-10 max-w-lg mx-auto leading-relaxed">
            No more "Where are you?" texts. Coordinate with your squad and never miss a beat.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Link
              href="/festivals"
              className="inline-flex items-center gap-3 px-8 py-4 bg-retro-orange border-4 border-retro-dark text-white text-lg font-black uppercase shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Festivals
            </Link>
            <Link
              href="/groups"
              className="inline-flex items-center gap-3 px-8 py-4 bg-retro-teal border-4 border-retro-dark text-retro-dark text-lg font-black uppercase shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              My Groups
            </Link>
          </div>

          {/* little sticker row */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="inline-block bg-white border-2 border-retro-dark px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] -rotate-2">
              Squad Mode
            </span>
            <span className="inline-block bg-retro-teal border-2 border-retro-dark px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] rotate-1">
              Priorities
            </span>
            <span className="inline-block bg-retro-orange border-2 border-retro-dark px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] rotate-2">
              No Missed Sets
            </span>
          </div>
        </div>

        {/* Below the fold */}
        <div className="border-t-2 border-retro-dark/20 pt-10 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left column */}
            <div className="lg:col-span-7 space-y-6">
              <section className="bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-black text-retro-dark uppercase italic">Jump back in</h2>
                    <p className="text-retro-dark/70 font-bold text-sm">
                      Your most recent squads.
                    </p>
                  </div>
                  <Link
                    href="/groups"
                    className="text-sm font-black uppercase tracking-wider text-retro-orange hover:text-retro-dark transition-colors whitespace-nowrap"
                  >
                    View all →
                  </Link>
                </div>

                {sectionsLoading ? (
                  <div className="space-y-3">
                    <div className="h-14 bg-retro-cream border-2 border-retro-dark/20 rounded-lg animate-pulse"></div>
                    <div className="h-14 bg-retro-cream border-2 border-retro-dark/20 rounded-lg animate-pulse"></div>
                    <div className="h-14 bg-retro-cream border-2 border-retro-dark/20 rounded-lg animate-pulse"></div>
                  </div>
                ) : recentGroups.length === 0 ? (
                  <div className="bg-retro-cream border-2 border-retro-dark rounded-lg p-6">
                    <p className="font-bold text-retro-dark/80 mb-4">
                      No squads yet — create one or join with an invite code.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/groups/new"
                        className="px-5 py-3 bg-retro-orange text-white border-2 border-retro-dark font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] transition-all"
                      >
                        + New Squad
                      </Link>
                      <Link
                        href="/groups/join"
                        className="px-5 py-3 bg-white text-retro-dark border-2 border-retro-dark font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] transition-all"
                      >
                        Join
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentGroups.map((g) => (
                      <Link
                        key={g.id}
                        href={`/groups/${g.id}`}
                        className="block bg-retro-cream border-2 border-retro-dark rounded-lg p-4 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] transition-all"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-lg font-black uppercase italic truncate">{g.name}</div>
                            <div className="text-xs font-bold uppercase tracking-wider text-retro-dark/50">
                              Created {new Date(g.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <span className="text-retro-orange font-black text-sm uppercase tracking-wider">
                            Open →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-black text-retro-dark uppercase italic">Festival spotlight</h2>
                    <p className="text-retro-dark/70 font-bold text-sm">
                      A few festivals to kick things off.
                    </p>
                  </div>
                  <Link
                    href="/festivals"
                    className="text-sm font-black uppercase tracking-wider text-retro-orange hover:text-retro-dark transition-colors whitespace-nowrap"
                  >
                    Browse →
                  </Link>
                </div>

                {sectionsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="h-20 bg-retro-cream border-2 border-retro-dark/20 rounded-lg animate-pulse"></div>
                    <div className="h-20 bg-retro-cream border-2 border-retro-dark/20 rounded-lg animate-pulse"></div>
                  </div>
                ) : featuredFestivals.length === 0 ? (
                  <div className="bg-retro-cream border-2 border-retro-dark rounded-lg p-6">
                    <p className="font-bold text-retro-dark/80 mb-4">
                      No festivals yet. Add one in Admin.
                    </p>
                    <Link
                      href="/admin"
                      className="inline-block px-5 py-3 bg-retro-orange text-white border-2 border-retro-dark font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] transition-all"
                    >
                      Go to Admin
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {featuredFestivals.map((f) => (
                      <Link
                        key={f.id}
                        href={`/festivals/${f.id}`}
                        className="block bg-retro-cream border-2 border-retro-dark rounded-lg p-4 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-lg font-black uppercase italic truncate">{f.name}</div>
                            <div className="text-xs font-black uppercase tracking-widest text-retro-dark/60">{f.year}</div>
                          </div>
                          <span className="inline-block bg-white border border-retro-dark px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                            View
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right column */}
            <div className="lg:col-span-5 space-y-6">
              <section className="bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-xl p-6">
                <h2 className="text-2xl font-black text-retro-dark uppercase italic mb-1">Quick actions</h2>
                <p className="text-retro-dark/70 font-bold text-sm mb-4">
                  Shortcuts to the good stuff.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href="/groups/new"
                    className="px-4 py-3 bg-retro-orange text-white border-2 border-retro-dark font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] transition-all text-center"
                  >
                    + New Squad
                  </Link>
                  <Link
                    href="/groups/join"
                    className="px-4 py-3 bg-white text-retro-dark border-2 border-retro-dark font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] transition-all text-center"
                  >
                    Join
                  </Link>
                  <Link
                    href="/loading-screens"
                    className="px-4 py-3 bg-retro-teal text-retro-dark border-2 border-retro-dark font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] transition-all text-center"
                  >
                    Loaders
                  </Link>
                  <Link
                    href="/profile"
                    className="px-4 py-3 bg-retro-cream text-retro-dark border-2 border-retro-dark font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] transition-all text-center"
                  >
                    Profile
                  </Link>
                </div>
              </section>

              <section className="bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-xl p-6">
                <h2 className="text-2xl font-black text-retro-dark uppercase italic mb-4">Pro tips</h2>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 bg-retro-teal border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] flex items-center justify-center font-black">
                      1
                    </div>
                    <div className="font-bold text-retro-dark/80">
                      Create a squad, then invite friends with the code.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-9 h-9 bg-retro-orange text-white border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] flex items-center justify-center font-black">
                      2
                    </div>
                    <div className="font-bold text-retro-dark/80">
                      Use priorities (green/yellow/red) to agree on “must-see” sets.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-9 h-9 bg-white border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] flex items-center justify-center font-black">
                      3
                    </div>
                    <div className="font-bold text-retro-dark/80">
                      Pick a festival day and build your plan together in real time.
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
