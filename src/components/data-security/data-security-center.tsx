"use client";

import { Search, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DEFAULT_PAGE_SIZE,
  ListPagination,
  paginateItems,
} from "@/components/list-pagination";
import {
  ModuleShell,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type DataSecurityFinding,
  type DataSecurityPolicy,
  type ExfilTimelineEvent,
  type SaaSAppInventoryItem,
} from "@/components/data-security/data-security-data";
import { dataSecurityApi } from "@/lib/mock-api/data-security";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const severityTone: Record<string, string> = {
  critical: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
  high: "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  medium:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  low: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};

export function DataSecurityCenter() {
  const [tab, setTab] = useState("findings");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [findings, setFindings] = useState<DataSecurityFinding[]>([]);
  const [policies, setPolicies] = useState<DataSecurityPolicy[]>([]);
  const [apps, setApps] = useState<SaaSAppInventoryItem[]>([]);
  const [timeline, setTimeline] = useState<ExfilTimelineEvent[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [f, p, a, t] = await Promise.all([
      dataSecurityApi.listFindings({ q: query || undefined }),
      dataSecurityApi.listPolicies(),
      dataSecurityApi.listSaasApps(),
      dataSecurityApi.listTimeline(),
    ]);
    setFindings(f.items);
    setPolicies(p.items);
    setApps(a.items);
    setTimeline(t.items);
  }, [query]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filteredPolicies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return policies;
    return policies.filter((p) =>
      [p.name, p.summary, p.kind, p.upstreamRef, p.sourceName, p.status]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [policies, query]);

  const filteredApps = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((app) =>
      [app.name, app.category, app.sanction, app.risk, app.sourceName]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [apps, query]);

  const filteredTimeline = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return timeline;
    return timeline.filter((ev) =>
      [
        ev.summary,
        ev.kind,
        ev.identityLabel,
        ev.findingId,
        ev.channel,
        ev.destination ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [timeline, query]);

  const activeTotal =
    tab === "findings"
      ? findings.length
      : tab === "policies"
        ? filteredPolicies.length
        : tab === "saas"
          ? filteredApps.length
          : filteredTimeline.length;

  const pagedFindings = useMemo(
    () => paginateItems(findings, page, pageSize),
    [findings, page, pageSize],
  );
  const pagedPolicies = useMemo(
    () => paginateItems(filteredPolicies, page, pageSize),
    [filteredPolicies, page, pageSize],
  );
  const pagedApps = useMemo(
    () => paginateItems(filteredApps, page, pageSize),
    [filteredApps, page, pageSize],
  );
  const pagedTimeline = useMemo(
    () => paginateItems(filteredTimeline, page, pageSize),
    [filteredTimeline, page, pageSize],
  );

  const stats: SocStat[] = useMemo(() => {
    const open = findings.filter(
      (f) => f.status === "open" || f.status === "investigating",
    ).length;
    const shadow = apps.filter((a) => a.sanction === "shadow").length;
    return [
      {
        key: "findings",
        title: "Open findings",
        value: String(open),
        context: "DLP + CASB ingest",
      },
      {
        key: "policies",
        title: "Policies",
        value: String(policies.length),
        context: "Upstream DLP/CASB",
      },
      {
        key: "saas",
        title: "SaaS apps",
        value: String(apps.length),
        context: `${shadow} shadow IT`,
      },
      {
        key: "exfil",
        title: "Exfil events",
        value: String(timeline.length),
        context: "Linked timeline",
      },
    ];
  }, [findings, policies, apps, timeline]);

  const openIncident = async (id: string) => {
    setBusyId(id);
    try {
      const { receipt, incident } = await dataSecurityApi.openIncident(id);
      toast({
        title: incident ? `Opened ${incident.id}` : "Open incident",
        description: receipt.message,
      });
      await reload();
    } catch (error) {
      toast({
        title: "Open incident failed",
        description:
          error instanceof Error ? error.message : "Unable to open incident",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const pagination = (
    <ListPagination
      page={page}
      pageSize={pageSize}
      total={activeTotal}
      onPageChange={setPage}
      onPageSizeChange={(size) => {
        setPage(1);
        setPageSize(size);
      }}
    />
  );

  return (
    <ModuleShell
      toolbar={
        <ModuleToolbarSearch>
          <InputGroup className="h-9 w-full lg:max-w-sm">
            <InputGroupAddon>
              <Search className="text-muted-foreground size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder={
                tab === "findings"
                  ? "Search findings…"
                  : tab === "policies"
                    ? "Search policies…"
                    : tab === "saas"
                      ? "Search SaaS apps…"
                      : "Search exfil events…"
              }
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
            />
          </InputGroup>
        </ModuleToolbarSearch>
      }
    >
      <StatsStrip stats={stats} />

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setPage(1);
          setTab(value);
        }}
      >
        <TabsList>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="saas">SaaS apps</TabsTrigger>
          <TabsTrigger value="timeline">Exfil timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="findings" className="mt-4">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Finding</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Identity</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Incident</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedFindings.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                        <div>
                          <p className="font-medium">{row.title}</p>
                          <p className="text-muted-foreground text-xs">
                            {row.kind.toUpperCase()} · {row.dataClass} ·{" "}
                            {row.detectedLabel}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full capitalize",
                          severityTone[row.severity],
                        )}
                      >
                        {row.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/assets/identities?q=${encodeURIComponent(row.identityLabel)}`}
                        className="text-xs hover:underline"
                      >
                        {row.identityLabel}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {row.sourceName}
                    </TableCell>
                    <TableCell>
                      {row.openIncidentId ? (
                        <Link
                          href={`/incidents/${row.openIncidentId}`}
                          className="font-mono text-xs hover:underline"
                        >
                          {row.openIncidentId}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7"
                        disabled={busyId !== null || Boolean(row.openIncidentId)}
                        onClick={() => void openIncident(row.id)}
                      >
                        {busyId === row.id ? "Opening…" : "Open incident"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {pagination}
          </div>
        </TabsContent>

        <TabsContent value="policies" className="mt-4">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Upstream</TableHead>
                  <TableHead>Hits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedPolicies.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {p.summary}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs uppercase">{p.kind}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="rounded-full capitalize"
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {p.upstreamRef}
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">
                      {p.findingCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {pagination}
          </div>
        </TabsContent>

        <TabsContent value="saas" className="mt-4">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App</TableHead>
                  <TableHead>Sanction</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedApps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <p className="font-medium">{app.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {app.category}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full capitalize",
                          app.sanction === "shadow" &&
                            "border-orange-500/40 text-orange-700",
                        )}
                      >
                        {app.sanction}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full capitalize",
                          severityTone[app.risk],
                        )}
                      >
                        {app.risk}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">
                      {app.users}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {app.sourceName}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {pagination}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Identity</TableHead>
                  <TableHead>Finding</TableHead>
                  <TableHead>Destination</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedTimeline.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="text-muted-foreground text-xs tabular-nums">
                      {ev.atLabel}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{ev.summary}</p>
                      <p className="text-muted-foreground text-xs capitalize">
                        {ev.kind}
                        {ev.bytesLabel ? ` · ${ev.bytesLabel}` : ""}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs">{ev.identityLabel}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {ev.findingId}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {ev.destination ?? ev.channel}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {pagination}
          </div>
        </TabsContent>
      </Tabs>
    </ModuleShell>
  );
}
