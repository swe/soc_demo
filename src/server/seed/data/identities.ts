import type { IdentityType, PrivilegeTier } from '../../../domain/enums'
import type { Rng } from '../rand'

export type SeedIdentity = {
  key: string
  principal: string
  displayName: string
  type: IdentityType
  privilegeTier: PrivilegeTier
  mfaEnabled: boolean
  riskScore: number
  department: string
  title: string
}

const FIRST = ['James', 'Sofia', 'Wei', 'Priya', 'Daniel', 'Amara', 'Lucas', 'Elena', 'Omar', 'Grace', 'Viktor', 'Nina', 'Tomas', 'Aisha', 'Marcus', 'Yuki', 'Pavel', 'Ingrid', 'Carlos', 'Fatima', 'Sean', 'Leila', 'Anders', 'Rosa'] as const
const LAST = ['Chen', 'Rodriguez', 'Novak', 'Patel', 'Kim', 'Osei', 'Berg', 'Silva', 'Haddad', 'Kowalski', 'Tanaka', 'Ivanov', 'Larsen', 'Mbeki', 'Costa', 'Nakamura', 'Weber', 'Ali', 'Johansson', 'Reyes'] as const
const DEPARTMENTS = [
  ['Finance', 'Financial Analyst', 12],
  ['Engineering', 'Software Engineer', 14],
  ['Operations', 'Operations Specialist', 8],
  ['Sales', 'Account Executive', 7],
  ['Legal', 'Counsel', 3],
  ['HR', 'HR Business Partner', 3],
  ['Security', 'Security Analyst', 4],
] as const

/** Named storyline actors referenced by alerts, events, and incidents. */
export const STORYLINE_IDENTITIES: SeedIdentity[] = [
  {
    key: 'maya-okafor',
    principal: 'maya.okafor@meridianfg.com',
    displayName: 'Maya Okafor',
    type: 'human',
    privilegeTier: 'elevated',
    mfaEnabled: true,
    riskScore: 82,
    department: 'Finance',
    title: 'Senior Treasury Analyst',
  },
  {
    key: 'devon-marsh',
    principal: 'devon.marsh@meridianfg.com',
    displayName: 'Devon Marsh',
    type: 'human',
    privilegeTier: 'privileged',
    mfaEnabled: true,
    riskScore: 35,
    department: 'IT',
    title: 'Domain Administrator',
  },
  {
    key: 'svc-backup',
    principal: 'svc-backup@meridianfg.com',
    displayName: 'Backup Service Account',
    type: 'service',
    privilegeTier: 'privileged',
    mfaEnabled: false,
    riskScore: 64,
    department: 'IT',
    title: 'Service Account',
  },
  {
    key: 'svc-ci',
    principal: 'svc-ci@meridianfg.com',
    displayName: 'CI Pipeline Account',
    type: 'service',
    privilegeTier: 'elevated',
    mfaEnabled: false,
    riskScore: 22,
    department: 'Engineering',
    title: 'Service Account',
  },
]

export function buildIdentities(rng: Rng): SeedIdentity[] {
  const generated: SeedIdentity[] = []
  const used = new Set(STORYLINE_IDENTITIES.map((i) => i.principal))

  let n = 0
  for (const [department, title, count] of DEPARTMENTS) {
    for (let i = 0; i < count; i++) {
      let principal = ''
      let first = ''
      let last = ''
      do {
        first = rng.pick(FIRST)
        last = rng.pick(LAST)
        principal = `${first.toLowerCase()}.${last.toLowerCase()}@meridianfg.com`
      } while (used.has(principal))
      used.add(principal)
      n++

      const privileged = department === 'Security' || (department === 'Engineering' && rng.chance(0.2))
      generated.push({
        key: `emp-${n}`,
        principal,
        displayName: `${first} ${last}`,
        type: 'human',
        privilegeTier: privileged ? 'elevated' : 'standard',
        mfaEnabled: rng.chance(0.9),
        riskScore: rng.weighted([
          [rng.int(0, 20), 6],
          [rng.int(20, 45), 3],
          [rng.int(45, 70), 1],
        ]),
        department,
        title,
      })
    }
  }

  // A few machine identities
  for (let i = 1; i <= 5; i++) {
    generated.push({
      key: `machine-${i}`,
      principal: `host-agent-${String(i).padStart(2, '0')}$@meridianfg.com`,
      displayName: `Host Agent ${String(i).padStart(2, '0')}`,
      type: 'machine',
      privilegeTier: 'standard',
      mfaEnabled: false,
      riskScore: rng.int(0, 25),
      department: 'IT',
      title: 'Machine Account',
    })
  }

  return [...STORYLINE_IDENTITIES, ...generated]
}
