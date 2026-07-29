/**
 * SOC job roles (layout / persona) — distinct from AdministrationAccessRole
 * (Owner / Admin / Analyst workspace permissions).
 */

export type SocJobRole =
  | "c_level"
  | "ciso"
  | "soc_manager"
  | "analyst_t1"
  | "analyst_t2"
  | "analyst_t3"
  | "legal_procurement";

/** Stable nav ids used for ACL filtering of the SOC sidebar group. */
export type SocNavId =
  | "overview"
  | "alerts-incidents"
  | "phishing"
  | "investigate"
  | "assets"
  | "cloud-posture"
  | "vulnerabilities"
  | "vulnerabilities-overview"
  | "vulnerabilities-findings"
  | "vulnerabilities-exposure"
  | "vulnerabilities-work"
  | "vulnerabilities-recommendations"
  | "vulnerabilities-remediations"
  | "vulnerabilities-inventories"
  | "vulnerabilities-event-timeline"
  | "data-security"
  | "threat-hunting"
  | "on-call"
  | "threat-intelligence"
  | "threat-intelligence-indicators"
  | "threat-intelligence-actors"
  | "threat-intelligence-dark-web"
  | "threat-intelligence-attack-surface"
  | "threat-intelligence-feeds"
  | "automation"
  | "automation-playbooks"
  | "automation-builder"
  | "automation-approvals"
  | "compliance"
  | "knowledge-base"
  | "knowledge-base-documentation"
  | "knowledge-base-procedures"
  | "knowledge-base-reports"
  | "knowledge-base-trainings"
  | "administration"
  | "administration-users"
  | "administration-integrations"
  | "administration-enterprise"
  | "administration-audit"
  | "profile";

export type SocRoleDefinition = {
  id: SocJobRole;
  label: string;
  homePath: string;
  allowedNavIds: ReadonlySet<SocNavId>;
};

export const socJobRoles: SocJobRole[] = [
  "c_level",
  "ciso",
  "soc_manager",
  "analyst_t1",
  "analyst_t2",
  "analyst_t3",
  "legal_procurement",
];

const allVuln: SocNavId[] = [
  "vulnerabilities",
  "vulnerabilities-overview",
  "vulnerabilities-findings",
  "vulnerabilities-exposure",
  "vulnerabilities-work",
  "vulnerabilities-recommendations",
  "vulnerabilities-remediations",
  "vulnerabilities-inventories",
  "vulnerabilities-event-timeline",
];

const allIntel: SocNavId[] = [
  "threat-intelligence",
  "threat-intelligence-indicators",
  "threat-intelligence-actors",
  "threat-intelligence-dark-web",
  "threat-intelligence-attack-surface",
  "threat-intelligence-feeds",
];

const allKb: SocNavId[] = [
  "knowledge-base",
  "knowledge-base-documentation",
  "knowledge-base-procedures",
  "knowledge-base-reports",
  "knowledge-base-trainings",
];

const allAdmin: SocNavId[] = [
  "administration",
  "administration-users",
  "administration-integrations",
  "administration-enterprise",
  "administration-audit",
];

const allAutomation: SocNavId[] = [
  "automation",
  "automation-playbooks",
  "automation-builder",
  "automation-approvals",
];

function navSet(...ids: SocNavId[]): ReadonlySet<SocNavId> {
  return new Set(ids);
}

export const socRoleDefinitions: Record<SocJobRole, SocRoleDefinition> = {
  c_level: {
    id: "c_level",
    label: "C-Level Suite",
    homePath: "/overview",
    allowedNavIds: navSet(
      "overview",
      "vulnerabilities",
      "vulnerabilities-overview",
      "cloud-posture",
      "compliance",
      "knowledge-base",
      "knowledge-base-reports",
      "profile",
    ),
  },
  ciso: {
    id: "ciso",
    label: "CISO",
    homePath: "/overview",
    allowedNavIds: navSet(
      "overview",
      "alerts-incidents",
      "phishing",
      "investigate",
      "assets",
      "cloud-posture",
      ...allVuln,
      "data-security",
      "threat-hunting",
      "on-call",
      ...allIntel,
      ...allAutomation,
      "compliance",
      ...allKb,
      "administration",
      "administration-users",
      "administration-integrations",
      "administration-enterprise",
      "administration-audit",
      "profile",
    ),
  },
  soc_manager: {
    id: "soc_manager",
    label: "SOC Manager",
    homePath: "/overview",
    allowedNavIds: navSet(
      "overview",
      "alerts-incidents",
      "phishing",
      "investigate",
      "assets",
      "cloud-posture",
      ...allVuln,
      "data-security",
      "threat-hunting",
      "on-call",
      ...allIntel,
      ...allAutomation,
      "compliance",
      ...allKb,
      ...allAdmin,
      "profile",
    ),
  },
  analyst_t1: {
    id: "analyst_t1",
    label: "SOC Analyst (Tier-1)",
    homePath: "/overview",
    allowedNavIds: navSet(
      "overview",
      "alerts-incidents",
      "phishing",
      "investigate",
      "assets",
      "vulnerabilities",
      "vulnerabilities-findings",
      "on-call",
      "automation",
      "automation-playbooks",
      "automation-builder",
      "automation-approvals",
      "knowledge-base",
      "knowledge-base-procedures",
      "profile",
    ),
  },
  analyst_t2: {
    id: "analyst_t2",
    label: "SOC Analyst (Tier-2)",
    homePath: "/overview",
    allowedNavIds: navSet(
      "overview",
      "alerts-incidents",
      "phishing",
      "investigate",
      "assets",
      "cloud-posture",
      ...allVuln,
      "data-security",
      "on-call",
      "threat-intelligence",
      "threat-intelligence-indicators",
      ...allAutomation,
      ...allKb,
      "profile",
    ),
  },
  analyst_t3: {
    id: "analyst_t3",
    label: "SOC Analyst (Tier-3)",
    homePath: "/overview",
    allowedNavIds: navSet(
      "overview",
      "alerts-incidents",
      "phishing",
      "investigate",
      "assets",
      "cloud-posture",
      ...allVuln,
      "data-security",
      "threat-hunting",
      "on-call",
      ...allIntel,
      ...allAutomation,
      ...allKb,
      "profile",
    ),
  },
  legal_procurement: {
    id: "legal_procurement",
    label: "Legal / Procurement",
    homePath: "/overview",
    allowedNavIds: navSet(
      "overview",
      "compliance",
      "knowledge-base",
      "knowledge-base-documentation",
      "knowledge-base-reports",
      "profile",
    ),
  },
};

export const socJobRoleLabels: Record<SocJobRole, string> = {
  c_level: socRoleDefinitions.c_level.label,
  ciso: socRoleDefinitions.ciso.label,
  soc_manager: socRoleDefinitions.soc_manager.label,
  analyst_t1: socRoleDefinitions.analyst_t1.label,
  analyst_t2: socRoleDefinitions.analyst_t2.label,
  analyst_t3: socRoleDefinitions.analyst_t3.label,
  legal_procurement: socRoleDefinitions.legal_procurement.label,
};

export function isSocJobRole(value: string): value is SocJobRole {
  return socJobRoles.includes(value as SocJobRole);
}

export function getHomePath(role: SocJobRole): string {
  return socRoleDefinitions[role].homePath;
}

export function roleAllowsNavId(role: SocJobRole, navId: SocNavId): boolean {
  return socRoleDefinitions[role].allowedNavIds.has(navId);
}

/** Path prefixes that are part of the SOC product surface (role-gated). */
const SOC_PATH_PREFIXES = [
  "/overview",
  "/alerts",
  "/incidents",
  "/phishing",
  "/email-security",
  "/investigate",
  "/assets",
  "/cloud-posture",
  "/vulnerabilities",
  "/data-security",
  "/threat-hunting",
  "/purple-team",
  "/threat-intelligence",
  "/automation",
  "/compliance",
  "/knowledge-base",
  "/administration",
  "/on-call",
  "/profile",
] as const;

export function isSocProductPath(pathname: string): boolean {
  return SOC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Map a URL path to the finest matching nav id for ACL checks.
 * Parent ids are checked as fallbacks when leaf ids are not present.
 */
export function pathToNavIds(pathname: string): SocNavId[] {
  if (pathname === "/overview" || pathname.startsWith("/overview/")) {
    return ["overview"];
  }
  if (
    pathname.startsWith("/alerts") ||
    pathname.startsWith("/incidents")
  ) {
    return ["alerts-incidents"];
  }
  if (
    pathname.startsWith("/phishing") ||
    pathname.startsWith("/email-security")
  ) {
    return ["phishing"];
  }
  if (pathname.startsWith("/investigate")) {
    return ["investigate"];
  }
  if (pathname.startsWith("/cloud-posture")) {
    return ["cloud-posture"];
  }
  if (pathname.startsWith("/assets")) {
    return ["assets"];
  }
  if (pathname.startsWith("/vulnerabilities")) {
    if (
      pathname === "/vulnerabilities" ||
      pathname === "/vulnerabilities/"
    ) {
      return ["vulnerabilities-overview", "vulnerabilities"];
    }
    if (pathname.startsWith("/vulnerabilities/findings")) {
      return ["vulnerabilities-findings", "vulnerabilities"];
    }
    if (pathname.startsWith("/vulnerabilities/exposure")) {
      return ["vulnerabilities-exposure", "vulnerabilities"];
    }
    if (pathname.startsWith("/vulnerabilities/work")) {
      return ["vulnerabilities-work", "vulnerabilities"];
    }
    if (pathname.startsWith("/vulnerabilities/recommendations")) {
      return ["vulnerabilities-recommendations", "vulnerabilities-work", "vulnerabilities"];
    }
    if (pathname.startsWith("/vulnerabilities/remediations")) {
      return ["vulnerabilities-remediations", "vulnerabilities-work", "vulnerabilities"];
    }
    if (pathname.startsWith("/vulnerabilities/inventories")) {
      return ["vulnerabilities-inventories", "vulnerabilities-work", "vulnerabilities"];
    }
    if (pathname.startsWith("/vulnerabilities/event-timeline")) {
      return ["vulnerabilities-event-timeline", "vulnerabilities-work", "vulnerabilities"];
    }
    return ["vulnerabilities"];
  }
  if (pathname.startsWith("/data-security")) {
    return ["data-security"];
  }
  if (pathname.startsWith("/purple-team")) {
    return ["threat-hunting"];
  }
  if (pathname.startsWith("/on-call")) {
    return ["on-call", "alerts-incidents"];
  }
  if (pathname.startsWith("/threat-hunting")) {
    return ["threat-hunting"];
  }
  if (pathname.startsWith("/threat-intelligence")) {
    if (
      pathname === "/threat-intelligence" ||
      pathname === "/threat-intelligence/"
    ) {
      return ["threat-intelligence-indicators", "threat-intelligence"];
    }
    if (pathname.startsWith("/threat-intelligence/actors")) {
      return ["threat-intelligence-actors", "threat-intelligence"];
    }
    if (pathname.startsWith("/threat-intelligence/dark-web")) {
      return ["threat-intelligence-dark-web", "threat-intelligence"];
    }
    if (pathname.startsWith("/threat-intelligence/attack-surface")) {
      return ["threat-intelligence-attack-surface", "threat-intelligence"];
    }
    if (pathname.startsWith("/threat-intelligence/feeds")) {
      return ["threat-intelligence-feeds", "threat-intelligence"];
    }
    return ["threat-intelligence"];
  }
  if (pathname.startsWith("/automation")) {
    if (pathname.startsWith("/automation/builder")) {
      return ["automation-builder", "automation"];
    }
    if (pathname.startsWith("/automation/playbooks")) {
      return ["automation-playbooks", "automation"];
    }
    if (pathname.startsWith("/automation/approvals")) {
      return ["automation-approvals", "automation"];
    }
    return ["automation"];
  }
  if (pathname.startsWith("/compliance")) {
    return ["compliance"];
  }
  if (pathname.startsWith("/knowledge-base")) {
    if (pathname.startsWith("/knowledge-base/documentation")) {
      return ["knowledge-base-documentation", "knowledge-base"];
    }
    if (pathname.startsWith("/knowledge-base/procedures")) {
      return ["knowledge-base-procedures", "knowledge-base"];
    }
    if (pathname.startsWith("/knowledge-base/reports")) {
      return ["knowledge-base-reports", "knowledge-base"];
    }
    if (pathname.startsWith("/knowledge-base/trainings")) {
      return ["knowledge-base-trainings", "knowledge-base"];
    }
    return ["knowledge-base"];
  }
  if (pathname.startsWith("/administration")) {
    if (pathname.startsWith("/administration/users")) {
      return ["administration-users", "administration"];
    }
    if (pathname.startsWith("/administration/integrations")) {
      return ["administration-integrations", "administration"];
    }
    if (pathname.startsWith("/administration/enterprise")) {
      return ["administration-enterprise", "administration"];
    }
    if (pathname.startsWith("/administration/audit")) {
      return ["administration-audit", "administration"];
    }
    return ["administration"];
  }
  if (pathname.startsWith("/profile")) {
    return ["profile"];
  }
  return [];
}

export function canAccessPath(role: SocJobRole, pathname: string): boolean {
  if (!isSocProductPath(pathname)) return true;
  const ids = pathToNavIds(pathname);
  if (ids.length === 0) return true;
  const allowed = socRoleDefinitions[role].allowedNavIds;
  return ids.some((id) => allowed.has(id));
}

type NavLeaf = { title: string; url: string; id?: SocNavId };
type NavBranch = {
  title: string;
  badge?: string;
  id?: SocNavId;
  items: NavLeaf[];
  url?: never;
};
type NavLink = {
  title: string;
  url: string;
  badge?: string;
  id?: SocNavId;
  items?: never;
};
type NavItemLike = NavBranch | NavLink;
type NavGroupLike = { title: string; items: NavItemLike[] };

function leafAllowed(role: SocJobRole, leaf: NavLeaf, parentId?: SocNavId) {
  if (leaf.id) return roleAllowsNavId(role, leaf.id);
  if (parentId) return roleAllowsNavId(role, parentId);
  return true;
}

function itemAllowed(role: SocJobRole, item: NavItemLike): boolean {
  if (item.items) {
    if (item.id && !roleAllowsNavId(role, item.id)) {
      const anyChild = item.items.some((leaf) =>
        leaf.id ? roleAllowsNavId(role, leaf.id) : false,
      );
      if (!anyChild) return false;
    }
    return item.items.some((leaf) => leafAllowed(role, leaf, item.id));
  }
  if (item.id) return roleAllowsNavId(role, item.id);
  return true;
}

/** Filter SOC nav groups for the effective role. */
export function filterNavGroups<T extends NavGroupLike>(
  groups: T[],
  role: SocJobRole,
): T[] {
  return groups
    .map((group) => {
      const items = group.items
        .map((item) => {
          if (!itemAllowed(role, item)) return null;
          if (item.items) {
            const children = item.items.filter((leaf) =>
              leafAllowed(role, leaf, item.id),
            );
            if (children.length === 0) return null;
            return { ...item, items: children };
          }
          return item;
        })
        .filter(Boolean) as NavItemLike[];

      return { ...group, items };
    })
    .filter((group) => group.items.length > 0) as T[];
}

/** Map global job role → vulnerabilities module persona. */
export function socJobRoleToVulnPersona(
  role: SocJobRole,
): "ciso" | "tier1" | "tier2" | "tier3" {
  switch (role) {
    case "analyst_t1":
      return "tier1";
    case "analyst_t2":
      return "tier2";
    case "analyst_t3":
      return "tier3";
    case "ciso":
    case "c_level":
    case "soc_manager":
    case "legal_procurement":
    default:
      return "ciso";
  }
}
