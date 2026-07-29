"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthSession } from "@/components/auth/auth-session";
import {
  canAccessPath,
  getHomePath,
  isSocJobRole,
  type SocJobRole,
} from "@/lib/soc-roles";

const VIEW_AS_STORAGE_KEY = "soc.viewAs.role";

type SocRoleContextValue = {
  /** Role from auth session (entity after authorization). */
  sessionRole: SocJobRole;
  /** Demo View-as override, if any. */
  viewAsRole: SocJobRole | null;
  /** Effective role for nav, overview, and guards. */
  effectiveRole: SocJobRole;
  hydrated: boolean;
  setViewAsRole: (role: SocJobRole | null) => void;
};

const SocRoleContext = createContext<SocRoleContextValue | null>(null);

function readViewAs(): SocJobRole | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(VIEW_AS_STORAGE_KEY);
    if (raw && isSocJobRole(raw)) return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function SocRoleProvider({ children }: { children: ReactNode }) {
  const { user, hydrated: authHydrated } = useAuthSession();
  const [viewAsRole, setViewAsRoleState] = useState<SocJobRole | null>(null);
  const [roleHydrated, setRoleHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setViewAsRoleState(readViewAs());
    setRoleHydrated(true);
  }, []);

  const setViewAsRole = useCallback((role: SocJobRole | null) => {
    setViewAsRoleState(role);
    try {
      if (role) {
        window.localStorage.setItem(VIEW_AS_STORAGE_KEY, role);
      } else {
        window.localStorage.removeItem(VIEW_AS_STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const sessionRole = user.jobRole;
  const effectiveRole = viewAsRole ?? sessionRole;
  const hydrated = authHydrated && roleHydrated;

  useEffect(() => {
    if (!hydrated) return;
    if (!canAccessPath(effectiveRole, pathname)) {
      router.replace(getHomePath(effectiveRole));
    }
  }, [effectiveRole, hydrated, pathname, router]);

  const value = useMemo(
    () => ({
      sessionRole,
      viewAsRole,
      effectiveRole,
      hydrated,
      setViewAsRole,
    }),
    [sessionRole, viewAsRole, effectiveRole, hydrated, setViewAsRole],
  );

  return (
    <SocRoleContext.Provider value={value}>{children}</SocRoleContext.Provider>
  );
}

export function useSocRole() {
  const ctx = useContext(SocRoleContext);
  if (!ctx) {
    throw new Error("useSocRole must be used within SocRoleProvider");
  }
  return ctx;
}
