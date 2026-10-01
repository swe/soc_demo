"use client";

import {
  Check,
  GitBranch,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  ModuleShell,
  ModuleToolbarActions,
} from "@/components/soc/module-shell";
import { EmptyState, LoadingState } from "@/components/soc/state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ApprovalQueueItem,
  getPlaybookRun,
  playbooksApi,
} from "@/lib/mock-api/playbooks";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function slaLabel(deadline?: string) {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms < 0) return "SLA breached";
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `${mins}m left`;
  return `${Math.round(mins / 60)}h left`;
}

export function ApprovalQueue() {
  const [items, setItems] = useState<ApprovalQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await playbooksApi.listApprovals();
      setItems(result.items);
    } catch (error) {
      toast({
        title: "Approvals failed",
        description:
          error instanceof Error ? error.message : "Unable to list approvals",
        variant: "destructive",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = async (item: ApprovalQueueItem) => {
    setBusyId(`approve-${item.id}`);
    try {
      const { receipt } = await playbooksApi.approveRun(item.runId);
      toast({ title: "Approved", description: receipt.message });
      await load();
    } catch (error) {
      toast({
        title: "Approve failed",
        description:
          error instanceof Error ? error.message : "Unable to approve run",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (item: ApprovalQueueItem) => {
    setBusyId(`reject-${item.id}`);
    try {
      const { receipt } = await playbooksApi.rejectRun(item.runId);
      toast({ title: "Rejected", description: receipt.message });
      await load();
    } catch (error) {
      toast({
        title: "Reject failed",
        description:
          error instanceof Error ? error.message : "Unable to reject run",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const retry = async (item: ApprovalQueueItem) => {
    setBusyId(`retry-${item.id}`);
    try {
      const { receipt } = await playbooksApi.retryStep(item.runId, item.stepId);
      toast({ title: "Retry queued", description: receipt.message });
      await load();
    } catch (error) {
      toast({
        title: "Retry failed",
        description:
          error instanceof Error ? error.message : "Unable to retry step",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ModuleShell
      toolbar={
        <ModuleToolbarActions className="lg:ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </ModuleToolbarActions>
      }
    >
      {items.length === 0 ? (
        <div className="bg-card shadow-card rounded-xl border">
          {loading ? (
            <LoadingState label="Loading approval queue…" />
          ) : (
            <EmptyState
              icon={ShieldCheck}
              title="No runs awaiting approval"
              description="Start a playbook to enqueue one."
            />
          )}
        </div>
      ) : (
        <div className="bg-card shadow-card overflow-hidden rounded-xl border">
          <Table className="max-md:table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-44">Procedure</TableHead>
                <TableHead className="hidden lg:table-cell">Action</TableHead>
                <TableHead className="hidden 2xl:table-cell">
                  Branches
                </TableHead>
                <TableHead className="hidden md:table-cell">Case</TableHead>
                <TableHead className="hidden xl:table-cell">
                  Requested
                </TableHead>
                <TableHead className="hidden sm:table-cell">SLA</TableHead>
                <TableHead className="w-32 text-right sm:w-auto">
                  Decide
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const sla = slaLabel(item.slaDeadlineAt);
                const run = getPlaybookRun(item.runId);
                const branchSummary =
                  run?.branches
                    .map((b) => `${b.label} (${b.status})`)
                    .join(" · ") ?? "—";
                const incidentHref = item.incidentId.startsWith(
                  "pending-alert:",
                )
                  ? `/alerts/${item.incidentId.slice("pending-alert:".length)}`
                  : `/incidents/${item.incidentId}`;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="line-clamp-2 font-medium whitespace-normal md:line-clamp-1">
                        {item.procedureTitle}
                      </p>
                      <p className="text-muted-foreground truncate font-mono text-xs">
                        {item.runId}
                      </p>
                      <p className="text-muted-foreground truncate text-xs lg:hidden">
                        {item.actionLabel}
                      </p>
                      {sla ? (
                        <p
                          className={cn(
                            "text-xs sm:hidden",
                            sla === "SLA breached"
                              ? "text-destructive-text"
                              : "text-muted-foreground",
                          )}
                        >
                          {sla}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm">{item.actionLabel}</p>
                      {item.actionId ? (
                        <p className="text-muted-foreground font-mono text-xs">
                          {item.actionId}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="hidden 2xl:table-cell">
                      <span className="text-muted-foreground inline-flex max-w-[180px] items-start gap-1 text-xs leading-snug">
                        <GitBranch className="mt-0.5 size-3 shrink-0" />
                        {branchSummary}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Link
                        href={incidentHref}
                        className="font-mono text-xs hover:underline"
                      >
                        {item.incidentId.startsWith("pending-alert:")
                          ? item.incidentId.slice("pending-alert:".length)
                          : item.incidentId}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden text-xs tabular-nums xl:table-cell">
                      {formatWhen(item.requestedAt)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {sla ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full font-normal",
                            sla === "SLA breached" &&
                              "border-destructive/40 text-destructive-text",
                          )}
                        >
                          {sla}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          className="h-7 gap-1 px-2"
                          disabled={busyId !== null}
                          onClick={() => void approve(item)}
                        >
                          {busyId === `approve-${item.id}` ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Check className="size-3" />
                          )}
                          <span className="max-md:sr-only">Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 px-2"
                          disabled={busyId !== null}
                          onClick={() => void reject(item)}
                        >
                          {busyId === `reject-${item.id}` ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <X className="size-3" />
                          )}
                          <span className="max-md:sr-only">Reject</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 gap-1 px-2"
                          disabled={busyId !== null}
                          onClick={() => void retry(item)}
                          title="Retry failed upstream connector step"
                        >
                          {busyId === `retry-${item.id}` ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <RotateCcw className="size-3" />
                          )}
                          <span className="max-md:sr-only">Retry</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </ModuleShell>
  );
}
