import { setTimeout as sleep } from "node:timers/promises";

import { z } from "astro/zod";

import activity from "../data/activity.json";

const day = z.object({
  count: z.number(),
  date: z.string(),
  level: z.number(),
});

export type Day = z.infer<typeof day>;

const ATTEMPTS = 3;

const responses = new Map<string, Promise<Response>>();

const attempt = async (url: string) => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });

    return response.ok
      ? response
      : new Error(`${url} answered ${response.status}`);
  } catch (error) {
    return new Error(`${url} failed`, { cause: error });
  }
};

const request = async (url: string, tries = 1): Promise<Response> => {
  const result = await attempt(url);

  if (result instanceof Response) {
    return result;
  }

  if (tries >= ATTEMPTS) {
    throw result;
  }

  await sleep(tries * 2000);

  return await request(url, tries + 1);
};

const fetchJson = async <T extends z.ZodType>(
  url: string,
  schema: T
): Promise<z.infer<T>> => {
  const pending = responses.get(url) ?? request(url);

  responses.set(url, pending);

  const response = await pending;

  return schema.parse(await response.clone().json());
};

const calendar = z
  .object({ days: z.array(day), total: z.number() })
  .parse(activity.calendar);

const WEEKS = 52;

const all: Day[][] = [];

for (const entry of calendar.days) {
  if (all.length === 0 || new Date(entry.date).getUTCDay() === 0) {
    all.push([]);
  }

  all.at(-1)?.push(entry);
}

export const weeks = all.slice(-WEEKS);

export const contributions = {
  contributions: weeks.flat(),
  total: {
    lastYear: weeks.flat().reduce((total, { count }) => total + count, 0),
  },
};

export const npmVersion = async (name: string) => {
  const latest = await fetchJson(
    `https://registry.npmjs.org/${name}/latest`,
    z.object({ version: z.string() })
  );

  return latest.version;
};

export const npmWeekly = async (name: string) => {
  const { downloads } = await fetchJson(
    `https://api.npmjs.org/downloads/range/last-year/${name}`,
    z.object({
      downloads: z.array(z.object({ day: z.string(), downloads: z.number() })),
    })
  );

  const totals: number[] = [];

  for (const [index, entry] of downloads.toReversed().entries()) {
    const week = Math.floor(index / 7);
    totals[week] = (totals[week] ?? 0) + entry.downloads;
  }

  return totals.slice(0, Math.floor(downloads.length / 7)).toReversed();
};
