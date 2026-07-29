"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Play } from "lucide-react";

import {
  getPlaybookSnapshot,
  runPlaybookAgainstIncident,
  runPlaybookFromAlert,
  subscribePlaybooks,
} from "@/components/playbooks/playbooks-session";
import { useAlertsSession } from "@/components/alerts/alerts-session";
import { useIncidentsSession } from "@/components/incidents/incidents-session";
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
import { toast } from "@/lib/toast";

export function RunPlaybookControl({
  incidentId,
  alertId,
}: {
  incidentId?: string;
  alertId?: string;
}) {
  // Snapshot must be referentially stable between store updates.
  const store = useSyncExternalStore(
    subscribePlaybooks,
    getPlaybookSnapshot,
    getPlaybookSnapshot,
  );

  const { getIncident, patchIncidents } = useIncidentsSession();
  const alertsSession = useAlertsSession();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  const options = useMemo(
    () =>
      Array.from(store.values()).filter(
        (procedure) => procedure.status === "approved",
      ),
    [store],
  );

  const run = () => {
    if (!selectedId) {
      toast({ title: "Select a playbook" });
      return;
    }

    try {
      if (incidentId) {
        const incident = getIncident(incidentId);
        if (!incident) {
          toast({ title: "Incident not found" });
          return;
        }
        const result = runPlaybookAgainstIncident(
          selectedId,
          incident,
          patchIncidents,
        );
        toast({
          title: "Playbook running",
          description: `${result.procedure.code} on ${result.incidentId}`,
        });
      } else if (alertId) {
        const alert = alertsSession.getAlert(alertId);
        if (!alert) {
          toast({ title: "Alert not found" });
          return;
        }
        alertsSession.patchAlerts([alert.id], { status: "escalated" });
        const result = runPlaybookFromAlert(
          selectedId,
          alert,
          getIncident,
          patchIncidents,
        );
        toast({
          title: "Playbook running",
          description: `${result.procedure.code} via new case ${result.incidentId}`,
        });
      }
      setOpen(false);
      setSelectedId("");
    } catch (error) {
      toast({
        title: "Playbook failed",
        description:
          error instanceof Error ? error.message : "Unable to run playbook",
      });
    }
  };

  return (
    <section className="bg-card rounded-lg border p-4">
      <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
        SOAR
      </h2>
      <p className="text-muted-foreground mb-3 text-sm">
        Run an approved response playbook against this case.
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="w-full gap-1.5">
            <Play className="size-3.5" />
            Run playbook
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run playbook</DialogTitle>
            <DialogDescription>
              Executes the playbook in-session: bumps run count, writes timeline
              and war room activity
              {alertId ? ", and escalates the alert into a case" : ""}.
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Select approved playbook" />
            </SelectTrigger>
            <SelectContent>
              {options.map((procedure) => (
                <SelectItem key={procedure.id} value={procedure.id}>
                  {procedure.code} — {procedure.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={run}>
              <Play className="size-3.5" />
              Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
