# portfolio

Bassim's personal site. Astro 7 on Vercel, no UI framework. Japanese 90s electronics in a satin-black finish (and a silver one), read as a clean 2026 page.

## Commands

- `bun dev` (or `astro dev --background`), `bun run build`. The home page reads GitHub with `GITHUB_TOKEN`; `vercel env pull .env.local` brings it in.
- `bun run check` before finishing: astro check, type-aware oxlint with anti-slop, oxfmt. lefthook runs it on every commit and CI on every push. TypeScript stays on 6 because `astro-check` refuses 7.0.
- `bun run fix` rewrites what it can.
- `bun run deploy` runs `vercel deploy --prod` from a clean copy of `origin/main`, so work in progress never ships, then loads bassim.im once so the first visitor gets a cached page. Vercel builds it. hex's pipeline runs it on every push to main.

## How it fits

- Projects are a list in `src/data/projects.ts`; `Works.astro` orders them by stars, then iikb, seqno and autofork, then recent work, and shows the first eight. Writing is `src/content/posts`: markdown posts render here, `.yaml` entries with a `url` link out.
- The home page is rendered on demand and cached by Vercel ISR for an hour: visitors get the cached page, and the first visit after it expires refreshes it in the background. `src/lib/data.ts` loads everything it shows once per render (GitHub through `src/lib/github.ts`, npm versions and downloads) and hands it to `Links`, `Activity` and `Works` as `data`, so every display counts from one fetch. Every other page is static.
- `GITHUB_TOKEN` is a fine-grained token that reads public repositories only (enclave `portfolio-github`), in Vercel's env for every environment.
- Displays use one vocabulary: `.screen` is the recessed window, `--seg` is the lit segment (VFD glow in black, LCD ink in silver). `[data-readout]` swaps `[data-show]` text for the hovered `[data-tip]`'s data.
- `Links.astro` is the morphing hover card: one card resizes and slides between panels that crossfade with blur.
- `site` is pinned to https://bassim.im, so canonical, og and sitemap URLs always name it.
- DotGothic16 is downloaded as a subset of printable ASCII plus every kana and kanji in `src/**/*.astro`; new Japanese text is picked up on the next build.
- `bun run og` draws `public/og.png` from `og/og.html` (the real tokens and the live calendar, so it needs `GITHUB_TOKEN`) and `public/apple-touch-icon.png` from `og/apple-touch-icon.svg`, in installed Chrome.
