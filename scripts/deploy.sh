#!/bin/sh
set -eu
exec 9>"${XDG_RUNTIME_DIR:-/tmp}/portfolio-deploy.lock"
flock 9

repo=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
git -C "$repo" fetch --quiet origin main
copy=$(mktemp -d "${XDG_CACHE_HOME:-$HOME/.cache}/portfolio-deploy.XXXXXX")
trap 'git -C "$repo" worktree remove --force "$copy"' EXIT

git -C "$repo" worktree add --quiet --detach "$copy" origin/main
mkdir "$copy/.vercel"
cp "$repo/.vercel/project.json" "$copy/.vercel/"

vercel deploy --prod --yes --cwd "$copy"
curl --fail --silent --output /dev/null https://bassim.im/
