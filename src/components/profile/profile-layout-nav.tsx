"use client";

import {
  IconBell,
  IconPalette,
  IconShieldLock,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const profileNavItems = [
  {
    title: "Profile",
    href: "/profile",
    icon: <IconUser />,
  },
  {
    title: "Preferences",
    href: "/profile/preferences",
    icon: <IconPalette />,
  },
  {
    title: "Security",
    href: "/profile/security",
    icon: <IconShieldLock />,
  },
  {
    title: "Notifications",
    href: "/profile/notifications",
    icon: <IconBell />,
  },
] as const;

export function ProfileLayoutNav({
  className,
  variant = "sidebar",
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  variant?: "sidebar" | "mobile";
}) {
  const router = useRouter();
  const pathname = usePathname();

  const activeHref =
    profileNavItems.find((item) =>
      item.href === "/profile"
        ? pathname === "/profile"
        : pathname.startsWith(item.href),
    )?.href ?? "/profile";

  if (variant === "mobile") {
    return (
      <Select value={activeHref} onValueChange={(value) => router.push(value)}>
        <SelectTrigger className="h-9 w-full max-w-xs">
          <SelectValue placeholder="Section" />
        </SelectTrigger>
        <SelectContent>
          {profileNavItems.map((item) => (
            <SelectItem key={item.href} value={item.href}>
              <div className="flex items-center gap-2">
                <span className="[&_svg]:size-4">{item.icon}</span>
                <span>{item.title}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <nav
      className={cn("flex flex-col space-y-1", className)}
      {...props}
    >
      {profileNavItems.map((item) => {
        const isActive = activeHref === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              isActive
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start",
            )}
          >
            <span className="mr-2 [&_svg]:size-[1.125rem]">{item.icon}</span>
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
