import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getSitemapPaths, useTheme } from "./helpers";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("axe WCAG 2.2 AA", () => {
  for (const theme of ["dark", "light"] as const) {
    test(`all sitemap pages pass axe (${theme})`, async ({ page, request }) => {
      test.setTimeout(180_000);
      await useTheme(page, theme);
      // Reduced motion reveals scroll-animated content immediately so contrast is measurable.
      await page.emulateMedia({ reducedMotion: "reduce" });
      const paths = await getSitemapPaths(request);
      const report: string[] = [];
      for (const p of paths) {
        await page.goto(p, { waitUntil: "networkidle" });
        const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        for (const v of results.violations) {
          report.push(
            `${p} [${v.impact}] ${v.id}: ${v.help} -> ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(" "))
              .join(" | ")}`,
          );
        }
      }
      expect(report, report.join("\n")).toEqual([]);
    });
  }
});
