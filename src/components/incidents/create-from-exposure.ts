import type { SocAlert } from "@/components/alerts/alerts-data";
import { currentAnalystId } from "@/components/alerts/alerts-data";
import type { CloudFinding } from "@/components/cloud-posture/cloud-posture-data";
import type { DataSecurityFinding } from "@/components/data-security/data-security-data";
import type { Vulnerability } from "@/components/vulnerabilities/vulnerabilities-data";
import { incidentsApi } from "@/lib/mock-api/incidents";
import type { PhishMessage } from "@/lib/mock-api/phishing";

import type { SocIncident } from "./incidents-data";

function stubAlertFromExposure(input: {
  id: string;
  title: string;
  summary: string;
  severity: SocAlert["severity"];
  entityName: string;
  deviceId?: string | null;
  identityId?: string | null;
  entityType?: SocAlert["entityType"];
  sourceCategory: SocAlert["sourceCategory"];
  sourceId: string;
  sourceName: string;
  tags: string[];
}): SocAlert {
  const now = new Date().toISOString();
  return {
    id: input.id,
    title: input.title,
    summary: input.summary,
    severity: input.severity,
    status: "escalated",
    sourceId: input.sourceId,
    sourceName: input.sourceName,
    sourceCategory: input.sourceCategory,
    ruleName: "Heimdall · Exposure escalation",
    entityType:
      input.entityType ??
      (input.deviceId ? "host" : input.identityId ? "user" : "other"),
    entityName: input.entityName,
    deviceId: input.deviceId ?? null,
    identityId: input.identityId ?? null,
    assigneeId: currentAnalystId,
    createdAt: now,
    updatedAt: now,
    ageLabel: "just now",
    ageMinutes: 0,
    eventCount: 1,
    confidence: 88,
    environment: "prod",
    tags: input.tags,
    recommendedAction: "Open IR case and attach exposure evidence",
    relatedEntities: [input.entityName],
    firstSeenLabel: "just now",
    lastSeenLabel: "just now",
    riskScore: input.severity === "critical" ? 92 : 78,
  };
}

export type ExposureCaseResult = {
  incident: SocIncident;
  evidenceId: string;
  receiptId: string;
};

/** Open an IR case from a critical CSPM finding (mock, session-only). */
export async function createIncidentFromCloudFinding(
  finding: CloudFinding,
): Promise<ExposureCaseResult> {
  const stub = stubAlertFromExposure({
    id: `ALT-EXP-${finding.id}`,
    title: `CSPM · ${finding.title}`,
    summary: finding.description,
    severity: finding.severity === "low" ? "medium" : finding.severity,
    entityName: finding.resourceName,
    deviceId: finding.linkedAssetId ?? null,
    sourceCategory: "cloud",
    sourceId: `int-${finding.provider}-prod`,
    sourceName: `${finding.provider.toUpperCase()} posture`,
    tags: ["cspm", "exposure", finding.provider, finding.category],
  });

  const evidenceStub = [
    `Evidence stub · CSPM ${finding.id}`,
    `Resource: ${finding.resourceArn}`,
    finding.investigateQuery
      ? `Investigate: ${finding.investigateQuery}`
      : null,
    finding.complianceControlIds?.length
      ? `Controls: ${finding.complianceControlIds.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { incident, receipt } = await incidentsApi.createFromAlerts([stub], {
    title: `Exposure · ${finding.title}`,
    summary: `Case opened from critical cloud posture finding ${finding.id}. ${finding.description}`,
    severity: finding.severity === "critical" ? "critical" : "high",
    tags: ["cspm", "exposure", finding.provider],
    notes: evidenceStub,
    escalatedFromAlerts: false,
    deviceId: finding.linkedAssetId ?? null,
    entityName: finding.resourceName,
    entityType: finding.linkedAssetId ? "host" : "other",
    primarySourceCategory: "cloud",
    storyClass: "cloud-privilege",
  });

  return {
    incident,
    evidenceId: `ev-cspm-${finding.id}`,
    receiptId: receipt.id,
  };
}

/** Open an IR case from a critical vulnerability finding (mock, session-only). */
export async function createIncidentFromVulnerability(
  vulnerability: Vulnerability,
): Promise<ExposureCaseResult> {
  const primaryDevice = vulnerability.exposedDevices[0];
  const stub = stubAlertFromExposure({
    id:
      vulnerability.linkedAlertIds[0] ??
      `ALT-EXP-${vulnerability.id}`,
    title: `Vuln · ${vulnerability.cve} · ${vulnerability.title}`,
    summary: vulnerability.summary,
    severity: vulnerability.severity,
    entityName: primaryDevice?.name ?? vulnerability.cve,
    deviceId: primaryDevice?.deviceId ?? null,
    sourceCategory: vulnerability.scope === "cloud" ? "cloud" : "endpoint",
    sourceId: "int-defender-vuln",
    sourceName: "Vulnerability management",
    tags: ["vuln", "exposure", vulnerability.cve, ...vulnerability.tags],
  });

  const evidenceStub = [
    `Evidence stub · ${vulnerability.cve}`,
    `SOC priority: ${vulnerability.socPriority}`,
    `Exposed devices: ${vulnerability.exposedDeviceCount}`,
    vulnerability.investigateQuery
      ? `Investigate: ${vulnerability.investigateQuery}`
      : null,
    vulnerability.complianceControlIds?.length
      ? `Controls: ${vulnerability.complianceControlIds.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { incident, receipt } = await incidentsApi.createFromAlerts([stub], {
    title: `Exposure · ${vulnerability.cve}`,
    summary: `Case opened from critical vulnerability ${vulnerability.cve}. ${vulnerability.summary}`,
    severity: vulnerability.severity === "critical" ? "critical" : "high",
    tags: ["vuln", "exposure", vulnerability.cve],
    notes: evidenceStub,
    escalatedFromAlerts: vulnerability.linkedAlertIds.length > 0,
    alertIds:
      vulnerability.linkedAlertIds.length > 0
        ? vulnerability.linkedAlertIds
        : [stub.id],
    deviceId: primaryDevice?.deviceId ?? null,
    entityName: primaryDevice?.name ?? vulnerability.cve,
    entityType: "host",
    storyClass: "malware-execution",
  });

  return {
    incident,
    evidenceId: `ev-vuln-${vulnerability.id}`,
    receiptId: receipt.id,
  };
}

/** Open an IR case from a DLP/CASB finding (mock, session-only). */
export async function createIncidentFromDataSecurityFinding(
  finding: DataSecurityFinding,
): Promise<ExposureCaseResult> {
  const stub = stubAlertFromExposure({
    id: `ALT-DS-${finding.id}`,
    title: `${finding.kind.toUpperCase()} · ${finding.title}`,
    summary: finding.summary,
    severity: finding.severity === "low" ? "medium" : finding.severity,
    entityName: finding.identityLabel,
    identityId: finding.identityId,
    entityType: "user",
    sourceCategory: finding.kind === "casb" ? "cloud" : "identity",
    sourceId: finding.sourceId,
    sourceName: finding.sourceName,
    tags: [
      "data-security",
      finding.kind,
      finding.dataClass,
      finding.channel,
    ],
  });

  const evidenceStub = [
    `Evidence stub · ${finding.kind.toUpperCase()} ${finding.id}`,
    `Identity: ${finding.identityLabel} (${finding.identityId})`,
    `Channel: ${finding.channel}`,
    `Data class: ${finding.dataClass}`,
    `Upstream: ${finding.sourceName} (${finding.sourceId})`,
    finding.policyId ? `Policy: ${finding.policyId}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { incident, receipt } = await incidentsApi.createFromAlerts([stub], {
    title: `Data loss · ${finding.title}`,
    summary: `Case opened from ${finding.kind.toUpperCase()} finding ${finding.id}. ${finding.summary}`,
    severity: finding.severity === "critical" ? "critical" : "high",
    tags: ["data-security", finding.kind, finding.dataClass],
    notes: evidenceStub,
    escalatedFromAlerts: false,
    identityId: finding.identityId,
    entityName: finding.identityLabel,
    entityType: "user",
    primarySourceCategory: finding.kind === "casb" ? "cloud" : "identity",
    storyClass: "c2-exfiltration",
  });

  return {
    incident,
    evidenceId: `ev-ds-${finding.id}`,
    receiptId: receipt.id,
  };
}

/** Open an IR case from a phishing / mailbox security message (mock, session-only). */
export async function createIncidentFromPhishMessage(
  message: PhishMessage,
): Promise<ExposureCaseResult> {
  const severity: SocAlert["severity"] =
    message.verdict === "malicious" || message.verdict === "bec_likely"
      ? "critical"
      : message.verdict === "suspicious"
        ? "high"
        : "medium";
  const stub = stubAlertFromExposure({
    id: message.alertId ?? `ALT-PHISH-${message.id}`,
    title: `Mailbox · ${message.subject.slice(0, 72)}`,
    summary: `Phishing message from ${message.from} to ${message.to.join(", ")}. Verdict ${message.verdict} (${Math.round(message.confidence * 100)}%).`,
    severity,
    entityName: message.to[0] ?? message.from,
    entityType: "user",
    sourceCategory: "siem",
    sourceId:
      message.source === "user_report" ? "int-mdo-email" : "int-proofpoint",
    sourceName:
      message.source === "user_report"
        ? "Microsoft Defender for Office 365"
        : "Proofpoint",
    tags: [
      "phishing",
      "mailbox",
      message.campaignId,
      ...message.tags.slice(0, 4),
    ],
  });

  const evidenceStub = [
    `Evidence stub · phish ${message.id}`,
    `Subject: ${message.subject}`,
    `From: ${message.from}`,
    `To: ${message.to.join(", ")}`,
    `Campaign: ${message.campaignName} (${message.campaignId})`,
    `Source: ${message.source}`,
    message.urls[0] ? `URL: ${message.urls[0].url}` : null,
    message.attachments[0]
      ? `Attachment: ${message.attachments[0].name} ${message.attachments[0].sha256}`
      : null,
    message.headersPreview
      ? `Headers:\n${message.headersPreview}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { incident, receipt } = await incidentsApi.createFromAlerts([stub], {
    title: message.isBec
      ? `BEC · ${message.subject.slice(0, 64)}`
      : `Phishing · ${message.subject.slice(0, 64)}`,
    summary: `Case opened from mailbox security message ${message.id}. ${message.subject}`,
    severity: severity === "critical" ? "critical" : "high",
    tags: ["phishing", "mailbox", ...(message.isBec ? ["bec"] : [])],
    notes: evidenceStub,
    escalatedFromAlerts: Boolean(message.alertId),
    alertIds: message.alertId ? [message.alertId] : [stub.id],
    entityName: message.to[0] ?? message.from,
    entityType: "user",
    primarySourceCategory: "siem",
    storyClass: "bec-phishing",
  });

  return {
    incident,
    evidenceId: `ev-phish-${message.id}`,
    receiptId: receipt.id,
  };
}
