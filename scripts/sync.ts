import { z } from "astro/zod";

import { projects } from "../src/data/projects";

const USER = "AVGVSTVS96";
const MONTHS = 12;
const WINDOW = 30;
const ZONE = "America/Los_Angeles";
const ATTEMPTS = 3;
const DAY = 86_400_000;

const gh = (args: string[], jq: string) => {
  let error = "";

  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    const proc = Bun.spawnSync(["gh", "api", ...args, "--paginate", "--jq", jq]);

    if (proc.exitCode === 0) {
      return proc.stdout.toString().trim().split("\n").filter(Boolean);
    }

    error = proc.stderr.toString();

    if (attempt < ATTEMPTS) {
      console.log(`gh api ${args[0]} failed, retrying: ${error.trim()}`);
      Bun.sleepSync(attempt * 10_000);
    }
  }

  throw new Error(`gh api ${args[0]}: ${error}`);
};

const local = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE });

const now = new Date(`${local.format(new Date())}T00:00:00Z`);

const months = Array.from({ length: MONTHS }, (_, i) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS - 1 - i), 1))
    .toISOString()
    .slice(0, 7),
);

const since = `${months[0]}-01T00:00:00Z`;

const repos = Object.fromEntries(
  projects.map(({ id, repo, also = [] }) => {
    const dates = [repo, ...also].flatMap((slug) =>
      gh(
        [`repos/${slug}/commits?author=${USER}&since=${since}&per_page=100`],
        ".[].commit.author.date",
      ).map((date) => local.format(new Date(date))),
    );

    const commits = months.map((month) => dates.filter((date) => date.startsWith(month)).length);

    const [count] = gh([`repos/${repo}`], ".stargazers_count");
    const stars = z.coerce.number().parse(count);

    console.log(`${repo}: ${dates.length} commits, ${stars} stars`);

    return [id, { commits, stars }];
  }),
);

const owners = new Map(
  projects.flatMap(({ id, repo, also = [] }) =>
    [repo, ...also].map((slug) => [slug.toLowerCase(), id]),
  ),
);

const ids = new Set(projects.map(({ id }) => id));

const project = (slug: string) => {
  const name = slug.split("/").at(-1)?.toLowerCase() ?? slug;
  const base = name.replace(/-(?:site|app)$/u, "");

  return owners.get(slug.toLowerCase()) ?? (ids.has(base) ? base : name);
};

const [calendar = "null"] = gh(
  [
    "graphql",
    "-f",
    `query=query { user(login: "${USER}") { contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }`,
  ],
  `.data.user.contributionsCollection.contributionCalendar | {total: .totalContributions, days: [.weeks[].contributionDays[] | {date, count: .contributionCount, level: (.contributionLevel as $level | ["NONE", "FIRST_QUARTILE", "SECOND_QUARTILE", "THIRD_QUARTILE", "FOURTH_QUARTILE"] | index($level))}]} | tojson`,
);

const year = z
  .object({
    total: z.number(),
    days: z.array(z.object({ date: z.string(), count: z.number(), level: z.number() })),
  })
  .parse(JSON.parse(calendar));

const first = new Date(year.days[0]?.date ?? now);

first.setUTCDate(first.getUTCDate() - WINDOW + 1);

const last = Math.max(now.getTime(), Date.parse(year.days.at(-1)?.date ?? "") || 0);

const days = Array.from({ length: Math.round((last - first.getTime()) / DAY) + 1 }, (_, i) =>
  new Date(first.getTime() + i * DAY).toISOString().slice(0, 10),
);

const byRepository = (connection: string) =>
  `${connection}(maxRepositories: 100) { repository { nameWithOwner } contributions { totalCount } }`;

const windows = days.map(
  (date, i) =>
    `d${i}: contributionsCollection(from: "${date}T00:00:00Z", to: "${date}T23:59:59Z") { restrictedContributionsCount ${[
      "commitContributionsByRepository",
      "pullRequestContributionsByRepository",
      "pullRequestReviewContributionsByRepository",
      "issueContributionsByRepository",
    ]
      .map(byRepository)
      .join(" ")} repositoryContributions(first: 100) { nodes { repository { nameWithOwner } } } }`,
);

const lines: string[] = [];

for (let start = 0; start < windows.length; start += WINDOW) {
  console.log(
    `daily contributions: ${start + 1}–${Math.min(start + WINDOW, days.length)} of ${days.length}`,
  );

  const batch = gh(
    [
      "graphql",
      "-f",
      `query=query { user(login: "${USER}") { ${windows.slice(start, start + WINDOW).join(" ")} } }`,
    ],
    `.data.user | to_entries[] | (.key | ltrimstr("d")) as $day | .value | ("\\($day) private \\(.restrictedContributionsCount)", ((.commitContributionsByRepository + .pullRequestContributionsByRepository + .pullRequestReviewContributionsByRepository + .issueContributionsByRepository)[] | "\\($day) \\(.repository.nameWithOwner) \\(.contributions.totalCount)"), (.repositoryContributions.nodes[] | "\\($day) \\(.repository.nameWithOwner) 1"))`,
  );

  lines.push(...batch);
}

const daily: Record<string, number[]> = {};

for (const line of lines) {
  const [day = "", slug = "", count = "0"] = line.split(" ");
  const name = slug === "private" ? slug : project(slug);
  const counts = daily[name] ?? days.map(() => 0);
  counts[Number(day)] = (counts[Number(day)] ?? 0) + Number(count);
  daily[name] = counts;
}

const sum = (counts: number[]) => counts.reduce((a, b) => a + b, 0);

for (const [i, date] of days.entries()) {
  const counted = sum(Object.values(daily).map((counts) => counts[i] ?? 0));
  const entry = year.days.find((day) => day.date === date);

  if (entry && entry.count !== counted) {
    console.log(`${date}: calendar said ${entry.count}, its projects add up to ${counted}`);
    entry.count = counted;
  }
}

const peak = Math.max(...year.days.map(({ count }) => count), 1);

for (const day of year.days) {
  day.level = day.count === 0 ? 0 : Math.ceil((4 * day.count) / peak);
}

year.total = sum(year.days.map(({ count }) => count));

const { private: hidden = days.map(() => 0), ...named } = daily;

const ranked = Object.fromEntries(
  Object.entries(named).toSorted(([, a], [, b]) => sum(b) - sum(a)),
);

console.log(
  `last ${days.length} days: ${sum(Object.values(daily).flat())} contributions, ${sum(hidden)} private`,
);

await Bun.write(
  "src/data/activity.json",
  `${JSON.stringify({ months, days, repos, daily: ranked, private: hidden, calendar: year }, null, 2)}\n`,
);

Bun.spawnSync(["bunx", "oxfmt", "src/data/activity.json"]);
