"use client";

import { GitBranch, GitMerge, Link2, Loader2, RefreshCw, Scissors } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  correlationApi,
  type CorrelationCandidate,
  type CorrelationProposal,
} from "@/lib/mock-api/correlation";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type CorrelationPanelProps = {
  alertId?: string;
  incidentId?: string;
  className?: string;
};

function confidencePct(value: number) {
  return Math.round(value * 100);
}

function CandidateRow({
  candidate,
  busyId,
  onLink,
  onMerge,
  onSplit,
}: {
  candidate: CorrelationCandidate;
  busyId: string | null;
  onLink: (c: CorrelationCandidate) => void;
  onMerge: (c: CorrelationCandidate) => void;
  onSplit: (c: CorrelationCandidate) => void;
}) {
  const busy = busyId === candidate.id;
  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="rounded-full font-normal capitalize">
              {candidate.kind.replaceAll("_", " ")}
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full font-normal tabular-nums"
            >
              {confidencePct(candidate.confidence)}%
            </Badge>
            {candidate.alertId ? (
              <span className="text-muted-foreground font-mono text-xs">
                {candidate.alertId}
              </span>
            ) : null}
            {candidate.incidentId ? (
              <span className="text-muted-foreground font-mono text-xs">
                {candidate.incidentId}
              </span>
            ) : null}
            {candidate.sourceName ? (
              <span className="text-muted-foreground text-xs">
                {candidate.sourceName}
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm font-medium">{candidate.title}</p>
          {candidate.reasons.length > 0 ? (
            <ul className="mt-1.5 space-y-0.5">
              {candidate.reasons.map((reason) => (
                <li
                  key={`${candidate.id}-${reason.code}-${reason.label}`}
                  className="text-muted-foreground text-xs leading-relaxed"
                >
                  {reason.label}
                  <span className="text-muted-foreground/70 font-mono tabular-nums">
                    {" "}
                    · w{reason.weight.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2 text-xs"
            disabled={busy || busyId !== null}
            onClick={() => onLink(candidate)}
          >
            {busy ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Link2 className="size-3" />
            )}
            Link
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2 text-xs"
            disabled={busy || busyId !== null || !candidate.incidentId}
            onClick={() => onMerge(candidate)}
          >
            <GitMerge className="size-3" />
            Merge
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 px-2 text-xs"
            disabled={busy || busyId !== null}
            onClick={() => onSplit(candidate)}
          >
            <Scissors className="size-3" />
            Split
          </Button>
        </div>
      </div>
    </li>
  );
}

export function CorrelationPanel({
  alertId,
  incidentId,
  className,
}: CorrelationPanelProps) {
  const [proposal, setProposal] = useState<CorrelationProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!alertId && !incidentId) return;
    setLoading(true);
    try {
      const next = await correlationApi.propose({ alertId, incidentId });
      setProposal(next);
    } catch (error) {
      toast({
        title: "Correlation failed",
        description:
          error instanceof Error ? error.message : "Unable to propose links",
        variant: "destructive",
      });
      setProposal(null);
    } finally {
      setLoading(false);
    }
  }, [alertId, incidentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const resolveLinkTarget = (candidate: CorrelationCandidate) => {
    const targetIncidentId =
      candidate.incidentId ??
      proposal?.suggestedIncidentId ??
      proposal?.seedIncidentId ??
      incidentId;
    const alertIds = [
      ...(alertId ? [alertId] : []),
      ...(candidate.alertId ? [candidate.alertId] : []),
    ].filter((id, index, arr) => arr.indexOf(id) === index);

    return { targetIncidentId, alertIds };
  };

  const onLink = async (candidate: CorrelationCandidate) => {
    const { targetIncidentId, alertIds } = resolveLinkTarget(candidate);
    if (!targetIncidentId || alertIds.length === 0) {
      toast({
        title: "Cannot link",
        description: "Need an alert and a target incident for this candidate.",
        variant: "destructive",
      });
      return;
    }
    setBusyId(candidate.id);
    try {
      const { receipt } = await correlationApi.link({
        alertIds,
        incidentId: targetIncidentId,
        confidence: candidate.confidence,
      });
      toast({ title: "Linked", description: receipt.message });
      await load();
    } catch (error) {
      toast({
        title: "Link failed",
        description: error instanceof Error ? error.message : "Unable to link",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const onMerge = async (candidate: CorrelationCandidate) => {
    const targetIncidentId =
      proposal?.seedIncidentId ?? incidentId ?? proposal?.suggestedIncidentId;
    if (!candidate.incidentId || !targetIncidentId) {
      toast({
        title: "Cannot merge",
        description: "Merge requires two incident ids.",
        variant: "destructive",
      });
      return;
    }
    if (candidate.incidentId === targetIncidentId) {
      toast({
        title: "Cannot merge",
        description: "Candidate is already the seed incident.",
        variant: "destructive",
      });
      return;
    }
    setBusyId(candidate.id);
    try {
      const { receipt } = await correlationApi.merge({
        sourceIncidentIds: [candidate.incidentId],
        targetIncidentId,
      });
      toast({ title: "Merged", description: receipt.message });
      await load();
    } catch (error) {
      toast({
        title: "Merge failed",
        description: error instanceof Error ? error.message : "Unable to merge",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const onSplit = async (candidate: CorrelationCandidate) => {
    const splitIncidentId =
      proposal?.seedIncidentId ?? incidentId ?? candidate.incidentId;
    const alertIds = candidate.alertId
      ? [candidate.alertId]
      : alertId
        ? [alertId]
        : [];
    if (!splitIncidentId || alertIds.length === 0) {
      toast({
        title: "Cannot split",
        description: "Split needs an incident and at least one alert id.",
        variant: "destructive",
      });
      return;
    }
    setBusyId(candidate.id);
    try {
      const { receipt, newIncidentId } = await correlationApi.split({
        incidentId: splitIncidentId,
        alertIds,
        newTitle: candidate.title,
      });
      toast({
        title: "Split",
        description: `${receipt.message} (${newIncidentId})`,
      });
      await load();
    } catch (error) {
      toast({
        title: "Split failed",
        description: error instanceof Error ? error.message : "Unable to split",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className={cn("bg-card rounded-lg border p-4", className)}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
            <GitBranch className="size-3.5" />
            Correlation
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Auto-proposed related alerts and cases with confidence scores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {proposal ? (
            <Badge variant="secondary" className="rounded-full font-normal tabular-nums">
              Overall {confidencePct(proposal.overallConfidence)}%
            </Badge>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className={cn("size-3", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && !proposal ? (
        <div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Proposing correlations…
        </div>
      ) : !proposal || proposal.candidates.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed px-3 py-6 text-center text-sm">
          No correlation candidates above threshold.
        </p>
      ) : (
        <ul className="divide-border/70 divide-y">
          {proposal.candidates.map((candidate) => (
            <CandidateRow
              key={candidate.id}
              candidate={candidate}
              busyId={busyId}
              onLink={(c) => void onLink(c)}
              onMerge={(c) => void onMerge(c)}
              onSplit={(c) => void onSplit(c)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
