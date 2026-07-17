import type { OrgContext } from '../auth/context'
import { db } from '../db/client'
import { auditLogs } from '../db/schema'

type AuditInput = {
  action: string
  targetType: string
  targetId?: string | null
  metadata?: Record<string, unknown>
}

/** Append an audit record for an action performed inside an org context. */
export async function writeAudit(ctx: OrgContext, input: AuditInput): Promise<void> {
  await db.insert(auditLogs).values({
    organizationId: ctx.organizationId,
    actorMembershipId: ctx.membershipId,
    actorType: 'user',
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    metadata: input.metadata ?? {},
    ip: ctx.ip ?? null,
  })
}

/**
 * Audit variant for moments where a full OrgContext does not exist yet:
 * the org-creation transaction, and platform-level auth events
 * (registration, login) which have no tenant.
 */
export async function writeAuditRaw(input: AuditInput & {
  organizationId: string | null
  membershipId?: string | null
  ip?: string | null
}): Promise<void> {
  await db.insert(auditLogs).values({
    organizationId: input.organizationId,
    actorMembershipId: input.membershipId ?? null,
    actorType: 'user',
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    metadata: input.metadata ?? {},
    ip: input.ip ?? null,
  })
}
