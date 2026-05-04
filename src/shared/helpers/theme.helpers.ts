import { DEFAULT_THEME, THEME_STORAGE_KEY, THEMES } from "@shared/types";
import type { Theme } from "@shared/types";

const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" && (THEMES as readonly string[]).includes(value);

export const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

export const applyTheme = (theme: Theme): void => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
};

export const persistTheme = (theme: Theme): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* localStorage unavailable — fail silently */
  }
};

export const setTheme = (theme: Theme): void => {
  applyTheme(theme);
  persistTheme(theme);
};

export const toggleTheme = (current: Theme): Theme => {
  const next: Theme = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
};
