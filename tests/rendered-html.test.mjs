import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { canStartNoteDrag, getNoteDragPosition } from "../lib/note-drag.mjs";

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
  assert.doesNotMatch(html, /add-floating/);
  assert.match(html, /aria-label="Add thinking section"/);
  assert.match(html, /title="Create a new thinking section"/);
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
  assert.match(page, /onLostPointerCapture=\{endNoteDrag\}/);
  assert.match(page, /onPointerDown=\{\(event\) => beginNoteDrag\(event, focusSection.id, note, index\)\}/);
  assert.match(page, /data-note-drag-handle/);
  assert.match(page, /event.pointerId !== drag.pointerId/);
  assert.match(css, /\.focus-note\.is-dragging/);
  assert.match(css, /\.focus-note-edge\.edge-left/);
  assert.match(css, /\.focus-note-edge\.edge-right/);
  assert.match(css, /Infinite canvas/);
  assert.match(css, /\.section-card\.selected/);
  assert.match(css, /\.critic-panel\.collapsed/);
  for (const selector of ["canvas", "focus-canvas", "mini-board-preview"]) {
    const rule = css.match(new RegExp(`\\.${selector} \\{([^}]+)\\}`));
    assert.match(rule?.[1] ?? "", /background-image: radial-gradient/);
    assert.doesNotMatch(rule?.[1] ?? "", /linear-gradient/);
  }
  assert.match(layout, /og-canvas\.png/);

  await assert.rejects(
    access(new URL("app/_sites-preview", templateRoot)),
  );
});

test("note frame drags do not steal text editing or canvas panning", () => {
  const pointer = {
    button: 0,
    isPrimary: true,
    spacePressed: false,
    target: { closest: () => null },
  };
  assert.equal(canStartNoteDrag(pointer), true, "the note frame and grip can start a drag");
  for (const button of [1, 2]) {
    assert.equal(canStartNoteDrag({ ...pointer, button }), false, "middle/right drag belongs to the board");
  }
  assert.equal(canStartNoteDrag({ ...pointer, spacePressed: true }), false, "Space + drag pans the board");
  assert.equal(canStartNoteDrag({ ...pointer, isPrimary: false }), false, "a second touch cannot take over");
  assert.equal(canStartNoteDrag({
    ...pointer,
    target: { closest(selector) {
      assert.match(selector, /textarea/);
      assert.match(selector, /input/);
      assert.match(selector, /contenteditable/);
      assert.match(selector, /button:not\(\[data-note-drag-handle\]\)/);
      return {};
    } },
  }), false, "editing and action controls are excluded");
});

test("dragging a note keeps the grab offset at every supported zoom", () => {
  for (const zoom of [0.55, 1, 1.5]) {
    const drag = { originX: 250, originY: 180, startX: 417, startY: 301, zoom };
    assert.deepEqual(getNoteDragPosition(drag, 417, 301), { x: 250, y: 180 });
    assert.deepEqual(getNoteDragPosition(drag, 417 + 90 * zoom, 301 + 60 * zoom), { x: 340, y: 240 });
    assert.deepEqual(getNoteDragPosition(drag, 417 - 90 * zoom, 301 - 60 * zoom), { x: 160, y: 120 });
    assert.deepEqual(getNoteDragPosition(drag, -1000, -1000), { x: 22, y: 52 });
  }
});
