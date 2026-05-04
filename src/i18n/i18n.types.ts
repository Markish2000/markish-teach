import type { Locale } from "@shared/types";
import type { Translations } from "./i18n.interfaces";

export type Dictionary = Readonly<Record<Locale, Translations>>;

type Primitive = string | number | boolean | null;

type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Primitive | ReadonlyArray<unknown>
    ? `${Key}`
    : T[Key] extends object
      ? `${Key}` | `${Key}.${PathImpl<T[Key], keyof T[Key]>}`
      : never
  : never;

export type TranslationPath = PathImpl<Translations, keyof Translations>;
