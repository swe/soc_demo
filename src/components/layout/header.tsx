"use client";

import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { HeaderRoleSwitcher } from "@/components/layout/header-role-switcher";
import { HeaderUtilityActions } from "@/components/layout/header-utility-actions";
import { useSearch } from "@/components/search-provider";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { site } from "@/data/site";

type HeaderTitle =
  | { kind: "plain"; label: string }
  | { kind: "segments"; segments: string[] };

function humanizeSegment(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function titleFromPathname(pathname: string): HeaderTitle {
  const segments = pathname.split("/").filter(Boolean);
  const root = segments[0];
  const second = segments[1];
  const third = segments[2];

  if (root === "administration") {
    if (second === "users") {
      if (third) {
        return {
          kind: "segments",
          segments: ["Administration", "User Management", "Profile"],
        };
      }

      return {
        kind: "segments",
        segments: ["Administration", "User Management"],
      };
    }

    if (second === "integrations") {
      return {
        kind: "segments",
        segments: ["Administration", "Integrations"],
      };
    }

    return {
      kind: "plain",
      label: site.dashboardAppTitle.administration,
    };
  }

  if (root === "profile") {
    if (second === "preferences") {
      return {
        kind: "segments",
        segments: ["Profile", "Preferences"],
      };
    }

    if (second === "security") {
      return {
        kind: "segments",
        segments: ["Profile", "Security"],
      };
    }

    if (second === "notifications") {
      return {
        kind: "segments",
        segments: ["Profile", "Notifications"],
      };
    }

    return {
      kind: "plain",
      label: site.dashboardAppTitle.profile,
    };
  }

  if (root === "overview") {
    return { kind: "plain", label: "Overview" };
  }

  if (root === "alerts") {
    if (second === "list") {
      return { kind: "segments", segments: ["Alerts", "All Alerts"] };
    }
    if (second === "overview" || !second) {
      return { kind: "segments", segments: ["Alerts", "Overview"] };
    }
    return { kind: "segments", segments: ["Alerts", second.toUpperCase()] };
  }

  if (root === "incidents") {
    if (second === "list") {
      return { kind: "segments", segments: ["Incidents", "Active Cases"] };
    }
    if (second === "overview" || !second) {
      return { kind: "segments", segments: ["Incidents", "Overview"] };
    }
    return { kind: "segments", segments: ["Incidents", second.toUpperCase()] };
  }

  if (root === "assets") {
    if (second === "devices") {
      return { kind: "segments", segments: ["Assets", "Devices"] };
    }
    if (second === "identities") {
      return { kind: "segments", segments: ["Assets", "Identities"] };
    }
    return { kind: "plain", label: "Assets" };
  }

  if (root === "compliance") {
    return { kind: "plain", label: "Compliance" };
  }

  if (root === "knowledge-base") {
    const pageLabels: Record<string, string> = {
      documentation: "Documentation",
      procedures: "Procedures",
      reports: "Reports",
      trainings: "Trainings",
    };
    if (second && pageLabels[second]) {
      return {
        kind: "segments",
        segments: ["Knowledge Base", pageLabels[second]],
      };
    }
    return { kind: "plain", label: "Knowledge Base" };
  }

  if (root === "vulnerabilities") {
    const vulnPageLabels: Record<string, string> = {
      findings: "Findings",
      exposure: "Exposure",
      work: "Work queue",
      weaknesses: "Findings",
      recommendations: "Work queue",
      remediations: "Work queue",
      inventories: "Exposure",
      "event-timeline": "Overview",
    };
    if (!second) {
      return {
        kind: "segments",
        segments: ["Vulnerabilities", "Overview"],
      };
    }
    return {
      kind: "segments",
      segments: [
        "Vulnerabilities",
        vulnPageLabels[second] ?? humanizeSegment(second),
      ],
    };
  }

  if (root === "threat-hunting") {
    if (second === "hunts") {
      return {
        kind: "segments",
        segments: ["Threat Hunting", "Hunt Library"],
      };
    }
    if (second === "analytics") {
      return { kind: "segments", segments: ["Threat Hunting", "Analytics"] };
    }
    if (second === "map") {
      return { kind: "segments", segments: ["Threat Hunting", "Threat Map"] };
    }
    return { kind: "plain", label: "Threat Hunting" };
  }

  if (root === "threat-intelligence") {
    if (second === "actors") {
      return {
        kind: "segments",
        segments: ["Threat Intelligence", "Actors & Campaigns"],
      };
    }
    if (second === "dark-web") {
      return {
        kind: "segments",
        segments: ["Threat Intelligence", "Dark Web Monitoring"],
      };
    }
    if (second === "feeds") {
      return {
        kind: "segments",
        segments: ["Threat Intelligence", "Threat Feeds"],
      };
    }
    if (!second) {
      return {
        kind: "segments",
        segments: ["Threat Intelligence", "Indicators"],
      };
    }
    return { kind: "plain", label: "Threat Intelligence" };
  }

  if (root && root in site.dashboardAppTitle) {
    return {
      kind: "plain",
      label:
        site.dashboardAppTitle[root as keyof typeof site.dashboardAppTitle],
    };
  }

  return { kind: "plain", label: site.title };
}

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
  /** When omitted, derived from the URL (`site.dashboardAppTitle` or `site.title`). */
  title?: string;
}

export function Header({ title: titleProp }: HeaderProps) {
  const pathname = usePathname();
  const title = titleProp
    ? ({ kind: "plain", label: titleProp } as const)
    : titleFromPathname(pathname);
  const searchAriaLabel = `Open command palette (${
    title.kind === "plain" ? title.label : title.segments.join(" / ")
  })`;
  const { setOpen: setCommandOpen } = useSearch();

  return (
    <header className="bg-background grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b px-4 py-4 sm:gap-3 sm:px-6">
      <SidebarTrigger className="size-8 shrink-0" />
      <div className="min-w-0">
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
