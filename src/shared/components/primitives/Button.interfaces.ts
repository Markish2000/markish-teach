import type { ButtonVariant } from "@shared/types";

interface ButtonBaseProps {
  readonly variant?: ButtonVariant;
  readonly label: string;
  readonly className?: string;
  readonly showArrow?: boolean;
  /** Extra text for screen readers only, e.g. "(opens in a new tab)". */
  readonly srHint?: string;
}

export interface ButtonAsAnchorProps extends ButtonBaseProps {
  readonly href: string;
  readonly target?: "_self" | "_blank";
  readonly rel?: string;
  readonly type?: never;
}

export interface ButtonAsButtonProps extends ButtonBaseProps {
  readonly href?: never;
  readonly target?: never;
  readonly rel?: never;
  readonly type?: "button" | "submit";
}

export type ButtonProps = ButtonAsAnchorProps | ButtonAsButtonProps;
