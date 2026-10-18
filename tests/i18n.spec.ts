import { expect, test } from "@playwright/test";

const PAIRS = [
  ["/es", "/en"],
  ["/es/servicios/software-a-medida", "/en/services/custom-software"],
  ["/es/proyectos/forja-challenge", "/en/projects/forja-challenge"],
  ["/es/preguntas-frecuentes", "/en/faq"],
  ["/es/privacidad", "/en/privacy"],
] as const;

test("language switcher goes to the equivalent page in the other language", async ({ page }) => {
  for (const [es, en] of PAIRS) {
    await page.goto(es);
    await page.locator('#site-header > .nav-tools > .lang-switch a[hreflang="en-US"]').click();
    await expect(page).toHaveURL(new RegExp(`${en}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    await page.locator('#site-header > .nav-tools > .lang-switch a[hreflang="es-AR"]').click();
    await expect(page).toHaveURL(new RegExp(`${es}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
  }
});

test("links inside a locale stay in that locale", async ({ page }) => {
  for (const start of ["/es", "/en"]) {
    await page.goto(start);
    const hrefs = await page.$$eval("main a[href^='/'], header nav a[href^='/'], footer a[href^='/']", (as) =>
      as.map((a) => a.getAttribute("href")!),
    );
    const foreign = hrefs.filter((h) => !h.startsWith(start));
    expect(foreign, `${start}: ${foreign.join(", ")}`).toEqual([]);
  }
});
