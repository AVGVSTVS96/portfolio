import { z } from "astro/zod";

const USER = "AVGVSTVS96";

const day = z.object({
  count: z.number(),
  date: z.string(),
  level: z.number(),
});

export type Day = z.infer<typeof day>;

const fetchJson = async <T extends z.ZodType>(
  url: string,
  schema: T
): Promise<z.infer<T>> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${url} answered ${response.status}`);
  }

  return schema.parse(await response.json());
};

export const contributions = await fetchJson(
  `https://github-contributions-api.jogruber.de/v4/${USER}?y=last`,
  z.object({
    contributions: z.array(day),
    total: z.object({ lastYear: z.number() }),
  })
);

export const weeks: Day[][] = [];

for (const entry of contributions.contributions) {
  if (weeks.length === 0 || new Date(entry.date).getUTCDay() === 0) {
    weeks.push([]);
  }

  weeks.at(-1)?.push(entry);
}

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
