"use client";

import {
  Bot,
  CheckIcon,
  ChevronRight,
  CircleX,
  Ellipsis,
  KeyRound,
  Laptop,
  ListFilter,
  type LucideIcon,
  MapPin,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  StickyNote,
  User,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { ListPagination, paginateItems } from "@/components/list-pagination";
import { type SocStat,StatsStrip } from "@/components/soc/stats-strip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import { useAssetsSession } from "./assets-session";
import {
  type AssetIdentity,
  getIdentitiesByTab,
  getIdentityInitials,
  getIdentityListStats,
  identityAttentionFilters,
  type IdentityAttentionKey,
  type IdentityKind,
  identityKindLabels,
  type IdentitySource,
  type IdentityStatus,
  identityStatusColors,
  identityStatusLabels,
  isRiskIdentity,
} from "./identities-data";
import { IdentityBehaviorPanel } from "./identity-behavior-panel";

type IdentityTab = "all" | "service" | "privileged" | "guest";
type IdentitySort =
  | "name-asc"
  | "name-desc"
  | "seen-desc"
  | "seen-asc"
  | "risk-desc"
  | "risk-asc";
type FilterPanel = "status" | "source" | "sort";
type OnboardMethod = "directory" | "invite" | "manual";
type OnboardStep = 1 | 2 | 3;

type OnboardState = {
  step: OnboardStep;
  method: OnboardMethod;
  directorySource: IdentitySource;
  inviteEmail: string;
  inviteKind: Exclude<IdentityKind, "service">;
  displayName: string;
  principal: string;
  kind: IdentityKind;
  department: string;
  owner: string;
  privileged: boolean;
};

const mutedControlClassName =
  "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground";

const tabTriggerClassName =
  "data-[state=active]:border-foreground shrink-0 gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:pb-4";

const sortLabels: Record<IdentitySort, string> = {
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
  "seen-desc": "Last seen · newest",
  "seen-asc": "Last seen · oldest",
  "risk-desc": "Risk · high to low",
  "risk-asc": "Risk · low to high",
};

const kindIcons: Record<IdentityKind, LucideIcon> = {
  user: User,
  service: Bot,
  guest: UserRound,
};

const statusDetails: Record<
  IdentityStatus,
  { label: string; className: string; icon: LucideIcon }
> = {
  active: {
    label: "Active",
    className: "text-green-600 dark:text-green-400",
    icon: ShieldCheck,
  },
  disabled: {
    label: "Disabled",
    className: "text-zinc-500",
    icon: CircleX,
  },
  locked: {
    label: "Locked",
    className: "text-destructive dark:text-red-400",
    icon: ShieldAlert,
  },
  stale: {
    label: "Stale",
    className: "text-amber-600 dark:text-amber-400",
    icon: KeyRound,
  },
};

const identitySources: IdentitySource[] = [
  "Entra ID",
  "Okta",
  "Active Directory",
  "AWS IAM",
  "Local",
];

function emptyOnboardState(): OnboardState {
  return {
    step: 1,
    method: "directory",
    directorySource: "Entra ID",
    inviteEmail: "",
    inviteKind: "user",
    displayName: "",
    principal: "",
    kind: "user",
    department: "",
    owner: "",
    privileged: false,
  };
}

function IdentityTypeBadge({ kind }: { kind: IdentityKind }) {
  const Icon = kindIcons[kind];

  return (
    <Badge variant="secondary" className="gap-1 rounded-full font-medium">
      <Icon className="size-3" />
      {identityKindLabels[kind]}
    </Badge>
  );
}

function PrivilegedBadge() {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Privileged"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          >
            <ShieldAlert className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Privileged access</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function StatusCell({ status }: { status: IdentityStatus }) {
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
        style={{ backgroundColor: identityStatusColors[status] }}
      />
      <Icon className="size-3.5" />
      {detail.label}
    </span>
  );
}

function MfaStatus({ enabled }: { enabled: boolean | null }) {
  if (enabled === null) {
    return <span className="text-muted-foreground text-xs">N/A</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        enabled
          ? "text-green-600 dark:text-green-500"
          : "text-destructive dark:text-red-400",
      )}
    >
      {enabled ? (
        <ShieldCheck className="size-3.5" />
      ) : (
        <CircleX className="size-3.5" />
      )}
      {enabled ? "On" : "Off"}
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

function AttentionFlags({ identity }: { identity: AssetIdentity }) {
  const flags: { label: string; className: string }[] = [];

  if (identity.mfaEnabled === false) {
    flags.push({
      label: "MFA gap",
      className:
        "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    });
  }

  if (
    identity.privileged &&
    (identity.status === "stale" || identity.status === "locked")
  ) {
    flags.push({
      label: "Dormant admin",
      className:
        "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400",
    });
  }

  if (flags.length === 0) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1">
      {flags.map((flag) => (
        <Badge
          key={flag.label}
          variant="outline"
          className={cn(
            "rounded-full px-1.5 py-0 text-[10px] font-medium",
            flag.className,
          )}
        >
          {flag.label}
        </Badge>
      ))}
    </span>
  );
}

const attentionFilterShortLabels: Record<IdentityAttentionKey, string> = {
  "privileged-mfa-gap": "Priv. MFA gap",
  "dormant-privileged": "Dormant priv.",
  "guest-mfa-off": "Guest MFA off",
};

function IdentityAttentionFilters({
  active,
  onSelect,
  identities,
}: {
  active: IdentityAttentionKey | null;
  onSelect: (key: IdentityAttentionKey) => void;
  identities: AssetIdentity[];
}) {
  const entries = Object.entries(identityAttentionFilters) as [
    IdentityAttentionKey,
    (typeof identityAttentionFilters)[IdentityAttentionKey],
  ][];

  return (
    <>
      {entries.map(([key, detail]) => {
        const count = identities.filter(detail.matches).length;
        const isActive = active === key;

        return (
          <TooltipProvider key={key}>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onSelect(key)}
                  aria-pressed={isActive}
                  aria-label={`${detail.label} (${count})`}
                  className={cn(
                    "flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors",
                    isActive
                      ? "border-foreground/40 bg-foreground text-background"
                      : "border-border bg-background hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <span className="whitespace-nowrap">
                    {attentionFilterShortLabels[key]}
                  </span>
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                      isActive
                        ? "bg-background/20 text-background"
                        : count > 0
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{detail.label}</p>
                <p className="text-muted-foreground">{detail.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </>
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
      <span className="min-w-0 text-right font-medium">{children}</span>
    </div>
  );
}

function IdentityDetailSheet({
  identity,
  onOpenChange,
  onDisable,
  onRequireMfa,
  onForceLogout,
}: {
  identity: AssetIdentity | null;
  onOpenChange: (open: boolean) => void;
  onDisable: (identity: AssetIdentity) => void;
  onRequireMfa: (identity: AssetIdentity) => void;
  onForceLogout: (identity: AssetIdentity) => void;
}) {
  return (
    <Sheet open={identity !== null} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        {identity ? (
          <>
            <SheetHeader className="space-y-3 pb-4">
              <div className="flex items-center gap-3">
                <IdentityAvatar identity={identity} />
                <div className="min-w-0">
                  <SheetTitle className="flex items-center gap-1.5 text-base">
                    <span className="truncate">{identity.displayName}</span>
                    {identity.privileged ? <PrivilegedBadge /> : null}
                  </SheetTitle>
                  <SheetDescription className="truncate font-mono text-xs">
                    {identity.principal}
                  </SheetDescription>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <IdentityTypeBadge kind={identity.kind} />
                <StatusCell status={identity.status} />
                <RiskBadge score={identity.riskScore} />
                <AttentionFlags identity={identity} />
              </div>
            </SheetHeader>

            {identity.notes ? (
              <div className="border-amber-500/30 bg-amber-500/5 mb-4 flex items-start gap-2 rounded-lg border p-3">
                <StickyNote className="mt-0.5 size-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
                <p className="text-sm">{identity.notes}</p>
              </div>
            ) : null}

            <Tabs defaultValue="profile" className="flex flex-1 flex-col gap-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="mt-0 space-y-4">
                <section className="space-y-2.5">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Access
                  </h3>
                  <SheetDetailRow label="Source">
                    {identity.source}
                  </SheetDetailRow>
                  <SheetDetailRow label="MFA">
                    <MfaStatus enabled={identity.mfaEnabled} />
                  </SheetDetailRow>
                  <SheetDetailRow label="Privileged">
                    {identity.privileged ? "Yes" : "No"}
                  </SheetDetailRow>
                  <SheetDetailRow label="Credential change">
                    {identity.lastPasswordChangeLabel}
                  </SheetDetailRow>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <span className="text-muted-foreground">Groups</span>
                    <div className="flex flex-wrap gap-1.5">
                      {identity.groups.map((group) => (
                        <Badge
                          key={group}
                          variant="secondary"
                          className="rounded-full font-normal"
                        >
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </section>

                <Separator />

                <section className="space-y-2.5">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Ownership
                  </h3>
                  <SheetDetailRow label="Owner">{identity.owner}</SheetDetailRow>
                  <SheetDetailRow label="Department">
                    {identity.department}
                  </SheetDetailRow>
                  <SheetDetailRow label="Title">{identity.title}</SheetDetailRow>
                </section>

                <Separator />

                <section className="space-y-2.5">
                  <h3 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Activity
                  </h3>
                  <SheetDetailRow label="Last seen">
                    {identity.lastSeenLabel}
                  </SheetDetailRow>
                  <SheetDetailRow label="Sign-in location">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="text-muted-foreground size-3.5" />
                      {identity.signInLocation}
                    </span>
                  </SheetDetailRow>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <span className="text-muted-foreground">Linked devices</span>
                    {identity.linkedDevices.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {identity.linkedDevices.map((device) => (
                          <Badge
                            key={device}
                            variant="outline"
                            className="gap-1 rounded-md font-mono text-xs font-normal"
                          >
                            <Laptop className="size-3" />
                            {device}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        No linked devices
                      </span>
                    )}
                  </div>
                </section>
              </TabsContent>
              <TabsContent value="behavior" className="mt-0">
                <IdentityBehaviorPanel identity={identity} />
              </TabsContent>
            </Tabs>

            <SheetFooter className="mt-6 flex-col gap-2 border-t pt-4 sm:flex-col">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-8", mutedControlClassName)}
                  disabled={identity.mfaEnabled === null}
                  onClick={() => onRequireMfa(identity)}
                >
                  <ShieldCheck className="size-3.5" />
                  Require MFA
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-8", mutedControlClassName)}
                  onClick={() => onForceLogout(identity)}
                >
                  <KeyRound className="size-3.5" />
                  Force logout
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-8", mutedControlClassName)}
                  asChild
                >
                  <Link href="/incidents/list">
                    <Shield className="size-3.5" />
                    Investigate
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive h-8"
                  onClick={() => onDisable(identity)}
                >
                  <CircleX className="size-3.5" />
                  Disable
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function IdentityAvatar({ identity }: { identity: AssetIdentity }) {
  if (identity.kind === "service") {
    return (
      <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md border">
        <Bot className="text-muted-foreground size-4" />
      </div>
    );
  }

  return (
    <Avatar className="size-9">
      {identity.avatar ? (
        <AvatarImage src={identity.avatar} alt={identity.displayName} />
      ) : null}
      <AvatarFallback className="text-xs font-semibold">
        {getIdentityInitials(identity.displayName)}
      </AvatarFallback>
    </Avatar>
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

function IdentityFilterControl({
  statusFilters,
  sourceFilters,
  sort,
  activeFilterCount,
  onToggleStatus,
  onToggleSource,
  onSetSort,
  onClearFilters,
}: {
  statusFilters: IdentityStatus[];
  sourceFilters: IdentitySource[];
  sort: IdentitySort;
  activeFilterCount: number;
  onToggleStatus: (status: IdentityStatus) => void;
  onToggleSource: (source: IdentitySource) => void;
  onSetSort: (sort: IdentitySort) => void;
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
                  onSelect={() => setPanel("source")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <KeyRound className="size-4 text-zinc-500" />
                    Source
                  </span>
                  <div className="flex items-center">
                    {sourceFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {sourceFilters.length}
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
                {(Object.keys(identityStatusLabels) as IdentityStatus[]).map(
                  (status) => (
                    <CommandItem
                      key={status}
                      onSelect={() => onToggleStatus(status)}
                      className="flex items-center justify-between"
                    >
                      {identityStatusLabels[status]}
                      {statusFilters.includes(status) ? (
                        <CheckIcon className="size-4" />
                      ) : null}
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : panel === "source" ? (
          <Command>
            <FilterPanelHeader title="Source" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {identitySources.map((source) => (
                  <CommandItem
                    key={source}
                    onSelect={() => onToggleSource(source)}
                    className="flex items-center justify-between"
                  >
                    {source}
                    {sourceFilters.includes(source) ? (
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

function IdentityStatsStrip({ identities }: { identities: AssetIdentity[] }) {
  const stats: SocStat[] = getIdentityListStats(identities).map((stat) => ({
    key: stat.title,
    title: stat.title,
    value: stat.value,
    context: stat.context,
    delta: stat.delta,
    preferLower: stat.preferLower,
  }));

  return <StatsStrip stats={stats} />;
}

function IdentitiesTable({
  identities,
  selectedIds,
  onToggleIdentity,
  onToggleAll,
  onClearSelection,
  onDisable,
  onRequireMfa: _onRequireMfa,
  onResetMfa,
  onForceLogout,
  onBulkRequireMfa,
  onBulkInvestigate,
  onBulkDisable,
  onView,
  footer,
}: {
  identities: AssetIdentity[];
  selectedIds: string[];
  onToggleIdentity: (id: string) => void;
  onToggleAll: () => void;
  onClearSelection: () => void;
  onDisable: (identity: AssetIdentity) => void;
  onRequireMfa: (identity: AssetIdentity) => void;
  onResetMfa: (identity: AssetIdentity) => void;
  onForceLogout: (identity: AssetIdentity) => void;
  onBulkRequireMfa: () => void;
  onBulkInvestigate: () => void;
  onBulkDisable: () => void;
  onView: (identity: AssetIdentity) => void;
  footer?: React.ReactNode;
}) {
  const selectedVisibleCount = identities.filter((identity) =>
    selectedIds.includes(identity.id),
  ).length;
  const allSelected =
    identities.length > 0 && selectedVisibleCount === identities.length;
  const partiallySelected =
    selectedVisibleCount > 0 && selectedVisibleCount < identities.length;
  const hasSelection = selectedVisibleCount > 0;

  return (
    <div className="bg-card overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          {hasSelection ? (
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 px-4">
                <Checkbox
                  aria-label="Select all visible identities"
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
              <TableHead colSpan={8}>
                <div className="flex flex-wrap items-center gap-2 py-0.5">
                  <span className="text-foreground text-sm font-medium">
                    {selectedVisibleCount} selected
                  </span>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("h-8", mutedControlClassName)}
                      onClick={onBulkRequireMfa}
                    >
                      <ShieldCheck className="size-3.5" />
                      Require MFA
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("h-8", mutedControlClassName)}
                      onClick={onBulkInvestigate}
                    >
                      <Shield className="size-3.5" />
                      Investigate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive h-8"
                      onClick={onBulkDisable}
                    >
                      <CircleX className="size-3.5" />
                      Disable
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
                  aria-label="Select all visible identities"
                  checked={false}
                  onCheckedChange={onToggleAll}
                />
              </TableHead>
              <TableHead className="min-w-64">Identity</TableHead>
              <TableHead className="hidden w-40 md:table-cell">Type</TableHead>
              <TableHead className="hidden w-32 lg:table-cell">Source</TableHead>
              <TableHead className="hidden w-32 md:table-cell">Status</TableHead>
              <TableHead className="hidden w-24 xl:table-cell">MFA</TableHead>
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
          {identities.map((identity) => {
            const atRisk = isRiskIdentity(identity);

            return (
              <TableRow
                key={identity.id}
                data-state={
                  selectedIds.includes(identity.id) ? "selected" : undefined
                }
                onClick={() => onView(identity)}
                className={cn(
                  "cursor-pointer",
                  atRisk &&
                    !selectedIds.includes(identity.id) &&
                    "bg-destructive/[0.03]",
                )}
              >
                <TableCell
                  className="px-4"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    aria-label={`Select ${identity.displayName}`}
                    checked={selectedIds.includes(identity.id)}
                    onCheckedChange={() => onToggleIdentity(identity.id)}
                  />
                </TableCell>

                <TableCell>
                  <div className="flex min-w-0 items-center gap-3">
                    <IdentityAvatar identity={identity} />
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-sm font-medium">
                          {identity.displayName}
                        </span>
                        {identity.privileged ? <PrivilegedBadge /> : null}
                        <AttentionFlags identity={identity} />
                      </div>
                      <div className="text-muted-foreground truncate text-xs">
                        {identity.principal}
                        <span aria-hidden="true"> · </span>
                        {identity.title}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 md:hidden">
                        <IdentityTypeBadge kind={identity.kind} />
                        <StatusCell status={identity.status} />
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <IdentityTypeBadge kind={identity.kind} />
                </TableCell>

                <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                  {identity.source}
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <StatusCell status={identity.status} />
                </TableCell>

                <TableCell className="hidden xl:table-cell">
                  <MfaStatus enabled={identity.mfaEnabled} />
                </TableCell>

                <TableCell className="hidden xl:table-cell">
                  <div className="min-w-0">
                    <div className="truncate text-sm">{identity.owner}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {identity.department}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-muted-foreground hidden text-xs xl:table-cell">
                  {identity.lastSeenLabel}
                </TableCell>

                <TableCell className="text-center">
                  <RiskBadge score={identity.riskScore} />
                </TableCell>

                <TableCell onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Open actions for ${identity.displayName}`}
                          className="size-8"
                        >
                          <Ellipsis className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onView(identity)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onResetMfa(identity)}
                          disabled={identity.mfaEnabled === null}
                        >
                          Reset MFA
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onForceLogout(identity)}
                        >
                          Force logout
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDisable(identity)}
                        >
                          Disable identity
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

function OnboardIdentityDialog({
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
  const canContinue =
    state.step === 1 ||
    (state.step === 2 &&
      (state.method === "directory" ||
        (state.method === "invite" &&
          state.inviteEmail.trim().includes("@")) ||
        (state.method === "manual" &&
          state.displayName.trim().length > 0 &&
          state.principal.trim().length > 0)));

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
          <DialogTitle>Onboard identity</DialogTitle>
          <DialogDescription>
            Step {state.step} of 3 ·{" "}
            {state.step === 1
              ? "Choose how this identity should join the inventory"
              : state.step === 2
                ? "Configure enrollment for the selected method"
                : "Confirm and start onboarding"}
          </DialogDescription>
        </DialogHeader>

        {state.step === 1 ? (
          <div className="grid gap-2 py-1">
            <MethodCard
              selected={state.method === "directory"}
              icon={Users}
              title="Sync from directory"
              description="Import users and service principals from Entra ID, Okta, or Active Directory."
              onSelect={() => onChange({ method: "directory" })}
            />
            <MethodCard
              selected={state.method === "invite"}
              icon={UserPlus}
              title="Invite user or guest"
              description="Send an invite for a workforce user or external guest to join under policy."
              onSelect={() => onChange({ method: "invite" })}
            />
            <MethodCard
              selected={state.method === "manual"}
              icon={Bot}
              title="Register service account"
              description="Manually register an unmanaged service principal or local account for visibility."
              onSelect={() => onChange({ method: "manual", kind: "service" })}
            />
          </div>
        ) : null}

        {state.step === 2 && state.method === "directory" ? (
          <div className="grid gap-4 py-1">
            <Field className="gap-2">
              <FieldLabel>Directory source</FieldLabel>
              <Select
                value={state.directorySource}
                onValueChange={(value) =>
                  onChange({ directorySource: value as IdentitySource })
                }
              >
                <SelectTrigger className="h-9 w-full shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {identitySources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <p className="text-muted-foreground text-xs">
              New principals land as Pending until ownership and privilege
              review complete.
            </p>
          </div>
        ) : null}

        {state.step === 2 && state.method === "invite" ? (
          <div className="grid gap-4 py-1">
            <Field className="gap-2">
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <InputGroup className="h-9">
                <InputGroupInput
                  id="invite-email"
                  value={state.inviteEmail}
                  placeholder="name@partner.com"
                  onChange={(event) =>
                    onChange({ inviteEmail: event.target.value })
                  }
                />
              </InputGroup>
            </Field>
            <Field className="gap-2">
              <FieldLabel>Identity type</FieldLabel>
              <RadioGroup
                value={state.inviteKind}
                onValueChange={(value) =>
                  onChange({
                    inviteKind: value as Exclude<IdentityKind, "service">,
                  })
                }
                className="grid gap-2 sm:grid-cols-2"
              >
                <label className="hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm">
                  <RadioGroupItem value="user" />
                  Workforce user
                </label>
                <label className="hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm">
                  <RadioGroupItem value="guest" />
                  Guest / external
                </label>
              </RadioGroup>
            </Field>
          </div>
        ) : null}

        {state.step === 2 && state.method === "manual" ? (
          <div className="grid gap-4 py-1 sm:grid-cols-2">
            <Field className="gap-2 sm:col-span-2">
              <FieldLabel htmlFor="manual-name">Display name</FieldLabel>
              <InputGroup className="h-9">
                <InputGroupInput
                  id="manual-name"
                  value={state.displayName}
                  placeholder="CI Deploy Bot"
                  onChange={(event) =>
                    onChange({ displayName: event.target.value })
                  }
                />
              </InputGroup>
            </Field>
            <Field className="gap-2 sm:col-span-2">
              <FieldLabel htmlFor="manual-principal">Principal</FieldLabel>
              <InputGroup className="h-9">
                <InputGroupInput
                  id="manual-principal"
                  value={state.principal}
                  placeholder="svc-deploy@svalbard.ca"
                  onChange={(event) =>
                    onChange({ principal: event.target.value })
                  }
                />
              </InputGroup>
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="manual-owner">Owner</FieldLabel>
              <InputGroup className="h-9">
                <InputGroupInput
                  id="manual-owner"
                  value={state.owner}
                  placeholder="DevOps"
                  onChange={(event) => onChange({ owner: event.target.value })}
                />
              </InputGroup>
            </Field>
            <Field className="gap-2">
              <FieldLabel htmlFor="manual-department">Department</FieldLabel>
              <InputGroup className="h-9">
                <InputGroupInput
                  id="manual-department"
                  value={state.department}
                  placeholder="Engineering"
                  onChange={(event) =>
                    onChange({ department: event.target.value })
                  }
                />
              </InputGroup>
            </Field>
            <label className="hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm sm:col-span-2">
              <Checkbox
                checked={state.privileged}
                onCheckedChange={(checked) =>
                  onChange({ privileged: checked === true })
                }
              />
              Mark as privileged
            </label>
          </div>
        ) : null}

        {state.step === 3 ? (
          <div className="bg-muted/40 grid gap-3 rounded-lg border p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium">
                {state.method === "directory"
                  ? "Sync from directory"
                  : state.method === "invite"
                    ? "Invite user or guest"
                    : "Register service account"}
              </span>
            </div>
            {state.method === "directory" ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium">{state.directorySource}</span>
              </div>
            ) : null}
            {state.method === "invite" ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{state.inviteEmail}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">
                    {identityKindLabels[state.inviteKind]}
                  </span>
                </div>
              </>
            ) : null}
            {state.method === "manual" ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{state.displayName}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Principal</span>
                  <span className="font-mono text-xs">{state.principal}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Privileged</span>
                  <span className="font-medium">
                    {state.privileged ? "Yes" : "No"}
                  </span>
                </div>
              </>
            ) : null}
            <p className="text-muted-foreground border-t pt-3 text-xs">
              {state.method === "directory"
                ? "Directory sync will enqueue a discovery job. New identities appear after reconciliation."
                : state.method === "invite"
                  ? "Invitees receive an email with access instructions and land under Guest or All users after acceptance."
                  : "Service accounts are tracked for ownership and risk without requiring interactive MFA."}
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

export function AssetsIdentityList() {
  const {
    identities: assetIdentities,
    onboardIdentity,
    disableIdentity,
    disableIdentities,
    requireIdentityMfa,
    requireIdentityMfaBulk,
    resetIdentityMfa,
    forceIdentityLogout,
    flagIdentitiesForReview,
  } = useAssetsSession();
  const [activeTab, setActiveTab] = useState<IdentityTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<IdentityStatus[]>([]);
  const [sourceFilters, setSourceFilters] = useState<IdentitySource[]>([]);
  const [sort, setSort] = useState<IdentitySort>("name-asc");
  const [atRiskOnly, setAtRiskOnly] = useState(false);
  const [attention, setAttention] = useState<IdentityAttentionKey | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailIdentityId, setDetailIdentityId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [onboardState, setOnboardState] = useState<OnboardState>(
    emptyOnboardState(),
  );
  const searchParams = useSearchParams();

  const detailIdentity = useMemo(
    () =>
      detailIdentityId
        ? (assetIdentities.find((identity) => identity.id === detailIdentityId) ??
          null)
        : null,
    [assetIdentities, detailIdentityId],
  );

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    const match = assetIdentities.find((identity) => identity.id === id);
    if (match) setDetailIdentityId(match.id);
  }, [searchParams, assetIdentities]);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

  const tabCounts = useMemo(
    () => ({
      all: assetIdentities.length,
      service: getIdentitiesByTab(assetIdentities, "service").length,
      privileged: getIdentitiesByTab(assetIdentities, "privileged").length,
      guest: getIdentitiesByTab(assetIdentities, "guest").length,
    }),
    [assetIdentities],
  );

  const visibleIdentities = useMemo(() => {
    return getIdentitiesByTab(assetIdentities, activeTab)
      .filter((identity) => {
        const matchesStatus =
          statusFilters.length === 0 ||
          statusFilters.includes(identity.status);
        const matchesSource =
          sourceFilters.length === 0 ||
          sourceFilters.includes(identity.source);
        const matchesRisk = !atRiskOnly || isRiskIdentity(identity);
        const matchesAttention =
          attention === null ||
          identityAttentionFilters[attention].matches(identity);
        const matchesSearch =
          !normalizedQuery ||
          [
            identity.displayName,
            identity.principal,
            identity.title,
            identity.owner,
            identity.department,
            identity.source,
            identityKindLabels[identity.kind],
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

        return (
          matchesStatus &&
          matchesSource &&
          matchesRisk &&
          matchesAttention &&
          matchesSearch
        );
      })
      .sort((a, b) => {
        switch (sort) {
          case "name-desc":
            return b.displayName.localeCompare(a.displayName);
          case "seen-desc":
            return b.lastSeenValue - a.lastSeenValue;
          case "seen-asc":
            return a.lastSeenValue - b.lastSeenValue;
          case "risk-desc":
            return b.riskScore - a.riskScore;
          case "risk-asc":
            return a.riskScore - b.riskScore;
          default:
            return a.displayName.localeCompare(b.displayName);
        }
      });
  }, [
    activeTab,
    assetIdentities,
    atRiskOnly,
    attention,
    normalizedQuery,
    sort,
    sourceFilters,
    statusFilters,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    activeTab,
    atRiskOnly,
    attention,
    normalizedQuery,
    sort,
    sourceFilters,
    statusFilters,
    pageSize,
  ]);

  const pagedIdentities = useMemo(
    () => paginateItems(visibleIdentities, page, pageSize),
    [visibleIdentities, page, pageSize],
  );

  const activeFilterCount =
    statusFilters.length +
    sourceFilters.length +
    (sort === "name-asc" ? 0 : 1);

  const resetFilters = () => {
    setStatusFilters([]);
    setSourceFilters([]);
    setSort("name-asc");
    setSearchQuery("");
    setAtRiskOnly(false);
    setAttention(null);
  };

  const toggleAttention = (key: IdentityAttentionKey) => {
    if (attention === key) {
      setAttention(null);
      return;
    }

    setAttention(key);
    setActiveTab(identityAttentionFilters[key].tab);
  };

  const toggleStatusFilter = (status: IdentityStatus) => {
    setStatusFilters((current) =>
      current.includes(status)
        ? current.filter((entry) => entry !== status)
        : [...current, status],
    );
  };

  const toggleSourceFilter = (source: IdentitySource) => {
    setSourceFilters((current) =>
      current.includes(source)
        ? current.filter((entry) => entry !== source)
        : [...current, source],
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
    const visibleIds = pagedIdentities.map((identity) => identity.id);
    setSelectedIds((current) => {
      const allSelected = visibleIds.every((id) => current.includes(id));
      if (allSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const submitOnboard = () => {
    const created = onboardIdentity({
      method: onboardState.method,
      directorySource: onboardState.directorySource,
      inviteEmail: onboardState.inviteEmail,
      inviteKind: onboardState.inviteKind,
      displayName: onboardState.displayName,
      principal: onboardState.principal,
      kind: onboardState.kind,
      department: onboardState.department,
      owner: onboardState.owner,
      privileged: onboardState.privileged,
    });

    if (onboardState.method === "directory") {
      toast({
        title: "Directory sync complete",
        description: `Imported ${created.length} identities from ${onboardState.directorySource}.`,
      });
      setActiveTab("all");
    } else if (onboardState.method === "invite") {
      toast({
        title: "Invite accepted",
        description: `${created[0]?.principal ?? onboardState.inviteEmail} is now in the inventory.`,
      });
      setActiveTab(onboardState.inviteKind === "guest" ? "guest" : "all");
    } else {
      toast({
        title: "Service account registered",
        description: `${created[0]?.displayName ?? onboardState.displayName} was added for visibility tracking.`,
      });
      setActiveTab(onboardState.privileged ? "privileged" : "service");
    }

    setOnboardState(emptyOnboardState());
    setOnboardOpen(false);
  };

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="bg-background shrink-0 border-b">
        <div className="flex flex-col gap-2 px-4 py-3 sm:px-6 xl:min-h-14 xl:flex-row xl:items-center xl:gap-4 xl:py-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <InputGroup className="h-9 min-w-0 flex-1 xl:max-w-sm">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={searchQuery}
                placeholder="Search name, principal, owner..."
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </InputGroup>

            <div className="flex shrink-0 items-center gap-2">
              <IdentityFilterControl
                statusFilters={statusFilters}
                sourceFilters={sourceFilters}
                sort={sort}
                activeFilterCount={activeFilterCount}
                onToggleStatus={toggleStatusFilter}
                onToggleSource={toggleSourceFilter}
                onSetSort={setSort}
                onClearFilters={resetFilters}
              />

              <Button
                size="sm"
                className="h-9 gap-1.5"
                onClick={() => setOnboardOpen(true)}
              >
                <Plus className="size-3.5" />
                <span className="hidden sm:inline">Onboard identity</span>
                <span className="sm:hidden">Onboard</span>
              </Button>
            </div>
          </div>

          <div
            role="group"
            aria-label="Quick filters"
            className="no-scrollbar -mx-4 flex min-w-0 items-center gap-2 overflow-x-auto px-4 pb-0.5 sm:-mx-6 sm:px-6 xl:mx-0 xl:overflow-visible xl:px-0 xl:pb-0"
          >
            <label className="border-border bg-background hover:bg-accent flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
              <Switch
                checked={atRiskOnly}
                onCheckedChange={setAtRiskOnly}
                aria-label="Show at-risk identities only"
              />
              <span className="whitespace-nowrap">At risk only</span>
            </label>

            <IdentityAttentionFilters
              active={attention}
              identities={assetIdentities}
              onSelect={toggleAttention}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-6">
        <div className="mx-auto flex w-full flex-col gap-4">
          <IdentityStatsStrip identities={assetIdentities} />

          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as IdentityTab);
              setAttention(null);
            }}
            className="flex flex-col gap-4"
          >
            <div className="overflow-x-auto border-b">
              <TabsList className="inline-flex h-auto min-w-max justify-start gap-7 rounded-none bg-transparent p-0 sm:gap-8">
                <TabsTrigger value="all" className={tabTriggerClassName}>
                  All users
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {tabCounts.all}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="service" className={tabTriggerClassName}>
                  Service accounts
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {tabCounts.service}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="privileged"
                  className={tabTriggerClassName}
                >
                  Privileged users
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {tabCounts.privileged}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="guest" className={tabTriggerClassName}>
                  Guest users
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {tabCounts.guest}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {(
              ["all", "service", "privileged", "guest"] as const
            ).map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0">
                {visibleIdentities.length > 0 ? (
                  <IdentitiesTable
                    identities={pagedIdentities}
                    selectedIds={selectedIds}
                    onToggleIdentity={toggleSelection}
                    onToggleAll={toggleAllSelection}
                    onClearSelection={() => setSelectedIds([])}
                    onDisable={(identity) => {
                      disableIdentity(identity.id);
                      toast({
                        title: "Identity disabled",
                        description: `${identity.displayName} is now disabled.`,
                        variant: "destructive",
                      });
                    }}
                    onRequireMfa={(identity) => {
                      requireIdentityMfa(identity.id);
                      toast({
                        title: "MFA required",
                        description: `${identity.displayName} must enroll MFA on next sign-in.`,
                      });
                    }}
                    onResetMfa={(identity) => {
                      resetIdentityMfa(identity.id);
                      toast({
                        title: "MFA reset",
                        description: `Challenge reset for ${identity.displayName} — re-enrollment required.`,
                      });
                    }}
                    onForceLogout={(identity) => {
                      forceIdentityLogout(identity.id);
                      toast({
                        title: "Sessions revoked",
                        description: `Active sessions cleared for ${identity.principal}.`,
                      });
                    }}
                    onBulkRequireMfa={() => {
                      const count = requireIdentityMfaBulk(selectedIds);
                      toast({
                        title: "MFA required",
                        description: `${count} identit${count === 1 ? "y" : "ies"} updated.`,
                      });
                      setSelectedIds([]);
                    }}
                    onBulkInvestigate={() => {
                      const count = flagIdentitiesForReview(selectedIds);
                      toast({
                        title: "Tagged for review",
                        description: `${count} identit${count === 1 ? "y" : "ies"} flagged for investigation.`,
                      });
                      setSelectedIds([]);
                    }}
                    onBulkDisable={() => {
                      const count = disableIdentities(selectedIds);
                      toast({
                        title: "Identities disabled",
                        description: `${count} identit${count === 1 ? "y" : "ies"} disabled.`,
                        variant: "destructive",
                      });
                      setSelectedIds([]);
                    }}
                    onView={(identity) => setDetailIdentityId(identity.id)}
                    footer={
                      <ListPagination
                        page={page}
                        pageSize={pageSize}
                        total={visibleIdentities.length}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                      />
                    }
                  />
                ) : (
                  <EmptyState
                    icon={atRiskOnly ? ShieldAlert : Users}
                    title={
                      atRiskOnly
                        ? "No at-risk identities match"
                        : "No identities match the current filters"
                    }
                    description={
                      atRiskOnly
                        ? "At-risk includes elevated risk scores, stale/locked accounts, and privileged MFA gaps."
                        : "Adjust search or filters to bring identities back into view."
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

      <IdentityDetailSheet
        identity={detailIdentity}
        onOpenChange={(open) => {
          if (!open) {
            setDetailIdentityId(null);
          }
        }}
        onDisable={(identity) => {
          disableIdentity(identity.id);
          setDetailIdentityId(null);
          toast({
            title: "Identity disabled",
            description: `${identity.displayName} is now disabled.`,
            variant: "destructive",
          });
        }}
        onRequireMfa={(identity) => {
          requireIdentityMfa(identity.id);
          toast({
            title: "MFA required",
            description: `${identity.displayName} must enroll MFA on next sign-in.`,
          });
        }}
        onForceLogout={(identity) => {
          forceIdentityLogout(identity.id);
          toast({
            title: "Sessions revoked",
            description: `Active sessions cleared for ${identity.principal}.`,
          });
        }}
      />

      <OnboardIdentityDialog
        open={onboardOpen}
        onOpenChange={setOnboardOpen}
        state={onboardState}
        onChange={(updates) =>
          setOnboardState((current) => ({ ...current, ...updates }))
        }
        onSubmit={submitOnboard}
      />
    </main>
  );
}
