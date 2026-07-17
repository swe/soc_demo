import { NextRequest, NextResponse } from 'next/server'

/**
 * Lightweight route guard. Checks session-cookie presence only — the edge
 * runtime has no database access, so real session validation happens in
 * `getOrgContext()` on the server. A forged cookie gets past this redirect
 * but hits a 401 on every data access.
 */
const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token']

export function middleware(request: NextRequest) {
  const hasSessionCookie = SESSION_COOKIES.some((name) => request.cookies.has(name))
  if (!hasSessionCookie) {
    const signInUrl = new URL('/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/overview/:path*', '/overview'],
}
