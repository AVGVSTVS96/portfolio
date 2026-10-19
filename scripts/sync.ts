import { z } from "astro/zod";

import { projects } from "../src/data/projects";

const USER = "AVGVSTVS96";
const MONTHS = 12;

const gh = (path: string, jq: string) => {
  const proc = Bun.spawnSync(["gh", "api", path, "--paginate", "--jq", jq]);

  if (proc.exitCode !== 0) {
    throw new Error(`gh api ${path}: ${proc.stderr.toString()}`);
  }

  return proc.stdout.toString().trim();
};

const now = new Date();

const months = Array.from({ length: MONTHS }, (_, i) =>
  new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS - 1 - i), 1)
  )
    .toISOString()
    .slice(0, 7)
);

const since = `${months[0]}-01T00:00:00Z`;

const repos = Object.fromEntries(
  projects.map(({ id, repo }) => {
    const dates = gh(
      `repos/${repo}/commits?author=${USER}&since=${since}&per_page=100`,
      ".[].commit.author.date"
    )
      .split("\n")
      .filter(Boolean);

    const commits = months.map(
      (month) => dates.filter((date) => date.startsWith(month)).length
    );

    const stars = z.coerce
      .number()
      .parse(gh(`repos/${repo}`, ".stargazers_count"));

    console.log(`${repo}: ${dates.length} commits, ${stars} stars`);

    return [id, { commits, stars }];
  })
);

await Bun.write(
  "src/data/activity.json",
  `${JSON.stringify({ months, repos }, null, 2)}\n`
);

Bun.spawnSync(["oxfmt", "src/data/activity.json"]);
