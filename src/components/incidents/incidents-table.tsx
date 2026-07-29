"use client";

import {
  ArrowDown,
  ArrowUp,
  Ellipsis,
  HardDrive,
  Shield,
  ShieldAlert,
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
  type IncidentSort,
  getIncidentSlaRemainingLabel,
  getIncidentSlaState,
  getLinkedDevice,
  getLinkedIdentity,
  incidentEntityTypeLabels,
  type SocIncident,
} from "./incidents-data";
import {
  AssigneeCell,
  IncidentStatusBadge,
  mutedControlClassName,
  PriorityBadge,
  SlaBadge,
} from "./incidents-primitives";

const COLUMN_COUNT = 7;

export type IncidentsTableProps = {
  items: SocIncident[];
  total: number;
  page: number;
  pageSize: number;
  sort: IncidentSort;
  selectedIds: Set<string>;
  activeFilterCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sort: IncidentSort) => void;
  onToggleSelectAllPage: () => void;
  onToggleSelect: (id: string) => void;
  onClearSelection: () => void;
  onBulkAssignToMe: () => void;
  onBulkContain: () => void;
  onBulkResolve: () => void;
  onBulkClose: () => void;
  onAssignToMe: (id: string) => void;
  onContain: (id: string) => void;
  onResolve: (id: string) => void;
  onClose: (id: string) => void;
  onClearFilters: () => void;
};

export function IncidentsTable({
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
  onBulkContain,
  onBulkResolve,
  onBulkClose,
  onAssignToMe,
  onContain,
  onResolve,
  onClose,
  onClearFilters,
}: IncidentsTableProps) {
  const router = useRouter();

  const selectedVisibleCount = items.filter((incident) =>
    selectedIds.has(incident.id),
  ).length;
  const allSelected =
    items.length > 0 && selectedVisibleCount === items.length;
  const partiallySelected =
    selectedVisibleCount > 0 && selectedVisibleCount < items.length;
  const hasSelection = selectedVisibleCount > 0;

  const togglePrioritySort = () => {
    onSortChange(
      sort === "severity-desc" ? "severity-asc" : "severity-desc",
    );
  };

  return (
    <div className="bg-card overflow-hidden rounded-lg border">
      <Table className="table-fixed">
        <TableHeader>
          {hasSelection ? (
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 px-4">
                <Checkbox
                  aria-label="Select all visible cases"
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
                      onClick={onBulkContain}
                    >
                      <Shield className="size-3.5" />
                      Contain
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("h-8", mutedControlClassName)}
                      onClick={onBulkResolve}
                    >
                      Resolve
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
                  aria-label="Select all visible cases"
                  checked={false}
                  onCheckedChange={onToggleSelectAllPage}
                />
              </TableHead>
              <TableHead>Case</TableHead>
              <TableHead className="w-[64px]">
                <button
                  type="button"
                  onClick={togglePrioritySort}
                  className="hover:text-foreground inline-flex items-center gap-1"
                >
                  Pri
                  {sort === "severity-desc" ? (
                    <ArrowDown className="size-3.5" />
                  ) : sort === "severity-asc" ? (
                    <ArrowUp className="size-3.5" />
                  ) : null}
                </button>
              </TableHead>
              <TableHead className="w-[18%] hidden lg:table-cell">SLA</TableHead>
              <TableHead className="w-[20%] hidden sm:table-cell">
                Impact
              </TableHead>
              <TableHead className="w-[14%] hidden md:table-cell">
                Responder
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
                  <ShieldAlert className="size-8 opacity-40" />
                  <p className="text-foreground text-sm font-medium">
                    No cases match
                  </p>
                  <p className="text-xs">
                    Adjust filters or clear search to widen the response queue.
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
            items.map((incident) => {
              const isSelected = selectedIds.has(incident.id);
              const slaState = getIncidentSlaState(incident);
              const isHot =
                (incident.priority === "P1" || slaState === "breached") &&
                (incident.status === "new" ||
                  incident.status === "investigating");
              const device = getLinkedDevice(incident.deviceId);
              const identity = getLinkedIdentity(incident.identityId);

              return (
                <TableRow
                  key={incident.id}
                  data-state={isSelected ? "selected" : undefined}
                  className={cn(
                    "cursor-pointer",
                    isHot && !isSelected && "bg-destructive/[0.03]",
                  )}
                  onClick={() => router.push(`/incidents/${incident.id}`)}
                >
                  <TableCell
                    className="px-4 align-top"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(incident.id)}
                      aria-label={`Select ${incident.id}`}
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="min-w-0 space-y-1.5 py-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <IncidentStatusBadge status={incident.status} />
                        <p className="min-w-0 truncate font-medium">
                          {incident.title}
                        </p>
                      </div>
                      <p className="text-muted-foreground truncate text-xs">
                        <span className="font-mono">{incident.id}</span>
                        <span className="mx-1.5">·</span>
                        <span className="tabular-nums">
                          {incident.alertIds.length} linked alert
                          {incident.alertIds.length === 1 ? "" : "s"}
                        </span>
                        <span className="mx-1.5">·</span>
                        <span>
                          {incident.sourceIds.length > 1
                            ? `${incident.sourceIds.length} sources`
                            : incident.primarySourceName}
                        </span>
                        <span className="mx-1.5">·</span>
                        <span className="tabular-nums">{incident.ageLabel}</span>
                      </p>
                      <div className="flex flex-wrap gap-2 lg:hidden">
                        <SlaBadge
                          state={slaState}
                          label={getIncidentSlaRemainingLabel(incident)}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="py-0.5">
                      <PriorityBadge priority={incident.priority} />
                    </div>
                  </TableCell>
                  <TableCell className="hidden align-top lg:table-cell">
                    <div className="py-0.5">
                      <SlaBadge
                        state={slaState}
                        label={getIncidentSlaRemainingLabel(incident)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="hidden align-top sm:table-cell">
                    <div className="min-w-0 space-y-1 py-0.5">
                      <p className="truncate text-sm font-medium">
                        {incident.entityName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {incidentEntityTypeLabels[incident.entityType]}
                        {incident.mitreTechnique
                          ? ` · ${incident.mitreTechnique}`
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
                      <AssigneeCell assigneeId={incident.assigneeId} />
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
                          aria-label="Case actions"
                        >
                          <Ellipsis className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() =>
                            router.push(`/incidents/${incident.id}`)
                          }
                        >
                          Open case
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onAssignToMe(incident.id)}
                        >
                          Take ownership
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => onContain(incident.id)}
                        >
                          Mark contained
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => onResolve(incident.id)}
                        >
                          Resolve
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onClose(incident.id)}>
                          Close case
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
