import { expect, test, type APIRequestContext } from "@playwright/test";
import { SITE_URL, getSitemapPaths, localeOf, toPath } from "./helpers";

interface Head {
  path: string;
  status: number;
  lang: string | null;
  title: string;
  description: string;
  canonical: string | null;
  robots: string | null;
  h1: number;
  alternates: Record<string, string>;
  og: Record<string, string>;
}

const LANG = { es: "es-AR", en: "en-US" } as const;

/** Parses the served HTML (what crawlers get), not the hydrated DOM. */
async function readHead(request: APIRequestContext, path: string): Promise<Head> {
  const res = await request.get(path);
  const html = await res.text();
  const attr = (re: RegExp) => html.match(re)?.[1] ?? null;
  const alternates: Record<string, string> = {};
  for (const m of html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)) {
    alternates[m[1]!] = m[2]!;
  }
  const og: Record<string, string> = {};
  for (const m of html.matchAll(/<meta property="(og:[^"]+)" content="([^"]*)"/g)) og[m[1]!] = m[2]!;
  return {
    path,
    status: res.status(),
    lang: attr(/<html[^>]*\slang="([^"]+)"/),
    title: (attr(/<title>([^<]*)<\/title>/) ?? "").trim(),
    description: attr(/<meta name="description" content="([^"]*)"/) ?? "",
    canonical: attr(/<link rel="canonical" href="([^"]+)"/),
    robots: attr(/<meta name="robots" content="([^"]+)"/),
    h1: (html.match(/<h1[\s>]/g) ?? []).length,
    alternates,
    og,
  };
}

test.describe("technical SEO", () => {
  let heads: Head[] = [];

  test.beforeAll(async ({ request }) => {
    const paths = await getSitemapPaths(request);
    heads = await Promise.all(paths.map((p) => readHead(request, p)));
  });

  test("each page has its own title, description, canonical, lang and one h1", () => {
    const problems: string[] = [];
    for (const h of heads) {
      const locale = localeOf(h.path);
      if (h.status !== 200) problems.push(`${h.path}: status ${h.status}`);
      if (h.lang !== LANG[locale]) problems.push(`${h.path}: lang=${h.lang}`);
      if (h.title.length < 20 || h.title.length > 70) problems.push(`${h.path}: title length ${h.title.length}`);
      if (h.description.length < 70 || h.description.length > 170)
        problems.push(`${h.path}: description length ${h.description.length}`);
      if (h.canonical !== `${SITE_URL}${h.path}`) problems.push(`${h.path}: canonical ${h.canonical}`);
      if (h.h1 !== 1) problems.push(`${h.path}: ${h.h1} h1 elements`);
      if (!h.robots?.startsWith("index")) problems.push(`${h.path}: robots ${h.robots}`);
      if (!h.og["og:image"]?.startsWith("https://")) problems.push(`${h.path}: og:image not absolute`);
      if (h.og["og:url"] !== h.canonical) problems.push(`${h.path}: og:url differs from canonical`);
    }
    const dupes = (key: "title" | "description") =>
      heads
        .map((h) => h[key])
        .filter((v, i, all) => all.indexOf(v) !== i)
        .map((v) => `duplicate ${key}: ${v}`);
    problems.push(...dupes("title"), ...dupes("description"));
    expect(problems, problems.join("\n")).toEqual([]);
  });

  test("hreflang alternates are reciprocal and include x-default", () => {
    const byUrl = new Map(heads.map((h) => [`${SITE_URL}${h.path}`, h]));
    const problems: string[] = [];
    for (const h of heads) {
      const own = `${SITE_URL}${h.path}`;
      const alts = Object.entries(h.alternates);
      if (alts.length === 0) continue; // single-language page
      if (h.alternates[LANG[localeOf(h.path)]] !== own) problems.push(`${h.path}: missing self hreflang`);
      if (!h.alternates["x-default"]) problems.push(`${h.path}: missing x-default`);
      for (const [lang, href] of alts) {
        if (lang === "x-default") continue;
        const target = byUrl.get(href);
        if (!target) {
          problems.push(`${h.path}: hreflang ${lang} -> ${href} not in sitemap`);
          continue;
        }
        if (target.lang !== lang) problems.push(`${h.path}: hreflang ${lang} points to lang=${target.lang}`);
        if (!Object.values(target.alternates).includes(own))
          problems.push(`${h.path}: ${href} does not link back`);
      }
    }
    expect(problems, problems.join("\n")).toEqual([]);
  });
});

test("robots.txt allows crawling, blocks the API and points to the sitemap", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain("User-agent: *");
  expect(body).toMatch(/^Allow: \/$/m);
  expect(body).not.toMatch(/^Disallow: \/$/m);
  expect(body).toContain("Disallow: /api/");
  expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  for (const bot of ["OAI-SearchBot", "GPTBot", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended"]) {
    expect(body).toContain(`User-agent: ${bot}`);
  }
});

test("sitemap is valid XML with only canonical 200 URLs", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.headers()["content-type"]).toContain("xml");
  const xml = await res.text();
  expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  expect(new Set(locs).size).toBe(locs.length);
  for (const loc of locs) {
    expect(loc.startsWith(`${SITE_URL}/`)).toBe(true);
    const head = await readHead(request, toPath(loc));
    expect(head.status, loc).toBe(200);
    expect(head.canonical, loc).toBe(loc);
  }
  const index = await (await request.get("/sitemap-index.xml")).text();
  expect(index).toContain(`${SITE_URL}/sitemap.xml`);
});

test("llms.txt files exist and only link to live pages", async ({ request }) => {
  for (const file of ["/llms.txt", "/llms-full.txt"]) {
    const res = await request.get(file);
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body.startsWith("# Markish Tech")).toBe(true);
    const links = [...body.matchAll(/\]\((https:\/\/www\.markishtech\.com\.ar[^)]*)\)/g)].map((m) => m[1]!);
    expect(links.length).toBeGreaterThan(5);
    for (const link of new Set(links)) {
      expect((await request.get(toPath(link))).status(), link).toBe(200);
    }
  }
});
