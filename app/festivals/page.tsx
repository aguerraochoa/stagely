'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RetroBouncingDots } from '@/app/components/RetroBouncingDots'

type Festival = {
  id: string
  name: string
  year: number
  created_at: string
}

type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
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

export default function FestivalsPage() {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          setProfile(profileData)
        }

        const { data, error } = await supabase
          .from('festivals')
          .select('id, name, year, created_at')
          .order('year', { ascending: false })
          .order('name', { ascending: true })

        if (error) {
          console.error('Error fetching festivals:', error)
          return
        }

        setFestivals(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RetroBouncingDots />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-retro-cream text-retro-dark">
      <nav className="bg-white border-b-2 border-retro-dark sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4 min-w-0">
              <Link href="/">
                <img src="/icon.png" alt="Stagely Logo" className="h-8 w-auto min-w-[32px]" />
              </Link>
              <div className="h-6 w-0.5 bg-retro-dark/20"></div>
              <span className="text-retro-dark font-black uppercase tracking-widest text-xs truncate">Festivals</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Profile Link */}
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full border-2 border-retro-dark bg-retro-teal flex items-center justify-center text-[10px] font-black hover:-translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]"
                title="My Profile"
              >
                {profile ? getInitials(profile) : '?'}
              </Link>

              <Link
                href="/"
                className="px-4 py-2 text-sm font-black uppercase tracking-wider text-retro-dark hover:text-retro-orange transition-colors"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h1 className="text-5xl font-black text-retro-dark mb-2 uppercase italic tracking-tighter">
            Browse Festivals
          </h1>
          <p className="text-retro-dark font-bold opacity-70">
            Select a festival to view schedules and plan with your group
          </p>
        </div>

        {festivals.length === 0 ? (
          <div className="bg-white border-2 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] rounded-xl p-12 text-center">
            <p className="text-retro-dark font-bold mb-4">
              No festivals available yet.
            </p>
            <Link
              href="/admin"
              className="inline-block px-6 py-3 bg-retro-orange text-white border-2 border-retro-dark font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(26,44,50,1)] transition-all"
            >
              Create Festival
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {festivals.map((festival) => (
              <Link
                key={festival.id}
                href={`/festivals/${festival.id}`}
                className="group bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-xl p-6 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] transition-all"
              >
                <div className="w-8 h-1 bg-retro-teal mb-4 group-hover:w-full transition-all duration-300"></div>
                <h2 className="text-2xl font-black text-retro-dark uppercase italic mb-1">
                  {festival.name}
                </h2>
                <p className="text-retro-dark/60 font-black mb-4">
                  {festival.year}
                </p>
                <div className="flex items-center text-retro-orange font-black text-sm uppercase tracking-wider">
                  View Schedule
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

