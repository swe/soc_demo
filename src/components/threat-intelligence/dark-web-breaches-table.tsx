"use client";

import { Database, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import {
  breachDataClassLabels,
  type DarkWebBreach,
  type DarkWebExposure,
  getBreachExposureCount,
  getExposuresForBreach,
} from "./dark-web-data";
import {
  ExposureTypeBadge,
  mutedControlClassName,
  SeverityBadge,
  SheetDetailRow,
} from "./dark-web-primitives";

export function DarkWebBreachesTable({
  breaches,
  exposures,
  onOpenBreach,
}: {
  breaches: DarkWebBreach[];
  exposures: DarkWebExposure[];
  onOpenBreach: (id: string) => void;
}) {
  return (
    <div className="bg-card overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Breach</TableHead>
            <TableHead className="hidden w-[100px] sm:table-cell">Date</TableHead>
            <TableHead className="w-[88px]">Records</TableHead>
            <TableHead className="hidden md:table-cell">Data classes</TableHead>
            <TableHead className="w-[88px]">Matched</TableHead>
            <TableHead className="w-[72px]">Ours</TableHead>
            <TableHead className="w-[100px]">Org impact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {breaches.map((breach) => {
            const ours = getBreachExposureCount(exposures, breach.id);
            return (
              <TableRow
                key={breach.id}
                className="cursor-pointer"
                onClick={() => onOpenBreach(breach.id)}
              >
                <TableCell>
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-medium">{breach.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {breach.source}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                  {breach.dateLabel}
                </TableCell>
                <TableCell className="font-mono text-sm tabular-nums">
                  {breach.records.toLocaleString("en-US")}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {breach.dataClasses.map((cls) => (
                      <Badge
                        key={cls}
                        variant="outline"
                        className="rounded-md px-1.5 py-0 text-[10px] font-normal"
                      >
                        {breachDataClassLabels[cls]}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      breach.matchedToWatchlist
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {breach.matchedToWatchlist ? "Yes" : "No"}
                  </span>
                </TableCell>
                <TableCell className="tabular-nums">{ours}</TableCell>
                <TableCell>
                  <SeverityBadge severity={breach.orgImpact} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function DarkWebBreachDetailSheet({
  breach,
  exposures,
  open,
  onOpenChange,
  onOpenExposure,
}: {
  breach: DarkWebBreach | null;
  exposures: DarkWebExposure[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenExposure: (id: string) => void;
}) {
  const ours = breach
    ? getExposuresForBreach(exposures, breach.id).sort(
        (a, b) => b.firstSeen - a.firstSeen,
      )
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        {breach ? (
          <>
            <SheetHeader className="space-y-3 pb-4">
              <div className="flex items-start gap-3">
                <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg border">
                  <Database className="text-muted-foreground size-4" />
                </span>
                <div className="min-w-0">
                  <SheetTitle className="text-base leading-snug">
                    {breach.name}
                  </SheetTitle>
                  <SheetDescription className="mt-1">
                    {breach.source} · {breach.dateLabel}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={breach.orgImpact} />
                <Badge variant="secondary" className="rounded-full font-normal">
                  {breach.matchedToWatchlist
                    ? "Watchlist match"
                    : "No watchlist match"}
                </Badge>
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 pb-6">
              <section className="space-y-2">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Summary
                </h3>
                <p className="text-sm leading-relaxed">{breach.summary}</p>
              </section>

              <section className="space-y-2.5">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Metadata
                </h3>
                <SheetDetailRow label="Records">
                  {breach.records.toLocaleString("en-US")}
                </SheetDetailRow>
                <SheetDetailRow label="Data classes">
                  {breach.dataClasses
                    .map((cls) => breachDataClassLabels[cls])
                    .join(", ")}
                </SheetDetailRow>
              </section>

              <section className="space-y-2.5">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Our exposures from this breach
                </h3>
                {ours.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No org-matched exposures linked yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {ours.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onOpenExposure(item.id)}
                          className="hover:bg-muted/60 flex w-full items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {item.title}
                            </p>
                            <p className="text-muted-foreground truncate text-[11px]">
                              {item.principal ?? item.domain ?? item.id}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <SeverityBadge severity={item.severity} />
                            <ExposureTypeBadge type={item.type} />
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {ours.length > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("mt-1 gap-1", mutedControlClassName)}
                    onClick={() => {
                      if (ours[0]) onOpenExposure(ours[0].id);
                    }}
                  >
                    Open first exposure
                    <ExternalLink className="size-3.5" />
                  </Button>
                ) : null}
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
