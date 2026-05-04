import type { ButtonVariant } from "@shared/types";

interface ButtonBaseProps {
  readonly variant?: ButtonVariant;
  readonly label: string;
  readonly className?: string;
  readonly showArrow?: boolean;
  readonly arrowLabel?: string;
  readonly dataChatbotOpen?: boolean;
}

export interface ButtonAsAnchorProps extends ButtonBaseProps {
  readonly href: string;
  readonly target?: "_self" | "_blank";
  readonly rel?: string;
  readonly type?: never;
  readonly onClickAttribute?: never;
}

export interface ButtonAsButtonProps extends ButtonBaseProps {
  readonly href?: never;
  readonly target?: never;
  readonly rel?: never;
  readonly type?: "button" | "submit";
  readonly onClickAttribute?: string;
}

export type ButtonProps = ButtonAsAnchorProps | ButtonAsButtonProps;
