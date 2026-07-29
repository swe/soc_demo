"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAdministrationUserByEmail,
} from "@/components/administration/users-data";
import { currentProfile } from "@/components/profile/profile-data";
import {
  isSocJobRole,
  type SocJobRole,
} from "@/lib/soc-roles";

const SESSION_STORAGE_KEY = "soc.auth.session";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title: string;
  /** Job role returned after authorization — drives layout/persona. */
  jobRole: SocJobRole;
};

export type AuthSession = {
  user: AuthUser;
  signedInAt: string;
};

type AuthSessionContextValue = {
  session: AuthSession | null;
  user: AuthUser;
  hydrated: boolean;
  signIn: (email: string, jobRole?: SocJobRole) => AuthSession;
  signOut: () => void;
  setSessionJobRole: (role: SocJobRole) => void;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function profileToAuthUser(
  overrides?: Partial<AuthUser>,
): AuthUser {
  return {
    id: currentProfile.id,
    name: currentProfile.name,
    email: currentProfile.email,
    avatar: currentProfile.avatar,
    title: currentProfile.title,
    jobRole: currentProfile.jobRole,
    ...overrides,
  };
}

export function createDefaultSession(
  overrides?: Partial<AuthUser>,
): AuthSession {
  return {
    user: profileToAuthUser(overrides),
    signedInAt: new Date().toISOString(),
  };
}

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (
      parsed?.user?.email &&
      parsed.user.jobRole &&
      isSocJobRole(parsed.user.jobRole)
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeStoredSession(session: AuthSession | null) {
  try {
    if (!session) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

/** Resolve a demo job role from email hints (login mock). */
export function jobRoleFromEmail(email: string): SocJobRole {
  const e = email.toLowerCase();
  if (e.includes("ceo") || e.includes("cfo") || e.includes("cto") || e.includes("exec")) {
    return "c_level";
  }
  if (e.includes("ciso")) return "ciso";
  if (e.includes("manager") || e.includes("soc-mgr")) return "soc_manager";
  if (e.includes("tier1") || e.includes("t1") || e.includes("triage")) {
    return "analyst_t1";
  }
  if (e.includes("tier3") || e.includes("t3") || e.includes("hunt")) {
    return "analyst_t3";
  }
  if (e.includes("legal") || e.includes("procure")) {
    return "legal_procurement";
  }
  if (e.includes("tier2") || e.includes("t2")) return "analyst_t2";
  return currentProfile.jobRole;
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredSession();
    setSession(stored);
    setHydrated(true);
  }, []);

  const signIn = useCallback((email: string, jobRole?: SocJobRole) => {
    const rosterUser = getAdministrationUserByEmail(email);
    const next: AuthSession = createDefaultSession(
      rosterUser
        ? {
            id: rosterUser.id,
            name: rosterUser.name,
            email: rosterUser.email,
            avatar: rosterUser.avatar,
            title: rosterUser.title,
            jobRole: jobRole ?? rosterUser.jobRole,
          }
        : {
            email,
            name: email.split("@")[0] || currentProfile.name,
            jobRole: jobRole ?? jobRoleFromEmail(email),
          },
    );
    setSession(next);
    writeStoredSession(next);
    return next;
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    writeStoredSession(null);
  }, []);

  const setSessionJobRole = useCallback((role: SocJobRole) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next: AuthSession = {
        ...prev,
        user: { ...prev.user, jobRole: role },
      };
      writeStoredSession(next);
      return next;
    });
  }, []);

  const user = session?.user ?? profileToAuthUser();

  const value = useMemo(
    () => ({
      session,
      user,
      hydrated,
      signIn,
      signOut,
      setSessionJobRole,
    }),
    [session, user, hydrated, signIn, signOut, setSessionJobRole],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return ctx;
}
