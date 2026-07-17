import type { AssetType, Criticality } from '../../../domain/enums'
import type { Rng } from '../rand'
import type { SeedIdentity } from './identities'

export type SeedAsset = {
  key: string
  name: string
  type: AssetType
  criticality: Criticality
  ownerKey: string | null
  attributes: Record<string, unknown>
  riskScore: number
}

const OS = ['macOS 15.4', 'Windows 11 24H2', 'Ubuntu 24.04'] as const
const REGIONS = ['us-east-1', 'us-west-2', 'eu-central-1'] as const

/** Storyline assets referenced by alerts, events, vulnerabilities. */
export const STORYLINE_ASSETS: SeedAsset[] = [
  {
    key: 'lt-maya',
    name: 'LT-0447',
    type: 'device',
    criticality: 'tier2',
    ownerKey: 'maya-okafor',
    attributes: { os: 'macOS 15.4', kind: 'laptop', site: 'NYC-HQ' },
    riskScore: 78,
  },
  {
    key: 'vpn-gw-1',
    name: 'vpn-gw-nyc-01',
    type: 'device',
    criticality: 'tier1',
    ownerKey: null,
    attributes: { os: 'IvantiOS 22.7', kind: 'vpn_gateway', site: 'NYC-HQ', vendor: 'Ivanti' },
    riskScore: 91,
  },
  {
    key: 'srv-dc-1',
    name: 'srv-dc-01',
    type: 'device',
    criticality: 'tier1',
    ownerKey: 'devon-marsh',
    attributes: { os: 'Windows Server 2022', kind: 'domain_controller', site: 'NYC-HQ' },
    riskScore: 55,
  },
  {
    key: 'srv-backup-1',
    name: 'srv-backup-01',
    type: 'device',
    criticality: 'tier1',
    ownerKey: 'svc-backup',
    attributes: { os: 'Ubuntu 24.04', kind: 'backup_server', site: 'NJ-DR' },
    riskScore: 60,
  },
  {
    key: 'app-treasury',
    name: 'Treasury Payments Portal',
    type: 'application',
    criticality: 'tier1',
    ownerKey: null,
    attributes: { vendor: 'internal', url: 'https://treasury.meridianfg.com' },
    riskScore: 70,
  },
  {
    key: 's3-statements',
    name: 's3://mfg-client-statements',
    type: 'cloud_resource',
    criticality: 'tier1',
    ownerKey: null,
    attributes: { provider: 'aws', region: 'us-east-1', service: 's3' },
    riskScore: 66,
  },
]

export function buildAssets(rng: Rng, identities: SeedIdentity[]): SeedAsset[] {
  const assets: SeedAsset[] = []
  const humans = identities.filter((i) => i.type === 'human')

  // Employee laptops (~1 per human, excluding storyline laptop owner)
  let laptopN = 0
  for (const person of humans) {
    if (person.key === 'maya-okafor') continue
    laptopN++
    assets.push({
      key: `laptop-${person.key}`,
      name: `LT-${String(1000 + laptopN)}`,
      type: 'device',
      criticality: person.privilegeTier === 'privileged' ? 'tier2' : 'tier3',
      ownerKey: person.key,
      attributes: { os: rng.pick(OS), kind: 'laptop', site: rng.pick(['NYC-HQ', 'CHI-02', 'Remote']) },
      riskScore: rng.int(0, 55),
    })
  }

  // Servers
  const serverKinds = ['app_server', 'db_server', 'file_server', 'web_server'] as const
  for (let i = 1; i <= 14; i++) {
    assets.push({
      key: `srv-${i}`,
      name: `srv-${rng.pick(serverKinds).split('_')[0]}-${String(i).padStart(2, '0')}`,
      type: 'device',
      criticality: rng.weighted([['tier1', 2], ['tier2', 5], ['tier3', 3]] as const),
      ownerKey: null,
      attributes: { os: rng.pick(['Ubuntu 24.04', 'Windows Server 2022']), kind: rng.pick(serverKinds), site: rng.pick(['NYC-HQ', 'NJ-DR']) },
      riskScore: rng.int(10, 70),
    })
  }

  // Cloud resources
  const cloudServices = ['ec2', 'rds', 's3', 'lambda', 'eks'] as const
  for (let i = 1; i <= 26; i++) {
    const service = rng.pick(cloudServices)
    assets.push({
      key: `cloud-${i}`,
      name: `${service}-mfg-${String(i).padStart(3, '0')}`,
      type: 'cloud_resource',
      criticality: rng.weighted([['tier1', 1], ['tier2', 4], ['tier3', 5]] as const),
      ownerKey: null,
      attributes: { provider: 'aws', region: rng.pick(REGIONS), service },
      riskScore: rng.int(0, 65),
    })
  }

  // Applications
  const apps = ['Core Banking API', 'Client Portal', 'Wire Transfer Service', 'GL Reconciliation', 'KYC Screening', 'Market Data Feed', 'Payroll System', 'Ticketing System', 'Email Gateway', 'Document Vault'] as const
  apps.forEach((name, i) => {
    assets.push({
      key: `app-${i + 1}`,
      name,
      type: 'application',
      criticality: i < 4 ? 'tier1' : 'tier2',
      ownerKey: null,
      attributes: { vendor: 'internal' },
      riskScore: rng.int(10, 60),
    })
  })

  return [...STORYLINE_ASSETS, ...assets]
}
