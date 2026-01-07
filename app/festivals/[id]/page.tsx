'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Festival = {
  id: string
  name: string
  year: number
}

type FestivalDay = {
  id: string
  festival_id: string
  day_name: string
  date: string | null
}

export default function FestivalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [festival, setFestival] = useState<Festival | null>(null)
  const [days, setDays] = useState<FestivalDay[]>([])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch festival
        const { data: festivalData, error: festivalError } = await supabase
          .from('festivals')
          .select('id, name, year')
          .eq('id', resolvedParams.id)
          .single()

        if (festivalError || !festivalData) {
          console.error('Error fetching festival:', festivalError)
          router.push('/festivals')
          return
        }

        setFestival(festivalData)

        // Fetch days
        const { data: daysData, error: daysError } = await supabase
          .from('festival_days')
          .select('id, festival_id, day_name, date')
          .eq('festival_id', resolvedParams.id)
          .order('date', { ascending: true, nullsFirst: false })
          .order('day_name', { ascending: true })

        if (daysError) {
          console.error('Error fetching days:', daysError)
        } else {
          setDays(daysData || [])
          // Auto-select first day if available
          if (daysData && daysData.length > 0) {
            setSelectedDay(daysData[0].id)
          }
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.id, router, supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    )
  }

  if (!festival) {
    return null
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
              <Link href="/festivals" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                Festivals
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-600 dark:text-slate-400">{festival.name} {festival.year}</span>
            </div>
            <Link
              href="/festivals"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Back to Festivals
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {festival.name} {festival.year}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Select a day to view the schedule
          </p>
        </div>

        {/* Days Tabs */}
        {days.length > 0 && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 shadow-sm">
            <div className="flex flex-wrap gap-3">
              {days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={`px-5 py-3 rounded-lg transition-all ${
                    selectedDay === day.id
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/50'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <div className="font-semibold text-sm">
                    {day.day_name}
                  </div>
                  {day.date && (
                    <div className={`text-xs mt-0.5 ${
                      selectedDay === day.id
                        ? 'text-rose-100'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timetable Placeholder */}
        {selectedDay ? (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Timetable view coming soon!
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Day ID: {selectedDay}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              {days.length === 0 ? 'No days available for this festival.' : 'Select a day to view the schedule'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

