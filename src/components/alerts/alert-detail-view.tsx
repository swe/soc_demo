"use client";

import {
  ArrowLeft,
  CircleX,
  HardDrive,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AssistChat } from "@/components/assist/assist-chat";
import { TriageAssistPanel } from "@/components/assist/triage-assist-panel";
import { appendAuditLog } from "@/components/audit/audit-log-data";
import { CorrelationPanel } from "@/components/correlation/correlation-panel";
import { createIncidentFromAlerts } from "@/components/incidents/incidents-session";
import { RunPlaybookControl } from "@/components/playbooks/run-playbook-control";
import { currentProfile } from "@/components/profile/profile-data";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  alertEntityTypeLabels,
  alertEnvironmentLabels,
  alertSourceCategoryLabels,
  type AlertStatus,
  alertStatuses,
  alertStatusLabels,
  currentAnalystId,
  getAlertAssignees,
  getLinkedDevice,
  getLinkedIdentity,
  type SocAlert,
} from "./alerts-data";
import {
  AssigneeCell,
  mutedControlClassName,
  RiskScoreBadge,
  SeverityBadge,
  SourceBadge,
  StatusBadge,
} from "./alerts-primitives";
import { useAlertsSession } from "./alerts-session";
import { RelatedAcrossSourcesPanel } from "./related-across-sources-panel";

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-x-3 gap-y-1 text-sm">
      <span className="text-muted-foreground pt-0.5">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function AlertDetailView({ alertId }: { alertId: string }) {
  const router = useRouter();
  const { getAlert, patchAlerts } = useAlertsSession();
  const alert = getAlert(alertId);
  const assignees = useMemo(() => getAlertAssignees(), []);

  const [status, setStatus] = useState<AlertStatus>("new");
  const [assigneeId, setAssigneeId] = useState("unassigned");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!alert) return;
    setStatus(alert.status);
    setAssigneeId(alert.assigneeId ?? "unassigned");
    setNotes(alert.notes ?? "");
  }, [alert]);

  if (!alert) {
    return (
      <main
        id="main-content"
        className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-8 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit gap-1.5"
            onClick={() => router.push("/alerts/list")}
          >
            <ArrowLeft className="size-3.5" />
            Back to alerts
          </Button>
          <div className="rounded-lg border border-dashed px-6 py-16 text-center">
            <p className="text-sm font-medium">Alert not found</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {alertId} is not in the current catalog.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const device = getLinkedDevice(alert.deviceId);
  const identity = getLinkedIdentity(alert.identityId);

  const save = (
    patch: Partial<Pick<SocAlert, "status" | "assigneeId" | "notes">>,
    message: string,
  ) => {
    patchAlerts([alert.id], patch);
    appendAuditLog({
      actorId: currentProfile.id,
      actorName: currentProfile.name,
      action: "alert.triage_saved",
      targetType: "alert",
      targetId: alert.id,
      detail: message,
    });
    toast({ title: message, description: alert.id });
  };

  const escalate = () => {
    const incident = createIncidentFromAlerts([alert], {
      assigneeId: alert.assigneeId ?? currentAnalystId,
    });
    patchAlerts([alert.id], {
      status: "escalated",
      assigneeId: alert.assigneeId ?? currentAnalystId,
    });
    appendAuditLog({
      actorId: currentProfile.id,
      actorName: currentProfile.name,
      action: "alert.escalated",
      targetType: "alert",
      targetId: alert.id,
      detail: `Escalated to ${incident.id}`,
    });
    toast({
      title: "Escalated to incident",
      description: `${alert.id} linked to ${incident.id}`,
    });
    router.push(`/incidents/${incident.id}`);
  };

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto"
    >
      <div className="border-b">
        <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:gap-4 lg:py-3">
          <div className="min-w-0 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 w-fit gap-1.5"
              onClick={() => router.push("/alerts/list")}
            >
              <ArrowLeft className="size-3.5" />
              All alerts
            </Button>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground font-mono text-xs">
                  {alert.id}
                </span>
                <SeverityBadge severity={alert.severity} />
                <StatusBadge status={alert.status} />
                <RiskScoreBadge score={alert.riskScore} />
                <SourceBadge
                  sourceName={alert.sourceName}
                  sourceCategory={alert.sourceCategory}
                />
                <Badge variant="outline" className="rounded-full font-normal">
                  {alertEnvironmentLabels[alert.environment]}
                </Badge>
              </div>
              <h1 className="text-xl leading-snug font-semibold tracking-tight">
                {alert.title}
              </h1>
              <p className="text-muted-foreground text-sm">{alert.ruleName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <TriageAssistPanel
              alert={alert}
              onApplyNotes={(draft) => setNotes(draft)}
              triggerClassName={mutedControlClassName}
            />
            <AssistChat
              alert={alert}
              onApplyNotes={(draft) => setNotes(draft)}
              triggerClassName={mutedControlClassName}
            />
            <Button
              variant="outline"
              size="sm"
              className={cn("h-9", mutedControlClassName)}
              onClick={() =>
                save(
                  {
                    assigneeId: currentAnalystId,
                    status: status === "new" ? "triaging" : status,
                  },
                  "Assigned to you",
                )
              }
            >
              <UserRound className="size-3.5" />
              Take ownership
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn("h-9", mutedControlClassName)}
              onClick={escalate}
            >
              <ShieldAlert className="size-3.5" />
              Escalate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive h-9"
              onClick={() => save({ status: "closed" }, "Alert closed")}
            >
              Close
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <section className="bg-card rounded-lg border p-4">
            <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
              Summary
            </h2>
            <p className="text-sm leading-relaxed">{alert.summary}</p>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              <span className="text-foreground font-medium">Recommended: </span>
              {alert.recommendedAction}
            </p>
          </section>

          <section className="bg-card rounded-lg border p-4">
            <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
              Detection
            </h2>
            <div className="space-y-2.5">
              <MetaRow label="Source">
                <div className="flex flex-wrap items-center gap-2">
                  <SourceBadge
                    sourceName={alert.sourceName}
                    sourceCategory={alert.sourceCategory}
                  />
                  <span className="font-medium">{alert.sourceName}</span>
                  <span className="text-muted-foreground">
                    · {alertSourceCategoryLabels[alert.sourceCategory]}
                  </span>
                </div>
              </MetaRow>
              <MetaRow label="MITRE">
                <span className="font-medium">
                  {alert.mitreTactic ?? "Unmapped"}
                </span>
                {alert.mitreTechnique ? (
                  <span className="text-muted-foreground font-mono text-xs">
                    {" "}
                    · {alert.mitreTechnique}
                  </span>
                ) : null}
              </MetaRow>
              <MetaRow label="Confidence">
                <span className="font-medium tabular-nums">
                  {alert.confidence}%
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  · {alert.eventCount.toLocaleString("en-US")} events
                </span>
              </MetaRow>
              <MetaRow label="Tags">
                <div className="flex flex-wrap gap-1.5">
                  {alert.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="rounded-full font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </MetaRow>
            </div>
          </section>

          <section className="bg-card rounded-lg border p-4">
            <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
              Linked assets
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {device ? (
                <Link
                  href={`/assets/devices?id=${device.id}`}
                  className="hover:bg-accent/40 flex items-start gap-3 rounded-lg border p-3 transition-colors"
                >
                  <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md">
                    <HardDrive className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{device.name}</p>
                    <p className="text-muted-foreground truncate font-mono text-xs">
                      {device.hostname}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {device.platform} · {device.status} · risk{" "}
                      {device.riskScore}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
                  No linked device
                </div>
              )}
              {identity ? (
                <Link
                  href={`/assets/identities?id=${identity.id}`}
                  className="hover:bg-accent/40 flex items-start gap-3 rounded-lg border p-3 transition-colors"
                >
                  <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md">
                    <UserRound className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {identity.displayName}
                    </p>
                    <p className="text-muted-foreground truncate font-mono text-xs">
                      {identity.principal}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {identity.kind} · {identity.source} · risk{" "}
                      {identity.riskScore}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
                  No linked identity
                </div>
              )}
            </div>

            <div className="mt-3 space-y-2">
              <MetaRow label="Primary">
                <span className="font-medium">{alert.entityName}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {alertEntityTypeLabels[alert.entityType]}
                </span>
              </MetaRow>
              {alert.relatedEntities.length > 0 ? (
                <MetaRow label="Related">
                  <div className="flex flex-wrap gap-1.5">
                    {alert.relatedEntities.map((entity) => (
                      <Badge
                        key={entity}
                        variant="outline"
                        className="rounded-md font-mono text-xs font-normal"
                      >
                        {entity}
                      </Badge>
                    ))}
                  </div>
                </MetaRow>
              ) : null}
            </div>
          </section>

          <RelatedAcrossSourcesPanel alert={alert} />

          <CorrelationPanel alertId={alert.id} />
        </div>

        <aside className="space-y-4">
          <RunPlaybookControl alertId={alert.id} />
          <section className="bg-card rounded-lg border p-4">
            <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
              Timeline
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">First seen</span>
                <span className="font-medium">{alert.firstSeenLabel}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Last seen</span>
                <span className="font-medium">{alert.lastSeenLabel}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Age</span>
                <span className="font-medium tabular-nums">{alert.ageLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Assignee</span>
                <AssigneeCell assigneeId={alert.assigneeId} />
              </div>
            </div>
          </section>

          <section className="bg-card rounded-lg border p-4">
            <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
              Triage
            </h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="alert-status" className="text-xs">
                  Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as AlertStatus)}
                >
                  <SelectTrigger id="alert-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {alertStatuses.map((item) => (
                      <SelectItem key={item} value={item}>
                        {alertStatusLabels[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="alert-assignee" className="text-xs">
                  Assignee
                </Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger id="alert-assignee" className="w-full">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {assignees.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="alert-notes" className="text-xs">
                  Notes
                </Label>
                <Textarea
                  id="alert-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Triage notes…"
                  className="min-h-20 resize-none"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  save(
                    {
                      status,
                      assigneeId:
                        assigneeId === "unassigned" ? null : assigneeId,
                      notes: notes.trim() ? notes : undefined,
                    },
                    notes.trim()
                      ? "Triage saved with notes"
                      : "Triage saved",
                  );
                }}
              >
                Save triage
              </Button>
              <Button
                variant="outline"
                className={cn("w-full", mutedControlClassName)}
                onClick={() =>
                  save({ status: "false-positive" }, "Marked false positive")
                }
              >
                <CircleX className="size-3.5" />
                Mark false positive
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
