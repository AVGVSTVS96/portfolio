import { setTimeout as sleep } from "node:timers/promises";

import type { z } from "astro/zod";

const ATTEMPTS = 3;

const attempt = async (url: string, init?: RequestInit) => {
  try {
    const response = await fetch(url, { ...init, signal: AbortSignal.timeout(30_000) });

    return response.ok ? response : new Error(`${url} answered ${response.status}`);
  } catch (error) {
    return new Error(`${url} failed`, { cause: error });
  }
};

export const request = async (url: string, init?: RequestInit, tries = 1): Promise<Response> => {
  const result = await attempt(url, init);

  if (result instanceof Response) {
    return result;
  }

  if (tries >= ATTEMPTS) {
    throw result;
  }

  await sleep(tries * 2000);

  return await request(url, init, tries + 1);
};

export const fetchJson = async <T extends z.ZodType>(
  url: string,
  schema: T,
  init?: RequestInit,
): Promise<z.infer<T>> => {
  const response = await request(url, init);

  return schema.parse(await response.json());
};
