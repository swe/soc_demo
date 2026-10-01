"use client";

import { Bug, ChevronRight, ClipboardCheck, Cloud } from "lucide-react";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import {
  getCloudPostureSessionSnapshot,
  subscribeCloudPostureSession,
} from "@/components/cloud-posture/cloud-posture-session";
import {
  getComplianceSessionSnapshot,
  subscribeComplianceSession,
} from "@/components/compliance/compliance-session";
import { Panel, PanelHeading, PanelLink } from "@/components/soc/panel";
import { Badge } from "@/components/ui/badge";
import { vulnerabilities } from "@/components/vulnerabilities/vulnerabilities-data";
import { cn } from "@/lib/utils";

export type RiskQueueItem = {
  id: string;
  source: "vuln" | "cspm" | "compliance";
  title: string;
  meta: string;
  href: string;
};

type SourceTone = "critical" | "info" | "warning";

const sourceMeta: Record<
  RiskQueueItem["source"],
  { label: string; icon: typeof Bug; tone: SourceTone }
> = {
  vuln: { label: "CVE", icon: Bug, tone: "critical" },
  cspm: { label: "CSPM", icon: Cloud, tone: "info" },
  compliance: { label: "GRC", icon: ClipboardCheck, tone: "warning" },
};

const sourceIconClass: Record<SourceTone, string> = {
  critical: "bg-severity-critical/12 text-severity-critical-text",
  info: "bg-info/12 text-info-text",
  warning: "bg-warning/16 text-warning-text",
};

const openComplianceStatuses = new Set([
  "open",
  "in-progress",
  "awaiting-review",
]);

export function buildUnifiedRiskQueue(limit = 12): RiskQueueItem[] {
  const cloud = Array.from(
    getCloudPostureSessionSnapshot().findings.values(),
  ).filter(
    (f) =>
      f.severity === "critical" &&
      (f.status === "open" || f.status === "in_progress"),
  );

  const compliance = Array.from(
    getComplianceSessionSnapshot().findings.values(),
  ).filter(
    (f) =>
      f.severity === "critical" && openComplianceStatuses.has(f.status),
  );

  const vulns = vulnerabilities.filter((v) => v.severity === "critical");

  const items: RiskQueueItem[] = [
    ...vulns.map((v) => ({
      id: `risk-vuln-${v.id}`,
      source: "vuln" as const,
      title: `${v.cve} · ${v.title}`,
      meta: `Priority ${v.socPriority} · ${v.exposedDeviceCount.toLocaleString()} devices`,
      href: `/vulnerabilities/findings?q=${encodeURIComponent(v.cve)}`,
    })),
    ...cloud.map((f) => ({
      id: `risk-cspm-${f.id}`,
      source: "cspm" as const,
      title: f.title,
      meta: `${f.provider.toUpperCase()} · ${f.resourceName} · ${f.id}`,
      href: `/cloud-posture?q=${encodeURIComponent(f.id)}`,
    })),
    ...compliance.map((f) => ({
      id: `risk-grc-${f.id}`,
      source: "compliance" as const,
      title: f.title,
      meta: `${f.controlCode} · ${f.source} · due ${f.dueLabel}`,
      href: `/compliance?q=${encodeURIComponent(f.controlCode)}`,
    })),
  ];

  return items.slice(0, limit);
}

export function UnifiedRiskQueue({
  className,
  limit = 10,
}: {
  className?: string;
  limit?: number;
}) {
  const cloudSnap = useSyncExternalStore(
    subscribeCloudPostureSession,
    getCloudPostureSessionSnapshot,
    getCloudPostureSessionSnapshot,
  );
  const complianceSnap = useSyncExternalStore(
    subscribeComplianceSession,
    getComplianceSessionSnapshot,
    getComplianceSessionSnapshot,
  );

  const items = useMemo(() => {
    void cloudSnap;
    void complianceSnap;
    return buildUnifiedRiskQueue(limit);
  }, [limit, cloudSnap, complianceSnap]);

  const counts = useMemo(() => {
    void cloudSnap;
    void complianceSnap;
    const all = buildUnifiedRiskQueue(200);
    return {
      vuln: all.filter((i) => i.source === "vuln").length,
      cspm: all.filter((i) => i.source === "cspm").length,
      compliance: all.filter((i) => i.source === "compliance").length,
      total: all.length,
    };
  }, [cloudSnap, complianceSnap]);

  return (
    <Panel className={cn("flex flex-col", className)}>
      <PanelHeading
        title="Unified risk queue"
        description="Open critical items across vulnerabilities, cloud posture, and compliance"
        action={
          <>
            <Badge variant="muted">{counts.total} total</Badge>
            <Badge variant={sourceMeta.vuln.tone}>{counts.vuln} CVE</Badge>
            <Badge variant={sourceMeta.cspm.tone}>{counts.cspm} CSPM</Badge>
            <Badge variant={sourceMeta.compliance.tone}>
              {counts.compliance} GRC
            </Badge>
          </>
        }
      />
      <ul className="divide-separator -mx-2 max-h-[360px] divide-y overflow-y-auto">
        {items.length === 0 ? (
          <li className="text-muted-foreground py-6 text-center text-sm">
            No open critical risk items.
          </li>
        ) : (
          items.map((item) => {
            const meta = sourceMeta[item.source];
            const Icon = meta.icon;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="pressable hover:bg-accent/60 flex items-center gap-3 rounded-md px-2 py-2.5"
                >
                  <span
                    className={cn(
                      "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
                      sourceIconClass[meta.tone],
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {meta.label} · {item.meta}
                    </p>
                  </div>
                  <ChevronRight
                    className="text-muted-foreground/70 size-4 shrink-0"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })
        )}
      </ul>
      <div className="border-separator mt-3 flex flex-wrap gap-x-5 border-t pt-3">
        <PanelLink href="/vulnerabilities/findings?severity=critical">
          Vulnerabilities
        </PanelLink>
        <PanelLink href="/cloud-posture?severity=critical">Cloud posture</PanelLink>
        <PanelLink href="/compliance">Compliance</PanelLink>
      </div>
    </Panel>
  );
}
