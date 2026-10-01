"use client";

import { Search } from "lucide-react";
import * as React from "react";

import {
  alertSeverities,
  type AlertSeverity,
} from "@/components/alerts/alerts-data";
import { FilterChip } from "@/components/soc/filter-chip";
import {
  ModuleShell,
  ModuleToolbarActions,
  ModuleToolbarSearch,
} from "@/components/soc/module-shell";
import { type SocStat, StatsStrip } from "@/components/soc/stats-strip";
import { ToolbarToggle } from "@/components/soc/toolbar-toggle";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

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

  const openTechniqueDetail = React.useCallback(
    (row: TechniqueInventoryRow) => {
      setSelectedTechniqueId(row.id);
      if (row.graphNodeId) {
        setSelectedGraphId(row.graphNodeId);
      }
      const next = getTechniqueDetail(row.id);
      if (!next) return;
      setDetail(next);
      setSheetOpen(true);
    },
    [],
  );

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

  const hasFilters =
    filters.query ||
    filters.severities.length > 0 ||
    filters.criticalOnly ||
    filters.trendingUpOnly;

  return (
    <ModuleShell
      toolbar={
        <>
          <ModuleToolbarSearch>
            <InputGroup className="h-9 w-full">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={filters.query}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    query: event.target.value,
                  }))
                }
                aria-label="Search techniques"
                placeholder="Search technique id, name, actor, or identity…"
              />
            </InputGroup>
          </ModuleToolbarSearch>

          <ModuleToolbarActions>
            <div
              role="group"
              aria-label="Severity"
              className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto"
            >
              {alertSeverities.map((severity) => (
                <FilterChip
                  key={severity}
                  pressed={filters.severities.includes(severity)}
                  onClick={() => toggleSeverity(severity)}
                  className="capitalize"
                >
                  {severity}
                </FilterChip>
              ))}
            </div>
            <ToolbarToggle
              id="critical-only"
              checked={filters.criticalOnly}
              onCheckedChange={(checked) =>
                setFilters((current) => ({ ...current, criticalOnly: checked }))
              }
              label="Critical only"
            />
            <ToolbarToggle
              id="trending-up"
              checked={filters.trendingUpOnly}
              onCheckedChange={(checked) =>
                setFilters((current) => ({
                  ...current,
                  trendingUpOnly: checked,
                }))
              }
              label="Trending up"
            />
            {hasFilters ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-9"
                onClick={() => setFilters(emptyThreatFilters)}
              >
                Clear
              </Button>
            ) : null}
          </ModuleToolbarActions>
        </>
      }
    >
      <p className="text-muted-foreground text-caption -mb-2 tabular-nums">
        {dateRangeLabel}
      </p>
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

      <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
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
    </ModuleShell>
  );
}
