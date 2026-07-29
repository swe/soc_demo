/**
 * Versioned SOAR action catalog — source of truth for playbook action kinds.
 * UI and runtime resolve actions by id; live backends can replace this registry.
 * Every contain/email/network action requires upstream connectorIds (consolidator).
 */

export type ActionCatalogFamily =
  | "contain"
  | "email"
  | "network"
  | "itsm"
  | "enrich"
  | "notify"
  | "control"
  | "forensics"
  | "identity"
  | "cloud"
  | "training";

export type ActionCatalogEntry = {
  id: string;
  label: string;
  description: string;
  family: ActionCatalogFamily;
  /** Requires dual-control approval before execution. */
  requiresApproval: boolean;
  /** Optional connector ids that can execute this action. */
  connectorIds?: string[];
  /** Maps to response/actions when applicable. */
  responseAction?:
    | "isolate-host"
    | "disable-identity"
    | "require-mfa"
    | "revoke-sessions"
    | "collect-forensics"
    | "purge-mailbox"
    | "block-url";
  version: string;
};

export const ACTION_CATALOG_VERSION = "2026.07.2";

function entry(
  partial: Omit<ActionCatalogEntry, "version">,
): ActionCatalogEntry {
  return { ...partial, version: ACTION_CATALOG_VERSION };
}

export const actionCatalog: ActionCatalogEntry[] = [
  // —— contain (EDR / host) ——
  entry({
    id: "isolate_host",
    label: "Isolate host",
    description: "Network-isolate an endpoint via EDR.",
    family: "contain",
    requiresApproval: true,
    connectorIds: ["int-defender-endpoint", "int-crowdstrike-falcon"],
    responseAction: "isolate-host",
  }),
  entry({
    id: "release_isolation",
    label: "Release isolation",
    description: "Restore network for a previously isolated host.",
    family: "contain",
    requiresApproval: true,
    connectorIds: ["int-defender-endpoint", "int-crowdstrike-falcon"],
  }),
  entry({
    id: "quarantine_file",
    label: "Quarantine file",
    description: "Quarantine a malicious file hash on endpoints via EDR.",
    family: "contain",
    requiresApproval: true,
    connectorIds: ["int-defender-endpoint", "int-crowdstrike-falcon"],
  }),
  entry({
    id: "kill_process",
    label: "Kill process",
    description: "Terminate a process tree on a managed endpoint.",
    family: "contain",
    requiresApproval: true,
    connectorIds: ["int-defender-endpoint", "int-crowdstrike-falcon"],
  }),
  entry({
    id: "block_hash",
    label: "Block hash",
    description: "Push IOC hash block to EDR prevention policy.",
    family: "contain",
    requiresApproval: false,
    connectorIds: ["int-defender-endpoint", "int-crowdstrike-falcon"],
  }),
  entry({
    id: "run_scan",
    label: "Full disk scan",
    description: "Trigger on-demand malware scan via EDR.",
    family: "contain",
    requiresApproval: false,
    connectorIds: ["int-defender-endpoint", "int-crowdstrike-falcon"],
  }),

  // —— identity ——
  entry({
    id: "disable_identity",
    label: "Disable identity",
    description: "Disable an identity in the IdP.",
    family: "identity",
    requiresApproval: true,
    connectorIds: ["int-okta-workforce"],
    responseAction: "disable-identity",
  }),
  entry({
    id: "enable_identity",
    label: "Re-enable identity",
    description: "Re-enable a previously disabled IdP account.",
    family: "identity",
    requiresApproval: true,
    connectorIds: ["int-okta-workforce"],
  }),
  entry({
    id: "require_mfa",
    label: "Require MFA",
    description: "Force MFA re-challenge for the principal.",
    family: "identity",
    requiresApproval: false,
    connectorIds: ["int-okta-workforce"],
    responseAction: "require-mfa",
  }),
  entry({
    id: "revoke_sessions",
    label: "Revoke sessions",
    description: "Revoke active IdP sessions.",
    family: "identity",
    requiresApproval: true,
    connectorIds: ["int-okta-workforce"],
    responseAction: "revoke-sessions",
  }),
  entry({
    id: "reset_password",
    label: "Reset password",
    description: "Force password reset and invalidate credentials.",
    family: "identity",
    requiresApproval: true,
    connectorIds: ["int-okta-workforce"],
  }),
  entry({
    id: "revoke_oauth",
    label: "Revoke OAuth grants",
    description: "Revoke third-party OAuth app grants for a user.",
    family: "identity",
    requiresApproval: true,
    connectorIds: ["int-okta-workforce"],
  }),
  entry({
    id: "remove_group",
    label: "Remove from privileged group",
    description: "Remove user from admin / privileged IdP groups.",
    family: "identity",
    requiresApproval: true,
    connectorIds: ["int-okta-workforce"],
  }),

  // —— email ——
  entry({
    id: "purge_mailbox",
    label: "Purge mailbox message",
    description: "Hard-delete matching messages across mailboxes.",
    family: "email",
    requiresApproval: true,
    connectorIds: ["int-mdo-email", "int-proofpoint"],
    responseAction: "purge-mailbox",
  }),
  entry({
    id: "block_url",
    label: "Block URL / domain",
    description: "Block malicious URL or domain at mail gateway / proxy.",
    family: "email",
    requiresApproval: false,
    connectorIds: ["int-mdo-email", "int-proofpoint", "int-cloudflare"],
    responseAction: "block-url",
  }),
  entry({
    id: "block_sender",
    label: "Block sender",
    description: "Add sender / domain to mail gateway block list.",
    family: "email",
    requiresApproval: false,
    connectorIds: ["int-mdo-email", "int-proofpoint"],
  }),
  entry({
    id: "release_quarantine",
    label: "Release from quarantine",
    description: "Release a false-positive message from mail quarantine.",
    family: "email",
    requiresApproval: false,
    connectorIds: ["int-mdo-email", "int-proofpoint"],
  }),
  entry({
    id: "mailbox_search",
    label: "Mailbox content search",
    description: "Search mailboxes for campaign IOCs via mail security API.",
    family: "email",
    requiresApproval: false,
    connectorIds: ["int-mdo-email", "int-proofpoint"],
  }),

  // —— network ——
  entry({
    id: "firewall_block",
    label: "Firewall block",
    description: "Push block rule to NGFW / edge.",
    family: "network",
    requiresApproval: true,
    connectorIds: ["int-palo-edge", "int-cisco-secure-fw", "int-fortinet"],
  }),
  entry({
    id: "firewall_unblock",
    label: "Firewall unblock",
    description: "Remove a previously pushed block rule.",
    family: "network",
    requiresApproval: true,
    connectorIds: ["int-palo-edge", "int-cisco-secure-fw", "int-fortinet"],
  }),
  entry({
    id: "dns_sinkhole",
    label: "DNS sinkhole",
    description: "Sinkhole malicious domain via DNS / edge.",
    family: "network",
    requiresApproval: false,
    connectorIds: ["int-cloudflare", "int-palo-edge"],
  }),
  entry({
    id: "geo_block",
    label: "Geo block",
    description: "Temporary geo / ASN egress block at edge.",
    family: "network",
    requiresApproval: true,
    connectorIds: ["int-cloudflare", "int-palo-edge"],
  }),
  entry({
    id: "vpn_revoke",
    label: "Revoke VPN session",
    description: "Terminate remote access VPN session for a user/device.",
    family: "network",
    requiresApproval: true,
    connectorIds: ["int-palo-edge", "int-okta-workforce"],
  }),

  // —— cloud ——
  entry({
    id: "disable_cloud_key",
    label: "Disable cloud access key",
    description: "Disable IAM access key in AWS/Azure/GCP via CSPM connector.",
    family: "cloud",
    requiresApproval: true,
    connectorIds: ["int-aws-prod"],
  }),
  entry({
    id: "revoke_cloud_role",
    label: "Revoke cloud role session",
    description: "Invalidate assumed-role / federated cloud session.",
    family: "cloud",
    requiresApproval: true,
    connectorIds: ["int-aws-prod"],
  }),
  entry({
    id: "snapshot_volume",
    label: "Snapshot volume",
    description: "Create forensic snapshot of cloud volume before wipe.",
    family: "cloud",
    requiresApproval: false,
    connectorIds: ["int-aws-prod"],
  }),
  entry({
    id: "quarantine_bucket",
    label: "Quarantine storage bucket",
    description: "Lock public ACL / block public access on cloud bucket.",
    family: "cloud",
    requiresApproval: true,
    connectorIds: ["int-aws-prod"],
  }),

  // —— itsm ——
  entry({
    id: "itsm_create",
    label: "Create ITSM ticket",
    description: "Create a linked ServiceNow or Jira ticket.",
    family: "itsm",
    requiresApproval: false,
    connectorIds: ["int-servicenow", "int-jira-secops"],
  }),
  entry({
    id: "itsm_update",
    label: "Update ITSM ticket",
    description: "Push status / notes to linked ITSM ticket.",
    family: "itsm",
    requiresApproval: false,
    connectorIds: ["int-servicenow", "int-jira-secops"],
  }),
  entry({
    id: "itsm_resolve",
    label: "Resolve ITSM ticket",
    description: "Mark linked ITSM ticket resolved with IR summary.",
    family: "itsm",
    requiresApproval: false,
    connectorIds: ["int-servicenow", "int-jira-secops"],
  }),
  entry({
    id: "jira",
    label: "Jira (legacy)",
    description: "Legacy Jira notify node — prefer itsm_create.",
    family: "itsm",
    requiresApproval: false,
    connectorIds: ["int-jira-secops"],
  }),

  // —— enrich ——
  entry({
    id: "enrich_ti",
    label: "Enrich TI",
    description: "Enrich indicators against TI feeds.",
    family: "enrich",
    requiresApproval: false,
  }),
  entry({
    id: "enrich_asset",
    label: "Enrich asset CMDB",
    description: "Pull owner, criticality, and tags from CMDB / asset inventory.",
    family: "enrich",
    requiresApproval: false,
  }),
  entry({
    id: "enrich_whois",
    label: "WHOIS / DNS enrich",
    description: "Resolve domain registration and DNS history.",
    family: "enrich",
    requiresApproval: false,
  }),
  entry({
    id: "enrich_sandbox",
    label: "Sandbox detonation",
    description: "Submit file/URL to upstream sandbox; attach verdict.",
    family: "enrich",
    requiresApproval: false,
    connectorIds: ["int-crowdstrike-falcon", "int-defender-endpoint"],
  }),
  entry({
    id: "cribl_route",
    label: "Cribl route adjust",
    description: "Temporarily boost / filter pipeline for investigation volume.",
    family: "enrich",
    requiresApproval: true,
    connectorIds: ["int-cribl-stream"],
  }),

  // —— notify ——
  entry({
    id: "slack",
    label: "Slack notify",
    description: "Post to a Slack channel or war-room thread.",
    family: "notify",
    requiresApproval: false,
    connectorIds: ["int-slack"],
  }),
  entry({
    id: "teams",
    label: "Teams notify",
    description: "Post to a Microsoft Teams channel.",
    family: "notify",
    requiresApproval: false,
    connectorIds: ["int-teams"],
  }),
  entry({
    id: "pagerduty",
    label: "PagerDuty page",
    description: "Page the on-call schedule.",
    family: "notify",
    requiresApproval: false,
    connectorIds: ["int-pagerduty"],
  }),
  entry({
    id: "email_notify",
    label: "Email stakeholders",
    description: "Send status email to case stakeholders.",
    family: "notify",
    requiresApproval: false,
  }),
  entry({
    id: "war_room_post",
    label: "War room post",
    description: "Post structured update into incident war room.",
    family: "notify",
    requiresApproval: false,
  }),

  // —— control ——
  entry({
    id: "wait_sla",
    label: "Wait / SLA timer",
    description: "Pause until duration elapses or escalate on timeout.",
    family: "control",
    requiresApproval: false,
  }),
  entry({
    id: "approval",
    label: "Approval gate",
    description: "Dual-control approval before continuing.",
    family: "control",
    requiresApproval: true,
  }),
  entry({
    id: "parallel_fork",
    label: "Parallel fork",
    description: "Fan out into parallel branches; join before continue.",
    family: "control",
    requiresApproval: false,
  }),
  entry({
    id: "retry_step",
    label: "Retry with backoff",
    description: "Retry failed upstream action with exponential backoff.",
    family: "control",
    requiresApproval: false,
  }),
  entry({
    id: "condition_gate",
    label: "Condition gate",
    description: "Branch on risk score / verdict / SLA state.",
    family: "control",
    requiresApproval: false,
  }),

  // —— forensics ——
  entry({
    id: "collect_forensics",
    label: "Remote collect",
    description: "Request forensic package via Falcon / Defender.",
    family: "forensics",
    requiresApproval: true,
    connectorIds: ["int-defender-endpoint", "int-crowdstrike-falcon"],
    responseAction: "collect-forensics",
  }),
  entry({
    id: "timeline_export",
    label: "Export timeline",
    description: "Export process / network timeline into evidence locker.",
    family: "forensics",
    requiresApproval: false,
    connectorIds: ["int-defender-endpoint", "int-crowdstrike-falcon"],
  }),
  entry({
    id: "attach_evidence",
    label: "Attach evidence",
    description: "Attach artifact or receipt to incident evidence locker.",
    family: "forensics",
    requiresApproval: false,
  }),
  entry({
    id: "memory_dump",
    label: "Memory dump request",
    description: "Request memory capture via EDR (upstream only).",
    family: "forensics",
    requiresApproval: true,
    connectorIds: ["int-crowdstrike-falcon", "int-defender-endpoint"],
  }),

  // —— training ——
  entry({
    id: "lms_assign",
    label: "Assign LMS training",
    description: "Assign phishing / security training to involved users.",
    family: "training",
    requiresApproval: false,
    connectorIds: ["int-lms-workday"],
  }),
  entry({
    id: "user_notify_phish",
    label: "User phishing notice",
    description: "Notify reporter / victim with remediation guidance.",
    family: "training",
    requiresApproval: false,
    connectorIds: ["int-mdo-email", "int-slack"],
  }),
];

export function getActionCatalogEntry(
  id: string,
): ActionCatalogEntry | undefined {
  return actionCatalog.find((a) => a.id === id);
}

export function getActionCatalogLabels(): Record<string, string> {
  return Object.fromEntries(actionCatalog.map((a) => [a.id, a.label]));
}

export const actionCatalogApi = {
  async list(): Promise<{
    version: string;
    items: ActionCatalogEntry[];
    total: number;
  }> {
    return {
      version: ACTION_CATALOG_VERSION,
      items: actionCatalog,
      total: actionCatalog.length,
    };
  },
  async get(id: string): Promise<ActionCatalogEntry | null> {
    return getActionCatalogEntry(id) ?? null;
  },
  async byFamily(family: ActionCatalogFamily): Promise<ActionCatalogEntry[]> {
    return actionCatalog.filter((a) => a.family === family);
  },
};
