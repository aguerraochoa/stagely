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

const getInitials = (profile: Profile) => {
    const name = profile.display_name || profile.username || '?';
    if (!name || name === '?') return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [group, setGroup] = useState<Group | null>(null)
    const [members, setMembers] = useState<Member[]>([])
    const [festivals, setFestivals] = useState<Festival[]>([])
    const [allFestivals, setAllFestivals] = useState<Festival[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [addingId, setAddingId] = useState<string | null>(null)
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

                // 3. Fetch Group's Festivals (through join table)
                const { data: festivalsData, error: festivalsError } = await supabase
                    .from('group_festivals')
                    .select(`
                      festival_id,
                      festivals:festival_id(id, name, year)
                    `)
                    .eq('group_id', resolvedParams.id)

                if (festivalsError) throw festivalsError
                const groupFests = festivalsData?.map((f: any) => f.festivals) || []
                setFestivals(groupFests)

                // 4. Fetch All Festivals (for the modal)
                const { data: allFestsData } = await supabase
                    .from('festivals')
                    .select('id, name, year')
                    .order('year', { ascending: false })

                setAllFestivals(allFestsData || [])

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

    const handleAddFestival = async (festivalId: string) => {
        setAddingId(festivalId)
        try {
            const { error } = await supabase
                .from('group_festivals')
                .insert({ group_id: resolvedParams.id, festival_id: festivalId })

            if (error) throw error

            // Refresh local state
            const festToAdd = allFestivals.find(f => f.id === festivalId)
            if (festToAdd) setFestivals([...festivals, festToAdd])
            setIsAddModalOpen(false)
        } catch (err) {
            console.error('Error adding festival:', err)
            alert('Error adding festival. Make sure you ran the SQL migration!')
        } finally {
            setAddingId(null)
        }
    }

    const handleRemoveFestival = async (festivalId: string) => {
        if (!confirm('Are you sure you want to remove this festival from the group? This will NOT delete any votes.')) return

        try {
            const { error } = await supabase
                .from('group_festivals')
                .delete()
                .eq('group_id', resolvedParams.id)
                .eq('festival_id', festivalId)

            if (error) throw error
            setFestivals(festivals.filter(f => f.id !== festivalId))
        } catch (err) {
            console.error('Error removing festival:', err)
        }
    }

    const filteredAvailableFestivals = allFestivals.filter(f =>
        !festivals.find(gf => gf.id === f.id) &&
        (f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.year.toString().includes(searchQuery))
    )

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-retro-orange"></div>
            </div>
        )
    }

    if (!group) return null

    return (
        <div className="min-h-screen bg-retro-cream text-retro-dark">
            <nav className="bg-white border-b-2 border-retro-dark sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4 min-w-0">
                            <Link href="/">
                                <img src="/icon.png" alt="Stagely Logo" className="h-8 w-auto min-w-[32px]" />
                            </Link>
                            <div className="h-6 w-0.5 bg-retro-dark/20"></div>
                            <Link href="/groups" className="hidden md:block text-retro-dark font-black uppercase tracking-wider text-xs hover:text-retro-orange whitespace-nowrap">
                                My Groups
                            </Link>
                            <span className="hidden md:block text-retro-dark/30 font-bold">/</span>
                            <span className="text-retro-dark font-bold uppercase tracking-wider text-xs truncate max-w-[150px]">{group.name}</span>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Profile Link */}
                            <Link
                                href="/profile"
                                className="w-8 h-8 rounded-full border-2 border-retro-dark bg-retro-teal flex items-center justify-center text-[10px] font-black hover:-translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]"
                                title="My Profile"
                            >
                                {currentUser ? (
                                    (() => {
                                        const myProfile = members.find(m => m.user_id === currentUser.id)?.profiles;
                                        return myProfile ? getInitials(myProfile) : '?';
                                    })()
                                ) : '?'}
                            </Link>

                            <Link
                                href="/groups"
                                className="px-4 py-2 text-sm font-black uppercase tracking-wider text-retro-dark hover:text-retro-orange transition-colors"
                            >
                                Back
                            </Link>
                        </div>
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
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-retro-dark uppercase italic tracking-tighter">
                                Start Planning
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-retro-teal text-retro-dark border-2 border-retro-dark rounded-lg shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 transition-all"
                            >
                                + Add Festival
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {festivals.length === 0 ? (
                                <div className="p-12 text-center bg-white border-2 border-retro-dark border-dashed rounded-xl opacity-60">
                                    <p className="font-bold text-retro-dark">No festivals added to this group yet.</p>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="mt-4 text-sm font-black text-retro-orange uppercase hover:underline"
                                    >
                                        Browse Festivals
                                    </button>
                                </div>
                            ) : festivals.map((festival) => (
                                <div key={festival.id} className="group relative">
                                    <Link
                                        href={`/groups/${group.id}/plans/${festival.id}`}
                                        className="flex justify-between items-center p-6 bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-xl hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] transition-all"
                                    >
                                        <div>
                                            <h3 className="text-xl font-black text-retro-dark uppercase italic">
                                                {festival.name}
                                            </h3>
                                            <p className="text-retro-dark/60 font-bold">
                                                {festival.year}
                                            </p>
                                        </div>
                                        <div className="flex items-center text-retro-orange font-black uppercase tracking-wider mr-12">
                                            Open Planner
                                            <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => handleRemoveFestival(festival.id)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-retro-dark/30 hover:text-retro-orange transition-colors z-10"
                                        title="Remove from group"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
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

            {/* Add Festival Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-4 border-retro-dark shadow-[12px_12px_0px_0px_rgba(26,44,50,1)] rounded-xl w-full max-w-xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b-2 border-retro-dark flex justify-between items-center bg-retro-cream">
                            <h2 className="text-2xl font-black text-retro-dark uppercase italic tracking-tight">Add Festival to Group</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-retro-dark hover:text-retro-orange transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    placeholder="Search festivals (e.g. Coachella, 2024)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-retro-cream border-2 border-retro-dark rounded-xl font-bold text-retro-dark outline-none focus:shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] transition-all"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <svg className="w-6 h-6 text-retro-dark/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-4">
                            {filteredAvailableFestivals.length === 0 ? (
                                <div className="text-center py-12 text-retro-dark/40 font-black uppercase italic tracking-widest">
                                    No festivals found
                                </div>
                            ) : (
                                filteredAvailableFestivals.map(fest => (
                                    <div key={fest.id} className="flex items-center justify-between p-4 bg-retro-cream border-2 border-retro-dark rounded-xl shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 transition-all">
                                        <div>
                                            <div className="font-black text-retro-dark uppercase italic">{fest.name}</div>
                                            <div className="text-xs font-bold text-retro-dark/60">{fest.year}</div>
                                        </div>
                                        <button
                                            onClick={() => handleAddFestival(fest.id)}
                                            disabled={addingId !== null}
                                            className="px-4 py-2 bg-retro-orange text-white text-xs font-black uppercase tracking-widest border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all"
                                        >
                                            {addingId === fest.id ? 'Adding...' : 'Add to Group'}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
