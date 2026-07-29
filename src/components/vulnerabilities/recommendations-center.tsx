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
import { Badge } from "@/components/ui/badge";
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
  recommendations,
  type RecommendationStatus,
  recommendationStatusLabels,
} from "./vulnerabilities-data";
import { RecommendationStatusBadge } from "./vulnerabilities-primitives";

export function RecommendationsCenter() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recommendations;
    return recommendations.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.relatedComponent.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [query]);

  const rows = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const stats: SocStat[] = useMemo(() => {
    const active = recommendations.filter((r) => r.status === "active").length;
    const inProgress = recommendations.filter(
      (r) => r.status === "in-progress",
    ).length;
    const exposed = recommendations.reduce((n, r) => n + r.exposedDevices, 0);
    return [
      {
        key: "total",
        title: "Recommendations",
        value: String(recommendations.length),
        context: "Guided fix packages",
      },
      {
        key: "active",
        title: "Active",
        value: String(active),
        context: "Awaiting owner action",
      },
      {
        key: "progress",
        title: "In progress",
        value: String(inProgress),
        context: "Remediation underway",
      },
      {
        key: "devices",
        title: "Exposed devices",
        value: exposed.toLocaleString(),
        context: "Across all packages",
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
              placeholder="Search recommendations…"
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
                <TableHead className="text-right">Weaknesses</TableHead>
                <TableHead className="text-right">Exposed</TableHead>
                <TableHead className="text-right">Impact</TableHead>
                <TableHead>Scope</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link
                      href={`/vulnerabilities/work?q=${encodeURIComponent(item.id)}`}
                      className="font-medium hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {item.relatedComponent} · {item.osPlatform}
                    </p>
                  </TableCell>
                  <TableCell>
                    <RecommendationStatusBadge
                      status={item.status as RecommendationStatus}
                    />
                    <span className="sr-only">
                      {recommendationStatusLabels[item.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.weaknessCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.exposedDevices}/{item.totalDevices}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.impactScore}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {item.scope}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
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
