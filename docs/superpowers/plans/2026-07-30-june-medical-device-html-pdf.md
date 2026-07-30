# June 2026 Medical Device HTML PDF Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a PDF rendering of the existing June 2026 Medical Device HTML report and expose it from the report dashboard.

**Architecture:** Treat the existing report HTML as the sole visual source, add only print-specific CSS, and use Playwright's Chromium PDF output with background graphics enabled. Protect the dashboard link with a Node integration test and validate the resulting artifact structurally, textually, visually, and through a local HTTP server.

**Tech Stack:** Static HTML/CSS, Node.js built-in test runner, Playwright/Chromium, Poppler (`pdfinfo`, `pdftotext`, `pdftoppm`).

## Global Constraints

- Only `reports/medical-device/monthly/2026-06/` receives a new PDF.
- The PDF must be rendered from the existing HTML report, not from Markdown.
- The complete report content must remain present.
- Webpage-only navigation must not appear in print.
- The dashboard link must open the PDF in the browser and must not use the `download` attribute.
- Existing unrelated working-tree changes must remain untouched.

---

### Task 1: Protect the Dashboard PDF Link

**Files:**
- Create: `tests/dashboard-pdf-link.test.mjs`
- Modify: `index.html:97-106`

**Interfaces:**
- Consumes: the dashboard's static HTML.
- Produces: a June Medical Device `PDF` anchor pointing to `reports/medical-device/monthly/2026-06/report.pdf`.

- [ ] **Step 1: Write the failing integration test**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const juneCard = html.match(
  /<article class="card device">[\s\S]*?June Medical Device News Report[\s\S]*?<\/article>/
)?.[0];

test("June Medical Device card opens its PDF in the browser", () => {
  assert.ok(juneCard, "June Medical Device card must exist");
  assert.match(
    juneCard,
    /<a class="button" href="reports\/medical-device\/monthly\/2026-06\/report\.pdf">PDF<\/a>/
  );
  assert.doesNotMatch(juneCard, /download(?:=|\s|>)/);
});
```

- [ ] **Step 2: Run the test and confirm the missing-link failure**

Run: `node --test tests/dashboard-pdf-link.test.mjs`

Expected: one failing test because the June Medical Device card has no `report.pdf` anchor.

- [ ] **Step 3: Add the minimal dashboard link**

Insert after the existing View report anchor:

```html
<a class="button" href="reports/medical-device/monthly/2026-06/report.pdf">PDF</a>
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `node --test tests/dashboard-pdf-link.test.mjs`

Expected: one passing test and zero failures.

- [ ] **Step 5: Commit the isolated dashboard change**

```bash
git add index.html tests/dashboard-pdf-link.test.mjs
git commit -m "feat: link June medical device PDF"
```

### Task 2: Render the HTML Report as PDF

**Files:**
- Modify: `reports/medical-device/monthly/2026-06/index.html:158-162`
- Create: `reports/medical-device/monthly/2026-06/report.pdf`

**Interfaces:**
- Consumes: `reports/medical-device/monthly/2026-06/index.html`.
- Produces: an A4, background-preserving `report.pdf` rendered from that HTML.

- [ ] **Step 1: Strengthen the report's print-only layout rules**

Replace the existing `@media print` block with:

```css
@media print {
  @page { size: A4; margin: 12mm; }
  .nav { display: none; }
  .shell { max-width: none; padding: 0; }
  .hero, .kpi, .article-card, .week-overview, .other-news, .risks {
    break-inside: avoid;
  }
  .markdown-table-wrap, .appendix-wrap { overflow: visible; }
  .markdown-table { min-width: 0; font-size: 10px; }
  .appendix-table { font-size: 9px; }
  .markdown-table th, .markdown-table td,
  .appendix-table th, .appendix-table td {
    overflow-wrap: anywhere;
  }
  .appendix-table th { position: static; }
  body { background: #fff; print-color-adjust: exact; }
}
```

- [ ] **Step 2: Render the local HTML through Chromium**

Run from the repository root with the bundled Node package directory in `NODE_PATH`:

```bash
node -e 'const { chromium } = require("playwright"); (async () => { const browser = await chromium.launch({ headless: true }); const page = await browser.newPage(); await page.goto("file://" + process.cwd() + "/reports/medical-device/monthly/2026-06/index.html", { waitUntil: "networkidle" }); await page.pdf({ path: "reports/medical-device/monthly/2026-06/report.pdf", format: "A4", printBackground: true, preferCSSPageSize: true }); await browser.close(); })().catch(error => { console.error(error); process.exit(1); });'
```

Expected: exit code 0 and a non-empty `report.pdf`.

- [ ] **Step 3: Validate PDF structure and content**

Run:

```bash
pdfinfo reports/medical-device/monthly/2026-06/report.pdf
pdftotext reports/medical-device/monthly/2026-06/report.pdf - | rg "Monthly Medical Device News Report|Executive Summary 月度核心总结|Top Amcor Opportunities"
```

Expected: `pdfinfo` reports a valid A4 PDF with at least one page, and all three expected report headings are found.

- [ ] **Step 4: Render every page for visual inspection**

Run:

```bash
mkdir -p tmp/pdfs/june-medical-device
pdftoppm -png -r 120 reports/medical-device/monthly/2026-06/report.pdf tmp/pdfs/june-medical-device/page
```

Inspect every generated PNG for missing content, clipped tables, overlap, broken Chinese glyphs, and awkward section breaks. If defects appear, adjust only the print CSS, regenerate the PDF, and repeat structural and visual checks.

- [ ] **Step 5: Commit the report artifact and print CSS**

```bash
git add reports/medical-device/monthly/2026-06/index.html reports/medical-device/monthly/2026-06/report.pdf
git commit -m "feat: publish June medical device HTML PDF"
```

### Task 3: Verify the Complete Static-Site Behavior

**Files:**
- Verify: `index.html`
- Verify: `reports/medical-device/monthly/2026-06/report.pdf`

**Interfaces:**
- Consumes: the finished static site.
- Produces: evidence that the dashboard opens a served PDF and no unrelated report card changed.

- [ ] **Step 1: Run the dashboard regression test**

Run: `node --test tests/dashboard-pdf-link.test.mjs`

Expected: one passing test and zero failures.

- [ ] **Step 2: Serve the repository locally**

Run: `python3 -m http.server 8765`

Expected: the static server listens on `127.0.0.1:8765`.

- [ ] **Step 3: Verify the PDF response**

Run:

```bash
curl -I http://127.0.0.1:8765/reports/medical-device/monthly/2026-06/report.pdf
```

Expected: HTTP 200 and `Content-Type: application/pdf`.

- [ ] **Step 4: Verify the scoped diff**

Run:

```bash
git diff HEAD~2..HEAD -- index.html reports/medical-device/monthly/2026-06/index.html tests/dashboard-pdf-link.test.mjs
git status --short
```

Expected: the feature changes only the June Medical Device card, its report print CSS, its PDF, and its focused test; pre-existing unrelated `.DS_Store` and weekly report changes remain uncommitted.

- [ ] **Step 5: Push the verified `gh-pages` commits**

Run: `git push origin gh-pages`

Expected: the remote accepts the commits.

- [ ] **Step 6: Verify the live URLs**

Verify:

- `https://market-insights.github.io/reports/medical-device/monthly/2026-06/report.pdf` returns HTTP 200 with a PDF content type.
- `https://market-insights.github.io/` contains the June Medical Device PDF link.

Account for GitHub Pages propagation or cache delay before reporting completion.
