"use client";

import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type AllowedThemePresetId,
  applyThemePresetToDocument,
  getPresetLabel,
  listPresetIdsSorted,
  persistThemePresetId,
  readStoredThemePresetId,
} from "@/lib/theme-preset-apply";
import { cn } from "@/lib/utils";

export function ThemePresetSelector({
  className,
  align = "end",
}: {
  className?: string;
  align?: "start" | "center" | "end";
}) {
  const [open, setOpen] = React.useState(false);
  const [presetId, setPresetId] = React.useState<AllowedThemePresetId | null>(
    null,
  );

  React.useLayoutEffect(() => {
    setPresetId(readStoredThemePresetId());
  }, []);

  React.useLayoutEffect(() => {
    if (presetId === null) return;
    applyThemePresetToDocument(presetId);
    persistThemePresetId(presetId);
  }, [presetId]);

  const activeId = presetId ?? "default";
  const allIds = React.useMemo(() => listPresetIdsSorted(), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "border-border h-9 max-w-full min-w-0 shrink gap-2 overflow-hidden rounded-lg px-2.5 font-normal",
            className,
          )}
          aria-label="Choose style"
        >
          <span className="hidden max-w-[min(11rem,calc(100vw-7rem))] min-w-0 truncate text-sm sm:block">
            {getPresetLabel(activeId)}
          </span>
          <ChevronDown className="text-muted-foreground size-4 shrink-0 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-[min(100vw-1.5rem,16rem)] p-0"
        sideOffset={8}
      >
        <Command>
          <CommandList>
            <CommandEmpty>No styles found.</CommandEmpty>
            <CommandGroup heading="Styles">
              {allIds.map((id) => {
                const label = getPresetLabel(id);
                return (
                  <CommandItem
                    key={id}
                    value={`${id} ${label}`}
                    onSelect={() => {
                      setPresetId(id);
                      setOpen(false);
                    }}
                    className="min-w-0 gap-2 py-2"
                  >
                    <span className="min-w-0 flex-1 truncate text-left">
                      {label}
                    </span>
                    {id === activeId ? (
                      <Check className="text-primary size-4 shrink-0" />
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
