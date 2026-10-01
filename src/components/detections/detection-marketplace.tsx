"use client";

import { Check, Download, Package } from "lucide-react";
import { useState } from "react";

import {
  detectionPacks,
  getDetectionPacksTotalRules,
} from "@/components/detections/detection-marketplace-data";
import {
  useDetectionsSession,
  useImportedDetectionPackIds,
} from "@/components/detections/detections-session";
import { Panel, PanelGrid, PanelHeading } from "@/components/soc/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { detectionsApi } from "@/lib/mock-api/detections";
import { toast } from "@/lib/toast";

export function DetectionMarketplace() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const totalRules = getDetectionPacksTotalRules();
  const importedPackIds = useImportedDetectionPackIds();
  const { stats } = useDetectionsSession();

  const importPack = async (packId: string) => {
    setBusyId(packId);
    try {
      const { pack, receipt, catalogTotal, alreadyImported } =
        await detectionsApi.importPack(packId);
      toast({
        title:
          receipt.outcome === "failed"
            ? "Import failed"
            : alreadyImported
              ? "Already imported"
              : "Pack imported",
        description: receipt.message,
      });
      if (pack && !alreadyImported) {
        toast({
          title: `${pack.ruleCount} rules staged`,
          description: `${pack.name} · catalog now ${catalogTotal}`,
        });
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Panel>
      <PanelHeading
        title="Detection marketplace"
        description={`${detectionPacks.length} packs · ${totalRules}+ rules available · runtime catalog ${stats.total}`}
      />

      <PanelGrid columns={4} className="gap-3">
        {detectionPacks.map((pack) => {
          const imported = importedPackIds.includes(pack.id);
          return (
            <article
              key={pack.id}
              className="flex flex-col gap-3 rounded-lg border p-3"
            >
              <div className="flex items-start gap-2">
                <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md">
                  <Package className="text-muted-foreground size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{pack.name}</p>
                  <p className="text-muted-foreground text-xs">{pack.vendor}</p>
                </div>
              </div>
              <p className="text-muted-foreground flex-1 text-xs leading-relaxed">
                {pack.description}
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="tabular-nums">
                  {pack.ruleCount} rules
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {pack.severityFocus}
                </Badge>
                {imported ? (
                  <Badge variant="outline" className="gap-1">
                    <Check className="size-3" />
                    Imported
                  </Badge>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs">
                  Updated {pack.updatedLabel}
                </span>
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={busyId === pack.id || imported}
                  variant={imported ? "outline" : "default"}
                  onClick={() => void importPack(pack.id)}
                >
                  {imported ? (
                    <>
                      <Check className="size-3.5" />
                      Imported
                    </>
                  ) : (
                    <>
                      <Download className="size-3.5" />
                      Import pack
                    </>
                  )}
                </Button>
              </div>
            </article>
          );
        })}
      </PanelGrid>
    </Panel>
  );
}
