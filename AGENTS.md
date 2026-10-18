# portfolio

Bassim's personal site. Astro 7, static, no UI framework. Japanese 90s electronics in a satin-black finish (and a silver one), read as a clean 2026 page.

## Commands

- `bun dev` (or `astro dev --background`), `bun run build`.
- `bun run check` before finishing: astro check, type-aware oxlint with anti-slop, oxfmt. lefthook runs it on every commit.
- `bun run fix` rewrites what it can.
- `bun run sync` refreshes `src/data/activity.json` (per-project commits by month and stars) with the `gh` CLI. Run it before a deploy.

## How it fits

- Projects are an ordered list in `src/data/projects.ts`. Writing is `src/content/posts`: markdown posts render here, `.yaml` entries with a `url` link out.
- `src/lib/data.ts` fetches the GitHub contribution calendar and npm stats at build time, so every deploy is current.
- Displays use one vocabulary: `.screen` is the recessed window, `--seg` is the lit segment (VFD glow in black, LCD ink in silver). `[data-readout]` swaps `[data-show]` text for the hovered `[data-tip]`'s data.
- `Links.astro` is the morphing hover card: one card resizes and slides between panels that crossfade with blur.
