"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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

import { vulnerabilities } from "./vulnerabilities-data";
import { SeverityBadge } from "./vulnerabilities-primitives";

export function WeaknessesCenter() {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...vulnerabilities].sort(
      (a, b) => b.socPriority - a.socPriority,
    );
    if (!q) return sorted;
    return sorted.filter(
      (item) =>
        item.cve.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.cweIds.some((cwe) => cwe.toLowerCase().includes(q)),
    );
  }, [query]);

  const stats: SocStat[] = useMemo(() => {
    const critical = vulnerabilities.filter(
      (v) => v.severity === "critical",
    ).length;
    const exploitable = vulnerabilities.filter((v) => v.exploitable).length;
    const zeroDay = vulnerabilities.filter((v) => v.zeroDay).length;
    return [
      {
        key: "total",
        title: "Weaknesses",
        value: String(vulnerabilities.length),
        context: "Open findings catalog",
      },
      {
        key: "critical",
        title: "Critical",
        value: String(critical),
        context: "Highest severity",
      },
      {
        key: "exploitable",
        title: "Exploitable",
        value: String(exploitable),
        context: "Public or verified",
      },
      {
        key: "zero-day",
        title: "Zero-day",
        value: String(zeroDay),
        context: "No patch available",
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search CVE, CWE, or title…"
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
                <TableHead>CVE</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">CVSS</TableHead>
                <TableHead className="text-right">Priority</TableHead>
                <TableHead className="text-right">Devices</TableHead>
                <TableHead>CWEs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice(0, 100).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link
                      href={`/vulnerabilities/findings?q=${encodeURIComponent(item.cve)}`}
                      className="font-mono text-sm font-medium hover:underline"
                    >
                      {item.cve}
                    </Link>
                    <p className="text-muted-foreground line-clamp-1 text-xs">
                      {item.title}
                    </p>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={item.severity} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.cvss.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.socPriority}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.exposedDeviceCount}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.cweIds.slice(0, 2).map((cwe) => (
                        <Badge
                          key={cwe}
                          variant="outline"
                          className="font-mono text-xs"
                        >
                          {cwe}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    </ModuleShell>
  );
}
