'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Group = {
    id: string
    name: string
    created_at: string
    _count?: {
        members: number
    }
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchGroups = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // 1. Get my memberships
            const { data: memberships, error: membershipError } = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', user.id)

            if (membershipError) {
                console.error('Error fetching memberships:', membershipError)
                setLoading(false)
                return
            }

            const groupIds = memberships.map(m => m.group_id)

            if (groupIds.length > 0) {
                // 2. Get group details
                // Note: Supabase doesn't easily support count in the same query without foreign key setup,
                // so for MVP we'll just fetch groups first.
                const { data: groupsData, error: groupsError } = await supabase
                    .from('groups')
                    .select('id, name, created_at')
                    .in('id', groupIds)
                    .order('created_at', { ascending: false })

                if (groupsError) {
                    console.error('Error fetching groups:', groupsError)
                } else {
                    setGroups(groupsData || [])
                }
            }

            setLoading(false)
        }

        fetchGroups()
    }, [router, supabase])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
        )
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
                            <span className="text-retro-dark font-bold uppercase tracking-widest text-xs">My Groups</span>
                        </div>
                        <Link
                            href="/"
                            className="px-4 py-2 text-sm font-black uppercase tracking-wider text-retro-dark hover:text-retro-orange transition-colors"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-5xl font-black text-retro-dark mb-2 uppercase italic tracking-tighter">
                            My Squads
                        </h1>
                        <p className="text-retro-dark font-bold opacity-70">
                            Manage your festival groups
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/groups/join"
                            className="px-6 py-3 bg-white border-2 border-retro-dark text-retro-dark font-black uppercase tracking-wider hover:bg-retro-cream shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] hover:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 transition-all"
                        >
                            Join w/ Code
                        </Link>
                        <Link
                            href="/groups/new"
                            className="px-6 py-3 bg-retro-orange text-white border-2 border-retro-dark font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] hover:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 transition-all"
                        >
                            + Create Squad
                        </Link>
                    </div>
                </div>

                {groups.length === 0 ? (
                    <div className="bg-white border-2 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] rounded-xl p-12 text-center">
                        <div className="w-16 h-16 bg-retro-cream border-2 border-retro-dark rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🌵</span>
                        </div>
                        <h3 className="text-xl font-black text-retro-dark mb-2 uppercase italic">No squads yet</h3>
                        <p className="text-retro-dark opacity-70 mb-8 max-w-sm mx-auto font-medium">
                            Create a group to start planning your next festival adventure with friends!
                        </p>
                        <Link
                            href="/groups/new"
                            className="inline-block px-8 py-3 bg-retro-orange text-white border-2 border-retro-dark font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(26,44,50,1)] transition-all"
                        >
                            Create Squad
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map((group) => (
                            <Link
                                key={group.id}
                                href={`/groups/${group.id}`}
                                className="block bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-xl p-6 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-2xl font-black text-retro-dark uppercase italic">
                                        {group.name}
                                    </h2>
                                </div>
                                <div className="flex items-center text-xs font-bold text-retro-dark/50 uppercase tracking-widest">
                                    <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
