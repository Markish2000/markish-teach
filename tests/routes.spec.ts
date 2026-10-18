import { expect, test } from "@playwright/test";
import { collectErrors, getSitemapPaths } from "./helpers";

test("sitemap lists the main pages in both locales", async ({ request }) => {
  const paths = await getSitemapPaths(request);
  for (const required of [
    "/es",
    "/en",
    "/es/servicios",
    "/en/services",
    "/es/proyectos",
    "/en/projects",
    "/es/sobre-nosotros",
    "/en/about",
    "/es/preguntas-frecuentes",
    "/en/faq",
    "/es/contacto",
    "/en/contact",
    "/es/privacidad",
    "/en/privacy",
  ]) {
    expect(paths, `missing ${required}`).toContain(required);
  }
  expect(paths.filter((p) => p.includes("/servicios/")).length).toBe(5);
  expect(paths.filter((p) => p.includes("/projects/")).length).toBe(3);
});

test("every sitemap page returns 200 without console errors or horizontal overflow", async ({
  page,
  request,
}) => {
  test.setTimeout(240_000);
  const paths = await getSitemapPaths(request);
  const problems: string[] = [];
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const p of paths) {
      const errors = collectErrors(page);
      const response = await page.goto(p, { waitUntil: "load" });
      if (response?.status() !== 200) problems.push(`${p}: status ${response?.status()}`);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      if (overflow > 1) problems.push(`${p} @${width}px: horizontal overflow ${overflow}px`);
      if (width === 1280) {
        const broken = await page.evaluate(() =>
          Array.from(document.images)
            .filter((img) => img.loading !== "lazy" && img.complete && img.naturalWidth === 0)
            .map((img) => img.currentSrc || img.src),
        );
        problems.push(...broken.map((src) => `${p}: broken image ${src}`));
      }
      problems.push(...errors.map((e) => `${p}: ${e}`));
      page.removeAllListeners("console");
      page.removeAllListeners("pageerror");
    }
  }
  expect(problems, problems.join("\n")).toEqual([]);
});

test("lazy images load once scrolled into view", async ({ page }) => {
  await page.goto("/es/proyectos");
  for (const img of await page.locator("main img").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  }
});

test("redirects: root, trailing slash and index.html", async ({ request }) => {
  const root = await request.get("/", { maxRedirects: 0 });
  expect(root.status()).toBe(301);
  expect(root.headers()["location"]).toBe("/es");

  const slash = await request.get("/es/servicios/", { maxRedirects: 0 });
  expect(slash.status()).toBe(308);
  expect(slash.headers()["location"]).toBe("/es/servicios");

  const index = await request.get("/en/index.html", { maxRedirects: 0 });
  expect(index.status()).toBe(308);
  expect(index.headers()["location"]).toBe("/en");
});

test("unknown URLs return a branded 404 marked noindex", async ({ page }) => {
  for (const p of ["/no-existe", "/es/no-existe", "/pt"]) {
    const response = await page.goto(p);
    expect(response?.status(), p).toBe(404);
    await expect(page.locator("h1")).toHaveText(/no existe/i);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  }
});

test("hashed assets are immutable and pages send security headers", async ({ request, page }) => {
  await page.goto("/es");
  const asset = await page.evaluate(
    () =>
      performance
        .getEntriesByType("resource")
        .map((e) => new URL(e.name).pathname)
        .find((p) => p.startsWith("/_astro/")) ?? null,
  );
  expect(asset).not.toBeNull();
  const assetResponse = await request.get(asset!);
  expect(assetResponse.headers()["cache-control"]).toContain("immutable");

  const html = await request.get("/es");
  const h = html.headers();
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["content-security-policy"]).toContain("object-src 'none'");
});
