import { expect, test } from "@playwright/test";

test("follows the OS preference when nothing is stored", async ({ browser }) => {
  for (const scheme of ["light", "dark"] as const) {
    const context = await browser.newContext({ colorScheme: scheme });
    const page = await context.newPage();
    await page.goto("/es");
    await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);
    await context.close();
  }
});

test("toggle switches theme, persists it and names the next action", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/es");
  const toggle = page.locator("#site-header > .nav-tools > [data-theme-toggle]");
  await expect(toggle).toHaveAccessibleName("Activar tema claro");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(toggle).toHaveAccessibleName("Activar tema oscuro");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
