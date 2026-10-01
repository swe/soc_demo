"use client";

import { AlertTriangle, Play, Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

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
import { auditFromReceipt } from "@/lib/mock-api/audit";
import { makeReceipt } from "@/lib/mock-api/types";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

type BasSchedule = "manual" | "hourly" | "daily" | "weekly";

type BasRun = {
  id: string;
  name: string;
  techniqueIds: string[];
  detectionsValidated: number;
  detectionsTotal: number;
  driftScore: number;
  /** Oldest → newest drift samples for sparkline. */
  driftHistory: number[];
  schedule: BasSchedule;
  status: "passed" | "partial" | "failed" | "running";
  lastRunLabel: string;
};

const DRIFT_THRESHOLD = 20;
const BAS_CATALOG_SIZE = 36;

const basRunsSeedCore: BasRun[] = [
  {
    id: "bas-001",
    name: "Atomic Red Team · PowerShell",
    techniqueIds: ["T1059.001", "T1059.003"],
    detectionsValidated: 6,
    detectionsTotal: 7,
    driftScore: 8,
    driftHistory: [6, 7, 5, 9, 8, 7, 8],
    schedule: "daily",
    status: "passed",
    lastRunLabel: "2h ago",
  },
  {
    id: "bas-002",
    name: "Credential dump simulation",
    techniqueIds: ["T1003.001", "T1555"],
    detectionsValidated: 3,
    detectionsTotal: 5,
    driftScore: 22,
    driftHistory: [12, 14, 16, 18, 19, 21, 22],
    schedule: "daily",
    status: "partial",
    lastRunLabel: "6h ago",
  },
  {
    id: "bas-003",
    name: "C2 beaconing BAS",
    techniqueIds: ["T1071.001", "T1573"],
    detectionsValidated: 4,
    detectionsTotal: 4,
    driftScore: 4,
    driftHistory: [3, 5, 4, 4, 6, 3, 4],
    schedule: "hourly",
    status: "passed",
    lastRunLabel: "1d ago",
  },
  {
    id: "bas-004",
    name: "Ransomware precursor chain",
    techniqueIds: ["T1490", "T1486"],
    detectionsValidated: 1,
    detectionsTotal: 4,
    driftScore: 41,
    driftHistory: [22, 28, 31, 35, 38, 40, 41],
    schedule: "weekly",
    status: "failed",
    lastRunLabel: "2d ago",
  },
  {
    id: "bas-005",
    name: "Impossible travel + MFA fatigue",
    techniqueIds: ["T1078", "T1621"],
    detectionsValidated: 5,
    detectionsTotal: 6,
    driftScore: 12,
    driftHistory: [10, 11, 9, 13, 14, 11, 12],
    schedule: "daily",
    status: "partial",
    lastRunLabel: "3d ago",
  },
];

const basCampaignExtras: Array<{
  name: string;
  techniqueIds: string[];
}> = [
  {
    name: "Atomic Red Team · WMI lateral",
    techniqueIds: ["T1047", "T1021.002"],
  },
  {
    name: "Atomic Red Team · Scheduled task persistence",
    techniqueIds: ["T1053.005", "T1036"],
  },
  {
    name: "Atomic Red Team · Regsvr32 / LOLBAS",
    techniqueIds: ["T1218.010", "T1218.011"],
  },
  {
    name: "Atomic Red Team · Kerberoasting",
    techniqueIds: ["T1558.003", "T1558"],
  },
  {
    name: "Atomic Red Team · DCSync probe",
    techniqueIds: ["T1003.006", "T1482"],
  },
  {
    name: "Atomic Red Team · Cloud credential harvest",
    techniqueIds: ["T1552.005", "T1528"],
  },
  {
    name: "Caldera · Discovery sweep",
    techniqueIds: ["T1082", "T1083", "T1016"],
  },
  {
    name: "Caldera · Lateral SMB / PsExec",
    techniqueIds: ["T1021.002", "T1570"],
  },
  {
    name: "Caldera · Defense evasion · timestomp",
    techniqueIds: ["T1070.006", "T1070"],
  },
  {
    name: "Caldera · Collection · clipboard",
    techniqueIds: ["T1115", "T1005"],
  },
  {
    name: "Caldera · Exfil over HTTPS",
    techniqueIds: ["T1041", "T1567.002"],
  },
  {
    name: "Caldera · Impact · shadow copy wipe",
    techniqueIds: ["T1490", "T1485"],
  },
  {
    name: "Custom · Phishing kit token replay",
    techniqueIds: ["T1550.001", "T1078.004"],
  },
  {
    name: "Custom · SaaS OAuth consent phishing",
    techniqueIds: ["T1528", "T1566.002"],
  },
  {
    name: "Custom · Container escape probe",
    techniqueIds: ["T1611", "T1610"],
  },
  {
    name: "Custom · CI runner supply-chain",
    techniqueIds: ["T1195.002", "T1059"],
  },
  {
    name: "Custom · DNS tunneling BAS",
    techniqueIds: ["T1071.004", "T1572"],
  },
  {
    name: "Custom · Living-off-land · certutil",
    techniqueIds: ["T1105", "T1140"],
  },
  {
    name: "Atomic Red Team · LSASS access",
    techniqueIds: ["T1003.001", "T1055"],
  },
  {
    name: "Atomic Red Team · Browser credential store",
    techniqueIds: ["T1555.003", "T1539"],
  },
  {
    name: "Caldera · Privilege escalation · UAC",
    techniqueIds: ["T1548.002", "T1134"],
  },
  {
    name: "Caldera · Persistence · Run keys",
    techniqueIds: ["T1547.001", "T1543.003"],
  },
  {
    name: "Custom · Impossible travel replay",
    techniqueIds: ["T1078", "T1021"],
  },
  {
    name: "Custom · MFA push bombing",
    techniqueIds: ["T1621", "T1110"],
  },
  {
    name: "Atomic Red Team · Cobalt beacon pattern",
    techniqueIds: ["T1071.001", "T1095"],
  },
  {
    name: "Caldera · Ransomware encrypt stage",
    techniqueIds: ["T1486", "T1489"],
  },
  {
    name: "Custom · Shadow IT OAuth grant",
    techniqueIds: ["T1528", "T1078.004"],
  },
  {
    name: "Atomic Red Team · MacOS osascript",
    techniqueIds: ["T1059.002", "T1543.001"],
  },
  {
    name: "Caldera · Linux cron persistence",
    techniqueIds: ["T1053.003", "T1037"],
  },
  {
    name: "Custom · CloudTrail privilege attach",
    techniqueIds: ["T1098", "T1078.004"],
  },
  {
    name: "Atomic Red Team · Impacket secretsdump",
    techniqueIds: ["T1003.006", "T1550.002"],
  },
];

const scheduleCycle: BasSchedule[] = ["daily", "hourly", "weekly", "manual", "daily"];
const lastRunCycle = [
  "1h ago",
  "3h ago",
  "5h ago",
  "8h ago",
  "12h ago",
  "1d ago",
  "2d ago",
  "3d ago",
  "4d ago",
  "5d ago",
] as const;

function statusFromDrift(drift: number): BasRun["status"] {
  if (drift > 30) return "failed";
  if (drift > 15) return "partial";
  return "passed";
}

function buildDriftHistory(seed: number, final: number): number[] {
  const history: number[] = [];
  let value = Math.max(0, final - 8 + (seed % 5));
  for (let i = 0; i < 6; i += 1) {
    value = Math.max(0, Math.min(80, value + ((seed + i * 3) % 7) - 3));
    history.push(value);
  }
  history.push(final);
  return history;
}

function expandBasRuns(seeds: BasRun[], size = BAS_CATALOG_SIZE): BasRun[] {
  if (seeds.length >= size) return seeds.slice(0, size);
  const generated: BasRun[] = [];
  for (let index = 0; index < size - seeds.length; index += 1) {
    const extra = basCampaignExtras[index % basCampaignExtras.length]!;
    const n = seeds.length + index + 1;
    const driftScore = 3 + ((index * 11) % 45);
    const detectionsTotal = 3 + (index % 6);
    const detectionsValidated = Math.max(
      0,
      detectionsTotal - (driftScore > 20 ? 1 + (index % 3) : index % 2),
    );
    generated.push({
      id: `bas-${String(n).padStart(3, "0")}`,
      name: extra.name,
      techniqueIds: extra.techniqueIds,
      detectionsValidated,
      detectionsTotal,
      driftScore,
      driftHistory: buildDriftHistory(index + 7, driftScore),
      schedule: scheduleCycle[index % scheduleCycle.length]!,
      status: statusFromDrift(driftScore),
      lastRunLabel: lastRunCycle[index % lastRunCycle.length]!,
    });
  }
  return [...seeds, ...generated];
}

const basRunsSeed: BasRun[] = expandBasRuns(basRunsSeedCore);

const statusTone: Record<BasRun["status"], string> = {
  passed:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  partial:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  failed: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
  running: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};

function DriftSpark({ values, alert }: { values: number[]; alert: boolean }) {
  const max = Math.max(...values, DRIFT_THRESHOLD, 1);
  return (
    <div
      className="flex h-7 w-[72px] items-end gap-px"
      aria-hidden="true"
      title={values.join(" → ")}
    >
      {values.map((v, i) => (
        <span
          key={i}
          className={cn(
            "w-1.5 rounded-sm",
            v > DRIFT_THRESHOLD
              ? "bg-destructive/80"
              : alert && i === values.length - 1
                ? "bg-amber-500/80"
                : "bg-foreground/25",
          )}
          style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function nextDriftScore(current: number): number {
  // Mock continuous loop: slight random walk biased toward recovery after re-run.
  const delta = Math.round((Math.random() - 0.55) * 10);
  return Math.max(0, Math.min(80, current + delta));
}

export function PurpleTeamCenter() {
  const [runs, setRuns] = useState(basRunsSeed);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return runs;
    return runs.filter((run) =>
      [run.id, run.name, run.status, run.schedule, ...run.techniqueIds]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [runs, deferredQuery]);

  const paged = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const stats: SocStat[] = useMemo(() => {
    const avgDrift =
      runs.reduce((sum, r) => sum + r.driftScore, 0) / Math.max(1, runs.length);
    const validated = runs.reduce((sum, r) => sum + r.detectionsValidated, 0);
    const total = runs.reduce((sum, r) => sum + r.detectionsTotal, 0);
    const overThreshold = runs.filter(
      (r) => r.driftScore > DRIFT_THRESHOLD,
    ).length;
    return [
      {
        key: "campaigns",
        title: "BAS campaigns",
        value: String(runs.length),
        context: "Purple team runs",
      },
      {
        key: "validated",
        title: "Detections validated",
        value: `${validated}/${total}`,
        context: "Across campaigns",
      },
      {
        key: "drift",
        title: "Avg drift score",
        value: avgDrift.toFixed(0),
        context: `Threshold ${DRIFT_THRESHOLD}`,
      },
      {
        key: "alerts",
        title: "Drift alerts",
        value: String(overThreshold),
        context: `> ${DRIFT_THRESHOLD} score`,
      },
    ];
  }, [runs]);

  const driftAlerts = useMemo(
    () => runs.filter((r) => r.driftScore > DRIFT_THRESHOLD),
    [runs],
  );

  const setSchedule = (id: string, schedule: BasSchedule) => {
    setRuns((current) =>
      current.map((run) => (run.id === id ? { ...run, schedule } : run)),
    );
    const receipt = makeReceipt({
      outcome: "simulated",
      message: `BAS schedule → ${schedule}`,
      targetType: "detection",
      targetId: id,
      detail: `schedule=${schedule}`,
    });
    auditFromReceipt(receipt, "purple_team.schedule", "detection");
    toast({
      title: "Schedule updated",
      description: `${id} · ${schedule} · ${receipt.id}`,
    });
  };

  const rerun = (id: string) => {
    setRuns((current) =>
      current.map((run) =>
        run.id === id
          ? { ...run, status: "running", lastRunLabel: "just now" }
          : run,
      ),
    );
    window.setTimeout(() => {
      setRuns((current) => {
        const next = current.map((run) => {
          if (run.id !== id) return run;
          const driftScore = nextDriftScore(run.driftScore);
          const driftHistory = [...run.driftHistory.slice(-6), driftScore];
          const detectionsValidated = Math.min(
            run.detectionsTotal,
            Math.max(
              0,
              run.detectionsValidated + (driftScore < run.driftScore ? 1 : 0),
            ),
          );
          return {
            ...run,
            driftScore,
            driftHistory,
            detectionsValidated,
            status: statusFromDrift(driftScore),
            lastRunLabel: "just now",
          };
        });
        const updated = next.find((r) => r.id === id);
        if (updated) {
          const receipt = makeReceipt({
            outcome: "ok",
            message: `BAS campaign ${id} completed · drift ${updated.driftScore}`,
            targetType: "detection",
            targetId: id,
            detail: `drift=${updated.driftScore}; threshold=${DRIFT_THRESHOLD}`,
          });
          auditFromReceipt(receipt, "purple_team.campaign_rerun", "detection");
          const over = updated.driftScore > DRIFT_THRESHOLD;
          toast({
            title: over ? "Drift alert after re-run" : "BAS campaign completed",
            description: over
              ? `${updated.name} drift ${updated.driftScore} exceeds ${DRIFT_THRESHOLD} · ${receipt.id}`
              : `${updated.name} · drift ${updated.driftScore} · ${receipt.id}`,
            variant: over ? "destructive" : undefined,
          });
        }
        return next;
      });
    }, 900);
  };

  return (
    <ModuleShell
      toolbar={
        <ModuleToolbarSearch>
          <InputGroup className="h-9 w-full lg:max-w-sm">
            <InputGroupAddon>
              <Search className="text-muted-foreground size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search campaigns, techniques…"
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

      {driftAlerts.length > 0 ? (
        <div className="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-lg border px-3 py-2.5">
          <AlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium">
              Drift threshold exceeded ({DRIFT_THRESHOLD})
            </p>
            <p className="text-muted-foreground text-xs">
              {driftAlerts
                .slice(0, 6)
                .map((r) => `${r.name} (${r.driftScore})`)
                .join(" · ")}
              {driftAlerts.length > 6
                ? ` · +${driftAlerts.length - 6} more`
                : ""}
            </p>
          </div>
        </div>
      ) : null}

      <div className="bg-card overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Techniques</TableHead>
              <TableHead>Detections</TableHead>
              <TableHead>Drift trend</TableHead>
              <TableHead className="text-right">Drift</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-muted-foreground py-10 text-center"
                >
                  No campaigns match the current search.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((run) => {
                const over = run.driftScore > DRIFT_THRESHOLD;
                return (
                  <TableRow key={run.id}>
                    <TableCell>
                      <p className="font-medium">{run.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {run.id} · {run.lastRunLabel}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={run.schedule}
                        onValueChange={(value) =>
                          setSchedule(run.id, value as BasSchedule)
                        }
                      >
                        <SelectTrigger className="h-8 w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {run.techniqueIds.map((tech) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="font-mono text-[10px]"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {run.detectionsValidated}/{run.detectionsTotal}
                    </TableCell>
                    <TableCell>
                      <DriftSpark values={run.driftHistory} alert={over} />
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "tabular-nums font-medium",
                          over && "text-destructive",
                        )}
                      >
                        {run.driftScore}
                      </span>
                      {over ? (
                        <Badge
                          variant="outline"
                          className="border-destructive/40 text-destructive ml-2"
                        >
                          alert
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusTone[run.status])}
                      >
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        disabled={run.status === "running"}
                        onClick={() => rerun(run.id)}
                      >
                        <Play className="size-3.5" />
                        Re-run
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <ListPagination
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPage(1);
            setPageSize(size);
          }}
        />
      </div>
    </ModuleShell>
  );
}
