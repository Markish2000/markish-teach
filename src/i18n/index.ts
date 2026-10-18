import es from "./es.json" with { type: "json" };
import en from "./en.json" with { type: "json" };
import type { Locale } from "@shared/types";
import { LOCALES } from "@shared/types";

/**
 * UI strings. The Spanish file is the source of truth for the shape; the English
 * file must match it exactly (checked here by the type system and by tests).
 */
export type Translations = typeof es;

const dictionary: Readonly<Record<Locale, Translations>> = {
  es,
  en: en satisfies Translations,
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

export const getTranslations = (locale: Locale): Translations => dictionary[locale];

/** Replaces `{name}` placeholders in a translated string. */
export const format = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));

export type { Locale } from "@shared/types";
