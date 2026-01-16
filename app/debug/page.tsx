'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function DebugPage() {
    const [logs, setLogs] = useState<any[]>([])
    const supabase = createClient()

    const runTest = async () => {
        setLogs([])
        const log = (msg: any) => setLogs(p => [...p, msg])

        // 1. Get User
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) log(`User Error: ${JSON.stringify(userError)}`)
        else log(`User: ${user?.id}`)

        if (!user) return

        // 2. Fetch Members WITH Profile Join (Replicating the failing query)
        log('--- 2. Fetching Members + Profile Join ---')

        // Use a known group ID from previous logs: 0887e8fc-630f-4217-90be-ef767a3ba931
        const targetGroupId = '0887e8fc-630f-4217-90be-ef767a3ba931'

        const { data: members, error: membersError } = await supabase
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
            .eq('group_id', targetGroupId)

        if (membersError) {
            log('MEMBER FETCH ERROR (RAW):')
            log(membersError)
            log(`Code: ${membersError.code}`)
            log(`Message: ${membersError.message}`)
            log(`Details: ${membersError.details}`)
            log(`Hint: ${membersError.hint}`)
        } else {
            log(`Success! Found ${members?.length} members.`)
            log(members)
        }
    }

    return (
        <div className="p-12">
            <button onClick={runTest} className="px-4 py-2 bg-blue-500 text-white rounded">Run Debug Test</button>
            <pre className="mt-4 bg-slate-100 p-4 rounded text-xs whitespace-pre-wrap font-mono">
                {JSON.stringify(logs, null, 2)}
            </pre>
        </div>
    )
}
