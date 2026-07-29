import { createIncidentFromVulnerability } from "@/components/incidents/create-from-exposure";
import { attachEvidence } from "@/components/incidents/evidence-locker";
import type { SocIncident } from "@/components/incidents/incidents-data";
import type {
  Remediation,
  RemediationStatus,
  Vulnerability,
} from "@/components/vulnerabilities/vulnerabilities-data";
import { vulnerabilities } from "@/components/vulnerabilities/vulnerabilities-data";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, type ListResult,makeReceipt } from "./types";

export type VulnRemediationPatch = {
  status?: RemediationStatus;
  ownerId?: string | null;
  note?: string;
};

/**
 * Thin vuln catalog client. Remediation mutations stay on VulnSessionProvider;
 * list/get/open-incident are available for Overview and exposure→case flows.
 */
export const vulnsApi = {
  async list(): Promise<ListResult<Vulnerability>> {
    await mockDelay(80);
    return { items: vulnerabilities, total: vulnerabilities.length };
  },

  async get(id: string): Promise<Vulnerability | null> {
    await mockDelay(60);
    return vulnerabilities.find((v) => v.id === id) ?? null;
  },

  async getByCve(cve: string): Promise<Vulnerability | null> {
    await mockDelay(60);
    const needle = cve.toLowerCase();
    return (
      vulnerabilities.find((v) => v.cve.toLowerCase() === needle) ?? null
    );
  },

  /**
   * Placeholder patch for future session-backed vuln status.
   * Catalog rows are immutable today — returns a simulated receipt.
   */
  async patch(
    id: string,
    _patch: Record<string, never>,
  ): Promise<ActionReceipt> {
    await mockDelay(100);
    const vuln = vulnerabilities.find((v) => v.id === id);
    const receipt = makeReceipt({
      outcome: vuln ? "simulated" : "failed",
      message: vuln
        ? `Vulnerability ${vuln.cve} catalog is read-only (use remediations)`
        : `Vulnerability ${id} not found`,
      targetType: "vulnerability",
      targetId: id,
    });
    auditFromReceipt(receipt, "vuln.patch", "vulnerability");
    return receipt;
  },

  async openIncident(
    vulnerability: Vulnerability,
  ): Promise<{ incident: SocIncident; receipt: ActionReceipt }> {
    await mockDelay(200);
    const { incident, evidenceId } =
      await createIncidentFromVulnerability(vulnerability);
    attachEvidence(incident.id, evidenceId);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Opened incident ${incident.id} from ${vulnerability.cve}`,
      targetType: "incident",
      targetId: incident.id,
      detail: `vuln=${vulnerability.id}`,
    });
    auditFromReceipt(receipt, "vuln.open_incident", "incident");
    return { incident, receipt };
  },

  /** Acknowledge a remediation work item mutation for audit (session already applied). */
  remediationActionReceipt(
    remediation: Remediation,
    action: string,
  ): ActionReceipt {
    const receipt = makeReceipt({
      outcome: "ok",
      message: `${action}: ${remediation.ticketRef}`,
      targetType: "vulnerability",
      targetId: remediation.id,
    });
    auditFromReceipt(receipt, `vuln.remediation.${action}`, "vulnerability");
    return receipt;
  },
};
