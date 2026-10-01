"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** A labelled switch sized to sit alongside toolbar buttons. */
export function ToolbarToggle({
  label,
  checked,
  onCheckedChange,
  id,
  "aria-label": ariaLabel,
  className,
}: {
  label: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  "aria-label"?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "border-input bg-card text-foreground shadow-card hover:bg-muted flex h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-sm font-medium whitespace-nowrap transition-colors select-none pointer-coarse:h-11 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/35",
        className,
      )}
    >
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={ariaLabel}
      />
      <span>{label}</span>
    </label>
  );
}
