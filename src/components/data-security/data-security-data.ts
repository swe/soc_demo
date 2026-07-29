/**
 * Data Security seed catalog — consolidator lane.
 * Heimdall ingests DLP/CASB findings from upstream sensors; it is not a Purview clone.
 */

export type DataSecurityFindingKind = "dlp" | "casb";

export type DataSecuritySeverity = "critical" | "high" | "medium" | "low";

export type DataSecurityFindingStatus =
  | "open"
  | "investigating"
  | "contained"
  | "closed";

export type DataSecurityFinding = {
  id: string;
  kind: DataSecurityFindingKind;
  title: string;
  summary: string;
  severity: DataSecuritySeverity;
  identityId: string;
  identityLabel: string;
  channel: string;
  dataClass: string;
  /** Upstream sensor / connector id (DLP or CASB). */
  sourceId: string;
  sourceName: string;
  detectedAt: string;
  detectedLabel: string;
  openIncidentId: string | null;
  status: DataSecurityFindingStatus;
  policyId?: string;
  saasAppId?: string;
};

export type DataSecurityPolicyStatus =
  | "enforced"
  | "monitor"
  | "draft"
  | "disabled";

export type DataSecurityPolicy = {
  id: string;
  name: string;
  kind: DataSecurityFindingKind;
  /** Upstream policy id from the DLP/CASB product. */
  upstreamRef: string;
  sourceName: string;
  dataClasses: string[];
  status: DataSecurityPolicyStatus;
  severityFloor: DataSecuritySeverity;
  findingCount: number;
  lastHitLabel: string;
  summary: string;
};

export type SaaSAppSanction = "sanctioned" | "shadow" | "tolerated";

export type SaaSAppRisk = "critical" | "high" | "medium" | "low";

export type SaaSAppInventoryItem = {
  id: string;
  name: string;
  category: string;
  sanction: SaaSAppSanction;
  risk: SaaSAppRisk;
  users: number;
  oauthScopes: string[];
  dataClassesSeen: string[];
  lastSeenLabel: string;
  findingIds: string[];
  owner?: string;
  sourceName: string;
};

export type ExfilTimelineEventKind =
  | "upload"
  | "download"
  | "share"
  | "email"
  | "oauth"
  | "sync"
  | "print";

export type ExfilTimelineEvent = {
  id: string;
  at: string;
  atLabel: string;
  kind: ExfilTimelineEventKind;
  summary: string;
  findingId: string;
  identityId: string;
  identityLabel: string;
  channel: string;
  bytesLabel?: string;
  destination?: string;
};

export const dataSecuritySeverities: DataSecuritySeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];

export const dataSecurityFindingStatuses: DataSecurityFindingStatus[] = [
  "open",
  "investigating",
  "contained",
  "closed",
];

const dataSecurityFindingsSeed: DataSecurityFinding[] = [
  {
    id: "ds-dlp-01",
    kind: "dlp",
    title: "PII spreadsheet uploaded to personal OneDrive",
    summary:
      "HR payroll CSV with SIN / SSN fields synced to a personal Microsoft account.",
    severity: "critical",
    identityId: "id-user-04",
    identityLabel: "maya.rao@svalbard.ca",
    channel: "OneDrive · personal",
    dataClass: "PII / payroll",
    sourceId: "int-m365-dlp",
    sourceName: "Microsoft Purview DLP",
    detectedAt: "2026-07-28T16:12:00.000Z",
    detectedLabel: "2h ago",
    openIncidentId: "INC-2400",
    status: "investigating",
    policyId: "pol-dlp-pii-egress",
    saasAppId: "saas-onedrive",
  },
  {
    id: "ds-casb-01",
    kind: "casb",
    title: "Unauthorized SaaS OAuth grant (Box)",
    summary:
      "Finance analyst granted Box full-drive scope from an unmanaged device.",
    severity: "high",
    identityId: "id-user-08",
    identityLabel: "gareth.doyle@svalbard.ca",
    channel: "Box OAuth",
    dataClass: "Financial docs",
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
    detectedAt: "2026-07-28T14:40:00.000Z",
    detectedLabel: "4h ago",
    openIncidentId: "INC-2401",
    status: "open",
    policyId: "pol-casb-oauth-scope",
    saasAppId: "saas-box",
  },
  {
    id: "ds-dlp-02",
    kind: "dlp",
    title: "Source code zip to external email",
    summary:
      "Outbound message to gmail.com with monorepo archive matching source DLP policy.",
    severity: "high",
    identityId: "id-user-17",
    identityLabel: "ethan.cole@svalbard.ca",
    channel: "Exchange Online",
    dataClass: "Source code",
    sourceId: "int-m365-dlp",
    sourceName: "Microsoft Purview DLP",
    detectedAt: "2026-07-27T21:05:00.000Z",
    detectedLabel: "1d ago",
    openIncidentId: null,
    status: "open",
    policyId: "pol-dlp-source-egress",
  },
  {
    id: "ds-casb-02",
    kind: "casb",
    title: "Shadow IT: Notion workspace share",
    summary:
      "Public Notion page containing customer runbooks discovered via CASB crawl.",
    severity: "medium",
    identityId: "id-user-18",
    identityLabel: "nina.brooks@svalbard.ca",
    channel: "Notion",
    dataClass: "Customer runbooks",
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
    detectedAt: "2026-07-27T11:20:00.000Z",
    detectedLabel: "1d ago",
    openIncidentId: "INC-2403",
    status: "contained",
    policyId: "pol-casb-shadow-it",
    saasAppId: "saas-notion",
  },
  {
    id: "ds-dlp-03",
    kind: "dlp",
    title: "Credit card PAN in Slack export",
    summary:
      "Channel export matched PCI regex; message author in #payments-ops.",
    severity: "critical",
    identityId: "id-user-15",
    identityLabel: "sofia.ahmed@svalbard.ca",
    channel: "Slack",
    dataClass: "PCI",
    sourceId: "int-m365-dlp",
    sourceName: "Microsoft Purview DLP",
    detectedAt: "2026-07-26T18:44:00.000Z",
    detectedLabel: "2d ago",
    openIncidentId: "INC-2404",
    status: "investigating",
    policyId: "pol-dlp-pci",
    saasAppId: "saas-slack",
  },
  {
    id: "ds-casb-03",
    kind: "casb",
    title: "Google Drive external domain share spike",
    summary:
      "CASB saw 40+ external shares to partner domain outside approved list.",
    severity: "medium",
    identityId: "id-user-03",
    identityLabel: "ava.reed@svalbard.ca",
    channel: "Google Drive",
    dataClass: "Contracts",
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
    detectedAt: "2026-07-25T09:10:00.000Z",
    detectedLabel: "3d ago",
    openIncidentId: null,
    status: "open",
    policyId: "pol-casb-ext-share",
    saasAppId: "saas-gdrive",
  },
  {
    id: "ds-dlp-04",
    kind: "dlp",
    title: "PHI PDF printed to USB-attached printer",
    summary:
      "Endpoint DLP blocked print job of patient discharge summaries to unmanaged USB printer.",
    severity: "high",
    identityId: "id-user-06",
    identityLabel: "chloe.park@svalbard.ca",
    channel: "Endpoint print",
    dataClass: "PHI / health",
    sourceId: "int-defender-dlp",
    sourceName: "Defender Endpoint DLP",
    detectedAt: "2026-07-28T12:05:00.000Z",
    detectedLabel: "6h ago",
    openIncidentId: null,
    status: "open",
    policyId: "pol-dlp-phi",
  },
  {
    id: "ds-casb-04",
    kind: "casb",
    title: "Dropbox personal account sync",
    summary:
      "Marketing contractor connected personal Dropbox and synced branded asset folder.",
    severity: "high",
    identityId: "id-user-21",
    identityLabel: "dina.moss@partners.svalbard.ca",
    channel: "Dropbox",
    dataClass: "Brand assets",
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
    detectedAt: "2026-07-28T10:22:00.000Z",
    detectedLabel: "8h ago",
    openIncidentId: "INC-2406",
    status: "investigating",
    policyId: "pol-casb-shadow-it",
    saasAppId: "saas-dropbox",
  },
  {
    id: "ds-dlp-05",
    kind: "dlp",
    title: "API keys in paste to Pastebin",
    summary:
      "Browser DLP matched AWS access key pattern posted to pastebin.com.",
    severity: "critical",
    identityId: "id-user-02",
    identityLabel: "ben.lewis@svalbard.ca",
    channel: "Web · Pastebin",
    dataClass: "Secrets / keys",
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
    detectedAt: "2026-07-28T09:48:00.000Z",
    detectedLabel: "9h ago",
    openIncidentId: "INC-2407",
    status: "investigating",
    policyId: "pol-dlp-secrets",
  },
  {
    id: "ds-casb-05",
    kind: "casb",
    title: "ChatGPT Enterprise file upload",
    summary:
      "CASB flagged upload of internal architecture PDF to ChatGPT with DLP tag Source-Restricted.",
    severity: "medium",
    identityId: "id-user-05",
    identityLabel: "owen.lee@svalbard.ca",
    channel: "ChatGPT",
    dataClass: "Source / design",
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
    detectedAt: "2026-07-27T16:30:00.000Z",
    detectedLabel: "1d ago",
    openIncidentId: null,
    status: "open",
    policyId: "pol-casb-genai",
    saasAppId: "saas-chatgpt",
  },
  {
    id: "ds-dlp-06",
    kind: "dlp",
    title: "Customer CSV to WeTransfer",
    summary:
      "Sales ops uploaded 12k-row CRM export to WeTransfer free tier.",
    severity: "high",
    identityId: "id-user-19",
    identityLabel: "jules.hart@svalbard.ca",
    channel: "WeTransfer",
    dataClass: "Customer PII",
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
    detectedAt: "2026-07-27T14:12:00.000Z",
    detectedLabel: "1d ago",
    openIncidentId: null,
    status: "open",
    policyId: "pol-dlp-pii-egress",
    saasAppId: "saas-wetransfer",
  },
  {
    id: "ds-casb-06",
    kind: "casb",
    title: "Unauthorized Trello board with card secrets",
    summary:
      "Shadow Trello board exposed API tokens in card descriptions; discovered via CASB crawl.",
    severity: "high",
    identityId: "id-user-11",
    identityLabel: "brendan.murphy@svalbard.ca",
    channel: "Trello",
    dataClass: "Secrets / keys",
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
    detectedAt: "2026-07-26T22:15:00.000Z",
    detectedLabel: "2d ago",
    openIncidentId: "INC-2409",
    status: "open",
    policyId: "pol-casb-shadow-it",
    saasAppId: "saas-trello",
  },
  {
    id: "ds-dlp-07",
    kind: "dlp",
    title: "Legal hold mailbox forward to personal Gmail",
    summary:
      "Auto-forward rule created on litigation-hold mailbox to external Gmail.",
    severity: "critical",
    identityId: "id-user-12",
    identityLabel: "robyn.carr@svalbard.ca",
    channel: "Exchange Online",
    dataClass: "Legal / eDiscovery",
    sourceId: "int-m365-dlp",
    sourceName: "Microsoft Purview DLP",
    detectedAt: "2026-07-26T15:40:00.000Z",
    detectedLabel: "2d ago",
    openIncidentId: "INC-2410",
    status: "investigating",
    policyId: "pol-dlp-mailbox-forward",
  },
  {
    id: "ds-casb-07",
    kind: "casb",
    title: "GitHub gist with internal config",
    summary:
      "Public gist matched internal hostname and connection-string patterns.",
    severity: "high",
    identityId: "id-user-14",
    identityLabel: "leo.park@svalbard.ca",
    channel: "GitHub Gist",
    dataClass: "Config / secrets",
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
    detectedAt: "2026-07-25T19:55:00.000Z",
    detectedLabel: "3d ago",
    openIncidentId: null,
    status: "open",
    policyId: "pol-dlp-secrets",
    saasAppId: "saas-github",
  },
  {
    id: "ds-dlp-08",
    kind: "dlp",
    title: "USB mass-storage copy of finance workbook",
    summary:
      "Endpoint DLP blocked copy of Q2 forecast.xlsx to removable media.",
    severity: "medium",
    identityId: "id-user-09",
    identityLabel: "farid.tamin@svalbard.ca",
    channel: "USB / removable",
    dataClass: "Financial docs",
    sourceId: "int-defender-dlp",
    sourceName: "Defender Endpoint DLP",
    detectedAt: "2026-07-25T13:20:00.000Z",
    detectedLabel: "3d ago",
    openIncidentId: null,
    status: "contained",
    policyId: "pol-dlp-removable",
  },
  {
    id: "ds-casb-08",
    kind: "casb",
    title: "Canva Team public brand kit",
    summary:
      "Brand kit marked public; logo + unreleased campaign assets discoverable without login.",
    severity: "low",
    identityId: "id-user-20",
    identityLabel: "harper.singh@svalbard.ca",
    channel: "Canva",
    dataClass: "Brand assets",
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
    detectedAt: "2026-07-24T11:05:00.000Z",
    detectedLabel: "4d ago",
    openIncidentId: null,
    status: "open",
    policyId: "pol-casb-shadow-it",
    saasAppId: "saas-canva",
  },
  {
    id: "ds-dlp-09",
    kind: "dlp",
    title: "Teams file share to guest tenant",
    summary:
      "Sensitive engineering wiki page shared with guest from unapproved Entra tenant.",
    severity: "medium",
    identityId: "id-user-07",
    identityLabel: "victor.hale@svalbard.ca",
    channel: "Microsoft Teams",
    dataClass: "Internal wiki",
    sourceId: "int-m365-dlp",
    sourceName: "Microsoft Purview DLP",
    detectedAt: "2026-07-24T08:40:00.000Z",
    detectedLabel: "4d ago",
    openIncidentId: null,
    status: "open",
    policyId: "pol-casb-ext-share",
    saasAppId: "saas-teams",
  },
  {
    id: "ds-casb-09",
    kind: "casb",
    title: "Airtable base with employee SSNs",
    summary:
      "Shadow Airtable base ingested HR onboarding form responses including SSN fields.",
    severity: "critical",
    identityId: "id-user-25",
    identityLabel: "nia.berger@svalbard.ca",
    channel: "Airtable",
    dataClass: "PII / payroll",
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
    detectedAt: "2026-07-23T17:30:00.000Z",
    detectedLabel: "5d ago",
    openIncidentId: "INC-2414",
    status: "investigating",
    policyId: "pol-casb-shadow-it",
    saasAppId: "saas-airtable",
  },
  {
    id: "ds-dlp-10",
    kind: "dlp",
    title: "Large SharePoint download anomaly",
    summary:
      "User downloaded 8.4 GB from Contracts library outside business hours.",
    severity: "high",
    identityId: "id-user-10",
    identityLabel: "samir.tamin@svalbard.ca",
    channel: "SharePoint Online",
    dataClass: "Contracts",
    sourceId: "int-m365-dlp",
    sourceName: "Microsoft Purview DLP",
    detectedAt: "2026-07-23T03:15:00.000Z",
    detectedLabel: "5d ago",
    openIncidentId: null,
    status: "open",
    policyId: "pol-dlp-bulk-download",
    saasAppId: "saas-sharepoint",
  },
  {
    id: "ds-casb-10",
    kind: "casb",
    title: "Zoom cloud recording shared externally",
    summary:
      "Board briefing recording shared via public Zoom link; CASB matched Sensitive label.",
    severity: "medium",
    identityId: "id-user-01",
    identityLabel: "riya.sharma@svalbard.ca",
    channel: "Zoom",
    dataClass: "Executive / board",
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
    detectedAt: "2026-07-22T20:10:00.000Z",
    detectedLabel: "6d ago",
    openIncidentId: null,
    status: "closed",
    policyId: "pol-casb-ext-share",
    saasAppId: "saas-zoom",
  },
  {
    id: "ds-dlp-11",
    kind: "dlp",
    title: "WhatsApp Web paste of customer list",
    summary:
      "Browser DLP blocked paste of phone-number column into WhatsApp Web chat.",
    severity: "medium",
    identityId: "id-user-22",
    identityLabel: "liza.harlan@svalbard.ca",
    channel: "WhatsApp Web",
    dataClass: "Customer PII",
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
    detectedAt: "2026-07-22T14:45:00.000Z",
    detectedLabel: "6d ago",
    openIncidentId: null,
    status: "open",
    policyId: "pol-dlp-pii-egress",
    saasAppId: "saas-whatsapp",
  },
  {
    id: "ds-casb-11",
    kind: "casb",
    title: "Miro board with architecture export",
    summary:
      "Public Miro board contained exported network diagram labeled Confidential.",
    severity: "low",
    identityId: "id-user-13",
    identityLabel: "kabir.sethi@svalbard.ca",
    channel: "Miro",
    dataClass: "Source / design",
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
    detectedAt: "2026-07-21T10:00:00.000Z",
    detectedLabel: "7d ago",
    openIncidentId: null,
    status: "contained",
    policyId: "pol-casb-shadow-it",
    saasAppId: "saas-miro",
  },
];

const FINDINGS_CATALOG_SIZE = 52;
const POLICIES_CATALOG_SIZE = 32;
const SAAS_CATALOG_SIZE = 32;
const EXFIL_CATALOG_SIZE = 42;

const findingTitleExtras = [
  "Labeled finance workbook emailed externally",
  "Customer contract PDF to personal Dropbox",
  "HR roster CSV pasted into Discord",
  "API token in public Confluence page",
  "Board deck shared to unapproved guest",
  "PCI PAN in ServiceNow ticket attachment",
  "Source repo mirror pushed to personal GitLab",
  "PHI screenshot uploaded to personal iCloud",
  "Secrets in CI artifact to public S3",
  "Legal hold mailbox export to USB",
  "Salesforce report export to personal Gmail",
  "Engineering wiki page set world-readable",
  "OAuth grant · full mail scope from BYOD",
  "Shadow IT · Coda workspace with PII",
  "GenAI upload · Claude architecture brief",
  "Large OneDrive sync outside business hours",
  "Teams recording shared via anonymous link",
  "Printer spool of compensation letters",
  "WhatsApp Desktop paste of customer phones",
  "GitHub Actions secret scanned in log",
  "Box folder invite to personal consumer account",
  "Notion AI export of incident runbook",
  "Google Drive link to competitor domain",
  "Slack canvas with AWS keys",
  "Zoom chat file transfer of contracts",
  "Airtable form capturing SIN fields",
  "Canva brand kit made public again",
  "Miro board export to anonymous viewer",
  "WeTransfer of CRM segment list",
  "Trello card with production passwords",
] as const;

const identityPool = [
  "maya.rao@svalbard.ca",
  "gareth.doyle@svalbard.ca",
  "ethan.cole@svalbard.ca",
  "nina.brooks@svalbard.ca",
  "sofia.ahmed@svalbard.ca",
  "ava.reed@svalbard.ca",
  "chloe.park@svalbard.ca",
  "owen.lee@svalbard.ca",
  "jules.hart@svalbard.ca",
  "brendan.murphy@svalbard.ca",
  "robyn.carr@svalbard.ca",
  "leo.park@svalbard.ca",
  "farid.tamin@svalbard.ca",
  "samir.tamin@svalbard.ca",
  "nia.berger@svalbard.ca",
  "riya.sharma@svalbard.ca",
  "liza.harlan@svalbard.ca",
  "kabir.sethi@svalbard.ca",
  "ben.lewis@svalbard.ca",
  "harper.singh@svalbard.ca",
] as const;

const dataClassPool = [
  "PII / payroll",
  "Financial docs",
  "Source code",
  "Customer runbooks",
  "PCI",
  "Contracts",
  "PHI / health",
  "Brand assets",
  "Secrets / keys",
  "Source / design",
  "Customer PII",
  "Legal / eDiscovery",
  "Config / secrets",
  "Internal wiki",
  "Executive / board",
] as const;

const channelPool = [
  "OneDrive · personal",
  "Box OAuth",
  "Exchange Online",
  "Notion",
  "Slack",
  "Google Drive",
  "Endpoint print",
  "Dropbox",
  "Web · Pastebin",
  "ChatGPT",
  "WeTransfer",
  "Trello",
  "GitHub Gist",
  "USB / removable",
  "Canva",
  "Microsoft Teams",
  "Airtable",
  "SharePoint Online",
  "Zoom",
  "WhatsApp Web",
  "Miro",
] as const;

const sourcePool = [
  {
    sourceId: "int-m365-dlp",
    sourceName: "Microsoft Purview DLP",
  },
  {
    sourceId: "int-netskope-casb",
    sourceName: "Netskope CASB",
  },
  {
    sourceId: "int-defender-dlp",
    sourceName: "Defender Endpoint DLP",
  },
] as const;

const severityCycle: DataSecuritySeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "high",
  "medium",
];

const statusCycle: DataSecurityFindingStatus[] = [
  "open",
  "investigating",
  "open",
  "contained",
  "closed",
  "investigating",
];

const detectedLabelCycle = [
  "1h ago",
  "3h ago",
  "5h ago",
  "8h ago",
  "12h ago",
  "1d ago",
  "2d ago",
  "3d ago",
  "4d ago",
  "5d ago",
  "6d ago",
  "7d ago",
] as const;

function expandFindings(
  seeds: DataSecurityFinding[],
  size = FINDINGS_CATALOG_SIZE,
): DataSecurityFinding[] {
  if (seeds.length >= size) return seeds.slice(0, size);
  const generated: DataSecurityFinding[] = [];
  for (let index = 0; index < size - seeds.length; index += 1) {
    const template = seeds[index % seeds.length]!;
    const n = seeds.length + index + 1;
    const kind: DataSecurityFindingKind = index % 2 === 0 ? "dlp" : "casb";
    const source = sourcePool[index % sourcePool.length]!;
    const identityLabel = identityPool[index % identityPool.length]!;
    const detectedAt = new Date(
      Date.UTC(2026, 6, 28, 18, 0, 0) - index * 3_600_000 * 3,
    ).toISOString();
    generated.push({
      ...template,
      id: `ds-${kind}-${String(n).padStart(2, "0")}`,
      kind,
      title: findingTitleExtras[index % findingTitleExtras.length]!,
      summary: `${findingTitleExtras[index % findingTitleExtras.length]} — synthetic consolidator finding ${n}.`,
      severity: severityCycle[index % severityCycle.length]!,
      identityId: `id-user-${String((index % 25) + 1).padStart(2, "0")}`,
      identityLabel,
      channel: channelPool[index % channelPool.length]!,
      dataClass: dataClassPool[index % dataClassPool.length]!,
      sourceId: source.sourceId,
      sourceName: source.sourceName,
      detectedAt,
      detectedLabel: detectedLabelCycle[index % detectedLabelCycle.length]!,
      openIncidentId: index % 5 === 0 ? `INC-${2400 + (index % 20)}` : null,
      status: statusCycle[index % statusCycle.length]!,
      policyId: template.policyId,
      saasAppId: index % 3 === 0 ? template.saasAppId : undefined,
    });
  }
  return [...seeds, ...generated];
}

export const dataSecurityFindings: DataSecurityFinding[] = expandFindings(
  dataSecurityFindingsSeed,
);

const dataSecurityPoliciesSeed: DataSecurityPolicy[] = [
  {
    id: "pol-dlp-pii-egress",
    name: "Block PII egress to personal cloud",
    kind: "dlp",
    upstreamRef: "purview-dlp-pii-01",
    sourceName: "Microsoft Purview DLP",
    dataClasses: ["PII / payroll", "Customer PII"],
    status: "enforced",
    severityFloor: "high",
    findingCount: 3,
    lastHitLabel: "2h ago",
    summary:
      "Ingested from Purview — blocks SIN/SSN/email+phone bundles leaving corp tenants.",
  },
  {
    id: "pol-dlp-source-egress",
    name: "Source code outbound mail",
    kind: "dlp",
    upstreamRef: "purview-dlp-src-02",
    sourceName: "Microsoft Purview DLP",
    dataClasses: ["Source code"],
    status: "enforced",
    severityFloor: "high",
    findingCount: 1,
    lastHitLabel: "1d ago",
    summary: "Matches zip/tar of monorepo patterns on Exchange Online.",
  },
  {
    id: "pol-dlp-pci",
    name: "PCI in collaboration tools",
    kind: "dlp",
    upstreamRef: "purview-dlp-pci-03",
    sourceName: "Microsoft Purview DLP",
    dataClasses: ["PCI"],
    status: "enforced",
    severityFloor: "critical",
    findingCount: 1,
    lastHitLabel: "2d ago",
    summary: "PAN/CVV regex across Slack, Teams, and email exports.",
  },
  {
    id: "pol-dlp-phi",
    name: "PHI print & removable media",
    kind: "dlp",
    upstreamRef: "mde-dlp-phi-04",
    sourceName: "Defender Endpoint DLP",
    dataClasses: ["PHI / health"],
    status: "enforced",
    severityFloor: "high",
    findingCount: 1,
    lastHitLabel: "6h ago",
    summary: "Endpoint sensor policy for health records leaving managed devices.",
  },
  {
    id: "pol-dlp-secrets",
    name: "Secrets & API keys",
    kind: "dlp",
    upstreamRef: "nsk-dlp-sec-05",
    sourceName: "Netskope CASB",
    dataClasses: ["Secrets / keys", "Config / secrets"],
    status: "enforced",
    severityFloor: "critical",
    findingCount: 2,
    lastHitLabel: "9h ago",
    summary: "Cloud + web DLP for AWS/Azure/GitHub token patterns.",
  },
  {
    id: "pol-dlp-mailbox-forward",
    name: "Mailbox auto-forward to external",
    kind: "dlp",
    upstreamRef: "purview-dlp-fwd-06",
    sourceName: "Microsoft Purview DLP",
    dataClasses: ["Legal / eDiscovery"],
    status: "enforced",
    severityFloor: "critical",
    findingCount: 1,
    lastHitLabel: "2d ago",
    summary: "Detects new external forward rules on protected mailboxes.",
  },
  {
    id: "pol-dlp-removable",
    name: "Finance files to removable media",
    kind: "dlp",
    upstreamRef: "mde-dlp-usb-07",
    sourceName: "Defender Endpoint DLP",
    dataClasses: ["Financial docs"],
    status: "monitor",
    severityFloor: "medium",
    findingCount: 1,
    lastHitLabel: "3d ago",
    summary: "Monitor-mode USB copy of labeled finance workbooks.",
  },
  {
    id: "pol-dlp-bulk-download",
    name: "Bulk library download anomaly",
    kind: "dlp",
    upstreamRef: "purview-dlp-bulk-08",
    sourceName: "Microsoft Purview DLP",
    dataClasses: ["Contracts"],
    status: "monitor",
    severityFloor: "high",
    findingCount: 1,
    lastHitLabel: "5d ago",
    summary: "Unusual volume downloads from SharePoint sensitive libraries.",
  },
  {
    id: "pol-casb-oauth-scope",
    name: "Risky OAuth scopes on unmanaged devices",
    kind: "casb",
    upstreamRef: "nsk-casb-oauth-01",
    sourceName: "Netskope CASB",
    dataClasses: ["Financial docs"],
    status: "enforced",
    severityFloor: "high",
    findingCount: 1,
    lastHitLabel: "4h ago",
    summary: "Flags full-drive / mail.readwrite grants from non-compliant devices.",
  },
  {
    id: "pol-casb-shadow-it",
    name: "Shadow IT discovery & share exposure",
    kind: "casb",
    upstreamRef: "nsk-casb-shadow-02",
    sourceName: "Netskope CASB",
    dataClasses: ["Customer runbooks", "Brand assets", "PII / payroll"],
    status: "enforced",
    severityFloor: "medium",
    findingCount: 6,
    lastHitLabel: "1d ago",
    summary: "Crawl + OAuth inventory for unsanctioned SaaS with public shares.",
  },
  {
    id: "pol-casb-ext-share",
    name: "External domain share allow-list",
    kind: "casb",
    upstreamRef: "nsk-casb-ext-03",
    sourceName: "Netskope CASB",
    dataClasses: ["Contracts", "Internal wiki", "Executive / board"],
    status: "enforced",
    severityFloor: "medium",
    findingCount: 3,
    lastHitLabel: "3d ago",
    summary: "Spikes of shares outside approved partner domains.",
  },
  {
    id: "pol-casb-genai",
    name: "GenAI file upload control",
    kind: "casb",
    upstreamRef: "nsk-casb-genai-04",
    sourceName: "Netskope CASB",
    dataClasses: ["Source / design"],
    status: "monitor",
    severityFloor: "medium",
    findingCount: 1,
    lastHitLabel: "1d ago",
    summary: "Monitor uploads of labeled docs to ChatGPT / Claude / Gemini.",
  },
];

const policyNameExtras = [
  "Block payroll CSV to consumer cloud",
  "Monitor PCI in chat exports",
  "Enforce source zip outbound mail",
  "PHI removable media block",
  "Secrets paste to paste sites",
  "Mailbox forward to personal domains",
  "Bulk SharePoint download anomaly",
  "Risky OAuth from unmanaged endpoints",
  "Shadow wiki public share crawl",
  "External partner share allow-list",
  "GenAI labeled file upload gate",
  "USB finance workbook monitor",
  "Teams guest tenant share control",
  "GitHub gist secrets pattern",
  "Dropbox personal sync detect",
  "WeTransfer customer list block",
  "Slack export DLP enforcement",
  "Box full-drive scope on BYOD",
  "Airtable HR field ingest alert",
  "Zoom recording public link policy",
] as const;

const policyStatusCycle: DataSecurityPolicyStatus[] = [
  "enforced",
  "enforced",
  "monitor",
  "draft",
  "enforced",
  "disabled",
];

function expandPolicies(
  seeds: DataSecurityPolicy[],
  size = POLICIES_CATALOG_SIZE,
): DataSecurityPolicy[] {
  if (seeds.length >= size) return seeds.slice(0, size);
  const generated: DataSecurityPolicy[] = [];
  for (let index = 0; index < size - seeds.length; index += 1) {
    const template = seeds[index % seeds.length]!;
    const n = seeds.length + index + 1;
    const kind: DataSecurityFindingKind = index % 2 === 0 ? "dlp" : "casb";
    const source =
      kind === "dlp"
        ? index % 3 === 0
          ? "Defender Endpoint DLP"
          : "Microsoft Purview DLP"
        : "Netskope CASB";
    generated.push({
      ...template,
      id: `pol-${kind}-x${String(n).padStart(2, "0")}`,
      name: policyNameExtras[index % policyNameExtras.length]!,
      kind,
      upstreamRef: `${kind === "dlp" ? "purview" : "nsk"}-${kind}-x${String(n).padStart(2, "0")}`,
      sourceName: source,
      dataClasses: [dataClassPool[index % dataClassPool.length]!],
      status: policyStatusCycle[index % policyStatusCycle.length]!,
      severityFloor: severityCycle[index % severityCycle.length]!,
      findingCount: 1 + (index % 8),
      lastHitLabel: detectedLabelCycle[index % detectedLabelCycle.length]!,
      summary: `${policyNameExtras[index % policyNameExtras.length]} — synthetic upstream policy ${n}.`,
    });
  }
  return [...seeds, ...generated];
}

export const dataSecurityPolicies: DataSecurityPolicy[] = expandPolicies(
  dataSecurityPoliciesSeed,
);

const saasAppInventorySeed: SaaSAppInventoryItem[] = [
  {
    id: "saas-onedrive",
    name: "OneDrive (personal)",
    category: "File sync",
    sanction: "shadow",
    risk: "critical",
    users: 14,
    oauthScopes: ["Files.ReadWrite.All"],
    dataClassesSeen: ["PII / payroll"],
    lastSeenLabel: "2h ago",
    findingIds: ["ds-dlp-01"],
    sourceName: "Netskope CASB",
  },
  {
    id: "saas-box",
    name: "Box",
    category: "File sync",
    sanction: "tolerated",
    risk: "high",
    users: 38,
    oauthScopes: ["root_readwrite"],
    dataClassesSeen: ["Financial docs"],
    lastSeenLabel: "4h ago",
    findingIds: ["ds-casb-01"],
    owner: "Finance IT",
    sourceName: "Netskope CASB",
  },
  {
    id: "saas-notion",
    name: "Notion",
    category: "Docs / wiki",
    sanction: "shadow",
    risk: "medium",
    users: 62,
    oauthScopes: ["read_content", "update_content"],
    dataClassesSeen: ["Customer runbooks"],
    lastSeenLabel: "1d ago",
    findingIds: ["ds-casb-02"],
    sourceName: "Netskope CASB",
  },
  {
    id: "saas-slack",
    name: "Slack",
    category: "Collaboration",
    sanction: "sanctioned",
    risk: "medium",
    users: 412,
    oauthScopes: ["channels:history", "files:read"],
    dataClassesSeen: ["PCI"],
    lastSeenLabel: "2d ago",
    findingIds: ["ds-dlp-03"],
    owner: "IT Workspace",
    sourceName: "Netskope CASB",
  },
  {
    id: "saas-gdrive",
    name: "Google Drive",
    category: "File sync",
    sanction: "tolerated",
    risk: "medium",
    users: 87,
    oauthScopes: ["drive"],
    dataClassesSeen: ["Contracts"],
    lastSeenLabel: "3d ago",
    findingIds: ["ds-casb-03"],
    owner: "Partner Ops",
    sourceName: "Netskope CASB",
  },
  {
    id: "saas-dropbox",
    name: "Dropbox",
    category: "File sync",
    sanction: "shadow",
    risk: "high",
    users: 9,
    oauthScopes: ["files.content.write"],
    dataClassesSeen: ["Brand assets"],
    lastSeenLabel: "8h ago",
    findingIds: ["ds-casb-04"],
    sourceName: "Netskope CASB",
  },
  {
    id: "saas-chatgpt",
    name: "ChatGPT",
    category: "GenAI",
    sanction: "tolerated",
    risk: "medium",
    users: 156,
    oauthScopes: ["file_upload"],
    dataClassesSeen: ["Source / design"],
    lastSeenLabel: "1d ago",
    findingIds: ["ds-casb-05"],
    owner: "AI Enablement",
    sourceName: "Netskope CASB",
  },
  {
    id: "saas-wetransfer",
    name: "WeTransfer",
    category: "File transfer",
    sanction: "shadow",
    risk: "high",
    users: 21,
    oauthScopes: [],
    dataClassesSeen: ["Customer PII"],
    lastSeenLabel: "1d ago",
    findingIds: ["ds-dlp-06"],
    sourceName: "Netskope CASB",
  },
  {
    id: "saas-trello",
    name: "Trello",
    category: "Project mgmt",
    sanction: "shadow",
    risk: "high",
    users: 18,
    oauthScopes: ["read", "write"],
    dataClassesSeen: ["Secrets / keys"],
    lastSeenLabel: "2d ago",
    findingIds: ["ds-casb-06"],
    sourceName: "Netskope CASB",
  },
  {
    id: "saas-github",
    name: "GitHub",
    category: "Dev platform",
    sanction: "sanctioned",
    risk: "medium",
    users: 240,
    oauthScopes: ["gist", "repo"],
    dataClassesSeen: ["Config / secrets"],
    lastSeenLabel: "3d ago",
    findingIds: ["ds-casb-07"],
    owner: "Engineering",
    sourceName: "Netskope CASB",
  },
  {
    id: "saas-canva",
    name: "Canva",
    category: "Design",
    sanction: "shadow",
    risk: "low",
    users: 44,
    oauthScopes: ["design:content:read"],
    dataClassesSeen: ["Brand assets"],
    lastSeenLabel: "4d ago",
    findingIds: ["ds-casb-08"],
    sourceName: "Netskope CASB",
  },
  {
    id: "saas-teams",
    name: "Microsoft Teams",
    category: "Collaboration",
    sanction: "sanctioned",
    risk: "low",
    users: 890,
    oauthScopes: ["Files.Read.All"],
    dataClassesSeen: ["Internal wiki"],
    lastSeenLabel: "4d ago",
    findingIds: ["ds-dlp-09"],
    owner: "IT Workspace",
    sourceName: "Microsoft Purview DLP",
  },
  {
    id: "saas-airtable",
    name: "Airtable",
    category: "Low-code DB",
    sanction: "shadow",
    risk: "critical",
    users: 7,
    oauthScopes: ["data.records:read", "data.records:write"],
    dataClassesSeen: ["PII / payroll"],
    lastSeenLabel: "5d ago",
    findingIds: ["ds-casb-09"],
    sourceName: "Netskope CASB",
  },
  {
    id: "saas-sharepoint",
    name: "SharePoint Online",
    category: "File sync",
    sanction: "sanctioned",
    risk: "medium",
    users: 720,
    oauthScopes: ["Sites.Read.All"],
    dataClassesSeen: ["Contracts"],
    lastSeenLabel: "5d ago",
    findingIds: ["ds-dlp-10"],
    owner: "IT Workspace",
    sourceName: "Microsoft Purview DLP",
  },
  {
    id: "saas-zoom",
    name: "Zoom",
    category: "Meetings",
    sanction: "sanctioned",
    risk: "low",
    users: 510,
    oauthScopes: ["recording:read"],
    dataClassesSeen: ["Executive / board"],
    lastSeenLabel: "6d ago",
    findingIds: ["ds-casb-10"],
    owner: "IT Workspace",
    sourceName: "Netskope CASB",
  },
  {
    id: "saas-whatsapp",
    name: "WhatsApp Web",
    category: "Messaging",
    sanction: "shadow",
    risk: "medium",
    users: 33,
    oauthScopes: [],
    dataClassesSeen: ["Customer PII"],
    lastSeenLabel: "6d ago",
    findingIds: ["ds-dlp-11"],
    sourceName: "Netskope CASB",
  },
  {
    id: "saas-miro",
    name: "Miro",
    category: "Design",
    sanction: "tolerated",
    risk: "low",
    users: 95,
    oauthScopes: ["boards:read"],
    dataClassesSeen: ["Source / design"],
    lastSeenLabel: "7d ago",
    findingIds: ["ds-casb-11"],
    owner: "Product Design",
    sourceName: "Netskope CASB",
  },
];

const saasAppExtras = [
  { name: "Coda", category: "Docs / wiki" },
  { name: "Discord", category: "Messaging" },
  { name: "Confluence Cloud", category: "Docs / wiki" },
  { name: "Claude", category: "GenAI" },
  { name: "Gemini", category: "GenAI" },
  { name: "GitLab", category: "Dev platform" },
  { name: "Bitbucket", category: "Dev platform" },
  { name: "Asana", category: "Project mgmt" },
  { name: "Monday.com", category: "Project mgmt" },
  { name: "Figma", category: "Design" },
  { name: "Lucidchart", category: "Design" },
  { name: "iCloud Drive", category: "File sync" },
  { name: "Mega", category: "File transfer" },
  { name: "TransferNow", category: "File transfer" },
  { name: "ServiceNow", category: "ITSM" },
  { name: "Salesforce", category: "CRM" },
  { name: "HubSpot", category: "CRM" },
  { name: "Intercom", category: "Messaging" },
  { name: "Linear", category: "Project mgmt" },
  { name: "ClickUp", category: "Project mgmt" },
] as const;

const sanctionCycle: SaaSAppSanction[] = [
  "shadow",
  "tolerated",
  "sanctioned",
  "shadow",
  "tolerated",
];

const riskCycle: SaaSAppRisk[] = ["critical", "high", "medium", "low", "high"];

function expandSaasApps(
  seeds: SaaSAppInventoryItem[],
  size = SAAS_CATALOG_SIZE,
): SaaSAppInventoryItem[] {
  if (seeds.length >= size) return seeds.slice(0, size);
  const generated: SaaSAppInventoryItem[] = [];
  for (let index = 0; index < size - seeds.length; index += 1) {
    const template = seeds[index % seeds.length]!;
    const extra = saasAppExtras[index % saasAppExtras.length]!;
    const n = seeds.length + index + 1;
    generated.push({
      ...template,
      id: `saas-x${String(n).padStart(2, "0")}`,
      name: extra.name,
      category: extra.category,
      sanction: sanctionCycle[index % sanctionCycle.length]!,
      risk: riskCycle[index % riskCycle.length]!,
      users: 5 + ((index * 17) % 400),
      oauthScopes:
        index % 3 === 0
          ? []
          : template.oauthScopes.slice(0, 1 + (index % 2)),
      dataClassesSeen: [dataClassPool[index % dataClassPool.length]!],
      lastSeenLabel: detectedLabelCycle[index % detectedLabelCycle.length]!,
      findingIds: index % 4 === 0 ? [] : template.findingIds.slice(0, 1),
      owner: index % 2 === 0 ? template.owner : undefined,
      sourceName: "Netskope CASB",
    });
  }
  return [...seeds, ...generated];
}

export const saasAppInventory: SaaSAppInventoryItem[] = expandSaasApps(
  saasAppInventorySeed,
);

const exfilTimelineEventsSeed: ExfilTimelineEvent[] = [
  {
    id: "exf-01",
    at: "2026-07-28T16:10:00.000Z",
    atLabel: "2h ago",
    kind: "sync",
    summary: "Payroll CSV synced to personal OneDrive",
    findingId: "ds-dlp-01",
    identityId: "id-user-04",
    identityLabel: "maya.rao@svalbard.ca",
    channel: "OneDrive · personal",
    bytesLabel: "2.4 MB",
    destination: "live.com · personal",
  },
  {
    id: "exf-02",
    at: "2026-07-28T14:38:00.000Z",
    atLabel: "4h ago",
    kind: "oauth",
    summary: "Box OAuth grant · full-drive scope",
    findingId: "ds-casb-01",
    identityId: "id-user-08",
    identityLabel: "gareth.doyle@svalbard.ca",
    channel: "Box OAuth",
    destination: "box.com",
  },
  {
    id: "exf-03",
    at: "2026-07-28T12:04:00.000Z",
    atLabel: "6h ago",
    kind: "print",
    summary: "PHI PDF print to USB printer blocked",
    findingId: "ds-dlp-04",
    identityId: "id-user-06",
    identityLabel: "chloe.park@svalbard.ca",
    channel: "Endpoint print",
    bytesLabel: "1.1 MB",
  },
  {
    id: "exf-04",
    at: "2026-07-28T10:20:00.000Z",
    atLabel: "8h ago",
    kind: "sync",
    summary: "Brand folder sync to personal Dropbox",
    findingId: "ds-casb-04",
    identityId: "id-user-21",
    identityLabel: "dina.moss@partners.svalbard.ca",
    channel: "Dropbox",
    bytesLabel: "180 MB",
    destination: "dropbox.com · personal",
  },
  {
    id: "exf-05",
    at: "2026-07-28T09:47:00.000Z",
    atLabel: "9h ago",
    kind: "upload",
    summary: "AWS key pattern posted to Pastebin",
    findingId: "ds-dlp-05",
    identityId: "id-user-02",
    identityLabel: "ben.lewis@svalbard.ca",
    channel: "Web · Pastebin",
    destination: "pastebin.com",
  },
  {
    id: "exf-06",
    at: "2026-07-27T21:04:00.000Z",
    atLabel: "1d ago",
    kind: "email",
    summary: "Monorepo zip attached to external Gmail",
    findingId: "ds-dlp-02",
    identityId: "id-user-17",
    identityLabel: "ethan.cole@svalbard.ca",
    channel: "Exchange Online",
    bytesLabel: "94 MB",
    destination: "gmail.com",
  },
  {
    id: "exf-07",
    at: "2026-07-27T16:28:00.000Z",
    atLabel: "1d ago",
    kind: "upload",
    summary: "Architecture PDF uploaded to ChatGPT",
    findingId: "ds-casb-05",
    identityId: "id-user-05",
    identityLabel: "owen.lee@svalbard.ca",
    channel: "ChatGPT",
    bytesLabel: "3.2 MB",
    destination: "chatgpt.com",
  },
  {
    id: "exf-08",
    at: "2026-07-27T14:10:00.000Z",
    atLabel: "1d ago",
    kind: "upload",
    summary: "CRM CSV uploaded to WeTransfer",
    findingId: "ds-dlp-06",
    identityId: "id-user-19",
    identityLabel: "jules.hart@svalbard.ca",
    channel: "WeTransfer",
    bytesLabel: "6.8 MB",
    destination: "wetransfer.com",
  },
  {
    id: "exf-09",
    at: "2026-07-27T11:18:00.000Z",
    atLabel: "1d ago",
    kind: "share",
    summary: "Notion page set to public",
    findingId: "ds-casb-02",
    identityId: "id-user-18",
    identityLabel: "nina.brooks@svalbard.ca",
    channel: "Notion",
    destination: "notion.site · public",
  },
  {
    id: "exf-10",
    at: "2026-07-26T22:12:00.000Z",
    atLabel: "2d ago",
    kind: "share",
    summary: "Trello board with tokens discovered",
    findingId: "ds-casb-06",
    identityId: "id-user-11",
    identityLabel: "brendan.murphy@svalbard.ca",
    channel: "Trello",
    destination: "trello.com",
  },
  {
    id: "exf-11",
    at: "2026-07-26T18:42:00.000Z",
    atLabel: "2d ago",
    kind: "download",
    summary: "Slack channel export matched PCI",
    findingId: "ds-dlp-03",
    identityId: "id-user-15",
    identityLabel: "sofia.ahmed@svalbard.ca",
    channel: "Slack",
    bytesLabel: "12 MB",
  },
  {
    id: "exf-12",
    at: "2026-07-26T15:38:00.000Z",
    atLabel: "2d ago",
    kind: "email",
    summary: "Litigation-hold mailbox forward created",
    findingId: "ds-dlp-07",
    identityId: "id-user-12",
    identityLabel: "robyn.carr@svalbard.ca",
    channel: "Exchange Online",
    destination: "gmail.com",
  },
  {
    id: "exf-13",
    at: "2026-07-25T19:52:00.000Z",
    atLabel: "3d ago",
    kind: "upload",
    summary: "Public gist with connection strings",
    findingId: "ds-casb-07",
    identityId: "id-user-14",
    identityLabel: "leo.park@svalbard.ca",
    channel: "GitHub Gist",
    destination: "gist.github.com",
  },
  {
    id: "exf-14",
    at: "2026-07-25T09:08:00.000Z",
    atLabel: "3d ago",
    kind: "share",
    summary: "40+ Google Drive external shares",
    findingId: "ds-casb-03",
    identityId: "id-user-03",
    identityLabel: "ava.reed@svalbard.ca",
    channel: "Google Drive",
    destination: "partner domain",
  },
  {
    id: "exf-15",
    at: "2026-07-23T03:12:00.000Z",
    atLabel: "5d ago",
    kind: "download",
    summary: "8.4 GB SharePoint contracts download",
    findingId: "ds-dlp-10",
    identityId: "id-user-10",
    identityLabel: "samir.tamin@svalbard.ca",
    channel: "SharePoint Online",
    bytesLabel: "8.4 GB",
  },
  {
    id: "exf-16",
    at: "2026-07-23T17:28:00.000Z",
    atLabel: "5d ago",
    kind: "upload",
    summary: "HR onboarding responses into Airtable",
    findingId: "ds-casb-09",
    identityId: "id-user-25",
    identityLabel: "nia.berger@svalbard.ca",
    channel: "Airtable",
    destination: "airtable.com",
  },
];

const exfilKindCycle: ExfilTimelineEventKind[] = [
  "upload",
  "download",
  "share",
  "email",
  "oauth",
  "sync",
  "print",
];

const exfilSummaryExtras = [
  "Labeled workbook synced to consumer cloud",
  "Customer list emailed to personal inbox",
  "OAuth grant · full mail scope",
  "Public share link created on shadow wiki",
  "Bulk download from Contracts library",
  "PHI print job blocked at endpoint",
  "GenAI file upload of architecture brief",
  "USB copy of finance forecast",
  "Guest tenant share of engineering wiki",
  "Paste of secrets to paste site",
  "CRM export uploaded to file transfer",
  "Recording shared via anonymous link",
  "Shadow board with tokens discovered",
  "Personal Dropbox brand folder sync",
  "Gist published with connection strings",
  "External domain share spike",
  "Chat paste of customer phone list",
  "Mailbox auto-forward rule created",
  "CI artifact secrets scanned in log",
  "Large after-hours library download",
  "Notion page set to public",
  "Box full-drive grant from BYOD",
  "Airtable ingest of HR form fields",
  "Zoom board briefing shared externally",
  "Teams guest share of sensitive page",
  "WeTransfer of CRM segment",
] as const;

function expandExfilTimeline(
  seeds: ExfilTimelineEvent[],
  size = EXFIL_CATALOG_SIZE,
): ExfilTimelineEvent[] {
  if (seeds.length >= size) return seeds.slice(0, size);
  const generated: ExfilTimelineEvent[] = [];
  for (let index = 0; index < size - seeds.length; index += 1) {
    const template = seeds[index % seeds.length]!;
    const n = seeds.length + index + 1;
    const identityLabel = identityPool[index % identityPool.length]!;
    const at = new Date(
      Date.UTC(2026, 6, 28, 16, 0, 0) - index * 2_700_000,
    ).toISOString();
    generated.push({
      ...template,
      id: `exf-${String(n).padStart(2, "0")}`,
      at,
      atLabel: detectedLabelCycle[index % detectedLabelCycle.length]!,
      kind: exfilKindCycle[index % exfilKindCycle.length]!,
      summary: exfilSummaryExtras[index % exfilSummaryExtras.length]!,
      findingId: dataSecurityFindings[index % dataSecurityFindings.length]!.id,
      identityId: `id-user-${String((index % 25) + 1).padStart(2, "0")}`,
      identityLabel,
      channel: channelPool[index % channelPool.length]!,
      bytesLabel:
        index % 3 === 0
          ? undefined
          : `${(1 + (index % 90)) / 10} ${index % 5 === 0 ? "GB" : "MB"}`,
      destination:
        index % 4 === 0
          ? undefined
          : channelPool[(index + 3) % channelPool.length],
    });
  }
  return [...seeds, ...generated];
}

export const exfilTimelineEvents: ExfilTimelineEvent[] = expandExfilTimeline(
  exfilTimelineEventsSeed,
);

export function getDataSecurityStats(findings: DataSecurityFinding[] = dataSecurityFindings) {
  const open = findings.filter(
    (f) => f.status === "open" || f.status === "investigating",
  ).length;
  const dlp = findings.filter((f) => f.kind === "dlp").length;
  const casb = findings.filter((f) => f.kind === "casb").length;
  const linked = findings.filter((f) => f.openIncidentId).length;
  const shadowApps = saasAppInventory.filter((a) => a.sanction === "shadow").length;
  return { open, dlp, casb, linked, shadowApps, total: findings.length };
}
