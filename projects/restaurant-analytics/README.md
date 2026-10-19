# Restaurant analytics public case study

The active dashboard uses a curated observed aggregate snapshot from read-only PostgreSQL queries executed on 19 October 2026. Publication of these anonymised business aggregates was requested by the owner. No customer fields or original order identifiers are included. Mixed test/live provenance and all order states remain explicit.

`dashboard/observed-aggregates.json` is the downloadable source; `observed-data.js` is the same object bundled for offline browser use. `observed-dashboard.js` renders the four pages. The scale scenario uses volume × observed AOV and volume × observed cancellation rate. It is a fixed-mix estimate, not a validated forecast. Aggregates are not used to fabricate order records.

Earlier `DEMO-` CSVs and `generate_demo.py` remain clearly synthetic Power BI practice inputs only; the active report no longer reads them. Historical screenshots depict the earlier synthetic prototype and are not used as current evidence. Native Power BI import, DAX engine and report validation remain pending.
