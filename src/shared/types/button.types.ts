export const BUTTON_VARIANTS = ["primary", "secondary", "icon"] as const;

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
