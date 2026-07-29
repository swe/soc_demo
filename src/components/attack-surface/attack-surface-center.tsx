"use client";

import { Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { paginateItems } from "@/components/list-pagination";
import {
  ModuleShell,
  ModuleToolbarActions,
  ModuleToolbarSearch,
} from "@/components/soc/module-shell";
import { type SocStat, StatsStrip } from "@/components/soc/stats-strip";
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
import { Switch } from "@/components/ui/switch";

import {
  type AssetCriticality,
  attackSurfaceAssets,
  getAttackSurfaceStats,
} from "./attack-surface-data";
import { AttackSurfaceDetailSheet } from "./attack-surface-detail-sheet";
import { AttackSurfaceTable } from "./attack-surface-table";

function AttackSurfaceStatsStrip({
  assets,
}: {
  assets: typeof attackSurfaceAssets;
}) {
  const stats: SocStat[] = getAttackSurfaceStats(assets).map((stat) => ({
    key: stat.key,
    title: stat.title,
    value: stat.value,
    context: stat.context,
    delta: stat.delta,
    preferLower: stat.preferLower,
  }));
  return <StatsStrip stats={stats} />;
}

export function AttackSurfaceCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [criticality, setCriticality] = useState<AssetCriticality | "all">(
    "all",
  );
  const [highExposureOnly, setHighExposureOnly] = useState(false);
  const [darkWebOnly, setDarkWebOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const deferredSearch = useDeferredValue(searchQuery);

  const filtered = useMemo(() => {
    const needle = deferredSearch.trim().toLowerCase();
    return attackSurfaceAssets
      .filter((asset) => {
        if (criticality !== "all" && asset.criticality !== criticality) {
          return false;
        }
        if (highExposureOnly && asset.exposureScore < 70) return false;
        if (darkWebOnly && asset.darkWebExposureIds.length === 0) return false;
        if (!needle) return true;
        const haystack = [
          asset.hostname,
          asset.ip,
          asset.owner,
          asset.technologies.join(" "),
          asset.tags.join(" "),
          asset.id,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      })
      .sort((a, b) => b.exposureScore - a.exposureScore);
  }, [criticality, darkWebOnly, deferredSearch, highExposureOnly]);

  const pageItems = useMemo(
    () => paginateItems(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const selected =
    attackSurfaceAssets.find((a) => a.id === selectedId) ?? null;

  return (
    <>
      <ModuleShell
        toolbar={
          <>
            <ModuleToolbarSearch>
              <InputGroup className="h-9 w-full lg:max-w-sm">
                <InputGroupAddon>
                  <Search className="size-3.5" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search hostname, IP, tech…"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(1);
                  }}
                />
              </InputGroup>
            </ModuleToolbarSearch>
            <ModuleToolbarActions>
              <Select
                value={criticality}
                onValueChange={(value) => {
                  setCriticality(value as AssetCriticality | "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[150px]">
                  <SelectValue placeholder="Criticality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All criticality</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <label className="border-border/70 flex h-9 items-center gap-2 rounded-md border px-2.5 text-xs">
                <Switch
                  checked={highExposureOnly}
                  onCheckedChange={(checked) => {
                    setHighExposureOnly(checked);
                    setPage(1);
                  }}
                />
                Score ≥ 70
              </label>

              <label className="border-border/70 flex h-9 items-center gap-2 rounded-md border px-2.5 text-xs">
                <Switch
                  checked={darkWebOnly}
                  onCheckedChange={(checked) => {
                    setDarkWebOnly(checked);
                    setPage(1);
                  }}
                />
                Dark-web linked
              </label>
            </ModuleToolbarActions>
          </>
        }
      >
        <AttackSurfaceStatsStrip assets={filtered} />

        <AttackSurfaceTable
          items={pageItems}
          total={filtered.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          onOpen={setSelectedId}
        />
      </ModuleShell>

      <AttackSurfaceDetailSheet
        asset={selected}
        open={Boolean(selected)}
        onOpenChange={(next) => {
          if (!next) setSelectedId(null);
        }}
      />
    </>
  );
}
