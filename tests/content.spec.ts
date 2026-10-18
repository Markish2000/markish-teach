import { expect, test } from "@playwright/test";
import { getSitemapPaths, localeOf } from "./helpers";
import es from "../src/i18n/es.json" with { type: "json" };
import en from "../src/i18n/en.json" with { type: "json" };

/** Placeholder or unverifiable content that must never be published as real. */
const FORBIDDEN = [
  /acme/i,
  /lorem ipsum/i,
  /coming soon/i,
  /pr[oó]ximamente/i,
  /\bQ[1-4]\s*\/\s*Q[1-4]\b/,
  /en l[ií]nea/i,
  /demo de chat/i,
  /comparativa real/i,
  /\b70\s?%/,
  /caso 03/i,
];

/** English words that leaked into Spanish pages, and vice versa. */
const WRONG_LANGUAGE = {
  es: [/\bFEATURED\b/, /\bDiscovery\b/, /\bBooking projects\b/, /\bLighthouse target\b/],
  en: [/\bServicios\b/, /\bProyectos\b/, /\bContacto\b/, /\bNosotros\b/],
};

test("no placeholder, fictitious or mixed-language content in visible text", async ({ page, request }) => {
  test.setTimeout(120_000);
  const problems: string[] = [];
  for (const p of await getSitemapPaths(request)) {
    await page.goto(p);
    const text = await page.locator("body").innerText();
    for (const re of FORBIDDEN) if (re.test(text)) problems.push(`${p}: forbidden ${re}`);
    for (const re of WRONG_LANGUAGE[localeOf(p)]) {
      // The language switcher and project names are allowed to use other languages.
      const clean = text.replace(/\b(ES|EN|es|en)\b/g, "");
      if (re.test(clean)) problems.push(`${p}: wrong-language ${re}`);
    }
  }
  expect(problems, problems.join("\n")).toEqual([]);
});

test("English and Spanish UI translations have the same keys", () => {
  const shape = (value: unknown, prefix = ""): string[] =>
    Array.isArray(value)
      ? [`${prefix}[${value.length}]`, ...value.flatMap((v, i) => shape(v, `${prefix}[${i}]`))]
      : value && typeof value === "object"
        ? Object.entries(value).flatMap(([k, v]) => shape(v, prefix ? `${prefix}.${k}` : k))
        : [prefix];
  expect(shape(en)).toEqual(shape(es));
});
