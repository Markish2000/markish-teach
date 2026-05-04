import esRaw from "./es.json" with { type: "json" };
import enRaw from "./en.json" with { type: "json" };
import { DEFAULT_LOCALE, LOCALES } from "@shared/types";
import type { Locale } from "@shared/types";
import type { Dictionary, TranslationPath } from "./i18n.types";
import type { Translations } from "./i18n.interfaces";

const dictionary: Dictionary = {
  es: esRaw as Translations,
  en: enRaw as Translations,
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

export const getTranslations = (locale: Locale): Translations => dictionary[locale];

export const getLocaleFromUrl = (url: URL): Locale => {
  const segment = url.pathname.split("/").filter(Boolean)[0];
  return isLocale(segment) ? segment : DEFAULT_LOCALE;
};

export const getAlternateLocaleUrl = (url: URL, target: Locale): string => {
  const segments = url.pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (isLocale(first)) {
    segments[0] = target;
  } else {
    segments.unshift(target);
  }
  const path = `/${segments.join("/")}`;
  return `${path}${url.search}${url.hash}`;
};

export const t = (path: TranslationPath, locale: Locale): string => {
  const segments = path.split(".");
  let cursor: unknown = dictionary[locale];
  for (const segment of segments) {
    if (cursor === null || typeof cursor !== "object") return path;
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return typeof cursor === "string" ? cursor : path;
};

export type { Locale } from "@shared/types";
export type { Translations } from "./i18n.interfaces";
export type { TranslationPath } from "./i18n.types";
export * from "./i18n.interfaces";
