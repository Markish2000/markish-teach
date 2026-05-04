import type { Locale } from "@shared/types";

export const SECTION_IDS = {
  top: "top",
  services: "services",
  work: "work",
  process: "process",
  quality: "quality",
  contact: "contact",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export const getLocaleHomeUrl = (locale: Locale): string => `/${locale}`;
