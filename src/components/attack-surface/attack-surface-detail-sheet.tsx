"use client";

import Link from "next/link";
import { useMemo } from "react";

import { EasmCorrelationPanel } from "@/components/threat-intelligence/easm-correlation-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  type AttackSurfaceAsset,
  resolveAssetCorrelations,
} from "./attack-surface-data";
import {
  CriticalityBadge,
  EnvironmentBadge,
  ExposureScoreBadge,
  SheetDetailRow,
} from "./attack-surface-primitives";

export function AttackSurfaceDetailSheet({
  asset,
  open,
  onOpenChange,
}: {
  asset: AttackSurfaceAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const correlations = useMemo(
    () => (asset ? resolveAssetCorrelations(asset) : null),
    [asset],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg">
        {asset && correlations ? (
          <>
            <SheetHeader className="space-y-3 pb-4">
              <div className="min-w-0">
                <SheetTitle className="text-base leading-snug">
                  {asset.hostname}
                </SheetTitle>
                <SheetDescription className="mt-1 font-mono text-xs">
                  {asset.id} · {asset.ip}
                </SheetDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ExposureScoreBadge score={asset.exposureScore} />
                <CriticalityBadge criticality={asset.criticality} />
                <EnvironmentBadge environment={asset.environment} />
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4 pb-4">
              <section className="space-y-2.5">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Asset
                </h3>
                <SheetDetailRow label="Owner">{asset.owner}</SheetDetailRow>
                <SheetDetailRow label="Ports">
                  {asset.ports.join(", ")}
                </SheetDetailRow>
                <SheetDetailRow label="Last scanned">
                  {asset.lastScannedLabel}
                </SheetDetailRow>
                <SheetDetailRow label="Technologies">
                  {asset.technologies.join(" · ")}
                </SheetDetailRow>
                <p className="text-muted-foreground pt-1 text-xs leading-relaxed">
                  {asset.notes}
                </p>
                {asset.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {asset.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="rounded-full text-xs font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </section>

              <Separator />

              <section className="space-y-2">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Vulnerabilities ({correlations.vulns.length})
                </h3>
                {correlations.vulns.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No correlated vulnerability findings.
                  </p>
                ) : (
                  <ul className="divide-border/60 divide-y">
                    {correlations.vulns.map((v) => (
                      <li key={v.id} className="py-2 first:pt-0 last:pb-0">
                        <Link
                          href={`/vulnerabilities/findings?q=${encodeURIComponent(v.cve)}`}
                          className="text-primary font-mono text-sm font-medium hover:underline"
                        >
                          {v.cve}
                        </Link>
                        <p className="text-muted-foreground truncate text-xs">
                          {v.title}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  CSPM findings ({correlations.cspm.length})
                </h3>
                {correlations.cspm.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No correlated CSPM findings.
                  </p>
                ) : (
                  <ul className="divide-border/60 divide-y">
                    {correlations.cspm.map((f) => (
                      <li key={f.id} className="py-2 first:pt-0 last:pb-0">
                        <Link
                          href={`/cloud-posture?q=${encodeURIComponent(f.id)}`}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          {f.title}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {f.provider.toUpperCase()} · {f.resourceName} ·{" "}
                          {f.severity}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="space-y-2">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Dark-web exposures ({correlations.darkWeb.length})
                </h3>
                {correlations.darkWeb.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No dark-web hits linked to this asset.
                  </p>
                ) : (
                  <ul className="divide-border/60 divide-y">
                    {correlations.darkWeb.map((e) => (
                      <li key={e.id} className="py-2 first:pt-0 last:pb-0">
                        <Link
                          href={`/threat-intelligence/dark-web?id=${encodeURIComponent(e.id)}`}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          {e.title}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                          {e.type} · {e.severity} · {e.source}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <EasmCorrelationPanel
                exposureTitle={asset.hostname}
                tags={asset.tags}
              />
            </div>

            <SheetFooter className="mt-auto border-t pt-4">
              <Button size="sm" asChild>
                <Link
                  href={`/incidents?createFrom=easm&title=${encodeURIComponent(
                    `External exposure · ${asset.hostname}`,
                  )}`}
                >
                  Open incident
                </Link>
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
