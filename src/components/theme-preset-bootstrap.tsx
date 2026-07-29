"use client";

import { useLayoutEffect } from "react";

import {
  applyThemePresetToDocument,
  persistThemePresetId,
  readStoredThemePresetId,
} from "@/lib/theme-preset-apply";

/** Applies the saved style preset on first paint after header controls were removed. */
export function ThemePresetBootstrap() {
  useLayoutEffect(() => {
    const presetId = readStoredThemePresetId();
    persistThemePresetId(presetId);
    applyThemePresetToDocument(presetId);
  }, []);

  return null;
}
