'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Festival = {
  id: string
  name: string
  year: number
  created_at: string
}

export default function FestivalsPage() {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
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

    fetchFestivals()
  }, [supabase])

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
              <span className="text-slate-600 dark:text-slate-400">Festivals</span>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Browse Festivals
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Select a festival to view schedules and plan with your group
          </p>
        </div>

        {festivals.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              No festivals available yet.
            </p>
            <Link
              href="/admin"
              className="inline-block px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-all"
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
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:border-rose-500 dark:hover:border-rose-400 hover:shadow-lg transition-all"
              >
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {festival.name}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  {festival.year}
                </p>
                <div className="flex items-center text-rose-600 dark:text-rose-400 text-sm font-medium">
                  View Schedule
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

