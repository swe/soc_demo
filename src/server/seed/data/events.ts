import type { EventCategory } from '../../../domain/enums'
import { DAY, HOUR, MINUTE } from '../shift'

export type SeedEvent = {
  key: string
  minutesAgo: number
  source: string
  category: EventCategory
  actor: Record<string, unknown>
  target: Record<string, unknown>
  identityKeys: string[]
  assetKeys: string[]
  payload: Record<string, unknown>
}

/** Evidence events backing the phishing-chain and VPN storylines. */
export const SEED_EVENTS: SeedEvent[] = [
  {
    key: 'ev-phish-email',
    minutesAgo: 2 * DAY + 5 * HOUR + 12 * MINUTE,
    source: 'Proofpoint',
    category: 'finding',
    actor: { email: 'notices@meridian-secure-docs.com' },
    target: { email: 'maya.okafor@meridianfg.com' },
    identityKeys: ['maya-okafor'],
    assetKeys: [],
    payload: { subject: 'Settlement notice — action required', verdict: 'delivered', url: 'https://meridian-secure-docs.com/view/8842' },
  },
  {
    key: 'ev-phish-click',
    minutesAgo: 2 * DAY + 5 * HOUR,
    source: 'Netskope',
    category: 'network',
    actor: { device: 'LT-0447' },
    target: { domain: 'meridian-secure-docs.com', ip: '185.220.101.4' },
    identityKeys: ['maya-okafor'],
    assetKeys: ['lt-maya'],
    payload: { httpMethod: 'GET', bytesDown: 482113 },
  },
  {
    key: 'ev-phish-macro',
    minutesAgo: 2 * DAY + 4 * HOUR + 42 * MINUTE,
    source: 'CrowdStrike Falcon',
    category: 'process',
    actor: { process: 'WINWORD.EXE', user: 'maya.okafor' },
    target: { process: 'powershell.exe', commandLineHash: 'b64:JAB3AGMAPQ...' },
    identityKeys: ['maya-okafor'],
    assetKeys: ['lt-maya'],
    payload: { parentChain: ['outlook.exe', 'WINWORD.EXE', 'powershell.exe'] },
  },
  {
    key: 'ev-mfa-push-storm',
    minutesAgo: 1 * DAY + 22 * HOUR + 8 * MINUTE,
    source: 'Okta',
    category: 'auth',
    actor: { ip: '89.187.161.44', geo: 'Amsterdam, NL' },
    target: { user: 'maya.okafor@meridianfg.com' },
    identityKeys: ['maya-okafor'],
    assetKeys: [],
    payload: { pushesSent: 8, pushesDenied: 7, finalResult: 'approved', newDevice: true },
  },
  {
    key: 'ev-treasury-login',
    minutesAgo: 1 * DAY + 21 * HOUR + 25 * MINUTE,
    source: 'Okta',
    category: 'auth',
    actor: { user: 'maya.okafor@meridianfg.com', ip: '89.187.161.44' },
    target: { app: 'Treasury Payments Portal' },
    identityKeys: ['maya-okafor'],
    assetKeys: ['app-treasury'],
    payload: { result: 'success', sessionId: 'okta-9917f2' },
  },
  {
    key: 'ev-beacon-sample',
    minutesAgo: 1 * DAY + 18 * HOUR,
    source: 'Zeek',
    category: 'network',
    actor: { device: 'LT-0447' },
    target: { ip: '185.220.101.4', port: 443 },
    identityKeys: ['maya-okafor'],
    assetKeys: ['lt-maya'],
    payload: { intervalSeconds: 300, connectionsObserved: 96, ja3: 'e7d705a3286e19ea42f587b344ee6865' },
  },
  {
    key: 'ev-dlp-upload',
    minutesAgo: 26 * HOUR + 4 * MINUTE,
    source: 'Netskope DLP',
    category: 'network',
    actor: { device: 'LT-0447', user: 'maya.okafor' },
    target: { domain: 'transfer-cdn.io' },
    identityKeys: ['maya-okafor'],
    assetKeys: ['lt-maya'],
    payload: { bytesUp: 2469606195, files: 214, classification: 'contains client account numbers' },
  },
  {
    key: 'ev-vpn-exploit-http',
    minutesAgo: 5 * DAY + 8 * HOUR + 3 * MINUTE,
    source: 'Zeek',
    category: 'network',
    actor: { ip: '45.155.205.121' },
    target: { host: 'vpn-gw-nyc-01', uri: '/dana-na/auth/setcookie.cgi' },
    identityKeys: [],
    assetKeys: ['vpn-gw-1'],
    payload: { signature: 'CVE-2025-22457 overflow pattern', requests: 61 },
  },
  {
    key: 'ev-svc-backup-vpn',
    minutesAgo: 5 * DAY + 6 * HOUR + 11 * MINUTE,
    source: 'Okta',
    category: 'auth',
    actor: { user: 'svc-backup@meridianfg.com', ip: '73.194.11.87' },
    target: { app: 'VPN' },
    identityKeys: ['svc-backup'],
    assetKeys: ['vpn-gw-1', 'srv-backup-1'],
    payload: { result: 'success', daysSinceLastLogin: 140, network: 'residential ISP' },
  },
  {
    key: 'ev-svc-backup-smb',
    minutesAgo: 5 * DAY + 5 * HOUR + 40 * MINUTE,
    source: 'Zeek',
    category: 'network',
    actor: { user: 'svc-backup' },
    target: { host: 'srv-dc-01', protocol: 'SMB' },
    identityKeys: ['svc-backup'],
    assetKeys: ['srv-backup-1', 'srv-dc-1'],
    payload: { sharesEnumerated: 14, note: 'enumeration ceased after account disabled' },
  },
]
