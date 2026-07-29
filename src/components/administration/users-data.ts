import type { SocJobRole } from "@/lib/soc-roles";

export type AdministrationAccessRole =
  | "Owner"
  | "Admin"
  | "Analyst"
  | "Responder"
  | "Viewer";

export type AdministrationUserStatus = "online" | "away" | "offline";

export type AdministrationInvitationStatus = "pending" | "expiring" | "expired";

export type AdministrationTeam = {
  id: string;
  name: string;
};

export type AdministrationUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  role: AdministrationAccessRole;
  /** Job role / persona used for layout after authorization. */
  jobRole: SocJobRole;
  status: AdministrationUserStatus;
  twoFactorEnabled: boolean;
  teamIds: string[];
  joinedDate: string;
  /** Pre-rendered so server and client markup stay identical. */
  lastActiveLabel: string;
  /** Session-only suspend flag for admin demo mutations. */
  suspended?: boolean;
};

export type AdministrationInvitation = {
  id: string;
  email: string;
  role: Exclude<AdministrationAccessRole, "Owner" | "Admin">;
  teamIds: string[];
  invitedBy: string;
  invitedDate: string;
  expiresLabel: string;
  status: AdministrationInvitationStatus;
};

export const administrationAccessRoles: AdministrationAccessRole[] = [
  "Owner",
  "Admin",
  "Analyst",
  "Responder",
  "Viewer",
];

export const administrationInviteRoles: Exclude<
  AdministrationAccessRole,
  "Owner" | "Admin"
>[] = ["Analyst", "Responder", "Viewer"];

export const administrationRoleDescriptions: Record<
  AdministrationAccessRole,
  string
> = {
  Owner: "Full control over the workspace, billing, and access policies.",
  Admin: "Manages users, integrations, and detection configuration.",
  Analyst: "Triages alerts, runs hunts, and closes investigations.",
  Responder: "Executes containment actions and owns incident response.",
  Viewer: "Read-only access to dashboards, alerts, and reports.",
};

export const administrationTeams: AdministrationTeam[] = [
  { id: "TIER1", name: "Tier 1 Triage" },
  { id: "TIER2", name: "Tier 2 Investigations" },
  { id: "IR", name: "Incident Response" },
  { id: "INTEL", name: "Threat Intelligence" },
  { id: "DETECT", name: "Detection Engineering" },
  { id: "VULN", name: "Vulnerability Management" },
  { id: "GRC", name: "Governance & Compliance" },
];

export const privilegedAccessRoles: AdministrationAccessRole[] = [
  "Owner",
  "Admin",
];

export function isAdministrationPrivilegedRole(role: AdministrationAccessRole) {
  return privilegedAccessRoles.includes(role);
}

/** Elevated access without MFA, or any account with MFA disabled. */
export function isAdministrationRiskUser(user: AdministrationUser) {
  if (!user.twoFactorEnabled) {
    return true;
  }

  return false;
}

/** Derive demo job role from job title for roster seeds. */
export function jobRoleFromTitle(title: string): SocJobRole {
  const t = title.toLowerCase();
  if (
    t.includes("ciso") ||
    t.includes("director") ||
    t.includes("chief") ||
    t.includes("vp ")
  ) {
    return "ciso";
  }
  if (t.includes("compliance") || t.includes("grc") || t.includes("auditor")) {
    return "legal_procurement";
  }
  if (t.includes("manager") || t.includes("lead") || t.includes("architect")) {
    return "soc_manager";
  }
  if (t.includes("tier 1") || t.includes("tier1") || t.includes("mssp")) {
    return "analyst_t1";
  }
  if (
    t.includes("tier 3") ||
    t.includes("tier3") ||
    t.includes("threat intel") ||
    t.includes("forensics") ||
    t.includes("hunt")
  ) {
    return "analyst_t3";
  }
  return "analyst_t2";
}

type AdministrationUserSeed = Omit<AdministrationUser, "jobRole"> & {
  jobRole?: SocJobRole;
};

export function getAdministrationUserStats(users: AdministrationUser[]) {
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "online").length;
  const mfaEnabled = users.filter((user) => user.twoFactorEnabled).length;
  const privilegedUsers = users.filter((user) =>
    isAdministrationPrivilegedRole(user.role),
  ).length;
  const mfaCoverage =
    totalUsers === 0 ? 0 : Math.round((mfaEnabled / totalUsers) * 100);

  return {
    totalUsers,
    activeUsers,
    mfaCoverage,
    privilegedUsers,
  };
}

/**
 * Demo SOC roster — Peter Pan Neverland cast.
 * Stable IDs are retained so alerts/incidents/compliance links stay connected.
 */
export const administrationUserSeeds: AdministrationUserSeed[] = [
  {
    id: "riya-sharma",
    name: "Wendy Darling",
    email: "wendy.darling@svalbard.ca",
    avatar: "/avatars/avatar-1.png",
    title: "SOC Director",
    role: "Owner",
    status: "online",
    twoFactorEnabled: true,
    teamIds: ["IR", "TIER2", "GRC"],
    joinedDate: "2023-03-11",
    lastActiveLabel: "Active now",
  },
  {
    id: "ben-lewis",
    name: "John Darling",
    email: "john.darling@svalbard.ca",
    avatar: "/avatars/avatar-2.png",
    title: "Security Engineering Lead",
    role: "Admin",
    status: "online",
    twoFactorEnabled: true,
    teamIds: ["DETECT", "TIER2"],
    joinedDate: "2023-11-08",
    lastActiveLabel: "4 minutes ago",
  },
  {
    id: "ava-reed",
    name: "Peter Pan",
    email: "peter.pan@svalbard.ca",
    avatar: "/avatars/avatar-3.png",
    title: "Tier 2 Analyst",
    role: "Analyst",
    status: "online",
    twoFactorEnabled: true,
    teamIds: ["TIER2", "INTEL"],
    joinedDate: "2024-04-22",
    lastActiveLabel: "12 minutes ago",
  },
  {
    id: "maya-rao",
    name: "Tiger Lily",
    email: "tiger.lily@svalbard.ca",
    avatar: "/avatars/avatar-4.png",
    title: "Incident Responder",
    role: "Responder",
    status: "away",
    twoFactorEnabled: true,
    teamIds: ["IR", "TIER2"],
    joinedDate: "2024-01-17",
    lastActiveLabel: "1 hour ago",
  },
  {
    id: "owen-lee",
    name: "Tootles",
    email: "tootles@svalbard.ca",
    avatar: "/avatars/avatar-5.png",
    title: "Tier 1 Analyst",
    role: "Analyst",
    status: "offline",
    twoFactorEnabled: false,
    teamIds: ["TIER1"],
    joinedDate: "2025-02-10",
    lastActiveLabel: "3 days ago",
  },
  {
    id: "chloe-park",
    name: "Tinker Bell",
    email: "tinker.bell@svalbard.ca",
    avatar: "/avatars/avatar-6.png",
    title: "Threat Intel Analyst",
    role: "Analyst",
    status: "online",
    twoFactorEnabled: true,
    teamIds: ["INTEL", "TIER2"],
    joinedDate: "2024-09-03",
    lastActiveLabel: "26 minutes ago",
  },
  {
    id: "victor-hale",
    name: "James Hook",
    email: "james.hook@svalbard.ca",
    avatar: "/avatars/avatar-black-1.png",
    title: "Security Architect",
    role: "Admin",
    status: "away",
    twoFactorEnabled: true,
    teamIds: ["DETECT", "GRC", "VULN"],
    joinedDate: "2023-08-14",
    lastActiveLabel: "2 hours ago",
  },
  {
    id: "kabir-sethi",
    name: "Mr. Smee",
    email: "smee@svalbard.ca",
    avatar: "/avatars/avatar-black-2.png",
    title: "Detection Engineer",
    role: "Analyst",
    status: "online",
    twoFactorEnabled: true,
    teamIds: ["DETECT"],
    joinedDate: "2024-06-18",
    lastActiveLabel: "Active now",
  },
  {
    id: "dina-moss",
    name: "Nana",
    email: "nana@partners.svalbard.ca",
    avatar: "/avatars/avatar-black-3.png",
    title: "MSSP Support Partner",
    role: "Viewer",
    status: "offline",
    twoFactorEnabled: false,
    teamIds: ["TIER1"],
    joinedDate: "2025-01-09",
    lastActiveLabel: "2 weeks ago",
  },
  {
    id: "leo-park",
    name: "Slightly",
    email: "slightly@svalbard.ca",
    avatar: "/avatars/avatar-black-4.png",
    title: "Forensics Specialist",
    role: "Responder",
    status: "online",
    twoFactorEnabled: true,
    teamIds: ["IR", "TIER2"],
    joinedDate: "2024-07-01",
    lastActiveLabel: "38 minutes ago",
  },
  {
    id: "sofia-ahmed",
    name: "Mary Darling",
    email: "mary.darling@svalbard.ca",
    avatar: "/avatars/avatar-black-5.png",
    title: "Compliance Manager",
    role: "Admin",
    status: "away",
    twoFactorEnabled: true,
    teamIds: ["GRC"],
    joinedDate: "2023-12-05",
    lastActiveLabel: "5 hours ago",
  },
  {
    id: "tia-west",
    name: "Nibs",
    email: "nibs@svalbard.ca",
    avatar: "/avatars/avatar-black-6.png",
    title: "Vulnerability Analyst",
    role: "Analyst",
    status: "offline",
    twoFactorEnabled: false,
    teamIds: ["VULN", "TIER1"],
    joinedDate: "2025-03-07",
    lastActiveLabel: "6 days ago",
  },
  {
    id: "ethan-cole",
    name: "Curly",
    email: "curly@svalbard.ca",
    avatar: "/avatars/avatar-bw-1.png",
    title: "Automation Engineer",
    role: "Analyst",
    status: "online",
    twoFactorEnabled: true,
    teamIds: ["DETECT", "IR"],
    joinedDate: "2024-05-13",
    lastActiveLabel: "9 minutes ago",
  },
  {
    id: "nina-brooks",
    name: "Michael Darling",
    email: "michael.darling@svalbard.ca",
    avatar: "/avatars/avatar-bw-2.png",
    title: "GRC Auditor",
    role: "Viewer",
    status: "away",
    twoFactorEnabled: true,
    teamIds: ["GRC"],
    joinedDate: "2025-02-24",
    lastActiveLabel: "3 hours ago",
  },
  {
    id: "jules-hart",
    name: "Cecco",
    email: "cecco@svalbard.ca",
    avatar: "/avatars/avatar-bw-3.png",
    title: "Cloud Security Engineer",
    role: "Responder",
    status: "online",
    twoFactorEnabled: true,
    teamIds: ["IR", "VULN"],
    joinedDate: "2024-08-26",
    lastActiveLabel: "51 minutes ago",
  },
  {
    id: "harper-singh",
    name: "Bill Jukes",
    email: "bill.jukes@svalbard.ca",
    avatar: "/avatars/avatar-bw-4.png",
    title: "Tier 1 Analyst",
    role: "Analyst",
    status: "offline",
    twoFactorEnabled: false,
    teamIds: ["TIER1", "INTEL"],
    joinedDate: "2024-10-15",
    lastActiveLabel: "4 days ago",
  },
];

export const administrationUsers: AdministrationUser[] =
  administrationUserSeeds.map((user) => ({
    ...user,
    jobRole: user.jobRole ?? jobRoleFromTitle(user.title),
  }));

export function getAdministrationUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return (
    administrationUsers.find(
      (user) => user.email.toLowerCase() === normalized,
    ) ?? null
  );
}

export function getAdministrationUserById(id: string) {
  return administrationUsers.find((user) => user.id === id) ?? null;
}

export const administrationInvitations: AdministrationInvitation[] = [
  {
    id: "invite-noah-frost",
    email: "starkey@svalbard.ca",
    role: "Analyst",
    teamIds: ["TIER1"],
    invitedBy: "Wendy Darling",
    invitedDate: "2026-07-21",
    expiresLabel: "Expires in 4 days",
    status: "pending",
  },
  {
    id: "invite-priya-nair",
    email: "skylights@svalbard.ca",
    role: "Responder",
    teamIds: ["IR", "TIER2"],
    invitedBy: "John Darling",
    invitedDate: "2026-07-19",
    expiresLabel: "Expires in 2 days",
    status: "pending",
  },
  {
    id: "invite-marcus-oduya",
    email: "noodler@svalbard.ca",
    role: "Analyst",
    teamIds: ["DETECT", "GRC"],
    invitedBy: "Wendy Darling",
    invitedDate: "2026-07-17",
    expiresLabel: "Expires tomorrow",
    status: "expiring",
  },
  {
    id: "invite-elena-vidal",
    email: "mullins@partners.svalbard.ca",
    role: "Viewer",
    teamIds: ["TIER1"],
    invitedBy: "Mary Darling",
    invitedDate: "2026-07-14",
    expiresLabel: "Expires in 6 hours",
    status: "expiring",
  },
  {
    id: "invite-tom-castillo",
    email: "alf.mason@svalbard.ca",
    role: "Analyst",
    teamIds: ["INTEL"],
    invitedBy: "James Hook",
    invitedDate: "2026-06-30",
    expiresLabel: "Expired 8 days ago",
    status: "expired",
  },
  {
    id: "invite-ada-kimura",
    email: "cookson@svalbard.ca",
    role: "Analyst",
    teamIds: ["VULN", "TIER2"],
    invitedBy: "John Darling",
    invitedDate: "2026-07-22",
    expiresLabel: "Expires in 5 days",
    status: "pending",
  },
];

export const administrationStatusColors: Record<
  AdministrationUserStatus,
  string
> = {
  online: "#16a34a",
  away: "#eab308",
  offline: "#71717a",
};

const teamById = new Map(
  administrationTeams.map((team) => [team.id, team] as const),
);

export function getAdministrationInitials(name: string) {
  return name
    .split(" ")
    .map((segment) => segment[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getAdministrationTeams(teamIds: string[]) {
  return teamIds
    .map((teamId) => teamById.get(teamId))
    .filter((team): team is AdministrationTeam => Boolean(team));
}
