# Project evidence ledger

Reviewed 9 September 2026. Sources are repository documentation and current PR metadata, not independently rerun project experiments. Only Portfolio was changed. Blackhorse Barber is deliberately excluded.

## Publication rule

Keep **implemented**, **measured**, **proposed in an open PR**, and **future experiment** separate. A merged infrastructure change does not establish a measured production outcome. Do not silently promote a PR's scope to a released feature when updating this page. Recheck the state and evidence together.

| Project | Current evidence | Intended / pending scope | Public source |
| --- | --- | --- | --- |
| Behavioural Demand Intelligence | 4,831 processed signals; 200 audited labels; 23 groups; five-seed preliminary classifier evaluation | Open #23: timestamp provenance, weekly probability-mass proxy, rolling-origin Bayesian forecasting, monitoring, API/dashboard service; separate synthetic MMM | [README](https://github.com/Ghobi-A/kh4-demand-intel#readme), [PR #23](https://github.com/Ghobi-A/kh4-demand-intel/pull/23) |
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

All five public README blob identities above were rechecked against GitHub main and remain unchanged. KH4 #23 remains open and now documents demo-only forecasting results on a class-stratified 304-row extract, with the naive forecast beating the Bayesian model and no model recommended. This does not establish volume-representative demand, full-dataset performance or release status. Crestbound #18 remains open and #21 remains draft. Restaurant diagrams use only the previously reviewed architecture; private source was not re-audited in this pass.

Chart contract: the added partition plot asks how mean preprocessing throughput changes across the four tested partition categories. Eight measured rows, five runs per configuration, 3,670 images on one runner. Native SVG in the existing portfolio; ordered categorical x positions, zero-based 0–1,200 images/s y scale, rust solid Spark and sage dashed local baseline. Visible exact-value table provides a readable mobile/no-JS alternative. This shows local-mode partition scaling, never multi-worker scaling. Source: `Big-Data/reports/tables/benchmark_summary.csv`, blob `d4c12f145fee3b201ce3b966cc40cc74fd825a25`. Local means: 470.9964, 486.7626, 483.4392, 482.5676; Spark means: 446.8986, 806.8249, 1086.2015, 1109.5528. One decimal displayed; no significance claim. The source CSV retains standard deviations.

The added training comparison uses a zero-based shared bar scale: 8.68 s JPEG and 8.54 s TFRecord, from the README. These are three-epoch means from one seeded run per format. No general training-speedup conclusion is added. Other new visuals explain evaluation boundaries, stateful combat, trust boundaries, distinct audit questions and MIDI stages; they do not encode invented experimental observations.

## Links

Corrected the old Crestbound dashboard URL to `https://crestbound-balance-lab.streamlit.app/`, as documented by the repository. Creative Audio Lab now links to the existing Midi repository instead of claiming a repository is forthcoming. CV asset is unchanged and uses relative `/Portfolio/`-safe paths. External HTTP checks are separate from application acceptance tests; sleeping Streamlit apps or provider access restrictions must be reported as unverified, not treated as proof that an application is broken.
