'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import type { Festival, FestivalDay, Stage, Set } from '@/types/database.types'

export default function FestivalManagementPage() {
  const params = useParams()
  const festivalId = params.id as string
  const router = useRouter()
  const supabase = createClient()

  const [festival, setFestival] = useState<Festival | null>(null)
  const [days, setDays] = useState<FestivalDay[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [stages, setStages] = useState<Record<string, Stage[]>>({})
  const [sets, setSets] = useState<Record<string, Set[]>>({})

  // CSV Import state
  const [showCSVImport, setShowCSVImport] = useState(false)
  const [csvContent, setCsvContent] = useState('')
  const [importDayName, setImportDayName] = useState('')
  const [importDate, setImportDate] = useState('')
  const [importing, setImporting] = useState(false)

  // Edit state
  const [editingSet, setEditingSet] = useState<Set | null>(null)
  const [editingSetArtist, setEditingSetArtist] = useState('')
  const [editingSetStart, setEditingSetStart] = useState('')
  const [editingSetEnd, setEditingSetEnd] = useState('')
  const [editingStage, setEditingStage] = useState<Stage | null>(null)
  const [editingStageName, setEditingStageName] = useState('')
  const [editingFestival, setEditingFestival] = useState(false)
  const [festivalName, setFestivalName] = useState('')
  const [festivalYear, setFestivalYear] = useState(0)
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [editingDayName, setEditingDayName] = useState('')
  const [editingDayDate, setEditingDayDate] = useState('')
  const [festivalStart, setFestivalStart] = useState('12:00')
  const [festivalEnd, setFestivalEnd] = useState('23:59')

  useEffect(() => {
    fetchFestival()
  }, [festivalId])

  useEffect(() => {
    if (selectedDay) {
      fetchStagesAndSets(selectedDay)
    }
  }, [selectedDay])

  const fetchFestival = async () => {
    const { data, error } = await supabase
      .from('festivals')
      .select('*')
      .eq('id', festivalId)
      .single()

    if (error) {
      console.error('Error fetching festival:', error)
      router.push('/admin')
      return
    }

    setFestival(data)
    setFestivalName(data.name)
    setFestivalYear(data.year)
    setFestivalStart(data.start_time || '12:00')
    setFestivalEnd(data.end_time || '23:59')

    // Fetch days
    const { data: daysData, error: daysError } = await supabase
      .from('festival_days')
      .select('*')
      .eq('festival_id', festivalId)
      .order('date', { ascending: true, nullsFirst: true })

    if (!daysError && daysData) {
      setDays(daysData)
      if (daysData.length > 0) {
        setSelectedDay(daysData[0].id)
      }
    }

    setLoading(false)
  }

  const fetchStagesAndSets = async (dayId: string) => {
    // Fetch stages
    const { data: stagesData } = await supabase
      .from('stages')
      .select('*')
      .eq('festival_day_id', dayId)
      .order('order_index', { ascending: true })

    if (stagesData) {
      setStages(prev => ({ ...prev, [dayId]: stagesData }))
    }

    // Fetch sets
    const { data: setsData } = await supabase
      .from('sets')
      .select('*')
      .eq('festival_day_id', dayId)
      .order('start_time', { ascending: true })

    if (setsData) {
      setSets(prev => ({ ...prev, [dayId]: setsData }))
    }
  }

  const handleAddDay = async () => {
    const dayName = prompt('Enter day name (e.g., "Friday", "Day 1"):')
    if (!dayName) return

    const { data, error } = await supabase
      .from('festival_days')
      .insert({
        festival_id: festivalId,
        day_name: dayName,
      })
      .select()
      .single()

    if (error) {
      alert('Error creating day: ' + error.message)
      return
    }

    setDays([...days, data])
    setSelectedDay(data.id)
  }

  const handleEditFestival = async () => {
    if (!festival) return

    if (!festivalName.trim()) {
      alert('Festival name cannot be empty')
      return
    }

    if (festivalYear < 2020 || festivalYear > 2100) {
      alert('Please enter a valid year')
      return
    }

    const { error } = await supabase
      .from('festivals')
      .update({
        name: festivalName.trim(),
        year: festivalYear,
        start_time: festivalStart,
        end_time: festivalEnd,
      })
      .eq('id', festivalId)

    if (error) {
      alert('Error updating festival: ' + error.message)
      return
    }

    setFestival({ ...festival, name: festivalName.trim(), year: festivalYear })
    setEditingFestival(false)
  }

  const handleStartEditDay = (day: FestivalDay) => {
    setEditingDay(day.id)
    setEditingDayName(day.day_name)
    setEditingDayDate(day.date || '')
  }

  const handleSaveDay = async (dayId: string) => {
    if (!editingDayName.trim()) {
      alert('Day name cannot be empty')
      return
    }

    const dateValue = editingDayDate.trim() || null

    const { error } = await supabase
      .from('festival_days')
      .update({
        day_name: editingDayName.trim(),
        date: dateValue,
      })
      .eq('id', dayId)

    if (error) {
      alert('Error updating day: ' + error.message)
      return
    }

    // Update in state
    setDays(days.map(d => d.id === dayId ? { ...d, day_name: editingDayName.trim(), date: dateValue } : d))
    setEditingDay(null)
    setEditingDayName('')
    setEditingDayDate('')
  }

  const handleCancelEditDay = () => {
    setEditingDay(null)
    setEditingDayName('')
    setEditingDayDate('')
  }

  const handleDeleteDay = async (dayId: string) => {
    const day = days.find(d => d.id === dayId)
    if (!day) return

    if (!confirm(`Are you sure you want to delete "${day.day_name}"? This will delete all stages and sets for this day.`)) {
      return
    }

    const { error } = await supabase
      .from('festival_days')
      .delete()
      .eq('id', dayId)

    if (error) {
      alert('Error deleting day: ' + error.message)
      return
    }

    // Remove from state
    const newDays = days.filter(d => d.id !== dayId)
    setDays(newDays)

    // Clear stages and sets for this day
    setStages(prev => {
      const updated = { ...prev }
      delete updated[dayId]
      return updated
    })
    setSets(prev => {
      const updated = { ...prev }
      delete updated[dayId]
      return updated
    })

    // Select first remaining day or clear selection
    if (newDays.length > 0) {
      setSelectedDay(newDays[0].id)
    } else {
      setSelectedDay(null)
    }
  }

  const handleAddStage = async (dayId: string) => {
    const stageName = prompt('Enter stage name:')
    if (!stageName) return

    const currentStages = stages[dayId] || []
    const orderIndex = currentStages.length

    const { data, error } = await supabase
      .from('stages')
      .insert({
        festival_day_id: dayId,
        name: stageName,
        order_index: orderIndex,
      })
      .select()
      .single()

    if (error) {
      alert('Error creating stage: ' + error.message)
      return
    }

    setStages(prev => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), data]
    }))
  }

  const handleStartEditStage = (stage: Stage) => {
    setEditingStage(stage)
    setEditingStageName(stage.name)
  }

  const handleSaveStage = async () => {
    if (!editingStage) return

    if (!editingStageName.trim()) {
      alert('Stage name cannot be empty')
      return
    }

    const { error } = await supabase
      .from('stages')
      .update({ name: editingStageName.trim() })
      .eq('id', editingStage.id)

    if (error) {
      alert('Error updating stage: ' + error.message)
      return
    }

    if (selectedDay) {
      await fetchStagesAndSets(selectedDay)
    }

    setEditingStage(null)
    setEditingStageName('')
  }

  const handleCancelEditStage = () => {
    setEditingStage(null)
    setEditingStageName('')
  }

  const handleDeleteStage = async (stageId: string) => {
    if (!confirm('Are you sure? This will delete all sets on this stage.')) return

    const { error } = await supabase
      .from('stages')
      .delete()
      .eq('id', stageId)

    if (error) {
      alert('Error deleting stage: ' + error.message)
      return
    }

    if (selectedDay) {
      await fetchStagesAndSets(selectedDay)
    }
  }

  const handleAddSet = async (dayId: string, stageId: string) => {
    const artistName = prompt('Enter artist name:')
    if (!artistName) return

    const startTime = prompt('Enter start time (HH:MM format, e.g., 14:30):')
    if (!startTime) return

    const endTime = prompt('Enter end time (HH:MM format, e.g., 15:30) or leave empty:') || null

    const { data, error } = await supabase
      .from('sets')
      .insert({
        festival_day_id: dayId,
        stage_id: stageId,
        artist_name: artistName,
        start_time: startTime,
        end_time: endTime,
      })
      .select()
      .single()

    if (error) {
      alert('Error creating set: ' + error.message)
      return
    }

    setSets(prev => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), data].sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      )
    }))
  }

  const handleStartEditSet = (set: Set) => {
    setEditingSet(set)
    setEditingSetArtist(set.artist_name)
    setEditingSetStart(set.start_time)
    setEditingSetEnd(set.end_time || '')
  }

  const handleSaveSet = async () => {
    if (!editingSet) return

    if (!editingSetArtist.trim()) {
      alert('Artist name cannot be empty')
      return
    }

    if (!editingSetStart.trim()) {
      alert('Start time cannot be empty')
      return
    }

    const { error } = await supabase
      .from('sets')
      .update({
        artist_name: editingSetArtist.trim(),
        start_time: editingSetStart.trim(),
        end_time: editingSetEnd.trim() || null,
      })
      .eq('id', editingSet.id)

    if (error) {
      alert('Error updating set: ' + error.message)
      return
    }

    if (selectedDay) {
      await fetchStagesAndSets(selectedDay)
    }

    setEditingSet(null)
    setEditingSetArtist('')
    setEditingSetStart('')
    setEditingSetEnd('')
  }

  const handleCancelEditSet = () => {
    setEditingSet(null)
    setEditingSetArtist('')
    setEditingSetStart('')
    setEditingSetEnd('')
  }

  const handleDeleteSet = async (setId: string) => {
    if (!confirm('Are you sure you want to delete this set?')) return

    const { error } = await supabase
      .from('sets')
      .delete()
      .eq('id', setId)

    if (error) {
      alert('Error deleting set: ' + error.message)
      return
    }

    if (selectedDay) {
      await fetchStagesAndSets(selectedDay)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setCsvContent(text)
    }
    reader.readAsText(file)
  }

  const handleCSVImport = async () => {
    if (!importDayName.trim()) {
      alert('Please enter a day name')
      return
    }

    if (!csvContent.trim()) {
      alert('Please paste CSV content or upload a file')
      return
    }

    setImporting(true)

    try {
      // Parse CSV
      const lines = csvContent.trim().split('\n')
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim())

      // Find column indices
      const stageIdx = headers.indexOf('stage')
      const artistIdx = headers.indexOf('artist')
      const startIdx = headers.indexOf('start_time')
      const endIdx = headers.indexOf('end_time')

      if (stageIdx === -1 || artistIdx === -1 || startIdx === -1 || endIdx === -1) {
        throw new Error('CSV must have columns: stage, artist, start_time, end_time')
      }

      // Create or get the day
      let dayId: string
      const existingDay = days.find(d => d.day_name === importDayName)

      if (existingDay) {
        dayId = existingDay.id
      } else {
        const { data: newDay, error: dayError } = await supabase
          .from('festival_days')
          .insert({
            festival_id: festivalId,
            day_name: importDayName,
            date: importDate || null,
          })
          .select()
          .single()

        if (dayError) throw dayError
        dayId = newDay.id
        setDays([...days, newDay])
      }

      // Group sets by stage
      const stageSets: Record<string, Array<{ artist: string, start: string, end: string | null }>> = {}

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = line.split(',').map(v => v.trim())
        const stageName = values[stageIdx]
        const artist = values[artistIdx]
        const startTime = values[startIdx]
        const endTime = values[endIdx] || null

        if (!stageName || !artist || !startTime) continue

        if (!stageSets[stageName]) {
          stageSets[stageName] = []
        }

        stageSets[stageName].push({ artist, start: startTime, end: endTime })
      }

      // Fetch existing stages for this day to avoid duplicates
      const { data: existingStagesData } = await supabase
        .from('stages')
        .select('*')
        .eq('festival_day_id', dayId)
        .order('order_index', { ascending: true })

      const existingStages = existingStagesData || []
      let orderIndex = existingStages.length

      for (const [stageName, sets] of Object.entries(stageSets)) {
        // Check if stage exists (case-insensitive comparison)
        let stage = existingStages.find(s => s.name.toLowerCase() === stageName.toLowerCase())

        if (!stage) {
          // Create stage
          const { data: newStage, error: stageError } = await supabase
            .from('stages')
            .insert({
              festival_day_id: dayId,
              name: stageName,
              order_index: orderIndex++,
            })
            .select()
            .single()

          if (stageError) {
            // If error is duplicate, try to fetch the existing stage
            if (stageError.code === '23505') {
              const { data: existingStage } = await supabase
                .from('stages')
                .select('*')
                .eq('festival_day_id', dayId)
                .eq('name', stageName)
                .single()

              if (existingStage) {
                stage = existingStage
              } else {
                throw stageError
              }
            } else {
              throw stageError
            }
          } else {
            stage = newStage
            existingStages.push(newStage) // Add to our list to avoid duplicates in same import
          }
        }

        // Create sets for this stage
        const setsToInsert = sets
          .filter(s => s.start) // Only sets with start time
          .map(s => ({
            festival_day_id: dayId,
            stage_id: stage!.id,
            artist_name: s.artist,
            start_time: s.start,
            end_time: s.end || null,
          }))

        if (setsToInsert.length > 0) {
          const { error: setsError } = await supabase
            .from('sets')
            .insert(setsToInsert)

          if (setsError) throw setsError
        }
      }

      // Refresh data
      await fetchStagesAndSets(dayId)
      setSelectedDay(dayId)
      setShowCSVImport(false)
      setCsvContent('')
      setImportDayName('')
      setImportDate('')
      alert('CSV imported successfully!')
    } catch (error: any) {
      alert('Error importing CSV: ' + error.message)
      console.error(error)
    } finally {
      setImporting(false)
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

  const currentStages = selectedDay ? (stages[selectedDay] || []) : []
  const currentSets = selectedDay ? (sets[selectedDay] || []) : []

  // Helper functions for timetable grid
  const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + (minutes || 0)
  }

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Generate time slots based on festival start/end
  const generateTimeSlots = (): string[] => {
    const slots: string[] = []
    const startMin = timeToMinutes(festivalStart)
    const endMin = timeToMinutes(festivalEnd)

    // Adjust for overnight festivals (e.g., 2:00 PM to 4:00 AM)
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

  const timeSlots = generateTimeSlots()

  // Calculate grid position for a set
  const getSetPosition = (set: Set) => {
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

  return (
    <div className="min-h-screen bg-retro-cream text-retro-dark">
      <nav className="bg-white border-b-2 border-retro-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-black uppercase italic tracking-tighter text-retro-dark">
                Stagely
              </Link>
              <div className="h-6 w-0.5 bg-retro-dark"></div>
              <Link href="/admin" className="text-retro-dark font-bold uppercase tracking-wider text-xs hover:text-retro-orange">
                Admin
              </Link>
              <span className="text-retro-dark/50 font-bold">/</span>
              <span className="text-retro-dark font-bold uppercase tracking-wider text-xs truncate max-w-[150px] md:max-w-none">{festival.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          {editingFestival ? (
            <div className="bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] p-4 rounded-lg mb-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                    Festival Name
                  </label>
                  <input
                    type="text"
                    value={festivalName}
                    onChange={(e) => setFestivalName(e.target.value)}
                    className="w-full px-4 py-3 text-lg font-bold text-retro-dark border-2 border-retro-dark rounded-lg bg-white focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                    Hours (Start - End)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={festivalStart}
                      onChange={(e) => setFestivalStart(e.target.value)}
                      className="flex-1 px-4 py-3 text-lg font-bold text-retro-dark border-2 border-retro-dark rounded-lg bg-white focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] outline-none transition-all"
                    />
                    <input
                      type="time"
                      value={festivalEnd}
                      onChange={(e) => setFestivalEnd(e.target.value)}
                      className="flex-1 px-4 py-3 text-lg font-bold text-retro-dark border-2 border-retro-dark rounded-lg bg-white focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEditFestival}
                  className="px-4 py-2 bg-retro-orange hover:bg-retro-dark text-white border-2 border-retro-dark font-black uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditingFestival(false)
                    setFestivalName(festival.name)
                    setFestivalYear(festival.year)
                  }}
                  className="px-4 py-2 bg-white hover:bg-retro-cream text-retro-dark border-2 border-retro-dark font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl md:text-3xl font-black text-retro-dark uppercase italic tracking-tighter">
                {festival.name} {festival.year}
              </h1>
              <button
                onClick={() => {
                  setEditingFestival(true)
                  setFestivalName(festival.name)
                  setFestivalYear(festival.year)
                }}
                className="px-3 py-1 text-sm bg-white hover:bg-retro-cream text-retro-dark border-2 border-retro-dark font-bold rounded-lg transition-all"
                title="Edit festival name and year"
              >
                ✏️ Edit
              </button>
            </div>
          )}
          <p className="text-retro-dark font-bold opacity-70">
            Manage days, stages, and sets for this festival
          </p>
        </div>

        {/* CSV Import Section */}
        <div className="mb-6 bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-retro-dark uppercase italic tracking-tight">
              Import from CSV
            </h2>
            <button
              onClick={() => {
                setShowCSVImport(!showCSVImport)
                if (showCSVImport) {
                  setCsvContent('')
                  setImportDayName('')
                  setImportDate('')
                }
              }}
              className="px-4 py-2 text-sm bg-retro-orange text-white border-2 border-retro-dark font-black uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] transition-all"
            >
              {showCSVImport ? 'Cancel' : '+ Import CSV'}
            </button>
          </div>

          {showCSVImport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Day Name *
                  </label>
                  <input
                    type="text"
                    value={importDayName}
                    onChange={(e) => setImportDayName(e.target.value)}
                    placeholder="e.g., Day 1, Friday"
                    className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date (optional)
                  </label>
                  <input
                    type="date"
                    value={importDate}
                    onChange={(e) => setImportDate(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  CSV Content *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 dark:file:bg-rose-900/30 dark:file:text-rose-400"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 self-center">
                    Or paste CSV below
                  </span>
                </div>
                <textarea
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder="stage,artist,start_time,end_time"
                  rows={10}
                  className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Format: stage,artist,start_time,end_time (one per line). End time can be empty.
                </p>
              </div>

              <button
                onClick={handleCSVImport}
                disabled={importing || !importDayName.trim() || !csvContent.trim()}
                className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {importing ? 'Importing...' : 'Import CSV'}
              </button>
            </div>
          )}
        </div>

        {/* Days Tabs at Top */}
        <div className="bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] p-6 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-black text-retro-dark uppercase italic tracking-tight">Days</h2>
            <button
              onClick={handleAddDay}
              className="px-4 py-2 text-sm bg-retro-teal text-retro-dark border-2 border-retro-dark font-black uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] transition-all"
            >
              + Add Day
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {days.map((day) => (
              editingDay === day.id ? (
                <div key={day.id} className="bg-white p-4 rounded-xl border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] flex items-center gap-3">
                  <input
                    type="text"
                    value={editingDayName}
                    onChange={(e) => setEditingDayName(e.target.value)}
                    className="px-4 py-2 text-sm font-bold text-retro-dark border-2 border-retro-dark rounded-lg bg-white focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all"
                    placeholder="Day name"
                    autoFocus
                  />
                  <input
                    type="date"
                    value={editingDayDate}
                    onChange={(e) => setEditingDayDate(e.target.value)}
                    className="px-4 py-2 text-xs text-retro-dark border-2 border-retro-dark rounded-lg bg-white focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all"
                  />
                  <button
                    onClick={() => handleSaveDay(day.id)}
                    className="px-4 py-2 text-xs bg-retro-teal text-retro-dark border-2 border-retro-dark rounded-lg font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] transition-all"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEditDay}
                    className="px-4 py-2 text-xs bg-white hover:bg-retro-cream text-retro-dark border-2 border-retro-dark rounded-lg font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${editingDayName}"? This will also delete all stages and sets for this day.`)) {
                        handleDeleteDay(day.id)
                        handleCancelEditDay()
                      }
                    }}
                    className="px-4 py-2 text-xs bg-retro-orange text-white border-2 border-retro-dark rounded-lg font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] transition-all"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div
                  key={day.id}
                  className={`group relative inline-flex items-center px-5 py-3 rounded-lg border-2 border-retro-dark transition-all ${selectedDay === day.id
                    ? 'bg-retro-teal text-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] -translate-y-1'
                    : 'bg-white text-retro-dark hover:bg-retro-cream shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]'
                    }`}
                >
                  <button
                    onClick={() => setSelectedDay(day.id)}
                    className="text-left flex-1"
                  >
                    <div className="font-black text-sm uppercase tracking-tight">
                      {day.day_name}
                    </div>
                    {day.date && (
                      <div className="text-xs mt-0.5 font-bold opacity-70">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartEditDay(day)
                    }}
                    className={`ml-2 p-1.5 rounded-md transition-all text-retro-dark hover:bg-retro-cream opacity-0 group-hover:opacity-100 ${selectedDay === day.id ? 'opacity-100' : ''}`}
                    title="Edit day"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18.14 4.487a1.125 1.125 0 00-1.591-1.591l-1.688 1.687"
                      />
                    </svg>
                  </button>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Timetable Grid Panel - Full Width */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          {!selectedDay ? (
            <p className="text-retro-dark font-bold opacity-70 text-center py-8">
              Select a day to view the timetable
            </p>
          ) : currentStages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-retro-dark font-bold opacity-70 mb-4">
                No stages yet. Add your first stage or import from CSV!
              </p>
              <button
                onClick={() => handleAddStage(selectedDay)}
                className="px-4 py-2 bg-retro-orange text-white border-2 border-retro-dark font-black uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] transition-all"
              >
                + Add Stage
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Add Stage button at Top */}
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => handleAddStage(selectedDay)}
                    className="px-4 py-2 text-sm bg-retro-teal text-retro-dark border-2 border-retro-dark font-black uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] transition-all hover:-translate-y-0.5"
                  >
                    + Add Stage
                  </button>
                </div>
                {/* Timetable Grid */}
                <div className="border-2 border-retro-dark rounded-lg overflow-hidden bg-retro-cream">
                  {/* Header with stage names */}
                  <div className="grid bg-retro-cream border-b-2 border-retro-dark" style={{ gridTemplateColumns: `80px repeat(${currentStages.length}, 1fr)` }}>
                    <div className="p-3 font-black text-retro-dark border-r-2 border-retro-dark uppercase tracking-wider text-xs">
                      Time
                    </div>
                    {currentStages.map((stage) => (
                      <div
                        key={stage.id}
                        className="p-1 font-black text-retro-dark border-l-2 border-retro-dark last:border-r-0 flex flex-col items-center"
                      >
                        <button
                          onClick={() => handleStartEditStage(stage)}
                          className="w-full p-2 hover:bg-white transition-all cursor-pointer text-center"
                        >
                          <span className="text-sm uppercase tracking-tight">{stage.name}</span>
                        </button>
                        <button
                          onClick={() => handleAddSet(selectedDay, stage.id)}
                          className="mt-1 w-full py-1 text-[10px] bg-white hover:bg-retro-orange hover:text-white border border-retro-dark uppercase tracking-widest transition-all"
                        >
                          + Add Artist
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Time slots and sets */}
                  <div className="relative">
                    {timeSlots.map((timeSlot, slotIndex) => {
                      const [hours, minutes] = timeSlot.split(':').map(Number)
                      const isHourMark = minutes === 0
                      const displayTime = isHourMark ? formatTime(timeSlot) : ''

                      return (
                        <div
                          key={timeSlot}
                          className="grid border-b border-retro-dark/20 relative"
                          style={{ gridTemplateColumns: `80px repeat(${currentStages.length}, 1fr)`, minHeight: '24px' }}
                        >
                          {/* Time column */}
                          <div className="p-1.5 text-xs font-bold text-retro-dark/50 bg-retro-cream/50 text-right pr-3 border-r-2 border-retro-dark">
                            {displayTime}
                          </div>

                          {/* Stage columns - render sets with absolute positioning */}
                          {currentStages.map((stage, stageIndex) => {
                            const stageSets = currentSets.filter(s => s.stage_id === stage.id)

                            return (
                              <div
                                key={`${stage.id}-slot-${slotIndex}`}
                                className="border-l-2 border-retro-dark last:border-r-0 relative"
                                style={{ overflow: 'visible' }}
                              >
                                {stageSets.filter(set => getSetPosition(set).startSlot === slotIndex).map((set) => {
                                  const pos = getSetPosition(set)
                                  const heightPx = pos.heightSlots * 24 // 24px per 15-min slot
                                  const isShort = heightPx < 60
                                  const isVeryShort = heightPx < 40

                                  return (
                                    <button
                                      key={set.id}
                                      onClick={() => handleStartEditSet(set)}
                                      className="absolute left-1 right-1 top-0.5 bg-white border-2 border-retro-dark rounded-none text-center transition-all cursor-pointer z-10 shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] overflow-hidden flex flex-col items-center justify-center p-1"
                                      style={{
                                        height: `${heightPx}px`,
                                        minHeight: '32px',
                                      }}
                                      title={`${set.artist_name}${set.end_time ? ` (${formatTime(set.start_time)} - ${formatTime(set.end_time)})` : ` (${formatTime(set.start_time)})`}`}
                                    >
                                      <div
                                        className="font-black text-retro-dark uppercase leading-tight truncate w-full"
                                        style={{
                                          fontSize: isVeryShort ? '8px' : isShort ? '10px' : '12px'
                                        }}
                                      >
                                        {set.artist_name}
                                      </div>
                                      {!isVeryShort && (
                                        <div className="text-[10px] font-bold text-retro-dark opacity-70 mt-0.5">
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
          )}
        </div>

        {/* Edit Set Modal */}
        {
          editingSet && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl border-2 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-black text-retro-dark mb-4 uppercase italic tracking-tight">
                  Edit Set
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                      Artist Name *
                    </label>
                    <input
                      type="text"
                      value={editingSetArtist}
                      onChange={(e) => setEditingSetArtist(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-retro-dark rounded-lg bg-white text-retro-dark font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={editingSetStart}
                        onChange={(e) => setEditingSetStart(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-retro-dark rounded-lg bg-white text-retro-dark font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={editingSetEnd}
                        onChange={(e) => setEditingSetEnd(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-retro-dark rounded-lg bg-white text-retro-dark font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveSet}
                      className="flex-1 px-4 py-3 bg-retro-teal text-retro-dark border-2 border-retro-dark font-black uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEditSet}
                      className="flex-1 px-4 py-3 bg-white hover:bg-retro-cream text-retro-dark border-2 border-retro-dark font-bold rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this set?')) {
                          handleDeleteSet(editingSet.id)
                          handleCancelEditSet()
                        }
                      }}
                      className="px-4 py-3 bg-retro-orange text-white border-2 border-retro-dark font-black uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Edit Stage Modal */}
        {
          editingStage && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl border-2 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-black text-retro-dark mb-4 uppercase italic tracking-tight">
                  Edit Stage
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
                      Stage Name *
                    </label>
                    <input
                      type="text"
                      value={editingStageName}
                      onChange={(e) => setEditingStageName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-retro-dark rounded-lg bg-white text-retro-dark font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveStage}
                      className="flex-1 px-4 py-3 bg-retro-teal text-retro-dark border-2 border-retro-dark font-black uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEditStage}
                      className="flex-1 px-4 py-3 bg-white hover:bg-retro-cream text-retro-dark border-2 border-retro-dark font-bold rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure? This will delete all sets on this stage.')) {
                          handleDeleteStage(editingStage.id)
                          handleCancelEditStage()
                        }
                      }}
                      className="px-4 py-3 bg-retro-orange text-white border-2 border-retro-dark font-black uppercase tracking-wider rounded-lg shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      </main >
    </div >
  )
}
