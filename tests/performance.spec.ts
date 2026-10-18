import { expect, test } from "@playwright/test";

/**
 * Forced synchronous layouts ("[Violation] Forced reflow while executing
 * JavaScript" in the console): Layout events triggered from a JS stack.
 */
test("no forced synchronous layouts on load or first interaction", async ({ page }) => {
  for (const width of [390, 628, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const cdp = await page.context().newCDPSession(page);
    const events: Array<{ name: string; ph: string; dur?: number; args?: { beginData?: { stackTrace?: Array<{ functionName: string; url: string; lineNumber: number }> } } }> = [];
    cdp.on("Tracing.dataCollected", ({ value }) => events.push(...(value as typeof events)));
    const done = new Promise((resolve) => cdp.once("Tracing.tracingComplete", resolve));
    await cdp.send("Tracing.start", {
      categories: "devtools.timeline,disabled-by-default-devtools.timeline.stack",
      transferMode: "ReportEvents",
    });
    await page.goto("/es", { waitUntil: "load" });
    await page.mouse.click(width / 2, 700);
    await page.waitForTimeout(1500);
    await cdp.send("Tracing.end");
    await done;
    await cdp.detach();

    const forced = events
      .filter((e) => e.name === "Layout" && e.ph === "X" && e.args?.beginData?.stackTrace?.length)
      .map((e) => {
        const f = e.args!.beginData!.stackTrace![0]!;
        return `${width}px ${((e.dur ?? 0) / 1000).toFixed(1)}ms ${f.functionName || "(anonymous)"} ${f.url}:${f.lineNumber}`;
      });
    expect(forced, forced.join("\n")).toEqual([]);
  }
});
