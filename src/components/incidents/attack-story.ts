import {
  alertSourceCategoryLabels,
  getLinkedDevice,
  getLinkedIdentity,
  type SocAlert,
} from "@/components/alerts/alerts-data";

import type { SocIncident } from "./incidents-data";

export type AttackStoryClass =
  | "identity-compromise"
  | "ransomware"
  | "lateral-movement"
  | "c2-exfiltration"
  | "cloud-privilege"
  | "bec-phishing"
  | "malware-execution"
  | "generic";

export type AttackStoryNodeKind =
  | "user"
  | "host"
  | "ip"
  | "cloud"
  | "app"
  | "technique"
  | "alert";

export type AttackStoryRelation =
  | "observed_on"
  | "authenticates"
  | "queries"
  | "registers"
  | "moves_to"
  | "precedes"
  | "uses"
  | "targets";

export type AttackStoryActionKind =
  | "isolate-host"
  | "disable-identity"
  | "require-mfa"
  | "revoke-sessions"
  | "collect-forensics"
  | "purge-mailbox"
  | "block-url";

export type AttackStoryNode = {
  id: string;
  kind: AttackStoryNodeKind;
  label: string;
  subtitle?: string;
  refId?: string;
  x: number;
  y: number;
  w: number;
};

export type AttackStoryEdge = {
  id: string;
  from: string;
  to: string;
  relation: AttackStoryRelation;
  tone?: "default" | "critical";
};

export type AttackStoryAction = {
  id: string;
  kind: AttackStoryActionKind;
  label: string;
  targetId: string;
  targetLabel: string;
};

export type AttackStoryDisruptionStatus = "none" | "recommended" | "executed";

export type AttackStory = {
  incidentId: string;
  storyClass: AttackStoryClass;
  storyClassLabel: string;
  alertCategories: { key: string; label: string; count: number }[];
  alertTimeline: {
    alertId: string;
    at: string;
    title: string;
    category: string;
    severity: SocAlert["severity"];
  }[];
  entities: AttackStoryNode[];
  edges: AttackStoryEdge[];
  priorityAssessment: number;
  notableAlertTypes: string[];
  mitreHighlights: { tactic: string; technique: string }[];
  disruption: {
    eligible: boolean;
    status: AttackStoryDisruptionStatus;
    summary: string;
    actions: AttackStoryAction[];
  };
  recommendedPlaybookCode: string | null;
};

export const attackStoryClassLabels: Record<AttackStoryClass, string> = {
  "identity-compromise": "Identity compromise",
  ransomware: "Ransomware",
  "lateral-movement": "Lateral movement",
  "c2-exfiltration": "C2 / exfiltration",
  "cloud-privilege": "Cloud privilege escalation",
  "bec-phishing": "BEC / phishing",
  "malware-execution": "Malware / execution",
  generic: "Generic investigation",
};

export const attackStoryRelationLabels: Record<AttackStoryRelation, string> = {
  observed_on: "observed on",
  authenticates: "authenticates",
  queries: "queries",
  registers: "registers",
  moves_to: "moves to",
  precedes: "precedes",
  uses: "uses",
  targets: "targets",
};

export const attackStoryNodeKindLabels: Record<AttackStoryNodeKind, string> = {
  user: "Identity",
  host: "Host",
  ip: "IP",
  cloud: "Cloud",
  app: "Application",
  technique: "Technique",
  alert: "Alert",
};

const playbookByClass: Record<AttackStoryClass, string | null> = {
  "identity-compromise": "PB-IR-04",
  ransomware: "PB-IR-01",
  "lateral-movement": "PB-IR-11",
  "c2-exfiltration": "PB-DET-08",
  "cloud-privilege": "PB-IR-11",
  "bec-phishing": "PB-DET-02",
  "malware-execution": "PB-IR-01",
  generic: "PB-OPS-01",
};

type ClassTemplate = {
  notableAlertTypes: string[];
  disruptionSummary: string;
  mitreFallback: { tactic: string; technique: string }[];
};

const classTemplates: Record<AttackStoryClass, ClassTemplate> = {
  "identity-compromise": {
    notableAlertTypes: [
      "Anomalous OAuth / device code authentication",
      "Identity risk elevation",
      "Suspicious directory or Graph API activity",
    ],
    disruptionSummary:
      "High-confidence identity abuse — contain the account, revoke sessions, and require MFA.",
    mitreFallback: [
      { tactic: "Credential Access", technique: "T1528" },
      { tactic: "Persistence", technique: "T1098.005" },
    ],
  },
  ransomware: {
    notableAlertTypes: [
      "Ransomware behavior cluster",
      "Mass file encryption pattern",
      "Shadow copy / backup deletion",
    ],
    disruptionSummary:
      "Ransomware staging indicators — isolate affected hosts immediately and preserve forensic evidence.",
    mitreFallback: [
      { tactic: "Impact", technique: "T1486" },
      { tactic: "Inhibit System Recovery", technique: "T1490" },
    ],
  },
  "lateral-movement": {
    notableAlertTypes: [
      "Admin share / remote service burst",
      "Privileged logon from atypical host",
      "Credential dumping precursor",
    ],
    disruptionSummary:
      "Active lateral movement path — isolate jump hosts and disable compromised identities.",
    mitreFallback: [
      { tactic: "Lateral Movement", technique: "T1021.002" },
      { tactic: "Credential Access", technique: "T1003" },
    ],
  },
  "c2-exfiltration": {
    notableAlertTypes: [
      "Suspected C2 beacon",
      "DNS tunneling / atypical egress",
      "Large outbound data transfer",
    ],
    disruptionSummary:
      "Command-and-control or exfiltration path — isolate beacons and block egress destinations.",
    mitreFallback: [
      { tactic: "Command and Control", technique: "T1071.001" },
      { tactic: "Exfiltration", technique: "T1048" },
    ],
  },
  "cloud-privilege": {
    notableAlertTypes: [
      "Privileged policy / role attachment",
      "Shadow admin path",
      "Atypical cloud control-plane activity",
    ],
    disruptionSummary:
      "Cloud privilege escalation — revoke elevated grants and lock the initiating identity.",
    mitreFallback: [
      { tactic: "Privilege Escalation", technique: "T1078.004" },
      { tactic: "Persistence", technique: "T1098" },
    ],
  },
  "bec-phishing": {
    notableAlertTypes: [
      "Phishing / impersonation lure",
      "Mailbox rule or forwarding anomaly",
      "Executive-targeted delivery",
    ],
    disruptionSummary:
      "Business email compromise indicators — contain mailboxes and revoke OAuth/session grants.",
    mitreFallback: [
      { tactic: "Initial Access", technique: "T1566" },
      { tactic: "Collection", technique: "T1114" },
    ],
  },
  "malware-execution": {
    notableAlertTypes: [
      "Suspicious script / LOLBin execution",
      "Unsigned binary or driver load",
      "Process injection / defense evasion",
    ],
    disruptionSummary:
      "Malicious execution on endpoint — isolate the host and collect volatile evidence.",
    mitreFallback: [
      { tactic: "Execution", technique: "T1059" },
      { tactic: "Defense Evasion", technique: "T1055" },
    ],
  },
  generic: {
    notableAlertTypes: [
      "Correlated multi-source detections",
      "Elevated risk on primary entity",
    ],
    disruptionSummary:
      "Review linked entities and apply containment when blast radius is confirmed.",
    mitreFallback: [],
  },
};

function haystack(incident: SocIncident, alerts: SocAlert[]): string {
  return [
    incident.title,
    incident.summary,
    ...(incident.tags ?? []),
    incident.mitreTactic ?? "",
    incident.mitreTechnique ?? "",
    ...alerts.flatMap((a) => [
      a.title,
      a.ruleName,
      a.summary,
      a.mitreTactic ?? "",
      a.mitreTechnique ?? "",
      ...a.tags,
    ]),
  ]
    .join(" ")
    .toLowerCase();
}

export function classifyIncidentStory(
  incident: SocIncident,
  alerts: SocAlert[],
): AttackStoryClass {
  if (incident.storyClass) return incident.storyClass;

  const text = haystack(incident, alerts);
  const tactic = (incident.mitreTactic ?? "").toLowerCase();
  const categories = new Set(alerts.map((a) => a.sourceCategory));

  if (
    /ransomware|encrypt|ransom|shadow.?copy|note.?file/.test(text) ||
    tactic === "impact"
  ) {
    return "ransomware";
  }
  if (
    /lateral|admin.?share|smb|psexec|wmi|pass.?the.?hash|jump.?host|domain.?controller/.test(
      text,
    ) ||
    tactic === "lateral movement"
  ) {
    return "lateral-movement";
  }
  if (
    /beacon|c2|command.?and.?control|dns.?tunnel|exfil|tor.?egress|data.?exfiltration/.test(
      text,
    ) ||
    tactic === "command and control" ||
    tactic === "exfiltration"
  ) {
    return "c2-exfiltration";
  }
  if (
    /oauth|device.?code|mfa.?fatigue|impossible.?travel|credential.?stuff|password.?spray|token.?theft|identity.?risk|entra|okta/.test(
      text,
    ) ||
    (categories.has("identity") &&
      (tactic === "credential access" || tactic === "initial access"))
  ) {
    return "identity-compromise";
  }
  if (
    /bec|business.?email|phish|mailbox|spoof|executive/.test(text) ||
    /phish/.test(text)
  ) {
    return "bec-phishing";
  }
  if (
    /shadow.?admin|privilege.?escal|policy.?attach|iam|sts|role.?assumption|kms.?policy/.test(
      text,
    ) ||
    tactic === "privilege escalation" ||
    (categories.has("cloud") && /admin|role|policy/.test(text))
  ) {
    return "cloud-privilege";
  }
  if (
    /powershell|lolbin|macro|malware|lsass|unsigned.?driver|download.?cradle|execution/.test(
      text,
    ) ||
    tactic === "execution" ||
    categories.has("endpoint")
  ) {
    return "malware-execution";
  }
  return "generic";
}

function alertCategoryKey(alert: SocAlert): { key: string; label: string } {
  if (alert.mitreTactic) {
    return {
      key: `tactic:${alert.mitreTactic}`,
      label: alert.mitreTactic,
    };
  }
  return {
    key: `source:${alert.sourceCategory}`,
    label: alertSourceCategoryLabels[alert.sourceCategory],
  };
}

function looksLikeIp(value: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(value.trim());
}

function scorePriority(
  incident: SocIncident,
  alerts: SocAlert[],
  storyClass: AttackStoryClass,
): number {
  let score = Math.max(incident.riskScore, 40);
  if (alerts.length > 1) score += Math.min(18, (alerts.length - 1) * 6);
  if (incident.identityId) score += 6;
  if (incident.deviceId) score += 6;
  const highImpact: AttackStoryClass[] = [
    "ransomware",
    "identity-compromise",
    "lateral-movement",
    "c2-exfiltration",
  ];
  if (highImpact.includes(storyClass)) score += 10;
  if (incident.severity === "critical") score += 8;
  else if (incident.severity === "high") score += 4;
  return Math.min(100, Math.round(score));
}

function buildGraph(
  incident: SocIncident,
  alerts: SocAlert[],
  storyClass: AttackStoryClass,
): { entities: AttackStoryNode[]; edges: AttackStoryEdge[] } {
  const entities: AttackStoryNode[] = [];
  const edges: AttackStoryEdge[] = [];
  const seen = new Set<string>();

  const addNode = (node: AttackStoryNode) => {
    if (seen.has(node.id)) return;
    seen.add(node.id);
    entities.push(node);
  };

  const identity = getLinkedIdentity(incident.identityId);
  const device = getLinkedDevice(incident.deviceId);

  const identityNodeId = identity
    ? `user:${identity.id}`
    : incident.entityType === "user"
      ? `user:entity:${incident.entityName}`
      : null;
  const hostNodeId = device
    ? `host:${device.id}`
    : incident.entityType === "host"
      ? `host:entity:${incident.entityName}`
      : null;

  if (identity || incident.entityType === "user") {
    addNode({
      id: identityNodeId!,
      kind: "user",
      label: identity?.displayName ?? incident.entityName,
      subtitle: identity?.principal ?? "Identity",
      refId: identity?.id,
      x: 40,
      y: 160,
      w: 180,
    });
  }

  if (device || incident.entityType === "host") {
    addNode({
      id: hostNodeId!,
      kind: "host",
      label: device?.hostname ?? incident.entityName,
      subtitle: device?.name ?? "Endpoint",
      refId: device?.id,
      x: 40,
      y: 40,
      w: 180,
    });
  }

  if (incident.entityType === "cloud") {
    addNode({
      id: `cloud:${incident.entityName}`,
      kind: "cloud",
      label: incident.entityName,
      subtitle: "Cloud resource",
      x: 40,
      y: 280,
      w: 180,
    });
  }

  const ipEntities = new Set<string>();
  for (const alert of alerts) {
    for (const related of alert.relatedEntities) {
      if (looksLikeIp(related)) ipEntities.add(related.trim());
    }
    if (alert.entityType === "ip") ipEntities.add(alert.entityName.trim());
  }

  let ipIndex = 0;
  for (const ip of Array.from(ipEntities).slice(0, 4)) {
    addNode({
      id: `ip:${ip}`,
      kind: "ip",
      label: ip,
      subtitle: "Observed IP",
      x: 280,
      y: 20 + ipIndex * 70,
      w: 140,
    });
    ipIndex += 1;
  }

  if (
    storyClass === "identity-compromise" ||
    storyClass === "bec-phishing" ||
    storyClass === "cloud-privilege"
  ) {
    addNode({
      id: "app:auth-broker",
      kind: "app",
      label:
        storyClass === "cloud-privilege"
          ? "Cloud control plane"
          : "Authentication broker",
      subtitle: "Identity provider / OAuth",
      x: 280,
      y: 300,
      w: 180,
    });
  }

  const techniqueKeys = new Map<string, { tactic: string; technique: string }>();
  for (const alert of alerts) {
    if (alert.mitreTechnique || alert.mitreTactic) {
      const technique =
        alert.mitreTechnique ?? alert.mitreTactic ?? "Unmapped";
      const key = `technique:${technique}`;
      if (!techniqueKeys.has(key)) {
        techniqueKeys.set(key, {
          tactic: alert.mitreTactic ?? "Unmapped",
          technique,
        });
      }
    }
  }
  if (techniqueKeys.size === 0 && incident.mitreTechnique) {
    techniqueKeys.set(`technique:${incident.mitreTechnique}`, {
      tactic: incident.mitreTactic ?? "Unmapped",
      technique: incident.mitreTechnique,
    });
  }

  let techIndex = 0;
  for (const [id, tech] of techniqueKeys) {
    addNode({
      id,
      kind: "technique",
      label: tech.technique,
      subtitle: tech.tactic,
      x: 500,
      y: 40 + techIndex * 90,
      w: 160,
    });
    techIndex += 1;
  }

  const sortedAlerts = [...alerts].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  sortedAlerts.forEach((alert, index) => {
    const alertNodeId = `alert:${alert.id}`;
    addNode({
      id: alertNodeId,
      kind: "alert",
      label: alert.title,
      subtitle: alert.ruleName,
      refId: alert.id,
      x: 720,
      y: 30 + index * 95,
      w: 200,
    });

    if (alert.identityId || identityNodeId) {
      const from =
        alert.identityId != null
          ? `user:${alert.identityId}`
          : identityNodeId;
      if (from && seen.has(from)) {
        edges.push({
          id: `e-${from}-${alertNodeId}`,
          from,
          to: alertNodeId,
          relation: "observed_on",
        });
      }
    }

    if (alert.deviceId || hostNodeId) {
      const from =
        alert.deviceId != null ? `host:${alert.deviceId}` : hostNodeId;
      if (from && seen.has(from)) {
        edges.push({
          id: `e-${from}-${alertNodeId}`,
          from,
          to: alertNodeId,
          relation: "observed_on",
        });
      }
    }

    if (alert.mitreTechnique || alert.mitreTactic) {
      const technique =
        alert.mitreTechnique ?? alert.mitreTactic ?? "Unmapped";
      const techId = `technique:${technique}`;
      if (seen.has(techId)) {
        edges.push({
          id: `e-${techId}-${alertNodeId}`,
          from: techId,
          to: alertNodeId,
          relation: "uses",
          tone: "critical",
        });
      }
    }

    for (const related of alert.relatedEntities) {
      if (!looksLikeIp(related)) continue;
      const ipId = `ip:${related.trim()}`;
      if (!seen.has(ipId)) continue;
      const primary =
        identityNodeId && seen.has(identityNodeId)
          ? identityNodeId
          : hostNodeId && seen.has(hostNodeId)
            ? hostNodeId
            : alertNodeId;
      edges.push({
        id: `e-${ipId}-${primary}`,
        from: ipId,
        to: primary,
        relation:
          storyClass === "identity-compromise" ? "authenticates" : "targets",
        tone: "critical",
      });
    }

    if (index > 0) {
      const prev = sortedAlerts[index - 1]!;
      edges.push({
        id: `e-alert-${prev.id}-${alert.id}`,
        from: `alert:${prev.id}`,
        to: alertNodeId,
        relation: "precedes",
      });
    }
  });

  if (
    identityNodeId &&
    seen.has(identityNodeId) &&
    seen.has("app:auth-broker")
  ) {
    edges.push({
      id: `e-${identityNodeId}-app`,
      from: identityNodeId,
      to: "app:auth-broker",
      relation:
        storyClass === "identity-compromise" ? "authenticates" : "queries",
      tone: "critical",
    });
  }

  if (hostNodeId && identityNodeId && seen.has(hostNodeId) && seen.has(identityNodeId)) {
    edges.push({
      id: `e-${identityNodeId}-${hostNodeId}`,
      from: identityNodeId,
      to: hostNodeId,
      relation: storyClass === "lateral-movement" ? "moves_to" : "targets",
    });
  }

  // Deduplicate edges
  const edgeSeen = new Set<string>();
  const uniqueEdges = edges.filter((edge) => {
    if (edgeSeen.has(edge.id)) return false;
    if (!seen.has(edge.from) || !seen.has(edge.to)) return false;
    edgeSeen.add(edge.id);
    return true;
  });

  return { entities, edges: uniqueEdges };
}

function buildDisruptionActions(
  incident: SocIncident,
  storyClass: AttackStoryClass,
): AttackStoryAction[] {
  const actions: AttackStoryAction[] = [];
  const identity = getLinkedIdentity(incident.identityId);
  const device = getLinkedDevice(incident.deviceId);

  if (identity) {
    actions.push({
      id: `disable-${identity.id}`,
      kind: "disable-identity",
      label: "Disable account",
      targetId: identity.id,
      targetLabel: identity.displayName,
    });
    actions.push({
      id: `mfa-${identity.id}`,
      kind: "require-mfa",
      label: "Require MFA",
      targetId: identity.id,
      targetLabel: identity.displayName,
    });
    if (
      storyClass === "identity-compromise" ||
      storyClass === "bec-phishing" ||
      storyClass === "cloud-privilege"
    ) {
      actions.push({
        id: `revoke-${identity.id}`,
        kind: "revoke-sessions",
        label: "Revoke sessions",
        targetId: identity.id,
        targetLabel: identity.displayName,
      });
    }
  }

  if (device) {
    actions.push({
      id: `isolate-${device.id}`,
      kind: "isolate-host",
      label: "Isolate host",
      targetId: device.id,
      targetLabel: device.hostname,
    });
  }

  return actions;
}

export function buildAttackStory(
  incident: SocIncident,
  alerts: SocAlert[],
): AttackStory {
  const storyClass = classifyIncidentStory(incident, alerts);
  const template = classTemplates[storyClass];
  const categoriesMap = new Map<string, { key: string; label: string; count: number }>();

  for (const alert of alerts) {
    const cat = alertCategoryKey(alert);
    const existing = categoriesMap.get(cat.key);
    if (existing) existing.count += 1;
    else categoriesMap.set(cat.key, { ...cat, count: 1 });
  }

  const alertTimeline = [...alerts]
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((alert) => {
      const cat = alertCategoryKey(alert);
      return {
        alertId: alert.id,
        at: alert.createdAt,
        title: alert.title,
        category: cat.label,
        severity: alert.severity,
      };
    });

  const { entities, edges } = buildGraph(incident, alerts, storyClass);

  const mitreHighlights: { tactic: string; technique: string }[] = [];
  const mitreSeen = new Set<string>();
  for (const alert of alerts) {
    if (!alert.mitreTactic && !alert.mitreTechnique) continue;
    const tactic = alert.mitreTactic ?? "Unmapped";
    const technique = alert.mitreTechnique ?? tactic;
    const key = `${tactic}:${technique}`;
    if (mitreSeen.has(key)) continue;
    mitreSeen.add(key);
    mitreHighlights.push({ tactic, technique });
  }
  if (mitreHighlights.length === 0) {
    mitreHighlights.push(...template.mitreFallback);
  }

  const notableFromAlerts = Array.from(
    new Set(alerts.map((a) => a.ruleName).filter(Boolean)),
  ).slice(0, 4);
  const notableAlertTypes =
    notableFromAlerts.length > 0
      ? notableFromAlerts
      : template.notableAlertTypes;

  const actions = buildDisruptionActions(incident, storyClass);
  const priorityAssessment = scorePriority(incident, alerts, storyClass);
  const eligible =
    actions.length > 0 &&
    (priorityAssessment >= 70 ||
      incident.severity === "critical" ||
      incident.severity === "high");

  const disruptionStatus: AttackStoryDisruptionStatus =
    incident.disruptionStatus ??
    (eligible ? "recommended" : actions.length > 0 ? "none" : "none");

  return {
    incidentId: incident.id,
    storyClass,
    storyClassLabel: attackStoryClassLabels[storyClass],
    alertCategories: Array.from(categoriesMap.values()).sort(
      (a, b) => b.count - a.count,
    ),
    alertTimeline,
    entities,
    edges,
    priorityAssessment,
    notableAlertTypes,
    mitreHighlights: mitreHighlights.slice(0, 5),
    disruption: {
      eligible,
      status: disruptionStatus === "executed" ? "executed" : eligible ? "recommended" : "none",
      summary: template.disruptionSummary,
      actions,
    },
    recommendedPlaybookCode: playbookByClass[storyClass],
  };
}

export function getConnectedStoryNodeIds(
  story: AttackStory,
  nodeId: string,
): Set<string> {
  const ids = new Set<string>([nodeId]);
  for (const edge of story.edges) {
    if (edge.from === nodeId) ids.add(edge.to);
    if (edge.to === nodeId) ids.add(edge.from);
  }
  return ids;
}
