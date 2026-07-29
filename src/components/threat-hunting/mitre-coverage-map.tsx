"use client";

import { Download } from "lucide-react";
import { useMemo } from "react";

import { detectionRules } from "@/components/detections/detections-data";
import { socIncidents } from "@/components/incidents/incidents-data";
import { Panel, PanelHeading } from "@/components/soc/panel";
import { threatHunts } from "@/components/threats/threat-shared-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  techniqueInventory,
  type TechniqueInventoryRow,
} from "./threat-analytics-data";

type CoverageCell = {
  technique: TechniqueInventoryRow;
  detections: number;
  hunts: number;
  openIncidents: number;
  gap: boolean;
};

function buildCoverage(): CoverageCell[] {
  const detectionByTech = new Map<string, number>();
  for (const rule of detectionRules) {
    for (const tech of rule.mitreTechniques) {
      detectionByTech.set(tech, (detectionByTech.get(tech) ?? 0) + 1);
    }
  }

  const huntByTech = new Map<string, number>();
  for (const hunt of threatHunts) {
    for (const tech of hunt.techniqueIds) {
      huntByTech.set(tech, (huntByTech.get(tech) ?? 0) + 1);
    }
  }

  const openStatuses = new Set([
    "new",
    "triaging",
    "investigating",
    "containing",
    "contained",
  ]);
  const incidentByTech = new Map<string, number>();
  for (const incident of socIncidents) {
    if (!openStatuses.has(incident.status)) continue;
    if (incident.mitreTechnique) {
      incidentByTech.set(
        incident.mitreTechnique,
        (incidentByTech.get(incident.mitreTechnique) ?? 0) + 1,
      );
    }
  }

  return techniqueInventory.map((technique) => {
    const detections =
      detectionByTech.get(technique.id) ?? technique.detections;
    const hunts = huntByTech.get(technique.id) ?? 0;
    const openIncidents =
      incidentByTech.get(technique.id) ?? technique.openAlertCount;
    const gap = detections === 0 || (hunts === 0 && openIncidents > 0);
    return { technique, detections, hunts, openIncidents, gap };
  });
}

function downloadNavigatorLayer(cells: CoverageCell[]) {
  const techniques = cells.map((cell) => ({
    techniqueID: cell.technique.id,
    score: cell.gap ? 0 : Math.min(3, cell.detections + (cell.hunts > 0 ? 1 : 0)),
    color: cell.gap ? "#ef4444" : cell.detections > 0 ? "#22c55e" : "#f59e0b",
    comment: `detections=${cell.detections}; hunts=${cell.hunts}; openIncidents=${cell.openIncidents}`,
  }));

  const layer = {
    name: "Heimdall SOC coverage",
    versions: { attack: "15", navigator: "5.0", layer: "4.5" },
    domain: "enterprise-attack",
    description:
      "Detections × hunts × open incidents coverage exported from Heimdall Threat Analytics.",
    techniques,
    gradient: {
      colors: ["#ef4444", "#f59e0b", "#22c55e"],
      minValue: 0,
      maxValue: 3,
    },
    legendItems: [
      { label: "Gap", color: "#ef4444" },
      { label: "Partial", color: "#f59e0b" },
      { label: "Covered", color: "#22c55e" },
    ],
  };

  const blob = new Blob([JSON.stringify(layer, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `heimdall-attack-navigator-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function MitreCoverageMap() {
  const cells = useMemo(() => buildCoverage(), []);
  const byTactic = useMemo(() => {
    const map = new Map<string, CoverageCell[]>();
    for (const cell of cells) {
      const tactic = cell.technique.tactic || "Unknown";
      const list = map.get(tactic) ?? [];
      list.push(cell);
      map.set(tactic, list);
    }
    return [...map.entries()];
  }, [cells]);

  const gaps = cells.filter((c) => c.gap).length;
  const tacticCount = byTactic.length;
  const tacticCols =
    tacticCount <= 2
      ? "sm:grid-cols-2 xl:grid-cols-2"
      : tacticCount === 3
        ? "sm:grid-cols-3 xl:grid-cols-3"
        : tacticCount === 4
          ? "sm:grid-cols-2 xl:grid-cols-4"
          : tacticCount === 5
            ? "sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5"
            : "sm:grid-cols-2 xl:grid-cols-3";

  return (
    <Panel>
      <PanelHeading
        title="MITRE coverage map"
        description={`${cells.length} techniques · ${gaps} coverage gaps · detections × hunts × open incidents`}
        action={
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => downloadNavigatorLayer(cells)}
          >
            <Download className="size-3.5" />
            ATT&CK Navigator layer
          </Button>
        }
      />

      <div className={cn("grid gap-3", tacticCols)}>
        {byTactic.map(([tactic, tacticCells]) => (
          <div key={tactic} className="rounded-md border p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold tracking-wide uppercase">
                {tactic}
              </p>
              <Badge variant="secondary" className="tabular-nums">
                {tacticCells.length}
              </Badge>
            </div>
            <ul className="space-y-1.5">
              {tacticCells.map((cell) => (
                <li
                  key={cell.technique.id}
                  className={cn(
                    "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded px-2 py-1.5 text-xs",
                    cell.gap
                      ? "bg-red-500/10 text-red-800 dark:text-red-300"
                      : "bg-muted/40",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono font-medium">
                      {cell.technique.id}
                    </p>
                    <p className="text-muted-foreground truncate">
                      {cell.technique.name}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1 tabular-nums">
                    <span title="Detections">D{cell.detections}</span>
                    <span title="Hunts">H{cell.hunts}</span>
                    <span title="Open incidents">I{cell.openIncidents}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}
