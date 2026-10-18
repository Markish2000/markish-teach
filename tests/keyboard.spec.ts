import { expect, test } from "@playwright/test";

test("skip link is the first stop and moves focus to main content", async ({ page }) => {
  await page.goto("/es/servicios");
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator("#main")).toBeFocused();
});

test("every focusable element shows a visible focus indicator", async ({ page }) => {
  await page.goto("/es");
  const missing: string[] = [];
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      const visible = (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== "none";
      return { visible, label: `${el.tagName.toLowerCase()} ${el.textContent?.trim().slice(0, 30) ?? ""}` };
    });
    if (info && !info.visible) missing.push(info.label);
  }
  expect(missing, missing.join("\n")).toEqual([]);
});

test("mobile menu traps focus, closes with Escape and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  const trigger = page.locator("[data-mobile-menu-trigger]");
  await trigger.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  for (let i = 0; i < 15; i++) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() =>
      Boolean(document.querySelector("[data-mobile-menu]")?.contains(document.activeElement)),
    );
    expect(inside, `focus escaped the menu after ${i + 1} tabs`).toBe(true);
  }

  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("quick contact panel opens with real channels and closes with Escape", async ({ page }) => {
  await page.goto("/es");
  const fab = page.locator("[data-quick-fab]");
  await fab.click();
  const panel = page.getByRole("dialog", { name: "Contacto rápido" });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", "https://wa.me/5491151649895");
  await expect(panel.getByRole("link", { name: /markishtech@gmail.com/ })).toHaveAttribute(
    "href",
    "mailto:markishtech@gmail.com",
  );
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(fab).toBeFocused();
});

test("FAQ answers open with the keyboard", async ({ page }) => {
  await page.goto("/en/faq");
  const first = page.locator(".faq-item summary").first();
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".faq-item").first()).toHaveAttribute("open", "");
});
