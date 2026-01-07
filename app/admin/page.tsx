'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Festival } from '@/types/database.types'

export default function AdminPage() {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-rose-800 dark:from-rose-400 dark:to-rose-600 bg-clip-text text-transparent">
                Stagely
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-600 dark:text-slate-400">Admin</span>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Festival Management
          </h1>
          <Link
            href="/admin/festivals/new"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            + Create Festival
          </Link>
        </div>

        {festivals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              No festivals yet. Create your first one!
            </p>
            <Link
              href="/admin/festivals/new"
              className="inline-block px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
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
                className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-400 transition-colors"
              >
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {festival.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
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

