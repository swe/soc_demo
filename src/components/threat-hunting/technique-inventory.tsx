"use client";

import {
  ChevronDown,
  ChevronRight,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { SeverityBadge } from "@/components/alerts/alerts-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  type TechniqueInventoryRow,
  type ThreatTrend,
} from "./threat-analytics-data";

function TrendIcon({ trend }: { trend: ThreatTrend }) {
  if (trend === "up") {
    return (
      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
        <TrendingUp className="size-3.5" />
        <span className="sr-only">Trending up</span>
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
        <TrendingDown className="size-3.5" />
        <span className="sr-only">Trending down</span>
      </span>
    );
  }
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1">
      <Minus className="size-3.5" />
      <span className="sr-only">Flat</span>
    </span>
  );
}

const severityBar: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
};

export function TechniqueInventory({
  rows,
  selectedTechniqueId,
  selectedGraphNodeId,
  onSelect,
  onViewDetails,
}: {
  rows: TechniqueInventoryRow[];
  selectedTechniqueId: string | null;
  selectedGraphNodeId: string | null;
  onSelect: (row: TechniqueInventoryRow) => void;
  onViewDetails: (row: TechniqueInventoryRow) => void;
}) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const pageSize = 10;

  React.useEffect(() => {
    setPage(0);
  }, [rows]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = rows.slice(safePage * pageSize, (safePage + 1) * pageSize);

  return (
    <section className="bg-card flex h-full min-h-0 flex-col rounded-lg border">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Technique inventory</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {rows.length.toLocaleString("en-US")} techniques · detections from
          alert catalog
        </p>
      </div>

      <div className="relative min-h-0 flex-1 overflow-auto">
        {rows.length === 0 ? (
          <div className="text-muted-foreground grid h-40 place-items-center px-4 text-center text-sm">
            No techniques match the current filters.
          </div>
        ) : (
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground sticky top-0 z-10 text-xs tracking-wide uppercase">
              <tr className="border-b">
                <th className="w-8 px-2 py-2 font-medium" />
                <th className="px-2 py-2 font-medium">ID</th>
                <th className="px-2 py-2 font-medium">Technique</th>
                <th className="hidden px-2 py-2 font-medium xl:table-cell">
                  Tactic
                </th>
                <th className="px-2 py-2 text-right font-medium">Det.</th>
                <th className="px-2 py-2 font-medium">Sev</th>
                <th className="px-2 py-2 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => {
                const selected =
                  selectedTechniqueId === row.id ||
                  (row.graphNodeId !== undefined &&
                    row.graphNodeId === selectedGraphNodeId);
                const expanded = expandedId === row.id;

                return (
                  <React.Fragment key={row.id}>
                    <tr
                      className={cn(
                        "hover:bg-muted/40 cursor-pointer border-b transition-colors",
                        selected && "bg-primary/5",
                      )}
                      onClick={() => onSelect(row)}
                    >
                      <td className="relative px-2 py-2.5">
                        <span
                          className={cn(
                            "absolute inset-y-2 left-0 w-0.5 rounded-full",
                            severityBar[row.severity],
                          )}
                        />
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground inline-flex size-6 items-center justify-center rounded-md"
                          aria-label={expanded ? "Collapse" : "Expand"}
                          onClick={(event) => {
                            event.stopPropagation();
                            setExpandedId(expanded ? null : row.id);
                          }}
                        >
                          {expanded ? (
                            <ChevronDown className="size-3.5" />
                          ) : (
                            <ChevronRight className="size-3.5" />
                          )}
                        </button>
                      </td>
                      <td className="px-2 py-2.5 font-mono text-xs">
                        {row.id}
                      </td>
                      <td className="max-w-[140px] truncate px-2 py-2.5 text-xs font-medium">
                        {row.name}
                      </td>
                      <td className="hidden px-2 py-2.5 xl:table-cell">
                        <Badge
                          variant="secondary"
                          className="rounded-full text-xs font-normal"
                        >
                          {row.tactic}
                        </Badge>
                      </td>
                      <td className="px-2 py-2.5 text-right text-xs tabular-nums">
                        {row.detections.toLocaleString("en-US")}
                      </td>
                      <td className="px-2 py-2.5">
                        <SeverityBadge severity={row.severity} />
                      </td>
                      <td className="px-2 py-2.5">
                        <TrendIcon trend={row.trend} />
                      </td>
                    </tr>
                    {expanded ? (
                      <tr className="bg-muted/20 border-b">
                        <td colSpan={7} className="px-4 py-3">
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {row.summary}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-muted-foreground text-xs">
                              Last seen {row.lastSeen} · {row.openAlertCount}{" "}
                              open
                            </span>
                            <div className="ml-auto flex flex-wrap gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 rounded-md text-xs"
                                asChild
                              >
                                <Link
                                  href={`/alerts?q=${encodeURIComponent(row.id)}`}
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  Alerts
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 rounded-md text-xs"
                                asChild
                              >
                                <Link
                                  href={`/investigate?q=${encodeURIComponent(
                                    `events | where mitre.technique == "${row.id}" | take 50`,
                                  )}`}
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  Investigate
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 rounded-md text-xs"
                                asChild
                              >
                                <Link
                                  href="/threat-intelligence"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  TI
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 rounded-md text-xs"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onViewDetails(row);
                                }}
                              >
                                View details
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-muted-foreground flex items-center justify-between gap-2 border-t px-3 py-2 text-xs">
        <span>
          Page {safePage + 1} / {pageCount}
        </span>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
