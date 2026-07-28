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

The portfolio source is maintained in `index.html`. Before deployment, `scripts/build_site.py` creates a production-ready `_site` directory and adds:

- Open Graph and Twitter/X social-preview metadata
- a generated 1200×630 branded preview image
- SVG favicon and Apple touch icon
- canonical URL, JSON-LD structured data, robots and sitemap files
- accessibility landmarks, a keyboard skip link and safer external links

GitHub Pages deploys `_site` automatically whenever `main` changes. The workflow lives in `.github/workflows/deploy-pages.yml`.

## Local preview

Run:

```bash
python scripts/build_site.py
python -m http.server 8000 --directory _site
```

Then open `http://localhost:8000`.
