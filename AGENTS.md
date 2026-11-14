# portfolio

Bassim's personal site. Astro 7, static, no UI framework. Japanese 90s electronics in a satin-black finish (and a silver one), read as a clean 2026 page.

## Commands

- `bun dev` (or `astro dev --background`), `bun run build`.
- `bun run check` before finishing: astro check, type-aware oxlint with anti-slop, oxfmt. lefthook runs it on every commit and CI on every push. TypeScript stays on 6 because `astro-check` refuses 7.0.
- `bun run fix` rewrites what it can.
- `bun run sync` refreshes `src/data/activity.json` with the `gh` CLI: the year's contribution calendar, the last 30 days of contributions per repo, and per-project commits by month and stars.
- `bun run deploy` deploys: it syncs, commits the data and runs `vercel deploy --prod` from a clean copy of committed `main`, so work in progress never ships. The 5am `portfolio-sync` timer runs it.

## Working in jj

jj sits on top of git here. This folder stays plain git for the deploy and anyone using git: any jj command here other than `jj workspace add` or `forget` detaches its HEAD, and the deploy would then push a stale `main`.

- Work in your own workspace: `jj workspace add ~/Developer/portfolio-jj/<name> --name <name> -r main@origin`, then use jj there.
- jj skips lefthook, so run `bun run check` yourself before landing.
- Land with plain git from this folder: `git merge --ff-only <commit>`, then `git push origin main`. `jj git push` can overwrite another agent's commit on `main`.
- When done: `jj workspace forget <name>` and delete its folder.

## How it fits

- Projects are a list in `src/data/projects.ts`; `Works.astro` orders them by stars, then iikb, seqno and autofork, then recent work, and shows the first eight. Writing is `src/content/posts`: markdown posts render here, `.yaml` entries with a `url` link out.
- `src/lib/data.ts` reads the calendar from `activity.json`, so both Activity charts count from one snapshot, and fetches npm stats at build time.
- Displays use one vocabulary: `.screen` is the recessed window, `--seg` is the lit segment (VFD glow in black, LCD ink in silver). `[data-readout]` swaps `[data-show]` text for the hovered `[data-tip]`'s data.
- `Links.astro` is the morphing hover card: one card resizes and slides between panels that crossfade with blur.
- `site` is pinned to https://bassim.im, so canonical, og and sitemap URLs always name it.
- DotGothic16 is downloaded as a subset of printable ASCII plus every kana and kanji in `src/**/*.astro`; new Japanese text is picked up on the next build.
- `bun run og` draws `public/og.png` from `og/og.html` (the real tokens and `activity.json`) and `public/apple-touch-icon.png` from `og/apple-touch-icon.svg`, in installed Chrome.
