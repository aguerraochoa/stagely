'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewFestivalPage() {
  const [name, setName] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to create a festival')
      setLoading(false)
      return
    }

    // Create festival
    const { data, error: festivalError } = await supabase
      .from('festivals')
      .insert({
        name,
        year,
        created_by: user.id,
      })
      .select()
      .single()

    if (festivalError) {
      setError(festivalError.message)
      setLoading(false)
      return
    }

    // Redirect to festival management page
    router.push(`/admin/festivals/${data.id}`)
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
              <span className="text-retro-dark font-bold uppercase tracking-wider text-xs">New Festival</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-black text-retro-dark mb-6 uppercase italic tracking-tighter">
          Create New Festival
        </h1>

        <form onSubmit={handleSubmit} className="bg-white border-2 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] rounded-xl p-8 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-retro-orange text-white font-bold border-2 border-retro-dark">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
              Festival Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-retro-dark rounded-lg bg-white text-retro-dark font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all placeholder-retro-dark/30 disabled:opacity-50"
              placeholder="e.g., Coachella, Lollapalooza, Tecate Pa'l Norte"
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-xs font-black text-retro-dark uppercase tracking-wider mb-2">
              Year *
            </label>
            <input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              required
              disabled={loading}
              min="2020"
              max="2100"
              className="w-full px-4 py-3 border-2 border-retro-dark rounded-lg bg-white text-retro-dark font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all placeholder-retro-dark/30 disabled:opacity-50"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-retro-orange hover:bg-retro-dark text-white border-2 border-retro-dark font-black uppercase tracking-wider rounded-lg shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:shadow-[6px_6px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Festival'}
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 bg-white hover:bg-retro-cream text-retro-dark border-2 border-retro-dark font-black uppercase tracking-wider rounded-lg transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}

