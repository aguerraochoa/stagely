import { NextResponse } from 'next/server'
import { createClient as createAuthedClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id } = await Promise.resolve(params)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        error:
          'Server is missing SUPABASE_SERVICE_ROLE_KEY (required for cascade deletes).',
      },
      { status: 500 }
    )
  }

  const authed = await createAuthedClient()
  const {
    data: { user },
  } = await authed.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  // Authorization: only the festival creator can delete it
  const { data: festival, error: festivalError } = await admin
    .from('festivals')
    .select('id, created_by')
    .eq('id', id)
    .single()

  if (festivalError || !festival) {
    return NextResponse.json({ error: 'Festival not found' }, { status: 404 })
  }

  if (festival.created_by !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // One delete; DB FKs handle cascades (days, stages, sets, selections, group_festivals, etc.)
  const { error: deleteError } = await admin
    .from('festivals')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message || 'Failed to delete festival' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}

