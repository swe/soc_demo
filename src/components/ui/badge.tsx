import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Tinted, low-contrast-fill chips. Tone variants carry meaning through text
 * shade + fill so badges stay legible (≥4.5:1) and are never colour-only:
 * pair them with a label.
 */
const badgeVariants = cva(
  "inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 text-xs font-medium leading-none tabular-nums transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35 [&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive/12 text-destructive-text",
        outline: "border-border bg-card text-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        accent: "border-transparent bg-accent text-accent-foreground",
        critical:
          "border-transparent bg-severity-critical/12 text-severity-critical-text",
        high: "border-transparent bg-severity-high/12 text-severity-high-text",
        medium:
          "border-transparent bg-severity-medium/14 text-severity-medium-text",
        low: "border-transparent bg-severity-low/12 text-severity-low-text",
        success: "border-transparent bg-success/12 text-success-text",
        warning: "border-transparent bg-warning/16 text-warning-text",
        info: "border-transparent bg-info/12 text-info-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
