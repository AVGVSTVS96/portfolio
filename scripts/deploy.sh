#!/bin/sh
set -eu

repo=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
copy=$(mktemp -d "${XDG_CACHE_HOME:-$HOME/.cache}/portfolio-deploy.XXXXXX")
trap 'git -C "$repo" worktree remove --force "$copy"' EXIT

git -C "$repo" worktree add --quiet --detach "$copy" main
base=$(git -C "$copy" rev-parse HEAD)
cp -R "$repo/.vercel" "$copy/"
cd "$copy"

bun install --frozen-lockfile
bun scripts/sync.ts

if ! git diff --quiet src/data/activity.json; then
  git commit --quiet -m "chore(data): sync activity" src/data/activity.json
fi

bun run build
vercel deploy --prod --yes

head=$(git rev-parse HEAD)

if [ "$head" != "$base" ]; then
  if [ "$(git -C "$repo" branch --show-current)" = main ]; then
    git -C "$repo" merge --quiet --ff-only "$head"
  else
    git -C "$repo" update-ref refs/heads/main "$head" "$base"
  fi
fi

git -C "$repo" push origin main
