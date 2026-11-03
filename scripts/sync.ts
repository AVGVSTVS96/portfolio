import { z } from "astro/zod";

import { projects } from "../src/data/projects";

const USER = "AVGVSTVS96";
const MONTHS = 12;
const DAYS = 30;

const gh = (args: string[], jq: string) => {
  const proc = Bun.spawnSync(["gh", "api", ...args, "--paginate", "--jq", jq]);

  if (proc.exitCode !== 0) {
    throw new Error(`gh api ${args[0]}: ${proc.stderr.toString()}`);
  }

  return proc.stdout.toString().trim().split("\n").filter(Boolean);
};

const local = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles",
});

const now = new Date(`${local.format(new Date())}T00:00:00Z`);

const months = Array.from({ length: MONTHS }, (_, i) =>
  new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS - 1 - i), 1)
  )
    .toISOString()
    .slice(0, 7)
);

const since = `${months[0]}-01T00:00:00Z`;

const days = Array.from({ length: DAYS }, (_, i) =>
  new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - (DAYS - 1 - i)
    )
  )
    .toISOString()
    .slice(0, 10)
);

const repos = Object.fromEntries(
  projects.map(({ id, repo, also = [] }) => {
    const dates = [repo, ...also].flatMap((slug) =>
      gh(
        [`repos/${slug}/commits?author=${USER}&since=${since}&per_page=100`],
        ".[].commit.author.date"
      ).map((date) => local.format(new Date(date)))
    );

    const commits = months.map(
      (month) => dates.filter((date) => date.startsWith(month)).length
    );

    const [count] = gh([`repos/${repo}`], ".stargazers_count");
    const stars = z.coerce.number().parse(count);

    console.log(`${repo}: ${dates.length} commits, ${stars} stars`);

    return [id, { commits, stars }];
  })
);

const owners = new Map(
  projects.flatMap(({ id, repo, also = [] }) =>
    [repo, ...also].map((slug) => [slug.toLowerCase(), id])
  )
);

const ids = new Set(projects.map(({ id }) => id));

const project = (slug: string) => {
  const name = slug.split("/").at(-1)?.toLowerCase() ?? slug;
  const base = name.replace(/-(?:site|app)$/u, "");

  return owners.get(slug.toLowerCase()) ?? (ids.has(base) ? base : name);
};

const collection = (fields: string) =>
  gh(
    [
      "graphql",
      "-f",
      `query=query${fields.includes("$endCursor") ? "($endCursor: String)" : ""} { user(login: "${USER}") { contributionsCollection(from: "${days[0]}T00:00:00Z") { ${fields} } } }`,
    ],
    `.data.user.contributionsCollection | .[] | (.nodes? // [.[] | .repository as $repository | .contributions.nodes[] | .repository = $repository]) | .[] | "\\((.repository // .pullRequest.repository // .issue.repository).nameWithOwner) \\(.occurredAt) \\(.commitCount // 1)"`
  );

const repository = "repository { nameWithOwner }";

const paged = (connection: string, node: string) =>
  `${connection}(first: 100, after: $endCursor) { nodes { occurredAt ${node} } pageInfo { hasNextPage endCursor } }`;

const contributions = [
  ...collection(
    `commitContributionsByRepository(maxRepositories: 100) { ${repository} contributions(first: 100) { nodes { occurredAt commitCount } } }`
  ),
  ...collection(
    paged("pullRequestContributions", `pullRequest { ${repository} }`)
  ),
  ...collection(paged("pullRequestReviewContributions", repository)),
  ...collection(paged("issueContributions", `issue { ${repository} }`)),
  ...collection(paged("repositoryContributions", repository)),
];

const daily: Record<string, number[]> = {};

for (const line of contributions) {
  const [slug = "", at = "", count = "1"] = line.split(" ");
  const day = days.indexOf(local.format(new Date(at)));

  if (day !== -1) {
    const counts = daily[project(slug)] ?? days.map(() => 0);
    counts[day] = (counts[day] ?? 0) + Number(count);
    daily[project(slug)] = counts;
  }
}

const sum = (counts: number[]) => counts.reduce((a, b) => a + b, 0);

const ranked = Object.fromEntries(
  Object.entries(daily).toSorted(([, a], [, b]) => sum(b) - sum(a))
);

console.log(
  `last ${DAYS} days: ${sum(Object.values(ranked).flat())} public contributions`
);

await Bun.write(
  "src/data/activity.json",
  `${JSON.stringify({ months, days, repos, daily: ranked }, null, 2)}\n`
);

Bun.spawnSync(["bunx", "oxfmt", "src/data/activity.json"]);
