"use client";

import { ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { SocAlert } from "@/components/alerts/alerts-data";
import { SeverityBadge as AlertSeverityBadge } from "@/components/alerts/alerts-primitives";
import { getApprovedPlaybooks } from "@/components/playbooks/playbooks-session";
import { RunPlaybookControl } from "@/components/playbooks/run-playbook-control";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssistInvestigatePlan } from "@/lib/api-adapters/assist";
import { assistApi } from "@/lib/mock-api";
import { DISRUPTION_CONNECTORS } from "@/lib/mock-api/incidents";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  type AttackStory,
  type AttackStoryAction,
  buildAttackStory,
} from "./attack-story";
import { executeAttackDisruption } from "./attack-story-actions";
import { AttackStoryGraph } from "./attack-story-graph";
import type { SocIncident } from "./incidents-data";
import { useIncidentsSession } from "./incidents-session";

function SuggestedActionsStrip({
  incident,
  alerts,
}: {
  incident: SocIncident;
  alerts: SocAlert[];
}) {
  const [plan, setPlan] = useState<AssistInvestigatePlan | null>(null);
  const [busy, setBusy] = useState<"draft" | "contain" | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const next = await assistApi.investigate({
          kind: "incident",
          incident,
          alerts,
        });
        if (!cancelled) setPlan(next);
      } catch {
        if (!cancelled) setPlan(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [incident, alerts]);

  if (!plan) return null;

  const applyDraft = async () => {
    setBusy("draft");
    try {
      const receipt = await assistApi.applyAttackStoryDraft({
        draft: plan.attackStoryDraft,
        incident,
      });
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
        alerts,
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
    <section className="bg-card space-y-3 rounded-lg border p-4">
      <div className="min-w-0">
        <h2 className="text-sm font-medium">Suggested actions</h2>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          {plan.hops.length}-hop {plan.mode} plan ·{" "}
          {Math.round(plan.confidence * 100)}% confidence
        </p>
      </div>
      <ol className="space-y-1.5">
        {plan.hops.slice(0, 3).map((hop, index) => (
          <li key={hop.id} className="text-xs leading-snug">
            <span className="text-muted-foreground font-mono">
              {index + 1}.
            </span>{" "}
            {hop.question}
          </li>
        ))}
        {plan.hops.length > 3 ? (
          <li className="text-muted-foreground text-xs">
            +{plan.hops.length - 3} more hops in Assist
          </li>
        ) : null}
      </ol>
      <div className="flex flex-col gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-full"
          disabled={busy !== null}
          onClick={() => void applyDraft()}
        >
          {busy === "draft" ? "Applying…" : "Apply Attack Story draft"}
        </Button>
        {plan.recommendedContain.length > 0 ? (
          <Button
            type="button"
            size="sm"
            className="w-full gap-1.5"
            disabled={busy !== null}
            onClick={() => void runContain()}
          >
            <ShieldAlert className="size-3.5" />
            {busy === "contain" ? "Running…" : "Run recommended contain"}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

export function AttackStoryPanel({
  incident,
  alerts,
}: {
  incident: SocIncident;
  alerts: SocAlert[];
}) {
  const { getIncident } = useIncidentsSession();
  const [running, setRunning] = useState(false);
  const [connectorId, setConnectorId] = useState(
    DISRUPTION_CONNECTORS[0]?.id ?? "int-defender-endpoint",
  );

  const story: AttackStory = useMemo(
    () => buildAttackStory(incident, alerts),
    [incident, alerts],
  );

  const playbook = useMemo(() => {
    if (!story.recommendedPlaybookCode) return null;
    return (
      getApprovedPlaybooks().find(
        (procedure) => procedure.code === story.recommendedPlaybookCode,
      ) ?? null
    );
  }, [story.recommendedPlaybookCode]);

  const firstActivity = story.alertTimeline[0]?.at;
  const lastActivity =
    story.alertTimeline[story.alertTimeline.length - 1]?.at ?? firstActivity;

  const runDisruption = async (actions?: AttackStoryAction[]) => {
    setRunning(true);
    try {
      const live = getIncident(incident.id) ?? incident;
      const result = await executeAttackDisruption(live, story, undefined, {
        actions,
        connectorId,
      });
      const connectorName =
        DISRUPTION_CONNECTORS.find((c) => c.id === connectorId)?.name ??
        "connector";
      toast({
        title: "Disruption executed",
        description: `${result.summary} · via ${connectorName}`,
      });
    } catch (error) {
      toast({
        title: "Disruption failed",
        description:
          error instanceof Error ? error.message : "Unable to run disruption",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="grid min-h-0 items-start gap-4 pt-1 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(240px,300px)]">
      <div className="flex min-w-0 flex-col gap-4 self-start">
        <section className="bg-card space-y-4 rounded-lg border p-4">
          <div>
            <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Detections
            </h2>
            <p className="mt-1 text-sm font-medium">
              {alerts.length} alert{alerts.length === 1 ? "" : "s"} ·{" "}
              {story.alertCategories.length} categor
              {story.alertCategories.length === 1 ? "y" : "ies"}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              First{" "}
              {firstActivity ? new Date(firstActivity).toLocaleString() : "—"}
              {" · "}
              Last {lastActivity ? new Date(lastActivity).toLocaleString() : "—"}
            </p>
          </div>
          <ul className="space-y-2">
            {story.alertCategories.map((cat) => (
              <li
                key={cat.key}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span>{cat.label}</span>
                <Badge variant="secondary" className="tabular-nums">
                  {cat.count}
                </Badge>
              </li>
            ))}
          </ul>
          <ul className="max-h-48 space-y-1 overflow-y-auto">
            {story.alertTimeline.map((row) => (
              <li key={row.alertId}>
                <Link
                  href={`/alerts/${row.alertId}`}
                  className="hover:bg-muted/60 flex items-start gap-2 rounded-md px-1.5 py-1 text-xs"
                >
                  <AlertSeverityBadge severity={row.severity} />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {row.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-card space-y-3 rounded-lg border p-4">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Recommended playbook
          </h2>
          {playbook ? (
            <div className="space-y-2">
              <p className="text-sm leading-snug font-medium break-words">
                <span className="text-muted-foreground font-mono text-xs">
                  {playbook.code}
                </span>{" "}
                {playbook.title}
              </p>
              <RunPlaybookControl
                incidentId={incident.id}
                preferredPlaybookId={playbook.id}
                compact
              />
            </div>
          ) : (
            <RunPlaybookControl incidentId={incident.id} />
          )}
        </section>
      </div>

      <section className="bg-card min-h-[320px] min-w-0 self-start overflow-hidden rounded-lg border">
        <AttackStoryGraph story={story} />
      </section>

      <aside className="min-w-0 space-y-4 self-start">
        <SuggestedActionsStrip incident={incident} alerts={alerts} />

        <section className="bg-card space-y-3 rounded-lg border p-4">
          <div className="flex items-start gap-2">
            <ShieldAlert className="text-destructive mt-0.5 size-4 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm font-medium">Attack disruption</h2>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {story.disruption.summary}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "rounded-full font-normal capitalize",
              story.disruption.status === "executed" &&
                "border-emerald-500/40 text-emerald-700 dark:text-emerald-400",
              story.disruption.status === "recommended" &&
                "border-orange-500/40 text-orange-700 dark:text-orange-400",
            )}
          >
            {story.disruption.status === "executed"
              ? "Disruption executed"
              : story.disruption.status === "recommended"
                ? "Automated response recommended"
                : "Manual review"}
          </Badge>

          {story.disruption.eligible &&
          story.disruption.status !== "executed" ? (
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                Response connector
              </Label>
              <Select value={connectorId} onValueChange={setConnectorId}>
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Select connector" />
                </SelectTrigger>
                <SelectContent>
                  {DISRUPTION_CONNECTORS.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs leading-snug">
                Actions return receipts and update session assets.
              </p>
            </div>
          ) : null}

          {story.disruption.actions.length > 0 ? (
            <ul className="space-y-1.5">
              {story.disruption.actions.map((action) => (
                <li key={action.id}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-full justify-start text-xs"
                    disabled={
                      running || story.disruption.status === "executed"
                    }
                    onClick={() => runDisruption([action])}
                  >
                    {action.label}
                    <span className="text-muted-foreground ml-auto truncate">
                      {action.targetLabel}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-xs">
              No containable identity or host linked to this case.
            </p>
          )}

          {story.disruption.eligible &&
          story.disruption.status !== "executed" ? (
            <Button
              type="button"
              size="sm"
              className="w-full gap-1.5"
              disabled={running}
              onClick={() => runDisruption()}
            >
              <Sparkles className="size-3.5" />
              Run full disruption
            </Button>
          ) : null}
        </section>
      </aside>
    </div>
  );
}
