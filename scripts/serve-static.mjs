#!/usr/bin/env node
/**
 * Serves the Vercel build output (.vercel/output/static) locally, emulating the
 * parts of Vercel's router this site relies on, so tests and Lighthouse run
 * against the real production build instead of the dev server.
 *
 * Emulated from .vercel/output/config.json (routes before `handle: filesystem`):
 *   - redirects (status + Location)
 *   - header routes with `continue: true`
 * Then: filesystem lookup (directory index), brotli/gzip compression and a
 * 404 that serves /404.html when it exists.
 *
 * `/api/*` is not served (serverless); tests mock it.
 *
 * Usage: node scripts/serve-static.mjs [port=4321]
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = path.resolve(".vercel/output");
const STATIC = path.join(ROOT, "static");
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4321);

const config = JSON.parse(await readFile(path.join(ROOT, "config.json"), "utf8"));
const fsIndex = config.routes.findIndex((r) => r.handle === "filesystem");
const preRoutes = config.routes.slice(0, fsIndex === -1 ? undefined : fsIndex);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};
const COMPRESSIBLE = /^(text\/|application\/(json|xml|manifest)|image\/svg)/;

async function resolveFile(pathname) {
  const clean = decodeURIComponent(pathname).replace(/\.\.+/g, "");
  const candidates = [clean, path.posix.join(clean, "index.html"), `${clean}.html`];
  for (const c of candidates) {
    const file = path.join(STATIC, c);
    try {
      if ((await stat(file)).isFile()) return file;
    } catch {}
  }
  return null;
}

function send(req, res, status, headers, body, type) {
  const enc = req.headers["accept-encoding"] ?? "";
  const h = { ...headers, "content-type": type };
  if (body && COMPRESSIBLE.test(type)) {
    if (enc.includes("br")) {
      body = zlib.brotliCompressSync(body);
      h["content-encoding"] = "br";
    } else if (enc.includes("gzip")) {
      body = zlib.gzipSync(body);
      h["content-encoding"] = "gzip";
    }
    h.vary = "Accept-Encoding";
  }
  res.writeHead(status, h);
  res.end(req.method === "HEAD" ? undefined : body);
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const headers = {};

  for (const route of preRoutes) {
    if (!route.src || !new RegExp(route.src).test(url.pathname)) continue;
    const routeHeaders = Object.fromEntries(
      Object.entries(route.headers ?? {}).map(([k, v]) => [
        k.toLowerCase(),
        url.pathname.replace(new RegExp(route.src), v),
      ]),
    );
    if (route.status && routeHeaders.location) {
      res.writeHead(route.status, { ...headers, ...routeHeaders });
      return res.end();
    }
    Object.assign(headers, routeHeaders);
    if (!route.continue) break;
  }

  // Vercel injects Web Analytics at the edge; locally serve an empty stand-in so
  // the page behaves as in production without network errors.
  if (url.pathname.startsWith("/_vercel/insights/")) {
    if (url.pathname.endsWith(".js")) {
      return send(req, res, 200, headers, Buffer.from("/* Vercel Web Analytics (local stub) */"), TYPES[".js"]);
    }
    res.writeHead(204, headers);
    return res.end();
  }

  const file = await resolveFile(url.pathname);
  if (file) {
    const type = TYPES[path.extname(file)] ?? "application/octet-stream";
    return send(req, res, 200, headers, await readFile(file), type);
  }

  const notFound = await resolveFile("/404.html");
  const body = notFound ? await readFile(notFound) : Buffer.from("Not found");
  return send(req, res, 404, headers, body, notFound ? TYPES[".html"] : TYPES[".txt"]);
}).listen(PORT, () => {
  console.log(`Serving ${STATIC} on http://localhost:${PORT}`);
});
