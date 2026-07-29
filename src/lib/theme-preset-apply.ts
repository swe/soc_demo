import {
  defaultDarkThemeStyles,
  defaultLightThemeStyles,
} from "@/lib/theme-preset-defaults";
import { defaultPresets } from "@/lib/theme-presets";

export const THEME_PRESET_STORAGE_KEY = "theme-preset";

/** Product-facing style choices (Default = base tokens, Minimal = modern-minimal). */
export const ALLOWED_THEME_PRESET_IDS = ["default", "modern-minimal"] as const;

export type AllowedThemePresetId = (typeof ALLOWED_THEME_PRESET_IDS)[number];

export function isAllowedThemePresetId(
  presetId: string,
): presetId is AllowedThemePresetId {
  return (ALLOWED_THEME_PRESET_IDS as readonly string[]).includes(presetId);
}

export function resolveThemePresetId(presetId: string | null | undefined) {
  if (presetId && isAllowedThemePresetId(presetId)) {
    return presetId;
  }
  return "default";
}

export function readStoredThemePresetId(): AllowedThemePresetId {
  if (typeof window === "undefined") {
    return "default";
  }
  return resolveThemePresetId(
    window.localStorage.getItem(THEME_PRESET_STORAGE_KEY),
  );
}

export function persistThemePresetId(presetId: AllowedThemePresetId) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(THEME_PRESET_STORAGE_KEY, presetId);
}

export type MergedThemeStyles = {
  light: Record<string, string>;
  dark: Record<string, string>;
};

function mergePresetWithDefaults(presetStyles: {
  light?: Record<string, string>;
  dark?: Record<string, string>;
}): MergedThemeStyles {
  return {
    light: { ...defaultLightThemeStyles, ...(presetStyles.light || {}) },
    dark: {
      ...defaultDarkThemeStyles,
      ...(presetStyles.light || {}),
      ...(presetStyles.dark || {}),
    },
  };
}

export function getMergedStylesForPreset(
  presetId: string,
): MergedThemeStyles | null {
  if (presetId === "default") return null;
  const preset = defaultPresets[presetId];
  if (!preset) return null;
  return mergePresetWithDefaults(preset.styles);
}

function stylesToCssBlock(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join("\n");
}

export function buildPresetStylesheet(merged: MergedThemeStyles): string {
  return `:root {\n${stylesToCssBlock(merged.light)}\n}\n.dark {\n${stylesToCssBlock(merged.dark)}\n}`;
}

const STYLE_ID = "theme-preset-style";

export function applyThemePresetToDocument(presetId: string): void {
  if (typeof document === "undefined") return;

  const resolvedId = resolveThemePresetId(presetId);
  const existing = document.getElementById(STYLE_ID);
  if (resolvedId === "default") {
    existing?.remove();
    return;
  }

  const merged = getMergedStylesForPreset(resolvedId);
  if (!merged) {
    existing?.remove();
    return;
  }

  const css = buildPresetStylesheet(merged);
  let el = existing as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

export function getPresetLabel(presetId: string): string {
  if (presetId === "default") return "Default";
  if (presetId === "modern-minimal") return "Minimal";
  return defaultPresets[presetId]?.label ?? presetId;
}

export function listPresetIdsSorted(): AllowedThemePresetId[] {
  return [...ALLOWED_THEME_PRESET_IDS];
}

export function getPresetPreviewColors(
  presetId: string,
  mode: "light" | "dark",
): [string, string, string, string] {
  const merged =
    presetId === "default"
      ? {
          light: { ...defaultLightThemeStyles },
          dark: { ...defaultDarkThemeStyles },
        }
      : getMergedStylesForPreset(presetId);
  const styles = merged
    ? merged[mode]
    : mode === "light"
      ? { ...defaultLightThemeStyles }
      : { ...defaultDarkThemeStyles };
  return [
    styles.primary ?? "#000",
    styles.secondary ?? "#ccc",
    styles.accent ?? "#eee",
    styles.background ?? "#fff",
  ];
}
