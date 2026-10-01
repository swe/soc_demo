"use client";

import {
  CheckIcon,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export type FilterOption = { value: string; label: React.ReactNode };

export type FilterFacet = {
  id: string;
  label: string;
  icon?: LucideIcon;
  options: readonly FilterOption[];
  selected: readonly string[];
  onToggle: (value: string) => void;
  /** Single choice (e.g. sort): selecting returns to the facet list. */
  single?: boolean;
  /** Hide the selected-count hint, e.g. for sort which always has a value. */
  hideCount?: boolean;
};

/**
 * Faceted filter control: a drill-in popover on desktop and a bottom sheet
 * listing every facet on phones.
 */
export function FilterMenu({
  facets,
  activeCount,
  onClear,
  label = "Filter",
  align = "end",
  className,
}: {
  facets: readonly FilterFacet[];
  activeCount: number;
  onClear: () => void;
  label?: string;
  align?: "start" | "end";
  className?: string;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<string | null>(null);

  const trigger = (
    <Button
      variant="outline"
      size="sm"
      className={cn("h-9 gap-1.5 px-2.5", className)}
      aria-label={activeCount > 0 ? `${label}, ${activeCount} active` : label}
    >
      <ListFilter className="size-3.5" />
      {label}
      {activeCount > 0 ? (
        <span className="bg-primary text-primary-foreground inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[0.6875rem] font-semibold tabular-nums">
          {activeCount}
        </span>
      ) : null}
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle>{label}</DrawerTitle>
            <DrawerDescription>
              {activeCount > 0
                ? `${activeCount} active`
                : "Narrow the list by any combination."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
            {facets.map((facet) => (
              <section key={facet.id} className="py-2">
                <h3 className="text-muted-foreground px-1 pb-1.5 text-caption font-medium tracking-wide uppercase">
                  {facet.label}
                </h3>
                <div className="bg-muted/50 divide-separator divide-y overflow-hidden rounded-xl">
                  {facet.options.map((option) => {
                    const checked = facet.selected.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role={facet.single ? "radio" : "checkbox"}
                        aria-checked={checked}
                        onClick={() => facet.onToggle(option.value)}
                        className="active:bg-muted flex min-h-11 w-full items-center justify-between gap-3 px-3.5 text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35 focus-visible:ring-inset"
                      >
                        <span className="min-w-0 truncate">{option.label}</span>
                        {checked ? (
                          <CheckIcon className="text-primary size-4 shrink-0" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          <DrawerFooter className="border-separator flex-row border-t">
            <Button
              variant="outline"
              className="flex-1"
              disabled={activeCount === 0}
              onClick={onClear}
            >
              Clear all
            </Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>
              Done
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  const activeFacet = facets.find((facet) => facet.id === panel);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setPanel(null);
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-64 p-0" align={align}>
        {activeFacet ? (
          <div>
            <div className="border-separator flex items-center border-b p-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                onClick={() => setPanel(null)}
              >
                <ChevronLeft className="size-3.5" />
                {activeFacet.label}
              </Button>
            </div>
            <Command>
              <CommandList>
                <CommandGroup>
                  {activeFacet.options.map((option) => {
                    const checked = activeFacet.selected.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          activeFacet.onToggle(option.value);
                          if (activeFacet.single) setPanel(null);
                        }}
                        className="justify-between"
                      >
                        <span className="min-w-0 truncate">{option.label}</span>
                        {checked ? <CheckIcon className="size-4" /> : null}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ) : (
          <Command>
            <CommandList>
              <CommandGroup>
                {facets.map((facet) => {
                  const Icon = facet.icon ?? ListFilter;
                  return (
                    <CommandItem
                      key={facet.id}
                      onSelect={() => setPanel(facet.id)}
                      className="flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="text-muted-foreground size-4" />
                        {facet.label}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1 text-xs">
                        {!facet.hideCount && facet.selected.length > 0
                          ? facet.selected.length
                          : null}
                        <ChevronRight className="size-4" />
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {activeCount > 0 ? (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onClear();
                        setOpen(false);
                      }}
                      className="text-destructive-text"
                    >
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </>
              ) : null}
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
