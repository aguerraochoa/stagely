'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewGroupPage() {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const generateInviteCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                throw new Error('Not authenticated')
            }

            // 1. Create Group
            const inviteCode = generateInviteCode()
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .insert({
                    name,
                    created_by: user.id,
                    invite_code: inviteCode
                })
                .select()
                .single()

            if (groupError) throw groupError

            // 2. Add creator as member
            const { error: memberError } = await supabase
                .from('group_members')
                .insert({
                    group_id: group.id,
                    user_id: user.id
                })

            if (memberError) throw memberError

            router.push(`/groups/${group.id}`)
        } catch (error) {
            console.error('Error creating group:', error)
            alert('Failed to create group. Please try again.')
        } finally {
            setLoading(false)
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
                            <Link href="/groups" className="text-retro-dark font-black uppercase tracking-wider text-xs hover:text-retro-orange">
                                My Groups
                            </Link>
                            <span className="text-retro-dark/50 font-bold">/</span>
                            <span className="text-retro-dark font-bold uppercase tracking-wider text-xs">New Squad</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-md mx-auto px-4 py-12">
                <div className="bg-white border-2 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] rounded-xl p-8">
                    <h1 className="text-3xl font-black text-retro-dark mb-6 uppercase italic tracking-tighter">
                        Create New Squad
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-black text-retro-dark uppercase tracking-wider mb-2">
                                Squad Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. The Rave Cave"
                                required
                                className="w-full px-4 py-3 border-2 border-retro-dark rounded-lg bg-white text-retro-dark font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all placeholder-retro-dark/30"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-4 bg-retro-orange hover:bg-retro-dark text-white border-2 border-retro-dark font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:shadow-[6px_6px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Squad'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}
