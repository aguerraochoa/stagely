import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Mark this route as dynamic since it uses cookies for authentication
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  return NextResponse.redirect(new URL('/login', origin))
}

