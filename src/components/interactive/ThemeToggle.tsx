import type { FC } from "react";
import { useTheme } from "@shared/hooks";
import type { ThemeToggleProps } from "./ThemeToggle.interfaces";

export const ThemeToggle: FC<ThemeToggleProps> = ({ toggleLabel }) => {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggle}
      aria-label={toggleLabel}
      aria-pressed={isDark ? "true" : "false"}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17m10-10l1.4-1.4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
