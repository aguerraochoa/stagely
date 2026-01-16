'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function JoinGroupPage() {
    const [inviteCode, setInviteCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const supabase = createClient()

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Check User
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // 2. Find Group by Invite Code
            // Note: We need RLS to allow finding groups by invite code even if not a member yet.
            // Current RLS says "View IF member". This is a problem.
            // We need a specific "search by invite code" capability.
            // Or we use a Security Definer RPC function to 'redeem' the code.
            // Let's try RPC for safety.

            const { data, error } = await supabase.rpc('join_group_by_code', {
                code_input: inviteCode.toUpperCase()
            })

            if (error) throw error

            // RPC returns the group_id if success
            const newGroupId = data

            router.push(`/groups/${newGroupId}`)

        } catch (err: any) {
            console.error('Error joining group:', err)
            setError(err.message || 'Failed to join group. Check the code and try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-retro-cream text-retro-dark flex flex-col">
            <nav className="bg-white border-b-2 border-retro-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/groups" className="text-2xl font-black uppercase italic tracking-tighter text-retro-dark">
                        Stagely
                    </Link>
                    <Link href="/groups" className="text-sm font-black uppercase tracking-wider text-retro-orange hover:text-retro-dark">
                        Cancel
                    </Link>
                </div>
            </nav>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white border-2 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] rounded-xl p-8">
                    <h1 className="text-3xl font-black text-retro-dark mb-2 text-center uppercase italic tracking-tighter">
                        Join a Squad
                    </h1>
                    <p className="text-retro-dark font-bold opacity-70 mb-8 text-center">
                        Enter the 6-character invite code shared by your friend.
                    </p>

                    <form onSubmit={handleJoin} className="space-y-6">
                        <div>
                            <label htmlFor="code" className="block text-sm font-black text-retro-dark uppercase tracking-wider mb-2">
                                Invite Code
                            </label>
                            <input
                                type="text"
                                id="code"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                maxLength={6}
                                placeholder="ABCD12"
                                className="w-full px-4 py-4 text-center text-3xl tracking-[0.5em] uppercase font-black rounded-lg border-2 border-retro-dark bg-white text-retro-dark focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-0.5 outline-none transition-all placeholder-retro-dark/20"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-100 border-2 border-retro-dark text-retro-dark font-bold text-sm rounded-lg text-center shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || inviteCode.length < 6}
                            className="w-full py-4 px-4 bg-retro-orange hover:bg-retro-dark disabled:opacity-50 disabled:cursor-not-allowed text-white border-2 border-retro-dark font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:shadow-[6px_6px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 transition-all flex justify-center items-center"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                'Join Squad'
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    )
}
