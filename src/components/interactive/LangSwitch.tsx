import type { FC } from "react";
import { LOCALES } from "@shared/types";
import type { Locale } from "@shared/types";
import type { LangSwitchProps } from "./LangSwitch.interfaces";

const buildAlternateUrl = (currentPath: string, target: Locale): string => {
  const segments = currentPath.split("/").filter(Boolean);
  if (segments.length === 0) return `/${target}`;
  const first = segments[0] ?? "";
  if ((LOCALES as readonly string[]).includes(first)) {
    segments[0] = target;
  } else {
    segments.unshift(target);
  }
  return `/${segments.join("/")}`;
};

export const LangSwitch: FC<LangSwitchProps> = ({ current, path }) => (
  <div className="lang-switch" role="group" aria-label="Language">
    {LOCALES.map((locale) => (
      <a
        key={locale}
        href={buildAlternateUrl(path, locale)}
        className={locale === current ? "is-active" : undefined}
        aria-current={locale === current ? "true" : undefined}
        lang={locale}
      >
        {locale}
      </a>
    ))}
  </div>
);

export default LangSwitch;
