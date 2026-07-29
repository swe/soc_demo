"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  ListPagination,
  DEFAULT_PAGE_SIZE,
  paginateItems,
} from "@/components/list-pagination";
import {
  ModuleShell,
  ModuleToolbarSearch,
} from "@/components/soc/module-shell";
import { type SocStat, StatsStrip } from "@/components/soc/stats-strip";
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

import {
  getVulnOwner,
  remediations,
  type RemediationStatus,
  remediationStatusLabels,
} from "./vulnerabilities-data";
import { RemediationStatusBadge } from "./vulnerabilities-primitives";

export function RemediationsCenter() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return remediations;
    return remediations.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.ticketRef.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [query]);

  const rows = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const stats: SocStat[] = useMemo(() => {
    const pending = remediations.filter((r) => r.status === "pending").length;
    const inProgress = remediations.filter(
      (r) => r.status === "in_progress",
    ).length;
    const failed = remediations.filter((r) => r.status === "failed").length;
    return [
      {
        key: "total",
        title: "Remediations",
        value: String(remediations.length),
        context: "Tracked fix jobs",
      },
      {
        key: "pending",
        title: "Pending",
        value: String(pending),
        context: "Not started",
      },
      {
        key: "progress",
        title: "In progress",
        value: String(inProgress),
        context: "Actively deploying",
      },
      {
        key: "failed",
        title: "Failed",
        value: String(failed),
        context: "Needs retry",
      },
    ];
  }, []);

  return (
    <ModuleShell
      toolbar={
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
              placeholder="Search remediations…"
            />
          </InputGroup>
        </ModuleToolbarSearch>
      }
    >
      <StatsStrip stats={stats} />

        <div className="bg-card overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Ticket</TableHead>
                <TableHead className="text-right">Devices</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => {
                const owner = getVulnOwner(item.ownerId);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/vulnerabilities/work?q=${encodeURIComponent(item.id)}`}
                        className="font-medium hover:underline"
                      >
                        {item.title}
                      </Link>
                      <p className="text-muted-foreground text-xs">{item.id}</p>
                    </TableCell>
                    <TableCell>
                      <RemediationStatusBadge
                        status={item.status as RemediationStatus}
                      />
                      <span className="sr-only">
                        {remediationStatusLabels[item.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {owner?.name ?? (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.ticketRef}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.devicesTotal - item.devicesRemaining}/
                      {item.devicesTotal}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {item.dueLabel}
                    </TableCell>
                  </TableRow>
                );
              })}
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
    </ModuleShell>
  );
}
