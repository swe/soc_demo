"use client";

import {
  CheckIcon,
  ChevronRight,
  CircleDotDashed,
  Copy,
  Download,
  Ellipsis,
  HardDrive,
  ListFilter,
  type LucideIcon,
  Monitor,
  Network,
  Plus,
  Radar,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Trash2,
  Wifi,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { ListPagination, paginateItems } from "@/components/list-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  type AssetDevice,
  assetDevices as seedDevices,
  type DeviceCategory,
  type DeviceStatus,
  deviceCategoryLabels,
  deviceStatusColors,
  deviceStatusLabels,
  getDeviceListStats,
} from "./devices-data";
import { useAssetsSession } from "./assets-session";

type DeviceTab = "all" | DeviceCategory;
type DeviceSort =
  | "name-asc"
  | "name-desc"
  | "seen-desc"
  | "seen-asc"
  | "risk-desc"
  | "risk-asc";
type FilterPanel = "status" | "platform" | "sort";
type OnboardMethod = "sensor" | "discovery" | "manual";
type OnboardStep = 1 | 2 | 3;
type SensorOs = "windows" | "macos" | "linux";

type OnboardState = {
  step: OnboardStep;
  method: OnboardMethod;
  sensorOs: SensorOs;
  subnet: string;
  discoveryCredential: string;
  name: string;
  hostname: string;
  category: DeviceCategory;
  ipAddress: string;
  owner: string;
};

const mutedControlClassName =
  "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground";

const tabTriggerClassName =
  "data-[state=active]:border-foreground shrink-0 gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:pb-4";

const sortLabels: Record<DeviceSort, string> = {
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
  "seen-desc": "Last seen · newest",
  "seen-asc": "Last seen · oldest",
  "risk-desc": "Risk · high to low",
  "risk-asc": "Risk · low to high",
};

const categoryIcons: Record<DeviceCategory, LucideIcon> = {
  endpoint: Monitor,
  server: Server,
  network: Network,
  iot: Wifi,
};

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const statusDetails: Record<
  DeviceStatus,
  { label: string; className: string; icon: LucideIcon }
> = {
  online: {
    label: "Online",
    className: "text-green-600 dark:text-green-400",
    icon: ShieldCheck,
  },
  offline: {
    label: "Offline",
    className: "text-zinc-500",
    icon: CircleDotDashed,
  },
  "at-risk": {
    label: "At risk",
    className: "text-amber-600 dark:text-amber-400",
    icon: ShieldAlert,
  },
  pending: {
    label: "Pending",
    className: "text-blue-600 dark:text-blue-400",
    icon: HardDrive,
  },
};

const platforms = Array.from(
  new Set(seedDevices.map((device) => device.platform)),
).sort();

const enrollmentToken = "soc_enroll_7f3a9c2e-4b18-4d91-a6e0";

const sensorInstallCommands: Record<SensorOs, string> = {
  windows:
    "msiexec /i SocSensor.msi /qn CUSTOMTOKEN=soc_enroll_7f3a9c2e-4b18-4d91-a6e0",
  macos:
    "sudo installer -pkg SocSensor.pkg -target / && sudo soc-sensor enroll --token soc_enroll_7f3a9c2e-4b18-4d91-a6e0",
  linux:
    "curl -fsSL https://install.soc.example/sensor.sh | sudo bash -s -- --token soc_enroll_7f3a9c2e-4b18-4d91-a6e0",
};

function emptyOnboardState(): OnboardState {
  return {
    step: 1,
    method: "sensor",
    sensorOs: "windows",
    subnet: "10.12.0.0/16",
    discoveryCredential: "",
    name: "",
    hostname: "",
    category: "iot",
    ipAddress: "",
    owner: "",
  };
}

function DeviceTypeBadge({ category }: { category: DeviceCategory }) {
  const Icon = categoryIcons[category];

  return (
    <Badge variant="secondary" className="gap-1 rounded-full font-medium">
      <Icon className="size-3" />
      {deviceCategoryLabels[category]}
    </Badge>
  );
}

function StatusCell({ status }: { status: DeviceStatus }) {
  const detail = statusDetails[status];
  const Icon = detail.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        detail.className,
      )}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: deviceStatusColors[status] }}
      />
      <Icon className="size-3.5" />
      {detail.label}
    </span>
  );
}

function RiskBadge({ score }: { score: number }) {
  const tone =
    score >= 70
      ? "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400"
      : score >= 40
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";

  return (
    <Badge variant="outline" className={cn("rounded-full tabular-nums", tone)}>
      {score}
    </Badge>
  );
}

function SheetDetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <div className="min-w-0 text-right font-medium">{children}</div>
    </div>
  );
}

function DeviceDetailSheet({
  device,
  onOpenChange,
  onIsolate,
}: {
  device: AssetDevice | null;
  onOpenChange: (open: boolean) => void;
  onIsolate: (device: AssetDevice) => void;
}) {
  return (
    <Sheet open={device !== null} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        {device ? (
          <>
            <SheetHeader className="space-y-3 pb-4">
              <div className="flex items-center gap-3">
                <DeviceIcon category={device.category} />
                <div className="min-w-0">
                  <SheetTitle className="truncate text-base">
                    {device.name}
                  </SheetTitle>
                  <SheetDescription className="truncate font-mono text-xs">
                    {device.hostname}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DeviceTypeBadge category={device.category} />
                <StatusCell status={device.status} />
                <RiskBadge score={device.riskScore} />
              </div>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4">
              <section className="space-y-2.5">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Network
                </h3>
                <SheetDetailRow label="IP">{device.ipAddress}</SheetDetailRow>
                <SheetDetailRow label="Platform">
                  {device.platform}
                </SheetDetailRow>
                <SheetDetailRow label="Location">
                  {device.location}
                </SheetDetailRow>
                <SheetDetailRow label="Agent">
                  {device.agentInstalled ? "Installed" : "Missing"}
                </SheetDetailRow>
              </section>

              <Separator />

              <section className="space-y-2.5">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Ownership
                </h3>
                <SheetDetailRow label="Owner">{device.owner}</SheetDetailRow>
                <SheetDetailRow label="Department">
                  {device.department}
                </SheetDetailRow>
                <SheetDetailRow label="Last seen">
                  {device.lastSeenLabel}
                </SheetDetailRow>
                <SheetDetailRow label="Vulnerabilities">
                  {device.vulnerabilityCount}
                </SheetDetailRow>
              </section>

              <Separator />

              <section className="space-y-2">
                <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Related
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    href="/alerts/list"
                    className="border-border/70 bg-background hover:text-foreground text-muted-foreground inline-flex cursor-pointer items-center rounded-md border px-2 py-1 text-xs font-medium transition-colors"
                  >
                    Open alerts
                  </Link>
                  <Link
                    href="/incidents/list"
                    className="border-border/70 bg-background hover:text-foreground text-muted-foreground inline-flex cursor-pointer items-center rounded-md border px-2 py-1 text-xs font-medium transition-colors"
                  >
                    Open incidents
                  </Link>
                  <Link
                    href="/assets/identities"
                    className="border-border/70 bg-background hover:text-foreground text-muted-foreground inline-flex cursor-pointer items-center rounded-md border px-2 py-1 text-xs font-medium transition-colors"
                  >
                    Identities
                  </Link>
                </div>
              </section>
            </div>

            <SheetFooter className="mt-6 flex-col gap-2 border-t pt-4 sm:flex-col">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-8", mutedControlClassName)}
                  onClick={() =>
                    toast({
                      title: "Scan started",
                      description: `Inventory scan queued for ${device.hostname}.`,
                    })
                  }
                >
                  <Radar className="size-3.5" />
                  Run scan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive h-8"
                  onClick={() => onIsolate(device)}
                >
                  <ShieldAlert className="size-3.5" />
                  Isolate
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function FilterPanelHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center border-b p-2">
      <Button
        variant="ghost"
        size="sm"
        className="size-6 p-0"
        onClick={onBack}
      >
        <ChevronRight className="size-4 rotate-180" />
      </Button>
      <span className="ml-2 text-sm font-medium">{title}</span>
    </div>
  );
}

function DeviceFilterControl({
  statusFilters,
  platformFilters,
  sort,
  activeFilterCount,
  onToggleStatus,
  onTogglePlatform,
  onSetSort,
  onClearFilters,
}: {
  statusFilters: DeviceStatus[];
  platformFilters: string[];
  sort: DeviceSort;
  activeFilterCount: number;
  onToggleStatus: (status: DeviceStatus) => void;
  onTogglePlatform: (platform: string) => void;
  onSetSort: (sort: DeviceSort) => void;
  onClearFilters: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<FilterPanel | null>(null);
  const closePanel = () => setPanel(null);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setPanel(null);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("relative h-9 gap-1.5 px-2.5", mutedControlClassName)}
        >
          <ListFilter className="size-3.5" />
          Filter
          {activeFilterCount > 0 ? (
            <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="end">
        {panel === null ? (
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => setPanel("status")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-zinc-500" />
                    Status
                  </span>
                  <div className="flex items-center">
                    {statusFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {statusFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPanel("platform")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <HardDrive className="size-4 text-zinc-500" />
                    Platform
                  </span>
                  <div className="flex items-center">
                    {platformFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {platformFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPanel("sort")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ListFilter className="size-4 text-zinc-500" />
                    Sort by
                  </span>
                  <ChevronRight className="size-4" />
                </CommandItem>
              </CommandGroup>
              {activeFilterCount > 0 ? (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem onSelect={onClearFilters}>
                      Clear all filters
                    </CommandItem>
                  </CommandGroup>
                </>
              ) : null}
            </CommandList>
          </Command>
        ) : panel === "status" ? (
          <Command>
            <FilterPanelHeader title="Status" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {(Object.keys(deviceStatusLabels) as DeviceStatus[]).map(
                  (status) => (
                    <CommandItem
                      key={status}
                      onSelect={() => onToggleStatus(status)}
                      className="flex items-center justify-between"
                    >
                      {deviceStatusLabels[status]}
                      {statusFilters.includes(status) ? (
                        <CheckIcon className="size-4" />
                      ) : null}
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : panel === "platform" ? (
          <Command>
            <FilterPanelHeader title="Platform" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {platforms.map((platform) => (
                  <CommandItem
                    key={platform}
                    onSelect={() => onTogglePlatform(platform)}
                    className="flex items-center justify-between"
                  >
                    {platform}
                    {platformFilters.includes(platform) ? (
                      <CheckIcon className="size-4" />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : (
          <Command>
            <FilterPanelHeader title="Sort by" onBack={closePanel} />
            <CommandList>
              <CommandGroup heading="Name">
                {(["name-asc", "name-desc"] as const).map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => onSetSort(option)}
                    className="flex items-center justify-between"
                  >
                    {sortLabels[option]}
                    {sort === option ? <CheckIcon className="size-4" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Activity">
                {(["seen-desc", "seen-asc"] as const).map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => onSetSort(option)}
                    className="flex items-center justify-between"
                  >
                    {sortLabels[option]}
                    {sort === option ? <CheckIcon className="size-4" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Risk">
                {(["risk-desc", "risk-asc"] as const).map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => onSetSort(option)}
                    className="flex items-center justify-between"
                  >
                    {sortLabels[option]}
                    {sort === option ? <CheckIcon className="size-4" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-lg border border-dashed p-10 text-center">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
        <div className="bg-muted flex size-10 items-center justify-center rounded-full">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
        {action}
      </div>
    </div>
  );
}

function DeviceStatsStrip({ devices }: { devices: AssetDevice[] }) {
  const stats = getDeviceListStats(devices);

  return (
    <section className="border-border/70 border-b border-dashed pb-4">
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4 xl:gap-0">
        {stats.map((stat, index) => {
          const isIncrease = stat.delta >= 0;
          const isHealthy = stat.preferLower ? !isIncrease : isIncrease;
          const deltaLabel = `${isIncrease ? "+" : ""}${percentFormatter.format(
            stat.delta,
          )}%`;

          return (
            <section
              key={stat.title}
              className={cn(
                "space-y-2 py-2 sm:py-1",
                index > 0 && "xl:border-border/70 xl:border-l",
                index === 0 && "xl:pr-8",
                index > 0 && index < stats.length - 1 && "xl:px-8",
                index === stats.length - 1 && "xl:pl-8",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-muted-foreground text-sm">{stat.title}</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <p className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
                    {stat.value}
                  </p>
                  <span
                    className={cn(
                      "text-sm",
                      isHealthy ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {deltaLabel}
                  </span>
                </div>
                <span className="text-muted-foreground block text-sm">
                  {stat.context}
                </span>
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function DeviceIcon({ category }: { category: DeviceCategory }) {
  const Icon = categoryIcons[category];

  return (
    <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md border">
      <Icon className="text-muted-foreground size-4" />
    </div>
  );
}

function DevicesTable({
  devices,
  selectedIds,
  onToggleDevice,
  onToggleAll,
  onClearSelection,
  onIsolate,
  onBulkIsolate,
  onView,
  footer,
}: {
  devices: AssetDevice[];
  selectedIds: string[];
  onToggleDevice: (id: string) => void;
  onToggleAll: () => void;
  onClearSelection: () => void;
  onIsolate: (device: AssetDevice) => void;
  onBulkIsolate?: (ids: string[]) => void;
  onView: (device: AssetDevice) => void;
  footer?: React.ReactNode;
}) {
  const selectedVisibleCount = devices.filter((device) =>
    selectedIds.includes(device.id),
  ).length;
  const allSelected =
    devices.length > 0 && selectedVisibleCount === devices.length;
  const partiallySelected =
    selectedVisibleCount > 0 && selectedVisibleCount < devices.length;
  const hasSelection = selectedVisibleCount > 0;

  return (
    <div className="bg-card overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          {hasSelection ? (
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 px-4">
                <Checkbox
                  aria-label="Select all visible devices"
                  checked={
                    allSelected
                      ? true
                      : partiallySelected
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={onToggleAll}
                />
              </TableHead>
              <TableHead colSpan={7}>
                <div className="flex flex-wrap items-center gap-2 py-0.5">
                  <span className="text-foreground text-sm font-medium">
                    {selectedVisibleCount} selected
                  </span>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("h-8", mutedControlClassName)}
                      onClick={() =>
                        toast({
                          title: "Scan queued",
                          description: `${selectedVisibleCount} device${selectedVisibleCount === 1 ? "" : "s"} scheduled for inventory scan.`,
                        })
                      }
                    >
                      <Search className="size-3.5" />
                      Scan
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("h-8", mutedControlClassName)}
                      onClick={() =>
                        toast({
                          title: "Tags updated",
                          description: "Selected devices tagged for review.",
                        })
                      }
                    >
                      <ShieldCheck className="size-3.5" />
                      Tag
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive h-8"
                      onClick={() => {
                        const ids = devices
                          .filter((device) => selectedIds.includes(device.id))
                          .map((device) => device.id);
                        onBulkIsolate?.(ids);
                        onClearSelection();
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      Isolate
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
                  aria-label="Select all visible devices"
                  checked={false}
                  onCheckedChange={onToggleAll}
                />
              </TableHead>
              <TableHead className="min-w-64">Device</TableHead>
              <TableHead className="hidden w-36 md:table-cell">Type</TableHead>
              <TableHead className="hidden w-32 lg:table-cell">
                Platform
              </TableHead>
              <TableHead className="hidden w-32 md:table-cell">Status</TableHead>
              <TableHead className="hidden w-40 xl:table-cell">Owner</TableHead>
              <TableHead className="hidden w-28 xl:table-cell">
                Last seen
              </TableHead>
              <TableHead className="w-20 text-center">Risk</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          )}
        </TableHeader>
        <TableBody>
          {devices.map((device) => {
            const atRisk =
              device.status === "at-risk" || device.riskScore >= 70;

            return (
              <TableRow
                key={device.id}
                data-state={
                  selectedIds.includes(device.id) ? "selected" : undefined
                }
                className={cn(
                  "cursor-pointer",
                  atRisk &&
                    !selectedIds.includes(device.id) &&
                    "bg-destructive/[0.03]",
                )}
                onClick={() => onView(device)}
              >
                <TableCell className="px-4" onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    aria-label={`Select ${device.name}`}
                    checked={selectedIds.includes(device.id)}
                    onCheckedChange={() => onToggleDevice(device.id)}
                  />
                </TableCell>

                <TableCell>
                  <div className="flex min-w-0 items-center gap-3">
                    <DeviceIcon category={device.category} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {device.name}
                      </div>
                      <div className="text-muted-foreground truncate font-mono text-xs">
                        {device.hostname}
                        <span aria-hidden="true"> · </span>
                        {device.ipAddress}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 md:hidden">
                        <DeviceTypeBadge category={device.category} />
                        <StatusCell status={device.status} />
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <DeviceTypeBadge category={device.category} />
                </TableCell>

                <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                  {device.platform}
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <StatusCell status={device.status} />
                </TableCell>

                <TableCell className="hidden xl:table-cell">
                  <div className="min-w-0">
                    <div className="truncate text-sm">{device.owner}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {device.department}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-muted-foreground hidden text-xs xl:table-cell">
                  {device.lastSeenLabel}
                </TableCell>

                <TableCell className="text-center">
                  <RiskBadge score={device.riskScore} />
                </TableCell>

                <TableCell onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Open actions for ${device.name}`}
                          className="size-8"
                        >
                          <Ellipsis className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onView(device)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast({
                              title: "Scan started",
                              description: `Inventory scan queued for ${device.hostname}.`,
                            })
                          }
                        >
                          Run scan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onIsolate(device)}
                        >
                          Isolate device
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {footer}
    </div>
  );
}

function MethodCard({
  selected,
  icon: Icon,
  title,
  description,
  onSelect,
}: {
  selected: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "hover:bg-muted/40 flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
        selected && "border-foreground/30 bg-muted/50",
      )}
    >
      <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md border">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
      </div>
    </button>
  );
}

function CodeBlock({
  value,
  onCopy,
}: {
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="bg-muted/50 relative rounded-lg border p-3">
      <pre className="text-muted-foreground overflow-x-auto pr-10 font-mono text-xs break-all whitespace-pre-wrap">
        {value}
      </pre>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1.5 right-1.5 size-7"
        onClick={onCopy}
        aria-label="Copy to clipboard"
      >
        <Copy className="size-3.5" />
      </Button>
    </div>
  );
}

function OnboardDeviceDialog({
  open,
  onOpenChange,
  state,
  onChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: OnboardState;
  onChange: (updates: Partial<OnboardState>) => void;
  onSubmit: () => void;
}) {
  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard?.writeText(value);
    } catch {
      // Clipboard may be unavailable in some environments.
    }

    toast({
      title: `${label} copied`,
      description: "Paste it on the target host to continue enrollment.",
    });
  };

  const canContinue =
    state.step === 1 ||
    (state.step === 2 &&
      (state.method === "sensor" ||
        (state.method === "discovery" &&
          state.subnet.trim().length > 0 &&
          state.discoveryCredential.trim().length > 0) ||
        (state.method === "manual" &&
          state.name.trim().length > 0 &&
          state.hostname.trim().length > 0 &&
          state.ipAddress.trim().length > 0)));

  const goNext = () => {
    if (state.step === 1) {
      onChange({ step: 2 });
      return;
    }

    if (state.step === 2) {
      if (!canContinue) {
        toast({
          title: "Complete this step",
          description: "Fill in the required onboarding fields first.",
          variant: "destructive",
        });
        return;
      }
      onChange({ step: 3 });
      return;
    }

    onSubmit();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          onChange(emptyOnboardState());
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Onboard device</DialogTitle>
          <DialogDescription>
            Step {state.step} of 3 ·{" "}
            {state.step === 1
              ? "Choose how this asset should join the inventory"
              : state.step === 2
                ? "Configure enrollment for the selected method"
                : "Confirm and start enrollment"}
          </DialogDescription>
        </DialogHeader>

        {state.step === 1 ? (
          <div className="grid gap-2 py-1">
            <MethodCard
              selected={state.method === "sensor"}
              icon={Download}
              title="Deploy sensor"
              description="Install the SOC agent on Windows, macOS, or Linux hosts. Best for endpoints and servers."
              onSelect={() => onChange({ method: "sensor" })}
            />
            <MethodCard
              selected={state.method === "discovery"}
              icon={Radar}
              title="Network discovery"
              description="Scan a subnet over SNMP/SSH to find switches, firewalls, and other network gear."
              onSelect={() => onChange({ method: "discovery" })}
            />
            <MethodCard
              selected={state.method === "manual"}
              icon={HardDrive}
              title="Register unmanaged asset"
              description="Manually add IoT or air-gapped devices that cannot run a sensor."
              onSelect={() => onChange({ method: "manual" })}
            />
          </div>
        ) : null}

        {state.step === 2 && state.method === "sensor" ? (
          <div className="grid gap-4 py-1">
            <Field className="gap-2">
              <FieldLabel>Operating system</FieldLabel>
              <RadioGroup
                value={state.sensorOs}
                onValueChange={(value) =>
                  onChange({ sensorOs: value as SensorOs })
                }
                className="grid gap-2 sm:grid-cols-3"
              >
                {(
                  [
                    ["windows", "Windows"],
                    ["macos", "macOS"],
                    ["linux", "Linux"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={cn(
                      "hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                      state.sensorOs === value &&
                        "border-foreground/30 bg-muted/50",
                    )}
                  >
                    <RadioGroupItem value={value} />
                    {label}
                  </label>
                ))}
              </RadioGroup>
            </Field>

            <Field className="gap-2">
              <FieldLabel>Enrollment token</FieldLabel>
              <CodeBlock
                value={enrollmentToken}
                onCopy={() => copyText(enrollmentToken, "Enrollment token")}
              />
            </Field>

            <Field className="gap-2">
              <FieldLabel className="flex items-center gap-1.5">
                <Terminal className="size-3.5" />
                Install command
              </FieldLabel>
              <CodeBlock
                value={sensorInstallCommands[state.sensorOs]}
                onCopy={() =>
                  copyText(
                    sensorInstallCommands[state.sensorOs],
                    "Install command",
                  )
                }
              />
              <p className="text-muted-foreground text-xs">
                Run this on the target host. The device appears in inventory once
                the sensor checks in.
              </p>
            </Field>
          </div>
        ) : null}

        {state.step === 2 && state.method === "discovery" ? (
          <div className="grid gap-4 py-1">
            <Field className="gap-2">
              <FieldLabel htmlFor="onboard-subnet">CIDR range</FieldLabel>
              <InputGroup className="h-9">
                <InputGroupInput
                  id="onboard-subnet"
                  value={state.subnet}
                  placeholder="10.0.0.0/16"
                  onChange={(event) =>
                    onChange({ subnet: event.target.value })
                  }
                />
              </InputGroup>
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="onboard-cred">
                SNMP / SSH credential profile
              </FieldLabel>
              <InputGroup className="h-9">
                <InputGroupInput
                  id="onboard-cred"
                  value={state.discoveryCredential}
                  placeholder="netops-readonly"
                  onChange={(event) =>
                    onChange({ discoveryCredential: event.target.value })
                  }
                />
              </InputGroup>
              <p className="text-muted-foreground text-xs">
                Discovery runs passively and creates pending assets for review
                before they join the active inventory.
              </p>
            </Field>
          </div>
        ) : null}

        {state.step === 2 && state.method === "manual" ? (
          <div className="grid gap-4 py-1 sm:grid-cols-2">
            <Field className="gap-2 sm:col-span-2">
              <FieldLabel htmlFor="onboard-name">Display name</FieldLabel>
              <InputGroup className="h-9">
                <InputGroupInput
                  id="onboard-name"
                  value={state.name}
                  placeholder="Lobby Badge Reader"
                  onChange={(event) => onChange({ name: event.target.value })}
                />
              </InputGroup>
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="onboard-hostname">Hostname</FieldLabel>
              <InputGroup className="h-9">
                <InputGroupInput
                  id="onboard-hostname"
                  value={state.hostname}
                  placeholder="iot-badge-01"
                  onChange={(event) =>
                    onChange({ hostname: event.target.value })
                  }
                />
              </InputGroup>
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="onboard-ip">IP address</FieldLabel>
              <InputGroup className="h-9">
                <InputGroupInput
                  id="onboard-ip"
                  value={state.ipAddress}
                  placeholder="10.90.1.12"
                  onChange={(event) =>
                    onChange({ ipAddress: event.target.value })
                  }
                />
              </InputGroup>
            </Field>
            <Field className="gap-2">
              <FieldLabel>Category</FieldLabel>
              <Select
                value={state.category}
                onValueChange={(value) =>
                  onChange({ category: value as DeviceCategory })
                }
              >
                <SelectTrigger className="h-9 w-full shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(deviceCategoryLabels) as DeviceCategory[]).map(
                    (category) => (
                      <SelectItem key={category} value={category}>
                        {deviceCategoryLabels[category]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="onboard-owner">Owner</FieldLabel>
              <InputGroup className="h-9">
                <InputGroupInput
                  id="onboard-owner"
                  value={state.owner}
                  placeholder="Facilities"
                  onChange={(event) => onChange({ owner: event.target.value })}
                />
              </InputGroup>
            </Field>
          </div>
        ) : null}

        {state.step === 3 ? (
          <div className="bg-muted/40 grid gap-3 rounded-lg border p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium">
                {state.method === "sensor"
                  ? "Deploy sensor"
                  : state.method === "discovery"
                    ? "Network discovery"
                    : "Register unmanaged asset"}
              </span>
            </div>
            {state.method === "sensor" ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Target OS</span>
                <span className="font-medium capitalize">{state.sensorOs}</span>
              </div>
            ) : null}
            {state.method === "discovery" ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Subnet</span>
                  <span className="font-mono text-xs">{state.subnet}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Credential</span>
                  <span className="font-medium">
                    {state.discoveryCredential}
                  </span>
                </div>
              </>
            ) : null}
            {state.method === "manual" ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Device</span>
                  <span className="font-medium">{state.name}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Hostname</span>
                  <span className="font-mono text-xs">{state.hostname}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">
                    {deviceCategoryLabels[state.category]}
                  </span>
                </div>
              </>
            ) : null}
            <p className="text-muted-foreground border-t pt-3 text-xs">
              {state.method === "sensor"
                ? "After install, the host will show as Pending until the first heartbeat arrives."
                : state.method === "discovery"
                  ? "Discovered assets land in Pending for ownership and risk review."
                  : "Unmanaged assets are tracked for visibility without requiring a sensor."}
            </p>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-between">
          <div>
            {state.step > 1 ? (
              <Button
                variant="ghost"
                onClick={() =>
                  onChange({ step: (state.step - 1) as OnboardStep })
                }
              >
                Back
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={goNext} disabled={state.step === 2 && !canContinue}>
              {state.step === 3 ? (
                <>
                  <Plus className="size-3.5" />
                  Start onboarding
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AssetsDeviceList() {
  const searchParams = useSearchParams();
  const {
    devices: assetDevices,
    onboardDevice,
    setDeviceIsolated,
    isolateDevices,
  } = useAssetsSession();
  const [activeTab, setActiveTab] = useState<DeviceTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<DeviceStatus[]>([]);
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);
  const [sort, setSort] = useState<DeviceSort>("name-asc");
  const [atRiskOnly, setAtRiskOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [onboardState, setOnboardState] = useState<OnboardState>(
    emptyOnboardState(),
  );
  const [detailDevice, setDetailDevice] = useState<AssetDevice | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    const match = assetDevices.find((device) => device.id === id);
    if (!match) return;
    setActiveTab(
      match.category === "endpoint" ||
        match.category === "server" ||
        match.category === "network" ||
        match.category === "iot"
        ? match.category
        : "all",
    );
    setSearchQuery(match.hostname);
    setSelectedIds([match.id]);
    setDetailDevice(match);
    setPage(1);
  }, [assetDevices, searchParams]);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

  const tabCounts = useMemo(
    () => ({
      all: assetDevices.length,
      endpoint: assetDevices.filter((d) => d.category === "endpoint").length,
      server: assetDevices.filter((d) => d.category === "server").length,
      network: assetDevices.filter((d) => d.category === "network").length,
      iot: assetDevices.filter((d) => d.category === "iot").length,
    }),
    [assetDevices],
  );

  const visibleDevices = useMemo(() => {
    return assetDevices
      .filter((device) => {
        const matchesTab =
          activeTab === "all" || device.category === activeTab;
        const matchesStatus =
          statusFilters.length === 0 || statusFilters.includes(device.status);
        const matchesPlatform =
          platformFilters.length === 0 ||
          platformFilters.includes(device.platform);
        const matchesRisk =
          !atRiskOnly ||
          device.status === "at-risk" ||
          device.riskScore >= 70;
        const matchesSearch =
          !normalizedQuery ||
          [
            device.name,
            device.hostname,
            device.owner,
            device.department,
            device.ipAddress,
            device.location,
            device.platform,
            deviceCategoryLabels[device.category],
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

        return (
          matchesTab &&
          matchesStatus &&
          matchesPlatform &&
          matchesRisk &&
          matchesSearch
        );
      })
      .sort((a, b) => {
        switch (sort) {
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "seen-desc":
            return b.lastSeenValue - a.lastSeenValue;
          case "seen-asc":
            return a.lastSeenValue - b.lastSeenValue;
          case "risk-desc":
            return b.riskScore - a.riskScore;
          case "risk-asc":
            return a.riskScore - b.riskScore;
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [
    activeTab,
    assetDevices,
    atRiskOnly,
    normalizedQuery,
    platformFilters,
    sort,
    statusFilters,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    activeTab,
    atRiskOnly,
    normalizedQuery,
    platformFilters,
    sort,
    statusFilters,
    pageSize,
  ]);

  const pagedDevices = useMemo(
    () => paginateItems(visibleDevices, page, pageSize),
    [visibleDevices, page, pageSize],
  );

  const activeFilterCount =
    statusFilters.length +
    platformFilters.length +
    (sort === "name-asc" ? 0 : 1);

  const resetFilters = () => {
    setStatusFilters([]);
    setPlatformFilters([]);
    setSort("name-asc");
    setSearchQuery("");
    setAtRiskOnly(false);
  };

  const toggleStatusFilter = (status: DeviceStatus) => {
    setStatusFilters((current) =>
      current.includes(status)
        ? current.filter((entry) => entry !== status)
        : [...current, status],
    );
  };

  const togglePlatformFilter = (platform: string) => {
    setPlatformFilters((current) =>
      current.includes(platform)
        ? current.filter((entry) => entry !== platform)
        : [...current, platform],
    );
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  };

  const toggleAllSelection = () => {
    const visibleIds = pagedDevices.map((device) => device.id);
    setSelectedIds((current) => {
      const allSelected = visibleIds.every((id) => current.includes(id));
      if (allSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const submitOnboard = () => {
    const device = onboardDevice({
      method: onboardState.method,
      name: onboardState.name,
      hostname: onboardState.hostname,
      ipAddress: onboardState.ipAddress,
      category: onboardState.category,
      owner: onboardState.owner,
      sensorOs: onboardState.sensorOs,
      subnet: onboardState.subnet,
    });

    if (onboardState.method === "sensor") {
      toast({
        title: "Sensor enrollment ready",
        description: `Install the ${onboardState.sensorOs} package with the enrollment token. ${device.hostname} is Pending.`,
      });
      setActiveTab(
        onboardState.sensorOs === "linux" ? "server" : "endpoint",
      );
    } else if (onboardState.method === "discovery") {
      toast({
        title: "Discovery scan started",
        description: `Scanning ${onboardState.subnet} with profile “${onboardState.discoveryCredential}”. ${device.hostname} added as Pending.`,
      });
      setActiveTab("network");
    } else {
      toast({
        title: "Unmanaged asset registered",
        description: `${device.hostname} was added for visibility tracking.`,
      });
      setActiveTab(onboardState.category);
    }

    setOnboardState(emptyOnboardState());
    setOnboardOpen(false);
  };

  const isolateDevice = (device: AssetDevice) => {
    setDeviceIsolated(device.id, true);
    setDetailDevice((current) =>
      current?.id === device.id ? { ...current, isolated: true, status: "at-risk" } : current,
    );
    toast({
      title: "Isolation requested",
      description: `${device.hostname} is now isolated from the network.`,
      variant: "destructive",
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
                placeholder="Search hostname, owner, IP..."
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </InputGroup>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
            <label className="border-border bg-background hover:bg-accent flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
              <Switch
                checked={atRiskOnly}
                onCheckedChange={setAtRiskOnly}
                aria-label="Show at-risk devices only"
              />
              <span className="whitespace-nowrap">At risk only</span>
            </label>

            <DeviceFilterControl
              statusFilters={statusFilters}
              platformFilters={platformFilters}
              sort={sort}
              activeFilterCount={activeFilterCount}
              onToggleStatus={toggleStatusFilter}
              onTogglePlatform={togglePlatformFilter}
              onSetSort={setSort}
              onClearFilters={resetFilters}
            />

            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setOnboardOpen(true)}
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">Onboard device</span>
              <span className="sm:hidden">Onboard</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-6">
        <div className="mx-auto flex w-full flex-col gap-4">
          <DeviceStatsStrip devices={assetDevices} />

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as DeviceTab)}
            className="flex flex-col gap-4"
          >
            <div className="overflow-x-auto border-b">
              <TabsList className="inline-flex h-auto min-w-max justify-start gap-7 rounded-none bg-transparent p-0 sm:gap-8">
                <TabsTrigger value="all" className={tabTriggerClassName}>
                  All devices
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {tabCounts.all}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="endpoint" className={tabTriggerClassName}>
                  Endpoints
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {tabCounts.endpoint}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="server" className={tabTriggerClassName}>
                  Servers
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {tabCounts.server}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="network" className={tabTriggerClassName}>
                  Network devices
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {tabCounts.network}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="iot" className={tabTriggerClassName}>
                  IoT
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {tabCounts.iot}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {(
              ["all", "endpoint", "server", "network", "iot"] as const
            ).map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                {visibleDevices.length > 0 ? (
                  <DevicesTable
                    devices={pagedDevices}
                    selectedIds={selectedIds}
                    onToggleDevice={toggleSelection}
                    onToggleAll={toggleAllSelection}
                    onClearSelection={() => setSelectedIds([])}
                    footer={
                      <ListPagination
                        page={page}
                        pageSize={pageSize}
                        total={visibleDevices.length}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                      />
                    }
                    onIsolate={isolateDevice}
                    onBulkIsolate={(ids) => {
                      const count = isolateDevices(ids);
                      toast({
                        title: "Isolation requested",
                        description: `${count} device${count === 1 ? "" : "s"} isolated from the network.`,
                        variant: "destructive",
                      });
                    }}
                    onView={setDetailDevice}
                  />
                ) : (
                  <EmptyState
                    icon={atRiskOnly ? ShieldAlert : HardDrive}
                    title={
                      atRiskOnly
                        ? "No at-risk devices match"
                        : "No devices match the current filters"
                    }
                    description={
                      atRiskOnly
                        ? "At-risk includes elevated risk scores and flagged statuses."
                        : "Adjust search or filters to bring devices back into view."
                    }
                    action={
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn("h-8", mutedControlClassName)}
                        onClick={resetFilters}
                      >
                        Reset filters
                      </Button>
                    }
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      <OnboardDeviceDialog
        open={onboardOpen}
        onOpenChange={setOnboardOpen}
        state={onboardState}
        onChange={(updates) =>
          setOnboardState((current) => ({ ...current, ...updates }))
        }
        onSubmit={submitOnboard}
      />

      <DeviceDetailSheet
        device={detailDevice}
        onOpenChange={(open) => {
          if (!open) setDetailDevice(null);
        }}
        onIsolate={isolateDevice}
      />
    </main>
  );
}
