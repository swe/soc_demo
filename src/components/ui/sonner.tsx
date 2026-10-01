"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      gap={8}
      offset={16}
      mobileOffset={{
        bottom: "calc(var(--tab-bar-height, 0px) + 12px)",
        left: 12,
        right: 12,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:material-thick group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-raised group-[.toaster]:rounded-xl group-[.toaster]:gap-2.5 group-[.toaster]:px-4 group-[.toaster]:py-3",
          title: "group-[.toast]:text-sm group-[.toast]:font-medium",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:text-callout",
          actionButton:
            "group-[.toast]:!bg-primary group-[.toast]:!text-primary-foreground group-[.toast]:!rounded-md group-[.toast]:!font-medium",
          cancelButton:
            "group-[.toast]:!bg-muted group-[.toast]:!text-muted-foreground group-[.toast]:!rounded-md",
          icon: "group-[.toast]:[&_svg]:size-4",
          success: "group-[.toaster]:[&_[data-icon]]:text-success-text",
          error: "group-[.toaster]:[&_[data-icon]]:text-destructive-text",
          warning: "group-[.toaster]:[&_[data-icon]]:text-warning-text",
          info: "group-[.toaster]:[&_[data-icon]]:text-info-text",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
