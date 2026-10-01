"use client";

import { Bell, Palette, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { moduleTabTriggerClassName } from "@/components/soc/module-tabs";
import { cn } from "@/lib/utils";

const profileNavItems = [
  { title: "Profile", href: "/profile", icon: User },
  { title: "Preferences", href: "/profile/preferences", icon: Palette },
  { title: "Security", href: "/profile/security", icon: ShieldCheck },
  { title: "Notifications", href: "/profile/notifications", icon: Bell },
] as const;

export function ProfileLayoutNav({
  className,
  variant = "sidebar",
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  variant?: "sidebar" | "mobile";
}) {
  const pathname = usePathname();

  const activeHref =
    profileNavItems.find((item) =>
      item.href === "/profile"
        ? pathname === "/profile"
        : pathname.startsWith(item.href),
    )?.href ?? "/profile";

  if (variant === "mobile") {
    return (
      <nav
        aria-label="Profile sections"
        className={cn(
          "border-separator no-scrollbar overflow-x-auto border-b",
          className,
        )}
        {...props}
      >
        <div className="flex min-w-max gap-6">
          {profileNavItems.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                data-state={isActive ? "active" : "inactive"}
                className={cn(
                  moduleTabTriggerClassName,
                  "inline-flex items-center text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Profile sections"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    >
      {profileNavItems.map((item) => {
        const isActive = activeHref === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "pressable flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 pointer-coarse:h-11",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
