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

type Stage = {
  id: string
  festival_day_id: string
  name: string
}

type Set = {
  id: string
  stage_id: string
  artist_name: string
  start_time: string
  end_time: string | null
}

export default function FestivalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [festival, setFestival] = useState<Festival | null>(null)
  const [days, setDays] = useState<FestivalDay[]>([])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [sets, setSets] = useState<Set[]>([])
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

  // Fetch stages and sets when day is selected
  useEffect(() => {
    if (selectedDay) {
      const fetchStagesAndSets = async () => {
        try {
          // Fetch stages
          const { data: stagesData, error: stagesError } = await supabase
            .from('stages')
            .select('id, festival_day_id, name')
            .eq('festival_day_id', selectedDay)
            .order('name', { ascending: true })

          if (stagesError) {
            console.error('Error fetching stages:', stagesError)
            setStages([])
          } else {
            setStages(stagesData || [])
          }

          // Fetch sets
          if (stagesData && stagesData.length > 0) {
            const stageIds = stagesData.map(s => s.id)
            const { data: setsData, error: setsError } = await supabase
              .from('sets')
              .select('id, stage_id, artist_name, start_time, end_time')
              .in('stage_id', stageIds)
              .order('start_time', { ascending: true })

            if (setsError) {
              console.error('Error fetching sets:', setsError)
              setSets([])
            } else {
              setSets(setsData || [])
            }
          } else {
            setSets([])
          }
        } catch (error) {
          console.error('Error:', error)
        }
      }

      fetchStagesAndSets()
    } else {
      setStages([])
      setSets([])
    }
  }, [selectedDay, supabase])

  // Helper functions for timetable
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Generate time slots (every 15 minutes from 12:00 to 23:00)
  const generateTimeSlots = (): string[] => {
    const slots: string[] = []
    for (let hour = 12; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Calculate grid position for a set
  const getSetPosition = (set: Set) => {
    const startMinutes = timeToMinutes(set.start_time)
    const endMinutes = set.end_time ? timeToMinutes(set.end_time) : startMinutes + 60
    const startSlot = Math.floor((startMinutes - 12 * 60) / 15)
    const duration = endMinutes - startMinutes
    const heightSlots = Math.max(1, Math.ceil(duration / 15))
    
    return {
      startSlot,
      heightSlots,
      startMinutes,
      endMinutes,
    }
  }

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

        {/* Timetable Grid */}
        {!selectedDay ? (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              {days.length === 0 ? 'No days available for this festival.' : 'Select a day to view the schedule'}
            </p>
          </div>
        ) : stages.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No schedule available for this day yet.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Timetable Grid */}
                <div className="border-2 border-rose-300 dark:border-rose-700 rounded-lg bg-rose-50 dark:bg-rose-950" style={{ overflow: 'visible' }}>
                  {/* Header with stage names */}
                  <div className="grid bg-rose-200 dark:bg-rose-900/40" style={{ gridTemplateColumns: `80px repeat(${stages.length}, minmax(120px, 1fr))` }}>
                    <div className="p-3 font-bold text-rose-900 dark:text-rose-100 border-r-2 border-rose-300 dark:border-rose-700">
                      Time
                    </div>
                    {stages.map((stage) => (
                      <div
                        key={stage.id}
                        className="p-3 font-bold text-rose-900 dark:text-rose-100 border-r-2 border-rose-300 dark:border-rose-700 last:border-r-0"
                      >
                        <span className="text-sm break-words">{stage.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Time slots and sets */}
                  <div className="relative" style={{ overflow: 'visible' }}>
                    {timeSlots.map((timeSlot, slotIndex) => {
                      const [hours, minutes] = timeSlot.split(':').map(Number)
                      const isHourMark = minutes === 0
                      const displayTime = isHourMark ? formatTime(timeSlot) : ''

                      return (
                        <div
                          key={timeSlot}
                          className="grid border-b border-slate-200 dark:border-slate-700 relative"
                          style={{ 
                            gridTemplateColumns: `80px repeat(${stages.length}, minmax(120px, 1fr))`, 
                            minHeight: '24px',
                            overflow: 'visible'
                          }}
                        >
                          {/* Time column */}
                          <div className="p-1.5 text-xs font-medium text-rose-800 dark:text-rose-200 border-r-2 border-rose-300 dark:border-rose-700 bg-rose-100 dark:bg-rose-900/30">
                            {displayTime}
                          </div>

                          {/* Stage columns - render sets with absolute positioning */}
                          {stages.map((stage) => {
                            const stageSets = sets.filter(s => s.stage_id === stage.id)
                            
                            // Find sets that start at this slot
                            const setsStartingHere = stageSets.filter(set => {
                              const pos = getSetPosition(set)
                              return slotIndex === pos.startSlot
                            })

                            return (
                              <div
                                key={`${stage.id}-slot-${slotIndex}`}
                                className="border-r-2 border-rose-300 dark:border-rose-700 last:border-r-0 bg-white dark:bg-rose-950/50 relative"
                                style={{ overflow: 'visible' }}
                              >
                                {setsStartingHere.map((set) => {
                                  const pos = getSetPosition(set)
                                  const heightPx = pos.heightSlots * 24 // 24px per 15-min slot
                                  const isShort = heightPx < 60
                                  const isVeryShort = heightPx < 40
                                  
                                  return (
                                    <div
                                      key={set.id}
                                      className="absolute left-1 right-1 top-0.5 bg-rose-200 dark:bg-rose-800 border-2 border-rose-400 dark:border-rose-600 rounded-md text-center shadow-sm z-10"
                                      style={{ 
                                        height: `${heightPx}px`,
                                        minHeight: '32px',
                                        padding: isVeryShort ? '4px 6px' : isShort ? '6px 8px' : '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        overflow: 'hidden'
                                      }}
                                      title={`${set.artist_name}${set.end_time ? ` (${formatTime(set.start_time)} - ${formatTime(set.end_time)})` : ` (${formatTime(set.start_time)})`}`}
                                    >
                                      <div 
                                        className={`font-semibold text-rose-900 dark:text-rose-50 ${
                                          isVeryShort ? 'text-xs' : isShort ? 'text-xs' : 'text-sm'
                                        }`}
                                        style={{ 
                                          wordBreak: 'break-word',
                                          overflowWrap: 'break-word',
                                          lineHeight: '1.3',
                                          overflow: isVeryShort || isShort ? 'hidden' : 'visible',
                                          ...(isVeryShort || isShort ? {
                                            display: '-webkit-box',
                                            WebkitLineClamp: isVeryShort ? 1 : 2,
                                            WebkitBoxOrient: 'vertical',
                                            textOverflow: 'ellipsis'
                                          } : {})
                                        }}
                                      >
                                        {set.artist_name}
                                      </div>
                                      {!isVeryShort && (
                                        <div 
                                          className={`text-rose-700 dark:text-rose-300 mt-1 flex-shrink-0 ${
                                            isShort ? 'text-[10px]' : 'text-xs'
                                          }`}
                                          style={{
                                            lineHeight: '1.2'
                                          }}
                                        >
                                          {formatTime(set.start_time)}
                                          {set.end_time && ` - ${formatTime(set.end_time)}`}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

