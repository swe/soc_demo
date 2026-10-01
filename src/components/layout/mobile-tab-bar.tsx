"use client";

import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSocRole } from "@/components/auth/soc-role-provider";
import { useSidebar } from "@/components/ui/sidebar";
import { navIcons } from "@/data/sidebar-data";
import { canAccessPath } from "@/lib/soc-roles";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Overview", href: "/overview", icon: navIcons.overview, match: ["/overview"] },
  {
    label: "Alerts",
    href: "/alerts",
    icon: navIcons.alertsIncidents,
    match: ["/alerts", "/incidents"],
  },
  {
    label: "Investigate",
    href: "/investigate",
    icon: navIcons.investigate,
    match: ["/investigate"],
  },
  { label: "Assets", href: "/assets/devices", icon: navIcons.assets, match: ["/assets"] },
] as const;

function matches(pathname: string, prefixes: readonly string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

const itemClassName =
  "pressable focus-visible:ring-ring/35 flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-medium outline-none focus-visible:ring-[3px] [&_svg]:size-[1.375rem] [&_svg]:shrink-0";

/** Phone-only primary navigation; the sidebar takes over from `md`. */
export function MobileTabBar() {
  const pathname = usePathname();
  const { effectiveRole } = useSocRole();
  const { openMobile, setOpenMobile } = useSidebar();

  const visibleTabs = tabs.filter((tab) => canAccessPath(effectiveRole, tab.href));
  const moreActive =
    openMobile || !visibleTabs.some((tab) => matches(pathname, tab.match));

  return (
    <nav
      aria-label="Primary"
      className="material-chrome border-separator shrink-0 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex h-[3.25rem] items-stretch px-2">
        {visibleTabs.map((tab) => {
          const active = !openMobile && matches(pathname, tab.match);
          return (
            <li key={tab.href} className="flex min-w-0 flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  itemClassName,
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <tab.icon aria-hidden />
                <span className="truncate">{tab.label}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex min-w-0 flex-1">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={openMobile}
            onClick={() => setOpenMobile(!openMobile)}
            className={cn(
              itemClassName,
              moreActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Ellipsis aria-hidden />
            <span>More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
