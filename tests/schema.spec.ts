import { expect, test } from "@playwright/test";
import { SITE_URL, getSitemapPaths } from "./helpers";

type Node = Record<string, unknown>;

const collectRefs = (value: unknown, refs: string[] = []): string[] => {
  if (Array.isArray(value)) value.forEach((v) => collectRefs(v, refs));
  else if (value && typeof value === "object") {
    const obj = value as Node;
    const keys = Object.keys(obj);
    if (keys.length === 1 && keys[0] === "@id") refs.push(obj["@id"] as string);
    else Object.values(obj).forEach((v) => collectRefs(v, refs));
  }
  return refs;
};

const collectIds = (value: unknown, ids: Map<string, string>): void => {
  if (Array.isArray(value)) value.forEach((v) => collectIds(v, ids));
  else if (value && typeof value === "object") {
    const obj = value as Node;
    if (typeof obj["@id"] === "string" && Object.keys(obj).length > 1) {
      ids.set(obj["@id"], String(obj["@type"]));
    }
    Object.values(obj).forEach((v) => collectIds(v, ids));
  }
};

test("JSON-LD is valid, absolute and internally consistent on every page", async ({ request }) => {
  const paths = await getSitemapPaths(request);
  const problems: string[] = [];
  const typesById = new Map<string, string>();

  for (const path of paths) {
    const html = await (await request.get(path)).text();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (blocks.length !== 1) problems.push(`${path}: ${blocks.length} JSON-LD blocks`);
    for (const [, raw] of blocks) {
      let data: Node;
      try {
        data = JSON.parse(raw!);
      } catch (error) {
        problems.push(`${path}: invalid JSON (${(error as Error).message})`);
        continue;
      }
      if (data["@context"] !== "https://schema.org") problems.push(`${path}: bad @context`);
      const graph = data["@graph"] as Node[];
      const ids = new Map<string, string>();
      collectIds(graph, ids);
      for (const [id, type] of ids) {
        if (!id.startsWith(`${SITE_URL}/`)) problems.push(`${path}: non-absolute @id ${id}`);
        const seen = typesById.get(id);
        if (seen && seen !== type) problems.push(`${path}: @id ${id} is ${type} here but ${seen} elsewhere`);
        typesById.set(id, type);
      }
      for (const ref of collectRefs(graph)) {
        if (!ids.has(ref)) problems.push(`${path}: unresolved reference ${ref}`);
      }
      const types = graph.map((n) => n["@type"]);
      for (const required of ["Organization", "WebSite", "Person"]) {
        if (!types.includes(required)) problems.push(`${path}: missing ${required}`);
      }
      const page = graph.find((n) => n["@id"] === `${SITE_URL}${path}#webpage`);
      if (!page) problems.push(`${path}: no WebPage node for the canonical URL`);
      if (path.split("/").length > 2 && !types.includes("BreadcrumbList"))
        problems.push(`${path}: missing BreadcrumbList`);
      for (const value of JSON.stringify(graph).matchAll(/"(?:url|item|contentUrl)":"([^"]+)"/g)) {
        if (!/^https:\/\//.test(value[1]!)) problems.push(`${path}: relative URL ${value[1]}`);
      }
    }
  }
  expect(problems, problems.join("\n")).toEqual([]);
});

test("service and project pages describe their main entity", async ({ request }) => {
  const check = async (path: string, type: string) => {
    const html = await (await request.get(path)).text();
    const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]!;
    const graph = (JSON.parse(raw) as { "@graph": Node[] })["@graph"];
    const entity = graph.find((n) => n["@type"] === type && String(n["@id"]).startsWith(`${SITE_URL}${path}#`));
    expect(entity, `${path} has ${type}`).toBeTruthy();
    expect((entity!["provider"] ?? entity!["creator"]) as Node).toEqual({ "@id": `${SITE_URL}/#organization` });
  };
  await check("/es/servicios/software-a-medida", "Service");
  await check("/en/services/web-accessibility", "Service");
  await check("/es/proyectos/markish-arena", "SoftwareApplication");
  await check("/en/projects/forja-challenge", "WebSite");
});

test("FAQPage questions match the visible questions", async ({ page }) => {
  await page.goto("/es/preguntas-frecuentes");
  const visible = await page.locator(".faq-q").allTextContents();
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const graph = (JSON.parse(raw!) as { "@graph": Node[] })["@graph"];
  const faq = graph.find((n) => n["@type"] === "FAQPage")!;
  const questions = (faq["mainEntity"] as Node[]).map((q) => q["name"]);
  expect(questions).toEqual(visible.map((q) => q.trim()));
});
