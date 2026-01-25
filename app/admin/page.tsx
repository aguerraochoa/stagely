'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Festival } from '@/types/database.types'

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

export default function AdminPage() {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      // Check auth
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/login')
        return
      }
      setUser(authUser)

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
      setProfile(profileData)

      // Fetch festivals
      const { data, error } = await supabase
        .from('festivals')
        .select('*')
        .order('year', { ascending: false })
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching festivals:', error)
      } else {
        setFestivals(data || [])
      }
      setLoading(false)
    }

    fetchData()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-retro-orange"></div>
      </div>
    )
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
              <span className="text-retro-dark font-black uppercase italic tracking-tighter text-xl hidden sm:inline">Admin</span>
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

              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-sm font-black uppercase tracking-wider text-retro-dark hover:text-retro-orange transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-retro-dark uppercase italic tracking-tighter">
            Festival Management
          </h1>
          <Link
            href="/admin/festivals/new"
            className="text-center px-6 py-3 bg-retro-orange text-white border-2 border-retro-dark font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:shadow-[6px_6px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 transition-all"
          >
            + Create Festival
          </Link>
        </div>

        {festivals.length === 0 ? (
          <div className="bg-white border-2 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-retro-cream border-2 border-retro-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎤</span>
            </div>
            <p className="text-retro-dark font-bold mb-8">
              No festivals yet. Create your first one!
            </p>
            <Link
              href="/admin/festivals/new"
              className="inline-block px-8 py-4 bg-retro-orange text-white border-2 border-retro-dark font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:shadow-[6px_6px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 transition-all"
            >
              Create Festival
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {festivals.map((festival) => (
              <Link
                key={festival.id}
                href={`/admin/festivals/${festival.id}`}
                className="p-6 bg-white rounded-xl border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:shadow-[6px_6px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-1 transition-all"
              >
                <h3 className="text-xl font-black text-retro-dark mb-2 uppercase italic tracking-tight">
                  {festival.name}
                </h3>
                <p className="text-retro-dark font-bold opacity-70">
                  {festival.year}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

