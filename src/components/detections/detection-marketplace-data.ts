import type { AlertSeverity } from "@/components/alerts/alerts-data";
import {
  buildBlankDetection,
  type DetectionLineageSource,
  type DetectionRule,
} from "@/components/detections/detections-data";

export type DetectionPack = {
  id: string;
  name: string;
  vendor: string;
  description: string;
  ruleCount: number;
  tactics: string[];
  severityFocus: "critical" | "high" | "mixed";
  updatedLabel: string;
};

/** Seed packs — total claimed rules ≥ 200. */
export const detectionPacks: DetectionPack[] = [
  {
    id: "pack-microsoft-xdr",
    name: "Microsoft XDR core",
    vendor: "Microsoft",
    description: "Defender endpoint + identity + Office detections.",
    ruleCount: 48,
    tactics: ["Initial Access", "Execution", "Persistence"],
    severityFocus: "high",
    updatedLabel: "Jul 12, 2026",
  },
  {
    id: "pack-crowdstrike",
    name: "CrowdStrike Falcon pack",
    vendor: "CrowdStrike",
    description: "Process, script, and lateral movement coverage.",
    ruleCount: 36,
    tactics: ["Execution", "Lateral Movement", "Defense Evasion"],
    severityFocus: "critical",
    updatedLabel: "Jul 8, 2026",
  },
  {
    id: "pack-okta-identity",
    name: "Okta identity threats",
    vendor: "Okta",
    description: "Impossible travel, MFA fatigue, and session abuse.",
    ruleCount: 22,
    tactics: ["Credential Access", "Initial Access"],
    severityFocus: "high",
    updatedLabel: "Jun 30, 2026",
  },
  {
    id: "pack-aws-cloudtrail",
    name: "AWS CloudTrail abuse",
    vendor: "AWS",
    description: "Privilege escalation and exfiltration via cloud APIs.",
    ruleCount: 28,
    tactics: ["Privilege Escalation", "Exfiltration", "Discovery"],
    severityFocus: "mixed",
    updatedLabel: "Jul 2, 2026",
  },
  {
    id: "pack-ransomware",
    name: "Ransomware precursors",
    vendor: "Svalbard",
    description: "Shadow copy delete, encryption prep, and C2 staging.",
    ruleCount: 18,
    tactics: ["Impact", "Command and Control"],
    severityFocus: "critical",
    updatedLabel: "Jul 18, 2026",
  },
  {
    id: "pack-email-phish",
    name: "Email & phishing",
    vendor: "Proofpoint / MDO",
    description: "BEC patterns, lure domains, and mailbox rules.",
    ruleCount: 24,
    tactics: ["Initial Access", "Collection"],
    severityFocus: "mixed",
    updatedLabel: "Jul 5, 2026",
  },
  {
    id: "pack-network-ndr",
    name: "NDR / DNS anomalies",
    vendor: "Palo Alto / Cloudflare",
    description: "Beaconing, DNS tunneling, and rare ASN egress.",
    ruleCount: 16,
    tactics: ["Command and Control", "Exfiltration"],
    severityFocus: "high",
    updatedLabel: "Jun 22, 2026",
  },
  {
    id: "pack-mitre-baseline",
    name: "ATT&CK baseline",
    vendor: "Svalbard",
    description: "Broad technique coverage for SOC starter tenants.",
    ruleCount: 40,
    tactics: ["Execution", "Persistence", "Discovery", "Collection"],
    severityFocus: "mixed",
    updatedLabel: "Jul 20, 2026",
  },
];

const techniquesByTactic: Record<string, string[]> = {
  "Initial Access": ["T1566", "T1190", "T1133", "T1078", "T1189"],
  Execution: ["T1059", "T1204", "T1047", "T1053", "T1106"],
  Persistence: ["T1547", "T1136", "T1098", "T1053", "T1543"],
  "Privilege Escalation": ["T1548", "T1068", "T1134", "T1078"],
  "Defense Evasion": ["T1027", "T1562", "T1070", "T1112", "T1036"],
  "Credential Access": ["T1110", "T1003", "T1550", "T1556", "T1621"],
  Discovery: ["T1087", "T1046", "T1082", "T1018", "T1482"],
  "Lateral Movement": ["T1021", "T1570", "T1550", "T1210"],
  Collection: ["T1114", "T1005", "T1560", "T1530"],
  "Command and Control": ["T1071", "T1573", "T1105", "T1090", "T1568"],
  Exfiltration: ["T1048", "T1567", "T1537", "T1020"],
  Impact: ["T1486", "T1490", "T1489", "T1491"],
};

const ruleStems = [
  "Anomalous process chain",
  "Rare auth geography",
  "Privileged API burst",
  "Suspicious script host",
  "Mailbox forward rule",
  "DNS tunneling score",
  "Shadow copy delete",
  "Token theft pattern",
  "Living-off-the-land binary",
  "Novel ASN egress",
  "Mass file rename",
  "Service account misuse",
  "Encoded PowerShell",
  "Impossible travel",
  "MFA fatigue burst",
  "Public bucket ACL",
  "C2 beacon jitter",
  "BEC vendor spoof",
  "Scheduled task persistence",
  "Kerberos ticket anomaly",
];

const packSourcePools: Record<string, string[]> = {
  "pack-microsoft-xdr": [
    "int-defender-endpoint",
    "int-sentinel-workspace",
    "int-okta-workforce",
  ],
  "pack-crowdstrike": [
    "int-crowdstrike-falcon",
    "int-splunk-core",
    "int-defender-endpoint",
  ],
  "pack-okta-identity": [
    "int-okta-workforce",
    "int-sentinel-workspace",
    "int-splunk-core",
  ],
  "pack-aws-cloudtrail": [
    "int-aws-prod",
    "int-chronicle-secops",
    "int-splunk-core",
  ],
  "pack-ransomware": [
    "int-crowdstrike-falcon",
    "int-defender-endpoint",
    "int-splunk-core",
  ],
  "pack-email-phish": [
    "int-sentinel-workspace",
    "int-okta-workforce",
    "int-elastic-security",
  ],
  "pack-network-ndr": [
    "int-palo-edge",
    "int-splunk-core",
    "int-chronicle-secops",
  ],
  "pack-mitre-baseline": [
    "int-splunk-core",
    "int-sentinel-workspace",
    "int-elastic-security",
  ],
};

function lineageForVendor(vendor: string): DetectionLineageSource {
  const lower = vendor.toLowerCase();
  if (lower.includes("microsoft") || lower.includes("mdo")) return "sentinel";
  if (lower.includes("elastic")) return "elastic";
  if (lower.includes("crowdstrike") || lower.includes("splunk")) return "splunk";
  if (lower.includes("svalbard")) return "heimdall";
  return "heimdall";
}

function severityForPack(
  pack: DetectionPack,
  index: number,
): AlertSeverity {
  if (pack.severityFocus === "critical") {
    return index % 5 === 0 ? "high" : "critical";
  }
  if (pack.severityFocus === "high") {
    return index % 4 === 0 ? "critical" : index % 3 === 0 ? "medium" : "high";
  }
  const cycle: AlertSeverity[] = ["critical", "high", "medium", "low"];
  return cycle[index % cycle.length]!;
}

export function getDetectionPacksTotalRules() {
  return detectionPacks.reduce((sum, pack) => sum + pack.ruleCount, 0);
}

export function getDetectionPackById(id: string) {
  return detectionPacks.find((pack) => pack.id === id) ?? null;
}

/**
 * Materialize a marketplace pack into runtime DetectionRule rows (mock).
 * IDs are placeholders — session assigner rewrites them via nextDetectionId.
 */
export function materializePackRules(pack: DetectionPack): DetectionRule[] {
  const sources =
    packSourcePools[pack.id] ??
    (["int-splunk-core", "int-sentinel-workspace"] as string[]);
  const lineageSource = lineageForVendor(pack.vendor);
  const now = new Date().toISOString();

  return Array.from({ length: pack.ruleCount }, (_, index) => {
    const tactic = pack.tactics[index % pack.tactics.length]!;
    const techPool = techniquesByTactic[tactic] ?? ["T1059"];
    const technique = techPool[index % techPool.length]!;
    const stem = ruleStems[index % ruleStems.length]!;
    const name = `${pack.vendor} · ${stem} · ${technique}`;
    const severity = severityForPack(pack, index);
    const secondary =
      index % 6 === 0 ? techPool[(index + 1) % techPool.length]! : null;

    return buildBlankDetection({
      id: `DET-PACK-${pack.id}-${String(index + 1).padStart(3, "0")}`,
      name,
      status: "experimental",
      severity,
      mitreTactic: tactic,
      mitreTechnique: technique,
      mitreTechniques: secondary ? [technique, secondary] : [technique],
      lastTriggeredAt: now,
      alertCount: 0,
      summary: `Staged from marketplace pack “${pack.name}” (${pack.vendor}). Ready for corpus test + SIEM deploy.`,
      linkedAlertIds: [],
      lineageSource,
      enabledSourceIds: [...sources],
      deployState: "staged",
      deployedSourceIds: [],
      lastDeployAt: null,
      deployVersion: 0,
      deployHistory: [],
    });
  });
}
