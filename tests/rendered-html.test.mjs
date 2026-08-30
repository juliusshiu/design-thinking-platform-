import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the 4D canvas workspace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>4D Design Studio — Canvas-first design thinking<\/title>/i);
  assert.match(html, /aria-label="Design stages"/);
  assert.match(html, /Open the opportunity space/);
  assert.match(html, /Discover<!-- --> canvas/);
  assert.match(html, /Research questions/);
  assert.match(html, /aria-label="Discover stage review"/);
  assert.match(html, /og-canvas\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("keeps the canvas interactions and product styling in source", async () => {
  const [css, page, layout] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /canvasTool/);
  assert.match(page, /beginCanvasPan/);
  assert.match(page, /topic-resize-handle/);
  assert.match(page, /criticCollapsed/);
  assert.match(css, /Infinite canvas/);
  assert.match(css, /\.section-card\.selected/);
  assert.match(css, /\.critic-panel\.collapsed/);
  assert.match(layout, /og-canvas\.png/);

  await assert.rejects(
    access(new URL("app/_sites-preview", templateRoot)),
  );
});
