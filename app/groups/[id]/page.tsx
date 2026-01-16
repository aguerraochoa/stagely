'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Group = {
    id: string
    name: string
    created_by: string
    invite_code: string
    created_at: string
}

type Profile = {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
}

type Member = {
    user_id: string
    joined_at: string
    profiles: Profile
}

type Festival = {
    id: string
    name: string
    year: number
}

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [group, setGroup] = useState<Group | null>(null)
    const [members, setMembers] = useState<Member[]>([])
    const [festivals, setFestivals] = useState<Festival[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            console.log('GroupDetailPage: Starting fetch for ID:', resolvedParams.id)
            try {
                const { data: { user } } = await supabase.auth.getUser()
                console.log('GroupDetailPage: User:', user?.id)

                if (!user) {
                    console.log('GroupDetailPage: No user, redirecting')
                    router.push('/login')
                    return
                }
                setCurrentUser(user)

                // 1. Fetch Group Details
                console.log('GroupDetailPage: Fetching group...')
                const { data: groupData, error: groupError } = await supabase
                    .from('groups')
                    .select('*')
                    .eq('id', resolvedParams.id)
                    .single()

                if (groupError) {
                    console.error('GroupDetailPage: Group Error RAW:', groupError)
                    throw groupError
                }
                console.log('GroupDetailPage: Group Found:', groupData?.name)
                setGroup(groupData)

                // 2. Fetch Members
                console.log('GroupDetailPage: Fetching members...')
                const { data: membersData, error: membersError } = await supabase
                    .from('group_members')
                    .select(`
            user_id,
            joined_at,
            profiles:user_id (
              id,
              username,
              display_name,
              avatar_url
            )
          `)
                    .eq('group_id', resolvedParams.id)

                if (membersError) {
                    console.error('GroupDetailPage: Member Error RAW:', membersError)
                    throw membersError
                }
                // Cast the response to match our type
                setMembers((membersData as any[]) || [])
                console.log('GroupDetailPage: Members Found:', membersData?.length)

                // 3. Fetch All Festivals (for planning)
                const { data: festivalsData, error: festivalsError } = await supabase
                    .from('festivals')
                    .select('id, name, year')
                    .order('year', { ascending: false })

                if (festivalsError) throw festivalsError
                setFestivals(festivalsData || [])

            } catch (error) {
                console.error('Error fetching group data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [resolvedParams.id, router, supabase])

    const copyInviteCode = () => {
        if (group?.invite_code) {
            navigator.clipboard.writeText(group.invite_code)
            alert(`Invite code ${group.invite_code} copied to clipboard!`)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
        )
    }

    if (!group) return null

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
                            <span className="text-retro-dark font-bold uppercase tracking-wider text-xs">{group.name}</span>
                        </div>
                        <Link
                            href="/groups"
                            className="px-4 py-2 text-sm font-black uppercase tracking-wider text-retro-dark hover:text-retro-orange transition-colors"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white border-2 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] rounded-xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-retro-dark mb-2 uppercase italic tracking-tighter">
                                {group.name}
                            </h1>
                            <div className="flex items-center gap-2 text-retro-dark font-bold opacity-70">
                                <span>{members.length} Members</span>
                                <span>•</span>
                                <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-retro-cream border-2 border-retro-dark px-6 py-4 rounded-lg shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]">
                            <div className="text-sm font-black uppercase tracking-wider text-retro-dark">
                                Invite Code:
                            </div>
                            <code className="text-2xl font-black text-retro-orange tracking-widest font-mono">
                                {group.invite_code}
                            </code>
                            <button
                                onClick={copyInviteCode}
                                className="ml-2 p-2 hover:bg-white border-2 border-transparent hover:border-retro-dark rounded-md transition-all active:translate-y-0.5"
                                title="Copy Code"
                            >
                                <svg className="w-5 h-5 text-retro-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Column: Active Plans/Festivals */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-black text-retro-dark uppercase italic tracking-tighter">
                            Start Planning
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            {festivals.map((festival) => (
                                <Link
                                    key={festival.id}
                                    href={`/groups/${group.id}/plans/${festival.id}`}
                                    className="group flex justify-between items-center p-6 bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-xl hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] transition-all"
                                >
                                    <div>
                                        <h3 className="text-xl font-black text-retro-dark uppercase italic">
                                            {festival.name}
                                        </h3>
                                        <p className="text-retro-dark/60 font-bold">
                                            {festival.year}
                                        </p>
                                    </div>
                                    <div className="flex items-center text-retro-orange font-black uppercase tracking-wider">
                                        Open Planner
                                        <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: Members */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black text-retro-dark uppercase italic tracking-tighter">
                            Squad List
                        </h2>
                        <div className="bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-xl overflow-hidden">
                            <div className="divide-y-2 divide-retro-dark">
                                {members.map((member) => (
                                    <div key={member.user_id} className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-retro-teal border-2 border-retro-dark flex items-center justify-center text-retro-dark font-black overflow-hidden shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]">
                                            {member.profiles?.avatar_url ? (
                                                <img src={member.profiles.avatar_url} alt={member.profiles.username} className="w-full h-full object-cover" />
                                            ) : (
                                                (member.profiles?.display_name || member.profiles?.username || '?').substring(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-retro-dark uppercase tracking-wider text-sm">
                                                {member.profiles?.display_name || member.profiles?.username || 'Unknown User'}
                                            </div>
                                            <div className="text-xs text-retro-dark/60 font-bold">
                                                Joined {new Date(member.joined_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
