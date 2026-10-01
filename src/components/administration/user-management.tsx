"use client";

import { format } from "date-fns";
import {
  ArrowUpDown,
  CheckIcon,
  ChevronRight,
  CircleX,
  Ellipsis,
  ListFilter,
  type LucideIcon,
  Mail,
  MailPlus,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { ListPagination, paginateItems } from "@/components/list-pagination";
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
  DropdownMenuGroup,
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { ConfigureIdpDialog } from "./configure-idp-dialog";
import {
  AssignTeamsDialog,
  ChangeRoleDialog,
  InviteTeamsSelect,
} from "./user-admin-dialogs";
import {
  type AdministrationAccessRole,
  administrationAccessRoles,
  type AdministrationInvitation,
  administrationInviteRoles,
  administrationRoleDescriptions,
  administrationStatusColors,
  type AdministrationTeam,
  administrationTeams,
  type AdministrationUser,
  type AdministrationUserStatus,
  getAdministrationInitials,
  getAdministrationTeams,
  isAdministrationPrivilegedRole,
  isAdministrationRiskUser,
} from "./users-data";
import { useUsersSession } from "./users-session";

type UserTab = "members" | "pending";
type UserSort = "name-asc" | "name-desc" | "joined-desc" | "joined-asc";
type TwoFactorFilter = "all" | "enabled" | "disabled";
type FilterPanel = "role" | "teams" | "twoFactor" | "sort";

type InviteRole = Exclude<AdministrationAccessRole, "Owner" | "Admin">;

type InviteDraft = {
  id: string;
  email: string;
  role: InviteRole;
  teamIds: string[];
};

const mutedControlClassName =
  "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground";

const tabTriggerClassName =
  "data-[state=active]:border-foreground shrink-0 gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:pb-4";

const sortLabels: Record<UserSort, string> = {
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
  "joined-desc": "Newest first",
  "joined-asc": "Oldest first",
};

const invitationStatusDetails: Record<
  AdministrationInvitation["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-muted text-muted-foreground border-transparent",
  },
  expiring: {
    label: "Expiring soon",
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  expired: {
    label: "Expired",
    className:
      "border-destructive/30 bg-destructive/10 text-destructive dark:text-red-400",
  },
};

const statusLabels: Record<AdministrationUserStatus, string> = {
  online: "Available",
  away: "Away",
  offline: "Offline",
};

function createInviteDraft(index: number): InviteDraft {
  return {
    id: `invite-draft-${index}`,
    email: "",
    role: "Analyst",
    teamIds: [],
  };
}

function RoleBadge({ role }: { role: AdministrationAccessRole }) {
  return (
    <Badge variant="secondary" className="rounded-full font-medium">
      {role}
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
        <TooltipContent>Privileged</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function RoleCell({ role }: { role: AdministrationAccessRole }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <RoleBadge role={role} />
      {isAdministrationPrivilegedRole(role) ? <PrivilegedBadge /> : null}
    </div>
  );
}

function TeamsCell({ teams }: { teams: AdministrationTeam[] }) {
  if (teams.length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  return (
    <span className="text-muted-foreground truncate text-xs">
      {teams.map((team) => team.id).join(", ")}
    </span>
  );
}

function MfaStatus({ enabled }: { enabled: boolean }) {
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

function UserAvatar({ user }: { user: AdministrationUser }) {
  return (
    <div className="relative shrink-0">
      <Avatar className="size-9">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="text-xs font-semibold">
          {getAdministrationInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <span
        className="border-background absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2"
        style={{ backgroundColor: administrationStatusColors[user.status] }}
      >
        <span className="sr-only">{statusLabels[user.status]}</span>
      </span>
    </div>
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
        aria-label="Back to filter list"
        onClick={onBack}
      >
        <ChevronRight className="size-4 rotate-180" />
      </Button>
      <span className="ml-2 text-sm font-medium">{title}</span>
    </div>
  );
}

function UserFilterControl({
  showMemberFilters,
  roleFilters,
  teamFilters,
  twoFactorFilter,
  sort,
  activeFilterCount,
  onToggleRole,
  onToggleTeam,
  onSetTwoFactor,
  onSetSort,
  onClearFilters,
}: {
  showMemberFilters: boolean;
  roleFilters: AdministrationAccessRole[];
  teamFilters: string[];
  twoFactorFilter: TwoFactorFilter;
  sort: UserSort;
  activeFilterCount: number;
  onToggleRole: (role: AdministrationAccessRole) => void;
  onToggleTeam: (teamId: string) => void;
  onSetTwoFactor: (value: TwoFactorFilter) => void;
  onSetSort: (value: UserSort) => void;
  onClearFilters: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<FilterPanel | null>(null);
  const closePanel = () => setPanel(null);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setPanel(null);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "relative h-9 shrink-0 justify-center gap-1.5 px-2.5",
            mutedControlClassName,
          )}
        >
          <ListFilter className="size-3.5" />
          Filter
          {activeFilterCount > 0 ? (
            <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-xs font-semibold">
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
                  onSelect={() => setPanel("role")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="text-muted-foreground size-4" />
                    Access role
                  </span>
                  <div className="flex items-center">
                    {roleFilters.length > 0 ? (
                      <span className="text-muted-foreground mr-1 text-xs">
                        {roleFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>

                <CommandItem
                  onSelect={() => setPanel("teams")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Users className="text-muted-foreground size-4" />
                    Teams
                  </span>
                  <div className="flex items-center">
                    {teamFilters.length > 0 ? (
                      <span className="text-muted-foreground mr-1 text-xs">
                        {teamFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>

                {showMemberFilters ? (
                  <CommandItem
                    onSelect={() => setPanel("twoFactor")}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="text-muted-foreground size-4" />
                      MFA
                    </span>
                    <div className="flex items-center">
                      {twoFactorFilter !== "all" ? (
                        <span className="text-muted-foreground mr-1 text-xs capitalize">
                          {twoFactorFilter}
                        </span>
                      ) : null}
                      <ChevronRight className="size-4" />
                    </div>
                  </CommandItem>
                ) : null}

                <CommandItem
                  onSelect={() => setPanel("sort")}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ArrowUpDown className="text-muted-foreground size-4" />
                    Sort by
                  </span>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-1 text-xs">
                      {sortLabels[sort]}
                    </span>
                    <ChevronRight className="size-4" />
                  </div>
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
        ) : panel === "role" ? (
          <Command>
            <FilterPanelHeader title="Access role" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {administrationAccessRoles.map((role) => (
                  <CommandItem
                    key={role}
                    onSelect={() => onToggleRole(role)}
                    className="flex items-center justify-between"
                  >
                    {role}
                    {roleFilters.includes(role) ? (
                      <CheckIcon className="size-4" />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : panel === "teams" ? (
          <Command>
            <FilterPanelHeader title="Teams" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {administrationTeams.map((team) => (
                  <CommandItem
                    key={team.id}
                    onSelect={() => onToggleTeam(team.id)}
                    className="flex items-center justify-between"
                  >
                    <span className="truncate">{team.name}</span>
                    {teamFilters.includes(team.id) ? (
                      <CheckIcon className="size-4 shrink-0" />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : panel === "twoFactor" ? (
          <Command>
            <FilterPanelHeader title="MFA" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {(
                  [
                    { value: "all", label: "Any status" },
                    { value: "enabled", label: "Enabled" },
                    { value: "disabled", label: "Disabled" },
                  ] as const
                ).map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => onSetTwoFactor(option.value)}
                    className="flex items-center justify-between"
                  >
                    {option.label}
                    {twoFactorFilter === option.value ? (
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
              <CommandGroup heading="Date">
                {(["joined-desc", "joined-asc"] as const).map((option) => (
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

function MembersTable({
  users,
  selectedIds,
  onToggleUser,
  onToggleAll,
  onClearSelection,
  onChangeRole,
  onAssignTeams,
  onResetMfa,
  onRemoveAccess,
  footer,
}: {
  users: AdministrationUser[];
  selectedIds: string[];
  onToggleUser: (id: string) => void;
  onToggleAll: () => void;
  onClearSelection: () => void;
  onChangeRole: (user: AdministrationUser) => void;
  onAssignTeams: (user: AdministrationUser) => void;
  onResetMfa: (user: AdministrationUser) => void;
  onRemoveAccess: (user: AdministrationUser) => void;
  footer?: React.ReactNode;
}) {
  const router = useRouter();
  const selectedVisibleCount = users.filter((user) =>
    selectedIds.includes(user.id),
  ).length;
  const allSelected = users.length > 0 && selectedVisibleCount === users.length;
  const partiallySelected =
    selectedVisibleCount > 0 && selectedVisibleCount < users.length;
  const hasSelection = selectedVisibleCount > 0;

  return (
    <div className="bg-card overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          {hasSelection ? (
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 px-4">
                <Checkbox
                  aria-label="Select all visible members"
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
              <TableHead colSpan={6}>
                <div className="flex flex-wrap items-center gap-2 py-0.5">
                  <span className="text-foreground text-sm font-medium">
                    {selectedVisibleCount} selected
                  </span>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("h-8", mutedControlClassName)}
                    >
                      <Shield className="size-3.5" />
                      Change role
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("h-8", mutedControlClassName)}
                    >
                      <ShieldCheck className="size-3.5" />
                      Require MFA
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive h-8"
                    >
                      <Trash2 className="size-3.5" />
                      Remove
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
                  aria-label="Select all visible members"
                  checked={false}
                  onCheckedChange={onToggleAll}
                />
              </TableHead>
              <TableHead className="min-w-64">Member</TableHead>
              <TableHead className="hidden w-44 text-center md:table-cell">
                Role
              </TableHead>
              <TableHead className="hidden w-40 xl:table-cell">Teams</TableHead>
              <TableHead className="hidden w-24 lg:table-cell">MFA</TableHead>
              <TableHead className="hidden w-32 xl:table-cell">
                Last active
              </TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          )}
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const teams = getAdministrationTeams(user.teamIds);
            const risk = isAdministrationRiskUser(user);

            return (
              <TableRow
                key={user.id}
                data-state={
                  selectedIds.includes(user.id) ? "selected" : undefined
                }
                className={cn(
                  "cursor-pointer",
                  risk &&
                    !selectedIds.includes(user.id) &&
                    "bg-destructive/[0.03]",
                )}
                onClick={() =>
                  router.push(`/administration/users/${user.id}`)
                }
              >
                <TableCell
                  className="px-4"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    aria-label={`Select ${user.name}`}
                    checked={selectedIds.includes(user.id)}
                    onCheckedChange={() => onToggleUser(user.id)}
                  />
                </TableCell>

                <TableCell>
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar user={user} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {user.name}
                      </div>
                      <div className="text-muted-foreground truncate text-xs">
                        <span className="text-foreground/70">{user.title}</span>
                        <span aria-hidden="true"> · </span>
                        {user.email}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 md:hidden">
                        <RoleCell role={user.role} />
                        <MfaStatus enabled={user.twoFactorEnabled} />
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="hidden text-center md:table-cell">
                  <RoleCell role={user.role} />
                </TableCell>

                <TableCell className="hidden xl:table-cell">
                  <TeamsCell teams={teams} />
                </TableCell>

                <TableCell className="hidden lg:table-cell">
                  <MfaStatus enabled={user.twoFactorEnabled} />
                </TableCell>

                <TableCell className="text-muted-foreground hidden text-xs xl:table-cell">
                  {user.lastActiveLabel}
                </TableCell>

                <TableCell onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Open actions for ${user.name}`}
                          className="size-8"
                        >
                          <Ellipsis />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuGroup>
                          <DropdownMenuItem asChild>
                            <Link href={`/administration/users/${user.id}`}>
                              View profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => onChangeRole(user)}>
                            Change role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => onAssignTeams(user)}
                          >
                            Assign teams
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => onResetMfa(user)}>
                            Reset MFA
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={user.role === "Owner"}
                          className="text-destructive"
                          onSelect={() => onRemoveAccess(user)}
                        >
                          Remove access
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

function InvitationsTable({
  invitations,
  selectedIds,
  onToggleInvitation,
  onToggleAll,
  onClearSelection,
  onResend,
  onCopyLink,
  onRevoke,
  footer,
}: {
  invitations: AdministrationInvitation[];
  selectedIds: string[];
  onToggleInvitation: (id: string) => void;
  onToggleAll: () => void;
  onClearSelection: () => void;
  onResend: (invitation: AdministrationInvitation) => void;
  onCopyLink: (invitation: AdministrationInvitation) => void;
  onRevoke: (invitation: AdministrationInvitation) => void;
  footer?: React.ReactNode;
}) {
  const selectedVisibleCount = invitations.filter((invitation) =>
    selectedIds.includes(invitation.id),
  ).length;
  const allSelected =
    invitations.length > 0 && selectedVisibleCount === invitations.length;
  const partiallySelected =
    selectedVisibleCount > 0 && selectedVisibleCount < invitations.length;
  const hasSelection = selectedVisibleCount > 0;

  return (
    <div className="bg-card overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          {hasSelection ? (
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12 px-4">
                <Checkbox
                  aria-label="Select all visible invitations"
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
              <TableHead colSpan={6}>
                <div className="flex flex-wrap items-center gap-2 py-0.5">
                  <span className="text-foreground text-sm font-medium">
                    {selectedVisibleCount} selected
                  </span>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("h-8", mutedControlClassName)}
                    >
                      <MailPlus className="size-3.5" />
                      Resend
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive h-8"
                    >
                      <Trash2 className="size-3.5" />
                      Revoke
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
                  aria-label="Select all visible invitations"
                  checked={false}
                  onCheckedChange={onToggleAll}
                />
              </TableHead>
              <TableHead className="min-w-64">Invitee</TableHead>
              <TableHead className="hidden w-44 text-center md:table-cell">
                Role
              </TableHead>
              <TableHead className="hidden w-40 xl:table-cell">Teams</TableHead>
              <TableHead className="hidden w-36 lg:table-cell">
                Invited by
              </TableHead>
              <TableHead className="hidden w-40 xl:table-cell">Sent</TableHead>
              <TableHead className="w-40 text-right">
                <span className="sr-only">Status</span>
              </TableHead>
            </TableRow>
          )}
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
            const statusDetail = invitationStatusDetails[invitation.status];
            const teams = getAdministrationTeams(invitation.teamIds);

            return (
              <TableRow
                key={invitation.id}
                data-state={
                  selectedIds.includes(invitation.id) ? "selected" : undefined
                }
              >
                <TableCell className="px-4">
                  <Checkbox
                    aria-label={`Select invitation for ${invitation.email}`}
                    checked={selectedIds.includes(invitation.id)}
                    onCheckedChange={() => onToggleInvitation(invitation.id)}
                  />
                </TableCell>

                <TableCell>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
                      <Mail className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {invitation.email}
                      </div>
                      <div className="text-muted-foreground truncate text-xs">
                        {invitation.expiresLabel}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 md:hidden">
                        <RoleBadge role={invitation.role} />
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="hidden text-center md:table-cell">
                  <RoleBadge role={invitation.role} />
                </TableCell>

                <TableCell className="hidden xl:table-cell">
                  <TeamsCell teams={teams} />
                </TableCell>

                <TableCell className="text-muted-foreground hidden text-xs lg:table-cell">
                  {invitation.invitedBy}
                </TableCell>

                <TableCell className="text-muted-foreground hidden text-xs xl:table-cell">
                  {format(new Date(invitation.invitedDate), "MMM d, yyyy")}
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Badge
                      variant="outline"
                      className={cn("rounded-full", statusDetail.className)}
                    >
                      {statusDetail.label}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Open actions for ${invitation.email}`}
                          className="size-8"
                        >
                          <Ellipsis />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onSelect={() => onResend(invitation)}
                          >
                            Resend invitation
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => onCopyLink(invitation)}
                          >
                            Copy invite link
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => onRevoke(invitation)}
                        >
                          Revoke invitation
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

function InviteDialog({
  open,
  onOpenChange,
  drafts,
  onAddDraft,
  onRemoveDraft,
  onChangeDraft,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drafts: InviteDraft[];
  onAddDraft: () => void;
  onRemoveDraft: (id: string) => void;
  onChangeDraft: (id: string, updates: Partial<InviteDraft>) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invite users</DialogTitle>
          <DialogDescription>
            Send workspace invitations by email and assign starting teams. Each
            invite expires after seven days.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {drafts.map((draft, index) => (
            <div
              key={draft.id}
              className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_140px_minmax(160px,1fr)_auto] sm:items-end"
            >
              <Field className="gap-2">
                {index === 0 ? (
                  <FieldLabel htmlFor={`invite-email-${draft.id}`}>
                    Email address
                  </FieldLabel>
                ) : null}
                <InputGroup>
                  <InputGroupAddon>
                    <Mail />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={`invite-email-${draft.id}`}
                    type="email"
                    value={draft.email}
                    placeholder="analyst@svalbard.ca"
                    onChange={(event) =>
                      onChangeDraft(draft.id, { email: event.target.value })
                    }
                  />
                </InputGroup>
              </Field>

              <Field className="gap-2">
                {index === 0 ? <FieldLabel>Access role</FieldLabel> : null}
                <Select
                  value={draft.role}
                  onValueChange={(value) =>
                    onChangeDraft(draft.id, { role: value as InviteRole })
                  }
                >
                  <SelectTrigger className="h-9 w-full shadow-none">
                    <SelectValue>{draft.role}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {administrationInviteRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex flex-col gap-0.5">
                            <span>{role}</span>
                            <span className="text-muted-foreground text-xs">
                              {administrationRoleDescriptions[role]}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field className="gap-2">
                {index === 0 ? <FieldLabel>Teams</FieldLabel> : null}
                <InviteTeamsSelect
                  value={draft.teamIds}
                  onValueChange={(teamIds) =>
                    onChangeDraft(draft.id, { teamIds })
                  }
                />
              </Field>

              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove this invite row"
                className="text-muted-foreground hidden size-9 sm:inline-flex"
                disabled={drafts.length === 1}
                onClick={() => onRemoveDraft(draft.id)}
              >
                <X />
              </Button>
            </div>
          ))}

          <div>
            <Button
              variant="outline"
              size="sm"
              className={cn("h-9", mutedControlClassName)}
              onClick={onAddDraft}
            >
              <Plus className="size-3.5" />
              Add another
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            <MailPlus className="size-4" />
            Send invitations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdministrationUserManagement() {
  const {
    users: administrationUsers,
    invitations: administrationInvitations,
    updateUserRole,
    updateUserTeams,
    suspendUsers,
    removeUserAccess,
    resetUserMfa,
    addInvitations,
    revokeInvitation,
    resendInvitation,
  } = useUsersSession();
  const [activeTab, setActiveTab] = useState<UserTab>("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilters, setRoleFilters] = useState<AdministrationAccessRole[]>(
    [],
  );
  const [teamFilters, setTeamFilters] = useState<string[]>([]);
  const [twoFactorFilter, setTwoFactorFilter] =
    useState<TwoFactorFilter>("all");
  const [sort, setSort] = useState<UserSort>("name-asc");
  const [riskUsersOnly, setRiskUsersOnly] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedInviteIds, setSelectedInviteIds] = useState<string[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [idpOpen, setIdpOpen] = useState(false);
  const [inviteDrafts, setInviteDrafts] = useState<InviteDraft[]>([
    createInviteDraft(1),
  ]);
  const [roleDialogUser, setRoleDialogUser] =
    useState<AdministrationUser | null>(null);
  const [draftRole, setDraftRole] =
    useState<AdministrationAccessRole>("Analyst");
  const [teamsDialogUser, setTeamsDialogUser] =
    useState<AdministrationUser | null>(null);
  const [draftTeamIds, setDraftTeamIds] = useState<string[]>([]);
  const [mfaDialogUser, setMfaDialogUser] = useState<AdministrationUser | null>(
    null,
  );
  const [removeDialogUser, setRemoveDialogUser] =
    useState<AdministrationUser | null>(null);
  const [memberPage, setMemberPage] = useState(1);
  const [memberPageSize, setMemberPageSize] = useState(25);
  const [invitePage, setInvitePage] = useState(1);
  const [invitePageSize, setInvitePageSize] = useState(25);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

  const visibleUsers = useMemo(() => {
    return administrationUsers
      .filter((user) => {
        const matchesRole =
          roleFilters.length === 0 || roleFilters.includes(user.role);
        const matchesTeam =
          teamFilters.length === 0 ||
          user.teamIds.some((teamId) => teamFilters.includes(teamId));
        const matchesTwoFactor =
          twoFactorFilter === "all" ||
          (twoFactorFilter === "enabled" && user.twoFactorEnabled) ||
          (twoFactorFilter === "disabled" && !user.twoFactorEnabled);
        const matchesRisk = !riskUsersOnly || isAdministrationRiskUser(user);
        const matchesSearch =
          !normalizedQuery ||
          [user.name, user.email, user.title, user.role, ...user.teamIds]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

        return (
          matchesRole &&
          matchesTeam &&
          matchesTwoFactor &&
          matchesRisk &&
          matchesSearch
        );
      })
      .sort((a, b) => {
        switch (sort) {
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "joined-asc":
            return (
              new Date(a.joinedDate).getTime() -
              new Date(b.joinedDate).getTime()
            );
          case "joined-desc":
            return (
              new Date(b.joinedDate).getTime() -
              new Date(a.joinedDate).getTime()
            );
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [
    administrationUsers,
    normalizedQuery,
    riskUsersOnly,
    roleFilters,
    sort,
    teamFilters,
    twoFactorFilter,
  ]);

  const visibleInvitations = useMemo(() => {
    return administrationInvitations
      .filter((invitation) => {
        const matchesRole =
          roleFilters.length === 0 || roleFilters.includes(invitation.role);
        const matchesTeam =
          teamFilters.length === 0 ||
          invitation.teamIds.some((teamId) => teamFilters.includes(teamId));
        const matchesSearch =
          !normalizedQuery ||
          [
            invitation.email,
            invitation.role,
            invitation.invitedBy,
            ...invitation.teamIds,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

        return matchesRole && matchesTeam && matchesSearch;
      })
      .sort((a, b) => {
        switch (sort) {
          case "name-desc":
            return b.email.localeCompare(a.email);
          case "joined-asc":
            return (
              new Date(a.invitedDate).getTime() -
              new Date(b.invitedDate).getTime()
            );
          case "joined-desc":
            return (
              new Date(b.invitedDate).getTime() -
              new Date(a.invitedDate).getTime()
            );
          default:
            return a.email.localeCompare(b.email);
        }
      });
  }, [administrationInvitations, normalizedQuery, roleFilters, sort, teamFilters]);

  useEffect(() => {
    setMemberPage(1);
  }, [
    normalizedQuery,
    riskUsersOnly,
    roleFilters,
    sort,
    teamFilters,
    twoFactorFilter,
    memberPageSize,
  ]);

  useEffect(() => {
    setInvitePage(1);
  }, [normalizedQuery, roleFilters, sort, teamFilters, invitePageSize]);

  const pagedUsers = useMemo(
    () => paginateItems(visibleUsers, memberPage, memberPageSize),
    [visibleUsers, memberPage, memberPageSize],
  );

  const pagedInvitations = useMemo(
    () => paginateItems(visibleInvitations, invitePage, invitePageSize),
    [visibleInvitations, invitePage, invitePageSize],
  );

  const activeFilterCount =
    roleFilters.length +
    teamFilters.length +
    (twoFactorFilter === "all" ? 0 : 1) +
    (sort === "name-asc" ? 0 : 1);

  const onMembersTab = activeTab === "members";

  const resetFilters = () => {
    setRoleFilters([]);
    setTeamFilters([]);
    setTwoFactorFilter("all");
    setSort("name-asc");
    setSearchQuery("");
    setRiskUsersOnly(false);
  };

  const toggleRoleFilter = (role: AdministrationAccessRole) => {
    setRoleFilters((current) =>
      current.includes(role)
        ? current.filter((entry) => entry !== role)
        : [...current, role],
    );
  };

  const toggleTeamFilter = (teamId: string) => {
    setTeamFilters((current) =>
      current.includes(teamId)
        ? current.filter((entry) => entry !== teamId)
        : [...current, teamId],
    );
  };

  const toggleSelection = (
    setSelection: React.Dispatch<React.SetStateAction<string[]>>,
    id: string,
  ) => {
    setSelection((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  };

  const toggleAllSelection = (
    setSelection: React.Dispatch<React.SetStateAction<string[]>>,
    visibleIds: string[],
  ) => {
    setSelection((current) => {
      const allSelected = visibleIds.every((id) => current.includes(id));

      if (allSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const addInviteDraft = () => {
    setInviteDrafts((current) => [
      ...current,
      createInviteDraft(current.length + 1),
    ]);
  };

  const removeInviteDraft = (id: string) => {
    setInviteDrafts((current) =>
      current.length === 1 ? current : current.filter((row) => row.id !== id),
    );
  };

  const updateInviteDraft = (id: string, updates: Partial<InviteDraft>) => {
    setInviteDrafts((current) =>
      current.map((row) => (row.id === id ? { ...row, ...updates } : row)),
    );
  };

  const sendInvitations = () => {
    const drafts = inviteDrafts
      .map((draft) => ({
        email: draft.email.trim(),
        role: draft.role,
        teamIds: draft.teamIds,
      }))
      .filter((draft) => draft.email.length > 0);

    if (drafts.length === 0) {
      toast({
        title: "Add an email address",
        description: "Enter at least one email before sending invitations.",
        variant: "destructive",
      });
      return;
    }

    addInvitations(drafts);
    toast({
      title: `${drafts.length} invitation${drafts.length === 1 ? "" : "s"} sent`,
      description: "Invitees will appear under Pending invitations.",
    });

    setInviteDrafts([createInviteDraft(1)]);
    setInviteOpen(false);
    setActiveTab("pending");
  };

  const resendInvitationAction = (invitation: AdministrationInvitation) => {
    resendInvitation(invitation.id);
    toast({
      title: "Invitation resent",
      description: `A new invite link was emailed to ${invitation.email}.`,
    });
  };

  const copyInviteLink = (invitation: AdministrationInvitation) => {
    const inviteLink = `https://app.svalbard.ca/invite/${invitation.id}`;

    void navigator.clipboard?.writeText(inviteLink).catch(() => {});

    toast({
      title: "Invite link copied",
      description: `The invite link for ${invitation.email} was copied to your clipboard.`,
    });
  };

  const revokeInvitationAction = (invitation: AdministrationInvitation) => {
    revokeInvitation(invitation.id);
    toast({
      title: "Invitation revoked",
      description: `${invitation.email} can no longer join the workspace.`,
      variant: "destructive",
    });
  };

  const bulkSuspend = () => {
    if (selectedUserIds.length === 0) {
      toast({
        title: "Select users first",
        description: "Choose one or more members to suspend.",
        variant: "destructive",
      });
      return;
    }

    const count = suspendUsers(selectedUserIds);
    toast({
      title: `${count} user${count === 1 ? "" : "s"} suspended`,
      description: "Selected accounts can no longer sign in.",
      variant: "destructive",
    });
    setSelectedUserIds([]);
  };

  const openChangeRole = (user: AdministrationUser) => {
    setRoleDialogUser(user);
    setDraftRole(user.role);
  };

  const openAssignTeams = (user: AdministrationUser) => {
    setTeamsDialogUser(user);
    setDraftTeamIds(user.teamIds);
  };

  const saveRole = () => {
    if (!roleDialogUser) {
      return;
    }

    updateUserRole(roleDialogUser.id, draftRole);
    toast({
      title: "Role updated",
      description: `${roleDialogUser.name} is now a ${draftRole}.`,
    });
    setRoleDialogUser(null);
  };

  const saveTeams = () => {
    if (!teamsDialogUser) {
      return;
    }

    updateUserTeams(teamsDialogUser.id, draftTeamIds);
    const teamNames = getAdministrationTeams(draftTeamIds)
      .map((team) => team.name)
      .join(", ");

    toast({
      title: "Teams updated",
      description:
        draftTeamIds.length > 0
          ? `${teamsDialogUser.name} assigned to ${teamNames}.`
          : `${teamsDialogUser.name} has no teams assigned.`,
    });
    setTeamsDialogUser(null);
  };

  const confirmResetMfa = () => {
    if (!mfaDialogUser) {
      return;
    }

    resetUserMfa(mfaDialogUser.id);
    toast({
      title: "MFA reset",
      description: `${mfaDialogUser.name} must re-enroll MFA on next sign-in.`,
    });
    setMfaDialogUser(null);
  };

  const confirmRemoveAccess = () => {
    if (!removeDialogUser) {
      return;
    }

    removeUserAccess(removeDialogUser.id);
    toast({
      title: "Access removed",
      description: `${removeDialogUser.name} can no longer access the workspace.`,
      variant: "destructive",
    });
    setRemoveDialogUser(null);
  };

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="bg-background shrink-0 border-b">
        <div className="flex flex-col gap-2 px-4 py-3 sm:px-6 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2">
          <div className="min-w-0 flex-1">
            <InputGroup className="h-9 w-full lg:max-w-sm">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={searchQuery}
                placeholder={
                  onMembersTab
                    ? "Search members, teams, roles..."
                    : "Search invitations..."
                }
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </InputGroup>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
            {onMembersTab ? (
              <>
                <label className="border-border bg-background hover:bg-accent flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm">
                  <Switch
                    checked={riskUsersOnly}
                    onCheckedChange={setRiskUsersOnly}
                    aria-label="Show risk users only"
                  />
                  <span className="whitespace-nowrap">Risk users</span>
                </label>

                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 gap-1.5",
                    mutedControlClassName,
                    selectedUserIds.length === 0 && "opacity-60",
                  )}
                  disabled={selectedUserIds.length === 0}
                  onClick={bulkSuspend}
                >
                  <UserX className="size-3.5" />
                  Bulk suspend
                </Button>
              </>
            ) : null}

            <UserFilterControl
              showMemberFilters={onMembersTab}
              roleFilters={roleFilters}
              teamFilters={teamFilters}
              twoFactorFilter={twoFactorFilter}
              sort={sort}
              activeFilterCount={activeFilterCount}
              onToggleRole={toggleRoleFilter}
              onToggleTeam={toggleTeamFilter}
              onSetTwoFactor={setTwoFactorFilter}
              onSetSort={setSort}
              onClearFilters={resetFilters}
            />

            <Button
              size="sm"
              variant="outline"
              className={cn("h-9 gap-1.5", mutedControlClassName)}
              onClick={() => setIdpOpen(true)}
            >
              <Shield className="size-3.5" />
              <span className="hidden sm:inline">Configure IdP</span>
              <span className="sm:hidden">IdP</span>
            </Button>

            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setInviteOpen(true)}
            >
              <UserPlus className="size-3.5" />
              <span className="hidden sm:inline">Invite users</span>
              <span className="sm:hidden">Invite</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-6">
        <div className="mx-auto flex w-full flex-col gap-4">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as UserTab)}
            className="flex flex-col gap-4"
          >
            <div className="overflow-x-auto border-b">
              <TabsList className="inline-flex h-auto min-w-max justify-start gap-7 rounded-none bg-transparent p-0 sm:gap-8">
                <TabsTrigger value="members" className={tabTriggerClassName}>
                  Team Members
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {administrationUsers.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="pending" className={tabTriggerClassName}>
                  Pending Invitations
                  <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-xs">
                    {administrationInvitations.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="members" className="mt-0">
              {visibleUsers.length > 0 ? (
                <MembersTable
                  users={pagedUsers}
                  selectedIds={selectedUserIds}
                  onToggleUser={(id) => toggleSelection(setSelectedUserIds, id)}
                  onToggleAll={() =>
                    toggleAllSelection(
                      setSelectedUserIds,
                      pagedUsers.map((user) => user.id),
                    )
                  }
                  onClearSelection={() => setSelectedUserIds([])}
                  onChangeRole={openChangeRole}
                  onAssignTeams={openAssignTeams}
                  onResetMfa={setMfaDialogUser}
                  onRemoveAccess={setRemoveDialogUser}
                  footer={
                    <ListPagination
                      page={memberPage}
                      pageSize={memberPageSize}
                      total={visibleUsers.length}
                      onPageChange={setMemberPage}
                      onPageSizeChange={setMemberPageSize}
                    />
                  }
                />
              ) : (
                <EmptyState
                  icon={riskUsersOnly ? ShieldAlert : UserPlus}
                  title={
                    riskUsersOnly
                      ? "No risk users match the current filters"
                      : "No members match the current filters"
                  }
                  description={
                    riskUsersOnly
                      ? "Risk users are accounts without MFA enabled."
                      : "Adjust the search or filters to bring team members back into view."
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

            <TabsContent value="pending" className="mt-0">
              {visibleInvitations.length > 0 ? (
                <InvitationsTable
                  invitations={pagedInvitations}
                  selectedIds={selectedInviteIds}
                  onToggleInvitation={(id) =>
                    toggleSelection(setSelectedInviteIds, id)
                  }
                  onToggleAll={() =>
                    toggleAllSelection(
                      setSelectedInviteIds,
                      pagedInvitations.map((invitation) => invitation.id),
                    )
                  }
                  onClearSelection={() => setSelectedInviteIds([])}
                  onResend={resendInvitationAction}
                  onCopyLink={copyInviteLink}
                  onRevoke={revokeInvitationAction}
                  footer={
                    <ListPagination
                      page={invitePage}
                      pageSize={invitePageSize}
                      total={visibleInvitations.length}
                      onPageChange={setInvitePage}
                      onPageSizeChange={setInvitePageSize}
                    />
                  }
                />
              ) : (
                <EmptyState
                  icon={MailPlus}
                  title="No pending invitations"
                  description="Everyone you invited has already joined, or no invites match the current filters."
                  action={
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => setInviteOpen(true)}
                    >
                      <UserPlus className="size-3.5" />
                      Invite users
                    </Button>
                  }
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        drafts={inviteDrafts}
        onAddDraft={addInviteDraft}
        onRemoveDraft={removeInviteDraft}
        onChangeDraft={updateInviteDraft}
        onSubmit={sendInvitations}
      />

      <ChangeRoleDialog
        open={roleDialogUser !== null}
        user={roleDialogUser}
        role={draftRole}
        onRoleChange={setDraftRole}
        onOpenChange={(open) => {
          if (!open) {
            setRoleDialogUser(null);
          }
        }}
        onSubmit={saveRole}
      />

      <AssignTeamsDialog
        open={teamsDialogUser !== null}
        user={teamsDialogUser}
        teamIds={draftTeamIds}
        onTeamIdsChange={setDraftTeamIds}
        onOpenChange={(open) => {
          if (!open) {
            setTeamsDialogUser(null);
          }
        }}
        onSubmit={saveTeams}
      />

      <ConfirmDialog
        open={mfaDialogUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setMfaDialogUser(null);
          }
        }}
        title="Reset MFA?"
        desc={
          mfaDialogUser
            ? `This will invalidate MFA factors for ${mfaDialogUser.name} and require re-enrollment on the next sign-in.`
            : ""
        }
        confirmText="Reset MFA"
        handleConfirm={confirmResetMfa}
      />

      <ConfirmDialog
        open={removeDialogUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRemoveDialogUser(null);
          }
        }}
        title="Remove access?"
        desc={
          removeDialogUser
            ? `${removeDialogUser.name} will lose access to the security workspace immediately.`
            : ""
        }
        confirmText="Remove access"
        destructive
        handleConfirm={confirmRemoveAccess}
      />

      <ConfigureIdpDialog open={idpOpen} onOpenChange={setIdpOpen} />
    </main>
  );
}
