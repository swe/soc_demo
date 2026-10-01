"use client";

import { ArrowRight, Bug, ClipboardCheck,Cloud } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { vulnerabilities } from "@/components/vulnerabilities/vulnerabilities-data";
import { cn } from "@/lib/utils";

export type RiskQueueItem = {
  id: string;
  source: "vuln" | "cspm" | "compliance";
  title: string;
  meta: string;
  href: string;
};

const sourceMeta: Record<
  RiskQueueItem["source"],
  { label: string; icon: typeof Bug; tone: string }
> = {
  vuln: {
    label: "CVE",
    icon: Bug,
    tone: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  cspm: {
    label: "CSPM",
    icon: Cloud,
    tone: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  compliance: {
    label: "GRC",
    icon: ClipboardCheck,
    tone: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  },
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
    <section className={cn("bg-card rounded-lg border", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <h3 className="text-sm font-medium leading-tight">
            Unified risk queue
          </h3>
          <p className="text-muted-foreground text-xs">
            Open critical items across vulnerabilities, cloud posture, and
            compliance
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="tabular-nums">
            {counts.total}
          </Badge>
          <Badge variant="outline" className="tabular-nums text-xs">
            {counts.vuln} CVE
          </Badge>
          <Badge variant="outline" className="tabular-nums text-xs">
            {counts.cspm} CSPM
          </Badge>
          <Badge variant="outline" className="tabular-nums text-xs">
            {counts.compliance} GRC
          </Badge>
        </div>
      </div>
      <ul className="divide-border max-h-[360px] divide-y overflow-y-auto">
        {items.length === 0 ? (
          <li className="text-muted-foreground px-3 py-6 text-center text-sm">
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
                  className="hover:bg-muted/40 flex items-start gap-3 px-3 py-2.5 transition-colors sm:px-4"
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md border",
                      meta.tone,
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>
                      <Badge
                        variant="outline"
                        className="rounded-full px-1.5 py-0 text-xs font-normal"
                      >
                        {meta.label}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground truncate text-xs">
                      {item.meta}
                    </p>
                  </div>
                  <ArrowRight
                    className="text-muted-foreground mt-1 size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })
        )}
      </ul>
      <div className="flex flex-wrap gap-2 border-t px-3 py-2 sm:px-4">
        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
          <Link href="/vulnerabilities/findings?severity=critical">
            Vulns
          </Link>
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
          <Link href="/cloud-posture?severity=critical">CSPM</Link>
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
          <Link href="/compliance">Compliance</Link>
        </Button>
      </div>
    </section>
  );
}
