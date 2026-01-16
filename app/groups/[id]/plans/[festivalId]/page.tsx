'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Priority } from '@/types/database.types'

// -- Types --
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
    name: string
    festival_day_id: string
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
    username: string
    display_name: string | null
    avatar_url: string | null
}

type GroupSelection = {
    user_id: string
    set_id: string
    priority: Priority
}

export default function GroupPlannerPage({ params }: { params: Promise<{ id: string; festivalId: string }> }) {
    const resolvedParams = use(params)
    const [activeTab, setActiveTab] = useState<'macro' | 'micro'>('macro')
    const [loading, setLoading] = useState(true)
    const [dayLoading, setDayLoading] = useState(false)

    // Data State
    const [festival, setFestival] = useState<Festival | null>(null)
    const [members, setMembers] = useState<Profile[]>([])
    const [days, setDays] = useState<FestivalDay[]>([])
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const [stages, setStages] = useState<Stage[]>([])
    const [sets, setSets] = useState<Set[]>([])
    const [groupSelections, setGroupSelections] = useState<GroupSelection[]>([])

    const router = useRouter()
    const supabase = createClient()

    // 1. Initial Fetch (Festival + Members)
    useEffect(() => {
        const init = async () => {
            try {
                // Fetch Festival
                const { data: festivalData, error: festError } = await supabase
                    .from('festivals')
                    .select('*')
                    .eq('id', resolvedParams.festivalId)
                    .single()

                if (festError) throw festError
                setFestival(festivalData)

                // Fetch Group Members
                const { data: memberData, error: memberError } = await supabase
                    .from('group_members')
                    .select('user_id, profiles:user_id(*)')
                    .eq('group_id', resolvedParams.id)

                if (memberError) throw memberError
                const profiles = memberData?.map((m: any) => m.profiles) || []
                setMembers(profiles)

                // Fetch Days
                const { data: daysData } = await supabase
                    .from('festival_days')
                    .select('*')
                    .eq('festival_id', resolvedParams.festivalId)
                    .order('date', { ascending: true, nullsFirst: false })

                if (daysData && daysData.length > 0) {
                    setDays(daysData)
                    setSelectedDay(daysData[0].id)
                }

            } catch (err) {
                console.error('Error init planner:', err)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [resolvedParams, supabase])

    // 2. Fetch Day Details (Stages, Sets, Selections) when Day Changes
    useEffect(() => {
        if (!selectedDay) return

        const fetchDayData = async () => {
            setDayLoading(true)
            try {
                // Fetch Stages
                const { data: stagesData } = await supabase
                    .from('stages')
                    .select('*')
                    .eq('festival_day_id', selectedDay)
                    .order('name')
                setStages(stagesData || [])

                // Fetch Sets
                const stageIds = stagesData?.map(s => s.id) || []
                if (stageIds.length === 0) {
                    setSets([])
                    return
                }

                const { data: setsData } = await supabase
                    .from('sets')
                    .select('*')
                    .in('stage_id', stageIds)
                    .order('start_time')
                setSets(setsData || [])

                // Fetch ALL Selections for these sets for ANY member of the group
                // We filter by user_id in the query to respect group membership
                const memberIds = members.map(m => m.id)
                const setIds = setsData?.map(s => s.id) || []

                if (memberIds.length > 0 && setIds.length > 0) {
                    const { data: selectionsData } = await supabase
                        .from('user_selections')
                        .select('user_id, set_id, priority')
                        .in('user_id', memberIds)
                        .in('set_id', setIds)

                    setGroupSelections(selectionsData || [])
                }

            } catch (err) {
                console.error('Error fetching day data:', err)
            } finally {
                setDayLoading(false)
            }
        }


        if (members.length > 0) {
            fetchDayData()
        }
    }, [selectedDay, members, supabase])

    // -- Render Helpers --
    if (loading) return <div className="p-12 text-center">Loading Planner...</div>
    if (!festival) return <div className="p-12 text-center">Festival not found</div>

    return (
        <div className="min-h-screen bg-retro-cream text-retro-dark">
            {/* Navigation */}
            <nav className="bg-white border-b-2 border-retro-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <Link href={`/groups/${resolvedParams.id}`} className="font-bold text-retro-dark hover:text-retro-orange uppercase tracking-tight">
                                &larr; Back to Squad
                            </Link>
                            <div className="h-6 w-0.5 bg-retro-dark"></div>
                            <span className="font-black text-xl uppercase italic tracking-tighter text-retro-dark">{festival.name} Planner</span>

                            <Link
                                href={`/festivals/${festival.id}`}
                                className="ml-4 text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit My Choices
                            </Link>
                        </div>
                        {/* View Toggles */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('macro')}
                                className={`px-4 py-1.5 text-sm font-black uppercase tracking-wider border-2 border-retro-dark transition-all ${activeTab === 'macro'
                                    ? 'bg-retro-orange text-white shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] -translate-y-0.5'
                                    : 'bg-white text-retro-dark hover:bg-slate-50'
                                    }`}
                            >
                                Heat Map
                            </button>
                            <button
                                onClick={() => setActiveTab('micro')}
                                className={`px-4 py-1.5 text-sm font-black uppercase tracking-wider border-2 border-retro-dark transition-all ${activeTab === 'micro'
                                    ? 'bg-retro-blue text-white shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] -translate-y-0.5'
                                    : 'bg-white text-retro-dark hover:bg-slate-50'
                                    }`}
                            >
                                Ideal Path
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Day Picker */}
                {days.length > 0 && (
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {days.map(day => (
                            <button
                                key={day.id}
                                onClick={() => setSelectedDay(day.id)}
                                className={`flex-shrink-0 px-6 py-2 text-sm font-black uppercase tracking-wider border-2 border-retro-dark transition-all ${selectedDay === day.id
                                    ? 'bg-retro-teal text-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] -translate-y-1'
                                    : 'bg-white text-retro-dark hover:bg-slate-50'
                                    }`}
                            >
                                {day.day_name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content Area */}
                <div className="bg-white rounded-xl border-4 border-retro-dark shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] overflow-hidden min-h-[600px]">
                    {activeTab === 'macro' ? (
                        <MacroView
                            members={members}
                            stages={stages}
                            sets={sets}
                            selections={groupSelections}
                        />
                    ) : (
                        <MicroView
                            members={members}
                            stages={stages}
                            sets={sets}
                            selections={groupSelections}
                            loading={dayLoading}
                        />
                    )}
                </div>
            </main>
        </div>
    )
}

// ------------------------------------------
// Sub-Components (Ideally in separate files)
// ------------------------------------------

function MacroView({ members, stages, sets, selections }: {
    members: Profile[],
    stages: Stage[],
    sets: Set[],
    selections: GroupSelection[]
}) {
    // Helper to get all avatars for a specific set
    const getSetAvatars = (setId: string) => {
        return selections
            .filter(s => s.set_id === setId)
            .map(s => {
                const member = members.find(m => m.id === s.user_id)
                return { ...member, priority: s.priority }
            })
    }

    // Time slots helper (same as before)
    const generateTimeSlots = () => {
        const slots = []
        for (let h = 12; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
        }
        return slots
    }
    const timeSlots = generateTimeSlots()

    const timeToMinutes = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
    const getPosition = (set: Set) => {
        const start = timeToMinutes(set.start_time)
        const end = set.end_time ? timeToMinutes(set.end_time) : start + 60
        const startSlot = Math.floor((start - 12 * 60) / 15)
        const heightSlots = Math.ceil((end - start) / 15)
        return { startSlot, heightSlots }
    }
    const getPriorityColor = (p: Priority) => {
        if (p === 'green') return 'bg-retro-teal text-retro-dark border-retro-dark'
        if (p === 'yellow') return 'bg-retro-cream text-retro-dark border-retro-dark'
        if (p === 'red') return 'bg-retro-orange text-white border-retro-dark'
        return 'bg-white text-retro-dark border-retro-dark'
    }



    return (
        <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
                {/* Header */}
                <div className="grid bg-retro-cream border-b-2 border-retro-dark"
                    style={{ gridTemplateColumns: `80px repeat(${stages.length}, minmax(140px, 1fr))` }}>
                    <div className="p-3 text-xs font-black uppercase tracking-wider text-retro-dark">Time</div>
                    {stages.map(s => (
                        <div key={s.id} className="p-3 text-sm font-black uppercase text-retro-dark border-l-2 border-retro-dark">
                            {s.name}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="relative bg-white/50">
                    {timeSlots.map((time, idx) => (
                        <div key={time} className="grid border-b border-retro-dark/20"
                            style={{ gridTemplateColumns: `80px repeat(${stages.length}, minmax(140px, 1fr))`, minHeight: '24px' }}>
                            <div className="p-1 text-xs font-bold text-retro-dark/50 bg-retro-cream/50 text-right pr-3 border-r-2 border-retro-dark">
                                {time.endsWith(':00') ? time : ''}
                            </div>
                            {stages.map(stage => {
                                // Render Sets logic
                                const stageSets = sets.filter(s => s.stage_id === stage.id)
                                const setsHere = stageSets.filter(s => getPosition(s).startSlot === idx)

                                return (
                                    <div key={stage.id} className="relative border-l-2 border-retro-dark">
                                        {setsHere.map(set => {
                                            const pos = getPosition(set)
                                            const avatars = getSetAvatars(set.id)

                                            return (
                                                <div key={set.id}
                                                    className="absolute left-1 right-1 top-0.5 rounded-none border-2 border-retro-dark bg-white shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] p-2 z-10 hover:z-20 hover:scale-[1.02] transition-all overflow-hidden"
                                                    style={{ height: `${Math.max(32, pos.heightSlots * 24)}px` }}>
                                                    <div className="font-black text-xs uppercase text-retro-dark truncate leading-tight">{set.artist_name}</div>

                                                    {/* Avatars Overlay */}
                                                    <div className="flex -space-x-1 mt-1 overflow-hidden py-1">
                                                        {avatars.map((ava, i) => (
                                                            <div key={i}
                                                                className={`w-5 h-5 rounded-full border-2 border-retro-dark flex items-center justify-center text-[8px] font-black z-10 relative overflow-hidden ${getPriorityColor(ava.priority)}`}
                                                                title={ava?.username || 'Member'}
                                                            >
                                                                {ava?.avatar_url ? (
                                                                    <img src={ava.avatar_url} alt={ava.username || 'User'} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    (ava?.username || '?').substring(0, 1).toUpperCase()
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function MicroView({ members, stages, sets, selections, loading }: {
    members: Profile[],
    stages: Stage[],
    sets: Set[],
    selections: GroupSelection[],
    loading?: boolean
}) {

    const timeToMinutes = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; }

    // -- ALGORITHM V2 --
    // 1. Sort all sets by START TIME.
    // 2. Iterate through them.
    // 3. Maintain a "Current Agreed Path" (or branches for splits).
    // 4. Overlap Logic: 
    //    If we picked Set A (Ends 18:00), and considering Set B (Starts 17:45).
    //    Overlap = 15 mins. Allowed (< 30).
    //    If Set C (Starts 17:15). Overlap = 45 mins. Blocked (> 30).

    // Flatten logic: Just evaluate "Winner of Slot" vs "Previous Winner".

    // 1. Score all sets first
    const scoredSets = sets.map(set => {
        const setSelections = selections.filter(s => s.set_id === set.id)
        let score = 0
        let greenCount = 0
        let yellowCount = 0
        let redCount = 0

        setSelections.forEach(sel => {
            if (sel.priority === 'green') { score += 5; greenCount++ }
            if (sel.priority === 'yellow') { score += 3; yellowCount++ }
            if (sel.priority === 'red') { score += 1; redCount++ }
        })
        return { set, score, greenCount, yellowCount, redCount }
    }).filter(s => s.score > 0) // Remove sets with 0 votes

    // 2. Cluster sets logic
    // We want to group sets that overlap "significantly" into a single decision point.
    // If Set A (8:00) and Set B (8:30) overlap > 30m, they are in the same cluster.
    // If Set C (10:00) is far away, it's a new cluster.

    const clusters: Array<typeof scoredSets> = [];

    // Sort all by start time
    const sortedSets = [...scoredSets].sort((a, b) =>
        timeToMinutes(a.set.start_time) - timeToMinutes(b.set.start_time)
    );

    if (sortedSets.length > 0) {
        let currentCluster = [sortedSets[0]];
        let clusterEndTime = timeToMinutes(sortedSets[0].set.end_time || "") || (timeToMinutes(sortedSets[0].set.start_time) + 60);

        for (let i = 1; i < sortedSets.length; i++) {
            const set = sortedSets[i];
            const start = timeToMinutes(set.set.start_time);
            const end = timeToMinutes(set.set.end_time || "") || (start + 60);

            // Overlap Logic:
            // Check against the *Cluster's* effective range. 
            // If this set starts significantly before the cluster ends (Overlap > 30m), merging it.
            // Wait, checking overlap with *Cluster End* or *Last Set End*?
            // "Treat them as same time logic".
            // So if A ends at 9:00. B starts at 8:30. Overlap = 30.
            // The prompt said "limit of max 30 min of overlap to INCLUDE both".
            // Wait, "overlapping by 30 min + we should treat them as same time artists".

            // So:
            // IF overlap > 30m -> SAME CLUSTER (Fight!).
            // IF overlap <= 30m -> DIFFERENT CLUSTER (Sequential).

            const overlap = clusterEndTime - start;

            if (overlap > 30) {
                // Join Cluster
                currentCluster.push(set);
                // Extend cluster window if this set goes longer
                if (end > clusterEndTime) clusterEndTime = end;
            } else {
                // New Cluster
                clusters.push(currentCluster);
                currentCluster = [set];
                clusterEndTime = end;
            }
        }
        clusters.push(currentCluster);
    }

    const itinerary = clusters.map(cluster => {
        // Now we simply pick the winner from this cluster of conflicting sets
        if (cluster.length === 0) return null;

        // Earliest start time in cluster is the block time
        cluster.sort((a, b) => timeToMinutes(a.set.start_time) - timeToMinutes(b.set.start_time));
        const startTime = cluster[0].set.start_time;

        // Sort by Score
        cluster.sort((a, b) => b.score - a.score);
        const winner = cluster[0];

        const winners = [winner];
        for (let i = 1; i < cluster.length; i++) {
            const runner = cluster[i];
            // Split if Green Conflict OR Tie
            // AND ensure unique set IDs (though cluster should be unique sets)
            if (runner.set.id !== winner.set.id) {
                if (runner.greenCount > 0 || runner.score === winner.score) {
                    winners.push(runner);
                }
            }
        }

        return { startTime, winners };
    }).filter(Boolean);


    return (
        <div className="max-w-3xl mx-auto py-12 px-4 relative">
            <h3 className="text-center text-4xl font-black text-retro-dark mb-16 uppercase italic tracking-tighter">
                The Ideal Path
            </h3>

            {/* Central Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-24 bottom-12 w-1 border-r-2 border-retro-dark border-dashed opacity-40"></div>

            <div className="space-y-12 relative">
                {itinerary.map((block, idx) => {
                    const formatTime = (t: string) => { const [h, m] = t.split(':'); return `${h}:${m}`; }
                    const startTime = formatTime(block!.startTime);
                    const isSplit = block!.winners.length > 1;

                    return (
                        <div key={idx} className="relative w-full flex flex-col items-center z-10">

                            {/* Time Pill */}
                            <div className="mb-6 px-4 py-1 bg-white border-2 border-retro-dark text-retro-dark text-sm font-black shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] z-20">
                                {startTime}
                            </div>

                            {/* Cards Container */}
                            <div className={`w-full flex ${isSplit ? 'justify-between gap-4' : 'justify-center'}`}>
                                {block!.winners.map((item, w_idx) => {
                                    const stageName = stages.find(s => s.id === item.set.stage_id)?.name;

                                    // Calculate WHO is going (Green/Yellow voters)
                                    // We need to look at 'selections' again for this set
                                    const setVotes = selections.filter(s => s.set_id === item.set.id);
                                    const interestedMembers = members.filter(m => {
                                        const vote = setVotes.find(v => v.user_id === m.id);
                                        return vote && (vote.priority === 'green' || vote.priority === 'yellow');
                                    });

                                    // Priority Logic (Green wins)
                                    const isTopPick = item.greenCount > 0;
                                    const cardBg = isTopPick ? 'bg-white' : 'bg-retro-cream';
                                    const accentColor = isTopPick ? 'text-retro-teal' : 'text-retro-orange';

                                    return (
                                        <div key={item.set.id}
                                            className={`
                                                relative flex-1 ${cardBg}
                                                border-2 border-retro-dark shadow-[6px_6px_0px_0px_rgba(26,44,50,1)]
                                                rounded-lg p-5
                                                transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] duration-200
                                                ${!isSplit ? 'max-w-md' : ''}
                                            `}
                                        >
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-2 border-b-2 border-retro-dark border-dashed pb-2">
                                                <div className="text-[10px] font-black text-retro-dark/60 uppercase tracking-widest">
                                                    {stageName || 'Unknown Stage'}
                                                </div>
                                                <div className="flex gap-1">
                                                    {item.greenCount > 0 && (
                                                        <span className="bg-retro-teal text-retro-dark text-[9px] font-bold px-1.5 py-0.5 border border-retro-dark shadow-[1px_1px_0px_0px_rgba(26,44,50,1)]">
                                                            TOP PICK
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Artist */}
                                            <div className="text-2xl font-black text-retro-dark mb-4 uppercase italic tracking-tight leading-none">
                                                {item.set.artist_name}
                                            </div>

                                            {/* Footer: Time Range & Faces */}
                                            <div className="flex justify-between items-end pt-1">
                                                <div className="text-xs font-mono font-bold text-retro-dark bg-retro-blue/10 px-2 py-1 rounded border border-retro-dark/20">
                                                    {formatTime(item.set.start_time)} - {formatTime(item.set.end_time || '')}
                                                </div>

                                                {/* Avatar Pile */}
                                                <div className="flex -space-x-2">
                                                    {interestedMembers.slice(0, 4).map((m, i) => (
                                                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-retro-dark flex items-center justify-center text-[10px] font-black text-white shadow-sm overflow-hidden
                                                            ${setVotes.find(v => v.user_id === m.id)?.priority === 'green' ? 'bg-retro-teal text-retro-dark' : 'bg-retro-orange'}
                                                            `}
                                                            title={m.username || 'Member'}
                                                        >
                                                            {m.avatar_url ? (
                                                                <img src={m.avatar_url} alt={m.username || 'User'} className="w-full h-full object-cover" />
                                                            ) : (
                                                                (m.username || '?').charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                    ))}
                                                    {interestedMembers.length > 4 && (
                                                        <div className="w-8 h-8 rounded-full bg-white border-2 border-retro-dark flex items-center justify-center text-[10px] font-black text-retro-dark">
                                                            +{interestedMembers.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}

                {/* Empty State */}
                {!loading && itinerary.length === 0 && (
                    <div className="text-center py-20 animate-fade-in">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">😴</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">
                            No plans yet. Vote on the Heat Map!
                        </p>
                    </div>
                )}

                {/* Loading Skeleton */}
                {loading && (
                    <div className="space-y-8 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded-full mb-4"></div>
                                <div className="w-full max-w-md h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
