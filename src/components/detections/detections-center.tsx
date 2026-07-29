"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { Crosshair, Search } from "lucide-react";

import {
  detectionStatusLabels,
  type DetectionRule,
  type DetectionStatus,
} from "@/components/detections/detections-data";
import { useDetectionsSession } from "@/components/detections/detections-session";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

function SeverityBadge({ severity }: { severity: DetectionRule["severity"] }) {
  const tones: Record<DetectionRule["severity"], string> = {
    critical: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
    high: "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    medium:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    low: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  };
  return (
    <Badge variant="outline" className={cn("capitalize", tones[severity])}>
      {severity}
    </Badge>
  );
}

export function DetectionsCenter() {
  const { rules, stats, setStatus } = useDetectionsSession();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DetectionStatus | "all">(
    "all",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return rules.filter((rule) => {
      if (statusFilter !== "all" && rule.status !== statusFilter) return false;
      if (!q) return true;
      return [
        rule.id,
        rule.name,
        rule.mitreTactic,
        rule.mitreTechnique,
        rule.ownerName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [deferredSearch, statusFilter, rules]);

  const selected = selectedId
    ? (rules.find((rule) => rule.id === selectedId) ?? null)
    : null;

  const toggleStatus = (status: DetectionStatus) => {
    if (!selected) return;
    const updated = setStatus(selected.id, status);
    if (updated) {
      toast({
        title: "Detection updated",
        description: `${updated.id} is now ${detectionStatusLabels[status]}.`,
      });
    }
  };

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="border-b px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Detections</h1>
            <p className="text-muted-foreground text-sm">
              Detection catalog derived from the live alert rule set, with MITRE
              mapping and playbook linkage.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            {(
              [
                { label: "Rules", value: String(stats.total) },
                { label: "Enabled", value: String(stats.enabled) },
                { label: "Experimental", value: String(stats.experimental) },
                {
                  label: "Critical covered",
                  value: String(stats.criticalCoverage),
                },
              ] as const
            ).map((stat) => (
              <div key={stat.label}>
                <p className="text-muted-foreground text-xs">{stat.label}</p>
                <p className="font-semibold tabular-nums">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2 sm:px-6">
        <InputGroup className="h-9 max-w-sm">
          <InputGroupAddon>
            <Search className="size-3.5" />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search detections…"
          />
        </InputGroup>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as DetectionStatus | "all")
          }
        >
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="experimental">Experimental</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="px-4 py-3 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Detection</TableHead>
                <TableHead>MITRE</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Alerts</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground py-10 text-center"
                  >
                    No detections match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((rule) => (
                  <TableRow
                    key={rule.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(rule.id)}
                  >
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-mono text-xs text-muted-foreground">
                          {rule.id}
                        </p>
                        <p className="max-w-md truncate text-sm font-medium">
                          {rule.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px]"
                        >
                          {rule.mitreTechnique}
                        </Badge>
                        <p className="text-muted-foreground text-xs">
                          {rule.mitreTactic}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={rule.severity} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {detectionStatusLabels[rule.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {rule.alertCount}
                    </TableCell>
                    <TableCell className="text-sm">{rule.ownerName}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="pr-8">{selected.name}</SheetTitle>
                <SheetDescription className="font-mono">
                  {selected.id}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5 px-1">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {selected.summary}
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Technique</p>
                    <p className="font-mono">{selected.mitreTechnique}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Tactic</p>
                    <p>{selected.mitreTactic}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Owner</p>
                    <p>{selected.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Playbook</p>
                    <p>{selected.playbookCode ?? "None linked"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(["enabled", "experimental", "disabled"] as const).map(
                      (status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={
                            selected.status === status ? "default" : "outline"
                          }
                          onClick={() => toggleStatus(status)}
                        >
                          {detectionStatusLabels[status]}
                        </Button>
                      ),
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Recent linked alerts</p>
                  <ul className="space-y-1">
                    {selected.linkedAlertIds.map((id) => (
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
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <Link href="/threat-hunting/analytics">
                      <Crosshair className="size-3.5" />
                      Open in hunting
                    </Link>
                  </Button>
                  {selected.playbookCode ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/knowledge-base/procedures">
                        View playbook
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </main>
  );
}
