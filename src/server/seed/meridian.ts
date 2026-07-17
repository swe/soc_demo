import { eq, sql } from 'drizzle-orm'

import type { Db } from '../db/client'
import {
  alerts,
  assets,
  events,
  identities,
  incidents,
  investigations,
  organizations,
  vulnerabilities,
  type EntityRef,
} from '../db/schema'
import { buildAlerts } from './data/alerts'
import { buildAssets } from './data/assets'
import { SEED_EVENTS } from './data/events'
import { buildIdentities } from './data/identities'
import { SEED_INCIDENTS, SEED_INVESTIGATIONS } from './data/incidents'
import { buildVulnerabilities } from './data/vulnerabilities'
import { createRng } from './rand'
import { makeShift } from './shift'

const SEED_VERSION = 1
const RNG_SEED = 0x4d465247 // "MFRG"

/** Deterministic per-org primary keys make re-seeding idempotent by design. */
const sid = (orgId: string, kind: string, key: string) => `seed_${kind}_${key}_${orgId.slice(-12)}`

export type SeedSummary = {
  identities: number
  assets: number
  events: number
  alerts: number
  investigations: number
  incidents: number
  vulnerabilities: number
  seedVersion: number
}

/**
 * Build the Meridian Financial Group demo dataset inside one transaction.
 * Deterministic (fixed PRNG seed), idempotent (wipe-and-rewrite of seed rows,
 * stable IDs), and time-shifted (all timestamps anchored to `anchor`).
 */
export async function seedMeridian(
  db: Db,
  organizationId: string,
  anchor: Date = new Date(),
): Promise<SeedSummary> {
  const rng = createRng(RNG_SEED)
  const at = makeShift(anchor)

  const seedIdentities = buildIdentities(rng)
  const seedAssets = buildAssets(rng, seedIdentities)
  const seedAlerts = buildAlerts(rng, seedIdentities, seedAssets)
  const seedVulns = buildVulnerabilities(rng, seedAssets)

  const identityId = (key: string) => sid(organizationId, 'idn', key)
  const assetId = (key: string) => sid(organizationId, 'ast', key)
  const investigationId = (key: string) => sid(organizationId, 'inv', key)

  const refs = (identityKeys: string[], assetKeys: string[]): EntityRef[] => [
    ...identityKeys.map((k) => ({ type: 'identity' as const, id: identityId(k) })),
    ...assetKeys.map((k) => ({ type: 'asset' as const, id: assetId(k) })),
  ]

  await db.transaction(async (tx) => {
    // Wipe previous seed data for this org (dependents first)
    await tx.delete(events).where(eq(events.organizationId, organizationId))
    await tx.delete(vulnerabilities).where(eq(vulnerabilities.organizationId, organizationId))
    await tx.delete(alerts).where(eq(alerts.organizationId, organizationId))
    await tx.delete(incidents).where(eq(incidents.organizationId, organizationId))
    await tx.delete(investigations).where(eq(investigations.organizationId, organizationId))
    await tx.delete(assets).where(eq(assets.organizationId, organizationId))
    await tx.delete(identities).where(eq(identities.organizationId, organizationId))

    await tx.insert(identities).values(
      seedIdentities.map((i) => ({
        id: identityId(i.key),
        organizationId,
        principal: i.principal,
        displayName: i.displayName,
        type: i.type,
        source: 'seed',
        privilegeTier: i.privilegeTier,
        mfaEnabled: i.mfaEnabled,
        riskScore: i.riskScore,
        status: 'active' as const,
        attributes: { department: i.department, title: i.title },
        firstSeen: at(90 * 24 * 60),
        lastSeen: at(rng.int(5, 24 * 60)),
      })),
    )

    await tx.insert(assets).values(
      seedAssets.map((a) => ({
        id: assetId(a.key),
        organizationId,
        type: a.type,
        name: a.name,
        externalIds: {},
        criticality: a.criticality,
        ownerIdentityId: a.ownerKey ? identityId(a.ownerKey) : null,
        status: 'active' as const,
        riskScore: a.riskScore,
        attributes: a.attributes,
        firstSeen: at(90 * 24 * 60),
        lastSeen: at(rng.int(5, 24 * 60)),
      })),
    )

    await tx.insert(investigations).values(
      SEED_INVESTIGATIONS.map((inv) => ({
        id: investigationId(inv.key),
        organizationId,
        title: inv.title,
        status: inv.status,
        hypothesis: inv.hypothesis,
        disposition: inv.disposition,
        createdBy: 'seed',
        closedAt: inv.closedMinutesAgo !== null ? at(inv.closedMinutesAgo) : null,
        createdAt: at(inv.minutesAgo),
      })),
    )

    // Alerts in batches (postgres.js parameter limits)
    const alertRows = seedAlerts.map((a) => ({
      id: sid(organizationId, 'alr', a.key),
      organizationId,
      title: a.title,
      description: a.description,
      severity: a.severity,
      status: a.status,
      disposition: a.disposition,
      source: a.source,
      ruleKey: a.ruleKey,
      mitreTechniques: a.mitreTechniques,
      entityRefs: refs(a.identityKeys, a.assetKeys),
      investigationId: a.investigationKey ? investigationId(a.investigationKey) : null,
      raw: { seeded: true, rule: a.ruleKey },
      detectedAt: at(a.minutesAgo),
    }))
    for (let i = 0; i < alertRows.length; i += 100) {
      await tx.insert(alerts).values(alertRows.slice(i, i + 100))
    }

    // Incidents: allocate per-org numbers. Lock the counter row, then restart
    // numbering from the highest surviving (non-seed) incident so re-seeding
    // is idempotent — seed incidents always get the same INC numbers.
    await tx
      .select({ counter: organizations.incidentCounter })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .for('update')
    const [{ maxNumber }] = await tx
      .select({ maxNumber: sql<number | null>`max(${incidents.number})` })
      .from(incidents)
      .where(eq(incidents.organizationId, organizationId))
    let counter = maxNumber ?? 0

    // Oldest first so INC numbers read chronologically
    const orderedIncidents = [...SEED_INCIDENTS].sort((a, b) => b.minutesAgo - a.minutesAgo)
    await tx.insert(incidents).values(
      orderedIncidents.map((inc) => ({
        id: sid(organizationId, 'inc', inc.key),
        organizationId,
        number: ++counter,
        title: inc.title,
        severity: inc.severity,
        status: inc.status,
        investigationId: inc.investigationKey ? investigationId(inc.investigationKey) : null,
        impactSummary: inc.impactSummary,
        timeline: inc.timeline.map((t) => ({
          at: at(t.minutesAgo).toISOString(),
          kind: t.kind,
          summary: t.summary,
          actor: t.actor,
        })),
        declaredAt: at(inc.minutesAgo),
        resolvedAt: inc.resolvedMinutesAgo !== null ? at(inc.resolvedMinutesAgo) : null,
      })),
    )
    await tx
      .update(organizations)
      .set({ incidentCounter: counter })
      .where(eq(organizations.id, organizationId))

    const vulnRows = seedVulns.map((v) => ({
      id: sid(organizationId, 'vln', v.key),
      organizationId,
      assetId: assetId(v.assetKey),
      cveId: v.cveId,
      ruleKey: v.cveId ? null : 'posture-check',
      title: v.title,
      cvss: v.cvss,
      epss: v.epss,
      exploitedInWild: v.exploitedInWild,
      severity: v.severity,
      status: v.status,
      fixAvailable: v.fixAvailable,
      detectedAt: at(v.minutesAgo),
      resolvedAt: v.resolvedMinutesAgo !== null ? at(v.resolvedMinutesAgo) : null,
    }))
    for (let i = 0; i < vulnRows.length; i += 100) {
      await tx.insert(vulnerabilities).values(vulnRows.slice(i, i + 100))
    }

    await tx.insert(events).values(
      SEED_EVENTS.map((e) => ({
        id: sid(organizationId, 'evt', e.key),
        organizationId,
        occurredAt: at(e.minutesAgo),
        source: e.source,
        category: e.category,
        actor: e.actor,
        target: e.target,
        entityRefs: refs(e.identityKeys, e.assetKeys),
        payload: e.payload,
      })),
    )
  })

  return {
    identities: seedIdentities.length,
    assets: seedAssets.length,
    events: SEED_EVENTS.length,
    alerts: seedAlerts.length,
    investigations: SEED_INVESTIGATIONS.length,
    incidents: SEED_INCIDENTS.length,
    vulnerabilities: seedVulns.length,
    seedVersion: SEED_VERSION,
  }
}
