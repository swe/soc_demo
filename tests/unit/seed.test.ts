import { describe, expect, it } from 'vitest'

import { buildAlerts } from '@server/seed/data/alerts'
import { buildAssets } from '@server/seed/data/assets'
import { buildIdentities } from '@server/seed/data/identities'
import { buildVulnerabilities } from '@server/seed/data/vulnerabilities'
import { SEED_INCIDENTS, SEED_INVESTIGATIONS } from '@server/seed/data/incidents'
import { SEED_EVENTS } from '@server/seed/data/events'
import { createRng } from '@server/seed/rand'

const RNG_SEED = 0x4d465247

function snapshotDataset() {
  const rng = createRng(RNG_SEED)
  const identities = buildIdentities(rng)
  const assets = buildAssets(rng, identities)
  const alerts = buildAlerts(rng, identities, assets)
  const vulnerabilities = buildVulnerabilities(rng, assets)
  return {
    identities: identities.map((i) => ({ key: i.key, principal: i.principal, riskScore: i.riskScore })),
    assets: assets.map((a) => ({ key: a.key, name: a.name, type: a.type, riskScore: a.riskScore })),
    alerts: alerts.map((a) => ({
      key: a.key,
      title: a.title,
      severity: a.severity,
      status: a.status,
      ruleKey: a.ruleKey,
      minutesAgo: a.minutesAgo,
    })),
    vulnerabilities: vulnerabilities.map((v) => ({
      key: v.key,
      title: v.title,
      cveId: v.cveId,
      severity: v.severity,
      assetKey: v.assetKey,
    })),
    investigations: SEED_INVESTIGATIONS.map((i) => i.key),
    incidents: SEED_INCIDENTS.map((i) => ({ key: i.key, title: i.title, status: i.status })),
    events: SEED_EVENTS.map((e) => e.key),
  }
}

describe('seed engine determinism', () => {
  it('produces identical datasets for the same PRNG seed', () => {
    const a = snapshotDataset()
    const b = snapshotDataset()
    expect(a).toEqual(b)
  })

  it('keeps expected Meridian volumes in range', () => {
    const data = snapshotDataset()
    expect(data.identities.length).toBeGreaterThanOrEqual(40)
    expect(data.assets.length).toBeGreaterThanOrEqual(80)
    expect(data.alerts.length).toBeGreaterThanOrEqual(150)
    expect(data.vulnerabilities.length).toBeGreaterThanOrEqual(40)
    expect(data.incidents.length).toBe(SEED_INCIDENTS.length)
    expect(data.investigations.length).toBe(SEED_INVESTIGATIONS.length)
    expect(data.events.length).toBe(SEED_EVENTS.length)
  })

  it('includes phishing and VPN CVE storyline anchors', () => {
    const data = snapshotDataset()
    const principals = data.identities.map((i) => i.principal)
    expect(principals.some((p) => p.toLowerCase().includes('okafor') || p.includes('maya'))).toBe(true)

    const titles = [...data.alerts.map((a) => a.title), ...data.vulnerabilities.map((v) => v.title)]
    expect(titles.some((t) => /phish|credential|mfa|login/i.test(t))).toBe(true)
    expect(data.vulnerabilities.some((v) => Boolean(v.cveId))).toBe(true)
  })
})
