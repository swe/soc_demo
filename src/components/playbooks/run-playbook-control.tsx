"use client";

import { Check, Play, X } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { useAlertsSession } from "@/components/alerts/alerts-session";
import { useIncidentsSession } from "@/components/incidents/incidents-session";
import {
  getPlaybookSnapshot,
  subscribePlaybooks,
} from "@/components/playbooks/playbooks-session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getPlaybookRun,
  type PlaybookRun,
  playbooksApi,
} from "@/lib/mock-api/playbooks";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

function StepList({ run }: { run: PlaybookRun }) {
  return (
    <ol className="space-y-2">
      {run.steps.map((step, index) => (
        <li
          key={step.id}
          className="flex items-start gap-2 rounded-md border px-2.5 py-2 text-xs"
        >
          <span className="text-muted-foreground font-mono">{index + 1}.</span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{step.label}</p>
            <p className="text-muted-foreground capitalize">{step.status.replaceAll("_", " ")}</p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 rounded-full font-normal capitalize",
              step.status === "succeeded" &&
                "border-emerald-500/40 text-emerald-700 dark:text-emerald-400",
              step.status === "awaiting_approval" &&
                "border-amber-500/40 text-amber-700 dark:text-amber-400",
              step.status === "rejected" &&
                "border-destructive/40 text-destructive",
            )}
          >
            {step.status.replaceAll("_", " ")}
          </Badge>
        </li>
      ))}
    </ol>
  );
}

export function RunPlaybookControl({
  incidentId,
  alertId,
  preferredPlaybookId,
  compact = false,
}: {
  incidentId?: string;
  alertId?: string;
  preferredPlaybookId?: string;
  compact?: boolean;
}) {
  const store = useSyncExternalStore(
    subscribePlaybooks,
    getPlaybookSnapshot,
    getPlaybookSnapshot,
  );

  const { getIncident } = useIncidentsSession();
  const alertsSession = useAlertsSession();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(
    preferredPlaybookId ?? "",
  );
  const [busy, setBusy] = useState(false);
  const [activeRun, setActiveRun] = useState<PlaybookRun | null>(null);

  const options = useMemo(
    () =>
      Array.from(store.values()).filter(
        (procedure) => procedure.status === "approved",
      ),
    [store],
  );

  useEffect(() => {
    if (preferredPlaybookId) setSelectedId(preferredPlaybookId);
  }, [preferredPlaybookId]);

  const startRun = async () => {
    if (!selectedId) {
      toast({ title: "Select a playbook" });
      return;
    }
    setBusy(true);
    try {
      if (incidentId && !getIncident(incidentId)) {
        toast({ title: "Incident not found" });
        return;
      }
      if (alertId && !alertsSession.getAlert(alertId)) {
        toast({ title: "Alert not found" });
        return;
      }
      const { run, receipt } = await playbooksApi.startRun({
        procedureId: selectedId,
        incidentId,
        alertId,
      });
      setActiveRun(run);
      toast({
        title: "Playbook awaiting approval",
        description: `${receipt.message} · ${receipt.outcome}`,
      });
    } catch (error) {
      toast({
        title: "Unable to start playbook",
        description:
          error instanceof Error ? error.message : "Playbook start failed",
      });
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    if (!activeRun) return;
    setBusy(true);
    try {
      const { run, receipt } = await playbooksApi.approveRun(activeRun.id);
      setActiveRun(run);
      toast({
        title: "Playbook completed",
        description: receipt.message,
      });
      setOpen(false);
      setActiveRun(null);
    } catch (error) {
      toast({
        title: "Approval failed",
        description:
          error instanceof Error ? error.message : "Unable to approve run",
      });
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!activeRun) return;
    setBusy(true);
    try {
      const { run, receipt } = await playbooksApi.rejectRun(activeRun.id);
      setActiveRun(run);
      toast({
        title: "Playbook rejected",
        description: receipt.message,
      });
      setOpen(false);
      setActiveRun(null);
    } catch (error) {
      toast({
        title: "Reject failed",
        description:
          error instanceof Error ? error.message : "Unable to reject run",
      });
    } finally {
      setBusy(false);
    }
  };

  // Refresh run from store if dialog stays open
  useEffect(() => {
    if (!activeRun) return;
    const latest = getPlaybookRun(activeRun.id);
    if (latest && latest.updatedAt !== activeRun.updatedAt) {
      setActiveRun(latest);
    }
  }, [activeRun]);

  const dialog = (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setActiveRun(null);
        if (next && preferredPlaybookId) setSelectedId(preferredPlaybookId);
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant={compact ? "outline" : "default"}
          className={cn("gap-1.5", !compact && "w-full", compact && "h-8 text-xs")}
        >
          <Play className="size-3.5" />
          Run playbook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Run playbook</DialogTitle>
          <DialogDescription>
            Run with an approval gate before containment.
          </DialogDescription>
        </DialogHeader>

        {!activeRun ? (
          <div className="space-y-3 py-1">
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select approved playbook" />
              </SelectTrigger>
              <SelectContent>
                {options.map((procedure) => (
                  <SelectItem key={procedure.id} value={procedure.id}>
                    <span className="font-mono text-xs">{procedure.code}</span>{" "}
                    {procedure.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-3 py-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {activeRun.id}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {activeRun.status.replaceAll("_", " ")}
              </Badge>
            </div>
            <p className="text-sm font-medium">{activeRun.procedureTitle}</p>
            <StepList run={activeRun} />
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {!activeRun ? (
            <Button type="button" onClick={startRun} disabled={busy || !selectedId}>
              Start run
            </Button>
          ) : activeRun.status === "awaiting_approval" ? (
            <div className="flex w-full flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                disabled={busy}
                onClick={reject}
              >
                <X className="size-3.5" />
                Reject
              </Button>
              <Button
                type="button"
                className="gap-1.5"
                disabled={busy}
                onClick={approve}
              >
                <Check className="size-3.5" />
                Approve containment
              </Button>
            </div>
          ) : (
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (compact) return dialog;

  return (
    <section className="bg-card rounded-lg border p-4">
      <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
        SOAR
      </h2>
      <p className="text-muted-foreground mb-3 text-sm">
        Start an approved playbook — approve the containment step to complete the
        run.
      </p>
      {dialog}
    </section>
  );
}
