"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { administrationUsers } from "@/components/administration/users-data";
import { ListPagination, paginateItems } from "@/components/list-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  buildWorkQueue,
  formatCompact,
  getVulnerability,
  getVulnOwner,
  recommendations,
  type RemediationStatus,
  remediationStatuses,
  remediationStatusLabels,
  type VulnWorkItem,
} from "./vulnerabilities-data";
import {
  shouldDefaultMineQueue,
  useVulnPersona,
} from "./vulnerabilities-persona";
import {
  mutedControlClassName,
  RecommendationStatusBadge,
  RemediationStatusBadge,
  SheetDetailRow,
  tabTriggerClassName,
} from "./vulnerabilities-primitives";
import { useVulnSession } from "./vulnerabilities-session";
import {
  buildFindingsHref,
  buildWorkHref,
  parseWorkSearchParams,
  type WorkListFilters,
} from "./vulnerabilities-url";

const assignableOwners = administrationUsers.filter(
  (u) => u.role === "Analyst" || u.role === "Responder" || u.role === "Admin",
);

function KindBadge({ kind }: { kind: VulnWorkItem["kind"] }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-medium capitalize",
        kind === "remediation"
          ? "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
          : "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
      )}
    >
      {kind}
    </Badge>
  );
}

function StatusCell({ item }: { item: VulnWorkItem }) {
  if (item.kind === "remediation") {
    return (
      <RemediationStatusBadge status={item.status as RemediationStatus} />
    );
  }
  return (
    <RecommendationStatusBadge
      status={
        item.status as
          | "active"
          | "in-progress"
          | "completed"
          | "exception"
          | "deferred"
      }
    />
  );
}

function OwnerLabel({ ownerId }: { ownerId: string | null }) {
  const owner = getVulnOwner(ownerId);
  if (!owner) {
    return <span className="text-muted-foreground text-xs">Unassigned</span>;
  }
  return <span className="text-sm">{owner.name}</span>;
}

function WorkDetailSheet({
  item,
  onOpenChange,
}: {
  item: VulnWorkItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { currentUserId } = useVulnPersona();
  const {
    updateRemediationStatus,
    assignRemediationOwner,
    createRemediationFromRecommendation,
  } = useVulnSession();

  const findings = useMemo(() => {
    if (!item) return [];
    return item.vulnerabilityIds
      .map((id) => getVulnerability(id))
      .filter((v): v is NonNullable<typeof v> => Boolean(v));
  }, [item]);

  const recommendation =
    item?.kind === "recommendation"
      ? recommendations.find((r) => r.id === item.id) ?? null
      : null;

  return (
    <Sheet open={item !== null} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        {item ? (
          <>
            <SheetHeader className="space-y-3 pb-4">
              <div className="min-w-0 space-y-1">
                <SheetTitle className="text-base leading-snug">
                  {item.title}
                </SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {item.id}
                  {item.ticketRef ? ` · ${item.ticketRef}` : ""}
                </SheetDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <KindBadge kind={item.kind} />
                <StatusCell item={item} />
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4">
              <section className="space-y-2.5">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Details
                </h3>
                <SheetDetailRow label="Impact">
                  {item.impactScore.toFixed(1)}
                </SheetDetailRow>
                <SheetDetailRow label="Devices">
                  {item.devicesRemaining != null
                    ? `${formatCompact(item.devicesRemaining)} remaining / ${formatCompact(item.devicesTotal)}`
                    : formatCompact(item.devicesTotal)}
                </SheetDetailRow>
                {item.kind === "remediation" ? (
                  <SheetDetailRow label="Owner">
                    <Select
                      value={item.ownerId ?? "unassigned"}
                      onValueChange={(value) => {
                        const ownerId = value === "unassigned" ? null : value;
                        assignRemediationOwner(item.id, ownerId);
                        toast({
                          title: "Owner updated",
                          description: ownerId
                            ? `Assigned to ${getVulnOwner(ownerId)?.name ?? ownerId}`
                            : "Cleared assignment",
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 w-full max-w-[200px]">
                        <SelectValue placeholder="Assign owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {assignableOwners.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SheetDetailRow>
                ) : null}
                {recommendation ? (
                  <SheetDetailRow label="Platform">
                    {recommendation.osPlatform}
                  </SheetDetailRow>
                ) : null}
              </section>

              <Separator />

              <section className="space-y-2">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Linked findings
                </h3>
                {findings.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No CVE findings linked.
                  </p>
                ) : (
                  <ul className="divide-border/60 divide-y">
                    {findings.map((v) => (
                      <li key={v.id} className="py-2 first:pt-0 last:pb-0">
                        <Link
                          href={buildFindingsHref({}, v.id)}
                          className="text-primary font-mono text-sm hover:underline"
                        >
                          {v.cve}
                        </Link>
                        <p className="text-muted-foreground truncate text-xs">
                          {v.title}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <Separator />

              <section className="space-y-2">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Linked alerts
                </h3>
                {item.linkedAlertIds.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No linked alerts.
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {item.linkedAlertIds.map((id) => (
                      <li key={id}>
                        <Link
                          href={`/alerts/${id}`}
                          className="text-primary font-mono text-xs hover:underline"
                        >
                          {id}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <SheetFooter className="mt-6 flex-col gap-2 border-t pt-4 sm:flex-col">
              {item.kind === "remediation" ? (
                <div className="grid grid-cols-2 gap-2">
                  {remediationStatuses
                    .filter((s) => s !== item.status)
                    .slice(0, 4)
                    .map((status) => (
                      <Button
                        key={status}
                        variant="outline"
                        size="sm"
                        className={cn("h-8", mutedControlClassName)}
                        onClick={() => {
                          updateRemediationStatus(item.id, status);
                          toast({
                            title: "Status updated",
                            description: `${item.id} → ${remediationStatusLabels[status]}`,
                          });
                        }}
                      >
                        {remediationStatusLabels[status]}
                      </Button>
                    ))}
                </div>
              ) : recommendation ? (
                <Button
                  size="sm"
                  className="h-8 w-full"
                  onClick={() => {
                    const created = createRemediationFromRecommendation({
                      recommendationId: recommendation.id,
                      title: recommendation.title,
                      vulnerabilityIds: recommendation.vulnerabilityIds,
                      devicesTotal: recommendation.exposedDevices,
                      ownerId: currentUserId,
                    });
                    toast({
                      title: "Remediation created",
                      description: `${created.ticketRef} tracks this recommendation.`,
                    });
                    onOpenChange(false);
                    router.push(buildWorkHref({}, created.id));
                  }}
                >
                  Create remediation
                </Button>
              ) : null}
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export function WorkCenter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { persona, currentUserId } = useVulnPersona();
  const { remediations } = useVulnSession();

  const urlFilters = useMemo(
    () => parseWorkSearchParams(searchParams),
    [searchParams],
  );
  const selectedFromUrl = searchParams.get("item");

  const [searchQuery, setSearchQuery] = useState(urlFilters.search);
  const [kind, setKind] = useState<WorkListFilters["kind"]>(urlFilters.kind);
  const [statusFilters, setStatusFilters] = useState<string[]>(
    urlFilters.statuses,
  );
  const [mineOnly, setMineOnly] = useState(() =>
    searchParams.has("mine")
      ? urlFilters.mineOnly
      : shouldDefaultMineQueue(persona),
  );
  const [selectedId, setSelectedId] = useState<string | null>(selectedFromUrl);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const deferredSearch = useDeferredValue(searchQuery);

  useEffect(() => {
    setSearchQuery(urlFilters.search);
    setKind(urlFilters.kind);
    setStatusFilters(urlFilters.statuses);
    setMineOnly(
      searchParams.has("mine")
        ? urlFilters.mineOnly
        : shouldDefaultMineQueue(persona),
    );
    setSelectedId(selectedFromUrl);
  }, [urlFilters, selectedFromUrl, persona, searchParams]);

  const queue = useMemo(
    () => buildWorkQueue(remediations, recommendations),
    [remediations],
  );

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return queue.filter((item) => {
      if (kind !== "all" && item.kind !== kind) return false;
      if (statusFilters.length > 0 && !statusFilters.includes(item.status)) {
        return false;
      }
      if (mineOnly) {
        if (item.kind !== "remediation") return false;
        if (item.ownerId !== currentUserId) return false;
      }
      if (!q) return true;
      const ownerName = getVulnOwner(item.ownerId)?.name.toLowerCase() ?? "";
      return (
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.ticketRef?.toLowerCase().includes(q) ?? false) ||
        item.status.toLowerCase().includes(q) ||
        ownerName.includes(q)
      );
    });
  }, [queue, deferredSearch, kind, statusFilters, mineOnly, currentUserId]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, kind, statusFilters, mineOnly, pageSize]);

  useEffect(() => {
    const nextHref = buildWorkHref(
      {
        search: deferredSearch,
        kind,
        statuses: statusFilters,
        mineOnly,
      },
      selectedId ?? undefined,
    );
    const currentHref = buildWorkHref(
      parseWorkSearchParams(searchParams),
      searchParams.get("item") ?? undefined,
    );
    if (nextHref !== currentHref) {
      router.replace(nextHref, { scroll: false });
    }
  }, [
    deferredSearch,
    kind,
    statusFilters,
    mineOnly,
    selectedId,
    router,
    searchParams,
  ]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageItems = paginateItems(filtered, safePage, pageSize);

  const selected =
    queue.find((item) => item.id === selectedId) ??
    filtered.find((item) => item.id === selectedId) ??
    null;

  const toggleStatus = (status: string) => {
    setStatusFilters((current) =>
      current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status],
    );
  };

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="border-b">
        <div className="flex flex-col gap-2 px-4 py-3 sm:px-6 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2">
          <div className="min-w-0 flex-1">
            <InputGroup className="h-9 w-full lg:max-w-sm">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={searchQuery}
                placeholder="Search work items, tickets, owners…"
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </InputGroup>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
            <label className="border-border bg-background hover:bg-accent flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
              <Switch
                checked={mineOnly}
                onCheckedChange={setMineOnly}
                aria-label="My queue only"
              />
              <span className="whitespace-nowrap">My queue</span>
            </label>
            <div className="flex flex-wrap gap-1">
              {remediationStatuses.map((status) => {
                const active = statusFilters.includes(status);
                return (
                  <Button
                    key={status}
                    type="button"
                    variant={active ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-8 px-2 text-xs capitalize",
                      !active && mutedControlClassName,
                    )}
                    onClick={() => toggleStatus(status)}
                  >
                    {remediationStatusLabels[status]}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full flex-col gap-4">
          <Tabs
            value={kind}
            onValueChange={(value) =>
              setKind(value as WorkListFilters["kind"])
            }
            className="flex flex-col gap-4"
          >
            <div className="overflow-x-auto border-b">
              <TabsList className="inline-flex h-auto min-w-max justify-start gap-7 rounded-none bg-transparent p-0 sm:gap-8">
                <TabsTrigger value="all" className={tabTriggerClassName}>
                  All
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {queue.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="remediation"
                  className={tabTriggerClassName}
                >
                  Remediations
                </TabsTrigger>
                <TabsTrigger
                  value="recommendation"
                  className={tabTriggerClassName}
                >
                  Recommendations
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="bg-card overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kind</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Devices remaining</TableHead>
                    <TableHead>Linked alerts</TableHead>
                    <TableHead>Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedId(item.id)}
                    >
                      <TableCell>
                        <KindBadge kind={item.kind} />
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        <span className="line-clamp-2 text-sm font-medium">
                          {item.title}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.ticketRef ?? (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <OwnerLabel ownerId={item.ownerId} />
                      </TableCell>
                      <TableCell>
                        <StatusCell item={item} />
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {item.devicesRemaining != null
                          ? formatCompact(item.devicesRemaining)
                          : "—"}
                      </TableCell>
                      <TableCell
                        className="tabular-nums"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.linkedAlertIds.length === 0 ? (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {item.linkedAlertIds.map((id) => (
                              <Link
                                key={id}
                                href={`/alerts/${id}`}
                                className="text-primary font-mono text-xs hover:underline"
                              >
                                {id}
                              </Link>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {item.impactScore.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {pageItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-muted-foreground h-24 text-center"
                      >
                        No work items match these filters.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
              <ListPagination
                page={safePage}
                pageSize={pageSize}
                total={filtered.length}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </div>
          </Tabs>
        </div>
      </div>

      <WorkDetailSheet
        item={selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </main>
  );
}
