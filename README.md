# Ghobikan Aravindan — Data Science Portfolio

Personal portfolio for an applied data scientist building evaluated machine-learning systems, behavioural demand intelligence, privacy audits and deployed data products.

**Live site:** https://ghobi-a.github.io/Portfolio/

## Featured work

- Behavioural Demand Intelligence
- Distributed Image ML Pipeline
- Crestbound Duelists — RPG Balance Lab
- Restaurant Ordering & Kitchen Operations Platform
- Privacy–Utility and Fairness Audit
- Creative Audio Lab (in progress)

## Build and deployment

The portfolio is a dependency-free static site: semantic content in `index.html`, styling in `assets/css/site.css`, behaviour in `assets/js/main.js`, and optional GSAP motion in `assets/js/motion.js`. Before deployment, `scripts/build_site.py` creates `_site` and adds:

- Open Graph and Twitter/X social-preview metadata
- a generated 1200×630 branded preview image
- SVG favicon and Apple touch icon
- canonical URL, JSON-LD structured data, robots and sitemap files
- safer external links (landmarks, native disclosures and the skip link are now authored in source)

GitHub Pages deploys `_site` automatically whenever `main` changes. The workflow lives in `.github/workflows/deploy-pages.yml`.

PRs run the same build and structural checks without deploying. The `METADATA:START` / `METADATA:END` region is the build's only HTML template contract. Layout changes outside it require no build-script string patches. Generated output is ignored by Git.

## Validation and evidence

```bash
python scripts/build_site.py
python scripts/test_site.py
node --check assets/js/main.js
node --check assets/js/motion.js
python scripts/check_links.py  # optional external HTTP checks
```

See [the project evidence ledger](docs/EVIDENCE.md) for source snapshots, metric definitions and open-PR scope. See [implementation and QA notes](docs/IMPLEMENTATION.md) for the audit, architecture and remaining browser validation. Structural tests do not replace browser/Lighthouse checks.

## Local preview

Run:

```bash
python scripts/build_site.py
python -m http.server 8000 --directory _site
```

Then open `http://localhost:8000`.
