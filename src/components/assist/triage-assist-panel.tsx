"use client";

import { Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  buildAlertAssist,
  buildIncidentAssist,
  type AssistSuggestion,
} from "@/components/assist/triage-assist";
import type { SocAlert } from "@/components/alerts/alerts-data";
import { useAlertsSession } from "@/components/alerts/alerts-session";
import { SeverityBadge } from "@/components/alerts/alerts-primitives";
import type { SocIncident } from "@/components/incidents/incidents-data";
import { useIncidentsSession } from "@/components/incidents/incidents-session";
import { PriorityBadge } from "@/components/incidents/incidents-primitives";
import {
  runPlaybookAgainstIncident,
  runPlaybookFromAlert,
} from "@/components/playbooks/playbooks-session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type TriageAssistPanelProps = {
  alert?: SocAlert;
  incident?: SocIncident;
  onApplyNotes?: (notes: string) => void;
  className?: string;
  triggerClassName?: string;
};

function AssistBody({
  suggestion,
  onApplyNotes,
  onRunPlaybook,
  running,
}: {
  suggestion: AssistSuggestion;
  onApplyNotes?: (notes: string) => void;
  onRunPlaybook?: () => void;
  running?: boolean;
}) {
  return (
    <div className="mt-4 space-y-4 pb-6">
      <Card className="shadow-none">
        <CardHeader className="space-y-1 p-4 pb-2">
          <CardTitle className="text-sm">Recommended playbook</CardTitle>
          <CardDescription className="text-xs">
            Deterministic match from approved procedures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0">
          {suggestion.playbook ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {suggestion.playbook.code}
                </Badge>
                <span className="text-sm font-medium">
                  {suggestion.playbook.title}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                {suggestion.playbook.reason}
              </p>
              <div className="flex flex-wrap gap-2">
                {onRunPlaybook ? (
                  <Button
                    size="sm"
                    onClick={onRunPlaybook}
                    disabled={running}
                    className="gap-1.5"
                  >
                    <Play className="size-3.5" />
                    Run playbook
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" asChild>
                  <Link href={suggestion.playbook.href}>Open procedure</Link>
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              No approved playbook available in this demo session.
            </p>
          )}
        </CardContent>
      </Card>

      {(suggestion.suggestedSeverity || suggestion.suggestedPriority) && (
        <Card className="shadow-none">
          <CardHeader className="space-y-1 p-4 pb-2">
            <CardTitle className="text-sm">Suggested ranking</CardTitle>
            <CardDescription className="text-xs">
              Heuristic only — review before changing live fields
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2 p-4 pt-0">
            {suggestion.suggestedSeverity ? (
              <SeverityBadge severity={suggestion.suggestedSeverity} />
            ) : null}
            {suggestion.suggestedPriority ? (
              <PriorityBadge priority={suggestion.suggestedPriority} />
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-none">
        <CardHeader className="space-y-1 p-4 pb-2">
          <CardTitle className="text-sm">Similar alerts</CardTitle>
          <CardDescription className="text-xs">
            Same rule, entity, or MITRE from the session catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {suggestion.similarAlerts.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No strong catalog matches found.
            </p>
          ) : (
            <ul className="divide-border/70 divide-y">
              {suggestion.similarAlerts.map((row) => (
                <li key={row.id} className="py-2.5 first:pt-0 last:pb-0">
                  <Link
                    href={`/alerts/${row.id}`}
                    className="hover:bg-accent/40 -mx-1 block rounded-md px-1 py-1 transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={row.severity} />
                      <span className="text-muted-foreground font-mono text-xs">
                        {row.id}
                      </span>
                      <Badge
                        variant="secondary"
                        className="rounded-full font-normal capitalize"
                      >
                        {row.status}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium">
                      {row.title}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {row.matchReason}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="space-y-1 p-4 pb-2">
          <CardTitle className="text-sm">Next actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ol className="space-y-2">
            {suggestion.nextActions.map((action, index) => (
              <li key={action} className="flex gap-2 text-sm">
                <span className="text-muted-foreground font-mono text-xs">
                  {index + 1}.
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="space-y-1 p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-sm">Draft triage notes</CardTitle>
              <CardDescription className="text-xs">
                Copy or apply into the notes field
              </CardDescription>
            </div>
            {onApplyNotes ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onApplyNotes(suggestion.draftNotes)}
              >
                Apply
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <pre className="bg-muted/40 max-h-56 overflow-auto rounded-md border p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
            {suggestion.draftNotes}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

export function TriageAssistPanel({
  alert,
  incident,
  onApplyNotes,
  className,
  triggerClassName,
}: TriageAssistPanelProps) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const alertsSession = useAlertsSession();
  const { getIncident, patchIncidents } = useIncidentsSession();

  const suggestion = useMemo(() => {
    if (alert) return buildAlertAssist(alert);
    if (incident) return buildIncidentAssist(incident);
    return null;
  }, [alert, incident]);

  if (!suggestion) return null;

  const subjectLabel = alert?.id ?? incident?.id ?? "item";

  const runSuggestedPlaybook = () => {
    if (!suggestion.playbook) return;
    setRunning(true);
    try {
      if (incident) {
        const result = runPlaybookAgainstIncident(
          suggestion.playbook.id,
          incident,
          patchIncidents,
        );
        toast({
          title: "Playbook running",
          description: `${result.procedure.code} on ${result.incidentId}`,
        });
      } else if (alert) {
        alertsSession.patchAlerts([alert.id], { status: "escalated" });
        const result = runPlaybookFromAlert(
          suggestion.playbook.id,
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
    } catch (error) {
      toast({
        title: "Playbook failed",
        description:
          error instanceof Error ? error.message : "Unable to run playbook",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 gap-1.5", triggerClassName, className)}
        >
          <Sparkles className="size-3.5" />
          Assist
          <Badge
            variant="secondary"
            className="rounded-full px-1.5 py-0 text-[10px] font-normal"
          >
            demo
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="space-y-1 text-left">
          <SheetTitle className="flex items-center gap-2 pr-8">
            <Sparkles className="size-4" />
            Assist
            <Badge variant="outline" className="rounded-full font-normal">
              demo
            </Badge>
          </SheetTitle>
          <SheetDescription>
            Deterministic triage suggestions for {subjectLabel}. No model calls
            — catalog heuristics only.
          </SheetDescription>
        </SheetHeader>
        <AssistBody
          suggestion={suggestion}
          onApplyNotes={onApplyNotes}
          onRunPlaybook={
            suggestion.playbook ? runSuggestedPlaybook : undefined
          }
          running={running}
        />
      </SheetContent>
    </Sheet>
  );
}
