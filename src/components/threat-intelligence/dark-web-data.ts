import { assetIdentities } from "@/components/assets/identities-data";

export type ExposureSeverity = "critical" | "high" | "medium" | "low";

export type ExposureType = "credential" | "stealer" | "mention" | "ransomware";

export type ExposureStatus =
  | "new"
  | "investigating"
  | "remediated"
  | "false_positive"
  | "accepted_risk";

export type ExposureSort =
  | "newest"
  | "severity-desc"
  | "severity-asc"
  | "risk-desc"
  | "risk-asc"
  | "age-desc"
  | "age-asc";

export type WatchlistKind = "domain" | "email" | "brand" | "vip";

export type WatchlistStatus = "active" | "paused";

export type BreachDataClass =
  | "email"
  | "password"
  | "hash"
  | "pii"
  | "phone"
  | "session";

export type DarkWebExposure = {
  id: string;
  type: ExposureType;
  severity: ExposureSeverity;
  status: ExposureStatus;
  title: string;
  principal?: string;
  secretMasked: string;
  secretRevealable?: string;
  domain?: string;
  source: string;
  breachId?: string;
  identityId?: string;
  firstSeen: number;
  lastSeen: number;
  firstSeenLabel: string;
  lastSeenLabel: string;
  ageMinutes: number;
  privileged: boolean;
  riskScore: number;
  notes: string;
  tags: string[];
  snippet?: string;
  malwareFamily?: string;
  url?: string;
  passwordFlags?: ("weak" | "reused" | "plaintext" | "hashed")[];
  activity: { at: string; label: string }[];
};

export type DarkWebBreach = {
  id: string;
  name: string;
  dateLabel: string;
  dateValue: number;
  records: number;
  dataClasses: BreachDataClass[];
  matchedToWatchlist: boolean;
  orgImpact: ExposureSeverity;
  summary: string;
  source: string;
};

export type WatchlistEntry = {
  id: string;
  value: string;
  kind: WatchlistKind;
  addedLabel: string;
  addedValue: number;
  hits7d: number;
  status: WatchlistStatus;
  notes?: string;
};

export type DarkWebStat = {
  key: "new-7d" | "critical-creds" | "stealer" | "open-queue" | "watchlist";
  title: string;
  value: string;
  context: string;
  delta: number;
  preferLower?: boolean;
};

export const exposureSeverities = [
  "critical",
  "high",
  "medium",
  "low",
] as const satisfies readonly ExposureSeverity[];

export const exposureSeverityLabels: Record<ExposureSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const severityWeight: Record<ExposureSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const exposureTypes = [
  "credential",
  "stealer",
  "mention",
  "ransomware",
] as const satisfies readonly ExposureType[];

export const exposureTypeLabels: Record<ExposureType, string> = {
  credential: "Credentials",
  stealer: "Stealer log",
  mention: "Mention",
  ransomware: "Ransomware",
};

export const exposureStatuses = [
  "new",
  "investigating",
  "remediated",
  "false_positive",
  "accepted_risk",
] as const satisfies readonly ExposureStatus[];

export const exposureStatusLabels: Record<ExposureStatus, string> = {
  new: "New",
  investigating: "Investigating",
  remediated: "Remediated",
  false_positive: "False positive",
  accepted_risk: "Accepted risk",
};

export const openExposureStatuses: ExposureStatus[] = [
  "new",
  "investigating",
];

export const exposureSortLabels: Record<ExposureSort, string> = {
  newest: "Newest first",
  "severity-desc": "Severity (high → low)",
  "severity-asc": "Severity (low → high)",
  "risk-desc": "Risk (high → low)",
  "risk-asc": "Risk (low → high)",
  "age-desc": "Oldest first",
  "age-asc": "Newest by age",
};

export const watchlistKindLabels: Record<WatchlistKind, string> = {
  domain: "Domain",
  email: "Email",
  brand: "Brand",
  vip: "VIP",
};

export const breachDataClassLabels: Record<BreachDataClass, string> = {
  email: "Email",
  password: "Password",
  hash: "Hash",
  pii: "PII",
  phone: "Phone",
  session: "Session",
};

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const NOW = Date.UTC(2026, 6, 28, 8, 0, 0);

function ago(days: number, hours = 0) {
  return NOW - days * DAY_MS - hours * HOUR_MS;
}

function ageLabel(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / (60 * 24))}d`;
}

function formatRelative(ts: number) {
  const minutes = Math.max(1, Math.round((NOW - ts) / 60_000));
  return ageLabel(minutes) + " ago";
}

function findIdentity(principal: string) {
  return assetIdentities.find(
    (identity) => identity.principal.toLowerCase() === principal.toLowerCase(),
  );
}

export const darkWebSources = [
  "Combo list",
  "Stealer market",
  "Paste site",
  "Telegram channel",
  "Forum dump",
  "Ransomware leak site",
  "Cloud bucket",
  "Breach corpus",
] as const;

export type DarkWebSource = (typeof darkWebSources)[number];

export const darkWebBreaches: DarkWebBreach[] = [
  {
    id: "br-acme-vpn-2024",
    name: "Acme Corp VPN dump (2024)",
    dateLabel: "Mar 2024",
    dateValue: Date.UTC(2024, 2, 12),
    records: 1842,
    dataClasses: ["email", "password", "hash"],
    matchedToWatchlist: true,
    orgImpact: "critical",
    summary:
      "Historical VPN portal credentials recirculated on a stealer-adjacent forum. Multiple svalbard.ca principals with plaintext and NTLM hashes.",
    source: "Forum dump",
  },
  {
    id: "br-collection-x",
    name: "Collection X remix",
    dateLabel: "Jan 2025",
    dateValue: Date.UTC(2025, 0, 18),
    records: 12_400_000,
    dataClasses: ["email", "password"],
    matchedToWatchlist: true,
    orgImpact: "high",
    summary:
      "Large combo remix containing corporate emails. Password reuse against workforce IdP is the primary concern.",
    source: "Combo list",
  },
  {
    id: "br-linkedin-style",
    name: "Professional network scrape 2023",
    dateLabel: "Jun 2023",
    dateValue: Date.UTC(2023, 5, 2),
    records: 4_200_000,
    dataClasses: ["email", "pii"],
    matchedToWatchlist: true,
    orgImpact: "medium",
    summary:
      "Public profile scrape with work emails. Useful for spear-phish targeting; no passwords in the original corpus.",
    source: "Breach corpus",
  },
  {
    id: "br-redline-wave",
    name: "RedLine stealer wave Q2",
    dateLabel: "May 2026",
    dateValue: Date.UTC(2026, 4, 9),
    records: 68_000,
    dataClasses: ["email", "password", "session"],
    matchedToWatchlist: true,
    orgImpact: "critical",
    summary:
      "Infostealer logs sold in bulk. Includes browser autofill and session cookies for SaaS apps.",
    source: "Stealer market",
  },
  {
    id: "br-adobe-legacy",
    name: "Legacy Adobe-style corpus",
    dateLabel: "2013 / remixed 2025",
    dateValue: Date.UTC(2025, 8, 1),
    records: 150_000_000,
    dataClasses: ["email", "hash"],
    matchedToWatchlist: false,
    orgImpact: "low",
    summary:
      "Ancient consumer breach remixed into modern combo lists. Low org relevance unless password reuse is confirmed.",
    source: "Breach corpus",
  },
  {
    id: "br-github-gist",
    name: "Public gist credential paste",
    dateLabel: "Jul 2026",
    dateValue: Date.UTC(2026, 6, 3),
    records: 42,
    dataClasses: ["email", "password"],
    matchedToWatchlist: true,
    orgImpact: "high",
    summary:
      "Small paste of service and contractor credentials including svalbard.ca mailboxes.",
    source: "Paste site",
  },
  {
    id: "br-telegram-logs",
    name: "Telegram #logs-for-sale batch",
    dateLabel: "Jul 2026",
    dateValue: Date.UTC(2026, 6, 20),
    records: 9_400,
    dataClasses: ["email", "password", "session"],
    matchedToWatchlist: true,
    orgImpact: "high",
    summary:
      "Channel posting daily stealer extracts. Several hits on watched domains in the last week.",
    source: "Telegram channel",
  },
  {
    id: "br-lockbit-adjacent",
    name: "LockBit-adjacent victim listing",
    dateLabel: "Jun 2026",
    dateValue: Date.UTC(2026, 5, 28),
    records: 1,
    dataClasses: ["pii"],
    matchedToWatchlist: true,
    orgImpact: "medium",
    summary:
      "Ransomware leak site claimed a subsidiary brand. No confirmed data drop for the parent domain yet.",
    source: "Ransomware leak site",
  },
  {
    id: "br-okta-phish-kit",
    name: "Okta phishing kit victims",
    dateLabel: "Apr 2026",
    dateValue: Date.UTC(2026, 3, 14),
    records: 3_100,
    dataClasses: ["email", "password", "session"],
    matchedToWatchlist: true,
    orgImpact: "critical",
    summary:
      "Credentials harvested via fake IdP pages. Session cookies present for a subset of victims.",
    source: "Stealer market",
  },
  {
    id: "br-s3-misconfig",
    name: "Exposed S3 employee export",
    dateLabel: "Feb 2026",
    dateValue: Date.UTC(2026, 1, 7),
    records: 11_200,
    dataClasses: ["email", "pii", "phone"],
    matchedToWatchlist: true,
    orgImpact: "medium",
    summary:
      "Misconfigured bucket with HR-adjacent export. No passwords, but strong targeting intel.",
    source: "Cloud bucket",
  },
  {
    id: "br-forum-dox",
    name: "Forum doxx thread — executives",
    dateLabel: "Jul 2026",
    dateValue: Date.UTC(2026, 6, 22),
    records: 6,
    dataClasses: ["email", "pii", "phone"],
    matchedToWatchlist: true,
    orgImpact: "high",
    summary:
      "Thread naming VIP watchlist principals with personal emails and phone numbers.",
    source: "Forum dump",
  },
  {
    id: "br-generic-stealer",
    name: "Generic Raccoon log pack",
    dateLabel: "May 2026",
    dateValue: Date.UTC(2026, 4, 30),
    records: 22_000,
    dataClasses: ["email", "password", "session"],
    matchedToWatchlist: true,
    orgImpact: "high",
    summary:
      "Commodity stealer pack with autofill for banking and SaaS. Several svalbard.ca hits.",
    source: "Stealer market",
  },
];

export const initialWatchlist: WatchlistEntry[] = [
  {
    id: "wl-01",
    value: "svalbard.ca",
    kind: "domain",
    addedLabel: "Jan 12, 2025",
    addedValue: Date.UTC(2025, 0, 12),
    hits7d: 18,
    status: "active",
  },
  {
    id: "wl-02",
    value: "svalbard.ca",
    kind: "domain",
    addedLabel: "Jan 12, 2025",
    addedValue: Date.UTC(2025, 0, 12),
    hits7d: 4,
    status: "active",
  },
  {
    id: "wl-03",
    value: "Acme Corp",
    kind: "brand",
    addedLabel: "Feb 3, 2025",
    addedValue: Date.UTC(2025, 1, 3),
    hits7d: 7,
    status: "active",
  },
  {
    id: "wl-04",
    value: "Acme Security",
    kind: "brand",
    addedLabel: "Mar 1, 2025",
    addedValue: Date.UTC(2025, 2, 1),
    hits7d: 2,
    status: "active",
  },
  {
    id: "wl-05",
    value: "wendy.darling@svalbard.ca",
    kind: "vip",
    addedLabel: "Apr 18, 2025",
    addedValue: Date.UTC(2025, 3, 18),
    hits7d: 1,
    status: "active",
    notes: "CISO — priority notify",
  },
  {
    id: "wl-06",
    value: "nibs@svalbard.ca",
    kind: "vip",
    addedLabel: "Apr 18, 2025",
    addedValue: Date.UTC(2025, 3, 18),
    hits7d: 0,
    status: "active",
    notes: "CFO",
  },
  {
    id: "wl-07",
    value: "*@contractors.svalbard.ca",
    kind: "email",
    addedLabel: "Jun 2, 2025",
    addedValue: Date.UTC(2025, 5, 2),
    hits7d: 3,
    status: "active",
  },
  {
    id: "wl-08",
    value: "acme-vpn.example.net",
    kind: "domain",
    addedLabel: "Jul 1, 2026",
    addedValue: Date.UTC(2026, 6, 1),
    hits7d: 1,
    status: "paused",
    notes: "Legacy VPN hostname — verify before retiring",
  },
];

type ExposureSeed = Omit<
  DarkWebExposure,
  | "firstSeenLabel"
  | "lastSeenLabel"
  | "ageMinutes"
  | "riskScore"
  | "privileged"
  | "identityId"
  | "activity"
  | "domain"
> &
  Partial<
    Pick<
      DarkWebExposure,
      | "riskScore"
      | "privileged"
      | "identityId"
      | "activity"
      | "domain"
      | "firstSeenLabel"
      | "lastSeenLabel"
      | "ageMinutes"
    >
  >;

function normalizeExposure(seed: ExposureSeed, index: number): DarkWebExposure {
  const identity = seed.principal ? findIdentity(seed.principal) : undefined;
  const identityId = seed.identityId ?? identity?.id;
  const privileged = seed.privileged ?? identity?.privileged ?? false;
  const domain =
    seed.domain ??
    (seed.principal?.includes("@")
      ? seed.principal.split("@")[1]
      : undefined);

  const ageMinutes =
    seed.ageMinutes ?? Math.max(1, Math.round((NOW - seed.firstSeen) / 60_000));
  const firstSeenLabel = seed.firstSeenLabel ?? formatRelative(seed.firstSeen);
  const lastSeenLabel = seed.lastSeenLabel ?? formatRelative(seed.lastSeen);

  const baseRisk =
    seed.riskScore ??
    (seed.severity === "critical"
      ? 88
      : seed.severity === "high"
        ? 72
        : seed.severity === "medium"
          ? 48
          : 28) +
      (privileged ? 8 : 0) +
      (seed.type === "stealer" ? 5 : 0) +
      (index % 7);

  const activity =
    seed.activity ??
    [
      {
        at: firstSeenLabel,
        label: "Matched to watchlist",
      },
      ...(seed.status !== "new"
        ? [
            {
              at: lastSeenLabel,
              label: `Status → ${exposureStatusLabels[seed.status]}`,
            },
          ]
        : []),
    ];

  return {
    ...seed,
    identityId,
    privileged,
    domain,
    ageMinutes,
    firstSeenLabel,
    lastSeenLabel,
    riskScore: Math.min(99, baseRisk),
    activity,
  };
}

const exposureSeeds: ExposureSeed[] = [
  {
    id: "dw-001",
    type: "credential",
    severity: "critical",
    status: "new",
    title: "Privileged IdP credential in combo list",
    principal: "wendy.darling@svalbard.ca",
    secretMasked: "••••••••••••",
    secretRevealable: "S3cur3!Vault2024",
    source: "Combo list",
    breachId: "br-collection-x",
    firstSeen: ago(1, 4),
    lastSeen: ago(0, 6),
    notes: "CISO mailbox with plaintext password. Immediate reset recommended.",
    tags: ["privileged", "plaintext", "idp"],
    passwordFlags: ["plaintext", "reused"],
    snippet: "wendy.darling@svalbard.ca:********",
  },
  {
    id: "dw-002",
    type: "stealer",
    severity: "critical",
    status: "new",
    title: "Okta session cookie in RedLine log",
    principal: "john.darling@svalbard.ca",
    secretMasked: "cookie: sid=••••••••",
    secretRevealable: "sid=01ABCDEF.session.token.demo",
    source: "Stealer market",
    breachId: "br-redline-wave",
    firstSeen: ago(0, 8),
    lastSeen: ago(0, 3),
    notes: "Live session material for workforce IdP. Revoke sessions now.",
    tags: ["session", "okta", "stealer"],
    malwareFamily: "RedLine",
    url: "https://login.okta.com",
    passwordFlags: ["plaintext"],
  },
  {
    id: "dw-003",
    type: "credential",
    severity: "high",
    status: "investigating",
    title: "VPN portal password recirculated",
    principal: "peter.pan@svalbard.ca",
    secretMasked: "••••••••",
    secretRevealable: "Summer2023!",
    source: "Forum dump",
    breachId: "br-acme-vpn-2024",
    firstSeen: ago(3, 2),
    lastSeen: ago(1, 10),
    notes: "Weak password pattern. Confirm MFA and VPN account status.",
    tags: ["vpn", "weak"],
    passwordFlags: ["weak", "plaintext", "reused"],
  },
  {
    id: "dw-004",
    type: "stealer",
    severity: "high",
    status: "new",
    title: "Browser autofill for corp email",
    principal: "tiger.lily@svalbard.ca",
    secretMasked: "autofill ••••••••",
    secretRevealable: "M@yaRao#99",
    source: "Stealer market",
    breachId: "br-generic-stealer",
    firstSeen: ago(2, 5),
    lastSeen: ago(2, 1),
    notes: "Raccoon log includes outlook.office.com autofill.",
    tags: ["autofill", "email"],
    malwareFamily: "Raccoon",
    url: "https://outlook.office.com",
    passwordFlags: ["plaintext"],
  },
  {
    id: "dw-005",
    type: "mention",
    severity: "medium",
    status: "new",
    title: "Brand discussed in Telegram channel",
    principal: undefined,
    secretMasked: "—",
    source: "Telegram channel",
    firstSeen: ago(1, 12),
    lastSeen: ago(1, 12),
    domain: "svalbard.ca",
    notes: "Channel advertising “fresh Acme Corp logs.” No sample verified yet.",
    tags: ["brand", "telegram"],
    snippet:
      "selling fresh @svalbard.ca logs — 40 seats — dm for price",
  },
  {
    id: "dw-006",
    type: "ransomware",
    severity: "high",
    status: "investigating",
    title: "Subsidiary named on leak site",
    principal: undefined,
    secretMasked: "—",
    source: "Ransomware leak site",
    breachId: "br-lockbit-adjacent",
    firstSeen: ago(5, 0),
    lastSeen: ago(2, 4),
    domain: "svalbard.ca",
    notes:
      "Claim lists Acme Security as upcoming drop. No file tree published yet.",
    tags: ["ransomware", "subsidiary"],
    snippet: "Acme Security — negotiation failed — data to be published",
  },
  {
    id: "dw-007",
    type: "credential",
    severity: "critical",
    status: "new",
    title: "Service account in public gist",
    principal: "svc-ti-feed@svalbard.ca",
    secretMasked: "••••••••••••••••",
    secretRevealable: "ghp_demoTokenNotReal0001",
    source: "Paste site",
    breachId: "br-github-gist",
    firstSeen: ago(0, 14),
    lastSeen: ago(0, 14),
    notes: "API token-shaped secret alongside service mailbox.",
    tags: ["service", "token", "gist"],
    passwordFlags: ["plaintext"],
    identityId: "id-svc-12",
  },
  {
    id: "dw-008",
    type: "credential",
    severity: "high",
    status: "new",
    title: "Contractor mailbox in combo remix",
    principal: "temp.vendor@contractors.svalbard.ca",
    secretMasked: "••••••••",
    secretRevealable: "VendorPass1",
    source: "Combo list",
    breachId: "br-collection-x",
    firstSeen: ago(4, 6),
    lastSeen: ago(1, 2),
    domain: "contractors.svalbard.ca",
    notes: "Matches contractor email watchlist pattern.",
    tags: ["contractor", "combo"],
    passwordFlags: ["weak", "plaintext"],
  },
  {
    id: "dw-009",
    type: "stealer",
    severity: "critical",
    status: "investigating",
    title: "Phishing-kit harvest with session",
    principal: "tootles@svalbard.ca",
    secretMasked: "pass + cookie ••••••••",
    secretRevealable: "OwenLee!Okta",
    source: "Stealer market",
    breachId: "br-okta-phish-kit",
    firstSeen: ago(6, 3),
    lastSeen: ago(0, 20),
    notes: "Appears in Okta phishing victim pack with sid cookie.",
    tags: ["phishing", "session"],
    malwareFamily: "Custom kit",
    url: "https://acme-okta-login.evil.example",
    passwordFlags: ["plaintext"],
  },
  {
    id: "dw-010",
    type: "mention",
    severity: "high",
    status: "new",
    title: "VIP doxxed on forum thread",
    principal: "wendy.darling@svalbard.ca",
    secretMasked: "—",
    source: "Forum dump",
    breachId: "br-forum-dox",
    firstSeen: ago(2, 8),
    lastSeen: ago(2, 8),
    notes: "Personal phone and alt email posted beside work identity.",
    tags: ["vip", "dox", "pii"],
    snippet: "CISO Wendy Darling — personal: r.***@gmail.com — +1-415-***",
  },
  {
    id: "dw-011",
    type: "credential",
    severity: "medium",
    status: "remediated",
    title: "Hashed password in legacy corpus",
    principal: "tinker.bell@svalbard.ca",
    secretMasked: "hash: $2b$••••••••",
    secretRevealable: "$2b$12$demoHashNotARealPasswordxxxxxx",
    source: "Breach corpus",
    breachId: "br-adobe-legacy",
    firstSeen: ago(20, 0),
    lastSeen: ago(12, 0),
    notes: "Password rotated after prior review. Left for audit trail.",
    tags: ["hash", "legacy"],
    passwordFlags: ["hashed"],
  },
  {
    id: "dw-012",
    type: "credential",
    severity: "high",
    status: "new",
    title: "Privileged admin in VPN dump",
    principal: "james.hook@svalbard.ca",
    secretMasked: "••••••••••••",
    secretRevealable: "VHale#Vpn99",
    source: "Forum dump",
    breachId: "br-acme-vpn-2024",
    firstSeen: ago(7, 4),
    lastSeen: ago(3, 1),
    notes: "Domain admin-adjacent identity. Confirm VPN still enabled.",
    tags: ["privileged", "vpn"],
    passwordFlags: ["plaintext", "reused"],
  },
  {
    id: "dw-013",
    type: "stealer",
    severity: "medium",
    status: "false_positive",
    title: "Cookie for personal banking site",
    principal: "george.darling@svalbard.ca",
    secretMasked: "cookie ••••••••",
    source: "Stealer market",
    breachId: "br-telegram-logs",
    firstSeen: ago(8, 0),
    lastSeen: ago(8, 0),
    notes: "Log matched email but only personal banking cookies — no corp apps.",
    tags: ["personal", "fp"],
    malwareFamily: "RedLine",
    url: "https://treasury.svalbard.ca",
  },
  {
    id: "dw-014",
    type: "ransomware",
    severity: "medium",
    status: "new",
    title: "Brand string on leak countdown",
    principal: undefined,
    secretMasked: "—",
    source: "Ransomware leak site",
    firstSeen: ago(1, 1),
    lastSeen: ago(0, 18),
    domain: "svalbard.ca",
    notes: "Countdown page mentions Acme; may be brand collision — verify.",
    tags: ["ransomware", "verify"],
    snippet: "T-48h — ACME — sample screenshots pending",
  },
  {
    id: "dw-015",
    type: "mention",
    severity: "low",
    status: "accepted_risk",
    title: "Paste mentioning Acme job openings",
    principal: undefined,
    secretMasked: "—",
    source: "Paste site",
    firstSeen: ago(10, 0),
    lastSeen: ago(10, 0),
    domain: "svalbard.ca",
    notes: "Recruiting spam paste. No credential content.",
    tags: ["noise"],
    snippet: "hiring @ svalbard.ca — remote SOC — apply…",
  },
  {
    id: "dw-016",
    type: "credential",
    severity: "high",
    status: "new",
    title: "Workforce email in Collection X",
    principal: "first.twin@svalbard.ca",
    secretMasked: "••••••••",
    secretRevealable: "N0ahBennett",
    source: "Combo list",
    breachId: "br-collection-x",
    firstSeen: ago(2, 16),
    lastSeen: ago(0, 9),
    notes: "Plaintext password; check reuse against IdP.",
    tags: ["combo", "reuse"],
    passwordFlags: ["plaintext", "reused", "weak"],
  },
  {
    id: "dw-017",
    type: "stealer",
    severity: "high",
    status: "new",
    title: "AWS console autofill in stealer log",
    principal: "second.twin@svalbard.ca",
    secretMasked: "autofill ••••••••",
    secretRevealable: "PriyaCloud#2025",
    source: "Stealer market",
    breachId: "br-redline-wave",
    firstSeen: ago(1, 6),
    lastSeen: ago(1, 2),
    notes: "Autofill targets console.aws.amazon.com.",
    tags: ["aws", "cloud"],
    malwareFamily: "RedLine",
    url: "https://console.aws.amazon.com",
    passwordFlags: ["plaintext"],
  },
  {
    id: "dw-018",
    type: "credential",
    severity: "medium",
    status: "investigating",
    title: "Email in professional scrape",
    principal: "black.murphy@svalbard.ca",
    secretMasked: "—",
    source: "Breach corpus",
    breachId: "br-linkedin-style",
    firstSeen: ago(15, 0),
    lastSeen: ago(15, 0),
    notes: "No password. Useful for targeting awareness.",
    tags: ["pii", "email-only"],
  },
  {
    id: "dw-019",
    type: "mention",
    severity: "medium",
    status: "new",
    title: "Pastebin dump advertises svalbard.ca logs",
    principal: undefined,
    secretMasked: "—",
    source: "Paste site",
    firstSeen: ago(0, 22),
    lastSeen: ago(0, 22),
    domain: "svalbard.ca",
    notes: "Paste indexes alleged dump; sample lines not yet retrieved.",
    tags: ["paste", "index"],
    snippet: "INDEX svalbard.ca 2026-07 — 120 lines — mirror at…",
  },
  {
    id: "dw-020",
    type: "credential",
    severity: "critical",
    status: "new",
    title: "Privileged mailbox + weak password",
    principal: "canary.robb@svalbard.ca",
    secretMasked: "••••••••",
    secretRevealable: "Password1!",
    source: "Combo list",
    breachId: "br-collection-x",
    firstSeen: ago(0, 4),
    lastSeen: ago(0, 2),
    notes: "Trivial password on privileged identity.",
    tags: ["privileged", "weak"],
    passwordFlags: ["weak", "plaintext", "reused"],
  },
  {
    id: "dw-021",
    type: "stealer",
    severity: "medium",
    status: "new",
    title: "Slack workspace cookie",
    principal: "smee@svalbard.ca",
    secretMasked: "cookie ••••••••",
    secretRevealable: "xoxd-demo-slack-cookie",
    source: "Telegram channel",
    breachId: "br-telegram-logs",
    firstSeen: ago(3, 9),
    lastSeen: ago(3, 9),
    notes: "Cookie for slack.svalbard.ca — treat as session compromise.",
    tags: ["slack", "session"],
    malwareFamily: "Vidar",
    url: "https://slack.svalbard.ca",
  },
  {
    id: "dw-022",
    type: "ransomware",
    severity: "low",
    status: "false_positive",
    title: "Unrelated ACME manufacturer listing",
    principal: undefined,
    secretMasked: "—",
    source: "Ransomware leak site",
    firstSeen: ago(9, 0),
    lastSeen: ago(9, 0),
    domain: "svalbard.ca",
    notes: "Different company (hardware OEM). Closed as brand collision.",
    tags: ["collision", "fp"],
    snippet: "ACME Industrial Fasteners — 12GB",
  },
  {
    id: "dw-023",
    type: "credential",
    severity: "high",
    status: "new",
    title: "HR export email + password pair",
    principal: "liza@svalbard.ca",
    secretMasked: "••••••••••••",
    secretRevealable: "CollinsHR!42",
    source: "Cloud bucket",
    breachId: "br-s3-misconfig",
    firstSeen: ago(11, 0),
    lastSeen: ago(4, 0),
    notes: "Appeared alongside S3 export chatter; password may be unrelated reuse.",
    tags: ["hr", "reuse"],
    passwordFlags: ["plaintext"],
  },
  {
    id: "dw-024",
    type: "stealer",
    severity: "critical",
    status: "new",
    title: "Privileged user — GitHub + IdP cookies",
    principal: "michael.darling@svalbard.ca",
    secretMasked: "multi-cookie ••••••••",
    source: "Stealer market",
    breachId: "br-redline-wave",
    firstSeen: ago(0, 11),
    lastSeen: ago(0, 5),
    notes: "Multiple high-value sessions in one log line.",
    tags: ["privileged", "github", "okta"],
    malwareFamily: "RedLine",
    url: "https://github.com",
  },
  {
    id: "dw-025",
    type: "mention",
    severity: "high",
    status: "investigating",
    title: "Forum thread selling “Acme VPN configs”",
    principal: undefined,
    secretMasked: "—",
    source: "Forum dump",
    breachId: "br-acme-vpn-2024",
    firstSeen: ago(4, 12),
    lastSeen: ago(1, 7),
    domain: "acme-vpn.example.net",
    notes: "May relate to historical VPN dump; validate configs.",
    tags: ["vpn", "sale"],
    snippet: "ovpn packs for acme-vpn.example.net — $40",
  },
  {
    id: "dw-026",
    type: "credential",
    severity: "medium",
    status: "new",
    title: "Guest identity in combo list",
    principal: "mary.darling@svalbard.ca",
    secretMasked: "••••••••",
    secretRevealable: "hk2022guest",
    source: "Combo list",
    breachId: "br-collection-x",
    firstSeen: ago(5, 8),
    lastSeen: ago(5, 8),
    notes: "Guest/contractor-like password hygiene.",
    tags: ["guest"],
    passwordFlags: ["weak", "plaintext"],
  },
  {
    id: "dw-027",
    type: "credential",
    severity: "high",
    status: "new",
    title: "Privileged finance identity exposed",
    principal: "nibs@svalbard.ca",
    secretMasked: "••••••••••••",
    secretRevealable: "MChen$Finance",
    source: "Paste site",
    breachId: "br-github-gist",
    firstSeen: ago(1, 18),
    lastSeen: ago(0, 16),
    notes: "CFO VIP watchlist hit with plaintext password.",
    tags: ["vip", "finance"],
    passwordFlags: ["plaintext"],
  },
  {
    id: "dw-028",
    type: "stealer",
    severity: "medium",
    status: "remediated",
    title: "Old stealer hit — password rotated",
    principal: "curly@svalbard.ca",
    secretMasked: "••••••••",
    source: "Stealer market",
    breachId: "br-generic-stealer",
    firstSeen: ago(25, 0),
    lastSeen: ago(18, 0),
    notes: "Remediated last month; retained for trend metrics.",
    tags: ["closed"],
    malwareFamily: "Raccoon",
    url: "https://mail.google.com",
  },
  {
    id: "dw-029",
    type: "ransomware",
    severity: "critical",
    status: "new",
    title: "Sample archive claims svalbard.ca file tree",
    principal: undefined,
    secretMasked: "—",
    source: "Ransomware leak site",
    breachId: "br-lockbit-adjacent",
    firstSeen: ago(0, 7),
    lastSeen: ago(0, 1),
    domain: "svalbard.ca",
    notes: "Sample zip listing includes Finance/ and Legal/ paths.",
    tags: ["sample", "ransomware"],
    snippet: "/Finance/Q2_board.pdf — /Legal/msa_svalbard.docx",
  },
  {
    id: "dw-030",
    type: "mention",
    severity: "medium",
    status: "new",
    title: "Telegram post offers Acme employee DB",
    principal: undefined,
    secretMasked: "—",
    source: "Telegram channel",
    breachId: "br-s3-misconfig",
    firstSeen: ago(3, 4),
    lastSeen: ago(2, 20),
    domain: "svalbard.ca",
    notes: "Likely resale of S3 HR export.",
    tags: ["telegram", "pii"],
    snippet: "Acme employees csv — emails phones titles — $150",
  },
  {
    id: "dw-031",
    type: "credential",
    severity: "low",
    status: "accepted_risk",
    title: "Personal email alias only",
    principal: "cecco@svalbard.ca",
    secretMasked: "—",
    source: "Breach corpus",
    breachId: "br-linkedin-style",
    firstSeen: ago(30, 0),
    lastSeen: ago(30, 0),
    notes: "Email-only scrape; accepted as awareness signal.",
    tags: ["email-only"],
  },
  {
    id: "dw-032",
    type: "credential",
    severity: "high",
    status: "investigating",
    title: "Helpdesk account in combo",
    principal: "bill.jukes@svalbard.ca",
    secretMasked: "••••••••",
    secretRevealable: "HelpDesk#1",
    source: "Combo list",
    breachId: "br-collection-x",
    firstSeen: ago(2, 2),
    lastSeen: ago(1, 14),
    notes: "Helpdesk-capable identity with weak password.",
    tags: ["helpdesk", "weak"],
    passwordFlags: ["weak", "plaintext", "reused"],
  },
  {
    id: "dw-033",
    type: "stealer",
    severity: "high",
    status: "new",
    title: "Microsoft 365 autofill + cookie",
    principal: "gentleman.starkey@svalbard.ca",
    secretMasked: "•••••••• + cookie",
    secretRevealable: "GabSantos365!",
    source: "Stealer market",
    breachId: "br-okta-phish-kit",
    firstSeen: ago(1, 0),
    lastSeen: ago(0, 12),
    notes: "login.microsoftonline.com material.",
    tags: ["m365", "session"],
    malwareFamily: "Custom kit",
    url: "https://login.microsoftonline.com",
    passwordFlags: ["plaintext"],
  },
  {
    id: "dw-034",
    type: "credential",
    severity: "medium",
    status: "new",
    title: "Corp email in Telegram batch",
    principal: "tinker.bell@svalbard.ca",
    secretMasked: "••••••••",
    secretRevealable: "IngridOlsen88",
    source: "Telegram channel",
    breachId: "br-telegram-logs",
    firstSeen: ago(4, 1),
    lastSeen: ago(4, 1),
    notes: "Appears in daily stealer extract channel.",
    tags: ["telegram"],
    passwordFlags: ["plaintext", "weak"],
  },
  {
    id: "dw-035",
    type: "mention",
    severity: "low",
    status: "new",
    title: "Brand mentioned in scam lure",
    principal: undefined,
    secretMasked: "—",
    source: "Paste site",
    firstSeen: ago(6, 10),
    lastSeen: ago(6, 10),
    domain: "svalbard.ca",
    notes: "Phishing lure text impersonating Acme IT.",
    tags: ["phishing", "lure"],
    snippet: "Acme IT: reset your VPN at http://acme-vpn-reset.evil…",
  },
  {
    id: "dw-036",
    type: "credential",
    severity: "critical",
    status: "new",
    title: "Domain admin hash in VPN dump",
    principal: "slightly@svalbard.ca",
    secretMasked: "NTLM ••••••••••••••••",
    secretRevealable: "aad3b435b51404eeaad3b435b51404ee:deadbeefcafebabe",
    source: "Forum dump",
    breachId: "br-acme-vpn-2024",
    firstSeen: ago(8, 0),
    lastSeen: ago(2, 6),
    notes: "NTLM hash for privileged engineering identity.",
    tags: ["hash", "privileged", "ntlm"],
    passwordFlags: ["hashed"],
  },
  {
    id: "dw-037",
    type: "stealer",
    severity: "low",
    status: "false_positive",
    title: "Matched email, non-corp URLs only",
    principal: "tiger.lily@svalbard.ca",
    secretMasked: "—",
    source: "Stealer market",
    breachId: "br-generic-stealer",
    firstSeen: ago(14, 0),
    lastSeen: ago(14, 0),
    notes: "Shopping and social URLs only.",
    tags: ["fp"],
    malwareFamily: "Raccoon",
  },
  {
    id: "dw-038",
    type: "ransomware",
    severity: "medium",
    status: "investigating",
    title: "Negotiation chat leaked mentioning Acme",
    principal: undefined,
    secretMasked: "—",
    source: "Ransomware leak site",
    firstSeen: ago(3, 16),
    lastSeen: ago(1, 3),
    domain: "svalbard.ca",
    notes: "Chat log references Acme Security counsel — verify authenticity.",
    tags: ["chat", "verify"],
    snippet: "your counsel at Acme Security has 24h…",
  },
  {
    id: "dw-039",
    type: "credential",
    severity: "high",
    status: "new",
    title: "Privileged SOC analyst credential",
    principal: "neverbird@svalbard.ca",
    secretMasked: "••••••••••••",
    secretRevealable: "FelixSOC!2024",
    source: "Combo list",
    breachId: "br-collection-x",
    firstSeen: ago(0, 19),
    lastSeen: ago(0, 8),
    notes: "SOC analyst with elevated tooling access.",
    tags: ["soc", "privileged"],
    passwordFlags: ["plaintext"],
  },
  {
    id: "dw-040",
    type: "stealer",
    severity: "high",
    status: "new",
    title: "VPN portal cookie from stealer",
    principal: "liza@svalbard.ca",
    secretMasked: "cookie ••••••••",
    source: "Stealer market",
    breachId: "br-redline-wave",
    firstSeen: ago(2, 11),
    lastSeen: ago(2, 3),
    notes: "Cookie for legacy VPN hostname on watchlist.",
    tags: ["vpn", "session"],
    malwareFamily: "RedLine",
    url: "https://acme-vpn.example.net",
  },
  {
    id: "dw-041",
    type: "credential",
    severity: "medium",
    status: "new",
    title: "Contractor pattern email exposed",
    principal: "ext.analyst@contractors.svalbard.ca",
    secretMasked: "••••••••",
    secretRevealable: "ExtTemp#9",
    source: "Combo list",
    breachId: "br-github-gist",
    firstSeen: ago(1, 9),
    lastSeen: ago(1, 9),
    domain: "contractors.svalbard.ca",
    notes: "Matches *@contractors.svalbard.ca watchlist.",
    tags: ["contractor"],
    passwordFlags: ["weak", "plaintext"],
  },
  {
    id: "dw-042",
    type: "mention",
    severity: "high",
    status: "new",
    title: "VIP personal email sold with work title",
    principal: "nibs@svalbard.ca",
    secretMasked: "—",
    source: "Forum dump",
    breachId: "br-forum-dox",
    firstSeen: ago(2, 4),
    lastSeen: ago(2, 4),
    notes: "Doxx thread pairs CFO work identity with personal contact info.",
    tags: ["vip", "dox"],
    snippet: "Wibbles CFO Acme — personal gmail + mobile",
  },
  {
    id: "dw-043",
    type: "credential",
    severity: "low",
    status: "remediated",
    title: "Old combo hit — already rotated",
    principal: "nana@partners.svalbard.ca",
    secretMasked: "••••••••",
    source: "Combo list",
    breachId: "br-collection-x",
    firstSeen: ago(40, 0),
    lastSeen: ago(35, 0),
    notes: "Historical; remediated.",
    tags: ["historical"],
    passwordFlags: ["plaintext"],
  },
  {
    id: "dw-044",
    type: "stealer",
    severity: "critical",
    status: "investigating",
    title: "Password manager vault unlock attempt artifacts",
    principal: "jolly.roger@svalbard.ca",
    secretMasked: "vault hint ••••••••",
    source: "Stealer market",
    breachId: "br-telegram-logs",
    firstSeen: ago(1, 15),
    lastSeen: ago(0, 10),
    notes: "Stealer captured 1Password local unlock prompt metadata.",
    tags: ["password-manager"],
    malwareFamily: "Vidar",
    url: "https://my.1password.com",
  },
  {
    id: "dw-045",
    type: "ransomware",
    severity: "high",
    status: "new",
    title: "Proof screenshot shows Acme SharePoint",
    principal: undefined,
    secretMasked: "—",
    source: "Ransomware leak site",
    firstSeen: ago(0, 15),
    lastSeen: ago(0, 4),
    domain: "svalbard.ca",
    notes: "Screenshot watermark shows sharepoint.com/sites/Acme…",
    tags: ["proof", "sharepoint"],
    snippet: "sites/Acme-Legal — document library listing",
  },
  {
    id: "dw-046",
    type: "credential",
    severity: "medium",
    status: "new",
    title: "Engineering principal in paste",
    principal: "crocodile@svalbard.ca",
    secretMasked: "••••••••••••",
    secretRevealable: "BoatengDev!1",
    source: "Paste site",
    breachId: "br-github-gist",
    firstSeen: ago(3, 7),
    lastSeen: ago(3, 7),
    notes: "Appears next to internal tool URLs in gist.",
    tags: ["eng", "gist"],
    passwordFlags: ["plaintext"],
  },
  {
    id: "dw-047",
    type: "mention",
    severity: "medium",
    status: "investigating",
    title: "Dark forum: “Acme Corp initial access”",
    principal: undefined,
    secretMasked: "—",
    source: "Forum dump",
    firstSeen: ago(5, 2),
    lastSeen: ago(2, 9),
    domain: "svalbard.ca",
    notes: "Access broker advertising foothold — correlate with stealer hits.",
    tags: ["initial-access", "broker"],
    snippet: "IA for Acme Corp — RDP + VPN — serious buyers only",
  },
  {
    id: "dw-048",
    type: "credential",
    severity: "high",
    status: "new",
    title: "Privileged identity — reused consumer password",
    principal: "george.darling@svalbard.ca",
    secretMasked: "••••••••",
    secretRevealable: "HartFamily2019",
    source: "Combo list",
    breachId: "br-collection-x",
    firstSeen: ago(2, 20),
    lastSeen: ago(1, 1),
    notes: "Password matches known consumer breach pattern.",
    tags: ["reuse", "privileged"],
    passwordFlags: ["plaintext", "reused"],
  },
  {
    id: "dw-049",
    type: "stealer",
    severity: "medium",
    status: "new",
    title: "Salesforce autofill captured",
    principal: "bill.jukes@svalbard.ca",
    secretMasked: "autofill ••••••••",
    secretRevealable: "AishaSF#22",
    source: "Stealer market",
    breachId: "br-generic-stealer",
    firstSeen: ago(4, 14),
    lastSeen: ago(4, 14),
    notes: "svalbard.my.salesforce.com autofill.",
    tags: ["salesforce"],
    malwareFamily: "Raccoon",
    url: "https://svalbard.my.salesforce.com",
    passwordFlags: ["plaintext"],
  },
  {
    id: "dw-050",
    type: "credential",
    severity: "critical",
    status: "new",
    title: "Fresh combo — multiple privileged hits",
    principal: "john.darling@svalbard.ca",
    secretMasked: "••••••••••••",
    secretRevealable: "BLewis_Adm1n",
    source: "Combo list",
    breachId: "br-collection-x",
    firstSeen: ago(0, 2),
    lastSeen: ago(0, 1),
    notes: "Same dump wave as CISO hit; coordinated reset campaign.",
    tags: ["privileged", "wave"],
    passwordFlags: ["plaintext", "reused"],
  },
  {
    id: "dw-051",
    type: "mention",
    severity: "low",
    status: "new",
    title: "Brand in public threat report footnote",
    principal: undefined,
    secretMasked: "—",
    source: "Paste site",
    firstSeen: ago(7, 0),
    lastSeen: ago(7, 0),
    domain: "svalbard.ca",
    notes: "Third-party report named Acme as example victim — informational.",
    tags: ["report"],
    snippet: "…similar to prior Acme Corp VPN incidents…",
  },
  {
    id: "dw-052",
    type: "ransomware",
    severity: "medium",
    status: "accepted_risk",
    title: "Affiliate blog recycled old claim",
    principal: undefined,
    secretMasked: "—",
    source: "Ransomware leak site",
    firstSeen: ago(16, 0),
    lastSeen: ago(16, 0),
    domain: "svalbard.ca",
    notes: "Repost of June claim without new evidence.",
    tags: ["repost"],
    snippet: "REPOST: Acme Security negotiation",
  },
  {
    id: "dw-053",
    type: "credential",
    severity: "high",
    status: "new",
    title: "Okta phish victim — password only",
    principal: "gentleman.starkey@svalbard.ca",
    secretMasked: "••••••••••••",
    secretRevealable: "SantosOkta!",
    source: "Stealer market",
    breachId: "br-okta-phish-kit",
    firstSeen: ago(6, 8),
    lastSeen: ago(5, 2),
    notes: "Separate from session cookie finding; same campaign.",
    tags: ["phishing"],
    passwordFlags: ["plaintext"],
  },
  {
    id: "dw-054",
    type: "stealer",
    severity: "high",
    status: "new",
    title: "Chrome profile — corp SSO cookies",
    principal: "second.twin@svalbard.ca",
    secretMasked: "multi-cookie ••••••••",
    source: "Telegram channel",
    breachId: "br-telegram-logs",
    firstSeen: ago(0, 17),
    lastSeen: ago(0, 13),
    notes: "Bundle includes google + okta cookies.",
    tags: ["chrome", "sso"],
    malwareFamily: "Vidar",
  },
  {
    id: "dw-055",
    type: "credential",
    severity: "medium",
    status: "investigating",
    title: "Hash-only exposure from VPN dump",
    principal: "tootles@svalbard.ca",
    secretMasked: "hash ••••••••••••••••",
    secretRevealable: "$2y$10$demoOnlyHashValueNotReal000",
    source: "Forum dump",
    breachId: "br-acme-vpn-2024",
    firstSeen: ago(9, 0),
    lastSeen: ago(4, 5),
    notes: "bcrypt hash; cracking likelihood medium.",
    tags: ["hash"],
    passwordFlags: ["hashed"],
  },
  {
    id: "dw-056",
    type: "mention",
    severity: "high",
    status: "new",
    title: "Access broker prices Acme foothold",
    principal: undefined,
    secretMasked: "—",
    source: "Forum dump",
    firstSeen: ago(0, 9),
    lastSeen: ago(0, 9),
    domain: "svalbard.ca",
    notes: "Priced listing — escalate if stealer sessions confirm.",
    tags: ["broker", "priced"],
    snippet: "Acme Corp — domain user + VPN — $3k",
  },
];

export const darkWebExposures: DarkWebExposure[] = (() => {
  const seeds = exposureSeeds.map((seed, index) =>
    normalizeExposure(seed, index),
  );
  const extras: DarkWebExposure[] = [];
  const severityWeights: Array<[ExposureSeverity, number]> = [
    ["low", 20],
    ["medium", 35],
    ["high", 32],
    ["critical", 13],
  ];
  const statusWeights: Array<[ExposureStatus, number]> = [
    ["remediated", 30],
    ["investigating", 22],
    ["new", 20],
    ["false_positive", 16],
    ["accepted_risk", 12],
  ];
  const typeWeights: Array<[ExposureType, number]> = [
    ["credential", 45],
    ["stealer", 25],
    ["mention", 20],
    ["ransomware", 10],
  ];
  const principals = assetIdentities
    .filter((identity) => identity.kind === "user")
    .map((identity) => identity.principal);

  const pick = <T,>(weights: Array<[T, number]>, salt: number): T => {
    const total = weights.reduce((sum, [, w]) => sum + w, 0);
    let cursor = ((salt * 2654435761) >>> 0) % total;
    for (const [value, weight] of weights) {
      if (cursor < weight) return value;
      cursor -= weight;
    }
    return weights[0]![0];
  };

  for (let index = 0; index < 160; index += 1) {
    const template = exposureSeeds[index % exposureSeeds.length]!;
    const principal =
      principals[index % Math.max(principals.length, 1)] ??
      "peter.pan@svalbard.ca";
    extras.push(
      normalizeExposure(
        {
          ...template,
          id: `dw-${String(57 + index).padStart(3, "0")}`,
          type: pick(typeWeights, index + 3),
          severity: pick(severityWeights, index * 2 + 7),
          status: pick(statusWeights, index * 5 + 1),
          title: `${template.title} · hit ${index + 1}`,
          principal: index % 7 === 0 ? template.principal : principal,
          notes: `${template.notes ?? ""} (synthetic exposure ${index + 1}.)`,
          tags: [...(template.tags ?? []), "synthetic"],
          firstSeen: template.firstSeen - index * 3_600_000,
          lastSeen: template.lastSeen - index * 1_800_000,
        },
        seeds.length + index,
      ),
    );
  }

  return [...seeds, ...extras];
})();

export const EXPOSURE_CATALOG_SIZE = darkWebExposures.length;

export function exposureSearchIndex(exposure: DarkWebExposure) {
  return [
    exposure.id,
    exposure.title,
    exposure.principal,
    exposure.domain,
    exposure.source,
    exposure.type,
    exposure.status,
    exposure.notes,
    exposure.snippet,
    exposure.malwareFamily,
    exposure.url,
    exposure.tags.join(" "),
    exposure.breachId,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function getBreachById(id: string | undefined) {
  if (!id) return null;
  return darkWebBreaches.find((breach) => breach.id === id) ?? null;
}

export function getLinkedIdentity(identityId: string | null | undefined) {
  if (!identityId) return null;
  return assetIdentities.find((identity) => identity.id === identityId) ?? null;
}

export function getExposuresForBreach(
  exposures: Iterable<DarkWebExposure>,
  breachId: string,
) {
  return Array.from(exposures).filter((item) => item.breachId === breachId);
}

export function getBreachExposureCount(
  exposures: Iterable<DarkWebExposure>,
  breachId: string,
) {
  let count = 0;
  for (const item of exposures) {
    if (item.breachId === breachId) count += 1;
  }
  return count;
}

export function getDarkWebStats(
  exposures: Iterable<DarkWebExposure>,
  watchlist: Iterable<WatchlistEntry>,
): DarkWebStat[] {
  const list = Array.from(exposures);
  const watch = Array.from(watchlist);
  const weekAgo = NOW - 7 * DAY_MS;

  let new7d = 0;
  let criticalCreds = 0;
  let stealer = 0;
  let openQueue = 0;

  for (const item of list) {
    if (item.firstSeen >= weekAgo) new7d += 1;
    if (
      item.type === "credential" &&
      (item.severity === "critical" || item.privileged) &&
      openExposureStatuses.includes(item.status)
    ) {
      criticalCreds += 1;
    }
    if (item.type === "stealer" && openExposureStatuses.includes(item.status)) {
      stealer += 1;
    }
    if (openExposureStatuses.includes(item.status)) openQueue += 1;
  }

  const activeWatch = watch.filter((item) => item.status === "active").length;

  return [
    {
      key: "new-7d",
      title: "New (7d)",
      value: String(new7d),
      context: "fresh exposures",
      delta: 12.4,
      preferLower: true,
    },
    {
      key: "critical-creds",
      title: "Critical credentials",
      value: String(criticalCreds),
      context: "privileged / critical open",
      delta: 8.1,
      preferLower: true,
    },
    {
      key: "stealer",
      title: "Stealer hits",
      value: String(stealer),
      context: "open cookie/session class",
      delta: 15.2,
      preferLower: true,
    },
    {
      key: "open-queue",
      title: "Open queue",
      value: String(openQueue),
      context: "new + investigating",
      delta: 4.6,
      preferLower: true,
    },
    {
      key: "watchlist",
      title: "Watchlist coverage",
      value: String(activeWatch),
      context: "active monitors",
      delta: 0,
    },
  ];
}

export type DarkWebOverviewRange = "7d" | "14d" | "30d";

export const darkWebOverviewRanges = ["7d", "14d", "30d"] as const;

export const darkWebOverviewRangeLabels: Record<DarkWebOverviewRange, string> =
  {
    "7d": "7d",
    "14d": "14d",
    "30d": "30d",
  };

function rangeDays(range: DarkWebOverviewRange) {
  return range === "7d" ? 7 : range === "14d" ? 14 : 30;
}

export function filterExposuresByOverviewRange(
  exposures: Iterable<DarkWebExposure>,
  range: DarkWebOverviewRange,
) {
  const cutoff = NOW - rangeDays(range) * DAY_MS;
  return Array.from(exposures).filter((item) => item.firstSeen >= cutoff);
}

export function getExposuresOverTime(range: DarkWebOverviewRange) {
  const days = rangeDays(range);
  const buckets: {
    day: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const start = NOW - (i + 1) * DAY_MS;
    const end = NOW - i * DAY_MS;
    const labelDate = new Date(end);
    const day = `${labelDate.getUTCMonth() + 1}/${labelDate.getUTCDate()}`;
    const bucket = { day, critical: 0, high: 0, medium: 0, low: 0 };
    for (const item of darkWebExposures) {
      if (item.firstSeen >= start && item.firstSeen < end) {
        bucket[item.severity] += 1;
      }
    }
    buckets.push(bucket);
  }
  return buckets;
}

export function getTypeBreakdown(exposures: Iterable<DarkWebExposure>) {
  const counts: Record<ExposureType, number> = {
    credential: 0,
    stealer: 0,
    mention: 0,
    ransomware: 0,
  };
  for (const item of exposures) counts[item.type] += 1;
  return exposureTypes.map((type) => ({
    type,
    label: exposureTypeLabels[type],
    count: counts[type],
  }));
}

export function getSeverityBreakdown(exposures: Iterable<DarkWebExposure>) {
  const counts: Record<ExposureSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const item of exposures) counts[item.severity] += 1;
  return exposureSeverities.map((severity) => ({
    severity,
    label: exposureSeverityLabels[severity],
    count: counts[severity],
  }));
}

export function getTopAffectedDomains(exposures: Iterable<DarkWebExposure>) {
  const map = new Map<string, number>();
  for (const item of exposures) {
    const domain = item.domain ?? "unknown";
    map.set(domain, (map.get(domain) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function getRecentCritical(exposures: Iterable<DarkWebExposure>) {
  return Array.from(exposures)
    .filter(
      (item) =>
        item.severity === "critical" &&
        openExposureStatuses.includes(item.status),
    )
    .sort((a, b) => b.firstSeen - a.firstSeen)
    .slice(0, 6);
}

export { NOW as DARK_WEB_NOW };
