import { expect, test, type Page } from "@playwright/test";

const fill = async (page: Page) => {
  await page.getByLabel("Nombre").fill("Ana Pérez");
  await page.getByLabel("Email").fill("ana@example.com");
  await page.locator("#contact-service").click();
  await page.getByRole("option", { name: "Sitio web nuevo" }).click();
  await page.getByLabel("Contanos brevemente").fill("Necesitamos una web institucional.");
};

test.describe("contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/es/contacto");
  });

  test("shows accessible errors and focuses the first invalid field", async ({ page }) => {
    await page.getByRole("button", { name: "Enviar mensaje" }).click();
    const name = page.getByLabel("Nombre");
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#contact-name-error")).toHaveText("Este campo es obligatorio.");
    await expect(name).toHaveAttribute("aria-describedby", "contact-name-error");

    await page.getByLabel("Email").fill("no-es-un-email");
    await page.getByRole("button", { name: "Enviar mensaje" }).click();
    await expect(page.locator("#contact-email-error")).toContainText("email válido");
  });

  test("sends the payload and announces success", async ({ page }) => {
    let payload: Record<string, string> | null = null;
    await page.route("**/api/contact", async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({ status: 200, json: { ok: true } });
    });
    await fill(page);
    await page.getByRole("button", { name: "Enviar mensaje" }).click();
    const success = page.getByRole("status");
    await expect(success).toBeVisible();
    await expect(success).toBeFocused();
    expect(payload).toMatchObject({
      name: "Ana Pérez",
      email: "ana@example.com",
      service: "Sitio web nuevo",
      website: "",
    });
  });

  test("reports server failures instead of pretending success", async ({ page }) => {
    await page.route("**/api/contact", (route) => route.fulfill({ status: 503, json: { error: "not_configured" } }));
    await fill(page);
    await page.getByRole("button", { name: "Enviar mensaje" }).click();
    await expect(page.locator("[data-form-error]")).toBeVisible();
    await expect(page.getByRole("status")).toBeHidden();
  });

  test("links to the privacy policy", async ({ page }) => {
    await expect(page.locator("#contact-form").getByRole("link", { name: "Política de privacidad" })).toHaveAttribute(
      "href",
      "/es/privacidad",
    );
  });
});
