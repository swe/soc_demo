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
  ListFilter,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Unplug,
  XCircle,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Area, AreaChart } from "recharts";

import { ConnectIntegrationDialog } from "@/components/administration/connect-integration-dialog";
import { IntegrationsOverview } from "@/components/administration/integrations-overview";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ListPagination, paginateItems } from "@/components/list-pagination";
import {
  ModuleShell,
  ModuleToolbarActions,
  ModuleToolbarSearch,
} from "@/components/soc/module-shell";
import {
  ModuleTabsList,
  ModuleTabsTrigger,
  TabCount,
} from "@/components/soc/module-tabs";
import { ToolbarToggle } from "@/components/soc/toolbar-toggle";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { integrationsApi, receiptToneLabel } from "@/lib/mock-api";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  type ConnectorActivity,
  type DegradedReason,
  degradedReasonLabels,
  type Integration,
  type IntegrationCategory,
  integrationCategoryLabels,
  type IntegrationLicense,
  integrations as initialIntegrations,
  type IntegrationStatus,
  isIntegrationIssue,
  licenseLabels,
  vendorMeta,
} from "./integrations-data";
import { useIntegrationsSession } from "./integrations-session";

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

const licenseFilterOptions: {
  value: IntegrationLicense;
  label: string;
}[] = [
  { value: "open-source", label: licenseLabels["open-source"] },
  { value: "commercial", label: licenseLabels.commercial },
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
          ? "text-warning-text"
          : "text-success-text",
    },
    error: {
      label: "Error",
      icon: XCircle,
      className: "text-destructive-text",
    },
    pending: {
      label: "Validating",
      icon: Clock3,
      className: "text-info-text",
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

function IntegrationFilterControl({
  categoryFilters,
  statusFilters,
  licenseFilters,
  sort,
  onToggleCategory,
  onToggleStatus,
  onToggleLicense,
  onSetSort,
  onClear,
}: {
  categoryFilters: IntegrationCategory[];
  statusFilters: IntegrationStatus[];
  licenseFilters: IntegrationLicense[];
  sort: IntegrationSort;
  onToggleCategory: (category: IntegrationCategory) => void;
  onToggleStatus: (status: IntegrationStatus) => void;
  onToggleLicense: (license: IntegrationLicense) => void;
  onSetSort: (sort: IntegrationSort) => void;
  onClear: () => void;
}) {
  const count =
    categoryFilters.length + statusFilters.length + licenseFilters.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <ListFilter className="size-3.5" />
          Filter
          {count > 0 ? (
            <span className="bg-foreground text-background rounded px-1.5 py-0.5 text-xs leading-none">
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
            <CommandGroup heading="License">
              {licenseFilterOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => onToggleLicense(option.value)}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded border",
                      licenseFilters.includes(option.value) &&
                        "bg-foreground text-background",
                    )}
                  >
                    {licenseFilters.includes(option.value) ? (
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
        Adjust the search, status, category, or license filters to return
        integrations to this operational view.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4 h-8"
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
    <div className="bg-card shadow-card overflow-hidden rounded-xl border">
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
                        <AlertTriangle className="text-warning-text size-3.5 shrink-0" />
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
                      className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs"
                    >
                      {type}
                    </span>
                  ))}
                  {integration.dataTypes.length > 2 ? (
                    <span className="text-muted-foreground px-1 py-0.5 text-xs">
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
                          className="text-destructive-text focus:text-destructive-text"
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

function activityDotClass(kind: ConnectorActivity["kind"]) {
  switch (kind) {
    case "error":
      return "border-destructive bg-destructive";
    case "health":
      return "border-warning bg-warning";
    case "pause":
      return "border-muted-foreground bg-muted-foreground";
    case "connect":
    case "credential":
      return "border-info bg-info";
    default:
      return "border-success bg-success";
  }
}

function IntegrationDetailSheet({
  integration,
  activity,
  connectorConfig,
  onOpenChange,
  onSync,
  onPause,
  onConfigure,
  onDisconnect,
  onDegradeHealth,
}: {
  integration: Integration | null;
  activity: ConnectorActivity[];
  connectorConfig: {
    endpoint: string;
    healthUrl: string;
    scopes: string[];
    credentialsRef: string;
    fieldMap: Record<string, string>;
  } | null;
  onOpenChange: (open: boolean) => void;
  onSync: (integration: Integration) => void;
  onPause: (integration: Integration) => void;
  onConfigure: (integration: Integration) => void;
  onDisconnect: (integration: Integration) => void;
  onDegradeHealth?: (integration: Integration) => void;
}) {
  if (!integration) return null;

  const sparkData =
    integration.volumeTrend?.map((volume, index) => ({
      hour: index,
      volume,
    })) ?? [];
  const reason = integration.degradedReason;
  const showIssueBanner =
    Boolean(reason) ||
    Boolean(integration.errorMessage) ||
    integration.health === "degraded" ||
    integration.health === "failed" ||
    integration.status === "error";

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
          {showIssueBanner ? (
            <div
              className={cn(
                "mb-5 rounded-lg border p-3",
                integration.status === "error" ||
                  integration.health === "failed"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-warning/30 bg-warning/5",
              )}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    integration.status === "error" ||
                      integration.health === "failed"
                      ? "text-destructive-text"
                      : "text-warning-text",
                  )}
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">
                      {reason?.summary ??
                        (integration.status === "error" ||
                        integration.health === "failed"
                          ? "Data flow interrupted"
                          : "Collection SLA drift")}
                    </p>
                    {reason ? (
                      <Badge
                        variant="outline"
                        className="rounded-full text-xs font-normal"
                      >
                        {degradedReasonLabels[reason.code]}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
                    {reason?.detail ?? integration.errorMessage}
                  </p>
                  {reason?.since ? (
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      Since {reason.since}
                    </p>
                  ) : null}
                  {reason?.remediation ? (
                    <p className="mt-2 text-xs leading-5">
                      <span className="font-medium">Next step: </span>
                      <span className="text-muted-foreground">
                        {reason.remediation}
                      </span>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <section>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-callout font-semibold">Connection</h3>
              <CategoryBadge category={integration.category} />
            </div>
            <dl className="divide-y">
              <DetailRow label="Endpoint / scope">
                {connectorConfig?.endpoint ??
                  integration.region ??
                  "Not configured"}
              </DetailRow>
              {connectorConfig?.healthUrl ? (
                <DetailRow label="Health URL">
                  <span className="font-mono text-xs">
                    {connectorConfig.healthUrl}
                  </span>
                </DetailRow>
              ) : null}
              {connectorConfig?.scopes?.length ? (
                <DetailRow label="Scopes">
                  {connectorConfig.scopes.join(", ")}
                </DetailRow>
              ) : null}
              {connectorConfig?.credentialsRef ? (
                <DetailRow label="Credentials ref">
                  <span className="font-mono text-xs">
                    {connectorConfig.credentialsRef}
                  </span>
                </DetailRow>
              ) : null}
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
            {connectorConfig &&
            Object.keys(connectorConfig.fieldMap).length > 0 ? (
              <div className="mt-3 rounded-lg border p-3">
                <p className="text-muted-foreground text-caption">Field map</p>
                <div className="mt-2 space-y-1.5">
                  {Object.entries(connectorConfig.fieldMap)
                    .slice(0, 5)
                    .map(([sourceField, heimdallField]) => (
                      <div
                        key={sourceField}
                        className="flex items-center justify-between gap-2 font-mono text-xs"
                      >
                        <span className="text-muted-foreground truncate">
                          {sourceField}
                        </span>
                        <span className="shrink-0">→ {heimdallField}</span>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </section>

          <section className="mt-6">
            <h3 className="text-callout mb-2 font-semibold">Data flow</h3>
            <div className="rounded-lg border">
              <div className="grid grid-cols-2 divide-x border-b sm:grid-cols-4">
                <div className="px-3 py-3">
                  <p className="text-muted-foreground text-caption">
                    Throughput
                  </p>
                  <p className="mt-1 font-mono text-sm font-medium tabular-nums">
                    {integration.eventsPerDay !== undefined
                      ? compactNumber.format(integration.eventsPerDay)
                      : "—"}
                  </p>
                </div>
                <div className="px-3 py-3">
                  <p className="text-muted-foreground text-caption">Latency</p>
                  <p className="mt-1 font-mono text-sm font-medium tabular-nums">
                    {integration.latencyMs !== undefined
                      ? `${integration.latencyMs}ms`
                      : "—"}
                  </p>
                </div>
                <div className="px-3 py-3">
                  <p className="text-muted-foreground text-caption">
                    Error rate
                  </p>
                  <p className="mt-1 font-mono text-sm font-medium tabular-nums">
                    {integration.errorRate !== undefined
                      ? `${integration.errorRate}%`
                      : "—"}
                  </p>
                </div>
                <div className="px-3 py-3">
                  <p className="text-muted-foreground text-caption">Coverage</p>
                  <p className="mt-1 font-mono text-sm font-medium tabular-nums">
                    {integration.coveragePercent !== undefined
                      ? `${integration.coveragePercent}%`
                      : "—"}
                  </p>
                </div>
              </div>

              {sparkData.length > 0 ? (
                <div className="border-separator border-b p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-muted-foreground text-caption">
                      Volume · 24h
                    </p>
                    <p className="text-muted-foreground text-xs">
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
                <p className="text-muted-foreground text-caption">
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
            <h3 className="text-callout mb-2 font-semibold">
              Sync / health history
            </h3>
            <div className="space-y-3 border-l pl-4">
              {(activity.length > 0
                ? activity
                : ([
                    {
                      id: "fallback-1",
                      integrationId: integration.id,
                      kind: "health" as const,
                      title: "Connector heartbeat received",
                      detail: "No recent health probes stored for this source",
                      time: integration.lastSync ?? "—",
                    },
                  ] satisfies ConnectorActivity[])
              ).map((event) => (
                <div key={event.id} className="relative">
                  <span
                    className={cn(
                      "absolute top-1.5 -left-[21px] size-2 rounded-full border",
                      activityDotClass(event.kind),
                    )}
                  />
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium">{event.title}</p>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {event.time}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs leading-4">
                    {event.detail}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-1.5 rounded-full text-xs font-normal capitalize"
                  >
                    {event.kind}
                  </Badge>
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
            className="text-destructive-text hover:text-destructive-text"
            onClick={() => onDisconnect(integration)}
          >
            <Unplug className="size-3.5" />
            Disconnect
          </Button>
          {onDegradeHealth &&
          integration.status !== "available" &&
          integration.health !== "degraded" ? (
            <Button
              variant="outline"
              size="sm"
              className="col-span-2"
              onClick={() => onDegradeHealth(integration)}
            >
              <AlertTriangle className="size-3.5" />
              Degrade health
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function IntegrationsManagement() {
  const { getConfig, getActivity } = useIntegrationsSession();
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
  const [licenseFilters, setLicenseFilters] = useState<IntegrationLicense[]>(
    [],
  );
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
  const [pageSize, setPageSize] = useState(25);

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
      const matchesLicense =
        licenseFilters.length === 0 ||
        licenseFilters.includes(integration.license);
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
        matchesLicense &&
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
    licenseFilters,
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
    licenseFilters,
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
    setLicenseFilters([]);
    setAttention(null);
    setActiveTab("all");
    setSort("name-asc");
  };

  const openWizard = (integration?: Integration) => {
    setWizardIntegrationId(integration?.id ?? null);
    setWizardOpen(true);
  };

  const syncIntegration = (integration: Integration) => {
    void integrationsApi.sync(integration.id).then((receipt) => {
      toast({
        title: "Sync queued",
        description: (
          <span className="inline-flex flex-col gap-1">
            <span>{receipt.message}</span>
            <Badge variant="secondary" className="w-fit rounded-full text-xs">
              {receiptToneLabel(receipt.outcome)}
            </Badge>
          </span>
        ),
      });
    });
    setIntegrations((current) =>
      current.map((item) =>
        item.id === integration.id
          ? { ...item, lastSync: "Syncing now" }
          : item,
      ),
    );
  };

  const degradeHealth = (integration: Integration) => {
    const reason: DegradedReason = {
      code: "collector_backoff",
      summary: "Health degradation",
      detail: `${integration.name} marked degraded. Ingest continues with elevated lag; check the sync/health timeline for probe history.`,
      since: "Just now",
      remediation: "Re-sync the connector or clear the health overlay.",
    };
    void integrationsApi
      .setHealth(integration.id, "degraded", reason)
      .then((receipt) => {
        setIntegrations((current) =>
          current.map((item) =>
            item.id === integration.id
              ? {
                  ...item,
                  health: "degraded",
                  status: "connected",
                  errorMessage: reason.summary,
                  degradedReason: reason,
                }
              : item,
          ),
        );
        toast({
          title: "Health degraded",
          description: receipt.message,
        });
      });
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
    const target = disconnectIntegration;
    void integrationsApi.disconnect(target.id).then((receipt) => {
      toast({
        title: "Integration disconnected",
        description: (
          <span className="inline-flex flex-col gap-1">
            <span>{receipt.message}</span>
            <Badge variant="secondary" className="w-fit rounded-full text-xs">
              {receiptToneLabel(receipt.outcome)}
            </Badge>
          </span>
        ),
        variant: "destructive",
      });
    });
    setIntegrations((current) =>
      current.map((item) =>
        item.id === target.id
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
              degradedReason: undefined,
            }
          : item,
      ),
    );
    setSelectedIds((current) => current.filter((id) => id !== target.id));
    setDetailId(null);
    setDisconnectId(null);
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
    <ModuleShell
      toolbar={
        <>
          <ModuleToolbarSearch>
            <InputGroup className="h-9 w-full">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={searchQuery}
                placeholder="Search sources, vendors, telemetry..."
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </InputGroup>
          </ModuleToolbarSearch>

          <ModuleToolbarActions>
            <ToolbarToggle
              checked={issuesOnly}
              onCheckedChange={(checked) => {
                setIssuesOnly(checked);
                if (checked) setActiveTab("attention");
              }}
              aria-label="Show integrations with issues only"
              label="Issues only"
            />

            <IntegrationFilterControl
              categoryFilters={categoryFilters}
              statusFilters={statusFilters}
              licenseFilters={licenseFilters}
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
              onToggleLicense={(license) =>
                setLicenseFilters((current) =>
                  current.includes(license)
                    ? current.filter((item) => item !== license)
                    : [...current, license],
                )
              }
              onSetSort={setSort}
              onClear={() => {
                setCategoryFilters([]);
                setStatusFilters([]);
                setLicenseFilters([]);
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
          </ModuleToolbarActions>
        </>
      }
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value as IntegrationTab);
          setAttention(null);
          if (value !== "attention") setIssuesOnly(false);
        }}
        className="flex flex-col gap-4"
      >
        <ModuleTabsList>
          {(
            [
              ["overview", "Overview"],
              ["all", "All integrations"],
              ["connected", "Connected"],
              ["available", "Available"],
              ["attention", "Needs attention"],
            ] as const
          ).map(([value, label]) => (
            <ModuleTabsTrigger key={value} value={value}>
              {label}
              {value !== "overview" ? (
                <TabCount>{tabCounts[value]}</TabCount>
              ) : null}
            </ModuleTabsTrigger>
          ))}
        </ModuleTabsList>
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

      <IntegrationDetailSheet
        integration={detailIntegration}
        activity={detailId ? getActivity(detailId) : []}
        connectorConfig={detailId ? getConfig(detailId) : null}
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
        onDegradeHealth={degradeHealth}
      />

      <ConnectIntegrationDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        integrations={integrations}
        initialIntegrationId={wizardIntegrationId}
        onConnected={(config, dataTypes) => {
          const id = config.integrationId;
          void integrationsApi
            .connect({
              ...config,
              displayName: integrations.find((item) => item.id === id)?.name,
            })
            .then((receipt) => {
              toast({
                title: "Connection started",
                description: receipt.message,
              });
            });
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
                    connectedAt: "Jul 28, 2026",
                    region: config.endpoint,
                    credentialExpiry: "Managed automatically",
                    errorMessage: undefined,
                    degradedReason: undefined,
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
    </ModuleShell>
  );
}
