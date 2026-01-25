'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Priority } from '@/types/database.types'

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

type Profile = {
  id: string
  username?: string
  display_name?: string | null
  avatar_url?: string | null
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

export default function FestivalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [festival, setFestival] = useState<Festival | null>(null)
  const [days, setDays] = useState<FestivalDay[]>([])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [stages, setStages] = useState<Stage[]>([])
  const [sets, setSets] = useState<Set[]>([])
  const [userSelections, setUserSelections] = useState<Record<string, Priority>>({})
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setCurrentUser(user)
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          setProfile(profileData)
        }

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

  // Fetch stages, sets, and user selections when day is selected
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

              // If user is logged in, fetch their selections for these sets
              if (currentUser) {
                const setIds = setsData ? setsData.map(s => s.id) : []
                if (setIds.length > 0) {
                  const { data: selectionsData, error: selectionsError } = await supabase
                    .from('user_selections')
                    .select('set_id, priority')
                    .eq('user_id', currentUser.id)
                    .in('set_id', setIds)

                  if (!selectionsError && selectionsData) {
                    const selectionsMap: Record<string, Priority> = {}
                    selectionsData.forEach(sel => {
                      selectionsMap[sel.set_id] = sel.priority
                    })
                    setUserSelections(prev => ({ ...prev, ...selectionsMap }))
                  }
                }
              }
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
  }, [selectedDay, supabase, currentUser])

  // Toggle priority logic: Red -> Yellow -> Green -> Off
  const togglePriority = async (set: Set) => {
    if (!currentUser) {
      router.push('/login')
      return
    }

    const currentPriority = userSelections[set.id]
    let nextPriority: Priority | null = null

    if (!currentPriority) nextPriority = 'red'
    else if (currentPriority === 'red') nextPriority = 'yellow'
    else if (currentPriority === 'yellow') nextPriority = 'green'
    else nextPriority = null // Toggle off

    // Optimistic update
    setUserSelections(prev => {
      const next = { ...prev }
      if (nextPriority) {
        next[set.id] = nextPriority
      } else {
        delete next[set.id]
      }
      return next
    })

    // Persist to DB
    try {
      if (nextPriority) {
        const { error } = await supabase
          .from('user_selections')
          .upsert({
            user_id: currentUser.id,
            set_id: set.id,
            priority: nextPriority
          }, { onConflict: 'user_id, set_id' })

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_selections')
          .delete()
          .match({ user_id: currentUser.id, set_id: set.id })

        if (error) throw error
      }
    } catch (err) {
      console.error('Error saving selection:', err)
      // Revert optimistic update (simplified for now, could actuaally revert)
    }
  }

  // Helper functions for timetable
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const formatTime = (time: string): string => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Generate time slots based on festival start/end
  const generateTimeSlots = (start?: string, end?: string): string[] => {
    const slots: string[] = []
    const startMin = timeToMinutes(start || '12:00')
    const endMin = timeToMinutes(end || '23:59')

    let actualEndMin = endMin
    if (endMin < startMin) {
      actualEndMin += 24 * 60
    }

    for (let currentMin = startMin; currentMin <= actualEndMin; currentMin += 15) {
      const h = Math.floor((currentMin % (24 * 60)) / 60)
      const m = currentMin % 60
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots((festival as any)?.start_time, (festival as any)?.end_time)

  // Calculate grid position for a set
  const getSetPosition = (set: Set) => {
    const festivalStart = (festival as any)?.start_time || '12:00'
    const festivalStartMin = timeToMinutes(festivalStart)
    const setStartMin = timeToMinutes(set.start_time)

    let adjustedSetStartMin = setStartMin
    if (setStartMin < festivalStartMin) {
      adjustedSetStartMin += 24 * 60
    }

    const startSlot = Math.floor((adjustedSetStartMin - festivalStartMin) / 15)

    const setEndMin = set.end_time ? timeToMinutes(set.end_time) : setStartMin + 60
    let adjustedSetEndMin = setEndMin
    if (setEndMin < setStartMin || (setEndMin < festivalStartMin && setStartMin >= festivalStartMin)) {
      adjustedSetEndMin += 24 * 60
    }

    const duration = adjustedSetEndMin - adjustedSetStartMin
    const heightSlots = Math.max(1, Math.ceil(duration / 15))

    return {
      startSlot,
      heightSlots,
      startMinutes: adjustedSetStartMin,
      endMinutes: adjustedSetEndMin,
    }
  }

  // Get color styles based on priority
  // Get color styles based on priority
  const getPriorityStyles = (priority?: Priority) => {
    switch (priority) {
      case 'green':
        return 'bg-retro-teal text-retro-dark border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]'
      case 'yellow':
        return 'bg-retro-cream text-retro-dark border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]'
      case 'red':
        return 'bg-retro-orange text-white border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]'
      default:
        return 'bg-white text-retro-dark border-retro-dark hover:bg-slate-50'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-retro-orange"></div>
      </div>
    )
  }

  if (!festival) {
    return null
  }

  return (
    <div className="min-h-screen bg-retro-cream text-retro-dark">
      <nav className="bg-white border-b-2 border-retro-dark sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center flex-wrap md:flex-nowrap gap-2">
            <div className="flex items-center gap-4 min-w-0">
              <Link href="/">
                <img src="/icon.png" alt="Stagely Logo" className="h-8 w-auto min-w-[32px]" />
              </Link>
              <div className="h-6 w-0.5 bg-retro-dark/20"></div>
              <span className="text-retro-dark font-black uppercase tracking-widest text-xs truncate">
                {festival?.name}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Profile Link */}
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full border-2 border-retro-dark bg-retro-teal flex items-center justify-center text-[10px] font-black hover:-translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]"
                title="My Profile"
              >
                {(profile || currentUser) ? getInitials(profile || { username: currentUser?.email } as Profile) : '?'}
              </Link>

              <Link
                href="/festivals"
                className="px-4 py-2 text-sm font-black uppercase tracking-wider text-retro-dark hover:text-retro-orange transition-colors"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-retro-dark mb-2 uppercase italic tracking-tighter">
            {festival.name} {festival.year}
          </h1>
          <p className="text-retro-dark font-bold opacity-70">
            Tap artists to plan: <span className="inline-block px-1 bg-retro-orange text-white text-xs font-black border border-retro-dark">cool</span> → <span className="inline-block px-1 bg-retro-cream text-retro-dark text-xs font-black border border-retro-dark">interested</span> → <span className="inline-block px-1 bg-retro-teal text-retro-dark text-xs font-black border border-retro-dark">must go</span>
          </p>
        </div>

        {/* Days Tabs */}
        {days.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pt-2 pb-2">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`flex-shrink-0 px-6 py-3 text-sm font-black uppercase tracking-wider border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] transition-all ${selectedDay === day.id
                  ? 'bg-retro-teal text-retro-dark -translate-y-1 shadow-[6px_6px_0px_0px_rgba(26,44,50,1)]'
                  : 'bg-white text-retro-dark hover:bg-retro-cream hover:-translate-y-0.5'
                  }`}
              >
                {day.day_name}
                <span className="block text-[10px] opacity-70 font-bold">
                  {new Date(day.date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Timetable Grid */}
        {!selectedDay ? (
          <div className="bg-white border-2 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] rounded-xl p-12 text-center">
            <p className="text-retro-dark font-bold">
              Select a day to view the schedule
            </p>
          </div>
        ) : stages.length === 0 ? (
          <div className="bg-white border-2 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] rounded-xl p-12 text-center">
            <p className="text-retro-dark font-bold">
              No schedule available yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border-4 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] overflow-hidden">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Timetable Grid */}
                <div className="bg-white relative" style={{ overflow: 'visible' }}>
                  {/* Header with stage names */}
                  <div className="grid bg-retro-cream border-b-2 border-retro-dark" style={{ gridTemplateColumns: `80px repeat(${stages.length}, minmax(140px, 1fr))` }}>
                    <div className="p-3 text-xs font-black uppercase tracking-wider text-retro-dark">
                      Time
                    </div>
                    {stages.map((stage) => (
                      <div
                        key={stage.id}
                        className="p-3 text-sm font-black uppercase text-retro-dark border-l-2 border-retro-dark"
                      >
                        {stage.name}
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
                          className="grid border-b border-retro-dark/20 relative"
                          style={{
                            gridTemplateColumns: `80px repeat(${stages.length}, minmax(140px, 1fr))`,
                            minHeight: '24px',
                            overflow: 'visible'
                          }}
                        >
                          {/* Time column */}
                          <div className="p-1 text-xs font-bold text-retro-dark/50 bg-retro-cream/50 text-right pr-3 border-r-2 border-retro-dark">
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
                                className="border-l-2 border-retro-dark last:border-r-0 relative"
                                style={{ overflow: 'visible' }}
                              >
                                {setsStartingHere.map((set) => {
                                  const pos = getSetPosition(set)
                                  const heightPx = pos.heightSlots * 24 // 24px per 15-min slot
                                  const isShort = heightPx < 60
                                  const isVeryShort = heightPx < 40
                                  const priority = userSelections[set.id]

                                  return (
                                    <button
                                      key={set.id}
                                      onClick={() => togglePriority(set)}
                                      className={`absolute left-1 right-1 top-0.5 rounded-none border-2 z-10 hover:z-20 hover:scale-[1.02] transition-all overflow-hidden p-1 flex flex-col justify-center items-center ${getPriorityStyles(priority)}`}
                                      style={{
                                        height: `${heightPx}px`,
                                        minHeight: '32px'
                                      }}
                                    >
                                      <div
                                        className="font-black uppercase leading-tight w-full text-center"
                                        style={{
                                          fontSize: isVeryShort ? '8px' : isShort ? '10px' : '12px',
                                          overflow: 'hidden',
                                          display: '-webkit-box',
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: 'vertical'
                                        }}
                                      >
                                        {set.artist_name}
                                      </div>
                                      {!isVeryShort && (
                                        <div className="text-[10px] font-bold opacity-80 mt-0.5">
                                          {formatTime(set.start_time)}
                                        </div>
                                      )}
                                    </button>
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

