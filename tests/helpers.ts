import type { APIRequestContext, Page } from "@playwright/test";

export const SITE_URL = "https://www.markishtech.com.ar";

/** Converts an absolute site URL (as written in sitemap/canonical) to a path. */
export const toPath = (url: string) => new URL(url, SITE_URL).pathname;

/** All page paths listed in the sitemap index. */
export async function getSitemapPaths(request: APIRequestContext): Promise<string[]> {
  const index = await (await request.get("/sitemap-index.xml")).text();
  const sitemaps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => toPath(m[1]!));
  const paths: string[] = [];
  for (const sm of sitemaps) {
    const xml = await (await request.get(sm)).text();
    paths.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => toPath(m[1]!)));
  }
  return [...new Set(paths)].sort();
}

export const localeOf = (path: string) => (path.startsWith("/en") ? "en" : "es");

/** Forces a theme before any page script runs. */
export async function useTheme(page: Page, theme: "dark" | "light") {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("mk-theme", t);
    } catch {}
  }, theme);
}

/** Collects console errors and uncaught exceptions for the page lifetime. */
export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
