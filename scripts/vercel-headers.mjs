#!/usr/bin/env node
/**
 * Post-build step for the Vercel Build Output API (.vercel/output/config.json).
 *
 * Inserts the security headers and the `/x/index.html` redirect *before* the
 * `{ handle: "filesystem" }` phase, where they apply to every static file.
 *
 * It also guarantees the `/_astro/*` immutable cache rule sits before that phase:
 * @astrojs/vercel up to v10 placed it after `filesystem`, where it never applied
 * to static files (production served hashed assets with `max-age=0`). v11 fixed
 * this, so the rule is only added when the adapter did not already do it.
 * The script is idempotent.
 *
 * Docs: https://vercel.com/docs/build-output-api/configuration#routes
 */
import { readFile, writeFile } from "node:fs/promises";

const CONFIG = ".vercel/output/config.json";
const MARKER = "x-markish-headers";

const CSP = [
  "default-src 'self'",
  // Astro emits small inline scripts (theme bootstrap, JSON-LD, hoisted modules).
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = {
  "Content-Security-Policy": CSP,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

const config = JSON.parse(await readFile(CONFIG, "utf8"));
const routes = config.routes ?? [];
const cleaned = routes.filter((r) => !r.headers?.[MARKER]);
const fsIndex = cleaned.findIndex((r) => r.handle === "filesystem");
if (fsIndex === -1) throw new Error(`No { handle: "filesystem" } route in ${CONFIG}`);

const adapterCachesAssets = cleaned
  .slice(0, fsIndex)
  .some((r) => r.src?.startsWith("^/_astro") && /immutable/.test(r.headers?.["cache-control"] ?? ""));

const inserted = [
  // `/es/index.html` would otherwise be a second, indexable copy of `/es`.
  {
    src: String.raw`^/(.+)/index\.html$`,
    headers: { Location: "/$1", [MARKER]: "redirect" },
    status: 308,
  },
  ...(adapterCachesAssets
    ? []
    : [
        {
          src: "^/_astro/(.*)$",
          headers: { "cache-control": "public, max-age=31536000, immutable", [MARKER]: "cache" },
          continue: true,
        },
      ]),
  {
    src: "^/(.*)$",
    headers: { ...SECURITY_HEADERS, [MARKER]: "security" },
    continue: true,
  },
];

config.routes = [...cleaned.slice(0, fsIndex), ...inserted, ...cleaned.slice(fsIndex)];
await writeFile(CONFIG, `${JSON.stringify(config, null, "\t")}\n`);
console.log(`[vercel-headers] cache + security headers inserted before the filesystem phase in ${CONFIG}`);
