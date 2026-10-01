import * as React from "react"
import { cn } from "@/lib/utils"

/** Shared field chrome for inputs, textareas and select triggers. */
export const fieldControlClassName =
  "border-input bg-card placeholder:text-muted-foreground w-full min-w-0 rounded-md border text-base shadow-card outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          fieldControlClassName,
          "flex h-9 px-3 py-1 file:text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium pointer-coarse:h-11",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
