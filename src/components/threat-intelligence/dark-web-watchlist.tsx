"use client";

import { useState } from "react";
import { Pause, Play, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  type WatchlistEntry,
  type WatchlistKind,
  watchlistKindLabels,
} from "./dark-web-data";
import { mutedControlClassName } from "./dark-web-primitives";

export function DarkWebWatchlist({
  watchlist,
  onAdd,
  onRemove,
  onSetStatus,
}: {
  watchlist: WatchlistEntry[];
  onAdd: (entry: {
    value: string;
    kind: WatchlistKind;
    notes?: string;
  }) => void;
  onRemove: (id: string) => void;
  onSetStatus: (id: string, status: "active" | "paused") => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [kind, setKind] = useState<WatchlistKind>("domain");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setValue("");
    setKind("domain");
    setNotes("");
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      toast({
        title: "Value required",
        description: "Enter a domain, email, brand, or VIP principal.",
      });
      return;
    }
    onAdd({ value: trimmed, kind, notes: notes.trim() || undefined });
    toast({
      title: "Watchlist entry added",
      description: trimmed,
    });
    resetForm();
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Domains, emails, brands, and VIP principals matched against dark web
          sources.
        </p>
        <Button
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => setOpen(true)}
        >
          <Plus className="size-3.5" />
          Add monitor
        </Button>
      </div>

      <div className="bg-card overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Value</TableHead>
              <TableHead className="w-[100px]">Kind</TableHead>
              <TableHead className="hidden w-[110px] sm:table-cell">
                Added
              </TableHead>
              <TableHead className="w-[72px]">Hits 7d</TableHead>
              <TableHead className="w-[88px]">Status</TableHead>
              <TableHead className="w-[96px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {watchlist.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground h-32 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p>No watchlist entries yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className={mutedControlClassName}
                      onClick={() => setOpen(true)}
                    >
                      Add first domain
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              watchlist.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate font-mono text-sm font-medium">
                        {entry.value}
                      </p>
                      {entry.notes ? (
                        <p className="text-muted-foreground truncate text-xs">
                          {entry.notes}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {watchlistKindLabels[entry.kind]}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden text-sm sm:table-cell">
                    {entry.addedLabel}
                  </TableCell>
                  <TableCell className="tabular-nums">{entry.hits7d}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-xs font-medium capitalize",
                        entry.status === "active"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-muted-foreground",
                      )}
                    >
                      {entry.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={
                          entry.status === "active" ? "Pause" : "Resume"
                        }
                        onClick={() =>
                          onSetStatus(
                            entry.id,
                            entry.status === "active" ? "paused" : "active",
                          )
                        }
                      >
                        {entry.status === "active" ? (
                          <Pause className="size-3.5" />
                        ) : (
                          <Play className="size-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive size-8"
                        aria-label="Remove"
                        onClick={() => {
                          onRemove(entry.id);
                          toast({
                            title: "Removed from watchlist",
                            description: entry.value,
                          });
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add watchlist monitor</DialogTitle>
            <DialogDescription>
              New matches against this value appear in the Exposures queue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="wl-kind">Kind</Label>
              <Select
                value={kind}
                onValueChange={(next) => setKind(next as WatchlistKind)}
              >
                <SelectTrigger id="wl-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.keys(watchlistKindLabels) as WatchlistKind[]
                  ).map((option) => (
                    <SelectItem key={option} value={option}>
                      {watchlistKindLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wl-value">Value</Label>
              <Input
                id="wl-value"
                value={value}
                placeholder="svalbard.ca or user@svalbard.ca"
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submit();
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wl-notes">Notes (optional)</Label>
              <Input
                id="wl-notes"
                value={notes}
                placeholder="Why we monitor this"
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className={mutedControlClassName}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={submit}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
