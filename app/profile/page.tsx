'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState({
        display_name: '',
        username: ''
    })
    const [message, setMessage] = useState({ type: '', text: '' })

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login')
                    return
                }
                setUser(user)

                const { data, error } = await supabase
                    .from('profiles')
                    .select('display_name, username')
                    .eq('id', user.id)
                    .single()

                if (error) throw error
                if (data) {
                    setProfile({
                        display_name: data.display_name || '',
                        username: data.username || ''
                    })
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
                setMessage({ type: 'error', text: 'Failed to load profile' })
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [supabase, router])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name: profile.display_name,
                    username: profile.username,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)

            if (error) throw error
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } catch (error: any) {
            console.error('Error updating profile:', error)
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-retro-cream">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-retro-orange"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-retro-cream text-retro-dark">
            <nav className="bg-white border-b-2 border-retro-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <img src="/icon.png" alt="Stagely Logo" className="h-8 w-auto" />
                            </Link>
                            <div className="h-6 w-0.5 bg-retro-dark"></div>
                            <span className="text-retro-dark font-bold uppercase tracking-widest text-xs">Profile Settings</span>
                        </div>
                        <Link
                            href="/"
                            className="px-4 py-2 text-sm font-black uppercase tracking-wider text-retro-dark hover:text-retro-orange transition-colors"
                        >
                            Back Home
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-white border-2 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] rounded-xl p-8">
                    <h1 className="text-4xl font-black text-retro-dark mb-8 uppercase italic tracking-tighter">
                        Your Profile
                    </h1>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-retro-dark/60 mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={profile.display_name}
                                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                                className="w-full px-4 py-3 bg-retro-cream border-2 border-retro-dark rounded-lg font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-1 outline-none transition-all"
                                placeholder="Your full name"
                                required
                            />
                            <p className="mt-2 text-xs text-retro-dark/50 font-medium">
                                This is what your friends will see on the schedule.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-retro-dark/60 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={profile.username}
                                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                className="w-full px-4 py-3 bg-retro-cream border-2 border-retro-dark rounded-lg font-bold focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] focus:-translate-y-1 outline-none transition-all"
                                placeholder="@username"
                                required
                            />
                        </div>

                        {message.text && (
                            <div className={`p-4 border-2 border-retro-dark font-bold text-sm ${message.type === 'success' ? 'bg-retro-teal text-retro-dark' : 'bg-retro-orange text-white'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full px-8 py-4 bg-retro-orange text-white border-2 border-retro-dark font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] transition-all disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
