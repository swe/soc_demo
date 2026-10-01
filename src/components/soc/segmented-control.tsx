"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: React.ReactNode;
};

/**
 * Single-choice segmented control (radiogroup semantics, arrow-key roving).
 * Use for 2–5 mutually exclusive view options such as time ranges.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  size = "sm",
  className,
  "aria-label": ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  size?: "sm" | "default";
  className?: string;
  "aria-label": string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (from: number, step: number) => {
    const next = (from + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "bg-muted inline-flex max-w-full shrink-0 items-center gap-0.5 overflow-x-auto rounded-md p-0.5 no-scrollbar",
        size === "sm" ? "h-8 pointer-coarse:h-10" : "h-9 pointer-coarse:h-11",
        className,
      )}
    >
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                move(index, 1);
              } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                move(index, -1);
              }
            }}
            className={cn(
              "focus-visible:ring-ring/35 inline-flex h-full min-w-0 flex-1 items-center justify-center rounded-[calc(var(--radius)-4px)] px-2.5 text-xs font-medium whitespace-nowrap transition-[color,background-color,box-shadow] duration-150 outline-none focus-visible:ring-[3px] pointer-coarse:px-3.5",
              active
                ? "bg-card text-foreground shadow-card dark:bg-secondary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
