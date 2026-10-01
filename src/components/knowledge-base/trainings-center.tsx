"use client";

import {
  CheckIcon,
  ChevronRight,
  Ellipsis,
  GraduationCap,
  ListFilter,
  Plus,
  RefreshCw,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import {
  type AdministrationUser,
  administrationUsers,
} from "@/components/administration/users-data";
import { ListPagination, paginateItems } from "@/components/list-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trainingsApi } from "@/lib/mock-api/trainings";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  getKbInitials,
  type KbTraining,
  type KbTrainingLevel,
  kbTrainingLevelLabels,
  type KbTrainingStatus,
  kbTrainingStatusLabels,
  trainingCompletionPercent,
} from "./knowledge-base-data";
import {
  EmptyState,
  KbStatsStrip,
  mutedControlClassName,
  OwnerCell,
  percentTextClass,
  ProgressTrack,
  RelatedLinks,
  TrainingLevelBadge,
  TrainingStatusBadge,
} from "./knowledge-base-primitives";
import { useTrainingsSession } from "./trainings-session";

type FilterPanel = "level" | "status" | "sort";

type TrainingSort =
  | "completion-asc"
  | "completion-desc"
  | "title-asc"
  | "enrolled-desc";

const sortLabels: Record<TrainingSort, string> = {
  "completion-asc": "Completion · lowest first",
  "completion-desc": "Completion · highest first",
  "title-asc": "Title A–Z",
  "enrolled-desc": "Most enrolled",
};

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
        className="h-7 gap-1 px-2 text-xs"
        onClick={onBack}
      >
        <ChevronRight className="size-3.5 rotate-180" />
        {title}
      </Button>
    </div>
  );
}

function TrainingFilterControl({
  levelFilters,
  statusFilters,
  sort,
  activeFilterCount,
  onToggleLevel,
  onToggleStatus,
  onSetSort,
  onClearFilters,
}: {
  levelFilters: KbTrainingLevel[];
  statusFilters: KbTrainingStatus[];
  sort: TrainingSort;
  activeFilterCount: number;
  onToggleLevel: (level: KbTrainingLevel) => void;
  onToggleStatus: (status: KbTrainingStatus) => void;
  onSetSort: (sort: TrainingSort) => void;
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
        if (!next) setPanel(null);
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
                  onSelect={() => setPanel("level")}
                  className="flex items-center justify-between"
                >
                  <span>Level</span>
                  <div className="flex items-center">
                    {levelFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {levelFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPanel("status")}
                  className="flex items-center justify-between"
                >
                  <span>Status</span>
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
                  onSelect={() => setPanel("sort")}
                  className="flex items-center justify-between"
                >
                  <span>Sort by</span>
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
        ) : panel === "level" ? (
          <Command>
            <FilterPanelHeader title="Level" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {(Object.keys(kbTrainingLevelLabels) as KbTrainingLevel[]).map(
                  (level) => (
                    <CommandItem
                      key={level}
                      onSelect={() => onToggleLevel(level)}
                      className="flex items-center justify-between"
                    >
                      {kbTrainingLevelLabels[level]}
                      {levelFilters.includes(level) ? (
                        <CheckIcon className="size-4" />
                      ) : null}
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : panel === "status" ? (
          <Command>
            <FilterPanelHeader title="Status" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {(
                  Object.keys(kbTrainingStatusLabels) as KbTrainingStatus[]
                ).map((status) => (
                  <CommandItem
                    key={status}
                    onSelect={() => onToggleStatus(status)}
                    className="flex items-center justify-between"
                  >
                    {kbTrainingStatusLabels[status]}
                    {statusFilters.includes(status) ? (
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
              <CommandGroup>
                {(Object.keys(sortLabels) as TrainingSort[]).map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      onSetSort(option);
                      closePanel();
                    }}
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

function AssignUsersDialog({
  open,
  training,
  trainings,
  onOpenChange,
  onAssign,
}: {
  open: boolean;
  training: KbTraining | null;
  trainings: KbTraining[];
  onOpenChange: (open: boolean) => void;
  onAssign: (trainingId: string, users: AdministrationUser[]) => void;
}) {
  const [trainingId, setTrainingId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const deferredUserSearch = useDeferredValue(userSearch);

  useEffect(() => {
    if (!open) return;
    setTrainingId(training?.id ?? trainings[0]?.id ?? "");
    setUserSearch("");
    setSelectedIds([]);
  }, [open, training, trainings]);

  const visibleUsers = useMemo(() => {
    const normalized = deferredUserSearch.trim().toLowerCase();
    return administrationUsers.filter((user) => {
      if (!normalized) return true;
      return [user.name, user.email, user.title, user.role]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [deferredUserSearch]);

  const toggleUser = (userId: string) => {
    setSelectedIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = visibleUsers.map((user) => user.id);
    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }
    setSelectedIds((current) =>
      Array.from(new Set([...current, ...visibleIds])),
    );
  };

  const selectedUsers = administrationUsers.filter((user) =>
    selectedIds.includes(user.id),
  );

  const activeTraining =
    trainings.find((item) => item.id === trainingId) ?? training;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="space-y-1.5 border-b px-5 py-4 text-left">
          <DialogTitle>Assign users</DialogTitle>
          <DialogDescription>
            Select teammates to enroll in this training course.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 border-b px-5 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="assign-training">Training</Label>
            <Select value={trainingId} onValueChange={setTrainingId}>
              <SelectTrigger id="assign-training" className="w-full">
                <SelectValue placeholder="Select a training" />
              </SelectTrigger>
              <SelectContent>
                {trainings.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.code} · {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <InputGroup className="h-9 w-full">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={userSearch}
              placeholder="Search users by name, role, email..."
              onChange={(event) => setUserSearch(event.target.value)}
            />
          </InputGroup>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium"
              onClick={toggleAllVisible}
            >
              {visibleUsers.length > 0 &&
              visibleUsers.every((user) => selectedIds.includes(user.id))
                ? "Clear visible"
                : "Select visible"}
            </button>
            <p className="text-muted-foreground text-xs tabular-nums">
              {selectedIds.length} selected
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {visibleUsers.length === 0 ? (
            <p className="text-muted-foreground px-3 py-8 text-center text-sm">
              No users match your search.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {visibleUsers.map((user) => {
                const checked = selectedIds.includes(user.id);
                return (
                  <li key={user.id}>
                    <label
                      className={cn(
                        "hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors",
                        checked && "bg-muted/40",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleUser(user.id)}
                        aria-label={`Select ${user.name}`}
                      />
                      <Avatar className="size-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {getKbInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {user.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {user.title} · {user.role}
                        </p>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="border-t px-5 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!activeTraining || selectedUsers.length === 0}
            onClick={() => {
              if (!activeTraining || selectedUsers.length === 0) return;
              onAssign(activeTraining.id, selectedUsers);
              onOpenChange(false);
            }}
          >
            Assign {selectedUsers.length > 0 ? selectedUsers.length : ""}{" "}
            {selectedUsers.length === 1 ? "user" : "users"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TrainingCard({
  training,
  onOpen,
  onEnroll,
  onAssign,
  onMarkComplete,
}: {
  training: KbTraining;
  onOpen: (training: KbTraining) => void;
  onEnroll: (training: KbTraining) => void;
  onAssign: (training: KbTraining) => void;
  onMarkComplete: (training: KbTraining) => void;
}) {
  const percent = trainingCompletionPercent(training);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(training)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(training);
        }
      }}
      className="border-border/70 bg-card group flex cursor-pointer flex-col overflow-hidden rounded-xl border shadow-none transition-colors hover:border-zinc-300 dark:hover:border-white/16"
    >
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
            <GraduationCap className="size-4" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={(event) => event.stopPropagation()}
                aria-label="Training actions"
              >
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onEnroll(training);
                }}
              >
                Enroll
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onAssign(training);
                }}
              >
                <UserPlus className="size-3.5" />
                Assign teammates
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onMarkComplete(training);
                }}
              >
                Mark complete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/administration/users"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open users
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="min-w-0 space-y-1">
          <p className="text-muted-foreground font-mono text-xs tracking-wide">
            {training.code}
          </p>
          <h3 className="line-clamp-2 text-sm leading-snug font-semibold">
            {training.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {training.summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TrainingLevelBadge level={training.level} />
          <TrainingStatusBadge status={training.status} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-muted-foreground text-xs">
              {training.completed}/{training.enrolled} complete
            </span>
            <span
              className={cn(
                "text-xs font-medium tabular-nums",
                percentTextClass(percent),
              )}
            >
              {percent}%
            </span>
          </div>
          <ProgressTrack percent={percent} />
        </div>

        <RelatedLinks links={training.related} />
      </div>

      <div className="border-border/70 mt-auto flex items-center justify-between gap-3 border-t px-4 py-3">
        <OwnerCell
          userId={training.ownerId}
          href={`/administration/users/${training.ownerId}`}
        />
        <div className="text-muted-foreground flex shrink-0 flex-col items-end gap-0.5 text-xs">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" />
            {training.enrolled}
          </span>
          <span>{training.dueLabel}</span>
        </div>
      </div>
    </article>
  );
}

export function TrainingsCenter() {
  const {
    trainings,
    stats,
    lmsConnected,
    lastLmsSyncAt,
    enroll,
    complete,
    create,
    upsert,
  } = useTrainingsSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilters, setLevelFilters] = useState<KbTrainingLevel[]>([]);
  const [statusFilters, setStatusFilters] = useState<KbTrainingStatus[]>([]);
  const [sort, setSort] = useState<TrainingSort>("completion-asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selected, setSelected] = useState<KbTraining | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLevel, setNewLevel] = useState<KbTrainingLevel>("foundation");
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTraining, setAssignTraining] = useState<KbTraining | null>(null);
  const [lmsBusy, setLmsBusy] = useState(false);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const activeFilterCount =
    levelFilters.length +
    statusFilters.length +
    (sort !== "completion-asc" ? 1 : 0);

  const toggleLevel = (level: KbTrainingLevel) => {
    setLevelFilters((current) =>
      current.includes(level)
        ? current.filter((value) => value !== level)
        : [...current, level],
    );
  };

  const toggleStatus = (status: KbTrainingStatus) => {
    setStatusFilters((current) =>
      current.includes(status)
        ? current.filter((value) => value !== status)
        : [...current, status],
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setLevelFilters([]);
    setStatusFilters([]);
    setSort("completion-asc");
  };

  const patchTraining = (
    id: string,
    updater: (training: KbTraining) => KbTraining,
  ) => {
    const current = trainings.find((t) => t.id === id);
    if (!current) return;
    const next = updater(current);
    upsert(next);
    setSelected((sel) => (sel && sel.id === id ? next : sel));
  };

  const enrollTraining = (training: KbTraining) => {
    const next = enroll(training.id);
    if (next) setSelected((sel) => (sel?.id === training.id ? next : sel));
    toast({
      title: "Enrolled",
      description: `You were added to ${training.code}.`,
    });
  };

  const markComplete = (training: KbTraining) => {
    if (training.completed >= training.enrolled) {
      toast({
        title: "Already complete",
        description: `${training.code} has no remaining seats to complete.`,
      });
      return;
    }
    const next = complete(training.id);
    if (next) setSelected((sel) => (sel?.id === training.id ? next : sel));
    toast({
      title: "Marked complete",
      description: training.code,
    });
  };

  const handleLmsSync = async () => {
    setLmsBusy(true);
    try {
      if (!lmsConnected) {
        await trainingsApi.connectLms();
      }
      const { updated, receipt } = await trainingsApi.syncLms();
      toast({
        title: "LMS sync complete",
        description: `${updated} courses · ${receipt.message}`,
      });
    } finally {
      setLmsBusy(false);
    }
  };

  const openAssign = (training?: KbTraining | null) => {
    setAssignTraining(training ?? selected ?? trainings[0] ?? null);
    setAssignOpen(true);
  };

  const assignUsers = (trainingId: string, users: AdministrationUser[]) => {
    if (users.length === 0) return;
    patchTraining(trainingId, (current) => ({
      ...current,
      enrolled: current.enrolled + users.length,
      status:
        current.status === "open" || current.status === "completed"
          ? "in-progress"
          : current.status,
      updatedAt: new Date().toISOString().slice(0, 10),
    }));
    const target = trainings.find((item) => item.id === trainingId);
    const names = users
      .slice(0, 2)
      .map((user) => user.name)
      .join(", ");
    const overflow = users.length > 2 ? ` +${users.length - 2} more` : "";
    toast({
      title: "Users assigned",
      description: `${names}${overflow} enrolled in ${target?.code ?? "training"}.`,
    });
  };

  const submitNewTraining = () => {
    const title = newTitle.trim();
    if (!title) {
      toast({
        title: "Title required",
        description: "Enter a training title to create a course.",
      });
      return;
    }
    const created = create({
      title,
      summary: `Open course for ${title}. Add modules and assign seats when ready.`,
      level: newLevel,
    });
    setNewOpen(false);
    setNewTitle("");
    setNewLevel("foundation");
    setSelected(created);
    toast({
      title: "Course draft created",
      description: created.code,
    });
  };

  const visibleTrainings = useMemo(() => {
    const normalized = deferredSearchQuery.trim().toLowerCase();

    return trainings
      .filter((training) => {
        if (
          levelFilters.length > 0 &&
          !levelFilters.includes(training.level)
        ) {
          return false;
        }
        if (
          statusFilters.length > 0 &&
          !statusFilters.includes(training.status)
        ) {
          return false;
        }
        if (!normalized) return true;

        return [
          training.code,
          training.title,
          training.summary,
          training.tags.join(" "),
          kbTrainingLevelLabels[training.level],
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .sort((a, b) => {
        if (sort === "title-asc") return a.title.localeCompare(b.title);
        if (sort === "enrolled-desc") return b.enrolled - a.enrolled;
        const aPct = trainingCompletionPercent(a);
        const bPct = trainingCompletionPercent(b);
        if (sort === "completion-desc") return bPct - aPct;
        return aPct - bPct;
      });
  }, [deferredSearchQuery, levelFilters, sort, statusFilters, trainings]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearchQuery, levelFilters, statusFilters, sort, pageSize]);

  const pageCount = Math.max(1, Math.ceil(visibleTrainings.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedTrainings = paginateItems(visibleTrainings, safePage, pageSize);

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
                placeholder="Search trainings, tags, owners..."
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </InputGroup>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
            <TrainingFilterControl
              levelFilters={levelFilters}
              statusFilters={statusFilters}
              sort={sort}
              activeFilterCount={activeFilterCount}
              onToggleLevel={toggleLevel}
              onToggleStatus={toggleStatus}
              onSetSort={setSort}
              onClearFilters={resetFilters}
            />
            <Button
              variant="outline"
              size="sm"
              className={cn("h-9 gap-1.5", mutedControlClassName)}
              onClick={() => openAssign()}
            >
              <Users className="size-3.5" />
              <span className="hidden sm:inline">Assign users</span>
              <span className="sm:hidden">Assign</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn("h-9 gap-1.5", mutedControlClassName)}
              disabled={lmsBusy}
              onClick={() => void handleLmsSync()}
            >
              <RefreshCw
                className={cn("size-3.5", lmsBusy && "animate-spin")}
              />
              <span className="hidden sm:inline">
                {lmsConnected ? "Sync LMS" : "Connect LMS"}
              </span>
              <span className="sm:hidden">LMS</span>
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setNewOpen(true)}
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">New training</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
        {lmsConnected || lastLmsSyncAt ? (
          <p className="text-muted-foreground px-4 pb-2 text-xs sm:px-6">
            Workday Learning
            {lmsConnected ? " connected" : ""}
            {lastLmsSyncAt
              ? ` · last sync ${new Date(lastLmsSyncAt).toLocaleString()}`
              : ""}
          </p>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full flex-col gap-4">
          <KbStatsStrip stats={stats} />

          {pagedTrainings.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No trainings match"
              description="Clear level or status filters to browse the full training catalog."
              action={
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset filters
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {pagedTrainings.map((training) => (
                <TrainingCard
                  key={training.id}
                  training={training}
                  onOpen={setSelected}
                  onEnroll={enrollTraining}
                  onAssign={openAssign}
                  onMarkComplete={markComplete}
                />
              ))}
            </div>
          )}

          {visibleTrainings.length > 0 ? (
            <ListPagination
              page={safePage}
              pageSize={pageSize}
              total={visibleTrainings.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[12, 24, 48]}
            />
          ) : null}
        </div>
      </div>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New training</DialogTitle>
            <DialogDescription>
              Create a course draft and assign seats when modules are ready.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="training-title">Title</Label>
              <Input
                id="training-title"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Course title"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Level</Label>
              <Select
                value={newLevel}
                onValueChange={(value) =>
                  setNewLevel(value as KbTrainingLevel)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(kbTrainingLevelLabels) as KbTrainingLevel[]
                  ).map((level) => (
                    <SelectItem key={level} value={level}>
                      {kbTrainingLevelLabels[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitNewTraining}>Create course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AssignUsersDialog
        open={assignOpen}
        training={assignTraining}
        trainings={trainings}
        onOpenChange={setAssignOpen}
        onAssign={assignUsers}
      />

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="pr-8">{selected.title}</SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {selected.code}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {selected.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  <TrainingLevelBadge level={selected.level} />
                  <TrainingStatusBadge status={selected.status} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">
                      {selected.completed}/{selected.enrolled} complete
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium tabular-nums",
                        percentTextClass(trainingCompletionPercent(selected)),
                      )}
                    >
                      {trainingCompletionPercent(selected)}%
                    </span>
                  </div>
                  <ProgressTrack
                    percent={trainingCompletionPercent(selected)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Duration</p>
                    <p className="font-medium tabular-nums">
                      {selected.durationMinutes} min
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Due</p>
                    <p className="font-medium">{selected.dueLabel}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Owner
                  </p>
                  <OwnerCell
                    userId={selected.ownerId}
                    href={`/administration/users/${selected.ownerId}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Related
                  </p>
                  <RelatedLinks links={selected.related} />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" onClick={() => enrollTraining(selected)}>
                    Enroll
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("gap-1.5", mutedControlClassName)}
                    onClick={() => openAssign(selected)}
                  >
                    <UserPlus className="size-3.5" />
                    Assign
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </main>
  );
}
