"use client";

import { Download, Play } from "lucide-react";
import { useState } from "react";

import {
  complianceControls,
  getUser,
  toContinuousProbe,
} from "@/components/compliance/compliance-data";
import { useComplianceSession } from "@/components/compliance/compliance-session";
import { Panel, PanelHeading } from "@/components/soc/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { complianceApi } from "@/lib/mock-api/compliance";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const probeTone: Record<string, string> = {
  healthy:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  degraded:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  failed: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
  paused: "border-muted-foreground/30 bg-muted text-muted-foreground",
  idle: "border-muted-foreground/30 bg-muted text-muted-foreground",
  running: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};

export function GrcAuditorPacksPanel() {
  const { collectors } = useComplianceSession();
  const [busyProbeId, setBusyProbeId] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  const probes = collectors.map(toContinuousProbe);

  const sampleOwners = complianceControls.slice(0, 6).map((control) => ({
    code: control.code,
    title: control.title,
    owner: getUser(control.ownerId)?.name ?? "Unassigned",
  }));

  const runProbe = async (probeId: string) => {
    setBusyProbeId(probeId);
    try {
      const { receipt, probe } = await complianceApi.runProbe(probeId);
      toast({
        title: receipt.outcome === "ok" ? "Probe completed" : "Probe failed",
        description: `${receipt.message} · ${receipt.id}${
          probe ? ` · lastRun ${probe.lastRun}` : ""
        }`,
        variant: receipt.outcome === "failed" ? "destructive" : undefined,
      });
    } finally {
      setBusyProbeId(null);
    }
  };

  const exportPack = async () => {
    setExportBusy(true);
    try {
      const { receipt, result } = await complianceApi.exportAuditorPack("all");
      toast({
        title: "Auditor pack exported",
        description: `${result.controls} controls · ${result.evidence} evidence · ${result.findings} findings · ${receipt.id}`,
      });
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <Panel>
      <PanelHeading
        title="GRC auditor packs"
        description="Evidence pack download, control owners, and continuous probe status"
        action={
          <Button
            size="sm"
            className="gap-1.5"
            disabled={exportBusy}
            onClick={() => void exportPack()}
          >
            <Download className="size-3.5" />
            {exportBusy ? "Exporting…" : "Evidence pack"}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Control owners
          </p>
          <ul className="space-y-2">
            {sampleOwners.map((row) => (
              <li
                key={row.code}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs">{row.code}</p>
                  <p className="truncate">{row.title}</p>
                </div>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {row.owner}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Continuous probes
          </p>
          <ul className="space-y-2">
            {probes.map((probe) => (
              <li
                key={probe.id}
                className="flex items-start justify-between gap-3 rounded-md border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{probe.name}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        probeTone[probe.status] ?? probeTone.idle,
                      )}
                    >
                      {probe.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-0.5 font-mono text-xs">
                    controlId={probe.controlId}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {probe.schedule} · lastRun {probe.lastRun}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 shrink-0 gap-1 px-2 text-xs"
                  disabled={busyProbeId === probe.id}
                  onClick={() => void runProbe(probe.id)}
                >
                  <Play className="size-3" />
                  {busyProbeId === probe.id ? "Running…" : "Run"}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}
