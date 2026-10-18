import { expect, test } from "@playwright/test";
import { getSitemapPaths } from "./helpers";

test("internal links resolve to 200 pages and existing anchors, without redirects", async ({ page, request }) => {
  test.setTimeout(180_000);
  const paths = await getSitemapPaths(request);
  const links = new Map<string, string>();
  const externalWithoutRel: string[] = [];

  for (const p of [...paths, "/404"]) {
    await page.goto(p);
    const found = await page.$$eval("a[href]", (anchors) =>
      anchors.map((a) => ({
        href: a.getAttribute("href")!,
        abs: (a as HTMLAnchorElement).href,
        target: a.getAttribute("target"),
        rel: a.getAttribute("rel") ?? "",
      })),
    );
    for (const link of found) {
      const url = new URL(link.abs);
      if (link.target === "_blank" && !/noopener/.test(link.rel)) externalWithoutRel.push(`${p}: ${link.href}`);
      if (url.origin !== new URL(page.url()).origin) continue;
      links.set(url.pathname + url.hash, p);
    }
  }

  const problems: string[] = [];
  const checked = new Map<string, number>();
  for (const [target, from] of links) {
    const [pathname, hash] = target.split("#") as [string, string | undefined];
    if (!checked.has(pathname)) {
      const res = await request.get(pathname, { maxRedirects: 0 });
      checked.set(pathname, res.status());
    }
    const status = checked.get(pathname)!;
    if (status !== 200) problems.push(`${from} -> ${target}: ${status}`);
    if (hash && status === 200) {
      const html = await (await request.get(pathname)).text();
      if (!html.includes(`id="${hash}"`)) problems.push(`${from} -> ${target}: missing anchor`);
    }
  }
  expect(problems, problems.join("\n")).toEqual([]);
  expect(externalWithoutRel, externalWithoutRel.join("\n")).toEqual([]);
});
