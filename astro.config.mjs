// @ts-check
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

/** @param {string} p */
const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  site: "https://www.markishtech.com.ar",
  trailingSlash: "never",
  output: "server",
  adapter: vercel(),
  build: { format: "directory" },
  devToolbar: { enabled: false },
  // 301 real a nivel adapter en vez del meta-refresh que generaba `src/pages/index.astro`.
  redirects: { "/": "/es" },
  integrations: [
    react(),
    sitemap({
      // El root solo redirige: no debe listarse como URL indexable.
      filter: (page) => page !== "https://www.markishtech.com.ar/",
      i18n: {
        defaultLocale: "es",
        locales: { es: "es-AR", en: "en-US" },
      },
    }),
  ],
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: { prefixDefaultLocale: true },
    fallback: { en: "es" },
  },
  vite: {
    plugins: [tailwindcss()],
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
