import { z } from "astro/zod";

import { projects } from "../data/projects";
import { fetchJson, request } from "./request";

const USER = "AVGVSTVS96";
const MONTHS = 12;
const WINDOW = 30;
const DAY = 86_400_000;

const local = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" });

const byRepository = z.array(
  z.object({
    repository: z.object({ nameWithOwner: z.string() }),
    contributions: z.object({ totalCount: z.number() }),
  }),
);

const collection = z.object({
  restrictedContributionsCount: z.number(),
  commitContributionsByRepository: byRepository,
  pullRequestContributionsByRepository: byRepository,
  pullRequestReviewContributionsByRepository: byRepository,
  issueContributionsByRepository: byRepository,
  repositoryContributions: z.object({
    nodes: z.array(z.object({ repository: z.object({ nameWithOwner: z.string() }) })),
  }),
});

const calendarSchema = z.object({
  contributionsCollection: z.object({
    contributionCalendar: z.object({
      weeks: z.array(
        z.object({
          contributionDays: z.array(z.object({ date: z.string(), contributionCount: z.number() })),
        }),
      ),
    }),
  }),
});

const fields = `restrictedContributionsCount ${[
  "commitContributionsByRepository",
  "pullRequestContributionsByRepository",
  "pullRequestReviewContributionsByRepository",
  "issueContributionsByRepository",
]
  .map(
    (name) =>
      `${name}(maxRepositories: 100) { repository { nameWithOwner } contributions { totalCount } }`,
  )
  .join(" ")} repositoryContributions(first: 100) { nodes { repository { nameWithOwner } } }`;

const sum = (counts: number[]) => counts.reduce((a, b) => a + b, 0);

export const github = async (token: string) => {
  const headers = { authorization: `Bearer ${token}` };

  const graphql = async <T extends z.ZodType>(query: string, schema: T) => {
    const { data, errors } = await fetchJson(
      "https://api.github.com/graphql",
      z.object({
        data: z.object({ user: z.unknown() }).nullish(),
        errors: z.array(z.object({ message: z.string() })).optional(),
      }),
      {
        method: "POST",
        headers,
        body: JSON.stringify({ query: `query { user(login: "${USER}") { ${query} } }` }),
      },
    );

    if (errors !== undefined && errors.length > 0) {
      throw new Error(`GitHub GraphQL: ${errors.map(({ message }) => message).join("; ")}`);
    }

    return schema.parse(data?.user);
  };

  const pages = async (url: string): Promise<unknown[]> => {
    const response = await request(url, { headers });

    const next = /<(?<url>[^>]+)>;\s*rel="next"/u.exec(response.headers.get("link") ?? "")?.groups
      ?.url;

    const page = z.array(z.unknown()).parse(await response.json());

    return next === undefined ? page : [...page, ...(await pages(next))];
  };

  const now = new Date(`${local.format(new Date())}T00:00:00Z`);

  const months = Array.from({ length: MONTHS }, (_, i) =>
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS - 1 - i), 1))
      .toISOString()
      .slice(0, 7),
  );

  const since = `${months[0]}-01T00:00:00Z`;

  const commitDates = async (slug: string) =>
    z
      .array(z.object({ commit: z.object({ author: z.object({ date: z.string() }) }) }))
      .parse(
        await pages(
          `https://api.github.com/repos/${slug}/commits?author=${USER}&since=${since}&per_page=100`,
        ),
      )
      .map(({ commit }) => local.format(new Date(commit.author.date)));

  const reposPromise = Promise.all(
    projects.map(async ({ id, repo, also = [] }) => {
      const [dates, { stargazers_count: stars }] = await Promise.all([
        Promise.all([repo, ...also].map(commitDates)).then((all) => all.flat()),
        fetchJson(
          `https://api.github.com/repos/${repo}`,
          z.object({ stargazers_count: z.number() }),
          { headers },
        ),
      ]);

      const commits = months.map((month) => dates.filter((date) => date.startsWith(month)).length);

      return [id, { commits, stars }] as const;
    }),
  ).then((entries) => Object.fromEntries(entries));

  const { contributionsCollection } = await graphql(
    "contributionsCollection { contributionCalendar { weeks { contributionDays { date contributionCount } } } }",
    calendarSchema,
  );

  const year = {
    total: 0,
    days: contributionsCollection.contributionCalendar.weeks.flatMap(({ contributionDays }) =>
      contributionDays.map(({ date, contributionCount }) => ({
        date,
        count: contributionCount,
        level: 0,
      })),
    ),
  };

  const first = new Date(year.days[0]?.date ?? now);

  first.setUTCDate(first.getUTCDate() - WINDOW + 1);

  const last = Math.max(now.getTime(), Date.parse(year.days.at(-1)?.date ?? "") || 0);

  const days = Array.from({ length: Math.round((last - first.getTime()) / DAY) + 1 }, (_, i) =>
    new Date(first.getTime() + i * DAY).toISOString().slice(0, 10),
  );

  const batches = await Promise.all(
    Array.from({ length: Math.ceil(days.length / WINDOW) }, async (_, batch) => {
      const dates = days.slice(batch * WINDOW, (batch + 1) * WINDOW);

      return await graphql(
        dates
          .map(
            (date, i) =>
              `d${batch * WINDOW + i}: contributionsCollection(from: "${date}T00:00:00Z", to: "${date}T23:59:59Z") { ${fields} }`,
          )
          .join(" "),
        z.record(z.string(), collection),
      );
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

  const daily: Record<string, number[]> = {};

  const add = (day: number, name: string, count: number) => {
    const counts = daily[name] ?? days.map(() => 0);
    counts[day] = (counts[day] ?? 0) + count;
    daily[name] = counts;
  };

  for (const [key, entry] of batches.flatMap((batch) => Object.entries(batch))) {
    const day = Number(key.slice(1));

    add(day, "private", entry.restrictedContributionsCount);

    for (const { repository, contributions } of [
      ...entry.commitContributionsByRepository,
      ...entry.pullRequestContributionsByRepository,
      ...entry.pullRequestReviewContributionsByRepository,
      ...entry.issueContributionsByRepository,
    ]) {
      add(day, project(repository.nameWithOwner), contributions.totalCount);
    }

    for (const { repository } of entry.repositoryContributions.nodes) {
      add(day, project(repository.nameWithOwner), 1);
    }
  }

  for (const [i, date] of days.entries()) {
    const entry = year.days.find((day) => day.date === date);

    if (entry) {
      entry.count = sum(Object.values(daily).map((counts) => counts[i] ?? 0));
    }
  }

  const peak = Math.max(...year.days.map(({ count }) => count), 1);

  for (const day of year.days) {
    day.level = day.count === 0 ? 0 : Math.ceil((4 * day.count) / peak);
  }

  year.total = sum(year.days.map(({ count }) => count));

  const { private: hidden = days.map(() => 0), ...named } = daily;

  return {
    months,
    days,
    repos: await reposPromise,
    daily: Object.fromEntries(Object.entries(named).toSorted(([, a], [, b]) => sum(b) - sum(a))),
    private: hidden,
    calendar: year,
  };
};
