import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const locale = z.enum(["es", "en"]);

/** Ids keep the locale folder ("es/desarrollo-web") so translations sharing a slug don't collide. */
const byPath = ({ entry }: { entry: string }) => entry.replace(/\.(ya?ml|md)$/, "");

const faqItem = z.object({
  q: z.string(),
  a: z.string(),
});

/**
 * Each entry lives in `<collection>/<locale>/<slug>.yaml`. `key` is shared by the
 * translations of the same entry and links them for hreflang and the language switcher.
 */
const services = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/services", generateId: byPath }),
  schema: z.object({
    locale,
    key: z.string(),
    slug: z.string(),
    order: z.number(),
    name: z.string(),
    title: z.string().max(70),
    description: z.string().min(70).max(170),
    h1: z.string(),
    summary: z.string(),
    card: z.string(),
    serviceType: z.string(),
    problems: z.array(z.string()),
    audience: z.array(z.string()),
    deliverables: z.array(z.object({ title: z.string(), text: z.string() })),
    method: z.array(z.object({ title: z.string(), text: z.string() })),
    tech: z.array(z.string()),
    whenYes: z.array(z.string()),
    whenNo: z.array(z.string()),
    projects: z.array(z.string()).default([]),
    related: z.array(z.string()).default([]),
    faqs: z.array(faqItem),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/projects", generateId: byPath }),
  schema: ({ image }) =>
    z.object({
      locale,
      key: z.string(),
      slug: z.string(),
      order: z.number(),
      name: z.string(),
      relation: z.enum(["own", "client"]),
      status: z.enum(["live", "in-development"]),
      url: z.url(),
      industry: z.string(),
      title: z.string().max(70),
      description: z.string().min(70).max(170),
      summary: z.string(),
      image: image(),
      imageAlt: z.string(),
      year: z.number(),
      problem: z.string(),
      goal: z.string(),
      solution: z.string(),
      features: z.array(z.string()),
      stack: z.array(z.object({ area: z.string(), items: z.array(z.string()) })),
      architecture: z.array(z.string()),
      challenges: z.array(z.object({ title: z.string(), text: z.string() })),
      /** Only verifiable outcomes. Empty until there is evidence to publish. */
      results: z.array(z.string()).default([]),
      services: z.array(z.string()).default([]),
    }),
});

const faq = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/faq" }),
  schema: z.object({
    locale,
    groups: z.array(
      z.object({
        title: z.string(),
        items: z.array(
          faqItem.extend({
            id: z.string(),
            links: z
              .array(
                z.object({
                  label: z.string(),
                  /** A SECTIONS key (e.g. "contact") or "service"/"project" with `key`. */
                  to: z.string(),
                  key: z.string().optional(),
                }),
              )
              .default([]),
          }),
        ),
      }),
    ),
  }),
});

/**
 * Articles stay `draft: true` until the author reviews them. Drafts are never
 * routed, listed, added to the sitemap or exposed in llms.txt.
 */
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog", generateId: byPath }),
  schema: z.object({
    locale,
    key: z.string(),
    title: z.string().max(70),
    description: z.string().max(170),
    draft: z.boolean().default(true),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    services: z.array(z.string()).default([]),
    related: z.array(reference("blog")).default([]),
  }),
});

export const collections = { services, projects, faq, blog };
