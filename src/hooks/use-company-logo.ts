"use client";

import { useEffect, useState } from "react";

import {
  clearCompanyLogo,
  COMPANY_LOGO_CHANGE_EVENT,
  COMPANY_LOGO_STORAGE_KEY,
  readCompanyLogo,
  writeCompanyLogo,
} from "@/lib/company-logo";

export function useCompanyLogo() {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLogoSrc(readCompanyLogo());

    const handleCustom = (event: Event) => {
      const detail = (event as CustomEvent<string | null>).detail;
      setLogoSrc(detail ?? null);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === COMPANY_LOGO_STORAGE_KEY) {
        setLogoSrc(event.newValue);
      }
    };

    window.addEventListener(COMPANY_LOGO_CHANGE_EVENT, handleCustom);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(COMPANY_LOGO_CHANGE_EVENT, handleCustom);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return {
    logoSrc,
    mounted,
    setLogo: (dataUrl: string) => {
      writeCompanyLogo(dataUrl);
      setLogoSrc(dataUrl);
    },
    clearLogo: () => {
      clearCompanyLogo();
      setLogoSrc(null);
    },
  };
}
