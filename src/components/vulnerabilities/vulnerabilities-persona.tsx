"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSocRole } from "@/components/auth/soc-role-provider";
import { socJobRoleToVulnPersona } from "@/lib/soc-roles";

import type { FindingsListFilters } from "./vulnerabilities-url";
import {
  buildFindingsHref,
  buildOverviewHref,
} from "./vulnerabilities-url";

export type VulnPersona = "ciso" | "tier1" | "tier2" | "tier3";

export const vulnPersonas: VulnPersona[] = [
  "ciso",
  "tier1",
  "tier2",
  "tier3",
];

export const vulnPersonaLabels: Record<VulnPersona, string> = {
  ciso: "CISO",
  tier1: "Tier 1 Analyst",
  tier2: "Tier 2 Analyst",
  tier3: "Tier 3 Analyst",
};

export const vulnPersonaDescriptions: Record<VulnPersona, string> = {
  ciso: "Risk digest · backlog health",
  tier1: "Triage · escalate",
  tier2: "Investigate · remediate",
  tier3: "Zero-day · threat context",
};

/** Mock assignee for “My queue”, keyed by demo persona. */
export const vulnPersonaUserIds: Record<VulnPersona, string> = {
  ciso: "riya-sharma",
  tier1: "owen-lee",
  tier2: "ava-reed",
  tier3: "chloe-park",
};

const LANDING_SESSION_KEY = "soc.vuln.persona.landed";

export function personaFromTitle(title: string): VulnPersona {
  const t = title.toLowerCase();
  if (
    t.includes("ciso") ||
    t.includes("director") ||
    t.includes("chief") ||
    t.includes("vp ")
  ) {
    return "ciso";
  }
  if (t.includes("tier 1") || t.includes("tier1") || t.includes("triage")) {
    return "tier1";
  }
  if (
    t.includes("tier 3") ||
    t.includes("tier3") ||
    t.includes("threat intel") ||
    t.includes("hunter")
  ) {
    return "tier3";
  }
  if (
    t.includes("tier 2") ||
    t.includes("tier2") ||
    t.includes("vulnerability") ||
    t.includes("investigator")
  ) {
    return "tier2";
  }
  return "tier2";
}

export function getFindingsPresetForPersona(
  persona: VulnPersona,
): Partial<FindingsListFilters> {
  switch (persona) {
    case "tier1":
      return {
        exploitableOnly: true,
        withAlertsOnly: true,
        zeroDayOnly: false,
        withIncidentsOnly: false,
        sort: "priority-desc",
      };
    case "tier3":
      return {
        exploitableOnly: false,
        withAlertsOnly: false,
        zeroDayOnly: true,
        withIncidentsOnly: true,
        sort: "priority-desc",
      };
    case "tier2":
      return {
        exploitableOnly: false,
        withAlertsOnly: false,
        zeroDayOnly: false,
        withIncidentsOnly: false,
        sort: "priority-desc",
      };
    case "ciso":
    default:
      return {
        exploitableOnly: false,
        withAlertsOnly: false,
        zeroDayOnly: false,
        withIncidentsOnly: false,
        sort: "priority-desc",
      };
  }
}

export function getDefaultLandHref(persona: VulnPersona): string {
  if (persona === "ciso") return buildOverviewHref();
  return buildFindingsHref(getFindingsPresetForPersona(persona));
}

export function shouldDefaultMineQueue(persona: VulnPersona): boolean {
  return persona === "tier2" || persona === "tier3";
}

export type OverviewPanelId =
  | "narrative"
  | "chart"
  | "topPriority"
  | "exploitation"
  | "blastRadius"
  | "openWork"
  | "compliance"
  | "activity";

export function getOverviewPanelOrder(persona: VulnPersona): OverviewPanelId[] {
  if (persona === "ciso") {
    return [
      "narrative",
      "chart",
      "topPriority",
      "blastRadius",
      "openWork",
      "exploitation",
      "activity",
      "compliance",
    ];
  }
  return [
    "exploitation",
    "openWork",
    "chart",
    "topPriority",
    "blastRadius",
    "narrative",
    "activity",
    "compliance",
  ];
}

type VulnPersonaValue = {
  persona: VulnPersona;
  setPersona: (persona: VulnPersona) => void;
  currentUserId: string;
};

const VulnPersonaContext = createContext<VulnPersonaValue | null>(null);

/**
 * Driven by the global SOC job-role switcher. Local “View as” bar removed.
 */
export function VulnPersonaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { effectiveRole, hydrated: roleHydrated } = useSocRole();
  const mapped = socJobRoleToVulnPersona(effectiveRole);
  const [persona, setPersonaState] = useState<VulnPersona>(mapped);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPersonaState(socJobRoleToVulnPersona(effectiveRole));
    if (roleHydrated) setHydrated(true);
  }, [effectiveRole, roleHydrated]);

  const setPersona = useCallback((next: VulnPersona) => {
    setPersonaState(next);
    try {
      window.sessionStorage.removeItem(LANDING_SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      persona,
      setPersona,
      currentUserId: vulnPersonaUserIds[persona],
    }),
    [persona, setPersona],
  );

  return (
    <VulnPersonaContext.Provider value={value}>
      {children}
      {hydrated ? <VulnPersonaLandingRedirect /> : null}
    </VulnPersonaContext.Provider>
  );
}

export function useVulnPersona() {
  const value = useContext(VulnPersonaContext);
  if (!value) {
    throw new Error("useVulnPersona must be used within VulnPersonaProvider");
  }
  return value;
}

/** Soft land Tier analysts on Findings with presets when opening the module root. */
function VulnPersonaLandingRedirect() {
  const { persona } = useVulnPersona();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== "/vulnerabilities") return;
    if (persona === "ciso") return;
    try {
      const key = `${LANDING_SESSION_KEY}:${persona}`;
      if (window.sessionStorage.getItem(key) === "1") return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    router.replace(getDefaultLandHref(persona));
  }, [persona, pathname, router]);

  return null;
}

export function personaPresetChipActive(
  persona: VulnPersona,
  filters: FindingsListFilters,
): boolean {
  const preset = getFindingsPresetForPersona(persona);
  return (
    Boolean(filters.exploitableOnly) === Boolean(preset.exploitableOnly) &&
    Boolean(filters.withAlertsOnly) === Boolean(preset.withAlertsOnly) &&
    Boolean(filters.zeroDayOnly) === Boolean(preset.zeroDayOnly) &&
    Boolean(filters.withIncidentsOnly) === Boolean(preset.withIncidentsOnly) &&
    filters.sort === (preset.sort ?? "priority-desc") &&
    filters.severities.length === 0 &&
    filters.scope === "all" &&
    !filters.search.trim()
  );
}
