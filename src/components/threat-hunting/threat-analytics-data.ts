import {
  type AlertSeverity,
  getAlertById,
  getLinkedIdentity,
  severityWeight,
  type SocAlert,
  socAlerts,
} from "@/components/alerts/alerts-data";
import {
  assetIdentities,
  type AssetIdentity,
} from "@/components/assets/identities-data";
import {
  getIncidentById,
  type SocIncident,
  socIncidents,
} from "@/components/incidents/incidents-data";

export type ThreatNodeKind =
  | "actor"
  | "technique"
  | "identity"
  | "alert"
  | "vulnerability";

export type ThreatRelation =
  | "uses"
  | "targets"
  | "exploits"
  | "triggers"
  | "observed_on";

export type ThreatTrend = "up" | "down" | "flat";

export type ThreatGraphNode = {
  id: string;
  kind: ThreatNodeKind;
  label: string;
  subtitle?: string;
  severity?: AlertSeverity;
  summary: string;
  meta: Record<string, string | number | null>;
  linkedAlertIds: string[];
  linkedIdentityId: string | null;
  linkedIncidentIds: string[];
  huntActions: string[];
  x: number;
  y: number;
  w: number;
};

export type ThreatGraphEdge = {
  id: string;
  from: string;
  to: string;
  relation: ThreatRelation;
  tone: "default" | "critical";
};

export type TechniqueInventoryRow = {
  id: string;
  name: string;
  tactic: string;
  detections: number;
  severity: AlertSeverity;
  trend: ThreatTrend;
  lastSeen: string;
  lastSeenMinutes: number;
  summary: string;
  graphNodeId?: string;
  openAlertCount: number;
};

export type ThreatAnalyticsKpi = {
  key: "active-techniques" | "critical-chains" | "exposed-identities" | "open-alerts";
  title: string;
  value: string;
  context: string;
};

export type ThreatNodeDetail = {
  node: ThreatGraphNode;
  neighbors: Array<{
    node: ThreatGraphNode;
    relation: ThreatRelation;
    direction: "in" | "out";
  }>;
  alerts: SocAlert[];
  incidents: SocIncident[];
  identity: AssetIdentity | null;
};

export const threatNodeKindLabels: Record<ThreatNodeKind, string> = {
  actor: "Actor",
  technique: "Technique",
  identity: "Identity",
  alert: "Alert",
  vulnerability: "Vulnerability",
};

export const threatRelationLabels: Record<ThreatRelation, string> = {
  uses: "Uses",
  targets: "Targets",
  exploits: "Exploits",
  triggers: "Triggers",
  observed_on: "Observed on",
};

export const techniqueNameById: Record<string, string> = {
  "T1059.001": "PowerShell",
  T1078: "Valid Accounts",
  T1496: "Resource Hijacking",
  "T1071.001": "Web Protocols",
  T1098: "Account Manipulation",
  T1110: "Brute Force",
  T1048: "Exfiltration Over Alternative Protocol",
  "T1021.002": "SMB/Windows Admin Shares",
  "T1053.005": "Scheduled Task",
  T1218: "System Binary Proxy Execution",
  T1046: "Network Service Discovery",
  T1566: "Phishing",
  T1027: "Obfuscated Files or Information",
  T1083: "File and Directory Discovery",
  T1003: "OS Credential Dumping",
};

const techniqueSummaries: Record<string, string> = {
  "T1059.001":
    "Adversaries abuse PowerShell to download cradles, run encoded commands, and stage follow-on tooling.",
  T1078:
    "Compromised or abused valid accounts bypass many perimeter controls and blend into normal sign-in traffic.",
  T1496:
    "Resource hijacking consumes compute for crypto-mining or other unauthorized workloads on cloud hosts.",
  "T1071.001":
    "C2 traffic tunnels over common web protocols to evade network signature and reputation controls.",
  T1098:
    "Account manipulation creates persistence by altering privileges, MFA settings, or mailbox rules.",
  T1110:
    "Credential guessing and password spraying target exposed identity surfaces and legacy protocols.",
  T1048:
    "Data leaves the environment over non-standard channels that often bypass DLP baselines.",
  "T1021.002":
    "Lateral movement over SMB/admin shares expands access after initial foothold.",
  "T1053.005":
    "Scheduled tasks provide durable execution and stealthy re-entry after reboot.",
  T1218:
    "Living-off-the-land binaries proxy malicious payloads to evade application control.",
  T1046:
    "Internal scanning maps services and open ports before lateral movement.",
  T1566:
    "Phishing delivers initial access via credential theft or malicious attachments.",
  T1027:
    "Obfuscation hides payloads and scripts from static detection and content inspection.",
  T1083:
    "File discovery enumerates shares and sensitive directories for staging and theft.",
  T1003:
    "Credential dumping harvests hashes and tickets for privilege escalation and lateral movement.",
};

function baseTechniqueId(technique: string): string {
  return technique.split(".")[0] ?? technique;
}

function openStatuses(status: SocAlert["status"]) {
  return (
    status !== "closed" &&
    status !== "false-positive"
  );
}

function rollupSeverity(alerts: SocAlert[]): AlertSeverity {
  if (alerts.length === 0) return "low";
  return alerts.reduce<AlertSeverity>((worst, alert) => {
    return severityWeight[alert.severity] > severityWeight[worst]
      ? alert.severity
      : worst;
  }, "low");
}

function trendForCount(count: number, index: number): ThreatTrend {
  if (count >= 80) return "up";
  if (count <= 25) return "down";
  return index % 3 === 0 ? "up" : index % 3 === 1 ? "down" : "flat";
}

/** Curated multi-hop graph: Actor → Technique → Identity/Vuln → Alert */
const curatedThreatGraphNodes: ThreatGraphNode[] = [
  {
    id: "actor-canvas-cyclone",
    kind: "actor",
    label: "Canvas Cyclone",
    subtitle: "APT · Financial + SaaS",
    severity: "critical",
    summary:
      "China-aligned cluster focused on credential theft, token replay, and living-off-the-land execution against finance and SaaS estates.",
    meta: {
      origin: "CN",
      industries: "Finance, SaaS",
      confidence: "High",
      aliases: "Storm-0867",
    },
    linkedAlertIds: ["ALT-2148", "ALT-2147", "ALT-2145"],
    linkedIdentityId: null,
    linkedIncidentIds: [],
    huntActions: [
      "Pivot on Canvas Cyclone TTPs in advanced hunting",
      "Review privileged identity risk for finance analysts",
      "Validate token-theft detections against Okta/Entra logs",
    ],
    x: 40,
    y: 80,
    w: 200,
  },
  {
    id: "actor-helpdesk-hijackers",
    kind: "actor",
    label: "Helpdesk Hijackers",
    subtitle: "OSINT · Social engineering",
    severity: "high",
    summary:
      "Opportunistic cluster that social-engineers helpdesk resets, then plants mailbox rules and MFA fatigue campaigns.",
    meta: {
      origin: "Unknown",
      industries: "All",
      confidence: "Medium",
      aliases: "Not applicable",
    },
    linkedAlertIds: ["ALT-2147", "ALT-2141"],
    linkedIdentityId: null,
    linkedIncidentIds: [],
    huntActions: [
      "Audit recent helpdesk password resets",
      "Hunt for new inbox rules on VIP mailboxes",
    ],
    x: 40,
    y: 320,
    w: 200,
  },
  {
    id: "tech-t1059",
    kind: "technique",
    label: "T1059.001",
    subtitle: "PowerShell",
    severity: "critical",
    summary: techniqueSummaries["T1059.001"]!,
    meta: {
      tactic: "Execution",
      technique: "T1059.001",
    },
    linkedAlertIds: ["ALT-2148"],
    linkedIdentityId: "id-user-02",
    linkedIncidentIds: [],
    huntActions: [
      "Hunt encoded PowerShell + IEX cradles",
      "Correlate parent process trees on finance workstations",
    ],
    x: 320,
    y: 40,
    w: 180,
  },
  {
    id: "tech-t1078",
    kind: "technique",
    label: "T1078",
    subtitle: "Valid Accounts",
    severity: "critical",
    summary: techniqueSummaries.T1078!,
    meta: {
      tactic: "Initial Access",
      technique: "T1078",
    },
    linkedAlertIds: ["ALT-2147"],
    linkedIdentityId: "id-user-01",
    linkedIncidentIds: [],
    huntActions: [
      "Review impossible-travel and MFA push anomalies",
      "Check session reuse across geo regions",
    ],
    x: 320,
    y: 180,
    w: 180,
  },
  {
    id: "tech-t1071",
    kind: "technique",
    label: "T1071.001",
    subtitle: "Web Protocols",
    severity: "critical",
    summary: techniqueSummaries["T1071.001"]!,
    meta: {
      tactic: "Command and Control",
      technique: "T1071.001",
    },
    linkedAlertIds: ["ALT-2145"],
    linkedIdentityId: null,
    linkedIncidentIds: [],
    huntActions: [
      "Hunt JA3 / beaconing to low-reputation domains",
      "Cross-check proxy TLS anomalies",
    ],
    x: 320,
    y: 320,
    w: 180,
  },
  {
    id: "tech-t1110",
    kind: "technique",
    label: "T1110",
    subtitle: "Brute Force",
    severity: "high",
    summary: techniqueSummaries.T1110!,
    meta: {
      tactic: "Credential Access",
      technique: "T1110",
    },
    linkedAlertIds: ["ALT-2141"],
    linkedIdentityId: "id-user-03",
    linkedIncidentIds: [],
    huntActions: [
      "Baseline failed auth spikes by identity provider",
      "Lock sprayed accounts and rotate credentials",
    ],
    x: 320,
    y: 460,
    w: 180,
  },
  {
    id: "tech-t1021",
    kind: "technique",
    label: "T1021.002",
    subtitle: "SMB Admin Shares",
    severity: "high",
    summary: techniqueSummaries["T1021.002"]!,
    meta: {
      tactic: "Lateral Movement",
      technique: "T1021.002",
    },
    linkedAlertIds: ["ALT-2139"],
    linkedIdentityId: "id-user-02",
    linkedIncidentIds: [],
    huntActions: [
      "Hunt admin-share access from unusual source hosts",
      "Validate privileged group membership changes",
    ],
    x: 320,
    y: 600,
    w: 180,
  },
  {
    id: "vuln-certighost",
    kind: "vulnerability",
    label: "CVE-2026-54121",
    subtitle: "CertiGhost · AD CS EoP",
    severity: "critical",
    summary:
      "Active Directory Certificate Services elevation of privilege. Abuse of misconfigured templates can yield domain-level persistence.",
    meta: {
      cve: "CVE-2026-54121",
      published: "Jul 27, 2026",
      cvss: 8.8,
      exposure: "High",
    },
    linkedAlertIds: ["ALT-2143"],
    linkedIdentityId: null,
    linkedIncidentIds: [],
    huntActions: [
      "Inventory AD CS templates with enrollee-supplied SANs",
      "Patch domain controllers and revoke suspect certificates",
    ],
    x: 560,
    y: 100,
    w: 200,
  },
  {
    id: "vuln-token-theft",
    kind: "vulnerability",
    label: "Token theft surface",
    subtitle: "OAuth / session cookies",
    severity: "high",
    summary:
      "Browser and IdP token theft enables silent replay without password prompts when session binding is weak.",
    meta: {
      cve: "Not assigned",
      published: "Ongoing",
      cvss: null,
      exposure: "Medium",
    },
    linkedAlertIds: ["ALT-2147"],
    linkedIdentityId: "id-user-01",
    linkedIncidentIds: [],
    huntActions: [
      "Enforce token binding / Conditional Access",
      "Revoke refresh tokens for impacted identities",
    ],
    x: 560,
    y: 280,
    w: 200,
  },
  {
    id: "id-riya",
    kind: "identity",
    label: "Riya Sharma",
    subtitle: "riya.sharma@svalbard.ca",
    severity: "high",
    summary:
      "Privileged SOC director account observed in valid-account and token-theft chains. High blast radius if compromised.",
    meta: {
      kind: "user",
      privileged: "Yes",
      riskScore: 22,
      source: "Entra ID",
    },
    linkedAlertIds: ["ALT-2147"],
    linkedIdentityId: "id-user-01",
    linkedIncidentIds: [],
    huntActions: [
      "Force step-up MFA and session revoke",
      "Review Global Admin group audit trail",
    ],
    x: 560,
    y: 440,
    w: 200,
  },
  {
    id: "id-ben",
    kind: "identity",
    label: "Ben Lewis",
    subtitle: "ben.lewis@svalbard.ca",
    severity: "medium",
    summary:
      "Security engineering lead with Cloud Admin rights. Linked to PowerShell and lateral-movement detections on eng hosts.",
    meta: {
      kind: "user",
      privileged: "Yes",
      riskScore: 28,
      source: "Entra ID",
    },
    linkedAlertIds: ["ALT-2148", "ALT-2139"],
    linkedIdentityId: "id-user-02",
    linkedIncidentIds: [],
    huntActions: [
      "Validate workstation integrity for LAP-ENG-0042",
      "Review recent PowerShell transcription logs",
    ],
    x: 560,
    y: 580,
    w: 200,
  },
  {
    id: "id-ava",
    kind: "identity",
    label: "Ava Reed",
    subtitle: "ava.reed@svalbard.ca",
    severity: "medium",
    summary:
      "Tier 2 analyst identity appearing in spray / MFA fatigue related activity.",
    meta: {
      kind: "user",
      privileged: "No",
      riskScore: 14,
      source: "Okta",
    },
    linkedAlertIds: ["ALT-2141"],
    linkedIdentityId: "id-user-03",
    linkedIncidentIds: [],
    huntActions: [
      "Confirm MFA method health",
      "Check Okta risk signals for last 24h",
    ],
    x: 560,
    y: 720,
    w: 200,
  },
  {
    id: "alert-2148",
    kind: "alert",
    label: "ALT-2148",
    subtitle: "PowerShell download cradle",
    severity: "critical",
    summary:
      "Encoded PowerShell invoked a remote IEX cradle from a workstation that rarely runs scripting hosts.",
    meta: {
      status: "new",
      entity: "wks-finance-17",
      source: "Splunk Enterprise",
    },
    linkedAlertIds: ["ALT-2148"],
    linkedIdentityId: "id-user-02",
    linkedIncidentIds: [],
    huntActions: [
      "Isolate host and collect PowerShell logs",
      "Block egress to the contacted IP",
    ],
    x: 840,
    y: 40,
    w: 210,
  },
  {
    id: "alert-2147",
    kind: "alert",
    label: "ALT-2147",
    subtitle: "Impossible travel after MFA",
    severity: "critical",
    summary:
      "Okta session authenticated from Austin then Singapore within 34 minutes; both passed MFA push.",
    meta: {
      status: "triaging",
      entity: "ava.reed@svalbard.ca",
      source: "Okta Workforce",
    },
    linkedAlertIds: ["ALT-2147"],
    linkedIdentityId: "id-user-01",
    linkedIncidentIds: [],
    huntActions: [
      "Revoke sessions and reset MFA factors",
      "Confirm travel exceptions with the user",
    ],
    x: 840,
    y: 200,
    w: 210,
  },
  {
    id: "alert-2145",
    kind: "alert",
    label: "ALT-2145",
    subtitle: "C2-like beaconing",
    severity: "critical",
    summary:
      "Periodic HTTPS callbacks to a low-reputation domain with JA3 matching Cobalt Strike defaults.",
    meta: {
      status: "escalated",
      entity: "edge proxy",
      source: "Palo Alto",
    },
    linkedAlertIds: ["ALT-2145"],
    linkedIdentityId: null,
    linkedIncidentIds: [],
    huntActions: [
      "Sinkhole the C2 domain",
      "Scope hosts with matching JA3",
    ],
    x: 840,
    y: 360,
    w: 210,
  },
  {
    id: "alert-2143",
    kind: "alert",
    label: "ALT-2143",
    subtitle: "AD CS privilege anomaly",
    severity: "high",
    summary:
      "Certificate enrollment activity consistent with CertiGhost-style template abuse.",
    meta: {
      status: "investigating",
      entity: "dc-cert-01",
      source: "Defender for Identity",
    },
    linkedAlertIds: ["ALT-2143"],
    linkedIdentityId: null,
    linkedIncidentIds: [],
    huntActions: [
      "Inspect certificate request attributes",
      "Disable vulnerable templates pending patch",
    ],
    x: 840,
    y: 120,
    w: 210,
  },
  {
    id: "alert-2141",
    kind: "alert",
    label: "ALT-2141",
    subtitle: "Password spray burst",
    severity: "high",
    summary:
      "Concentrated failed authentications across multiple identities from a small set of source IPs.",
    meta: {
      status: "triaging",
      entity: "identity plane",
      source: "Okta Workforce",
    },
    linkedAlertIds: ["ALT-2141"],
    linkedIdentityId: "id-user-03",
    linkedIncidentIds: [],
    huntActions: [
      "Block spraying source ranges",
      "Notify targeted users",
    ],
    x: 840,
    y: 520,
    w: 210,
  },
  {
    id: "alert-2139",
    kind: "alert",
    label: "ALT-2139",
    subtitle: "Admin share lateral move",
    severity: "high",
    summary:
      "Unusual SMB admin-share access from an engineering workstation to multiple file servers.",
    meta: {
      status: "investigating",
      entity: "LAP-ENG-0042",
      source: "CrowdStrike",
    },
    linkedAlertIds: ["ALT-2139"],
    linkedIdentityId: "id-user-02",
    linkedIncidentIds: [],
    huntActions: [
      "Contain source host",
      "Audit file server access logs",
    ],
    x: 840,
    y: 660,
    w: 210,
  },
];

const curatedThreatGraphEdges: ThreatGraphEdge[] = [
  {
    id: "e-cc-t1059",
    from: "actor-canvas-cyclone",
    to: "tech-t1059",
    relation: "uses",
    tone: "critical",
  },
  {
    id: "e-cc-t1078",
    from: "actor-canvas-cyclone",
    to: "tech-t1078",
    relation: "uses",
    tone: "critical",
  },
  {
    id: "e-cc-t1071",
    from: "actor-canvas-cyclone",
    to: "tech-t1071",
    relation: "uses",
    tone: "critical",
  },
  {
    id: "e-hh-t1110",
    from: "actor-helpdesk-hijackers",
    to: "tech-t1110",
    relation: "uses",
    tone: "default",
  },
  {
    id: "e-hh-t1078",
    from: "actor-helpdesk-hijackers",
    to: "tech-t1078",
    relation: "uses",
    tone: "default",
  },
  {
    id: "e-t1059-vuln",
    from: "tech-t1059",
    to: "vuln-certighost",
    relation: "exploits",
    tone: "critical",
  },
  {
    id: "e-t1078-token",
    from: "tech-t1078",
    to: "vuln-token-theft",
    relation: "exploits",
    tone: "critical",
  },
  {
    id: "e-t1059-ben",
    from: "tech-t1059",
    to: "id-ben",
    relation: "targets",
    tone: "default",
  },
  {
    id: "e-t1078-riya",
    from: "tech-t1078",
    to: "id-riya",
    relation: "targets",
    tone: "critical",
  },
  {
    id: "e-t1110-ava",
    from: "tech-t1110",
    to: "id-ava",
    relation: "targets",
    tone: "default",
  },
  {
    id: "e-t1021-ben",
    from: "tech-t1021",
    to: "id-ben",
    relation: "targets",
    tone: "default",
  },
  {
    id: "e-token-riya",
    from: "vuln-token-theft",
    to: "id-riya",
    relation: "targets",
    tone: "critical",
  },
  {
    id: "e-cert-alert",
    from: "vuln-certighost",
    to: "alert-2143",
    relation: "triggers",
    tone: "critical",
  },
  {
    id: "e-ben-2148",
    from: "id-ben",
    to: "alert-2148",
    relation: "observed_on",
    tone: "critical",
  },
  {
    id: "e-riya-2147",
    from: "id-riya",
    to: "alert-2147",
    relation: "observed_on",
    tone: "critical",
  },
  {
    id: "e-t1071-2145",
    from: "tech-t1071",
    to: "alert-2145",
    relation: "triggers",
    tone: "critical",
  },
  {
    id: "e-ava-2141",
    from: "id-ava",
    to: "alert-2141",
    relation: "observed_on",
    tone: "default",
  },
  {
    id: "e-ben-2139",
    from: "id-ben",
    to: "alert-2139",
    relation: "observed_on",
    tone: "default",
  },
  {
    id: "e-t1021-2139",
    from: "tech-t1021",
    to: "alert-2139",
    relation: "triggers",
    tone: "default",
  },
  {
    id: "e-token-2147",
    from: "vuln-token-theft",
    to: "alert-2147",
    relation: "triggers",
    tone: "critical",
  },
];

/**
 * Expand curated graph with alert-derived nodes so the map feels dense for demos.
 */
function densifyThreatGraph(
  curatedNodes: ThreatGraphNode[],
  curatedEdges: ThreatGraphEdge[],
): { nodes: ThreatGraphNode[]; edges: ThreatGraphEdge[] } {
  const nodes = [...curatedNodes];
  const edges = [...curatedEdges];
  const existingIds = new Set(nodes.map((n) => n.id));
  const actorIds = curatedNodes
    .filter((n) => n.kind === "actor")
    .map((n) => n.id);
  const techIds = curatedNodes
    .filter((n) => n.kind === "technique")
    .map((n) => n.id);

  const criticalHigh = socAlerts
    .filter(
      (alert) =>
        alert.severity === "critical" ||
        alert.severity === "high" ||
        Boolean(alert.mitreTechnique),
    )
    .slice(0, 36);

  criticalHigh.forEach((alert, index) => {
    const nodeId = `alert-dense-${alert.id.toLowerCase()}`;
    if (existingIds.has(nodeId) || existingIds.has(`alert-${alert.id.slice(4)}`)) {
      return;
    }
    const col = index % 6;
    const row = Math.floor(index / 6);
    nodes.push({
      id: nodeId,
      kind: "alert",
      label: alert.id,
      subtitle: alert.title.slice(0, 48),
      severity: alert.severity,
      summary: alert.summary,
      meta: {
        status: alert.status,
        entity: alert.entityName,
        source: alert.sourceName,
        technique: alert.mitreTechnique ?? "—",
      },
      linkedAlertIds: [alert.id],
      linkedIdentityId: alert.identityId ?? null,
      linkedIncidentIds: [],
      huntActions: [
        `Investigate entity ${alert.entityName}`,
        alert.mitreTechnique
          ? `Hunt technique ${alert.mitreTechnique}`
          : "Correlate related detections",
      ],
      x: 1040 + col * 220,
      y: 40 + row * 120,
      w: 200,
    });
    existingIds.add(nodeId);

    const mappedTech =
      (alert.mitreTechnique &&
        techniqueGraphIdByTechniqueSeed[alert.mitreTechnique]) ||
      null;
    const techNode =
      mappedTech &&
      (existingIds.has(mappedTech) || techIds.includes(mappedTech))
        ? mappedTech
        : techIds[index % Math.max(techIds.length, 1)] ?? null;
    if (techNode) {
      edges.push({
        id: `e-dense-tech-${alert.id}`,
        from: techNode,
        to: nodeId,
        relation: "triggers",
        tone: alert.severity === "critical" ? "critical" : "default",
      });
    } else if (actorIds[index % actorIds.length]) {
      edges.push({
        id: `e-dense-actor-${alert.id}`,
        from: actorIds[index % actorIds.length]!,
        to: nodeId,
        relation: "observed_on",
        tone: alert.severity === "critical" ? "critical" : "default",
      });
    }

    // Synthetic identity nodes for a subset of dense alerts
    if (index % 3 === 0 && alert.entityName.includes("@")) {
      const idNode = `id-dense-${index}`;
      if (!existingIds.has(idNode)) {
        nodes.push({
          id: idNode,
          kind: "identity",
          label: alert.entityName.split("@")[0] ?? alert.entityName,
          subtitle: alert.entityName,
          severity: alert.severity,
          summary: `Identity observed on ${alert.id}: ${alert.title}`,
          meta: {
            kind: "user",
            privileged: index % 5 === 0 ? "Yes" : "No",
            riskScore: 10 + (index % 40),
            source: "Okta",
          },
          linkedAlertIds: [alert.id],
          linkedIdentityId: alert.identityId ?? null,
          linkedIncidentIds: [],
          huntActions: [`Hunt sessions for ${alert.entityName}`],
          x: 560 + (index % 4) * 40,
          y: 820 + row * 30,
          w: 200,
        });
        existingIds.add(idNode);
        edges.push({
          id: `e-dense-id-${alert.id}`,
          from: idNode,
          to: nodeId,
          relation: "observed_on",
          tone: "default",
        });
      }
    }
  });

  return { nodes, edges };
}

const techniqueGraphIdByTechniqueSeed: Record<string, string> = {
  "T1059.001": "tech-t1059",
  T1059: "tech-t1059",
  T1078: "tech-t1078",
  "T1071.001": "tech-t1071",
  T1071: "tech-t1071",
  T1110: "tech-t1110",
  "T1021.002": "tech-t1021",
  T1021: "tech-t1021",
};

const densifiedThreatGraph = densifyThreatGraph(
  curatedThreatGraphNodes,
  curatedThreatGraphEdges,
);

export const threatGraphNodes: ThreatGraphNode[] = densifiedThreatGraph.nodes;
export const threatGraphEdges: ThreatGraphEdge[] = densifiedThreatGraph.edges;

const graphNodeById = new Map(  threatGraphNodes.map((node) => [node.id, node] as const),
);

const techniqueGraphIdByTechnique: Record<string, string> = {
  "T1059.001": "tech-t1059",
  T1059: "tech-t1059",
  T1078: "tech-t1078",
  "T1071.001": "tech-t1071",
  T1071: "tech-t1071",
  T1110: "tech-t1110",
  "T1021.002": "tech-t1021",
  T1021: "tech-t1021",
};

function buildTechniqueInventory(): TechniqueInventoryRow[] {
  const buckets = new Map<
    string,
    {
      tactic: string;
      alerts: SocAlert[];
    }
  >();

  for (const alert of socAlerts) {
    const technique = alert.mitreTechnique;
    if (!technique) continue;
    const key = technique;
    const bucket = buckets.get(key) ?? {
      tactic: alert.mitreTactic ?? "Unknown",
      alerts: [],
    };
    bucket.alerts.push(alert);
    if (alert.mitreTactic) bucket.tactic = alert.mitreTactic;
    buckets.set(key, bucket);
  }

  const rows: TechniqueInventoryRow[] = [];
  let index = 0;
  for (const [techniqueId, bucket] of buckets) {
    const open = bucket.alerts.filter((a) => openStatuses(a.status));
    const newest = bucket.alerts.reduce((best, alert) =>
      alert.ageMinutes < best.ageMinutes ? alert : best,
    );
    const baseId = baseTechniqueId(techniqueId);
    const name =
      techniqueNameById[techniqueId] ??
      techniqueNameById[baseId] ??
      newest.ruleName.split("·").pop()?.trim() ??
      techniqueId;

    rows.push({
      id: techniqueId,
      name,
      tactic: bucket.tactic,
      detections: bucket.alerts.length,
      severity: rollupSeverity(open.length > 0 ? open : bucket.alerts),
      trend: trendForCount(bucket.alerts.length, index),
      lastSeen: newest.lastSeenLabel || newest.ageLabel,
      lastSeenMinutes: newest.ageMinutes,
      summary:
        techniqueSummaries[techniqueId] ??
        techniqueSummaries[baseId] ??
        newest.summary,
      graphNodeId:
        techniqueGraphIdByTechnique[techniqueId] ??
        techniqueGraphIdByTechnique[baseId],
      openAlertCount: open.length,
    });
    index += 1;
  }

  return rows.sort((a, b) => {
    const sev = severityWeight[b.severity] - severityWeight[a.severity];
    if (sev !== 0) return sev;
    return b.detections - a.detections;
  });
}

export const techniqueInventory: TechniqueInventoryRow[] =
  buildTechniqueInventory();

export function getThreatGraphNode(id: string) {
  return graphNodeById.get(id) ?? null;
}

export function getConnectedNodeIds(nodeId: string): Set<string> {
  const connected = new Set<string>([nodeId]);
  for (const edge of threatGraphEdges) {
    if (edge.from === nodeId) connected.add(edge.to);
    if (edge.to === nodeId) connected.add(edge.from);
  }
  return connected;
}

export function getCriticalChainCount() {
  return threatGraphEdges.filter((edge) => edge.tone === "critical").length;
}

export function getThreatAnalyticsKpis(): ThreatAnalyticsKpi[] {
  const activeTechniques = techniqueInventory.filter(
    (row) => row.openAlertCount > 0,
  ).length;
  const criticalChains = getCriticalChainCount();
  const exposedIdentities = threatGraphNodes.filter(
    (node) =>
      node.kind === "identity" &&
      (node.severity === "critical" || node.severity === "high"),
  ).length;
  const openRelatedAlerts = new Set(
    threatGraphNodes.flatMap((node) => node.linkedAlertIds),
  );
  let openCount = 0;
  for (const alertId of openRelatedAlerts) {
    const alert = getAlertById(alertId);
    if (alert && openStatuses(alert.status)) openCount += 1;
  }

  return [
    {
      key: "active-techniques",
      title: "Active techniques",
      value: String(activeTechniques),
      context: "With open detections",
    },
    {
      key: "critical-chains",
      title: "Critical chains",
      value: String(criticalChains),
      context: `${threatGraphNodes.length} nodes · ${threatGraphEdges.length} edges`,
    },
    {
      key: "exposed-identities",
      title: "Exposed identities",
      value: String(exposedIdentities),
      context: "On critical/high paths",
    },
    {
      key: "open-alerts",
      title: "Open related alerts",
      value: String(openCount),
      context: "Linked to mapped threats",
    },
  ];
}

function relatedIncidentsForAlerts(alertIds: string[]): SocIncident[] {
  if (alertIds.length === 0) return [];
  const matches = socIncidents.filter((incident) => {
    const hay = `${incident.title} ${incident.summary} ${incident.mitreTechnique ?? ""} ${incident.mitreTactic ?? ""}`.toLowerCase();
    return alertIds.some((id) => {
      const alert = getAlertById(id);
      if (!alert) return false;
      if (incident.mitreTechnique && alert.mitreTechnique) {
        return (
          baseTechniqueId(incident.mitreTechnique) ===
          baseTechniqueId(alert.mitreTechnique)
        );
      }
      return hay.includes((alert.mitreTactic ?? "").toLowerCase());
    });
  });
  return matches.slice(0, 5);
}

export function getNodeDetail(nodeId: string): ThreatNodeDetail | null {
  const node = getThreatGraphNode(nodeId);
  if (!node) return null;

  const neighbors: ThreatNodeDetail["neighbors"] = [];
  for (const edge of threatGraphEdges) {
    if (edge.from === nodeId) {
      const target = getThreatGraphNode(edge.to);
      if (target) {
        neighbors.push({
          node: target,
          relation: edge.relation,
          direction: "out",
        });
      }
    }
    if (edge.to === nodeId) {
      const source = getThreatGraphNode(edge.from);
      if (source) {
        neighbors.push({
          node: source,
          relation: edge.relation,
          direction: "in",
        });
      }
    }
  }

  const alerts = node.linkedAlertIds
    .map((id) => getAlertById(id))
    .filter((alert): alert is SocAlert => Boolean(alert));

  const incidentIds = new Set(node.linkedIncidentIds);
  const fromAlerts = relatedIncidentsForAlerts(node.linkedAlertIds);
  for (const incident of fromAlerts) incidentIds.add(incident.id);

  const incidents = Array.from(incidentIds)
    .map((id) => getIncidentById(id))
    .filter((incident): incident is SocIncident => Boolean(incident));

  const identity =
    getLinkedIdentity(node.linkedIdentityId) ??
    (node.kind === "identity"
      ? assetIdentities.find((item) => item.id === node.linkedIdentityId) ??
        null
      : null);

  return { node, neighbors, alerts, incidents, identity };
}

export function getTechniqueDetail(
  techniqueId: string,
): ThreatNodeDetail | null {
  const row = techniqueInventory.find((item) => item.id === techniqueId);
  if (row?.graphNodeId) {
    return getNodeDetail(row.graphNodeId);
  }

  const matching = socAlerts.filter(
    (alert) => alert.mitreTechnique === techniqueId,
  );
  const open = matching.filter((a) => openStatuses(a.status));
  const severity = rollupSeverity(open.length > 0 ? open : matching);
  const baseId = baseTechniqueId(techniqueId);

  const synthetic: ThreatGraphNode = {
    id: `inventory-${techniqueId}`,
    kind: "technique",
    label: techniqueId,
    subtitle:
      techniqueNameById[techniqueId] ?? techniqueNameById[baseId] ?? "Technique",
    severity,
    summary:
      row?.summary ??
      techniqueSummaries[techniqueId] ??
      techniqueSummaries[baseId] ??
      "Aggregated from detection catalog.",
    meta: {
      tactic: row?.tactic ?? matching[0]?.mitreTactic ?? "Unknown",
      technique: techniqueId,
      detections: matching.length,
    },
    linkedAlertIds: matching.slice(0, 8).map((alert) => alert.id),
    linkedIdentityId: matching.find((a) => a.identityId)?.identityId ?? null,
    linkedIncidentIds: [],
    huntActions: [
      "Open related alerts and validate true positives",
      "Tune or suppress noisy variants with Detection Engineering",
      "Add coverage gaps to the hunt backlog",
    ],
    x: 0,
    y: 0,
    w: 180,
  };

  const alerts = matching.slice(0, 8);
  const identity = getLinkedIdentity(synthetic.linkedIdentityId);
  const incidents = relatedIncidentsForAlerts(synthetic.linkedAlertIds);

  return {
    node: synthetic,
    neighbors: [],
    alerts,
    incidents,
    identity,
  };
}

export type ThreatAnalyticsFilters = {
  query: string;
  severities: AlertSeverity[];
  kinds: ThreatNodeKind[];
  criticalOnly: boolean;
  trendingUpOnly: boolean;
};

export const emptyThreatFilters: ThreatAnalyticsFilters = {
  query: "",
  severities: [],
  kinds: [],
  criticalOnly: false,
  trendingUpOnly: false,
};

export function filterTechniqueInventory(
  rows: TechniqueInventoryRow[],
  filters: ThreatAnalyticsFilters,
): TechniqueInventoryRow[] {
  const q = filters.query.trim().toLowerCase();
  return rows.filter((row) => {
    if (filters.criticalOnly && row.severity !== "critical") return false;
    if (filters.trendingUpOnly && row.trend !== "up") return false;
    if (
      filters.severities.length > 0 &&
      !filters.severities.includes(row.severity)
    ) {
      return false;
    }
    if (q) {
      const hay =
        `${row.id} ${row.name} ${row.tactic} ${row.summary}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function filterGraphNodes(
  nodes: ThreatGraphNode[],
  filters: ThreatAnalyticsFilters,
): ThreatGraphNode[] {
  const q = filters.query.trim().toLowerCase();
  return nodes.filter((node) => {
    if (filters.kinds.length > 0 && !filters.kinds.includes(node.kind)) {
      return false;
    }
    if (
      filters.severities.length > 0 &&
      node.severity &&
      !filters.severities.includes(node.severity)
    ) {
      return false;
    }
    if (filters.criticalOnly && node.severity !== "critical") return false;
    if (q) {
      const hay =
        `${node.label} ${node.subtitle ?? ""} ${node.kind} ${node.summary}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Prefill Investigate with a node-scoped Heimdall QL query. */
export function buildInvestigateQueryForNode(node: ThreatGraphNode): string {
  switch (node.kind) {
    case "technique": {
      const technique = String(node.meta.technique ?? node.label);
      return `events | where mitre.technique == "${technique}" | take 50`;
    }
    case "actor":
      return `events | where threat.actor == "${node.label}" or threat.actor_id == "${node.id}" | take 50`;
    case "identity": {
      const principal = String(node.subtitle ?? node.label);
      return `events | where identity.principal == "${principal}" or user.name == "${node.label}" | take 50`;
    }
    case "alert":
      return `events | where alert.id == "${node.label}" or alert.id == "${node.linkedAlertIds[0] ?? node.label}" | take 50`;
    case "vulnerability":
      return `events | where vuln.id == "${node.id}" or vuln.name contains "${node.label}" | take 50`;
    default:
      return `events | where entity.name == "${node.label}" | take 50`;
  }
}

export type HuntEntityKind = "host" | "ip" | "user" | "domain" | "ioc" | "geo";

export function buildInvestigateQueryForEntity(
  kind: HuntEntityKind,
  value: string,
): string {
  switch (kind) {
    case "host":
      return `events | where host.name == "${value}" or device.hostname == "${value}" | take 50`;
    case "ip":
      return `events | where src.ip == "${value}" or dst.ip == "${value}" | take 50`;
    case "user":
      return `events | where identity.principal == "${value}" or user.name == "${value}" | take 50`;
    case "domain":
      return `events | where dns.query == "${value}" or url.domain == "${value}" | take 50`;
    case "ioc":
      return `events | where ioc.id == "${value}" or ioc.value == "${value}" | take 50`;
    case "geo":
      return `events | where geo.label == "${value}" | take 50`;
    default:
      return `events | where entity.name == "${value}" | take 50`;
  }
}
