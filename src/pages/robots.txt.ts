import type { APIRoute } from "astro";
import { SITE_URL } from "@shared/constants";

/**
 * Public site: everything is crawlable except the contact API.
 *
 * AI crawlers are listed explicitly to document the owner's decision to allow
 * both search/citation and model-training crawlers (tokens verified against each
 * vendor's documentation, see docs/geo/ai-discoverability.md). A crawler that
 * matches a named group ignores the `*` group, so each group repeats the rules.
 */
const AI_CRAWLERS = [
  // OpenAI: search, user-initiated fetches, training
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  // Anthropic: search, user-initiated fetches, training
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  // Perplexity: search, user-initiated fetches
  "PerplexityBot",
  "Perplexity-User",
  // Google Gemini / Vertex AI training and grounding (control token, not a crawler)
  "Google-Extended",
  // Apple: search features and generative model training (control token)
  "Applebot",
  "Applebot-Extended",
  // Common Crawl, a source of many open datasets
  "CCBot",
];

const rules = ["Allow: /", "Disallow: /api/"];

export const GET: APIRoute = () => {
  const groups = [
    ["User-agent: *", ...rules].join("\n"),
    [...AI_CRAWLERS.map((bot) => `User-agent: ${bot}`), ...rules].join("\n"),
  ];
  const body = `${groups.join("\n\n")}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
