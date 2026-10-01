"use client";

import { ChevronRight, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

import { useAuthSession } from "@/components/auth/auth-session";
import { useSocRole } from "@/components/auth/soc-role-provider";
import { HeaderRoleSwitcher } from "@/components/layout/header-role-switcher";
import type { NavItem } from "@/components/layout/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSidebar } from "@/components/ui/sidebar";
import { sidebarData } from "@/data/sidebar-data";
import { filterNavGroups } from "@/lib/soc-roles";
import { cn } from "@/lib/utils";

function matchesPath(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`);
}

/** The most specific matching url, so `/vulnerabilities` loses to `/vulnerabilities/findings`. */
function currentUrl(pathname: string, urls: string[]) {
  return urls
    .filter((url) => matchesPath(pathname, url))
    .sort((a, b) => b.length - a.length)[0];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const rowClassName =
  "flex min-h-11 items-center gap-3 px-4 py-2 text-sm outline-none transition-colors active:bg-muted focus-visible:bg-muted [&>svg]:size-[1.125rem] [&>svg]:shrink-0";

function GroupedList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="bg-card shadow-card divide-separator shrink-0 divide-y overflow-hidden rounded-xl border">
      {children}
    </ul>
  );
}

function LinkRow({
  item,
  current,
  onNavigate,
}: {
  item: { title: string; url: string; icon?: React.ElementType };
  current: boolean;
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        href={item.url}
        onClick={onNavigate}
        aria-current={current ? "page" : undefined}
        className={cn(rowClassName, current && "text-primary font-medium")}
      >
        {item.icon ? (
          <item.icon
            aria-hidden
            className={current ? "text-primary" : "text-muted-foreground"}
          />
        ) : null}
        <span className="min-w-0 flex-1 truncate">{item.title}</span>
        <ChevronRight aria-hidden className="text-muted-foreground/50 !size-4" />
      </Link>
    </li>
  );
}

/**
 * Phone "More" destination: account, view-as role, and every section the
 * role can reach, as grouped inset lists. Driven by the sidebar's mobile
 * open state so ⌘B and nav-close behaviour stay shared.
 */
export function MobileMoreSheet() {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const { effectiveRole } = useSocRole();
  const { user, signOut } = useAuthSession();
  const pathname = usePathname();
  const router = useRouter();

  const items = useMemo(
    () =>
      filterNavGroups(sidebarData.navGroups, effectiveRole).flatMap(
        (group) => group.items,
      ),
    [effectiveRole],
  );
  const leaves = items.filter(
    (item): item is Extract<NavItem, { url: string }> => !item.items,
  );
  const sections = items.filter(
    (item): item is Extract<NavItem, { items: unknown[] }> => !!item.items,
  );
  const close = () => setOpenMobile(false);
  const activeUrl = currentUrl(pathname, [
    ...leaves.map((item) => item.url),
    ...sections.flatMap((section) => section.items.map((item) => item.url)),
  ]);

  if (!isMobile) return null;

  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetContent
        side="bottom"
        className="bg-canvas max-h-[88svh] gap-5 overflow-y-auto px-4 pt-4"
      >
        <SheetHeader className="min-h-7 justify-center px-1">
          <SheetTitle>More</SheetTitle>
          <SheetDescription className="sr-only">
            All sections, account and view-as role.
          </SheetDescription>
        </SheetHeader>

        <GroupedList>
          <li>
            <Link href="/profile" onClick={close} className={cn(rowClassName, "py-3")}>
              <Avatar className="size-10">
                <AvatarImage src={user.avatar} alt="" />
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="grid min-w-0 flex-1 leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </span>
              <ChevronRight aria-hidden className="text-muted-foreground/50 !size-4" />
            </Link>
          </li>
          <li className="flex items-center gap-3 px-4 py-2.5">
            <span className="text-sm">View as</span>
            <HeaderRoleSwitcher className="ml-auto w-auto min-w-0 flex-1 basis-0 justify-between" />
          </li>
        </GroupedList>

        <GroupedList>
          {leaves.map((item) => (
            <LinkRow
              key={item.url}
              item={item}
              current={item.url === activeUrl}
              onNavigate={close}
            />
          ))}
        </GroupedList>

        {sections.map((section) => (
          <section key={section.title} className="space-y-1.5">
            <h2 className="text-muted-foreground flex items-center gap-1.5 px-4 text-xs font-medium">
              {section.icon ? <section.icon aria-hidden className="size-3.5" /> : null}
              {section.title}
            </h2>
            <GroupedList>
              {section.items.map((item) => (
                <LinkRow
                  key={item.url}
                  item={item}
                  current={item.url === activeUrl}
                  onNavigate={close}
                />
              ))}
            </GroupedList>
          </section>
        ))}

        <GroupedList>
          <li>
            <button
              type="button"
              onClick={() => {
                close();
                signOut();
                router.push("/login");
              }}
              className={cn(rowClassName, "text-destructive-text w-full")}
            >
              <LogOut aria-hidden />
              Log out
            </button>
          </li>
        </GroupedList>
      </SheetContent>
    </Sheet>
  );
}
