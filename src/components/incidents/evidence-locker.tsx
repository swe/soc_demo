"use client";

import {
  Bug,
  Cloud,
  Cpu,
  FileArchive,
  FileClock,
  FileCode2,
  FileImage,
  HardDriveDownload,
  Hash,
  Mail,
  Paperclip,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import { getSessionCloudFindings } from "@/components/cloud-posture/cloud-posture-session";
import { complianceEvidence } from "@/components/compliance/compliance-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { vulnerabilities } from "@/components/vulnerabilities/vulnerabilities-data";
import { responseApi } from "@/lib/mock-api/response";
import { toast } from "@/lib/toast";

export type EvidenceKind =
  | "pcap"
  | "screenshot"
  | "hash-list"
  | "email-header"
  | "investigate-export"
  | "grc-control"
  | "cspm-finding"
  | "vuln-finding"
  | "sandbox-verdict"
  | "forensic-package"
  | "timeline-export"
  | "memory-dump";

export type EvidenceItem = {
  id: string;
  kind: EvidenceKind;
  title: string;
  detail: string;
  sizeLabel: string;
  sourceLabel: string;
  attachedAt: string;
  /** Optional deep-link into the originating module. */
  href?: string;
};

const kindLabels: Record<EvidenceKind, string> = {
  pcap: "PCAP snippet",
  screenshot: "Screenshot",
  "hash-list": "Hash list",
  "email-header": "Email header",
  "investigate-export": "Investigate export",
  "grc-control": "GRC control evidence",
  "cspm-finding": "CSPM finding",
  "vuln-finding": "Vulnerability finding",
  "sandbox-verdict": "Sandbox verdict",
  "forensic-package": "Forensic package",
  "timeline-export": "Timeline export",
  "memory-dump": "Memory dump",
};

const kindIcons: Record<EvidenceKind, typeof Paperclip> = {
  pcap: FileArchive,
  screenshot: FileImage,
  "hash-list": Hash,
  "email-header": Mail,
  "investigate-export": FileCode2,
  "grc-control": ShieldCheck,
  "cspm-finding": Cloud,
  "vuln-finding": Bug,
  "sandbox-verdict": ShieldCheck,
  "forensic-package": FileArchive,
  "timeline-export": FileClock,
  "memory-dump": Cpu,
};

const baseCatalog: Omit<EvidenceItem, "attachedAt">[] = [
  {
    id: "ev-pcap-01",
    kind: "pcap",
    title: "C2 beacon slice (60s)",
    detail: "Filtered PCAP around beacon interval; DNS + HTTPS to rare ASN.",
    sizeLabel: "1.8 MB",
    sourceLabel: "Network sensor",
  },
  {
    id: "ev-shot-01",
    kind: "screenshot",
    title: "EDR process tree capture",
    detail: "Defender timeline screenshot showing encoded PowerShell child.",
    sizeLabel: "420 KB",
    sourceLabel: "Endpoint",
  },
  {
    id: "ev-hash-01",
    kind: "hash-list",
    title: "Dropped binary hashes",
    detail: "SHA-256 list for staged payloads and renamed LOLBins.",
    sizeLabel: "12 KB",
    sourceLabel: "Forensics",
  },
  {
    id: "ev-mail-01",
    kind: "email-header",
    title: "Phish delivery headers",
    detail: "Full RFC5322 headers from the suspected lure message.",
    sizeLabel: "8 KB",
    sourceLabel: "Email gateway",
  },
  {
    id: "ev-inv-01",
    kind: "investigate-export",
    title: "HeimdallQL result export",
    detail: "CSV export of correlated events used during initial hunt.",
    sizeLabel: "96 KB",
    sourceLabel: "Investigate",
    href: "/investigate",
  },
  {
    id: "ev-sandbox-01",
    kind: "sandbox-verdict",
    title: "Sandbox verdict · encoded.ps1",
    detail: "Detonation: ransomware staging + C2 beacon; score 92/100.",
    sizeLabel: "Verdict JSON",
    sourceLabel: "Sandbox",
  },
  {
    id: "ev-forensic-01",
    kind: "forensic-package",
    title: "Remote collect package (WS-SOC-0007)",
    detail: "Memory + prefetch + event logs bundle from EDR live response.",
    sizeLabel: "182 MB",
    sourceLabel: "Forensics",
  },
  {
    id: "ev-timeline-01",
    kind: "timeline-export",
    title: "Host timeline export",
    detail:
      "Normalized process / network / auth timeline for case reconstruction.",
    sizeLabel: "2.4 MB",
    sourceLabel: "Forensics",
  },
  {
    id: "ev-memory-01",
    kind: "memory-dump",
    title: "LSASS memory dump (WS-SOC-0007)",
    detail: "Live-response memory image for credential & injection analysis.",
    sizeLabel: "4.1 GB",
    sourceLabel: "Forensics",
  },
];

function buildModuleCatalog(): Omit<EvidenceItem, "attachedAt">[] {
  const grc = complianceEvidence.slice(0, 10).map((item) => ({
    id: `ev-grc-${item.id}`,
    kind: "grc-control" as const,
    title: item.name,
    detail: `${item.kind} · control ${item.controlCode} · ${item.status}`,
    sizeLabel: item.automated ? "Auto" : "Manual",
    sourceLabel: "Compliance",
    href: `/compliance?q=${encodeURIComponent(item.controlCode)}`,
  }));

  const cspm = getSessionCloudFindings()
    .filter(
      (f) =>
        f.severity === "critical" ||
        f.severity === "high" ||
        f.status === "open",
    )
    .slice(0, 12)
    .map((finding) => ({
      id: `ev-cspm-${finding.id}`,
      kind: "cspm-finding" as const,
      title: finding.title,
      detail: `${finding.provider.toUpperCase()} · ${finding.resourceName} · ${finding.id}`,
      sizeLabel: "Finding ref",
      sourceLabel: "Cloud posture",
      href: `/cloud-posture?q=${encodeURIComponent(finding.id)}`,
    }));

  const vulns = vulnerabilities
    .filter((v) => v.severity === "critical" || v.severity === "high")
    .slice(0, 12)
    .map((vuln) => ({
      id: `ev-vuln-${vuln.id}`,
      kind: "vuln-finding" as const,
      title: `${vuln.cve} · ${vuln.title}`,
      detail: `Priority ${vuln.socPriority} · ${vuln.exposedDeviceCount} devices`,
      sizeLabel: "Finding ref",
      sourceLabel: "Vulnerabilities",
      href: `/vulnerabilities/findings?q=${encodeURIComponent(vuln.cve)}`,
    }));

  return [...baseCatalog, ...grc, ...cspm, ...vulns];
}

/** Public catalog snapshot for attach pickers / seeds. */
export function getEvidenceCatalog(): Omit<EvidenceItem, "attachedAt">[] {
  return buildModuleCatalog();
}

type EvidenceStore = Map<string, string[]>;

let store: EvidenceStore = new Map();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return store;
}

function seedForIncident(incidentId: string): string[] {
  const catalog = buildModuleCatalog();
  const n = incidentId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const count = 1 + (n % 3);
  return catalog.slice(0, count).map((item) => item.id);
}

function getAttachedIds(incidentId: string): string[] {
  return store.get(incidentId) ?? seedForIncident(incidentId);
}

function setAttachedIds(incidentId: string, ids: string[]) {
  const next = new Map(store);
  next.set(incidentId, ids);
  store = next;
  emit();
}

export function attachEvidence(incidentId: string, evidenceId: string) {
  const current = getAttachedIds(incidentId);
  if (current.includes(evidenceId)) return;
  setAttachedIds(incidentId, [...current, evidenceId]);
}

export function removeEvidence(incidentId: string, evidenceId: string) {
  setAttachedIds(
    incidentId,
    getAttachedIds(incidentId).filter((id) => id !== evidenceId),
  );
}

export function EvidenceLocker({ incidentId }: { incidentId: string }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const attachedIds = snapshot.get(incidentId) ?? seedForIncident(incidentId);
  const catalog = useMemo(() => buildModuleCatalog(), []);
  const [busy, setBusy] = useState<"collect" | "timeline" | "sandbox" | null>(
    null,
  );

  const attached = useMemo(() => {
    const at = "2026-07-28T14:00:00.000Z";
    return attachedIds
      .map((id) => catalog.find((item) => item.id === id))
      .filter((item): item is (typeof catalog)[number] => Boolean(item))
      .map((item) => ({ ...item, attachedAt: at }));
  }, [attachedIds, catalog]);

  const available = useMemo(
    () => catalog.filter((item) => !attachedIds.includes(item.id)),
    [attachedIds, catalog],
  );

  const onAttach = useCallback(
    (id: string) => attachEvidence(incidentId, id),
    [incidentId],
  );
  const onRemove = useCallback(
    (id: string) => removeEvidence(incidentId, id),
    [incidentId],
  );

  const remoteCollect = async () => {
    setBusy("collect");
    try {
      const receipt = await responseApi.contain({
        action: "collect-forensics",
        targetType: "device",
        targetId: "WS-SOC-0007",
        targetLabel: "WS-SOC-0007",
        incidentId,
      });
      attachEvidence(incidentId, "ev-forensic-01");
      attachEvidence(incidentId, "ev-memory-01");
      toast({
        title: "Remote collect requested",
        description: `${receipt.message} · ${receipt.id}`,
      });
    } finally {
      setBusy(null);
    }
  };

  const exportTimeline = async () => {
    setBusy("timeline");
    try {
      const receipt = await responseApi.contain({
        action: "collect-forensics",
        targetType: "device",
        targetId: `timeline-${incidentId}`,
        targetLabel: `Timeline export ${incidentId}`,
        incidentId,
      });
      attachEvidence(incidentId, "ev-timeline-01");
      const payload = {
        incidentId,
        exportedAt: new Date().toISOString(),
        evidenceIds: attachedIds,
        receiptId: receipt.id,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${incidentId}-evidence-timeline.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Timeline exported",
        description: `${receipt.message} · ${receipt.id}`,
      });
    } finally {
      setBusy(null);
    }
  };

  const attachSandboxVerdict = async () => {
    setBusy("sandbox");
    try {
      const receipt = await responseApi.contain({
        action: "collect-forensics",
        targetType: "device",
        targetId: `sandbox-${incidentId}`,
        targetLabel: `Sandbox verdict ${incidentId}`,
        incidentId,
      });
      attachEvidence(incidentId, "ev-sandbox-01");
      toast({
        title: "Sandbox verdict attached",
        description: `${receipt.message} · ${receipt.id}`,
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <section className="bg-card rounded-lg border p-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Evidence locker
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Session-scoped artifacts — forensic files plus GRC control
              evidence and CSPM/vuln finding references.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={busy !== null}
              onClick={() => void remoteCollect()}
            >
              <HardDriveDownload className="size-3.5" />
              Remote collect
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={busy !== null}
              onClick={() => void exportTimeline()}
            >
              <FileClock className="size-3.5" />
              Export timeline
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={busy !== null}
              onClick={() => void attachSandboxVerdict()}
            >
              <ShieldCheck className="size-3.5" />
              Attach sandbox verdict
            </Button>
            <Badge variant="secondary" className="rounded-full font-normal">
              {attached.length} attached
            </Badge>
          </div>
        </div>

        {attached.length === 0 ? (
          <p className="text-muted-foreground rounded-md border border-dashed px-4 py-8 text-center text-sm">
            No evidence attached yet. Add items from the catalog below.
          </p>
        ) : (
          <ul className="divide-border/70 divide-y">
            {attached.map((item) => {
              const Icon = kindIcons[item.kind];
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md">
                    <Icon className="text-muted-foreground size-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{item.title}</p>
                      <Badge
                        variant="outline"
                        className="rounded-full px-1.5 py-0 text-xs font-normal"
                      >
                        {kindLabels[item.kind]}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {item.detail}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {item.sourceLabel} · {item.sizeLabel}
                      {item.href ? (
                        <>
                          {" · "}
                          <a
                            href={item.href}
                            className="hover:text-foreground underline-offset-2 hover:underline"
                          >
                            Open source
                          </a>
                        </>
                      ) : null}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive-text hover:text-destructive-text h-8 shrink-0 gap-1.5"
                    onClick={() => onRemove(item.id)}
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {available.length > 0 ? (
        <section className="bg-card rounded-lg border p-4">
          <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
            Available to attach
          </h2>
          <ul className="max-h-[420px] space-y-2 overflow-y-auto">
            {available.map((item) => {
              const Icon = kindIcons[item.kind];
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-md border border-dashed px-3 py-2.5"
                >
                  <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md">
                    <Icon className="text-muted-foreground size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {kindLabels[item.kind]} · {item.sizeLabel}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 gap-1.5"
                    onClick={() => onAttach(item.id)}
                  >
                    <Paperclip className="size-3.5" />
                    Attach
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
