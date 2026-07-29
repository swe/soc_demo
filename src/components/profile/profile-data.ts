import type { SocJobRole } from "@/lib/soc-roles";

export type ProfileLanguage = "en" | "fr";

export type ProfileThemePreference = "light" | "dark" | "system";

export type ProfileSession = {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActiveLabel: string;
  current: boolean;
  stale: boolean;
};

export type ProfileHardToken = {
  id: string;
  name: string;
  registeredLabel: string;
  lastUsedLabel: string;
};

export type ProfileNotificationPrefs = {
  securityEmail: boolean;
  securityInApp: boolean;
  casesEmail: boolean;
  casesInApp: boolean;
  mentionsEmail: boolean;
  mentionsInApp: boolean;
  digestEmail: boolean;
  digestInApp: boolean;
};

export type CurrentProfile = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  username: string;
  phone: string;
  title: string;
  /** Job role returned after authorization — drives layout/persona. */
  jobRole: SocJobRole;
  timezone: string;
  language: ProfileLanguage;
  mfaEnabled: boolean;
  backupCodesRemaining: number;
  passwordChangedAt: string;
  passwordChangedLabel: string;
  sessions: ProfileSession[];
  hardTokens: ProfileHardToken[];
  notifications: ProfileNotificationPrefs;
};

export const PROFILE_PASSWORD_MAX_AGE_DAYS = 90;

export const profileTimezoneOptions = [
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
] as const;

export const profileLanguageOptions: {
  value: ProfileLanguage;
  label: string;
}[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
];

export const profileBackupCodes = [
  "A7K2-9M4X",
  "Q3WP-8L1N",
  "Z5HT-2C9R",
  "B6YJ-4F8D",
  "P1VX-7K3M",
  "N9QS-5W2L",
  "H4DG-8T6Y",
  "R2CM-1P9K",
];

/** Logged-in demo persona — matches `ava-reed` / Ava Reed on the admin roster. */
export const currentProfile: CurrentProfile = {
  id: "ava-reed",
  name: "Ava Reed",
  email: "ava.reed@svalbard.ca",
  avatar: "/avatars/avatar-3.png",
  username: "ava.reed",
  phone: "+1 (415) 555-0142",
  title: "Tier 2 Analyst",
  jobRole: "analyst_t2",
  timezone: "America/Los_Angeles",
  language: "en",
  mfaEnabled: true,
  backupCodesRemaining: 6,
  passwordChangedAt: "2026-05-12",
  passwordChangedLabel: "May 12, 2026",
  sessions: [
    {
      id: "sess-1",
      device: "MacBook Pro",
      browser: "Chrome 128 · macOS",
      location: "San Francisco, US",
      ip: "104.28.12.44",
      lastActiveLabel: "Active now",
      current: true,
      stale: false,
    },
    {
      id: "sess-2",
      device: "iPhone 15",
      browser: "Safari · iOS",
      location: "San Francisco, US",
      ip: "104.28.12.91",
      lastActiveLabel: "2 hours ago",
      current: false,
      stale: false,
    },
    {
      id: "sess-3",
      device: "Unknown Windows PC",
      browser: "Edge 127 · Windows",
      location: "Dallas, US",
      ip: "45.33.12.8",
      lastActiveLabel: "18 days ago",
      current: false,
      stale: true,
    },
  ],
  hardTokens: [
    {
      id: "token-1",
      name: "YubiKey 5 NFC",
      registeredLabel: "Jan 8, 2026",
      lastUsedLabel: "Yesterday",
    },
  ],
  notifications: {
    securityEmail: true,
    securityInApp: true,
    casesEmail: true,
    casesInApp: true,
    mentionsEmail: false,
    mentionsInApp: true,
    digestEmail: true,
    digestInApp: false,
  },
};

export function getPasswordAgeDays(
  passwordChangedAt: string,
  now = new Date(),
) {
  const changed = new Date(`${passwordChangedAt}T00:00:00`);
  const diffMs = now.getTime() - changed.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getProfileInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export type SecurityChecklistItem = {
  id: "mfa" | "password" | "sessions" | "hard-tokens";
  label: string;
  description: string;
  passed: boolean;
  href: string;
};

export function getSecurityChecklist(
  profile: CurrentProfile,
): SecurityChecklistItem[] {
  const passwordFresh =
    getPasswordAgeDays(profile.passwordChangedAt) <=
    PROFILE_PASSWORD_MAX_AGE_DAYS;
  const sessionsHealthy = profile.sessions.every((session) => !session.stale);

  return [
    {
      id: "mfa",
      label: "MFA enabled",
      description: profile.mfaEnabled
        ? "Authenticator or another second factor is enrolled."
        : "Enable multi-factor authentication to protect sign-in.",
      passed: profile.mfaEnabled,
      href: "#mfa",
    },
    {
      id: "password",
      label: "Password freshness",
      description: passwordFresh
        ? `Last changed ${profile.passwordChangedLabel}.`
        : `Password is older than ${PROFILE_PASSWORD_MAX_AGE_DAYS} days.`,
      passed: passwordFresh,
      href: "#password",
    },
    {
      id: "sessions",
      label: "Session hygiene",
      description: sessionsHealthy
        ? "No stale or unrecognized sessions."
        : "One or more sessions look stale — review and revoke.",
      passed: sessionsHealthy,
      href: "#sessions",
    },
    {
      id: "hard-tokens",
      label: "Hard token registered",
      description:
        profile.hardTokens.length > 0
          ? `${profile.hardTokens.length} hardware key${profile.hardTokens.length === 1 ? "" : "s"} enrolled.`
          : "Register a FIDO / hardware passkey for phishing-resistant MFA.",
      passed: profile.hardTokens.length > 0,
      href: "#hard-tokens",
    },
  ];
}

export function getSecuritySnapshotScore(profile: CurrentProfile) {
  const checklist = getSecurityChecklist(profile);
  const passed = checklist.filter((item) => item.passed).length;
  return {
    passed,
    total: checklist.length,
    percent: Math.round((passed / checklist.length) * 100),
    checklist,
  };
}
