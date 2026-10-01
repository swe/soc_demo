"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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
  softwareCategoryLabels,
  softwareInventory,
} from "./vulnerabilities-data";

export function InventoriesCenter() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return softwareInventory;
    return softwareInventory.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q),
    );
  }, [query]);

  const rows = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const stats: SocStat[] = useMemo(() => {
    const eol = softwareInventory.filter((i) => i.eol).length;
    const outdated = softwareInventory.filter((i) => i.outdated).length;
    const internet = softwareInventory.filter((i) => i.internetFacing).length;
    const weaknesses = softwareInventory.reduce(
      (n, i) => n + i.weaknessCount,
      0,
    );
    return [
      {
        key: "packages",
        title: "Software packages",
        value: String(softwareInventory.length),
        context: "Inventory coverage",
      },
      {
        key: "weaknesses",
        title: "Linked weaknesses",
        value: String(weaknesses),
        context: "Across packages",
      },
      {
        key: "eol",
        title: "EOL / outdated",
        value: String(eol + outdated),
        context: "Needs upgrade path",
      },
      {
        key: "internet",
        title: "Internet-facing",
        value: String(internet),
        context: "Higher blast radius",
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
              placeholder="Search inventory…"
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
                <TableHead>Package</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Weaknesses</TableHead>
                <TableHead className="text-right">Exposed</TableHead>
                <TableHead>Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link
                      href={`/vulnerabilities/findings?q=${encodeURIComponent(item.name)}`}
                      className="font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {item.vendor} · {item.vulnerableVersions}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {softwareCategoryLabels[item.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{item.osPlatform}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.weaknessCount}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.exposedDevices}/{item.totalDevices}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.eol ? (
                        <Badge variant="destructive" className="text-xs">
                          EOL
                        </Badge>
                      ) : null}
                      {item.outdated ? (
                        <Badge variant="outline" className="text-xs">
                          Outdated
                        </Badge>
                      ) : null}
                      {item.internetFacing ? (
                        <Badge variant="secondary" className="text-xs">
                          Internet
                        </Badge>
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
