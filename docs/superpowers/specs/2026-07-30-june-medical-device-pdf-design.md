# June 2026 Medical Device PDF Design

## Scope

Add a browser-previewable PDF only for the June 2026 Medical Device monthly
report at:

`reports/medical-device/monthly/2026-06/`

Do not generate PDFs for other reports and do not change the broader report
generation workflow.

## Output

- Generate `reports/medical-device/monthly/2026-06/report.pdf` from the existing
  June Medical Device Markdown report using the repository's existing monthly
  Markdown-to-PDF converter.
- Preserve the report's existing content and source links.
- Add a `PDF` link to only the June Medical Device card in the dashboard
  `index.html`.
- Use a normal anchor link without the `download` attribute so the browser's PDF
  viewer opens the file for preview.

## Implementation

1. Add a focused dashboard regression test that requires the June Medical
   Device card to link to
   `reports/medical-device/monthly/2026-06/report.pdf`.
2. Run the test before modifying production output and confirm that it fails
   because the link is absent.
3. Generate the PDF with the existing converter from the already-published
   `report.md`.
4. Add the `PDF` button beside the existing Markdown and JSON buttons.
5. Run the dashboard test again.

## Verification

- Confirm `report.pdf` exists and is recognized as a valid PDF.
- Inspect its metadata and page count with `pdfinfo`.
- Extract text to confirm the expected June Medical Device report title and
  substantive report text are present.
- Render every PDF page to PNG and visually inspect for clipped text, overlap,
  missing Chinese glyphs, broken tables, and poor section transitions.
- Serve the static site locally and confirm the dashboard PDF link returns HTTP
  200 with `application/pdf`.
- Confirm no report card other than June 2026 Medical Device was changed.

## Publishing

Local generation and verification are part of implementation. Publishing to
GitHub Pages requires committing and pushing the intended report PDF and
dashboard change after verification; unrelated existing working-tree changes
must remain untouched.
