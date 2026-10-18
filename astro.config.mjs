// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

/** @param {string} p */
const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  site: "https://www.markishtech.com.ar",
  trailingSlash: "never",
  // Todo se prerenderiza; solo `/api/contact` corre on-demand (`prerender = false`).
  output: "static",
  // Web Analytics de Vercel: script first-party, sin cookies. Se activa también en el dashboard.
  adapter: vercel({ webAnalytics: { enabled: true } }),
  build: { format: "directory", inlineStylesheets: "always" },
  devToolbar: { enabled: false },
  // 301 real a nivel adapter en vez del meta-refresh que generaba `src/pages/index.astro`.
  redirects: { "/": "/es" },
  integrations: [react()],
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
    // The decorative 3D hero (three.js) is one ~900 KB chunk, loaded lazily after
    // interaction/idle and never part of the initial page load.
    build: { chunkSizeWarningLimit: 1000 },
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
