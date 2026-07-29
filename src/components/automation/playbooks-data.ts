import type { Edge, Node } from "@xyflow/react";

import {
  type KbProcedure,
  kbProcedures,
} from "@/components/knowledge-base/knowledge-base-data";
import {
  actionCatalog,
  getActionCatalogLabels,
} from "@/lib/mock-api/action-catalog";

export type PlaybookNodeType =
  | "trigger"
  | "enrich"
  | "condition"
  | "action"
  | "notify"
  | "end";

/** Action kinds = SOAR catalog ids (consolidator actions via upstream connectors). */
export type PlaybookActionKind = (typeof actionCatalog)[number]["id"];

export const playbookNodeTypeLabels: Record<PlaybookNodeType, string> = {
  trigger: "Trigger",
  enrich: "Enrich",
  condition: "Condition",
  action: "Action",
  notify: "Notify",
  end: "End",
};

export const playbookActionKindLabels: Record<string, string> =
  getActionCatalogLabels();

export type PlaybookNodeData = {
  label: string;
  description?: string;
  nodeType: PlaybookNodeType;
  actionKind?: PlaybookActionKind;
  config?: Record<string, string>;
};

export type PlaybookFlowNode = Node<PlaybookNodeData, PlaybookNodeType>;
export type PlaybookFlowEdge = Edge;

export type PlaybookDefinition = KbProcedure & {
  graph: {
    nodes: PlaybookFlowNode[];
    edges: PlaybookFlowEdge[];
  };
};

function node(
  id: string,
  type: PlaybookNodeType,
  x: number,
  y: number,
  label: string,
  extras?: Partial<PlaybookNodeData>,
): PlaybookFlowNode {
  return {
    id,
    type,
    position: { x, y },
    data: {
      label,
      nodeType: type,
      ...extras,
    },
  };
}

function edge(
  id: string,
  source: string,
  target: string,
  label?: string,
): PlaybookFlowEdge {
  return {
    id,
    source,
    target,
    label,
    type: "smoothstep",
  };
}

function wrap(
  procedureId: string,
  nodes: PlaybookFlowNode[],
  edges: PlaybookFlowEdge[],
): PlaybookDefinition {
  const procedure = kbProcedures.find((p) => p.id === procedureId);
  if (!procedure) {
    throw new Error(`Missing procedure ${procedureId}`);
  }
  return {
    ...procedure,
    steps: nodes.filter((n) => n.data.nodeType !== "end").length,
    graph: { nodes, edges },
  };
}

/** Seed graphs for automation center / builder (mock-only). */
const seedPlaybookDefinitions: PlaybookDefinition[] = [
  wrap(
    "proc-001",
    [
      node("n1", "trigger", 40, 160, "Ransomware alert", {
        description: "EDR ransomware / encryption spike",
        config: { source: "EDR", severity: "critical" },
      }),
      node("n2", "enrich", 260, 160, "Host + identity context", {
        description: "Pull device owner, recent logons, shares",
        actionKind: "enrich_ti",
        config: { sources: "CMDB, IdP, EDR" },
      }),
      node("n3", "condition", 480, 160, "Confirmed encryption?", {
        description: "File rename / canary wipe threshold",
        config: { threshold: "≥ 40 files / 2m" },
      }),
      node("n4", "action", 720, 60, "Isolate host", {
        actionKind: "isolate_host",
        description: "Network isolate via EDR",
        config: { mode: "full", retain: "forensic image" },
      }),
      node("n5", "action", 720, 260, "Disable identity", {
        actionKind: "disable_identity",
        description: "Revoke sessions + disable account",
        config: { forceReset: "true" },
      }),
      node("n6", "notify", 960, 160, "War room + Slack", {
        actionKind: "slack",
        description: "#inc-critical bridge",
        config: { channel: "#inc-critical", mention: "@oncall" },
      }),
      node("n7", "end", 1180, 160, "Hand off to IR", {
        description: "Continue PB-IR-01 manual steps",
      }),
    ],
    [
      edge("e1", "n1", "n2"),
      edge("e2", "n2", "n3"),
      edge("e3", "n3", "n4", "yes"),
      edge("e4", "n3", "n5", "yes"),
      edge("e5", "n4", "n6"),
      edge("e6", "n5", "n6"),
      edge("e7", "n6", "n7"),
    ],
  ),
  wrap(
    "proc-002",
    [
      node("n1", "trigger", 40, 140, "Impossible travel / MFA fatigue", {
        config: { source: "IdP", signals: "geo, MFA" },
      }),
      node("n2", "enrich", 280, 140, "Enrich identity", {
        actionKind: "enrich_ti",
        config: { lookups: "risk score, devices, apps" },
      }),
      node("n3", "condition", 520, 140, "Risk ≥ high?", {
        config: { score: "≥ 70" },
      }),
      node("n4", "action", 760, 60, "Disable identity", {
        actionKind: "disable_identity",
        config: { revokeSessions: "true", ticket: "auto" },
      }),
      node("n5", "notify", 760, 240, "Notify owner", {
        actionKind: "slack",
        config: { channel: "#identity-ops" },
      }),
      node("n6", "action", 1000, 140, "Open Jira", {
        actionKind: "jira",
        config: { project: "IR", issueType: "Identity compromise" },
      }),
      node("n7", "end", 1240, 140, "Complete", {
        description: "Analyst reviews hunt results",
      }),
    ],
    [
      edge("e1", "n1", "n2"),
      edge("e2", "n2", "n3"),
      edge("e3", "n3", "n4", "yes"),
      edge("e4", "n3", "n5", "no"),
      edge("e5", "n4", "n6"),
      edge("e6", "n5", "n6"),
      edge("e7", "n6", "n7"),
    ],
  ),
  wrap(
    "proc-003",
    [
      node("n1", "trigger", 40, 120, "Phishing report", {
        config: { source: "Mailbox / user report" },
      }),
      node("n2", "enrich", 260, 120, "URL / attachment TI", {
        actionKind: "enrich_ti",
        config: { engines: "URLScan, VT, sandbox" },
      }),
      node("n3", "condition", 500, 120, "Malicious?", {
        config: { verdict: "malicious|suspicious" },
      }),
      node("n4", "action", 740, 40, "Block indicators", {
        actionKind: "enrich_ti",
        description: "Push to email gateway + proxy",
        config: { lists: "URL, domain, hash" },
      }),
      node("n5", "notify", 740, 200, "Notify mailboxes", {
        actionKind: "slack",
        config: { template: "phishing-takedown" },
      }),
      node("n6", "action", 980, 120, "Jira takedown", {
        actionKind: "jira",
        config: { project: "DET", labels: "phishing" },
      }),
      node("n7", "end", 1220, 120, "Close triage"),
    ],
    [
      edge("e1", "n1", "n2"),
      edge("e2", "n2", "n3"),
      edge("e3", "n3", "n4", "yes"),
      edge("e4", "n3", "n5", "yes"),
      edge("e5", "n4", "n6"),
      edge("e6", "n5", "n6"),
      edge("e7", "n3", "n7", "benign"),
      edge("e8", "n6", "n7"),
    ],
  ),
  wrap(
    "proc-005",
    [
      node("n1", "trigger", 60, 140, "EDR sensor offline", {
        config: { sla: "45m" },
      }),
      node("n2", "enrich", 300, 140, "Host reachability", {
        description: "Ping / MDM / last check-in",
        config: { sources: "MDM, DHCP, EDR" },
      }),
      node("n3", "condition", 540, 140, "Host reachable?", {
        config: { checks: "network + MDM" },
      }),
      node("n4", "action", 780, 60, "Push reinstall", {
        description: "MDM remediation policy",
        config: { package: "edr-agent" },
      }),
      node("n5", "notify", 780, 240, "Escalate to endpoint ops", {
        actionKind: "slack",
        config: { channel: "#endpoint-ops" },
      }),
      node("n6", "action", 1020, 140, "Open Jira", {
        actionKind: "jira",
        config: { project: "OPS", priority: "P2" },
      }),
      node("n7", "end", 1260, 140, "Await SLA"),
    ],
    [
      edge("e1", "n1", "n2"),
      edge("e2", "n2", "n3"),
      edge("e3", "n3", "n4", "yes"),
      edge("e4", "n3", "n5", "no"),
      edge("e5", "n4", "n6"),
      edge("e6", "n5", "n6"),
      edge("e7", "n6", "n7"),
    ],
  ),
  wrap(
    "proc-006",
    [
      node("n1", "trigger", 40, 140, "New admin grant", {
        config: { source: "IdP audit" },
      }),
      node("n2", "enrich", 280, 140, "Correlate endpoint", {
        actionKind: "enrich_ti",
        config: { window: "24h" },
      }),
      node("n3", "condition", 520, 140, "Abnormal elevation?", {
        config: { baseline: "peer group" },
      }),
      node("n4", "action", 760, 40, "Disable identity", {
        actionKind: "disable_identity",
        config: { revokeTokens: "true" },
      }),
      node("n5", "action", 760, 160, "Isolate host", {
        actionKind: "isolate_host",
        config: { mode: "network" },
      }),
      node("n6", "notify", 760, 280, "Slack SOC", {
        actionKind: "slack",
        config: { channel: "#soc-escalations" },
      }),
      node("n7", "end", 1000, 140, "Analyst confirm"),
    ],
    [
      edge("e1", "n1", "n2"),
      edge("e2", "n2", "n3"),
      edge("e3", "n3", "n4", "yes"),
      edge("e4", "n3", "n5", "yes"),
      edge("e5", "n3", "n6", "yes"),
      edge("e6", "n4", "n7"),
      edge("e7", "n5", "n7"),
      edge("e8", "n6", "n7"),
      edge("e9", "n3", "n7", "no"),
    ],
  ),
  wrap(
    "proc-007",
    [
      node("n1", "trigger", 40, 140, "Beaconing detection", {
        config: { source: "NDR / proxy" },
      }),
      node("n2", "enrich", 280, 140, "Enrich TI", {
        actionKind: "enrich_ti",
        config: { iocs: "domain, IP, JA3" },
      }),
      node("n3", "condition", 520, 140, "Known C2?", {
        config: { feeds: "commercial + internal" },
      }),
      node("n4", "action", 760, 60, "Isolate host", {
        actionKind: "isolate_host",
        config: { mode: "full" },
      }),
      node("n5", "action", 760, 220, "Block indicators", {
        actionKind: "enrich_ti",
        config: { lists: "firewall, proxy" },
      }),
      node("n6", "notify", 1000, 140, "Slack + Jira", {
        actionKind: "jira",
        config: { project: "IR", notify: "#threat-hunting" },
      }),
      node("n7", "end", 1240, 140, "Hunt complete"),
    ],
    [
      edge("e1", "n1", "n2"),
      edge("e2", "n2", "n3"),
      edge("e3", "n3", "n4", "yes"),
      edge("e4", "n3", "n5", "yes"),
      edge("e5", "n4", "n6"),
      edge("e6", "n5", "n6"),
      edge("e7", "n6", "n7"),
      edge("e8", "n3", "n7", "no"),
    ],
  ),
  wrap(
    "proc-008",
    [
      node("n1", "trigger", 40, 180, "Major incident declared", {
        description: "P1 from any connected SIEM/EDR",
        config: { priority: "P1" },
      }),
      node("n2", "action", 260, 180, "Parallel fork", {
        actionKind: "parallel_fork",
        description: "Fan-out contain + notify + ITSM",
        config: { join: "all" },
      }),
      node("n3", "action", 520, 40, "Isolate host", {
        actionKind: "isolate_host",
        config: { connector: "int-crowdstrike-falcon" },
      }),
      node("n4", "action", 520, 140, "Collect forensics", {
        actionKind: "collect_forensics",
        config: { connector: "int-crowdstrike-falcon" },
      }),
      node("n5", "notify", 520, 240, "Page on-call", {
        actionKind: "pagerduty",
        config: { severity: "critical" },
      }),
      node("n6", "action", 520, 340, "Create ITSM", {
        actionKind: "itsm_create",
        config: { provider: "servicenow" },
      }),
      node("n7", "action", 780, 180, "Approval gate", {
        actionKind: "approval",
        description: "Dual-control before wider disruption",
      }),
      node("n8", "action", 1000, 100, "Wait / SLA", {
        actionKind: "wait_sla",
        config: { duration: "15m", onTimeout: "escalate" },
      }),
      node("n9", "action", 1000, 260, "Retry contain", {
        actionKind: "retry_step",
        description: "Backoff if upstream EDR action failed",
        config: { maxAttempts: "3" },
      }),
      node("n10", "action", 1220, 180, "Firewall block", {
        actionKind: "firewall_block",
        config: { connector: "int-palo-edge" },
      }),
      node("n11", "notify", 1440, 180, "War room + Slack", {
        actionKind: "war_room_post",
        config: { also: "slack:#inc-critical" },
      }),
      node("n12", "end", 1660, 180, "Hand off to IR lead"),
    ],
    [
      edge("e1", "n1", "n2"),
      edge("e2", "n2", "n3", "branch-contain"),
      edge("e3", "n2", "n4", "branch-forensics"),
      edge("e4", "n2", "n5", "branch-notify"),
      edge("e5", "n2", "n6", "branch-itsm"),
      edge("e6", "n3", "n7"),
      edge("e7", "n4", "n7"),
      edge("e8", "n5", "n7"),
      edge("e9", "n6", "n7"),
      edge("e10", "n7", "n8", "approved"),
      edge("e11", "n8", "n9"),
      edge("e12", "n9", "n10"),
      edge("e13", "n10", "n11"),
      edge("e14", "n11", "n12"),
    ],
  ),
];

/** Default graph for a newly authored playbook (trigger → action → notify → end). */
export function createBlankPlaybookGraph(): {
  nodes: PlaybookFlowNode[];
  edges: PlaybookFlowEdge[];
} {
  return {
    nodes: [
      node("n1", "trigger", 40, 160, "Alert trigger", {
        description: "Match severity, source, or MITRE technique",
        config: { severity: "high", source: "any" },
      }),
      node("n2", "enrich", 260, 160, "Enrich context", {
        description: "Pull host, identity, and TI context",
        actionKind: "enrich_ti",
        config: { depth: "standard" },
      }),
      node("n3", "condition", 480, 160, "Containment required?", {
        description: "Branch on confidence and asset criticality",
        config: { minConfidence: "70" },
      }),
      node("n4", "action", 700, 80, "Isolate host", {
        description: "EDR containment via connected connector",
        actionKind: "isolate_host",
        config: { connector: "int-defender-endpoint" },
      }),
      node("n5", "notify", 700, 240, "Notify #soc-ops", {
        actionKind: "slack",
        config: { channel: "#soc-ops" },
      }),
      node("n6", "end", 940, 160, "End"),
    ],
    edges: [
      edge("e1", "n1", "n2"),
      edge("e2", "n2", "n3"),
      edge("e3", "n3", "n4", "yes"),
      edge("e4", "n3", "n5", "no"),
      edge("e5", "n4", "n6"),
      edge("e6", "n5", "n6"),
    ],
  };
}

const EXTRA_PLAYBOOK_TITLES = [
  "Phishing mailbox quarantine",
  "BEC wire-fraud hold",
  "Impossible travel challenge",
  "Privileged session kill",
  "OAuth app revoke",
  "Cloud key rotate",
  "S3 public ACL lockdown",
  "Kubernetes pod quarantine",
  "Malicious domain blocklist",
  "DNS tunneling alert",
  "VPN geo anomaly",
  "Service account key expiry",
  "Shared mailbox takeover",
  "Token replay containment",
  "Endpoint mass-delete stop",
  "RDP brute-force lockout",
  "USB mass-storage deny",
  "Shadow IT SaaS revoke",
  "CASB exfil throttle",
  "DLP credit-card stamp",
  "Insider trading watch",
  "Third-party vendor cutover",
  "WAF rule emergency",
  "CDN cache poison purge",
  "Certificate mis-issue revoke",
  "GitHub PAT revoke",
  "CI runner isolation",
  "Container image block",
  "IAM role blast-radius cut",
  "Break-glass account review",
  "MFA fatigue challenge",
  "SIM-swap identity freeze",
  "Dark-web credential reset",
  "Stealer-log password spray",
  "C2 beacon isolate",
  "Living-off-land script stop",
  "PsExec lateral block",
  "Kerberoast ticket revoke",
  "Golden ticket reset",
  "Backup wipe prevent",
  "Shadow copy restore gate",
  "Email rule purge",
  "Forwarding rule audit",
  "Teams guest access cut",
  "SharePoint link expire",
  "OneDrive sharing lockdown",
  "Printer spooler isolate",
  "IoT camera segment",
] as const;

function cloneGraph(
  graph: PlaybookDefinition["graph"],
): PlaybookDefinition["graph"] {
  return {
    nodes: graph.nodes.map((n) => ({
      ...n,
      position: { ...n.position },
      data: {
        ...n.data,
        config: n.data.config ? { ...n.data.config } : undefined,
      },
    })),
    edges: graph.edges.map((e) => ({ ...e })),
  };
}

function expandPlaybookCatalog(
  seeds: PlaybookDefinition[],
): PlaybookDefinition[] {
  const blank = createBlankPlaybookGraph();
  const severities: KbProcedure["severity"][] = [
    "critical",
    "high",
    "medium",
    "low",
  ];
  const statuses: KbProcedure["status"][] = [
    "approved",
    "draft",
    "in-review",
    "approved",
    "approved",
  ];
  const extras: PlaybookDefinition[] = EXTRA_PLAYBOOK_TITLES.map(
    (title, index) => {
      const template = seeds[index % seeds.length]!;
      const n = seeds.length + index + 1;
      const id = `proc-${String(n).padStart(3, "0")}`;
      const severity = severities[index % severities.length]!;
      const status = statuses[index % statuses.length]!;
      const graph =
        index % 3 === 0 ? cloneGraph(blank) : cloneGraph(template.graph);
      return {
        ...template,
        id,
        code: `PB-${String(n).padStart(3, "0")}`,
        title,
        summary: `${title} — automated response path via connected connectors.`,
        severity,
        status,
        steps: graph.nodes.filter((gNode) => gNode.data.nodeType !== "end")
          .length,
        lastRunLabel: status === "draft" ? "Never" : `${(index % 12) + 1}d ago`,
        runCount: status === "draft" ? 0 : 3 + ((index * 7) % 40),
        linkedIncidentIds: [],
        linkedAlertIds: [],
        related: [],
        updatedAt: "2026-07-20",
        graph,
      };
    },
  );
  return [...seeds, ...extras];
}

const seedPlaybooks = seedPlaybookDefinitions;
export const playbookDefinitions: PlaybookDefinition[] =
  expandPlaybookCatalog(seedPlaybooks);

export function buildDraftPlaybookDefinition(input: {
  id: string;
  code: string;
  title: string;
  ownerId: string;
  summary?: string;
}): PlaybookDefinition {
  const graph = createBlankPlaybookGraph();
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: input.id,
    code: input.code,
    title: input.title,
    summary:
      input.summary ??
      "Custom response playbook authored in Heimdall Automation.",
    severity: "medium",
    status: "draft",
    ownerId: input.ownerId,
    steps: graph.nodes.filter((n) => n.data.nodeType !== "end").length,
    lastRunLabel: "Never",
    runCount: 0,
    mitreTactic: undefined,
    linkedIncidentIds: [],
    linkedAlertIds: [],
    related: [],
    updatedAt: today,
    graph,
  };
}

export function getPlaybookDefinition(id: string): PlaybookDefinition | null {
  return playbookDefinitions.find((p) => p.id === id) ?? null;
}

export function getPlaybookDefinitions(): PlaybookDefinition[] {
  return playbookDefinitions;
}

export type PlaybookListFilters = {
  q?: string;
  statuses?: KbProcedure["status"][];
};

export function filterPlaybookDefinitions(
  playbooks: PlaybookDefinition[],
  filters: PlaybookListFilters,
): PlaybookDefinition[] {
  const q = filters.q?.trim().toLowerCase() ?? "";
  return playbooks.filter((pb) => {
    if (
      filters.statuses &&
      filters.statuses.length > 0 &&
      !filters.statuses.includes(pb.status)
    ) {
      return false;
    }
    if (!q) return true;
    const hay = [pb.id, pb.code, pb.title, pb.summary, pb.mitreTactic ?? ""]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
