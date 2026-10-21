# Recruitment content refresh

## Changes

- Added a concise professional introduction and direct analytics/DS routes.
- Made project ownership, decision context and bounded results visible.
- Replaced NLP activity counts with preliminary PR-AUC, Lift@10% and corpus size,
  alongside bootstrap intervals and data limitations.
- Distinguished group cross-validation from repeated group holdouts.
- Removed the unverified claim that the supplied native PBIX contains real data.
- Updated the evidence ledger's stale KH4 status without rewriting unrelated history.
- Preserved the editorial palette, serif typography, animations, chart observations,
  experimental section and original public CV asset.

## Validation

- `python scripts/build_site.py`: passed.
- `python scripts/test_site.py`: 17/17 passed, including three new recruitment,
  NLP-qualification and PBIX-provenance regression checks.
- `node --check` for main.js, motion.js and privacy-chart.js: passed.
- `git diff --check`: passed.
- Desktop Chromium preview at 1363px: introduction visually inspected; no
  document-level horizontal overflow. DS route reached the NLP project and
  its native case-study disclosure opened with the qualified result visible.
- Captured console entries were browser-extension metadata errors, not portfolio
  script errors. This is not a Lighthouse, mobile-device or full interaction audit.

## Release scope

Source changes are proposed on a branch for review, not merged or deployed.
The separately delivered Data Analyst and Data Scientist CVs retain supplied
employment/certification facts pending owner verification; they are not committed
as public downloads. No source-project experiments or private data were changed.
