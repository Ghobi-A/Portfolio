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
- Semantic Drift — language-transmission research protocol (pre-data)

## Build and deployment

The portfolio is a dependency-free static site: semantic content in `index.html`, styling in `assets/css/site.css`, behaviour in `assets/js/main.js`, and reduced-motion-aware native animation in `assets/js/motion.js`. The interactive privacy figure lives in `assets/js/privacy-chart.js` and `assets/css/privacy-chart.css`. Source Serif 4 is self-hosted with its open-font licence in `assets/fonts/`; no remote font or animation library is required. Before deployment, `scripts/build_site.py` creates `_site` and adds:

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
node --check assets/js/privacy-chart.js
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

## Visual system

The interactive editorial refinement adapts [PR #5](https://github.com/Ghobi-A/Portfolio/pull/5): pipeline/method inspectors read authored descriptions, and the four-setting partition explorer reads the existing source table. Sticky navigation and a frame-batched reading rule provide orientation. Exact values never count up; the static figures and native case studies remain usable without scripts. See [the implementation and measurement report](docs/INTERACTIVE-EDITORIAL.md).

The gallery/proof layout leads with the privacy audit, preserving the complete case studies and their existing deep links. Navy type, pink uncertainty plots and a yellow selected point sit on an ivory reading surface. The three measured privacy settings can be selected by pointer, touch or keyboard; the curve is a monotone guide between the observations. A full 0–1 AUC axis and static exact-value fallback are available. Decorative print artwork has no visible source-document claim. Crestbound uses the user-supplied Hollow Court image. Native motion draws the curve, acknowledges point selection and traces system stages; reduced-motion users retain the complete static content. Semantic Drift follows Audio Lab with its pre-data status explicit. See `DESIGN.md` for the finished design tokens and component conventions.
