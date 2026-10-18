#!/usr/bin/env node
/**
 * Runs Lighthouse several times per URL and form factor and reports the median.
 *
 * Usage:
 *   node scripts/lighthouse.mjs [--base http://localhost:4321] [--runs 3]
 *     [--paths /es,/en] [--devices mobile,desktop] [--label local] [--min 100]
 *
 * Writes every raw report to reports/lighthouse/<label>/ and a summary.json.
 * Exits with code 1 when any median category score is below --min (if given).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, []),
);

const BASE = (args.base ?? "http://localhost:4321").replace(/\/$/, "");
const RUNS = Number(args.runs ?? 3);
const LABEL = args.label ?? "local";
const MIN = args.min ? Number(args.min) : null;
const DEVICES = (args.devices ?? "mobile,desktop").split(",");
const DEFAULT_PATHS = [
  "/es",
  "/en",
  "/es/servicios",
  "/es/servicios/software-a-medida",
  "/en/services/custom-software",
  "/es/proyectos",
  "/es/proyectos/markish-arena",
  "/es/sobre-nosotros",
  "/es/preguntas-frecuentes",
  "/es/contacto",
  "/es/privacidad",
];
const PATHS = args.paths ? args.paths.split(",") : DEFAULT_PATHS;
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];
const METRICS = {
  lcp: "largest-contentful-paint",
  fcp: "first-contentful-paint",
  tbt: "total-blocking-time",
  cls: "cumulative-layout-shift",
  si: "speed-index",
};

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const outDir = path.resolve("reports/lighthouse", LABEL);
await mkdir(outDir, { recursive: true });

const chrome = await launch({
  chromePath: process.env.CHROME_PATH,
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

const summary = {
  label: LABEL,
  base: BASE,
  runs: RUNS,
  lighthouseVersion: null,
  date: new Date().toISOString(),
  results: [],
};
let failed = false;

try {
  for (const device of DEVICES) {
    for (const p of PATHS) {
      const url = `${BASE}${p}`;
      const runs = [];
      for (let i = 0; i < RUNS; i++) {
        const flags = {
          port: chrome.port,
          output: "json",
          logLevel: "error",
          onlyCategories: CATEGORIES,
        };
        const config = device === "desktop" ? desktopConfig : undefined;
        const result = await lighthouse(url, flags, config);
        if (!result) throw new Error(`Lighthouse returned no result for ${url}`);
        const { lhr, report } = result;
        summary.lighthouseVersion = lhr.lighthouseVersion;
        if (lhr.runtimeError) {
          console.error(`  ! ${device} ${p}: ${lhr.runtimeError.message}`);
        }
        const slug = p.replace(/\W+/g, "_") || "root";
        await writeFile(path.join(outDir, `${device}${slug}-${i + 1}.json`), report);
        runs.push({
          scores: Object.fromEntries(
            CATEGORIES.map((c) => [c, Math.round((lhr.categories[c]?.score ?? 0) * 100)]),
          ),
          metrics: Object.fromEntries(
            Object.entries(METRICS).map(([k, id]) => [k, lhr.audits[id]?.numericValue ?? null]),
          ),
          failing: CATEGORIES.flatMap((c) =>
            (lhr.categories[c]?.auditRefs ?? [])
              .filter((ref) => ref.weight > 0)
              .map((ref) => lhr.audits[ref.id])
              .filter((a) => a && a.score !== null && a.score < 1)
              .map((a) => `${c}:${a.id}`),
          ),
        });
      }

      const scores = Object.fromEntries(
        CATEGORIES.map((c) => [c, median(runs.map((r) => r.scores[c]))]),
      );
      const metrics = Object.fromEntries(
        Object.keys(METRICS).map((k) => [k, median(runs.map((r) => r.metrics[k] ?? 0))]),
      );
      const failing = [...new Set(runs.flatMap((r) => r.failing))];
      const all = runs.map((r) => CATEGORIES.map((c) => r.scores[c]).join("/"));
      summary.results.push({ device, path: p, scores, metrics, failing, all });

      const line = CATEGORIES.map((c) => String(scores[c]).padStart(3)).join(" ");
      console.log(
        `${device.padEnd(7)} ${p.padEnd(38)} ${line}  LCP ${(metrics.lcp / 1000).toFixed(2)}s TBT ${Math.round(metrics.tbt)}ms CLS ${metrics.cls.toFixed(3)}  runs[${all.join(" | ")}]`,
      );
      if (failing.length) console.log(`        failing: ${failing.join(", ")}`);
      if (MIN !== null && CATEGORIES.some((c) => scores[c] < MIN)) failed = true;
    }
  }
} finally {
  await chrome.kill();
}

await writeFile(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
console.log(`\nLighthouse ${summary.lighthouseVersion} · ${RUNS} runs/url · reports in ${outDir}`);
if (failed) {
  console.error(`At least one median score is below ${MIN}.`);
  process.exit(1);
}
