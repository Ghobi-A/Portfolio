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

The homepage is a **React 19 + TypeScript app in `web/`**, built with Vite and **prerendered to static HTML**, then hydrated. The page is complete before JavaScript runs (readable without it, indexable), and GitHub Pages still serves plain static files.

| Layer | Library | Used for |
| --- | --- | --- |
| UI | React 19 | Components; state for the bench and featured previews |
| Component motion | Motion (`motion/react`) | Bench tab underline (shared layout), panel entrances, preview wipes (`AnimatePresence`), spring cursor and tilt |
| Effects | React Bits (`web/src/reactbits/`, MIT + Commons Clause) | `ScrollVelocity` marquee, `DecryptedText` labels, `Magnet` actions |
| 3D | React Three Fiber + three.js | The hero's slat-field shader (a lazy chunk, never on the critical path) |
| Scroll | GSAP (ScrollTrigger, SplitText, CustomEase) via `@gsap/react`; Lenis via `lenis/react` | Scroll choreography and smooth scrolling on one ticker |

Project content lives in `web/src/content/`, converted verbatim from the former static page. Case-study disclosures, method inspectors and evidence charts are enhanced after hydration by `web/src/lib/evidence.ts` and `web/src/lib/privacyChart.ts`. Subpages under `projects/` are unchanged and keep `assets/css/site.css`. Inter Tight is bundled with its licence in `web/src/assets/fonts/`; Source Serif 4 for the subpages stays in `assets/fonts/`. No remote font or script is loaded.

Build:

```bash
(cd web && npm ci && npm run build)   # type-check, client build, SSR build, prerender -> web/dist
python scripts/build_site.py          # metadata, social assets, subpages -> _site
```

`npm run dev` in `web/` starts a live-reloading dev server. `scripts/build_site.py` reads `web/dist/index.html`, copies the bundles from `web/dist/app/`, creates `_site` and adds:

- Open Graph and Twitter/X social-preview metadata
- a generated 1200×630 branded preview image
- SVG favicon and Apple touch icon
- canonical URL, JSON-LD structured data, robots and sitemap files
- safer external links (landmarks, native disclosures and the skip link are now authored in source)

GitHub Pages deploys `_site` automatically whenever `main` changes. The workflow lives in `.github/workflows/deploy-pages.yml`: a build job (Node app build, Python build and tests, upload) and a separate deploy job.

PRs run the same build and structural checks without deploying. The `METADATA:START` / `METADATA:END` region is the build's only HTML template contract. Layout changes outside it require no build-script string patches. Generated output is ignored by Git.

## Validation and evidence

```bash
(cd web && npm ci && npm run build)
python scripts/build_site.py
python scripts/test_site.py
python scripts/check_links.py  # optional external HTTP checks
```

See [the 3 November motion audit](docs/MOTION-AUDIT-2026-11-03.md) for the GSAP/Three.js motion system, its budgets and verification. See [the project evidence ledger](docs/EVIDENCE.md) for source snapshots, metric definitions and open-PR scope. See [implementation and QA notes](docs/IMPLEMENTATION.md) for the audit, architecture and remaining browser validation. Structural tests do not replace browser/Lighthouse checks. The [25 October motion and recruitment report](docs/MOTION-RECRUITMENT-2026-10-25.md) includes current browser coverage, before/after screenshots and measured Lighthouse results.

Optional browser regression (requires Playwright and Chromium in the review environment, not the website):

```bash
SITE_URL=http://127.0.0.1:8000 CHROME_PATH=/usr/bin/chromium node scripts/browser_site.cjs
```

It checks 320, 375, 390, 768, 1024, 1440 and 1920px widths, keyboard controls, diagrams, chart selections, one-shot motion, live and initial reduced motion, no-JS fallbacks and project deep links. Set `REVIEW_DIR` to choose the screenshot/results directory. If Playwright is absent, install it in a temporary review-tools directory and expose that directory through `NODE_PATH`; there are no runtime npm dependencies.

## Local preview

Run:

```bash
(cd web && npm ci && npm run build)
python scripts/build_site.py
python -m http.server 8000 --directory _site
```

Then open `http://localhost:8000`. For development with live reload, run `npm run dev` in `web/`.

## Visual system

The interactive editorial refinement adapts [PR #5](https://github.com/Ghobi-A/Portfolio/pull/5): pipeline/method inspectors read authored descriptions, and the four-setting partition explorer reads the existing source table. Sticky navigation and a frame-batched reading rule provide orientation. Exact values never count up; the static figures and native case studies remain usable without scripts. See [the implementation and measurement report](docs/INTERACTIVE-EDITORIAL.md).

The gallery/proof layout leads with the privacy audit, preserving the complete case studies and their existing deep links. Navy type, pink uncertainty plots and a yellow selected point sit on an ivory reading surface. The three measured privacy settings can be selected by pointer, touch or keyboard; the curve is a monotone guide between the observations. A full 0–1 AUC axis and static exact-value fallback are available. Decorative print artwork has no visible source-document claim. Crestbound uses the user-supplied Hollow Court image. Native motion draws the curve, acknowledges point selection and traces system stages; reduced-motion users retain the complete static content. Semantic Drift follows Audio Lab with its pre-data status explicit. See `DESIGN.md` for the finished design tokens and component conventions.
