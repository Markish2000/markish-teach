import type { Locale } from "@shared/types";
import { LOCALES } from "@shared/types";

/**
 * Localized URL segments. Every public page is built from one of these sections
 * (plus a slug for collection entries), so canonical URLs, hreflang alternates,
 * the language switcher, breadcrumbs and the sitemap all derive from one place.
 */
export const SECTIONS = {
  home: { es: "", en: "" },
  services: { es: "servicios", en: "services" },
  projects: { es: "proyectos", en: "projects" },
  about: { es: "sobre-nosotros", en: "about" },
  faq: { es: "preguntas-frecuentes", en: "faq" },
  contact: { es: "contacto", en: "contact" },
  privacy: { es: "privacidad", en: "privacy" },
  blog: { es: "blog", en: "blog" },
} as const satisfies Record<string, Record<Locale, string>>;

export type SectionKey = keyof typeof SECTIONS;

/** Path for a locale/section pair, optionally followed by an entry slug. No trailing slash. */
export const localePath = (locale: Locale, section: SectionKey, slug?: string): string =>
  `/${[locale, SECTIONS[section][locale], slug].filter(Boolean).join("/")}`;

/** Paths of the same page in every locale, keyed by locale. */
export type Alternates = Partial<Record<Locale, string>>;

export const sectionAlternates = (section: SectionKey): Alternates =>
  Object.fromEntries(LOCALES.map((locale) => [locale, localePath(locale, section)]));

/** Home-page anchors used by in-page navigation. */
export const SECTION_IDS = {
  services: "services",
  work: "work",
  process: "process",
  contact: "contact",
} as const;
