// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { fileURLToPath } from "node:url";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

/** @param {string} p */
const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  site: "https://www.markishtech.com.ar",
  trailingSlash: "never",
  // Todo se prerenderiza; solo `/api/contact` corre on-demand (`prerender = false`).
  output: "static",
  // Vercel Web Analytics (first-party, cookieless). Same script as the
  // @vercel/analytics <Analytics /> component. It requires Analytics to be enabled
  // for the project in the Vercel dashboard (enabled 2026-10-18); if it is ever
  // disabled, set this to false or /_vercel/insights/script.js will 404.
  adapter: vercel({ webAnalytics: { enabled: true } }),
  build: { format: "directory", inlineStylesheets: "always" },
  devToolbar: { enabled: false },
  // 301 real a nivel adapter en vez del meta-refresh que generaba `src/pages/index.astro`.
  redirects: { "/": "/es" },
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: { prefixDefaultLocale: true },
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Space Grotesk",
      cssVariable: "--font-grotesk",
      weights: ["400 700"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains",
      weights: [400, 500],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["ui-monospace", "monospace"],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    // The decorative 3D hero (three.js WebGL renderer) is one ~540 KB chunk,
    // loaded lazily after interaction/idle and never part of the initial load.
    build: { chunkSizeWarningLimit: 600 },
    resolve: {
      alias: {
        "@": r("./src"),
        "@shared": r("./src/shared"),
        "@components": r("./src/components"),
        "@layouts": r("./src/layouts"),
        "@pages": r("./src/pages"),
        "@i18n": r("./src/i18n"),
        "@styles": r("./src/styles"),
        "@scripts": r("./src/scripts"),
        "@assets": r("./src/assets"),
      },
    },
  },
});
