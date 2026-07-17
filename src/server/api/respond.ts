import { NextRequest, NextResponse } from 'next/server'
import { ZodError, type ZodType, type z } from 'zod'

import type { Permission } from '../../domain/permissions'
import { TransitionError } from '../../domain/transitions'
import { AuthError, getSession, requireOrgContext, type OrgContext } from '../auth/context'
import { ServiceError } from '../services/errors'

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
  if (error instanceof TransitionError) return problem(error.status, error.message)
  if (error instanceof ServiceError) return problem(error.status, error.message)
  if (error instanceof ZodError) return problem(400, 'Validation failed', error.issues)
  console.error('[api] unhandled error:', error)
  return problem(500, 'Internal server error')
}

/**
 * Parse and validate a JSON request body. Malformed JSON and schema failures
 * both surface as 400 problem+json via the ZodError mapping above.
 */
export async function parseJsonBody<S extends ZodType>(
  request: NextRequest,
  schema: S,
): Promise<z.infer<S>> {
  const body = await request.json().catch(() => null)
  return schema.parse(body)
}

type OrgHandler<P> = (args: {
  request: NextRequest
  ctx: OrgContext
  params: P
}) => Promise<NextResponse>

/**
 * Route wrapper for tenant-scoped endpoints.
 *
 * Resolves OrgContext via requireOrgContext() (401/403 on failure), attaches
 * request IP for audit, and normalizes error bodies. Middleware is not a
 * substitute for this — it only performs cookie-presence redirects.
 * See docs/adr/0002-middleware-authorization-boundary.md.
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
