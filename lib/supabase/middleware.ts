import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Allow login and auth routes without checking auth
  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth')
  ) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
            })
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => {
              const sameSite = options?.sameSite === false 
                ? undefined 
                : (options?.sameSite as 'strict' | 'lax' | 'none' | undefined)
              supabaseResponse.cookies.set(name, value, {
                ...options,
                sameSite,
              })
            })
          },
        },
      }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // no user, redirect to login page WITH the original URL preserved
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    return supabaseResponse
  } catch (error) {
    console.error('Error in middleware:', error)
    // On error, allow the request to continue
    return NextResponse.next()
  }
}

