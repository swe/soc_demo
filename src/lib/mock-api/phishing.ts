/**
 * Phishing & mailbox security center contract.
 * Ingest email alerts, verdicts, user-reported mail, BEC workflows.
 */

import { createIncidentFromPhishMessage } from "@/components/incidents/create-from-exposure";
import { attachEvidence } from "@/components/incidents/evidence-locker";
import type { SocIncident } from "@/components/incidents/incidents-data";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, type ListResult, makeReceipt } from "./types";

export type PhishVerdict =
  | "malicious"
  | "suspicious"
  | "benign"
  | "unknown"
  | "bec_likely";

export type PhishMessageStatus =
  | "new"
  | "triaging"
  | "remediating"
  | "resolved"
  | "false_positive";

export type PhishSource =
  | "user_report"
  | "gateway_alert"
  | "sandbox"
  | "bec_detector"
  | "auto_ingest";

export const PHISH_SOURCES: PhishSource[] = [
  "user_report",
  "gateway_alert",
  "sandbox",
  "bec_detector",
  "auto_ingest",
];

/** Real alert catalog ids used for demo cross-links. */
const LINKED_ALERT_IDS = ["ALT-2107", "ALT-2148", "ALT-2147"] as const;
/** Showcase BEC incident from the IR catalog (INC-2400 + showcase index 5). */
const SHOWCASE_BEC_INCIDENT_ID = "INC-2405";

export type PhishUrlVerdict = {
  url: string;
  verdict: PhishVerdict;
  provider: string;
  score: number;
};

export type PhishAttachmentVerdict = {
  name: string;
  sha256: string;
  verdict: PhishVerdict;
  sandboxProvider?: string;
  malwareFamily?: string;
};

export type PhishCampaign = {
  id: string;
  name: string;
};

export type PhishMessage = {
  id: string;
  subject: string;
  from: string;
  to: string[];
  reportedBy?: string;
  receivedAt: string;
  source: PhishSource;
  status: PhishMessageStatus;
  verdict: PhishVerdict;
  confidence: number;
  headersPreview: string;
  urls: PhishUrlVerdict[];
  attachments: PhishAttachmentVerdict[];
  alertId?: string;
  incidentId?: string;
  isVip: boolean;
  isBec: boolean;
  tags: string[];
  campaignId: string;
  campaignName: string;
};

export type PhishRemediationAction =
  | "purge"
  | "block_url"
  | "revoke_oauth"
  | "notify_user"
  | "escalate_bec";

export const PHISH_CAMPAIGNS: PhishCampaign[] = [
  { id: "camp-bec-wire", name: "BEC wire / CFO impersonation" },
  { id: "camp-credential-lookalike", name: "Credential harvest lookalikes" },
  { id: "camp-invoice-mule", name: "Invoice mule / AP spoof" },
  { id: "camp-package-lure", name: "Parcel / shipping lures" },
  { id: "camp-hr-benefits", name: "HR & benefits decoys" },
  { id: "camp-oauth-consent", name: "OAuth consent phishing" },
];

const messages = new Map<string, PhishMessage>();

const statuses: PhishMessageStatus[] = [
  "new",
  "triaging",
  "remediating",
  "resolved",
  "false_positive",
];
const sources: PhishSource[] = [
  "user_report",
  "gateway_alert",
  "sandbox",
  "bec_detector",
  "auto_ingest",
];
const recipients = [
  "ap@svalbard.ca",
  "ava.reed@svalbard.ca",
  "jordan.lee@svalbard.ca",
  "meera.shah@svalbard.ca",
  "ciso@svalbard.ca",
  "helpdesk@svalbard.ca",
  "finance@svalbard.ca",
  "hr@svalbard.ca",
];

const templates: Array<{
  subject: string;
  from: string;
  verdict: PhishVerdict;
  isBec: boolean;
  isVip: boolean;
  tags: string[];
  campaignId: string;
  url?: string;
  attachment?: Omit<PhishAttachmentVerdict, "sha256"> & { shaSeed: string };
}> = [
  {
    subject: "Urgent: Wire transfer approval needed — CFO",
    from: "cfo@svalbard-finance-secure.com",
    verdict: "bec_likely",
    isBec: true,
    isVip: true,
    tags: ["bec", "vip", "finance"],
    campaignId: "camp-bec-wire",
    url: "https://svalbard-finance-secure.com/approve",
  },
  {
    subject: "Your package is on hold — confirm address",
    from: "noreply@dhl-tracking-alert.net",
    verdict: "malicious",
    isBec: false,
    isVip: false,
    tags: ["credential_harvest", "sandbox"],
    campaignId: "camp-package-lure",
    url: "https://dhl-tracking-alert.net/claim",
    attachment: {
      name: "tracking_label.js",
      shaSeed: "a3f1",
      verdict: "malicious",
      sandboxProvider: "Falcon Sandbox",
      malwareFamily: "Downloader.Generic",
    },
  },
  {
    subject: "Q3 benefits enrollment reminder",
    from: "hr@svalbard.ca",
    verdict: "benign",
    isBec: false,
    isVip: false,
    tags: ["fp"],
    campaignId: "camp-hr-benefits",
    url: "https://hr.svalbard.ca/benefits",
  },
  {
    subject: "Password expiry — reset within 24h",
    from: "it-support@svalbard-it-helpdesk.com",
    verdict: "suspicious",
    isBec: false,
    isVip: false,
    tags: ["credential_harvest", "lookalike"],
    campaignId: "camp-credential-lookalike",
    url: "https://svalbard-it-helpdesk.com/reset",
  },
  {
    subject: "Invoice INV-98421 overdue",
    from: "billing@acme-vendors.io",
    verdict: "bec_likely",
    isBec: true,
    isVip: true,
    tags: ["bec", "invoice", "vip"],
    campaignId: "camp-invoice-mule",
    attachment: {
      name: "INV-98421.pdf",
      shaSeed: "b4e2",
      verdict: "suspicious",
      sandboxProvider: "URLScan",
    },
  },
  {
    subject: "SharePoint: document shared with you",
    from: "noreply@sharepoint-secure-login.net",
    verdict: "malicious",
    isBec: false,
    isVip: false,
    tags: ["oauth", "credential_harvest"],
    campaignId: "camp-oauth-consent",
    url: "https://login.microsoftonline-secure.net/common/oauth2",
  },
  {
    subject: "FedEx delivery exception — action required",
    from: "alerts@fedex-parcel-status.com",
    verdict: "malicious",
    isBec: false,
    isVip: false,
    tags: ["package", "lure"],
    campaignId: "camp-package-lure",
    url: "https://fedex-parcel-status.com/reschedule",
  },
  {
    subject: "Payroll correction — verify direct deposit",
    from: "payroll@svalbard-hr-portal.com",
    verdict: "suspicious",
    isBec: false,
    isVip: false,
    tags: ["hr", "credential_harvest"],
    campaignId: "camp-hr-benefits",
    url: "https://svalbard-hr-portal.com/dd-verify",
  },
  {
    subject: "Board packet ready for review (confidential)",
    from: "ceo.assistant@svalbard-exec.net",
    verdict: "bec_likely",
    isBec: true,
    isVip: true,
    tags: ["bec", "vip", "executive"],
    campaignId: "camp-bec-wire",
  },
  {
    subject: "Vendor W-9 update request",
    from: "ap-forms@vendor-compliance.io",
    verdict: "suspicious",
    isBec: false,
    isVip: false,
    tags: ["invoice", "form"],
    campaignId: "camp-invoice-mule",
    attachment: {
      name: "W9_update.docx",
      shaSeed: "c7a9",
      verdict: "suspicious",
      sandboxProvider: "Any.Run",
    },
  },
  {
    subject: "OneDrive sync error — reconnect account",
    from: "security@microsoft-account-alerts.com",
    verdict: "malicious",
    isBec: false,
    isVip: false,
    tags: ["oauth", "brand_spoof"],
    campaignId: "camp-oauth-consent",
    url: "https://microsoft-account-alerts.com/reconnect",
  },
  {
    subject: "MFA device re-enrollment required",
    from: "identity@svalbard-sso-help.com",
    verdict: "suspicious",
    isBec: false,
    isVip: false,
    tags: ["mfa", "lookalike"],
    campaignId: "camp-credential-lookalike",
    url: "https://svalbard-sso-help.com/mfa",
  },
];

function shaFromSeed(seed: string, index: number): string {
  const base = `${seed}${index.toString(16).padStart(4, "0")}`.repeat(8);
  return base.slice(0, 64);
}

function campaignNameFor(id: string): string {
  return PHISH_CAMPAIGNS.find((c) => c.id === id)?.name ?? id;
}

function buildSeedMessages(): PhishMessage[] {
  const now = Date.now();
  const seeds: PhishMessage[] = [];

  for (let i = 0; i < 42; i++) {
    const tpl = templates[i % templates.length]!;
    const campaign = PHISH_CAMPAIGNS.find((c) => c.id === tpl.campaignId)!;
    const to = [recipients[i % recipients.length]!];
    if (i % 5 === 0) to.push(recipients[(i + 3) % recipients.length]!);
    const status = statuses[i % statuses.length]!;
    const source = sources[i % sources.length]!;
    const wave = Math.floor(i / templates.length);
    const subject =
      wave === 0
        ? tpl.subject
        : `${tpl.subject} [${wave === 1 ? "follow-up" : `wave-${wave + 1}`}]`;
    const confidence =
      tpl.verdict === "benign"
        ? 0.78 + (i % 10) * 0.01
        : 0.62 + (i % 30) * 0.01;
    const urls: PhishUrlVerdict[] = tpl.url
      ? [
          {
            url: `${tpl.url}${wave > 0 ? `?v=${wave}` : ""}`,
            verdict: tpl.verdict === "benign" ? "benign" : tpl.verdict,
            provider: i % 2 === 0 ? "URLScan" : "VirusTotal",
            score: tpl.verdict === "benign" ? 0.05 : Math.min(0.99, confidence),
          },
        ]
      : [];
    const attachments: PhishAttachmentVerdict[] = tpl.attachment
      ? [
          {
            name:
              wave === 0
                ? tpl.attachment.name
                : tpl.attachment.name.replace(/(\.\w+)$/, `_${wave}$1`),
            sha256: shaFromSeed(tpl.attachment.shaSeed, i),
            verdict: tpl.attachment.verdict,
            sandboxProvider: tpl.attachment.sandboxProvider,
            malwareFamily: tpl.attachment.malwareFamily,
          },
        ]
      : [];

    seeds.push({
      id: `phish-${String(i + 1).padStart(3, "0")}`,
      subject,
      from: wave > 0 ? tpl.from.replace("@", `+w${wave}@`) : tpl.from,
      to,
      reportedBy:
        source === "user_report" ? recipients[(i + 1) % recipients.length] : undefined,
      receivedAt: new Date(now - 1000 * 60 * (8 + i * 37)).toISOString(),
      source,
      status:
        tpl.verdict === "benign" && status !== "false_positive"
          ? i % 2 === 0
            ? "false_positive"
            : status
          : status,
      verdict: tpl.verdict,
      confidence: Math.min(0.99, confidence),
      headersPreview:
        tpl.verdict === "benign"
          ? "Authentication-Results: spf=pass dkim=pass dmarc=pass"
          : i % 3 === 0
            ? "Authentication-Results: spf=fail dkim=fail dmarc=fail\nX-Originating-IP: 185.220.101.42"
            : "Return-Path: <bounce@mailer-daemon.xyz>\nReply-To: wire@attacker.example",
      urls,
      attachments,
      isVip: tpl.isVip || i % 11 === 0,
      isBec: tpl.isBec,
      tags: [...tpl.tags, campaign.id],
      campaignId: campaign.id,
      campaignName: campaign.name,
      alertId:
        i % 3 === 0 || tpl.isBec
          ? LINKED_ALERT_IDS[i % LINKED_ALERT_IDS.length]
          : undefined,
      incidentId:
        tpl.isBec && status === "resolved"
          ? SHOWCASE_BEC_INCIDENT_ID
          : undefined,
    });
  }

  return seeds;
}

function seed() {
  if (messages.size > 0) return;
  for (const m of buildSeedMessages()) messages.set(m.id, m);
}

export type PhishCampaignSummary = {
  campaignId: string;
  campaignName: string;
  count: number;
  malicious: number;
  bec: number;
  open: number;
};

export function summarizePhishCampaigns(
  items: PhishMessage[],
): PhishCampaignSummary[] {
  const byId = new Map<string, PhishCampaignSummary>();
  for (const item of items) {
    const existing = byId.get(item.campaignId);
    const row =
      existing ??
      ({
        campaignId: item.campaignId,
        campaignName: item.campaignName,
        count: 0,
        malicious: 0,
        bec: 0,
        open: 0,
      } satisfies PhishCampaignSummary);
    row.count += 1;
    if (item.verdict === "malicious" || item.verdict === "bec_likely") {
      row.malicious += 1;
    }
    if (item.isBec) row.bec += 1;
    if (
      item.status === "new" ||
      item.status === "triaging" ||
      item.status === "remediating"
    ) {
      row.open += 1;
    }
    byId.set(item.campaignId, row);
  }
  return Array.from(byId.values()).sort((a, b) => b.count - a.count);
}

/** @deprecated Prefer summarizePhishCampaigns */
export function getPhishCampaignSummaries(items: PhishMessage[]) {
  return summarizePhishCampaigns(items).map((row) => ({
    id: row.campaignId,
    name: row.campaignName,
    count: row.count,
  }));
}

export const phishingApi = {
  async list(filters?: {
    q?: string;
    status?: PhishMessageStatus;
    verdict?: PhishVerdict;
    source?: PhishSource;
    becOnly?: boolean;
    campaignId?: string;
  }): Promise<ListResult<PhishMessage>> {
    await mockDelay(80);
    seed();
    let items = Array.from(messages.values());
    if (filters?.q?.trim()) {
      const needle = filters.q.trim().toLowerCase();
      items = items.filter((m) => {
        const hay = [
          m.id,
          m.subject,
          m.from,
          m.to.join(" "),
          m.campaignName,
          m.campaignId,
          m.reportedBy ?? "",
          m.alertId ?? "",
          m.incidentId ?? "",
          ...m.tags,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      });
    }
    if (filters?.status) {
      items = items.filter((m) => m.status === filters.status);
    }
    if (filters?.verdict) {
      items = items.filter((m) => m.verdict === filters.verdict);
    }
    if (filters?.source) {
      items = items.filter((m) => m.source === filters.source);
    }
    if (filters?.becOnly) {
      items = items.filter((m) => m.isBec);
    }
    if (filters?.campaignId) {
      items = items.filter((m) => m.campaignId === filters.campaignId);
    }
    items.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
    return { items, total: items.length };
  },

  async get(id: string): Promise<PhishMessage | null> {
    await mockDelay(40);
    seed();
    return messages.get(id) ?? null;
  },

  async ingest(input: {
    subject: string;
    from: string;
    to: string[];
    source: PhishSource;
    reportedBy?: string;
    rawHeaders?: string;
    campaignId?: string;
  }): Promise<{ message: PhishMessage; receipt: ActionReceipt }> {
    await mockDelay(120);
    seed();
    const isBec = /wire|invoice|transfer|urgent/i.test(input.subject);
    const campaignId =
      input.campaignId ??
      (isBec
        ? "camp-bec-wire"
        : /oauth|sharepoint|onedrive/i.test(input.subject)
          ? "camp-oauth-consent"
          : "camp-credential-lookalike");
    const message: PhishMessage = {
      id: `phish-${Date.now().toString(36)}`,
      subject: input.subject,
      from: input.from,
      to: input.to,
      reportedBy: input.reportedBy,
      receivedAt: new Date().toISOString(),
      source: input.source,
      status: "new",
      verdict: "unknown",
      confidence: 0.4,
      headersPreview: input.rawHeaders ?? "(headers pending enrichment)",
      urls: [],
      attachments: [],
      isVip: /cfo|ceo|ap@|finance/i.test(input.to.join(" ")),
      isBec,
      tags: input.source === "user_report" ? ["user_report"] : ["ingest"],
      campaignId,
      campaignName: campaignNameFor(campaignId),
    };
    if (message.isBec) {
      message.verdict = "bec_likely";
      message.confidence = 0.78;
      message.tags.push("bec");
    }
    messages.set(message.id, message);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Ingested phishing message “${message.subject.slice(0, 48)}”`,
      targetType: "phish_message",
      targetId: message.id,
      connectorId:
        input.source === "user_report" ? "int-mdo-email" : "int-proofpoint",
    });
    auditFromReceipt(receipt, "phishing.ingest", "alert");
    return { message, receipt };
  },

  async setVerdict(
    id: string,
    verdict: PhishVerdict,
    confidence?: number,
  ): Promise<{ message: PhishMessage; receipt: ActionReceipt }> {
    await mockDelay(80);
    seed();
    const message = messages.get(id);
    if (!message) throw new Error(`Phish message ${id} not found`);
    message.verdict = verdict;
    if (confidence != null) message.confidence = confidence;
    message.status =
      verdict === "benign" ? "false_positive" : message.status === "new" ? "triaging" : message.status;
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Verdict ${verdict} on ${id}`,
      targetType: "phish_message",
      targetId: id,
    });
    auditFromReceipt(receipt, "phishing.verdict", "alert");
    return { message, receipt };
  },

  async remediate(
    id: string,
    action: PhishRemediationAction,
  ): Promise<{ message: PhishMessage; receipt: ActionReceipt }> {
    await mockDelay(160);
    seed();
    const message = messages.get(id);
    if (!message) throw new Error(`Phish message ${id} not found`);
    message.status = "remediating";
    const labels: Record<PhishRemediationAction, string> = {
      purge: "Purged matching messages from mailboxes",
      block_url: "Blocked URLs at mail gateway",
      revoke_oauth: "Revoked suspicious OAuth grants",
      notify_user: "Notified reporter / recipients",
      escalate_bec: "Escalated BEC playbook",
    };
    if (action === "escalate_bec") {
      message.isBec = true;
      message.tags = Array.from(new Set([...message.tags, "bec", "escalated"]));
    }
    if (action === "purge" || action === "block_url") {
      message.status = "resolved";
    }
    const receipt = makeReceipt({
      outcome: "simulated",
      message: labels[action],
      targetType: "phish_message",
      targetId: id,
      connectorId: "int-mdo-email",
      connectorName: "Microsoft Defender for Office 365",
      detail: action,
    });
    auditFromReceipt(receipt, "phishing.remediate", "alert");
    return { message, receipt };
  },

  async linkIncident(
    id: string,
    incidentId: string,
  ): Promise<{ message: PhishMessage; receipt: ActionReceipt }> {
    await mockDelay(60);
    seed();
    const message = messages.get(id);
    if (!message) throw new Error(`Phish message ${id} not found`);
    message.incidentId = incidentId;
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Linked ${id} → ${incidentId}`,
      targetType: "phish_message",
      targetId: id,
      detail: `incident=${incidentId}`,
    });
    auditFromReceipt(receipt, "phishing.link_incident", "incident");
    return { message, receipt };
  },

  async openIncident(id: string): Promise<{
    message: PhishMessage;
    incident: SocIncident | null;
    receipt: ActionReceipt;
  }> {
    await mockDelay(180);
    seed();
    const message = messages.get(id);
    if (!message) throw new Error(`Phish message ${id} not found`);
    if (message.incidentId) {
      const receipt = makeReceipt({
        outcome: "simulated",
        message: `Message ${id} already linked to ${message.incidentId}`,
        targetType: "incident",
        targetId: message.incidentId,
        detail: `phish=${id}`,
      });
      auditFromReceipt(receipt, "phishing.open_incident", "incident");
      return { message, incident: null, receipt };
    }

    const { incident, evidenceId } =
      await createIncidentFromPhishMessage(message);
    attachEvidence(incident.id, evidenceId);
    message.incidentId = incident.id;
    if (message.status === "new") message.status = "triaging";
    message.tags = Array.from(
      new Set([...message.tags, "escalated", "incident"]),
    );

    const receipt = makeReceipt({
      outcome: "ok",
      message: `Opened ${incident.id} from ${id}`,
      targetType: "incident",
      targetId: incident.id,
      detail: `phish=${id}`,
    });
    auditFromReceipt(receipt, "phishing.open_incident", "incident");
    return { message, incident, receipt };
  },
};
