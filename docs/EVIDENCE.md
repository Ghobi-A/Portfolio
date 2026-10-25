# Project evidence ledger

## Motion and recruitment verification — 25 October 2026

The recruitment refresh below was adopted from Portfolio PR #7, with the visible introduction rewritten for this design. No new qualification, employment history or replacement CV is published. Source files were fetched read-only from public main branches; no experiments were rerun.

- KH4 `reports/ml/group_cv_report.md` blob `642e1a42a651375acfef6559357a40f59e1ab1de` and current README confirm the displayed preliminary PR-AUC, ranking lift, uncertainty, 200 labelled rows, 23 groups and source imbalance. Inner group validation and the separate repeated-holdout evaluation remain distinct.
- Privacy `docs/CASE_STUDY.md` blob `4630e3661372b555c9de3417e3804517306a04cd` confirms the proxy-feature and training-failure audit narrative. The original three-setting benchmark and its five-seed intervals are retained as that benchmark, not relabelled as the project's newer experiments. The headline now explicitly associates .933 with ε 0.49.
- Big-Data's current `benchmark_summary.csv` matches all eight local/Spark partition means and five repeats per configuration. The existing single-runner, input-throughput versus training-time distinction is retained.
- Current Crestbound README confirms the shared simulation/game data, six-class chassis and 100,000-battle suite configuration; this motion pass does not rerun that suite or promote open proposals into results.
- Midi's current `docs/EXPERIMENT_RESULTS.md` still marks real-corpus evaluation pending. The interactive path describes deterministic controls, note events and MIDI stems, separate from the n-gram baseline and neural ambitions.
- Restaurant's local observed aggregates reconcile to the existing 53-record snapshot through structural tests. PBIX engine/provenance warnings and synthetic demo separation remain explicit; no production access or reconciliation is newly claimed.

The introduction's decorative bars carry no labels or numeric meaning and are hidden from assistive technology. Selection animation never invents intermediate measurements.


## Recruitment evidence refresh — 22 October 2026

This section supersedes the historical status snapshots below only for the
projects rechecked here. No experiments were rerun. The new introduction routes
analytics readers to restaurant operations and DS readers to NLP evaluation;
the existing gallery, privacy chart and experimental-work separation remain.

Demand-intelligence main now contains the temporal/marketing implementation;
its own current documentation distinguishes preliminary NLP evaluation,
demo-only forecasting and synthetic MMM. PR #23 is merged, not pending.
The displayed word-and-character SVM results come from `reports/ml/group_cv_report.md`:
actionable PR-AUC 0.65 (group-bootstrap 95% 0.55–0.77), prevalence 0.30,
Lift@10% 2.5 (2.1–3.3), 200 labelled rows and 23 groups. This five-fold
out-of-fold view is distinct from the repeated 70/15/15 group holdouts.
197/200 labels are YouTube; one annotator, empty classes and development reuse
limit the result. No production lift or sales outcome is asserted.

Source blob identities: KH4 README `86cce17464bad392fc53238bb6f9e0434a5d5933`;
group-CV report `642e1a42a651375acfef6559357a40f59e1ab1de`;
cross-validation implementation `8297ffda26d9021816edb99b10a6245d3d01ad91`.
Privacy case-study blob `4630e3661372b555c9de3417e3804517306a04cd` supports
the proxy audit and failure-detection narrative; achieved epsilon still covers
prepared records, not raw-data preprocessing or research releases.

Restaurant source and Portfolio disagree about whether the supplied PBIX
contains observed or synthetic data. Its data provenance is therefore not
asserted as verified. Public observed aggregate tables, fictional demo CSVs and
the supplied native PBIX are separate evidence objects. Native rendering,
refresh and reconciliation remain unverified. No order-level source is added.

The new CV versions are supplied separately for owner verification of employment
and certifications. The existing public CV download is intentionally unchanged;
no unverified credentials are newly published in this change.

## Portfolio presentation update — 20 October 2026

The interactive privacy chart retains the three source observations: ε 0.49 / 2 / 6, mean prediction ROC-AUC .933 / .944 / .945 and their five-seed 95% t intervals. The smooth curve is monotone cubic interpolation between the measured means; it is a visual guide, not a new fitted predictive model. The pink envelope joins the displayed interval boundaries and does not establish uncertainty at unmeasured settings. The exact-value fallback remains available without JavaScript; a full 0–1 AUC axis can be selected.

Crestbound uses the user-provided 1701×925 Hollow Court battle image, received 20 October 2026 and converted to WebP without creative alteration. It is not independently verified as an engine capture and does not establish gameplay performance or acceptance-test outcomes. The decorative text clipping is generated visual material and asserts no source-document or experimental provenance. Asset provenance is retained beside the files.

Semantic Drift is sourced from the public repository README and draft protocol at `https://github.com/Ghobi-A/Semantic-Drift`. Its six-generation chains, three conditions, four editing edges and two human-only washout edges describe the protocol, not observations. No participants, outcome data, demonstrated effect or completed preregistration is claimed. Ethics, pilot and recruitment remain pending.

No public audio/MIDI demo file was found in the inspected Midi tree; the Audio Lab links the existing generation notebook and repository rather than claiming an audio sample. Existing project evidence and publication-status caveats below remain in force; this presentation work did not rerun the experiments.

Historical snapshot reviewed 9 September 2026; see the dated refresh above for current rechecked scope. Sources are repository documentation and PR metadata, not independently rerun project experiments. Only Portfolio was changed. Blackhorse Barber is deliberately excluded.

## Publication rule

Keep **implemented**, **measured**, **proposed in an open PR**, and **future experiment** separate. A merged infrastructure change does not establish a measured production outcome. Do not silently promote a PR's scope to a released feature when updating this page. Recheck the state and evidence together.

| Project | Current evidence | Intended / pending scope | Public source |
| --- | --- | --- | --- |
| Behavioural Demand Intelligence | 200 audited labels; 23 groups; preliminary group-CV PR-AUC 0.65 and Lift@10% 2.5; temporal/API/MMM code on main | Full-data forecasting, label expansion, independent annotation and a final untouched test set remain pending; synthetic MMM is a method demonstration | [README](https://github.com/Ghobi-A/kh4-demand-intel#readme), [merged PR #23](https://github.com/Ghobi-A/kh4-demand-intel/pull/23) |
| Distributed Image ML Pipeline | 3,670 flower images; single-runner local Spark preprocessing and five-repeat input benchmarks | Dataproc runtime/lifecycle work merged; genuine multi-worker scaling measurements pending | [README and results](https://github.com/Ghobi-A/Big-Data#readme) |
| Crestbound Duelists | Python simulation and Godot prototype; shared YAML/JSON data; stateful v2.2 evaluator | Open #18 targets longer 6–8-round fights; draft #21 expands Greymere while character animation/cohesion remain unfinished | [README](https://github.com/Ghobi-A/Crestbound-Duelists#readme), [#18](https://github.com/Ghobi-A/Crestbound-Duelists/pull/18), [#21](https://github.com/Ghobi-A/Crestbound-Duelists/pull/21) |
| Restaurant Ordering & Kitchen Operations | TanStack Start/TypeScript, Supabase, Stripe; server-authoritative order and payment architecture; public website | Automatic kitchen printing is an open, hardware-unverified proposal. Guest history is device-local; loyalty redemption disabled | [Public website](https://www.ukasiagrill.co.uk/); private source reviewed but not republished |
| Privacy–Utility and Fairness Audit | Five-seed DP-SGD benchmark, RDP accounting, task/proxy audit, supplementary attacks, subgroup analysis | No new measured outcome inferred from the existence of audit tooling | [README](https://github.com/Ghobi-A/dp-insurance#readme) |
| Creative Audio Lab | Deterministic MIDI generator, n-gram melody baseline, tokenisation, rights-aware local corpus pipeline | Real-corpus empirical comparison pending; neural work gated on baseline evidence | [README](https://github.com/Ghobi-A/Midi#readme), [experiment status](https://github.com/Ghobi-A/Midi/blob/main/docs/EXPERIMENT_RESULTS.md) |

## Source snapshots

README blob SHAs returned by GitHub during review (blob identity, not commit IDs):

- kh4-demand-intel: `87916e06ef9af810fdc2865811743fbcc97a2a78`
- Big-Data: `a3e20996bcba16c20d83cf3cf69b116e08b419b1`
- Crestbound-Duelists: `d70873418a6dfc856751c5747b0bfb5074bf324e`
- dp-insurance: `91fd45130d0c5e04a033afac2984f6d7b91e7a8c`
- Midi: `48857c4b376478701b655e2c0721be13963fa9cd`

Open PR heads at review:

- KH4 #23: `4b7ece77bc11e002cfaf949cc7862bfc953c44d8` (rechecked during the evidence/motion pass)
- Crestbound #18: `a33076ece1a3e4fe78f4816ec04fe2345a6b92b0`
- Crestbound draft #21: `14481c0147dfe3478c2791127a06d5f291413315`

## Visual derivations

- Hero: explicitly conceptual observations/fit/holdout illustration. No invented experimental series is implied.
- KH4: explanatory classification architecture. No fabricated trailer response, sentiment time series, causal lift, conversions or sales.
- Distributed pipeline: preprocessing 486.8 → 1,109.6 images/s (2.28×); input 2,179.1 → 9,978.1 samples/s (4.58×). The two panels have independent zero-based scales. Spark runs on one Actions runner. CNN epoch means 8.68 versus 8.54 seconds came from one seeded three-epoch run each, so input speedup is not labelled training speedup.
- Crestbound: shared-data architecture. Decorative matrix stands for matchup coverage, not fabricated win probabilities. The old separable payoff conclusion is not applied to v2.2 stateful combat.
- Restaurant: documented order lifecycle; no fabricated screenshots, traffic, revenue, transaction counts, printer acceptance or exactly-once physical-print claim. No private operational identifiers are included.
- Privacy: epsilon `.49`, `2`, `6` with mean AUC `.933`, `.944`, `.945`. Whiskers `.909–.957`, `.927–.960`, `.928–.961`; HGB reference `.953`. Five-seed 95% t intervals are not population uncertainty. `.933` is prediction AUC, **not attack AUC**. SVG axis has an explicitly disclosed truncated range. Accessible exact-value table is in the case study.
- Audio: scope progression rather than invented piano-roll output or unmeasured real-corpus performance. The default is rules; synthetic-bootstrap n-grams are not neural generation.

## Evidence / motion follow-up

Historical follow-up: the five README identities above and open-PR observations describe that earlier pass, not current status. The 22 October refresh supersedes KH4 #23's open status: its code is on main and the PR is merged. Forecasting still uses a demo-only, class-stratified 304-row extract; no model is recommended and no full-data or sales claim follows. Historical Crestbound PR states have not been rechecked in this recruitment pass. Restaurant diagrams retain their architectural scope.

Chart contract: the added partition plot asks how mean preprocessing throughput changes across the four tested partition categories. Eight measured rows, five runs per configuration, 3,670 images on one runner. Native SVG in the existing portfolio; ordered categorical x positions, zero-based 0–1,200 images/s y scale, rust solid Spark and sage dashed local baseline. Visible exact-value table provides a readable mobile/no-JS alternative. This shows local-mode partition scaling, never multi-worker scaling. Source: `Big-Data/reports/tables/benchmark_summary.csv`, blob `d4c12f145fee3b201ce3b966cc40cc74fd825a25`. Local means: 470.9964, 486.7626, 483.4392, 482.5676; Spark means: 446.8986, 806.8249, 1086.2015, 1109.5528. One decimal displayed; no significance claim. The source CSV retains standard deviations.

The added training comparison uses a zero-based shared bar scale: 8.68 s JPEG and 8.54 s TFRecord, from the README. These are three-epoch means from one seeded run per format. No general training-speedup conclusion is added. Other new visuals explain evaluation boundaries, stateful combat, trust boundaries, distinct audit questions and MIDI stages; they do not encode invented experimental observations.

## Links

Corrected the old Crestbound dashboard URL to `https://crestbound-balance-lab.streamlit.app/`, as documented by the repository. Creative Audio Lab now links to the existing Midi repository instead of claiming a repository is forthcoming. CV asset is unchanged and uses relative `/Portfolio/`-safe paths. External HTTP checks are separate from application acceptance tests; sleeping Streamlit apps or provider access restrictions must be reported as unverified, not treated as proof that an application is broken.
