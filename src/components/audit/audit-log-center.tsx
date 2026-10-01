"use client";

import { Search } from "lucide-react";
import {
  useDeferredValue,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import {
  type AuditLogEntry,
  type AuditTargetType,
  formatAuditTime,
  getAuditLogEntries,
  subscribeAuditLog,
} from "@/components/audit/audit-log-data";
import {
  ModuleShell,
  ModuleToolbarActions,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const targetTypes: Array<AuditTargetType | "all"> = [
  "all",
  "alert",
  "incident",
  "playbook",
  "export",
  "integration",
  "detection",
  "report",
  "cloud_finding",
  "training",
  "compliance",
];

function useAuditEntries() {
  return useSyncExternalStore(
    subscribeAuditLog,
    getAuditLogEntries,
    getAuditLogEntries,
  );
}

export function AuditLogCenter() {
  const entries = useAuditEntries();
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState<AuditTargetType | "all">(
    "all",
  );
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return entries.filter((entry) => {
      if (targetFilter !== "all" && entry.targetType !== targetFilter) {
        return false;
      }
      if (!q) return true;
      return [
        entry.action,
        entry.actorName,
        entry.targetId,
        entry.detail,
        entry.targetType,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [entries, deferredSearch, targetFilter]);

  return (
    <ModuleShell
      toolbar={
        <>
          <ModuleToolbarSearch>
            <InputGroup className="h-9 w-full lg:max-w-sm">
              <InputGroupAddon>
                <Search className="size-3.5" />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search actions, actors, targets…"
              />
            </InputGroup>
          </ModuleToolbarSearch>
          <ModuleToolbarActions>
            <Select
              value={targetFilter}
              onValueChange={(value) =>
                setTargetFilter(value as AuditTargetType | "all")
              }
            >
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Target type" />
              </SelectTrigger>
              <SelectContent>
                {targetTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "all" ? "All targets" : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ModuleToolbarActions>
        </>
      }
    >
      <StatsStrip
        stats={
          [
            {
              key: "events",
              title: "Events",
              value: String(entries.length),
              context: "Session buffer (max 500)",
            },
            {
              key: "visible",
              title: "Visible",
              value: String(filtered.length),
              context: "After filters",
            },
            {
              key: "latest",
              title: "Latest",
              value: entries[0] ? formatAuditTime(entries[0].at) : "—",
              context: entries[0]?.action ?? "No events yet",
            },
          ] satisfies SocStat[]
        }
      />

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">When</TableHead>
              <TableHead className="hidden sm:table-cell w-[160px]">
                Actor
              </TableHead>
              <TableHead className="w-[180px]">Action</TableHead>
              <TableHead className="hidden md:table-cell w-[120px]">
                Target
              </TableHead>
              <TableHead className="hidden lg:table-cell">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  No audit events match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((entry: AuditLogEntry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                    {formatAuditTime(entry.at)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    {entry.actorName}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{entry.action}</code>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="w-fit text-xs">
                        {entry.targetType}
                      </Badge>
                      <span className="font-mono text-xs">
                        {entry.targetId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                    {entry.detail}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </ModuleShell>
  );
}
