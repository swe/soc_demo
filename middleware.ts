import { NextRequest, NextResponse } from 'next/server'

/**
 * Routing-only guard (see docs/adr/0002-middleware-authorization-boundary.md).
 *
 * Middleware checks session-cookie *presence* and redirects unauthenticated
 * browsers to /signin. It does NOT validate the session, resolve an
 * organization, or enforce permissions — Edge has no database access.
 *
 * Tenant authorization happens exclusively through:
 *   getOrgContext() / requireOrgContext() → services → orgScoped() queries
 * (API routes wrap this via withOrgContext()).
 *
 * A forged cookie can pass this redirect but still receives 401 on every
 * data access and cannot read another tenant's rows.
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
  matcher: ['/overview/:path*', '/overview', '/onboarding', '/select-org'],
}
