// @ts-check
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

/** @param {string} p */
const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  site: "https://markish.dev",
  trailingSlash: "never",
  output: "server",
  adapter: node({ mode: "standalone" }),
  build: { format: "directory" },
  devToolbar: { enabled: false },
  integrations: [react(), sitemap()],
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
