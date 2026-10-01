"use client";

import { ListPagination } from "@/components/list-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { type AttackSurfaceAsset } from "./attack-surface-data";
import {
  CriticalityBadge,
  EnvironmentBadge,
  ExposureScoreBadge,
} from "./attack-surface-primitives";

export function AttackSurfaceTable({
  items,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onOpen,
}: {
  items: AttackSurfaceAsset[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="bg-card shadow-card overflow-hidden rounded-xl border">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[22%]">Hostname</TableHead>
            <TableHead className="w-[12%]">IP</TableHead>
            <TableHead className="w-[12%]">Ports</TableHead>
            <TableHead className="w-[18%]">Tech</TableHead>
            <TableHead className="w-[10%]">Exposure</TableHead>
            <TableHead className="w-[10%]">Criticality</TableHead>
            <TableHead className="w-[8%]">Env</TableHead>
            <TableHead className="w-[8%] text-right">Correlations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-muted-foreground py-10 text-center text-sm"
              >
                No internet-facing assets match the current filters.
              </TableCell>
            </TableRow>
          ) : (
            items.map((asset) => {
              const corrCount =
                asset.vulnIds.length +
                asset.cspmFindingIds.length +
                asset.darkWebExposureIds.length;
              return (
                <TableRow
                  key={asset.id}
                  className="hover:bg-accent/40 cursor-pointer"
                  onClick={() => onOpen(asset.id)}
                >
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{asset.hostname}</p>
                      <p className="text-muted-foreground font-mono text-xs">
                        {asset.id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {asset.ip}
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">
                    {asset.ports.join(", ")}
                  </TableCell>
                  <TableCell>
                    <p className="text-muted-foreground truncate text-xs">
                      {asset.technologies.slice(0, 2).join(" · ")}
                      {asset.technologies.length > 2
                        ? ` +${asset.technologies.length - 2}`
                        : ""}
                    </p>
                  </TableCell>
                  <TableCell>
                    <ExposureScoreBadge score={asset.exposureScore} />
                  </TableCell>
                  <TableCell>
                    <CriticalityBadge criticality={asset.criticality} />
                  </TableCell>
                  <TableCell>
                    <EnvironmentBadge environment={asset.environment} />
                  </TableCell>
                  <TableCell className="text-right text-xs tabular-nums">
                    {corrCount}
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
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
