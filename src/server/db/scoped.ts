import { and, eq, type SQL } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'

import type { OrgContext } from '../auth/types'
import { db } from './client'

/**
 * The only database surface services should touch. Every query condition is
 * combined with the tenant filter so an unfiltered cross-tenant query cannot
 * be expressed accidentally. When PostgreSQL RLS lands, it slots in beneath
 * this layer without changing service code.
 */
export function orgScoped(ctx: OrgContext) {
  return {
    db,
    /** Tenant filter for a table, AND-ed with any extra conditions. */
    where(orgColumn: PgColumn, ...conditions: (SQL | undefined)[]): SQL {
      return and(eq(orgColumn, ctx.organizationId), ...conditions)!
    },
  }
}

export type ScopedDb = ReturnType<typeof orgScoped>
