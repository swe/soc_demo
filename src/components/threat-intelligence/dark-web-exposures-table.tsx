"use client";

import {
  ArrowDown,
  ArrowUp,
  CircleCheck,
  CircleX,
  Ellipsis,
  ShieldAlert,
} from "lucide-react";

import { ListPagination } from "@/components/list-pagination";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  type DarkWebExposure,
  type ExposureSort,
  type ExposureStatus,
} from "./dark-web-data";
import {
  ExposureTypeBadge,
  RiskScoreBadge,
  SeverityBadge,
} from "./dark-web-primitives";

const COLUMN_COUNT = 8;

export type DarkWebExposuresTableProps = {
  items: DarkWebExposure[];
  total: number;
  page: number;
  pageSize: number;
  sort: ExposureSort;
  selectedIds: Set<string>;
  activeFilterCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sort: ExposureSort) => void;
  onToggleSelectAllPage: () => void;
  onToggleSelect: (id: string) => void;
  onClearSelection: () => void;
  onBulkSetStatus: (status: ExposureStatus) => void;
  onSetStatus: (id: string, status: ExposureStatus) => void;
  onOpen: (id: string) => void;
  onClearFilters: () => void;
};

export function DarkWebExposuresTable({
  items,
  total,
  page,
  pageSize,
  sort,
  selectedIds,
  activeFilterCount,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onToggleSelectAllPage,
  onToggleSelect,
  onClearSelection,
  onBulkSetStatus,
  onSetStatus,
  onOpen,
  onClearFilters,
}: DarkWebExposuresTableProps) {
  const selectedVisibleCount = items.filter((item) =>
    selectedIds.has(item.id),
  ).length;
  const allSelected = items.length > 0 && selectedVisibleCount === items.length;
  const partiallySelected =
    selectedVisibleCount > 0 && selectedVisibleCount < items.length;
  const hasSelection = selectedVisibleCount > 0;

  const toggleRiskSort = () => {
    onSortChange(sort === "risk-desc" ? "risk-asc" : "risk-desc");
  };

  return (
    <div className="bg-card shadow-card overflow-hidden rounded-xl border">
      <Table className="table-fixed">
        <TableHeader>
          {hasSelection ? (
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 px-3 sm:w-12 sm:px-4">
                <Checkbox
                  aria-label="Select all visible exposures"
                  checked={
                    allSelected
                      ? true
                      : partiallySelected
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={onToggleSelectAllPage}
                />
              </TableHead>
              <TableHead colSpan={COLUMN_COUNT - 1}>
                <div className="flex flex-wrap items-center gap-2 py-0.5">
                  <span className="text-foreground text-sm font-medium">
                    {selectedVisibleCount} selected
                  </span>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => onBulkSetStatus("investigating")}
                    >
                      <ShieldAlert className="size-3.5" />
                      Investigate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => onBulkSetStatus("false_positive")}
                    >
                      <CircleX className="size-3.5" />
                      False positive
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-success-text hover:text-success-text h-8"
                      onClick={() => onBulkSetStatus("remediated")}
                    >
                      <CircleCheck className="size-3.5" />
                      Remediated
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={onClearSelection}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </TableHead>
            </TableRow>
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 px-4">
                <Checkbox
                  aria-label="Select all visible exposures"
                  checked={false}
                  onCheckedChange={onToggleSelectAllPage}
                />
              </TableHead>
              <TableHead>Exposure</TableHead>
              <TableHead className="hidden w-[128px] sm:table-cell">
                Type
              </TableHead>
              <TableHead className="hidden w-[100px] md:table-cell">
                Severity
              </TableHead>
              <TableHead className="hidden lg:table-cell">Secret</TableHead>
              <TableHead className="hidden w-[120px] xl:table-cell">
                Source
              </TableHead>
              <TableHead className="hidden w-[88px] sm:table-cell">
                Seen
              </TableHead>
              <TableHead className="w-14 sm:w-[72px]">
                <button
                  type="button"
                  className="hover:text-foreground inline-flex items-center gap-1"
                  onClick={toggleRiskSort}
                >
                  Risk
                  {sort === "risk-desc" ? (
                    <ArrowDown className="size-3.5" />
                  ) : sort === "risk-asc" ? (
                    <ArrowUp className="size-3.5" />
                  ) : null}
                </button>
              </TableHead>
              <TableHead className="w-10 sm:w-12" />
            </TableRow>
          )}
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMN_COUNT}
                className="text-muted-foreground h-32 text-center"
              >
                <div className="flex flex-col items-center gap-2">
                  <p>No exposures match the current filters.</p>
                  {activeFilterCount > 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onClearFilters}
                    >
                      Clear filters
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const selected = selectedIds.has(item.id);
              return (
                <TableRow
                  key={item.id}
                  data-state={selected ? "selected" : undefined}
                  className="cursor-pointer"
                  onClick={() => onOpen(item.id)}
                >
                  <TableCell
                    className="px-3 sm:px-4"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      aria-label={`Select ${item.id}`}
                      checked={selected}
                      onCheckedChange={() => onToggleSelect(item.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0 space-y-1">
                      <p className="line-clamp-2 text-sm font-medium whitespace-normal sm:line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {item.principal ?? item.domain ?? item.id}
                        {item.privileged ? " · privileged" : ""}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-0.5 md:hidden">
                        <SeverityBadge severity={item.severity} />
                        <span className="sm:hidden">
                          <ExposureTypeBadge type={item.type} />
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <ExposureTypeBadge type={item.type} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <SeverityBadge severity={item.severity} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-muted-foreground font-mono text-xs">
                      {item.secretMasked}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden truncate text-sm xl:table-cell">
                    {item.source}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm whitespace-nowrap sm:table-cell">
                    {item.firstSeenLabel}
                  </TableCell>
                  <TableCell>
                    <RiskScoreBadge score={item.riskScore} />
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label="Exposure actions"
                        >
                          <Ellipsis className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onOpen(item.id)}>
                          Open detail
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onSetStatus(item.id, "investigating")}
                        >
                          Mark investigating
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onSetStatus(item.id, "remediated")}
                        >
                          Mark remediated
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onSetStatus(item.id, "false_positive")}
                        >
                          False positive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onSetStatus(item.id, "accepted_risk")}
                        >
                          Accept risk
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
        pageSizeOptions={[25, 50, 100]}
      />
    </div>
  );
}
