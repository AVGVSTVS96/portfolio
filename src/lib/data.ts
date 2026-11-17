import { z } from "astro/zod";

import { projects } from "../data/projects";
import { github } from "./github";
import { fetchJson } from "./request";

interface Day {
  count: number;
  date: string;
  level: number;
}

const WEEKS = 52;

const npmVersion = async (name: string) => {
  const latest = await fetchJson(
    `https://registry.npmjs.org/${name}/latest`,
    z.object({ version: z.string() }),
  );

  return latest.version;
};

const npmWeekly = async (name: string) => {
  const { downloads } = await fetchJson(
    `https://api.npmjs.org/downloads/range/last-year/${name}`,
    z.object({
      downloads: z.array(z.object({ day: z.string(), downloads: z.number() })),
    }),
  );

  const totals: number[] = [];

  for (const [index, entry] of downloads.toReversed().entries()) {
    const week = Math.floor(index / 7);
    totals[week] = (totals[week] ?? 0) + entry.downloads;
  }

  return totals.slice(0, Math.floor(downloads.length / 7)).toReversed();
};

const toWeeks = (days: Day[]) => {
  const all: Day[][] = [];

  for (const entry of days) {
    if (all.length === 0 || new Date(entry.date).getUTCDay() === 0) {
      all.push([]);
    }

    all.at(-1)?.push(entry);
  }

  return all.slice(-WEEKS);
};

export const load = async (token: string) => {
  const [activity, versions, weekly] = await Promise.all([
    github(token),
    Promise.all(
      projects.flatMap(({ id, npm }) =>
        npm === undefined ? [] : [npmVersion(npm).then((version) => [id, version] as const)],
      ),
    ).then((entries) => new Map(entries)),
    npmWeekly("react-shiki"),
  ]);

  const weeks = toWeeks(activity.calendar.days);

  return {
    activity,
    weeks,
    total: weeks.flat().reduce((total, { count }) => total + count, 0),
    versions,
    weekly,
  };
};

export type Data = Awaited<ReturnType<typeof load>>;
