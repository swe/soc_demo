import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'

import type { Permission } from '../../domain/permissions'
import { AuthError, getSession, requireOrgContext, type OrgContext } from '../auth/context'

/** RFC 9457 problem+json error body. */
export function problem(status: number, title: string, detail?: unknown) {
  return NextResponse.json(
    { type: 'about:blank', title, status, ...(detail !== undefined ? { detail } : {}) },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  )
}

function requestIp(request: NextRequest): string | undefined {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined
}

function handleError(error: unknown) {
  if (error instanceof AuthError) return problem(error.status, error.message)
  if (error instanceof ZodError) return problem(400, 'Validation failed', error.issues)
  console.error('[api] unhandled error:', error)
  return problem(500, 'Internal server error')
}

type OrgHandler<P> = (args: {
  request: NextRequest
  ctx: OrgContext
  params: P
}) => Promise<NextResponse>

/**
 * Route wrapper for tenant-scoped endpoints: resolves OrgContext (401/403 on
 * failure), attaches the request IP for audit, and normalizes error bodies.
 */
export function withOrgContext<P = Record<string, never>>(
  handler: OrgHandler<P>,
  options?: { permission?: Permission },
) {
  return async (request: NextRequest, route?: { params: Promise<P> }): Promise<NextResponse> => {
    try {
      const ctx = await requireOrgContext(options?.permission ?? 'data:read')
      ctx.ip = requestIp(request)
      const params = route?.params ? await route.params : ({} as P)
      return await handler({ request, ctx, params })
    } catch (error) {
      return handleError(error)
    }
  }
}

type SessionHandler = (args: {
  request: NextRequest
  userId: string
}) => Promise<NextResponse>

/** Wrapper for endpoints that need a user but not an organization (onboarding). */
export function withSession(handler: SessionHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const session = await getSession()
      if (!session?.user?.id) return problem(401, 'Not authenticated')
      return await handler({ request, userId: session.user.id })
    } catch (error) {
      return handleError(error)
    }
  }
}
