"use client";

import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { createElement } from "react";

import { HeaderRoleSwitcher } from "@/components/layout/header-role-switcher";
import { HeaderUtilityActions } from "@/components/layout/header-utility-actions";
import { useSearch } from "@/components/search-provider";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  type HeaderTitle,
  iconFromPathname,
  titleFromPathname,
} from "@/data/route-chrome";

function HeaderTitleContent({ title }: { title: HeaderTitle }) {
  if (title.kind === "plain") {
    return <span className="truncate">{title.label}</span>;
  }

  return (
    <span className="flex min-w-0 items-center gap-2 truncate">
      {title.segments.map((segment, index) => (
        <span key={`${segment}-${index}`} className="contents">
          {index > 0 ? (
            <span className="text-muted-foreground font-normal">/</span>
          ) : null}
          <span className="truncate">{segment}</span>
        </span>
      ))}
    </span>
  );
}

interface HeaderProps {
  /** When omitted, derived from the URL. */
  title?: string;
}

export function Header({ title: titleProp }: HeaderProps) {
  const pathname = usePathname();
  const title = titleProp
    ? ({ kind: "plain", label: titleProp } as const)
    : titleFromPathname(pathname);
  const pageIcon = createElement(iconFromPathname(pathname), {
    className: "text-muted-foreground size-4 shrink-0",
    "aria-hidden": true,
  });
  const searchAriaLabel = `Open command palette (${
    title.kind === "plain" ? title.label : title.segments.join(" / ")
  })`;
  const { setOpen: setCommandOpen } = useSearch();

  return (
    <header className="bg-background sticky top-0 z-20 grid w-full min-w-0 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b px-4 py-4 sm:gap-3 sm:px-6">
      <SidebarTrigger className="size-8 shrink-0" />
      <div className="flex min-w-0 items-center gap-2">
        {pageIcon}
        <h1 className="truncate text-base font-medium">
          <HeaderTitleContent title={title} />
        </h1>
      </div>

      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <HeaderRoleSwitcher />
        <Button
          type="button"
          variant="outline"
          className="text-muted-foreground hover:text-foreground flex h-9 w-9 shrink-0 items-center justify-center gap-0 p-0 sm:w-auto sm:gap-2 sm:px-2.5"
          onClick={() => setCommandOpen(true)}
          aria-label={searchAriaLabel}
          aria-keyshortcuts="Meta+K Control+K"
        >
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <kbd className="bg-muted text-muted-foreground pointer-events-none hidden rounded-md border px-1.5 py-0.5 text-[10px] font-medium sm:inline-flex">
            {"\u2318"}
            {"\u00a0"}K
          </kbd>
        </Button>
        <HeaderUtilityActions />
      </div>
    </header>
  );
}
