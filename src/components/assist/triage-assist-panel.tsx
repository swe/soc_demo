"use client";

import { Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { SocAlert } from "@/components/alerts/alerts-data";
import { SeverityBadge } from "@/components/alerts/alerts-primitives";
import { useAlertsSession } from "@/components/alerts/alerts-session";
import { AssistChatBody } from "@/components/assist/assist-chat";
import {
  type AssistSuggestion,
  buildAlertAssist,
  buildIncidentAssist,
} from "@/components/assist/triage-assist";
import type { SocIncident } from "@/components/incidents/incidents-data";
import { PriorityBadge } from "@/components/incidents/incidents-primitives";
import { useIncidentsSession } from "@/components/incidents/incidents-session";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  AssistInvestigatePlan,
  AssistMode,
} from "@/lib/api-adapters/assist";
import { assistApi } from "@/lib/mock-api";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type TriageAssistPanelProps = {
  alert?: SocAlert;
  incident?: SocIncident;
  onApplyNotes?: (notes: string) => void;
  className?: string;
  triggerClassName?: string;
};

function InvestigatePlanCard({
  plan,
  alert,
  incident,
  onApplyNotes,
}: {
  plan: AssistInvestigatePlan;
  alert?: SocAlert;
  incident?: SocIncident;
  onApplyNotes?: (notes: string) => void;
}) {
  const [busy, setBusy] = useState<"draft" | "contain" | null>(null);

  const applyDraft = async () => {
    setBusy("draft");
    try {
      const receipt = await assistApi.applyAttackStoryDraft({
        draft: plan.attackStoryDraft,
        alert,
        incident,
      });
      onApplyNotes?.(plan.attackStoryDraft);
      toast({
        title: "Attack Story draft applied",
        description: `${receipt.message} · ${receipt.id}`,
      });
    } catch (error) {
      toast({
        title: "Apply draft failed",
        description:
          error instanceof Error ? error.message : "Unable to apply draft",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const runContain = async () => {
    if (plan.recommendedContain.length === 0) return;
    setBusy("contain");
    try {
      const { summary, receipts } = await assistApi.runRecommendedContain({
        recommendations: plan.recommendedContain,
        incident,
        alerts: alert ? [alert] : undefined,
      });
      const first = receipts[0];
      toast({
        title: "Recommended contain executed",
        description: first ? `${summary} · ${first.id}` : summary,
      });
    } catch (error) {
      toast({
        title: "Contain failed",
        description:
          error instanceof Error ? error.message : "Unable to run contain",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="min-w-0 overflow-hidden shadow-none">
      <CardHeader className="space-y-2 p-4 pb-2">
        <CardTitle className="text-sm">Multi-hop investigate</CardTitle>
        <div className="flex flex-col gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={busy !== null || !plan.attackStoryDraft}
            onClick={() => void applyDraft()}
          >
            {busy === "draft" ? "Applying…" : "Apply Attack Story draft"}
          </Button>
          {plan.recommendedContain.length > 0 ? (
            <Button
              size="sm"
              className="w-full"
              disabled={busy !== null}
              onClick={() => void runContain()}
            >
              {busy === "contain" ? "Running…" : "Run recommended contain"}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="min-w-0 space-y-3 p-4 pt-0">
        <p className="text-muted-foreground text-xs leading-relaxed break-words">
          {plan.summary}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="secondary"
            className="rounded-full font-normal tabular-nums"
          >
            Plan {Math.round(plan.confidence * 100)}%
          </Badge>
          {plan.correlationConfidence != null ? (
            <Badge variant="secondary" className="rounded-full font-normal">
              Correlation {Math.round(plan.correlationConfidence * 100)}%
            </Badge>
          ) : null}
        </div>
        <ol className="min-w-0 space-y-3">
          {plan.hops.map((hop, index) => (
            <li
              key={hop.id}
              className="min-w-0 rounded-md border px-3 py-2"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-muted-foreground font-mono text-[11px]">
                  Hop {index + 1}
                </span>
                <Badge
                  variant="secondary"
                  className="rounded-full font-normal tabular-nums"
                >
                  {Math.round(hop.confidence * 100)}%
                </Badge>
              </div>
              <p className="mt-1 text-sm leading-snug font-medium break-words">
                {hop.question}
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed break-words">
                {hop.finding}
              </p>
              {hop.cites.length > 0 ? (
                <ul className="mt-2 flex min-w-0 flex-wrap gap-1">
                  {hop.cites.map((cite) => (
                    <Badge
                      key={`${hop.id}-${cite.kind}-${cite.id}`}
                      variant="outline"
                      className="max-w-full rounded-md font-normal whitespace-normal"
                    >
                      <span className="text-muted-foreground capitalize">
                        {cite.kind}
                      </span>
                      <span className="mx-1">·</span>
                      <span className="break-words">{cite.label}</span>
                    </Badge>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
        {plan.recommendedContain.length > 0 ? (
          <div className="border-border/60 space-y-1.5 border-t pt-3">
            <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
              Recommended contain
            </p>
            <ul className="min-w-0 space-y-1">
              {plan.recommendedContain.map((action) => (
                <li
                  key={`${action.actionId}-${action.targetId}`}
                  className="min-w-0 text-sm leading-snug break-words"
                >
                  {action.label ?? action.actionId}
                  <span className="text-muted-foreground">
                    {" "}
                    · {action.targetLabel ?? action.targetId}
                  </span>
                  <span className="text-muted-foreground block text-[11px] break-words">
                    {action.reason} · via {action.connectorId}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function AssistBody({
  suggestion,
  investigate,
  alert,
  incident,
  onApplyNotes,
  onApplyAll,
  onRunPlaybook,
  running,
}: {
  suggestion: AssistSuggestion;
  investigate?: AssistInvestigatePlan | null;
  alert?: SocAlert;
  incident?: SocIncident;
  onApplyNotes?: (notes: string) => void;
  onApplyAll?: () => void;
  onRunPlaybook?: () => void;
  running?: boolean;
}) {
  return (
    <div className="space-y-4 pb-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="secondary" className="rounded-full font-normal">
          Confidence {suggestion.confidence}%
        </Badge>
        {onApplyAll ? (
          <Button size="sm" onClick={onApplyAll} disabled={running}>
            Apply all
          </Button>
        ) : null}
      </div>

      {investigate ? (
        <InvestigatePlanCard
          plan={investigate}
          alert={alert}
          incident={incident}
          onApplyNotes={onApplyNotes}
        />
      ) : null}

      <Card className="min-w-0 overflow-hidden shadow-none">
        <CardHeader className="space-y-1 p-4 pb-2">
          <CardTitle className="text-sm">Recommended playbook</CardTitle>
          <CardDescription className="text-xs">
            Deterministic match from approved procedures
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 space-y-2 p-4 pt-0">
          {suggestion.playbook ? (
            <>
              <div className="flex min-w-0 flex-col gap-1.5">
                <Badge
                  variant="outline"
                  className="w-fit max-w-full font-mono text-xs"
                >
                  {suggestion.playbook.code}
                </Badge>
                <span className="text-sm leading-snug font-medium break-words">
                  {suggestion.playbook.title}
                </span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed break-words">
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
              No approved playbook available.
            </p>
          )}
          {suggestion.linkedProcedures.length > 0 ? (
            <div className="border-border/60 mt-3 space-y-2 border-t pt-3">
              <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                Linked KB procedures
              </p>
              <ul className="space-y-1.5">
                {suggestion.linkedProcedures.map((proc) => (
                  <li key={proc.id} className="min-w-0">
                    <Link
                      href={proc.href}
                      className="hover:bg-muted/50 flex min-w-0 items-start gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors"
                    >
                      <span className="min-w-0 flex-1 break-words">
                        <span className="font-mono">{proc.code}</span>
                        <span className="text-muted-foreground"> · </span>
                        {proc.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {(suggestion.suggestedSeverity || suggestion.suggestedPriority) && (
        <Card className="shadow-none">
          <CardHeader className="space-y-1 p-4 pb-2">
            <CardTitle className="text-sm">Suggested ranking</CardTitle>
            <CardDescription className="text-xs">
              Review before changing live fields
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

      <Card className="min-w-0 overflow-hidden shadow-none">
        <CardHeader className="space-y-1 p-4 pb-2">
          <CardTitle className="text-sm">Similar alerts</CardTitle>
          <CardDescription className="text-xs">
            Same rule, entity, or MITRE from the session catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 p-4 pt-0">
          {suggestion.similarAlerts.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No strong catalog matches found.
            </p>
          ) : (
            <ul className="divide-border/70 divide-y">
              {suggestion.similarAlerts.map((row) => (
                <li key={row.id} className="min-w-0 py-2.5 first:pt-0 last:pb-0">
                  <Link
                    href={`/alerts/${row.id}`}
                    className="hover:bg-accent/40 -mx-1 block min-w-0 rounded-md px-1 py-1 transition-colors"
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
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
                    <p className="mt-1 text-sm leading-snug font-medium break-words">
                      {row.title}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed break-words">
                      {row.matchReason}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden shadow-none">
        <CardHeader className="space-y-1 p-4 pb-2">
          <CardTitle className="text-sm">Next actions</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 p-4 pt-0">
          <ol className="space-y-2">
            {suggestion.nextActions.map((action, index) => (
              <li key={action} className="flex min-w-0 gap-2 text-sm">
                <span className="text-muted-foreground shrink-0 font-mono text-xs">
                  {index + 1}.
                </span>
                <span className="min-w-0 flex-1 leading-snug break-words">
                  {action}
                </span>
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

      <Card className="shadow-none">
        <CardHeader className="space-y-1 p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-sm">Investigation draft</CardTitle>
              <CardDescription className="text-xs">
                Grounded narrative for case notes / handoff
              </CardDescription>
            </div>
            {onApplyNotes ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onApplyNotes(suggestion.investigationDraft)}
              >
                Apply draft
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <pre className="bg-muted/40 max-h-48 overflow-auto rounded-md border p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
            {suggestion.investigationDraft}
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
  const [mode, setMode] = useState<AssistMode>("heuristic");
  const [investigate, setInvestigate] = useState<AssistInvestigatePlan | null>(
    null,
  );
  const [suggestion, setSuggestion] = useState<AssistSuggestion | null>(() => {
    if (alert) return buildAlertAssist(alert);
    if (incident) return buildIncidentAssist(incident);
    return null;
  });
  const alertsSession = useAlertsSession();
  const { getIncident, patchIncidents } = useIncidentsSession();

  useEffect(() => {
    let cancelled = false;
    const fallback = alert
      ? buildAlertAssist(alert)
      : incident
        ? buildIncidentAssist(incident)
        : null;
    if (!fallback) {
      setSuggestion(null);
      setInvestigate(null);
      return;
    }
    setSuggestion(fallback);
    setMode("heuristic");
    setInvestigate(null);
    void (async () => {
      try {
        const result = alert
          ? await assistApi.triage({ kind: "alert", alert })
          : incident
            ? await assistApi.triage({ kind: "incident", incident })
            : null;
        if (!cancelled && result) {
          setSuggestion(result.suggestion);
          setMode(result.mode);
          setInvestigate(result.investigate ?? null);
        }
      } catch {
        /* keep heuristic */
      }
    })();
    return () => {
      cancelled = true;
    };
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

  const applyAll = () => {
    const notes = suggestion.investigationDraft || suggestion.draftNotes;
    onApplyNotes?.(notes);
    if (alert && suggestion.suggestedStatus) {
      alertsSession.patchAlerts([alert.id], {
        status: suggestion.suggestedStatus,
        notes: alert.notes ? `${alert.notes}\n\n${notes}` : notes,
      });
    } else if (incident) {
      patchIncidents([incident.id], {
        notes: incident.notes ? `${incident.notes}\n\n${notes}` : notes,
        ...(suggestion.suggestedPriority ? {} : {}),
      });
    }
    toast({
      title: "Assist applied",
      description: [
        `Notes${suggestion.suggestedStatus ? ` + status → ${suggestion.suggestedStatus}` : ""}`,
        suggestion.playbook
          ? `· playbook hint ${suggestion.playbook.code}`
          : null,
        `(${suggestion.confidence}%)`,
      ]
        .filter(Boolean)
        .join(" "),
    });
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
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <Tabs
          defaultValue="triage"
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="shrink-0 border-b px-6 pt-6">
            <SheetHeader className="space-y-0 p-0 text-left">
              <SheetTitle className="flex items-center gap-2 pr-8">
                <Sparkles className="size-4 shrink-0" />
                Assist
              </SheetTitle>
              <SheetDescription className="sr-only">
                Assist for {subjectLabel}
              </SheetDescription>
            </SheetHeader>
            <TabsList className="mt-4 mb-0 h-auto w-full justify-start gap-6 rounded-none border-0 bg-transparent p-0">
              <TabsTrigger
                value="triage"
                className="data-[state=active]:border-foreground rounded-none border-b-2 border-transparent px-0 pb-3 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Triage
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="data-[state=active]:border-foreground rounded-none border-b-2 border-transparent px-0 pb-3 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Chat
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            value="triage"
            className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 pt-5 pb-6 data-[state=inactive]:hidden"
          >
            <AssistBody
              suggestion={suggestion}
              investigate={investigate}
              alert={alert}
              incident={incident}
              onApplyNotes={onApplyNotes}
              onApplyAll={applyAll}
              onRunPlaybook={
                suggestion.playbook ? runSuggestedPlaybook : undefined
              }
              running={running}
            />
          </TabsContent>
          <TabsContent
            value="chat"
            className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden px-6 pt-5 pb-6 data-[state=inactive]:hidden"
          >
            <AssistChatBody
              alert={alert}
              incident={incident}
              onApplyNotes={onApplyNotes}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
