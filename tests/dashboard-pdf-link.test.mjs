import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const juneCard = html
  .match(/<article class="card device">[\s\S]*?<\/article>/g)
  ?.find((card) => card.includes("June Medical Device News Report"));

test("June Medical Device card opens its PDF in the browser", () => {
  assert.ok(juneCard, "June Medical Device card must exist");
  assert.match(
    juneCard,
    /<a class="button" href="reports\/medical-device\/monthly\/2026-06\/report\.pdf">PDF<\/a>/,
  );
  assert.doesNotMatch(juneCard, /download(?:=|\s|>)/);
});
