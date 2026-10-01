"use client";

import { cn } from "@/lib/utils";

const toneClass = {
  default: "",
  warning: "text-warning-text",
  critical: "text-destructive-text",
  success: "text-success-text",
} as const;

export type MetricTile = {
  key: string;
  label: string;
  value: React.ReactNode;
  /** Secondary line under the value, e.g. a sample size. */
  context?: string;
  tone?: keyof typeof toneClass;
  onSelect?: () => void;
};

/** Compact row of tappable counts inside a panel (e.g. "Unassigned 12"). */
export function MetricTiles({
  tiles,
  className,
}: {
  tiles: readonly MetricTile[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-2",
        tiles.length === 4 ? "grid-cols-2 sm:grid-cols-4" : tiles.length === 3 ? "grid-cols-3" : "grid-cols-2",
        className,
      )}
    >
      {tiles.map((tile) => {
        const body = (
          <>
            <span className="text-muted-foreground block truncate text-xs">{tile.label}</span>
            <span
              className={cn(
                "text-title-3 mt-1 block tabular-nums",
                toneClass[tile.tone ?? "default"],
              )}
            >
              {tile.value}
            </span>
            {tile.context ? (
              <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                {tile.context}
              </span>
            ) : null}
          </>
        );
        const tileClass = "bg-muted/50 min-w-0 rounded-lg px-3 py-2.5 text-left";
        return tile.onSelect ? (
          <button
            key={tile.key}
            type="button"
            onClick={tile.onSelect}
            className={cn(tileClass, "pressable hover:bg-accent")}
          >
            {body}
          </button>
        ) : (
          <div key={tile.key} className={tileClass}>
            {body}
          </div>
        );
      })}
    </div>
  );
}
