"use client";

import {
  Activity,
  AlertTriangle,
  ArrowDownAZ,
  ArrowUpAZ,
  Check,
  CheckCircle2,
  CircleDashed,
  CirclePause,
  Clock3,
  Ellipsis,
  Filter,
  Link2,
  ListFilter,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldAlert,
  Unplug,
  Waves,
  XCircle,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Area, AreaChart } from "recharts";

import { ConnectIntegrationDialog } from "@/components/administration/connect-integration-dialog";
import { IntegrationsOverview } from "@/components/administration/integrations-overview";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ListPagination, paginateItems } from "@/components/list-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  getIntegrationActivity,
  getIntegrationStats,
  type Integration,
  type IntegrationCategory,
  integrationCategoryLabels,
  integrations as initialIntegrations,
  type IntegrationStatus,
  isIntegrationIssue,
  vendorMeta,
} from "./integrations-data";

type IntegrationTab =
  | "overview"
  | "all"
  | "connected"
  | "available"
  | "attention";
type IntegrationSort = "name-asc" | "name-desc" | "events-desc" | "sync";

const sparklineConfig = {
  volume: { label: "Events", color: "var(--primary)" },
} satisfies ChartConfig;

const mutedControlClassName =
  "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground";

const tabTriggerClassName =
  "data-[state=active]:border-foreground shrink-0 gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:pb-4";

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const categories = Object.keys(
  integrationCategoryLabels,
) as IntegrationCategory[];

const statusFilterOptions: {
  value: IntegrationStatus;
  label: string;
}[] = [
  { value: "connected", label: "Connected" },
  { value: "pending", label: "Pending" },
  { value: "error", label: "Error" },
  { value: "paused", label: "Paused" },
  { value: "available", label: "Available" },
];

const sortLabels: Record<IntegrationSort, string> = {
  "name-asc": "Name A–Z",
  "name-desc": "Name Z–A",
  "events-desc": "Events · high to low",
  sync: "Last sync",
};

function VendorLogo({
  integration,
  className,
}: {
  integration: Integration;
  className?: string;
}) {
  const meta = vendorMeta[integration.vendorKey];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-md border",
        meta.background,
        className,
      )}
      title={`${integration.vendor} logo`}
    >
      <Icon
        className={cn(
          "size-4",
          integration.vendorKey === "aws" && "dark:text-[#FF9900]",
          integration.vendorKey === "slack" && "dark:text-[#E01E5A]",
          integration.vendorKey === "sentry" && "dark:text-[#8B80F9]",
          integration.vendorKey === "snyk" && "dark:text-[#8B89B9]",
        )}
        style={{
          color: meta.color === "currentColor" ? undefined : meta.color,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

function StatusCell({ integration }: { integration: Integration }) {
  if (integration.status === "available") {
    return (
      <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
        <CircleDashed className="size-3.5" />
        Available
      </span>
    );
  }

  const details = {
    connected: {
      label: integration.health === "degraded" ? "Degraded" : "Connected",
      icon: integration.health === "degraded" ? AlertTriangle : CheckCircle2,
      className:
        integration.health === "degraded"
          ? "text-amber-600 dark:text-amber-400"
          : "text-green-600 dark:text-green-400",
    },
    error: {
      label: "Error",
      icon: XCircle,
      className: "text-destructive dark:text-red-400",
    },
    pending: {
      label: "Validating",
      icon: Clock3,
      className: "text-blue-600 dark:text-blue-400",
    },
    paused: {
      label: "Paused",
      icon: CirclePause,
      className: "text-muted-foreground",
    },
  }[integration.status];
  const Icon = details.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        details.className,
      )}
    >
      <Icon className="size-3.5" />
      {details.label}
    </span>
  );
}

function CategoryBadge({ category }: { category: IntegrationCategory }) {
  return (
    <Badge
      variant="secondary"
      className="rounded-full px-2 font-normal whitespace-nowrap"
    >
      {integrationCategoryLabels[category]}
    </Badge>
  );
}

function StatsStrip({ integrations }: { integrations: Integration[] }) {
  const stats = getIntegrationStats(integrations);
  const items = [
    {
      label: "Catalog",
      value: stats.total.toString(),
      detail: "supported sources",
      icon: Link2,
    },
    {
      label: "Active connections",
      value: stats.connected.toString(),
      detail: `${integrations.filter((item) => item.status === "pending").length} validating`,
      icon: Waves,
    },
    {
      label: "Needs attention",
      value: stats.needsAttention.toString(),
      detail: stats.needsAttention ? "action required" : "all healthy",
      icon: ShieldAlert,
    },
    {
      label: "Daily telemetry",
      value: compactNumber.format(stats.eventsPerDay),
      detail: "events / 24h",
      icon: Activity,
    },
  ];

  return (
    <div className="grid overflow-hidden rounded-lg border border-dashed sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={cn(
              "flex min-w-0 items-center gap-3 px-4 py-3",
              index > 0 && "border-t sm:border-t-0 sm:border-l",
              index === 2 && "sm:border-l-0 xl:border-l",
              index >= 2 && "sm:border-t xl:border-t-0",
            )}
          >
            <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md border">
              <Icon className="text-muted-foreground size-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold tabular-nums">
                  {item.value}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {item.detail}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AttentionStrip({
  integrations,
  active,
  onSelect,
}: {
  integrations: Integration[];
  active: "failed" | "degraded" | "credentials" | null;
  onSelect: (key: "failed" | "degraded" | "credentials") => void;
}) {
  const counts = {
    failed: integrations.filter(
      (item) => item.status === "error" || item.health === "failed",
    ).length,
    degraded: integrations.filter((item) => item.health === "degraded").length,
    credentials: integrations.filter((item) =>
      item.credentialExpiry?.startsWith("Jul"),
    ).length,
  };
  const chips = [
    {
      key: "failed" as const,
      label: "Failed syncs",
      count: counts.failed,
      icon: XCircle,
    },
    {
      key: "degraded" as const,
      label: "SLA drift",
      count: counts.degraded,
      icon: AlertTriangle,
    },
    {
      key: "credentials" as const,
      label: "Credentials expiring",
      count: counts.credentials,
      icon: Clock3,
    },
  ].filter((chip) => chip.count > 0);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed px-3 py-2.5">
      <span className="text-muted-foreground mr-1 flex items-center gap-1.5 text-xs font-medium">
        <ShieldAlert className="size-3.5 text-amber-600 dark:text-amber-400" />
        Attention
      </span>
      {chips.map((chip) => {
        const Icon = chip.icon;
        return (
          <button
            key={chip.key}
            type="button"
            onClick={() => onSelect(chip.key)}
            className={cn(
              "hover:bg-accent inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs transition-colors",
              active === chip.key && "bg-accent border-foreground/20",
            )}
          >
            <Icon className="size-3" />
            {chip.label}
            <span className="text-muted-foreground tabular-nums">
              {chip.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function IntegrationFilterControl({
  categoryFilters,
  statusFilters,
  sort,
  onToggleCategory,
  onToggleStatus,
  onSetSort,
  onClear,
}: {
  categoryFilters: IntegrationCategory[];
  statusFilters: IntegrationStatus[];
  sort: IntegrationSort;
  onToggleCategory: (category: IntegrationCategory) => void;
  onToggleStatus: (status: IntegrationStatus) => void;
  onSetSort: (sort: IntegrationSort) => void;
  onClear: () => void;
}) {
  const count = categoryFilters.length + statusFilters.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 gap-1.5", mutedControlClassName)}
        >
          <ListFilter className="size-3.5" />
          Filter
          {count > 0 ? (
            <span className="bg-foreground text-background rounded px-1.5 py-0.5 text-[10px] leading-none">
              {count}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <Command>
          <CommandList className="max-h-[420px]">
            <CommandGroup heading="Category">
              {categories.map((category) => (
                <CommandItem
                  key={category}
                  onSelect={() => onToggleCategory(category)}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded border",
                      categoryFilters.includes(category) &&
                        "bg-foreground text-background",
                    )}
                  >
                    {categoryFilters.includes(category) ? (
                      <Check className="size-3" />
                    ) : null}
                  </span>
                  {integrationCategoryLabels[category]}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Connection status">
              {statusFilterOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => onToggleStatus(option.value)}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded border",
                      statusFilters.includes(option.value) &&
                        "bg-foreground text-background",
                    )}
                  >
                    {statusFilters.includes(option.value) ? (
                      <Check className="size-3" />
                    ) : null}
                  </span>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Sort">
              {(Object.keys(sortLabels) as IntegrationSort[]).map((value) => (
                <CommandItem key={value} onSelect={() => onSetSort(value)}>
                  {value === "name-desc" ? (
                    <ArrowDownAZ className="size-4" />
                  ) : value === "name-asc" ? (
                    <ArrowUpAZ className="size-4" />
                  ) : (
                    <Activity className="size-4" />
                  )}
                  {sortLabels[value]}
                  {sort === value ? <Check className="ml-auto size-4" /> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {count > 0 ? (
            <div className="border-t p-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-full justify-center text-xs"
                onClick={onClear}
              >
                Clear filters
              </Button>
            </div>
          ) : null}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
      <div className="bg-muted flex size-10 items-center justify-center rounded-full border">
        <Filter className="text-muted-foreground size-4" />
      </div>
      <h3 className="mt-4 text-sm font-medium">No integrations match</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-5">
        Adjust the search, status, or category filters to return integrations to
        this operational view.
      </p>
      <Button
        variant="outline"
        size="sm"
        className={cn("mt-4 h-8", mutedControlClassName)}
        onClick={onReset}
      >
        Reset filters
      </Button>
    </div>
  );
}

function IntegrationsTable({
  integrations,
  selectedIds,
  onToggle,
  onToggleAll,
  onClearSelection,
  onView,
  onConnect,
  onSync,
  onPause,
  onDisconnect,
  footer,
}: {
  integrations: Integration[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onClearSelection: () => void;
  onView: (integration: Integration) => void;
  onConnect: (integration: Integration) => void;
  onSync: (integration: Integration) => void;
  onPause: (integration: Integration) => void;
  onDisconnect: (integration: Integration) => void;
  footer: React.ReactNode;
}) {
  const allSelected =
    integrations.length > 0 &&
    integrations.every((item) => selectedIds.includes(item.id));
  const someSelected = integrations.some((item) =>
    selectedIds.includes(item.id),
  );

  return (
    <div className="bg-card overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          {selectedIds.length > 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableHead colSpan={8} className="h-11 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-sm font-medium">
                    {selectedIds.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 h-7 text-xs"
                    onClick={() =>
                      toast({
                        title: "Sync queued",
                        description: `${selectedIds.length} integrations will refresh in the background.`,
                      })
                    }
                  >
                    <RefreshCw className="size-3" />
                    Sync now
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={onClearSelection}
                  >
                    Clear
                  </Button>
                </div>
              </TableHead>
            </TableRow>
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 px-4">
                <Checkbox
                  aria-label="Select all visible integrations"
                  checked={
                    allSelected ? true : someSelected ? "indeterminate" : false
                  }
                  onCheckedChange={onToggleAll}
                />
              </TableHead>
              <TableHead className="min-w-72">Data source</TableHead>
              <TableHead className="hidden min-w-48 lg:table-cell">
                Telemetry
              </TableHead>
              <TableHead className="hidden w-48 xl:table-cell">
                Category
              </TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="hidden w-28 md:table-cell">
                Last sync
              </TableHead>
              <TableHead className="hidden w-28 text-right lg:table-cell">
                Events / day
              </TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          )}
        </TableHeader>
        <TableBody>
          {integrations.map((integration) => (
            <TableRow
              key={integration.id}
              data-state={
                selectedIds.includes(integration.id) ? "selected" : undefined
              }
              className={cn(
                "cursor-pointer",
                isIntegrationIssue(integration) &&
                  !selectedIds.includes(integration.id) &&
                  "bg-destructive/[0.025]",
              )}
              onClick={() => onView(integration)}
            >
              <TableCell
                className="px-4"
                onClick={(event) => event.stopPropagation()}
              >
                <Checkbox
                  aria-label={`Select ${integration.name}`}
                  checked={selectedIds.includes(integration.id)}
                  onCheckedChange={() => onToggle(integration.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  <VendorLogo integration={integration} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">
                        {integration.name}
                      </span>
                      {isIntegrationIssue(integration) ? (
                        <AlertTriangle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      ) : null}
                    </div>
                    <p className="text-muted-foreground truncate text-xs">
                      {integration.vendor}
                    </p>
                    <div className="mt-1.5 md:hidden">
                      <StatusCell integration={integration} />
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex max-w-64 flex-wrap gap-1">
                  {integration.dataTypes.slice(0, 2).map((type) => (
                    <span
                      key={type}
                      className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[11px]"
                    >
                      {type}
                    </span>
                  ))}
                  {integration.dataTypes.length > 2 ? (
                    <span className="text-muted-foreground px-1 py-0.5 text-[11px]">
                      +{integration.dataTypes.length - 2}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <CategoryBadge category={integration.category} />
              </TableCell>
              <TableCell>
                {integration.status === "available" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={(event) => {
                      event.stopPropagation();
                      onConnect(integration);
                    }}
                  >
                    Connect
                  </Button>
                ) : (
                  <StatusCell integration={integration} />
                )}
              </TableCell>
              <TableCell className="text-muted-foreground hidden text-xs md:table-cell">
                {integration.lastSync ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground hidden text-right font-mono text-xs tabular-nums lg:table-cell">
                {integration.eventsPerDay !== undefined
                  ? compactNumber.format(integration.eventsPerDay)
                  : "—"}
              </TableCell>
              <TableCell onClick={(event) => event.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={`Open actions for ${integration.name}`}
                    >
                      <Ellipsis className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onView(integration)}>
                      View details
                    </DropdownMenuItem>
                    {integration.status === "available" ? (
                      <DropdownMenuItem onClick={() => onConnect(integration)}>
                        Connect source
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => onSync(integration)}>
                          Sync now
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onPause(integration)}>
                          {integration.status === "paused" ? "Resume" : "Pause"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDisconnect(integration)}
                        >
                          Disconnect
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {footer}
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right break-words">{children}</dd>
    </div>
  );
}

function IntegrationDetailSheet({
  integration,
  onOpenChange,
  onSync,
  onPause,
  onConfigure,
  onDisconnect,
}: {
  integration: Integration | null;
  onOpenChange: (open: boolean) => void;
  onSync: (integration: Integration) => void;
  onPause: (integration: Integration) => void;
  onConfigure: (integration: Integration) => void;
  onDisconnect: (integration: Integration) => void;
}) {
  if (!integration) return null;

  const sparkData =
    integration.volumeTrend?.map((volume, index) => ({
      hour: index,
      volume,
    })) ?? [];
  const activity = getIntegrationActivity(integration.id);

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-5 pr-12">
          <div className="flex items-start gap-3">
            <VendorLogo integration={integration} className="size-11" />
            <div className="min-w-0">
              <SheetTitle className="truncate text-base">
                {integration.name}
              </SheetTitle>
              <SheetDescription className="mt-0.5">
                {integration.vendor}
              </SheetDescription>
              <div className="mt-2">
                <StatusCell integration={integration} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {integration.errorMessage ? (
            <div
              className={cn(
                "mb-5 rounded-lg border p-3",
                integration.status === "error"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-amber-500/30 bg-amber-500/5",
              )}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    integration.status === "error"
                      ? "text-destructive"
                      : "text-amber-600 dark:text-amber-400",
                  )}
                />
                <div>
                  <p className="text-sm font-medium">
                    {integration.status === "error"
                      ? "Data flow interrupted"
                      : "Collection SLA drift"}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
                    {integration.errorMessage}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <section>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-wide uppercase">
                Connection
              </h3>
              <CategoryBadge category={integration.category} />
            </div>
            <dl className="divide-y">
              <DetailRow label="Endpoint / scope">
                {integration.region ?? "Not configured"}
              </DetailRow>
              <DetailRow label="Connector">
                {integration.version ?? "Managed connector"}
              </DetailRow>
              <DetailRow label="Connected by">
                {integration.connectedBy ?? "—"}
              </DetailRow>
              <DetailRow label="Connected">
                {integration.connectedAt ?? "—"}
              </DetailRow>
              <DetailRow label="Credentials">
                {integration.credentialExpiry ?? "Managed by OAuth"}
              </DetailRow>
            </dl>
          </section>

          <section className="mt-6">
            <h3 className="mb-2 text-xs font-semibold tracking-wide uppercase">
              Data flow
            </h3>
            <div className="rounded-lg border">
              <div className="grid grid-cols-2 divide-x border-b sm:grid-cols-4">
                <div className="px-3 py-3">
                  <p className="text-muted-foreground text-[11px] uppercase">
                    Throughput
                  </p>
                  <p className="mt-1 font-mono text-sm font-medium tabular-nums">
                    {integration.eventsPerDay !== undefined
                      ? compactNumber.format(integration.eventsPerDay)
                      : "—"}
                  </p>
                </div>
                <div className="px-3 py-3">
                  <p className="text-muted-foreground text-[11px] uppercase">
                    Latency
                  </p>
                  <p className="mt-1 font-mono text-sm font-medium tabular-nums">
                    {integration.latencyMs !== undefined
                      ? `${integration.latencyMs}ms`
                      : "—"}
                  </p>
                </div>
                <div className="px-3 py-3">
                  <p className="text-muted-foreground text-[11px] uppercase">
                    Error rate
                  </p>
                  <p className="mt-1 font-mono text-sm font-medium tabular-nums">
                    {integration.errorRate !== undefined
                      ? `${integration.errorRate}%`
                      : "—"}
                  </p>
                </div>
                <div className="px-3 py-3">
                  <p className="text-muted-foreground text-[11px] uppercase">
                    Coverage
                  </p>
                  <p className="mt-1 font-mono text-sm font-medium tabular-nums">
                    {integration.coveragePercent !== undefined
                      ? `${integration.coveragePercent}%`
                      : "—"}
                  </p>
                </div>
              </div>

              {sparkData.length > 0 ? (
                <div className="border-b p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-muted-foreground text-[11px] uppercase">
                      Volume · 24h
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      Last sync {integration.lastSync ?? "—"}
                    </p>
                  </div>
                  <ChartContainer
                    config={sparklineConfig}
                    className="[aspect-ratio:auto] h-[88px] w-full"
                  >
                    <AreaChart
                      accessibilityLayer
                      data={sparkData}
                      margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id={`spark-${integration.id}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--color-volume)"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--color-volume)"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            hideLabel
                            formatter={(value) => (
                              <span className="font-mono tabular-nums">
                                {compactNumber.format(Number(value))} events
                              </span>
                            )}
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="var(--color-volume)"
                        fill={`url(#spark-${integration.id})`}
                        strokeWidth={1.5}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              ) : null}

              <div className="p-3">
                <p className="text-muted-foreground text-[11px] uppercase">
                  Telemetry streams
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {integration.dataTypes.map((type) => (
                    <span
                      key={type}
                      className="bg-muted rounded px-2 py-1 text-xs"
                    >
                      {type}
                    </span>
                  ))}
                </div>
                {integration.dropRate !== undefined ? (
                  <p className="text-muted-foreground mt-3 text-xs">
                    Drop rate{" "}
                    <span className="font-mono tabular-nums">
                      {integration.dropRate}%
                    </span>{" "}
                    over the last 24 hours
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="mb-2 text-xs font-semibold tracking-wide uppercase">
              Recent activity
            </h3>
            <div className="space-y-3 border-l pl-4">
              {(activity.length > 0
                ? activity.map((event) => [event.title, event.time] as const)
                : ([
                    [
                      "Connector heartbeat received",
                      integration.lastSync ?? "—",
                    ],
                    ["Schema validation completed", "18 min ago"],
                    ["Daily volume baseline evaluated", "4 hr ago"],
                  ] as const)
              ).map(([event, time]) => (
                <div key={event} className="relative">
                  <span className="bg-background border-border absolute top-1 -left-[21px] size-2 rounded-full border" />
                  <p className="text-xs font-medium">{event}</p>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    {time}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <SheetFooter className="grid grid-cols-2 gap-2 border-t p-4 sm:space-x-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSync(integration)}
          >
            <RefreshCw className="size-3.5" />
            Sync now
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfigure(integration)}
          >
            <Settings2 className="size-3.5" />
            Edit config
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPause(integration)}
          >
            {integration.status === "paused" ? (
              <Play className="size-3.5" />
            ) : (
              <Pause className="size-3.5" />
            )}
            {integration.status === "paused" ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDisconnect(integration)}
          >
            <Unplug className="size-3.5" />
            Disconnect
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function IntegrationsManagement() {
  const [integrations, setIntegrations] =
    useState<Integration[]>(initialIntegrations);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<IntegrationTab>("overview");
  const [categoryFilters, setCategoryFilters] = useState<IntegrationCategory[]>(
    [],
  );
  const [statusFilters, setStatusFilters] = useState<IntegrationStatus[]>([]);
  const [sort, setSort] = useState<IntegrationSort>("name-asc");
  const [attention, setAttention] = useState<
    "failed" | "degraded" | "credentials" | null
  >(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardIntegrationId, setWizardIntegrationId] = useState<string | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const detailIntegration =
    integrations.find((item) => item.id === detailId) ?? null;
  const disconnectIntegration =
    integrations.find((item) => item.id === disconnectId) ?? null;

  const tabCounts = useMemo(
    () => ({
      overview: integrations.length,
      all: integrations.length,
      connected: integrations.filter((item) => item.status !== "available")
        .length,
      available: integrations.filter((item) => item.status === "available")
        .length,
      attention: integrations.filter(isIntegrationIssue).length,
    }),
    [integrations],
  );

  const visibleIntegrations = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    const filtered = integrations.filter((integration) => {
      const matchesSearch =
        !query ||
        [
          integration.name,
          integration.vendor,
          integration.description,
          ...integration.dataTypes,
        ].some((value) => value.toLowerCase().includes(query));
      const matchesTab =
        activeTab === "overview" ||
        activeTab === "all" ||
        (activeTab === "connected" && integration.status !== "available") ||
        (activeTab === "available" && integration.status === "available") ||
        (activeTab === "attention" && isIntegrationIssue(integration));
      const matchesIssues = !issuesOnly || isIntegrationIssue(integration);
      const matchesCategory =
        categoryFilters.length === 0 ||
        categoryFilters.includes(integration.category);
      const matchesStatus =
        statusFilters.length === 0 ||
        statusFilters.includes(integration.status);
      const matchesAttention =
        attention === null ||
        (attention === "failed" &&
          (integration.status === "error" ||
            integration.health === "failed")) ||
        (attention === "degraded" && integration.health === "degraded") ||
        (attention === "credentials" &&
          integration.credentialExpiry?.startsWith("Jul"));

      return (
        matchesSearch &&
        matchesTab &&
        matchesIssues &&
        matchesCategory &&
        matchesStatus &&
        matchesAttention
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "events-desc")
        return (b.eventsPerDay ?? -1) - (a.eventsPerDay ?? -1);
      if (sort === "sync") {
        if (a.status === "available") return 1;
        if (b.status === "available") return -1;
        return a.lastSync?.localeCompare(b.lastSync ?? "") ?? 0;
      }
      return a.name.localeCompare(b.name);
    });
  }, [
    activeTab,
    attention,
    categoryFilters,
    deferredSearch,
    integrations,
    issuesOnly,
    sort,
    statusFilters,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    activeTab,
    attention,
    categoryFilters,
    deferredSearch,
    issuesOnly,
    pageSize,
    sort,
    statusFilters,
  ]);

  const pagedIntegrations = paginateItems(visibleIntegrations, page, pageSize);

  const resetFilters = () => {
    setSearchQuery("");
    setIssuesOnly(false);
    setCategoryFilters([]);
    setStatusFilters([]);
    setAttention(null);
    setActiveTab("all");
    setSort("name-asc");
  };

  const openWizard = (integration?: Integration) => {
    setWizardIntegrationId(integration?.id ?? null);
    setWizardOpen(true);
  };

  const syncIntegration = (integration: Integration) => {
    toast({
      title: "Sync queued",
      description: `${integration.name} will refresh in the background.`,
    });
    setIntegrations((current) =>
      current.map((item) =>
        item.id === integration.id
          ? { ...item, lastSync: "Syncing now" }
          : item,
      ),
    );
  };

  const togglePause = (integration: Integration) => {
    const resume = integration.status === "paused";
    setIntegrations((current) =>
      current.map((item) =>
        item.id === integration.id
          ? {
              ...item,
              status: resume ? "connected" : "paused",
              lastSync: resume ? "Sync queued" : "Paused just now",
              eventsPerDay: resume ? item.eventsPerDay : 0,
            }
          : item,
      ),
    );
    toast({
      title: resume ? "Integration resumed" : "Integration paused",
      description: `${integration.name} ${
        resume ? "is reconnecting" : "will stop ingesting new events"
      }.`,
    });
  };

  const confirmDisconnect = () => {
    if (!disconnectIntegration) return;
    setIntegrations((current) =>
      current.map((item) =>
        item.id === disconnectIntegration.id
          ? {
              ...item,
              status: "available",
              health: undefined,
              lastSync: undefined,
              eventsPerDay: undefined,
              connectedBy: undefined,
              connectedAt: undefined,
              credentialExpiry: undefined,
              errorMessage: undefined,
            }
          : item,
      ),
    );
    setSelectedIds((current) =>
      current.filter((id) => id !== disconnectIntegration.id),
    );
    setDetailId(null);
    setDisconnectId(null);
    toast({
      title: "Integration disconnected",
      description: `${disconnectIntegration.name} stopped sending data. Historical events remain available.`,
      variant: "destructive",
    });
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  };

  const toggleAll = () => {
    const visibleIds = pagedIntegrations.map((item) => item.id);
    setSelectedIds((current) => {
      const allSelected = visibleIds.every((id) => current.includes(id));
      return allSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]));
    });
  };

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="border-b">
        <div className="flex flex-col gap-2 px-4 py-3 sm:px-6 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2">
          <div className="min-w-0 flex-1">
            <InputGroup className="h-9 w-full lg:max-w-sm">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={searchQuery}
                placeholder="Search sources, vendors, telemetry..."
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </InputGroup>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
            <label className="border-border bg-background hover:bg-accent flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
              <Switch
                checked={issuesOnly}
                onCheckedChange={(checked) => {
                  setIssuesOnly(checked);
                  if (checked) setActiveTab("attention");
                }}
                aria-label="Show integrations with issues only"
              />
              <span className="whitespace-nowrap">Issues only</span>
            </label>

            <IntegrationFilterControl
              categoryFilters={categoryFilters}
              statusFilters={statusFilters}
              sort={sort}
              onToggleCategory={(category) =>
                setCategoryFilters((current) =>
                  current.includes(category)
                    ? current.filter((item) => item !== category)
                    : [...current, category],
                )
              }
              onToggleStatus={(status) =>
                setStatusFilters((current) =>
                  current.includes(status)
                    ? current.filter((item) => item !== status)
                    : [...current, status],
                )
              }
              onSetSort={setSort}
              onClear={() => {
                setCategoryFilters([]);
                setStatusFilters([]);
              }}
            />

            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => openWizard()}
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">Add integration</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full flex-col gap-4">
          {activeTab !== "overview" ? (
            <>
              <StatsStrip integrations={integrations} />
              <AttentionStrip
                integrations={integrations}
                active={attention}
                onSelect={(key) => {
                  setAttention((current) => (current === key ? null : key));
                  setActiveTab("attention");
                }}
              />
            </>
          ) : null}

          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as IntegrationTab);
              setAttention(null);
              if (value !== "attention") setIssuesOnly(false);
            }}
            className="flex flex-col gap-4"
          >
            <div className="overflow-x-auto border-b">
              <TabsList className="inline-flex h-auto min-w-max justify-start gap-7 rounded-none bg-transparent p-0 sm:gap-8">
                {(
                  [
                    ["overview", "Overview"],
                    ["all", "All integrations"],
                    ["connected", "Connected"],
                    ["available", "Available"],
                    ["attention", "Needs attention"],
                  ] as const
                ).map(([value, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={tabTriggerClassName}
                  >
                    {label}
                    {value !== "overview" ? (
                      <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                        {tabCounts[value]}
                      </span>
                    ) : null}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>

          {activeTab === "overview" ? (
            <IntegrationsOverview
              integrations={integrations}
              onSelectIntegration={(integration) => {
                if (integration.status === "available") {
                  openWizard(integration);
                } else {
                  setDetailId(integration.id);
                }
              }}
              onShowAttention={() => setActiveTab("attention")}
            />
          ) : visibleIntegrations.length > 0 ? (
            <IntegrationsTable
              integrations={pagedIntegrations}
              selectedIds={selectedIds}
              onToggle={toggleSelection}
              onToggleAll={toggleAll}
              onClearSelection={() => setSelectedIds([])}
              onView={(integration) => {
                if (integration.status === "available") {
                  openWizard(integration);
                } else {
                  setDetailId(integration.id);
                }
              }}
              onConnect={openWizard}
              onSync={syncIntegration}
              onPause={togglePause}
              onDisconnect={(integration) => setDisconnectId(integration.id)}
              footer={
                <ListPagination
                  page={page}
                  pageSize={pageSize}
                  total={visibleIntegrations.length}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              }
            />
          ) : (
            <EmptyState onReset={resetFilters} />
          )}
        </div>
      </div>

      <IntegrationDetailSheet
        integration={detailIntegration}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        onSync={syncIntegration}
        onPause={togglePause}
        onConfigure={(integration) =>
          toast({
            title: "Configuration opened",
            description: `${integration.name} settings are ready for review.`,
          })
        }
        onDisconnect={(integration) => setDisconnectId(integration.id)}
      />

      <ConnectIntegrationDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        integrations={integrations}
        initialIntegrationId={wizardIntegrationId}
        onConnected={(id, dataTypes) => {
          setIntegrations((current) =>
            current.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: "pending",
                    health: "healthy",
                    dataTypes,
                    lastSync: "Validating access",
                    eventsPerDay: 0,
                    connectedBy: "You",
                    connectedAt: "Jul 24, 2026",
                    credentialExpiry: "Managed automatically",
                  }
                : item,
            ),
          );
          setActiveTab("connected");
          setWizardIntegrationId(null);
          window.setTimeout(() => {
            setIntegrations((current) =>
              current.map((item) =>
                item.id === id && item.status === "pending"
                  ? {
                      ...item,
                      status: "connected",
                      lastSync: "Connected just now",
                    }
                  : item,
              ),
            );
            const integration = integrations.find((item) => item.id === id);
            toast({
              title: "Integration connected",
              description: `${integration?.name ?? "The data source"} passed access validation and is ready to ingest.`,
            });
          }, 1200);
        }}
      />

      <ConfirmDialog
        open={Boolean(disconnectIntegration)}
        onOpenChange={(open) => {
          if (!open) setDisconnectId(null);
        }}
        title="Disconnect integration?"
        desc={
          <>
            <strong className="text-foreground">
              {disconnectIntegration?.name}
            </strong>{" "}
            will stop sending new telemetry. Historical events and existing
            findings will remain available.
          </>
        }
        confirmText="Disconnect"
        destructive
        handleConfirm={confirmDisconnect}
      />
    </main>
  );
}
