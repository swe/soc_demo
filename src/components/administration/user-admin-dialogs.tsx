"use client";

import { CheckIcon, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
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
import { cn } from "@/lib/utils";

import {
  type AdministrationAccessRole,
  administrationAccessRoles,
  administrationRoleDescriptions,
  administrationTeams,
  type AdministrationUser,
} from "./users-data";

export function InviteTeamsSelect({
  value,
  onValueChange,
}: {
  value: string[];
  onValueChange: (teamIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedTeams = administrationTeams.filter((team) =>
    value.includes(team.id),
  );

  const toggleTeam = (teamId: string) => {
    onValueChange(
      value.includes(teamId)
        ? value.filter((id) => id !== teamId)
        : [...value, teamId],
    );
  };

  const label =
    selectedTeams.length === 0
      ? "Select teams"
      : selectedTeams.length === 1
        ? selectedTeams[0]!.name
        : `${selectedTeams.length} teams`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-between px-3 font-normal shadow-none",
            selectedTeams.length === 0 && "text-muted-foreground",
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronRight className="text-muted-foreground size-4 rotate-90" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandList>
            <CommandGroup>
              {administrationTeams.map((team) => (
                <CommandItem
                  key={team.id}
                  onSelect={() => toggleTeam(team.id)}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate">{team.name}</span>
                  {value.includes(team.id) ? (
                    <CheckIcon className="size-4 shrink-0" />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ChangeRoleDialog({
  open,
  user,
  role,
  onRoleChange,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  user: AdministrationUser | null;
  role: AdministrationAccessRole;
  onRoleChange: (role: AdministrationAccessRole) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}) {
  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            Update the access role for {user.name} ({user.email}).
          </DialogDescription>
        </DialogHeader>

        <Field className="gap-2">
          <FieldLabel>Access role</FieldLabel>
          <Select
            value={role}
            onValueChange={(value) =>
              onRoleChange(value as AdministrationAccessRole)
            }
          >
            <SelectTrigger className="h-9 w-full shadow-none">
              <SelectValue>{role}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {administrationAccessRoles.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    disabled={option === "Owner" && user.role !== "Owner"}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span>{option}</span>
                      <span className="text-muted-foreground text-xs">
                        {administrationRoleDescriptions[option]}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AssignTeamsDialog({
  open,
  user,
  teamIds,
  onTeamIdsChange,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  user: AdministrationUser | null;
  teamIds: string[];
  onTeamIdsChange: (teamIds: string[]) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}) {
  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign teams</DialogTitle>
          <DialogDescription>
            Choose which SOC teams {user.name} should belong to.
          </DialogDescription>
        </DialogHeader>

        <Field className="gap-2">
          <FieldLabel>Teams</FieldLabel>
          <InviteTeamsSelect value={teamIds} onValueChange={onTeamIdsChange} />
        </Field>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save teams</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
