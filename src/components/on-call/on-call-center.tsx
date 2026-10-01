"use client";

import {
  Bell,
  Check,
  MessageSquare,
  Phone,
  Radio,
  Search,
  Shield,
  Siren,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import {
  openIncidentStatuses,
  type SocIncident,
  type WarRoomMessage,
} from "@/components/incidents/incidents-data";
import {
  getIncidentSessionSnapshot,
  patchIncidentsInSession,
  subscribeIncidentsSession,
} from "@/components/incidents/incidents-session";
import {
  DEFAULT_PAGE_SIZE,
  ListPagination,
  paginateItems,
} from "@/components/list-pagination";
import { currentProfile } from "@/components/profile/profile-data";
import {
  ModuleShell,
  ModuleToolbarActions,
  ModuleToolbarSearch,
} from "@/components/soc/module-shell";
import { type SocStat, StatsStrip } from "@/components/soc/stats-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  getOnCallScheduleSnapshot,
  onCallApi,
  subscribeOnCall,
} from "@/lib/mock-api/on-call";
import { responseApi } from "@/lib/mock-api/response";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type QueueFilter = "all" | "critical" | "high" | "acked" | "unacked";

function ageLabel(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export function OnCallCenter() {
  const store = useSyncExternalStore(
    subscribeIncidentsSession,
    getIncidentSessionSnapshot,
    getIncidentSessionSnapshot,
  );
  const schedule = useSyncExternalStore(
    subscribeOnCall,
    getOnCallScheduleSnapshot,
    getOnCallScheduleSnapshot,
  );

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<QueueFilter>("unacked");
  const [ackedIds, setAckedIds] = useState<Set<string>>(() => new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const criticalQueue = useMemo(() => {
    return Array.from(store.values())
      .filter(
        (incident) =>
          openIncidentStatuses.includes(incident.status) &&
          (incident.severity === "critical" || incident.severity === "high"),
      )
      .sort((a, b) => {
        const sev =
          (a.severity === "critical" ? 0 : 1) -
          (b.severity === "critical" ? 0 : 1);
        if (sev !== 0) return sev;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [store]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return criticalQueue.filter((incident) => {
      if (filter === "critical" && incident.severity !== "critical") return false;
      if (filter === "high" && incident.severity !== "high") return false;
      const acked = ackedIds.has(incident.id);
      if (filter === "acked" && !acked) return false;
      if (filter === "unacked" && acked) return false;
      if (!q) return true;
      return (
        incident.id.toLowerCase().includes(q) ||
        incident.title.toLowerCase().includes(q) ||
        (incident.entityName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [ackedIds, criticalQueue, filter, query]);

  const paged = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const selected =
    criticalQueue.find((i) => i.id === selectedId) ??
    filtered[0] ??
    criticalQueue[0] ??
    null;

  const stats: SocStat[] = useMemo(() => {
    const critical = criticalQueue.filter((i) => i.severity === "critical")
      .length;
    const unacked = criticalQueue.filter((i) => !ackedIds.has(i.id)).length;
    return [
      {
        key: "queue",
        title: "Critical queue",
        value: String(criticalQueue.length),
        context: "Open critical + high",
      },
      {
        key: "critical",
        title: "Critical",
        value: String(critical),
        context: "P1 severity",
      },
      {
        key: "unacked",
        title: "Unacked",
        value: String(unacked),
        context: "Awaiting acknowledgment",
      },
      {
        key: "pages",
        title: "Open pages",
        value: String(schedule.openPages),
        context: schedule.name,
      },
    ];
  }, [ackedIds, criticalQueue, schedule.name, schedule.openPages]);

  const acknowledge = (incident: SocIncident) => {
    setAckedIds((prev) => new Set(prev).add(incident.id));
    toast({
      title: "Acknowledged",
      description: `${incident.id} · ${currentProfile.name}`,
    });
  };

  const pageOnCall = async (incident: SocIncident) => {
    setBusy(`page-${incident.id}`);
    try {
      const { receipt } = await onCallApi.page({
        summary: `On-call desk · ${incident.id}: ${incident.title}`,
        severity: incident.severity === "critical" ? "critical" : "high",
        incidentId: incident.id,
      });
      setAckedIds((prev) => new Set(prev).add(incident.id));
      toast({
        title: "Paged on-call",
        description: `${receipt.message} · ${receipt.externalRef ?? receipt.id}`,
      });
    } catch (error) {
      toast({
        title: "Page failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const escalate = async (incident: SocIncident) => {
    setBusy(`esc-${incident.id}`);
    try {
      const { receipt } = await onCallApi.page({
        summary: `ESCALATION · ${incident.id}: ${incident.title}`,
        severity: "critical",
        incidentId: incident.id,
      });
      toast({
        title: "Escalated to secondary",
        description: `${schedule.secondary.name} · ${receipt.externalRef ?? receipt.id}`,
      });
    } catch (error) {
      toast({
        title: "Escalation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const approveContain = async (incident: SocIncident) => {
    setBusy(`contain-${incident.id}`);
    try {
      const deviceId = incident.deviceId ?? "WS-SOC-0007";
      const receipt = await responseApi.contain({
        action: "isolate-host",
        targetType: "device",
        targetId: deviceId,
        targetLabel: deviceId,
        incidentId: incident.id,
      });
      setAckedIds((prev) => new Set(prev).add(incident.id));
      toast({
        title: "Contain approved",
        description: receipt.message,
      });
    } finally {
      setBusy(null);
    }
  };

  const postReply = (incident: SocIncident) => {
    const body = reply.trim();
    if (!body) return;
    const message: WarRoomMessage = {
      id: `wrm-oncall-${Date.now().toString(36)}`,
      at: new Date().toISOString(),
      authorId: currentProfile.id,
      authorName: currentProfile.name,
      body,
      mentionIds: [],
      kind: "message",
    };
    patchIncidentsInSession([incident.id], {
      warRoomMessages: [...(incident.warRoomMessages ?? []), message],
    });
    setReply("");
    toast({ title: "War room reply posted", description: incident.id });
  };

  const filters: { id: QueueFilter; label: string }[] = [
    { id: "unacked", label: "Unacked" },
    { id: "all", label: "All" },
    { id: "critical", label: "Critical" },
    { id: "high", label: "High" },
    { id: "acked", label: "Acked" },
  ];

  return (
    <ModuleShell
      toolbar={
        <>
          <ModuleToolbarSearch>
            <InputGroup className="h-9 w-full lg:max-w-sm">
              <InputGroupAddon>
                <Search className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search critical queue…"
              />
            </InputGroup>
          </ModuleToolbarSearch>
          <ModuleToolbarActions>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((item) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant={filter === item.id ? "default" : "outline"}
                  className="h-8"
                  onClick={() => {
                    setFilter(item.id);
                    setPage(1);
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <Button
              size="sm"
              className="h-8 gap-1.5"
              disabled={busy === "page-global"}
              onClick={() => {
                void (async () => {
                  setBusy("page-global");
                  try {
                    const { receipt } = await onCallApi.page({
                      summary: "Manual page from on-call desk",
                      severity: "high",
                    });
                    toast({
                      title: "Paged on-call",
                      description: receipt.message,
                    });
                  } finally {
                    setBusy(null);
                  }
                })();
              }}
            >
              <Radio className="size-3.5" />
              Page on-call
            </Button>
          </ModuleToolbarActions>
        </>
      }
    >
      <StatsStrip stats={stats} />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border px-3 py-2.5">
          <p className="text-muted-foreground text-xs">Primary</p>
          <p className="text-sm font-medium">{schedule.primary.name}</p>
          <p className="text-muted-foreground text-xs">
            until {schedule.primary.until}
            {schedule.primary.title ? ` · ${schedule.primary.title}` : ""}
          </p>
        </div>
        <div className="rounded-lg border px-3 py-2.5">
          <p className="text-muted-foreground text-xs">Secondary</p>
          <p className="text-sm font-medium">{schedule.secondary.name}</p>
          <p className="text-muted-foreground text-xs">
            until {schedule.secondary.until}
            {schedule.secondary.title ? ` · ${schedule.secondary.title}` : ""}
          </p>
        </div>
        <div className="rounded-lg border px-3 py-2.5">
          <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs">
            <Bell className="size-3.5" />
            Last escalation
          </p>
          <p className="text-xs leading-relaxed">
            {schedule.lastEscalation ?? "No pages yet this shift"}
          </p>
        </div>
      </div>

      <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <div className="bg-card overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="hidden md:table-cell">Age</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="w-[1%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground h-24 text-center text-sm"
                  >
                    No incidents match this on-call filter.
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((incident) => {
                  const acked = ackedIds.has(incident.id);
                  const active = selected?.id === incident.id;
                  return (
                    <TableRow
                      key={incident.id}
                      className={cn(
                        "cursor-pointer",
                        active && "bg-accent/40",
                      )}
                      onClick={() => setSelectedId(incident.id)}
                    >
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-mono text-[11px]">{incident.id}</p>
                          <p className="truncate text-sm font-medium">
                            {incident.title}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            incident.severity === "critical" &&
                              "border-destructive/40 text-destructive",
                          )}
                        >
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden tabular-nums md:table-cell">
                        {ageLabel(incident.updatedAt)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={acked ? "secondary" : "outline"}>
                          {acked ? "Acked" : "Unacked"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            disabled={acked}
                            onClick={() => acknowledge(incident)}
                          >
                            Ack
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            disabled={busy === `page-${incident.id}`}
                            onClick={() => void pageOnCall(incident)}
                          >
                            Page
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            asChild
                          >
                            <Link href={`/incidents/${incident.id}`}>Open</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>

        <div className="bg-card space-y-4 rounded-lg border p-4">
          {selected ? (
            <>
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs">{selected.id}</p>
                    <p className="text-sm font-semibold leading-snug">
                      {selected.title}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize shrink-0">
                    {selected.severity}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  Updated {ageLabel(selected.updatedAt)} ago ·{" "}
                  {selected.status.replaceAll("-", " ")}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <Button
                  className="gap-1.5"
                  disabled={ackedIds.has(selected.id)}
                  onClick={() => acknowledge(selected)}
                >
                  <Check className="size-3.5" />
                  Acknowledge
                </Button>
                <Button
                  variant="secondary"
                  className="gap-1.5"
                  disabled={busy === `page-${selected.id}`}
                  onClick={() => void pageOnCall(selected)}
                >
                  <Phone className="size-3.5" />
                  Page primary
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5"
                  disabled={busy === `esc-${selected.id}`}
                  onClick={() => void escalate(selected)}
                >
                  <Siren className="size-3.5" />
                  Escalate
                </Button>
                <Button
                  variant="destructive"
                  className="gap-1.5"
                  disabled={busy === `contain-${selected.id}`}
                  onClick={() => void approveContain(selected)}
                >
                  <Shield className="size-3.5" />
                  Approve contain
                </Button>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/incidents/${selected.id}`}>
                  Open incident workspace
                </Link>
              </Button>

              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-medium tracking-wide uppercase">
                  War room reply
                </p>
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Update responders…"
                  className="min-h-20"
                />
                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  onClick={() => postReply(selected)}
                >
                  <MessageSquare className="size-4" />
                  Post to war room
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground py-10 text-center text-sm">
              Select an incident from the critical queue.
            </p>
          )}
        </div>
      </div>
    </ModuleShell>
  );
}
