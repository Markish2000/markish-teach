import type { APIRoute } from "astro";
import { LOCALES } from "@shared/types";
import { DEFAULT_LOCALE } from "@shared/types";
import { LANG_TAG, absoluteUrl } from "@shared/helpers";
import { getAllPages } from "@/lib/content";

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Canonical, indexable pages only, with reciprocal hreflang alternates.
 * `lastmod` is omitted on purpose: without a trustworthy per-page date it is
 * better to leave it out than to publish an inaccurate one.
 */
export const GET: APIRoute = async () => {
  const pages = await getAllPages();
  const urls = pages.map((page) => {
    const links = LOCALES.flatMap((l) => {
      const p = page.alternates[l];
      return p ? [`    <xhtml:link rel="alternate" hreflang="${LANG_TAG[l]}" href="${escape(absoluteUrl(p))}"/>`] : [];
    });
    const xDefault = page.alternates[DEFAULT_LOCALE];
    if (links.length > 1 && xDefault) {
      links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escape(absoluteUrl(xDefault))}"/>`);
    }
    return [`  <url>`, `    <loc>${escape(absoluteUrl(page.path))}</loc>`, ...(links.length > 1 ? links : []), `  </url>`].join("\n");
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
