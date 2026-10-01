"use client";

import { ChevronLeft, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import { useSocRole } from "@/components/auth/soc-role-provider";
import { HeaderRoleSwitcher } from "@/components/layout/header-role-switcher";
import { HeaderUtilityActions } from "@/components/layout/header-utility-actions";
import { useSearch } from "@/components/search-provider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { breadcrumbsFromPathname, type Crumb } from "@/data/route-chrome";
import { canAccessPath } from "@/lib/soc-roles";

interface HeaderProps {
  /** When omitted, derived from the URL. */
  title?: string;
}

export function Header({ title: titleProp }: HeaderProps) {
  const pathname = usePathname();
  const { effectiveRole } = useSocRole();
  const { setOpen: setCommandOpen } = useSearch();

  const crumbs: Crumb[] = (
    titleProp ? [{ label: titleProp }] : breadcrumbsFromPathname(pathname)
  ).map((crumb) =>
    crumb.href && !canAccessPath(effectiveRole, crumb.href)
      ? { label: crumb.label }
      : crumb,
  );
  const current = crumbs[crumbs.length - 1];
  const back = [...crumbs.slice(0, -1)].reverse().find((crumb) => crumb.href);

  return (
    <header className="bg-background border-separator px-gutter relative z-20 flex h-(--header-height) w-full min-w-0 shrink-0 items-center gap-2 border-b md:gap-3">
      <SidebarTrigger className="-ml-1.5 hidden shrink-0 md:inline-flex" />

      {back?.href ? (
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="-ml-2 shrink-0 md:hidden"
        >
          <Link href={back.href} aria-label={`Back to ${back.label}`}>
            <ChevronLeft className="size-5" />
          </Link>
        </Button>
      ) : null}

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap text-base md:text-sm">
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              return (
                <Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 ? (
                    <BreadcrumbSeparator className="hidden md:block" />
                  ) : null}
                  <BreadcrumbItem
                    className={
                      isLast ? "min-w-0" : "hidden shrink-0 md:inline-flex"
                    }
                  >
                    {isLast ? (
                      <h1
                        aria-current="page"
                        className="text-foreground truncate font-semibold md:font-medium"
                      >
                        {current.label}
                      </h1>
                    ) : crumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <span className="truncate">{crumb.label}</span>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="-mr-1.5 flex shrink-0 items-center gap-1 md:mr-0 md:gap-2">
        <HeaderRoleSwitcher className="hidden md:flex" />
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground size-9 gap-2 p-0 pointer-coarse:size-11 lg:w-auto lg:px-2.5 lg:pointer-coarse:w-auto"
          onClick={() => setCommandOpen(true)}
          aria-label={`Search and jump to (${crumbs.map((crumb) => crumb.label).join(" / ")})`}
          aria-keyshortcuts="Meta+K Control+K"
        >
          <Search aria-hidden="true" />
          <Kbd className="hidden lg:inline-flex">⌘K</Kbd>
        </Button>
        <HeaderUtilityActions />
      </div>
    </header>
  );
}
