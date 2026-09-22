import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // IMPORTANT: Do NOT protect routes with getSession(). Always use getUser() to validate auth token.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected admin routes: any path starting with /admin except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/admin/login'
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If user is already authenticated and visits /admin/login, redirect to /admin dashboard
  if (pathname === '/admin/login' && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/admin'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
