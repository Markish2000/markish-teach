import type { ChatTranslations } from "@i18n";

export interface ChatbotProps {
  readonly chat: ChatTranslations;
  readonly contactHref: string;
}

export type ChatBubbleAuthor = "bot" | "user";

export interface ChatBubbleEntry {
  readonly id: string;
  readonly author: ChatBubbleAuthor;
  readonly text: string;
}

export type ChatStage =
  | { readonly kind: "menu" }
  | { readonly kind: "typing" }
  | { readonly kind: "followup" };
