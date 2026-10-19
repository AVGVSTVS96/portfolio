import { defineConfig, fontProviders } from "astro/config";

import { codeTheme } from "./src/lib/code-theme";

export default defineConfig({
  site: "https://bassim.build",
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Geist",
      cssVariable: "--font-sans",
      weights: ["400 600"],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Geist Mono",
      cssVariable: "--font-mono",
      weights: ["400 500"],
      fallbacks: ["ui-monospace", "monospace"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "DotGothic16",
      subsets: ["latin", "japanese"],
      cssVariable: "--font-dot",
      fallbacks: ["monospace"],
    },
  ],
  markdown: {
    shikiConfig: { theme: codeTheme },
  },
});
