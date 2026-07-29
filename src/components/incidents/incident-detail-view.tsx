"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  HardDrive,
  Shield,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getAlertById } from "@/components/alerts/alerts-data";
import {
  SeverityBadge as AlertSeverityBadge,
  StatusBadge as AlertStatusBadge,
} from "@/components/alerts/alerts-primitives";
import { getAlertFromSession } from "@/components/alerts/alerts-session";
import { TriageAssistPanel } from "@/components/assist/triage-assist-panel";
import { appendAuditLog } from "@/components/audit/audit-log-data";
import { CorrelationPanel } from "@/components/correlation/correlation-panel";
import { ItsmLinksPanel } from "@/components/incidents/itsm-links-panel";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import { buildAttackStory } from "./attack-story";
import { AttackStoryPanel } from "./attack-story-panel";
import { EvidenceLocker } from "./evidence-locker";
import { IncidentWarRoom } from "./incident-war-room";
import {
  currentAnalystId,
  formatAgeLabel,
  getIncidentAssignees,
  getIncidentSlaRemainingLabel,
  getIncidentSlaState,
  getLinkedDevice,
  getLinkedIdentity,
  incidentEntityTypeLabels,
  incidentEnvironmentLabels,
  incidentSourceCategoryLabels,
  type IncidentStatus,
  incidentStatuses,
  incidentStatusLabels,
  prioritySlaMinutes,
  type SocIncident,
} from "./incidents-data";
import {
  AssigneeCell,
  IncidentStatusBadge,
  mutedControlClassName,
  PriorityBadge,
  SlaBadge,
} from "./incidents-primitives";
import { useIncidentsSession } from "./incidents-session";
import { UnifiedTimeline } from "./unified-timeline";

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[104px_minmax(0,1fr)] items-start gap-x-3 gap-y-1 text-sm">
      <span className="text-muted-foreground pt-0.5">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function phaseComplete(status: IncidentStatus, phase: IncidentStatus) {
  const order: IncidentStatus[] = [
    "new",
    "investigating",
    "contained",
    "eradicated",
    "resolved",
    "closed",
  ];
  return order.indexOf(status) >= order.indexOf(phase);
}

export function IncidentDetailView({ incidentId }: { incidentId: string }) {
  const router = useRouter();
  const { getIncident, patchIncidents } = useIncidentsSession();
  const incident = getIncident(incidentId);
  const assignees = useMemo(() => getIncidentAssignees(), []);

  const [status, setStatus] = useState<IncidentStatus>("new");
  const [assigneeId, setAssigneeId] = useState("unassigned");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!incident) return;
    setStatus(incident.status);
    setAssigneeId(incident.assigneeId ?? "unassigned");
    setNotes(incident.notes);
  }, [incident]);

  if (!incident) {
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
            onClick={() => router.push("/incidents/list")}
          >
            <ArrowLeft className="size-3.5" />
            Back to cases
          </Button>
          <div className="rounded-lg border border-dashed px-6 py-16 text-center">
            <p className="text-sm font-medium">Case not found</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {incidentId} is not in the current response catalog.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const device = getLinkedDevice(incident.deviceId);
  const identity = getLinkedIdentity(incident.identityId);
  const linkedAlerts = incident.alertIds
    .map((id) => getAlertFromSession(id) ?? getAlertById(id))
    .filter((alert): alert is NonNullable<typeof alert> => Boolean(alert));
  const slaState = getIncidentSlaState(incident);
  const slaTarget = formatAgeLabel(prioritySlaMinutes[incident.priority]);
  const storyPreview = buildAttackStory(incident, linkedAlerts);

  const save = (
    patch: Partial<
      Pick<SocIncident, "status" | "assigneeId" | "notes" | "disruptionStatus">
    >,
    message: string,
  ) => {
    patchIncidents([incident.id], patch);
    appendAuditLog({
      actorId: currentProfile.id,
      actorName: currentProfile.name,
      action: "incident.updated",
      targetType: "incident",
      targetId: incident.id,
      detail: message,
    });
    toast({ title: message, description: incident.id });
  };

  const responseSteps: { phase: IncidentStatus; label: string }[] = [
    { phase: "investigating", label: "Investigate & scope impact" },
    { phase: "contained", label: "Contain affected systems" },
    { phase: "eradicated", label: "Eradicate threat artifacts" },
    { phase: "resolved", label: "Recover & verify services" },
    { phase: "closed", label: "Close after post-incident review" },
  ];

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
              onClick={() => router.push("/incidents/list")}
            >
              <ArrowLeft className="size-3.5" />
              Active cases
            </Button>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground font-mono text-xs">
                  {incident.id}
                </span>
                <PriorityBadge priority={incident.priority} />
                <IncidentStatusBadge status={incident.status} />
                <SlaBadge
                  state={slaState}
                  label={getIncidentSlaRemainingLabel(incident)}
                />
                <Badge variant="outline" className="rounded-full font-normal">
                  {incidentEnvironmentLabels[incident.environment]}
                </Badge>
                <Badge variant="secondary" className="rounded-full font-normal">
                  {storyPreview.storyClassLabel}
                </Badge>
              </div>
              <h1 className="text-xl leading-snug font-semibold tracking-tight">
                {incident.title}
              </h1>
              <p className="text-muted-foreground text-sm">
                {incident.alertIds.length} linked alert
                {incident.alertIds.length === 1 ? "" : "s"}
                {" · "}
                {incident.sourceIds.length} source
                {incident.sourceIds.length === 1 ? "" : "s"}
                {incident.escalatedFromAlerts
                  ? " · opened from alert escalation"
                  : " · correlated IR case"}
                {" · "}
                priority {storyPreview.priorityAssessment}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <TriageAssistPanel
              incident={incident}
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
                    status: status === "new" ? "investigating" : status,
                  },
                  "You own this case",
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
              onClick={() => save({ status: "contained" }, "Marked contained")}
            >
              <Shield className="size-3.5" />
              Contain
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive h-9"
              onClick={() => save({ status: "resolved" }, "Case resolved")}
            >
              Resolve
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6">
        <Tabs defaultValue="attack-story" className="flex flex-col gap-6">
          <TabsList className="h-9 w-fit">
            <TabsTrigger value="attack-story">Attack story</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="unified-timeline">Unified timeline</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="war-room">War room</TabsTrigger>
          </TabsList>

          <TabsContent value="attack-story" className="mt-0 outline-none">
            <AttackStoryPanel incident={incident} alerts={linkedAlerts} />
          </TabsContent>

          <TabsContent value="response" className="mt-0 outline-none">
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-4">
                <section className="bg-card rounded-lg border p-4">
                  <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                    Impact summary
                  </h2>
                  <p className="text-sm leading-relaxed">{incident.summary}</p>
                </section>

                <section className="bg-card rounded-lg border p-4">
                  <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                    Response checklist
                  </h2>
                  <ul className="space-y-2.5">
                    {responseSteps.map((step) => {
                      const done = phaseComplete(incident.status, step.phase);
                      return (
                        <li
                          key={step.phase}
                          className="flex items-start gap-2.5"
                        >
                          {done ? (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                          ) : (
                            <Circle className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                done && "text-muted-foreground",
                              )}
                            >
                              {step.label}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {incidentStatusLabels[step.phase]}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section className="bg-card rounded-lg border p-4">
                  <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                    Linked alerts
                  </h2>
                  {linkedAlerts.length === 0 ? (
                    <ul className="space-y-2">
                      {incident.alertIds.map((alertId) => (
                        <li key={alertId}>
                          <Link
                            href={`/alerts/${alertId}`}
                            className="text-sm font-medium hover:underline"
                          >
                            <span className="font-mono text-xs">{alertId}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="divide-border/70 divide-y">
                      {linkedAlerts.map((alert) => (
                        <li
                          key={alert.id}
                          className="py-3 first:pt-0 last:pb-0"
                        >
                          <Link
                            href={`/alerts/${alert.id}`}
                            className="hover:bg-accent/40 -mx-2 flex flex-col gap-1.5 rounded-md px-2 py-1.5 transition-colors"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <AlertSeverityBadge severity={alert.severity} />
                              <AlertStatusBadge status={alert.status} />
                              <span className="text-muted-foreground font-mono text-xs">
                                {alert.id}
                              </span>
                              <span className="min-w-0 truncate text-sm font-medium">
                                {alert.title}
                              </span>
                            </div>
                            <p className="text-muted-foreground truncate text-xs">
                              {alert.sourceName} · {alert.ruleName}
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="bg-card rounded-lg border p-4">
                  <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                    Scope & blast radius
                  </h2>
                  <div className="space-y-2.5">
                    <MetaRow label="Primary entity">
                      <span className="font-medium">{incident.entityName}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {incidentEntityTypeLabels[incident.entityType]}
                      </span>
                    </MetaRow>
                    <MetaRow label="Sources">
                      <span className="font-medium">
                        {incident.primarySourceName}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        ·{" "}
                        {
                          incidentSourceCategoryLabels[
                            incident.primarySourceCategory
                          ]
                        }
                        {incident.sourceIds.length > 1
                          ? ` · +${incident.sourceIds.length - 1} more`
                          : ""}
                      </span>
                    </MetaRow>
                    <MetaRow label="MITRE">
                      <span className="font-medium">
                        {incident.mitreTactic ?? "Unmapped"}
                      </span>
                      {incident.mitreTechnique ? (
                        <span className="text-muted-foreground font-mono text-xs">
                          {" "}
                          · {incident.mitreTechnique}
                        </span>
                      ) : null}
                    </MetaRow>
                    <MetaRow label="Environment">
                      <span className="font-medium">
                        {incidentEnvironmentLabels[incident.environment]}
                      </span>
                    </MetaRow>
                  </div>

                  <div className="mt-4 space-y-2 border-t pt-4">
                    {device ? (
                      <Link
                        href={`/assets/devices?id=${device.id}`}
                        className="hover:bg-accent/40 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                      >
                        <HardDrive className="text-muted-foreground size-4" />
                        <span className="font-medium">{device.hostname}</span>
                        <span className="text-muted-foreground truncate">
                          {device.name}
                        </span>
                      </Link>
                    ) : null}
                    {identity ? (
                      <Link
                        href={`/assets/identities?id=${identity.id}`}
                        className="hover:bg-accent/40 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                      >
                        <UserRound className="text-muted-foreground size-4" />
                        <span className="font-medium">
                          {identity.displayName}
                        </span>
                        <span className="text-muted-foreground truncate">
                          {identity.principal}
                        </span>
                      </Link>
                    ) : null}
                    {!device && !identity ? (
                      <p className="text-muted-foreground text-sm">
                        No linked inventory assets for this case yet.
                      </p>
                    ) : null}
                  </div>
                </section>

                <CorrelationPanel incidentId={incident.id} />
              </div>

              <aside className="space-y-4 self-start">
                <RunPlaybookControl incidentId={incident.id} />
                <section className="bg-card rounded-lg border p-4">
                  <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                    Containment SLA
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <PriorityBadge priority={incident.priority} />
                      <SlaBadge
                        state={slaState}
                        label={getIncidentSlaRemainingLabel(incident)}
                      />
                    </div>
                    <MetaRow label="Target">
                      <span className="font-medium tabular-nums">
                        {slaTarget}
                      </span>
                    </MetaRow>
                    <MetaRow label="Open for">
                      <span className="font-medium tabular-nums">
                        {incident.ageLabel}
                      </span>
                    </MetaRow>
                  </div>
                </section>

                <ItsmLinksPanel incidentId={incident.id} />

                <section className="bg-card rounded-lg border p-4">
                  <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                    Response timeline
                  </h2>
                  <ol className="space-y-3">
                    {incident.timeline.map((entry) => (
                      <li
                        key={`${entry.at}-${entry.label}`}
                        className="flex gap-3"
                      >
                        <div className="bg-border mt-1.5 size-2 shrink-0 rounded-full" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium break-words">
                            {entry.label}
                          </p>
                          <p className="text-muted-foreground font-mono text-xs">
                            {new Date(entry.at).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>

                <section className="bg-card rounded-lg border p-4">
                  <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                    Response
                  </h2>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="incident-status">Phase</Label>
                      <Select
                        value={status}
                        onValueChange={(value) => {
                          const next = value as IncidentStatus;
                          setStatus(next);
                          save({ status: next }, "Response phase updated");
                        }}
                      >
                        <SelectTrigger id="incident-status" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {incidentStatuses.map((option) => (
                            <SelectItem key={option} value={option}>
                              {incidentStatusLabels[option]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="incident-assignee">Responder</Label>
                      <Select
                        value={assigneeId}
                        onValueChange={(value) => {
                          setAssigneeId(value);
                          save(
                            {
                              assigneeId:
                                value === "unassigned" ? null : value,
                            },
                            "Responder updated",
                          );
                        }}
                      >
                        <SelectTrigger
                          id="incident-assignee"
                          className="w-full"
                        >
                          <SelectValue />
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

                    <div className="pt-1">
                      <p className="text-muted-foreground mb-2 text-xs">
                        Current owner
                      </p>
                      <AssigneeCell assigneeId={incident.assigneeId} />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="incident-notes">Response journal</Label>
                      <Textarea
                        id="incident-notes"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        onBlur={() => {
                          if (notes !== incident.notes) {
                            save({ notes }, "Journal saved");
                          }
                        }}
                        placeholder="Containment actions, comms, next steps…"
                        className="min-h-28"
                      />
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </TabsContent>

          <TabsContent value="unified-timeline" className="mt-0 outline-none">
            <div className="mx-auto max-w-4xl">
              <UnifiedTimeline incident={incident} alerts={linkedAlerts} />
            </div>
          </TabsContent>

          <TabsContent value="evidence" className="mt-0 outline-none">
            <div className="mx-auto max-w-4xl">
              <EvidenceLocker incidentId={incident.id} />
            </div>
          </TabsContent>

          <TabsContent value="war-room" className="mt-0 outline-none">
            <div className="mx-auto max-w-4xl">
              <IncidentWarRoom incident={incident} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
