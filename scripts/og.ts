import { launch } from "puppeteer-core";

const root = new URL("..", import.meta.url).pathname;

const shots = [
  { source: "og/og.html", width: 1200, height: 630, out: "public/og.png" },
  {
    source: "og/apple-touch-icon.svg",
    width: 180,
    height: 180,
    out: "public/apple-touch-icon.png",
  },
] as const;

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  fetch: async (request) => {
    const file = Bun.file(root + new URL(request.url).pathname);

    return (await file.exists()) ? new Response(file) : new Response(null, { status: 404 });
  },
});

const browser = await launch({
  args: ["--force-color-profile=srgb", "--hide-scrollbars", "--disable-dev-shm-usage"],
  channel: "chrome",
  headless: true,
});

const page = await browser.newPage();

const shoot = async ({ source, width, height, out }: (typeof shots)[number]) => {
  await page.setViewport({ height, width });
  await page.goto(new URL(source, server.url).href, { waitUntil: "networkidle0" });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.screenshot({ path: `${root}${out}` });
  console.log(out);
};

for (const shot of shots) {
  // oxlint-disable-next-line eslint/no-await-in-loop -- one tab, one shot at a time: Chrome doesn't paint a background tab, so parallel screenshots hang
  await shoot(shot);
}

await browser.close();

await server.stop();
