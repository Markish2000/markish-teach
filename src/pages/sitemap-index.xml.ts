import type { APIRoute } from "astro";
import { SITE_URL } from "@shared/constants";

/**
 * Kept for continuity: the previous build published `/sitemap-index.xml`
 * (possibly submitted to Search Console). It now points to the single sitemap.
 */
export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE_URL}/sitemap.xml</loc></sitemap>
</sitemapindex>
`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
