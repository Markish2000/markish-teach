import type { Locale } from "@shared/types";

export interface MobileMenuLink {
  readonly label: string;
  readonly href: string;
}

export interface MobileMenuProps {
  readonly locale: Locale;
  readonly path: string;
  readonly links: ReadonlyArray<MobileMenuLink>;
  readonly ctaLabel: string;
  readonly ctaHref: string;
  readonly openLabel: string;
  readonly closeLabel: string;
  readonly toggleThemeLabel: string;
}
