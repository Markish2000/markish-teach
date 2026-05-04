import { useEffect, useState, useCallback } from "react";
import { applyTheme, getStoredTheme, persistTheme } from "@shared/helpers";
import type { Theme } from "@shared/types";

interface UseThemeResult {
  readonly theme: Theme;
  readonly toggle: () => void;
}

export const useTheme = (): UseThemeResult => {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    applyTheme(stored);
  }, []);

  const toggle = useCallback((): void => {
    setThemeState((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      applyTheme(next);
      persistTheme(next);
      return next;
    });
  }, []);

  return { theme, toggle };
};
