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
  vulnEvents,
  type VulnEventType,
} from "./vulnerabilities-data";

const eventTypeLabels: Record<VulnEventType, string> = {
  "new-cves": "New CVEs",
  "score-change": "Score change",
  "remediation-completed": "Remediation completed",
  "exception-granted": "Exception granted",
  "zero-day": "Zero-day",
  "exploit-detected": "Exploit detected",
};

export function EventTimelineCenter() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...vulnEvents].sort((a, b) => b.at.localeCompare(a.at));
    if (!q) return sorted;
    return sorted.filter(
      (item) =>
        item.summary.toLowerCase().includes(q) ||
        item.type.includes(q) ||
        item.relatedCveIds.some((cve) => cve.toLowerCase().includes(q)),
    );
  }, [query]);

  const rows = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const stats: SocStat[] = useMemo(() => {
    const zeroDay = vulnEvents.filter((e) => e.type === "zero-day").length;
    const exploits = vulnEvents.filter(
      (e) => e.type === "exploit-detected",
    ).length;
    const devices = vulnEvents.reduce((n, e) => n + e.impactedDevices, 0);
    return [
      {
        key: "events",
        title: "Events",
        value: String(vulnEvents.length),
        context: "Exposure timeline",
      },
      {
        key: "zero-day",
        title: "Zero-days",
        value: String(zeroDay),
        context: "High urgency",
      },
      {
        key: "exploits",
        title: "Exploits detected",
        value: String(exploits),
        context: "Active threat signals",
      },
      {
        key: "devices",
        title: "Devices impacted",
        value: devices.toLocaleString(),
        context: "Sum across events",
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
              placeholder="Search events or CVEs…"
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
                <TableHead>When</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead className="text-right">Devices</TableHead>
                <TableHead>CVEs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {item.dateLabel}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="whitespace-nowrap">
                      {eventTypeLabels[item.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md text-sm">
                    {item.summary}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.impactedDevices}
                    <span className="text-muted-foreground text-xs">
                      {" "}
                      ({item.impactedPercent}%)
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.relatedCveIds.slice(0, 3).map((cve) => (
                        <Link
                          key={cve}
                          href={`/vulnerabilities/findings?q=${encodeURIComponent(cve)}`}
                          className="text-xs font-mono hover:underline"
                        >
                          {cve}
                        </Link>
                      ))}
                      {item.relatedCveIds.length > 3 ? (
                        <span className="text-muted-foreground text-xs">
                          +{item.relatedCveIds.length - 3}
                        </span>
                      ) : null}
                    </div>
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
