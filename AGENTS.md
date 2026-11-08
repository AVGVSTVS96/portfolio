# portfolio

Bassim's personal site. Astro 7, static, no UI framework. Japanese 90s electronics in a satin-black finish (and a silver one), read as a clean 2026 page.

## Commands

- `bun dev` (or `astro dev --background`), `bun run build`.
- `bun run check` before finishing: astro check, type-aware oxlint with anti-slop, oxfmt. lefthook runs it on every commit and CI on every push. TypeScript stays on 6 because `astro-check` refuses 7.0.
- `bun run fix` rewrites what it can.
- `bun run sync` refreshes `src/data/activity.json` with the `gh` CLI: the year's contribution calendar, the last 30 days of contributions per repo, and per-project commits by month and stars.
- `bun run deploy` deploys: it syncs, commits the data and runs `vercel deploy --prod` from a clean copy of committed `main`, so work in progress never ships. The 5am `portfolio-sync` timer runs it.

## How it fits

- Projects are an ordered list in `src/data/projects.ts`. Writing is `src/content/posts`: markdown posts render here, `.yaml` entries with a `url` link out.
- `src/lib/data.ts` reads the calendar from `activity.json`, so both Activity charts count from one snapshot, and fetches npm stats at build time.
- Displays use one vocabulary: `.screen` is the recessed window, `--seg` is the lit segment (VFD glow in black, LCD ink in silver). `[data-readout]` swaps `[data-show]` text for the hovered `[data-tip]`'s data.
- `Links.astro` is the morphing hover card: one card resizes and slides between panels that crossfade with blur.
- `site` is Vercel's production domain (`VERCEL_PROJECT_PRODUCTION_URL`), so canonical, og and sitemap URLs follow wherever it's deployed.
- DotGothic16 is downloaded as a subset of printable ASCII plus every kana and kanji in `src/**/*.astro`; new Japanese text is picked up on the next build.
- `bun run og` draws `public/og.png` from `og/og.html` (the real tokens and `activity.json`) and `public/apple-touch-icon.png` from `og/apple-touch-icon.svg`, in installed Chrome.
