import { readFileSync, globSync } from "node:fs";

import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

import { codeTheme } from "./src/lib/code-theme";

const ascii = Array.from({ length: 95 }, (_, index) =>
  String.fromCodePoint(index + 32)
);

const japanese = globSync("src/**/*.astro").flatMap(
  (file) =>
    readFileSync(file, "utf-8").match(
      /[\p{scx=Hira}\p{scx=Kana}\p{scx=Han}]/gu
    ) ?? []
);

export default defineConfig({
  site: `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "portfolio-bay-eta-38.vercel.app"}`,
  trailingSlash: "never",
  integrations: [sitemap()],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Geist",
      cssVariable: "--font-sans",
      weights: ["400 600"],
      styles: ["normal"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Geist Mono",
      cssVariable: "--font-mono",
      weights: ["400 500"],
      styles: ["normal"],
      fallbacks: ["ui-monospace", "monospace"],
    },
    {
      provider: fontProviders.google(),
      name: "DotGothic16",
      cssVariable: "--font-dot",
      fallbacks: ["monospace"],
      options: {
        experimental: { glyphs: [...new Set([...ascii, ...japanese])] },
      },
    },
  ],
  markdown: {
    shikiConfig: { theme: codeTheme },
  },
});
