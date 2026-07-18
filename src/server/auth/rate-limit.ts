import { eq, lt, sql } from 'drizzle-orm'

import { db } from '../db/client'
import { loginAttempts } from '../db/schema'
import { writeAuditRaw } from '../services/audit'

/**
 * DB-backed fixed-window rate limiting with exponential lockout for the auth
 * endpoints. PostgreSQL (not Redis) on purpose: limits must survive restarts
 * and apply across processes, and the platform's only infrastructure is
 * Postgres. A reverse proxy / WAF is the expected second layer in production.
 *
 * Semantics (M2.6 approved thresholds):
 * - login: 10 failed attempts / 5 min per normalized email
 * - login: 30 failed attempts / 5 min per client IP
 * - register: 10 attempts / hour per client IP
 * - Reaching a limit locks the key for 5 minutes, doubling per consecutive
 *   lockout (5 → 10 → 20 → 40 → 60 max).
 * - A successful login clears the email failure counter (not the IP one).
 */

export type RateLimitScope = 'login_email' | 'login_ip' | 'register_ip'

/** Central limiter configuration — the only place thresholds are defined. */
export const RATE_LIMITS: Record<RateLimitScope, { limit: number; windowMs: number }> = {
  login_email: { limit: 10, windowMs: 5 * 60_000 },
  login_ip: { limit: 30, windowMs: 5 * 60_000 },
  register_ip: { limit: 10, windowMs: 60 * 60_000 },
}

export const LOCKOUT_BASE_MS = 5 * 60_000
export const LOCKOUT_CAP_MS = 60 * 60_000

/** Rows idle this long are opportunistically deleted on write. */
const STALE_ROW_MS = 24 * 60 * 60_000

export type RateLimitDecision =
  | { allowed: true }
  | { allowed: false; retryAfterS: number }

/** Client IP for limiter keying, matching how ctx.ip is derived elsewhere. */
export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

function lockDurationMs(strikes: number): number {
  return Math.min(LOCKOUT_BASE_MS * 2 ** (strikes - 1), LOCKOUT_CAP_MS)
}

/**
 * Is this (scope, key) currently locked out? Only an active lock blocks;
 * counters below the limit never delay a request.
 */
export async function checkRateLimit(
  scope: RateLimitScope,
  key: string,
): Promise<RateLimitDecision> {
  const [row] = await db
    .select({ lockedUntil: loginAttempts.lockedUntil })
    .from(loginAttempts)
    .where(sql`${loginAttempts.scope} = ${scope} AND ${loginAttempts.key} = ${key}`)
    .limit(1)

  const now = Date.now()
  if (row?.lockedUntil && row.lockedUntil.getTime() > now) {
    return { allowed: false, retryAfterS: Math.ceil((row.lockedUntil.getTime() - now) / 1000) }
  }
  return { allowed: true }
}

/**
 * Record one attempt against a (scope, key) counter; applies the exponential
 * lockout when the window limit is reached. The count increment is an atomic
 * upsert, so concurrent attempts cannot undercount.
 */
export async function recordAttempt(
  scope: RateLimitScope,
  key: string,
  ip?: string | null,
): Promise<void> {
  const { limit, windowMs } = RATE_LIMITS[scope]
  const now = new Date()
  // Window comparisons run on the database clock (SQL-side arithmetic) so the
  // upsert stays a single atomic statement.
  const windowExpired = sql`${loginAttempts.windowStart} < now() - ${windowMs} * interval '1 millisecond'`

  // Opportunistic cleanup keeps the table bounded (idle rows only).
  await db.delete(loginAttempts).where(lt(loginAttempts.updatedAt, new Date(now.getTime() - STALE_ROW_MS)))

  const [row] = await db
    .insert(loginAttempts)
    .values({ scope, key, count: 1 })
    .onConflictDoUpdate({
      target: [loginAttempts.scope, loginAttempts.key],
      set: {
        count: sql`CASE WHEN ${windowExpired} THEN 1 ELSE ${loginAttempts.count} + 1 END`,
        windowStart: sql`CASE WHEN ${windowExpired} THEN now() ELSE ${loginAttempts.windowStart} END`,
        updatedAt: sql`now()`,
      },
    })
    .returning()

  const lockActive = row.lockedUntil && row.lockedUntil.getTime() > now.getTime()
  if (row.count >= limit && !lockActive) {
    const strikes = row.strikes + 1
    const lockMs = lockDurationMs(strikes)
    await db
      .update(loginAttempts)
      .set({
        strikes,
        lockedUntil: new Date(now.getTime() + lockMs),
        // Fresh window after the lock expires; strikes keep the escalation.
        count: 0,
        windowStart: now,
      })
      .where(eq(loginAttempts.id, row.id))

    await writeAuditRaw({
      organizationId: null,
      actorType: 'system',
      action: 'auth.rate_limit_lock',
      targetType: 'rate_limit',
      targetId: null,
      metadata: { scope, key, strikes, lockSeconds: Math.round(lockMs / 1000) },
      ip: ip ?? null,
    })
  }
}

/** A successful login clears the email failure counter (spec-approved). */
export async function clearLoginFailures(email: string): Promise<void> {
  await db
    .delete(loginAttempts)
    .where(sql`${loginAttempts.scope} = 'login_email' AND ${loginAttempts.key} = ${email}`)
}
