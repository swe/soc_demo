"use client";

import Link from "next/link";
import { useMemo } from "react";

import { cloudFindings } from "@/components/cloud-posture/cloud-posture-data";
import { Panel, PanelHeading } from "@/components/soc/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { vulnerabilities } from "@/components/vulnerabilities/vulnerabilities-data";

type CorrelatedChip = {
  id: string;
  label: string;
  kind: "cspm" | "vuln";
  href: string;
};

/** Lightweight EASM correlation panel for dark-web / exposure surfaces. */
export function EasmCorrelationPanel({
  exposureTitle,
  tags = [],
}: {
  exposureTitle?: string;
  tags?: string[];
}) {
  const chips = useMemo(() => {
    const needle = [exposureTitle ?? "", ...tags].join(" ").toLowerCase();
    const cspm = cloudFindings
      .filter(
        (f) =>
          f.severity === "critical" ||
          f.severity === "high" ||
          (needle &&
            (f.title.toLowerCase().includes("public") ||
              f.title.toLowerCase().includes("exposed"))),
      )
      .slice(0, 3)
      .map(
        (f): CorrelatedChip => ({
          id: f.id,
          label: f.title.slice(0, 42),
          kind: "cspm",
          href: `/cloud-posture?q=${encodeURIComponent(f.id)}`,
        }),
      );

    const vulns = vulnerabilities
      .filter((v) => v.severity === "critical" || v.exploitable)
      .slice(0, 3)
      .map(
        (v): CorrelatedChip => ({
          id: v.id,
          label: `${v.cve} · ${v.title.slice(0, 28)}`,
          kind: "vuln",
          href: `/vulnerabilities/findings?q=${encodeURIComponent(v.cve)}`,
        }),
      );

    return [...cspm, ...vulns];
  }, [exposureTitle, tags]);

  return (
    <Panel>
      <PanelHeading
        title="EASM correlation"
        description="CSPM and vulnerability findings correlated to this exposure"
        action={
          <Button size="sm" asChild>
            <Link
              href={`/incidents?createFrom=easm&title=${encodeURIComponent(exposureTitle ?? "External exposure")}`}
            >
              Open incident
            </Link>
          </Button>
        }
      />
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Link key={chip.id} href={chip.href}>
            <Badge variant="outline" className="max-w-full gap-1.5 font-normal">
              <span className="text-muted-foreground uppercase">{chip.kind}</span>
              <span className="truncate">{chip.label}</span>
            </Badge>
          </Link>
        ))}
        {chips.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No correlated CSPM/vuln findings for this selection.
          </p>
        ) : null}
      </div>
    </Panel>
  );
}
