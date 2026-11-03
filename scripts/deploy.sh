#!/bin/sh
set -eu

repo=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
copy=$(mktemp -d "${XDG_CACHE_HOME:-$HOME/.cache}/portfolio-deploy.XXXXXX")
trap 'git -C "$repo" worktree remove --force "$copy"' EXIT

git -C "$repo" worktree add --quiet --detach "$copy" main
cp -R "$repo/.vercel" "$copy/"
cd "$copy"

bun install --frozen-lockfile
bun scripts/sync.ts

if ! git diff --quiet src/data/activity.json; then
  git commit --quiet -m "chore(data): sync activity" src/data/activity.json
  git -C "$repo" merge --quiet --ff-only "$(git rev-parse HEAD)" || echo "main moved on; this deploy's data is $(git rev-parse --short HEAD)"
fi

bun run build
vercel deploy --prod --yes
