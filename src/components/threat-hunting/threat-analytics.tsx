"use client";

import {
  Filter,
  Search,
} from "lucide-react";
import * as React from "react";

import { alertSeverities,type AlertSeverity } from "@/components/alerts/alerts-data";
import { type SocStat,StatsStrip } from "@/components/soc/stats-strip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { MitreCoverageMap } from "./mitre-coverage-map";
import { TechniqueInventory } from "./technique-inventory";
import {
  emptyThreatFilters,
  filterGraphNodes,
  filterTechniqueInventory,
  getNodeDetail,
  getTechniqueDetail,
  getThreatAnalyticsKpis,
  techniqueInventory,
  type TechniqueInventoryRow,
  type ThreatAnalyticsFilters,
  threatGraphNodes,
  type ThreatNodeDetail,
} from "./threat-analytics-data";
import { ThreatDetailSheet } from "./threat-detail-sheet";
import { ThreatRelationshipMap } from "./threat-relationship-map";

const dateRangeLabel = "Jan 29, 2025 – Jul 28, 2026";

export function ThreatAnalytics() {
  const [filters, setFilters] =
    React.useState<ThreatAnalyticsFilters>(emptyThreatFilters);
  const [selectedGraphId, setSelectedGraphId] = React.useState<string | null>(
    null,
  );
  const [selectedTechniqueId, setSelectedTechniqueId] = React.useState<
    string | null
  >(null);
  const [detail, setDetail] = React.useState<ThreatNodeDetail | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const kpis = React.useMemo(() => getThreatAnalyticsKpis(), []);

  const filteredInventory = React.useMemo(
    () => filterTechniqueInventory(techniqueInventory, filters),
    [filters],
  );

  const visibleGraphNodes = React.useMemo(
    () => filterGraphNodes(threatGraphNodes, filters),
    [filters],
  );

  const visibleNodeIds = React.useMemo(() => {
    const hasNodeFilters =
      filters.query.trim().length > 0 ||
      filters.severities.length > 0 ||
      filters.kinds.length > 0 ||
      filters.criticalOnly;
    if (!hasNodeFilters) return null;
    return new Set(visibleGraphNodes.map((node) => node.id));
  }, [filters, visibleGraphNodes]);

  const openNodeDetail = React.useCallback((nodeId: string) => {
    const next = getNodeDetail(nodeId);
    if (!next) return;
    setSelectedGraphId(nodeId);
    setSelectedTechniqueId(
      next.node.kind === "technique"
        ? String(next.node.meta.technique ?? next.node.label)
        : null,
    );
    setDetail(next);
    setSheetOpen(true);
  }, []);

  const openTechniqueDetail = React.useCallback((row: TechniqueInventoryRow) => {
    setSelectedTechniqueId(row.id);
    if (row.graphNodeId) {
      setSelectedGraphId(row.graphNodeId);
    }
    const next = getTechniqueDetail(row.id);
    if (!next) return;
    setDetail(next);
    setSheetOpen(true);
  }, []);

  const handleGraphSelect = React.useCallback(
    (id: string | null) => {
      setSelectedGraphId(id);
      if (!id) {
        setSelectedTechniqueId(null);
        setSheetOpen(false);
        return;
      }
      openNodeDetail(id);
    },
    [openNodeDetail],
  );

  const handleInventorySelect = React.useCallback(
    (row: TechniqueInventoryRow) => {
      setSelectedTechniqueId(row.id);
      if (row.graphNodeId) {
        setSelectedGraphId(row.graphNodeId);
      } else {
        setSelectedGraphId(null);
      }
    },
    [],
  );

  const toggleSeverity = (severity: AlertSeverity) => {
    setFilters((current) => {
      const exists = current.severities.includes(severity);
      return {
        ...current,
        severities: exists
          ? current.severities.filter((item) => item !== severity)
          : [...current.severities, severity],
      };
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="bg-background shrink-0 border-b px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={filters.query}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  query: event.target.value,
                }))
              }
              className="h-9 rounded-md pl-9"
              placeholder="Search technique id, name, actor, or identity…"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
              <Filter className="size-3.5" />
              Severity
            </span>
            {alertSeverities.map((severity) => {
              const active = filters.severities.includes(severity);
              return (
                <button
                  key={severity}
                  type="button"
                  onClick={() => toggleSeverity(severity)}
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs capitalize transition-colors",
                    active
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {severity}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:ml-auto">
            <p className="text-muted-foreground text-xs tabular-nums">
              {dateRangeLabel}
            </p>
            <div className="flex items-center gap-2">
              <Switch
                id="critical-only"
                checked={filters.criticalOnly}
                onCheckedChange={(checked) =>
                  setFilters((current) => ({
                    ...current,
                    criticalOnly: checked,
                  }))
                }
              />
              <Label htmlFor="critical-only" className="text-xs font-normal">
                Critical only
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="trending-up"
                checked={filters.trendingUpOnly}
                onCheckedChange={(checked) =>
                  setFilters((current) => ({
                    ...current,
                    trendingUpOnly: checked,
                  }))
                }
              />
              <Label htmlFor="trending-up" className="text-xs font-normal">
                Trending up only
              </Label>
            </div>
            {(filters.query ||
              filters.severities.length > 0 ||
              filters.criticalOnly ||
              filters.trendingUpOnly) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setFilters(emptyThreatFilters)}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <StatsStrip
            className="border-b-0 pb-0"
            stats={kpis.map(
              (kpi): SocStat => ({
                key: kpi.key,
                title: kpi.title,
                value: kpi.value,
                context: kpi.context,
              }),
            )}
          />

          <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
            <div className="flex min-h-[420px] flex-col lg:min-h-[560px]">
              <ThreatRelationshipMap
                selectedId={selectedGraphId}
                onSelect={handleGraphSelect}
                visibleNodeIds={visibleNodeIds}
              />
            </div>
            <div className="flex min-h-[420px] flex-col lg:min-h-[560px]">
              <TechniqueInventory
                rows={filteredInventory}
                selectedTechniqueId={selectedTechniqueId}
                selectedGraphNodeId={selectedGraphId}
                onSelect={handleInventorySelect}
                onViewDetails={openTechniqueDetail}
              />
            </div>
          </div>

          <MitreCoverageMap />
        </div>
      </div>

      <ThreatDetailSheet
        detail={detail}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            // Keep selection highlight; only close sheet.
          }
        }}
        onSelectNeighbor={(nodeId) => openNodeDetail(nodeId)}
      />
    </div>
  );
}
