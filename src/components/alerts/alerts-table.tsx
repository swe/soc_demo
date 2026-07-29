"use client";

import {
  ArrowDown,
  ArrowUp,
  CircleX,
  Ellipsis,
  HardDrive,
  ShieldAlert,
  Siren,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
import { cn } from "@/lib/utils";

import {
  type AlertSort,
  alertEntityTypeLabels,
  alertSourceCategoryLabels,
  getLinkedDevice,
  getLinkedIdentity,
  type SocAlert,
} from "./alerts-data";
import {
  AssigneeCell,
  mutedControlClassName,
  RiskScoreBadge,
  SeverityBadge,
  StatusBadge,
} from "./alerts-primitives";

const COLUMN_COUNT = 6;

export type AlertsTableProps = {
  items: SocAlert[];
  total: number;
  page: number;
  pageSize: number;
  sort: AlertSort;
  selectedIds: Set<string>;
  activeFilterCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sort: AlertSort) => void;
  onToggleSelectAllPage: () => void;
  onToggleSelect: (id: string) => void;
  onClearSelection: () => void;
  onBulkAssignToMe: () => void;
  onBulkEscalate: () => void;
  onBulkClose: () => void;
  onBulkFalsePositive: () => void;
  onAssignToMe: (id: string) => void;
  onEscalate: (id: string) => void;
  onMarkFalsePositive: (id: string) => void;
  onClose: (id: string) => void;
  onClearFilters: () => void;
};

export function AlertsTable({
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
  onBulkAssignToMe,
  onBulkEscalate,
  onBulkClose,
  onBulkFalsePositive,
  onAssignToMe,
  onEscalate,
  onMarkFalsePositive,
  onClose,
  onClearFilters,
}: AlertsTableProps) {
  const router = useRouter();

  const selectedVisibleCount = items.filter((alert) =>
    selectedIds.has(alert.id),
  ).length;
  const allSelected =
    items.length > 0 && selectedVisibleCount === items.length;
  const partiallySelected =
    selectedVisibleCount > 0 && selectedVisibleCount < items.length;
  const hasSelection = selectedVisibleCount > 0;

  const toggleRiskSort = () => {
    onSortChange(sort === "risk-desc" ? "risk-asc" : "risk-desc");
  };

  return (
    <div className="bg-card overflow-hidden rounded-lg border">
      <Table className="table-fixed">
        <TableHeader>
          {hasSelection ? (
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 px-4">
                <Checkbox
                  aria-label="Select all visible alerts"
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
                      className={cn("h-8", mutedControlClassName)}
                      onClick={onBulkAssignToMe}
                    >
                      <UserRound className="size-3.5" />
                      Assign to me
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("h-8", mutedControlClassName)}
                      onClick={onBulkEscalate}
                    >
                      <ShieldAlert className="size-3.5" />
                      Escalate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("h-8", mutedControlClassName)}
                      onClick={onBulkFalsePositive}
                    >
                      <CircleX className="size-3.5" />
                      False positive
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive h-8"
                      onClick={onBulkClose}
                    >
                      Close
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
                  aria-label="Select all visible alerts"
                  checked={false}
                  onCheckedChange={onToggleSelectAllPage}
                />
              </TableHead>
              <TableHead>Alert</TableHead>
              <TableHead className="w-[72px]">
                <button
                  type="button"
                  onClick={toggleRiskSort}
                  className="hover:text-foreground inline-flex items-center gap-1"
                >
                  Risk
                  {sort === "risk-desc" ? (
                    <ArrowDown className="size-3.5" />
                  ) : sort === "risk-asc" ? (
                    <ArrowUp className="size-3.5" />
                  ) : null}
                </button>
              </TableHead>
              <TableHead className="w-[26%] hidden sm:table-cell">
                Entity
              </TableHead>
              <TableHead className="w-[16%] hidden md:table-cell">
                Owner
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          )}
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={COLUMN_COUNT} className="h-40">
                <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 text-center">
                  <Siren className="size-8 opacity-40" />
                  <p className="text-foreground text-sm font-medium">
                    No alerts match
                  </p>
                  <p className="text-xs">
                    Adjust filters or clear search to widen the catalog.
                  </p>
                  {activeFilterCount > 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={onClearFilters}
                    >
                      Clear filters
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((alert) => {
              const isSelected = selectedIds.has(alert.id);
              const isCriticalOpen =
                (alert.severity === "critical" ||
                  alert.severity === "high") &&
                (alert.status === "new" || alert.status === "triaging");
              const device = getLinkedDevice(alert.deviceId);
              const identity = getLinkedIdentity(alert.identityId);

              return (
                <TableRow
                  key={alert.id}
                  data-state={isSelected ? "selected" : undefined}
                  className={cn(
                    "cursor-pointer",
                    isCriticalOpen && !isSelected && "bg-destructive/[0.03]",
                  )}
                  onClick={() => router.push(`/alerts/${alert.id}`)}
                >
                  <TableCell
                    className="px-4 align-top"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(alert.id)}
                      aria-label={`Select ${alert.id}`}
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="min-w-0 space-y-1.5 py-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={alert.severity} />
                        <StatusBadge status={alert.status} />
                        <p className="min-w-0 truncate font-medium">
                          {alert.title}
                        </p>
                      </div>
                      <p className="text-muted-foreground truncate text-xs">
                        <span className="font-mono">{alert.id}</span>
                        <span className="mx-1.5">·</span>
                        <span className="truncate">{alert.ruleName}</span>
                        <span className="mx-1.5">·</span>
                        <span>
                          {alertSourceCategoryLabels[alert.sourceCategory]}
                        </span>
                        <span className="mx-1.5">·</span>
                        <span>{alert.sourceName}</span>
                        <span className="mx-1.5">·</span>
                        <span className="tabular-nums">{alert.ageLabel}</span>
                        <span className="text-muted-foreground/80 mx-1.5">
                          ·
                        </span>
                        <span className="tabular-nums">
                          conf {alert.confidence}%
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:hidden">
                        <span className="text-muted-foreground truncate">
                          {alertEntityTypeLabels[alert.entityType]} ·{" "}
                          {alert.entityName}
                        </span>
                        {device ? (
                          <Link
                            href={`/assets/devices?id=${device.id}`}
                            className="text-foreground hover:underline"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {device.hostname}
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="py-0.5">
                      <RiskScoreBadge score={alert.riskScore} />
                    </div>
                  </TableCell>
                  <TableCell className="hidden align-top sm:table-cell">
                    <div className="min-w-0 space-y-1 py-0.5">
                      <p className="truncate text-sm font-medium">
                        {alert.entityName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {alertEntityTypeLabels[alert.entityType]}
                        {alert.mitreTechnique
                          ? ` · ${alert.mitreTechnique}`
                          : ""}
                      </p>
                      <div className="flex flex-col gap-0.5 text-xs">
                        {device ? (
                          <Link
                            href={`/assets/devices?id=${device.id}`}
                            className="text-foreground hover:underline inline-flex min-w-0 items-center gap-1"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <HardDrive className="size-3 shrink-0" />
                            <span className="truncate">{device.hostname}</span>
                          </Link>
                        ) : null}
                        {identity ? (
                          <Link
                            href={`/assets/identities?id=${identity.id}`}
                            className="text-foreground hover:underline inline-flex min-w-0 items-center gap-1"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <UserRound className="size-3 shrink-0" />
                            <span className="truncate">
                              {identity.displayName}
                            </span>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden align-top md:table-cell">
                    <div className="min-w-0 py-0.5">
                      <AssigneeCell assigneeId={alert.assigneeId} />
                    </div>
                  </TableCell>
                  <TableCell
                    className="align-top"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label="Alert actions"
                        >
                          <Ellipsis className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => router.push(`/alerts/${alert.id}`)}
                        >
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onAssignToMe(alert.id)}
                        >
                          Assign to me
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => onEscalate(alert.id)}
                        >
                          Escalate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onMarkFalsePositive(alert.id)}
                        >
                          Mark false positive
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onClose(alert.id)}>
                          Close
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
