import * as React from "react"
import { cn } from "@/lib/utils"
import { fieldControlClassName } from "@/components/ui/input"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        fieldControlClassName,
        "flex min-h-20 px-3 py-2 leading-relaxed",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
