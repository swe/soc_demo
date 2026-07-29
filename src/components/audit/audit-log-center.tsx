"use client";

import { useDeferredValue, useMemo, useState, useSyncExternalStore } from "react";
import { Search } from "lucide-react";

import {
  formatAuditTime,
  getAuditLogEntries,
  subscribeAuditLog,
  type AuditLogEntry,
  type AuditTargetType,
} from "@/components/audit/audit-log-data";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const targetTypes: Array<AuditTargetType | "all"> = [
  "all",
  "alert",
  "incident",
  "playbook",
  "export",
  "integration",
  "detection",
  "report",
  "user",
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
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Audit log</h1>
          <p className="text-muted-foreground text-sm">
            Append-only record of triage, export, playbook, and admin actions
            in this demo session. Entries cannot be edited or deleted.
          </p>
        </div>

        <section className="border-border/70 border-b border-dashed pb-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Events",
                value: String(entries.length),
                context: "Session buffer (max 500)",
              },
              {
                title: "Visible",
                value: String(filtered.length),
                context: "After filters",
              },
              {
                title: "Latest",
                value: entries[0] ? formatAuditTime(entries[0].at) : "—",
                context: entries[0]?.action ?? "No events yet",
              },
            ].map((stat, index) => (
              <div
                key={stat.title}
                className={cn(
                  "space-y-1",
                  index > 0 && "sm:border-border/70 sm:border-l sm:pl-6",
                )}
              >
                <p className="text-muted-foreground text-sm">{stat.title}</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm">{stat.context}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup className="max-w-sm">
            <InputGroupAddon>
              <Search className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search actions, actors, targets…"
            />
          </InputGroup>
          <Select
            value={targetFilter}
            onValueChange={(value) =>
              setTargetFilter(value as AuditTargetType | "all")
            }
          >
            <SelectTrigger className="w-[180px]">
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
        </div>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">When</TableHead>
                <TableHead className="w-[160px]">Actor</TableHead>
                <TableHead className="w-[180px]">Action</TableHead>
                <TableHead className="w-[120px]">Target</TableHead>
                <TableHead>Detail</TableHead>
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
                    <TableCell className="text-sm">{entry.actorName}</TableCell>
                    <TableCell>
                      <code className="text-xs">{entry.action}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit text-[10px]">
                          {entry.targetType}
                        </Badge>
                        <span className="font-mono text-xs">
                          {entry.targetId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {entry.detail}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
