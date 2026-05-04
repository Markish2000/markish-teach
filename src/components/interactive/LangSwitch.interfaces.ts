import type { Locale } from "@shared/types";

export interface LangSwitchProps {
  readonly current: Locale;
  readonly path: string;
}
