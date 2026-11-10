# Editorial motion overhaul — first scene

Base: `2ab4bb9`. Branch: `motion/editorial-signal-opening`. No merge or deployment.

## Audit

Inspected index.html, assets/css/site.css, assets/js/motion.js,
tools/motion/signal-field.src.js, DESIGN.md and docs/MOTION-AUDIT-2026-11-03.md
before editing. The current implementation batches once-only reveals, runs a
small frame scan and leaves the field's independent scatter trigger to suggest
continuity. The previous 3/5/6 November design amendments contradict one another;
the 6 November repair dominates the actual code. Existing case-study controls,
native disclosures, exact values and static content are sound foundations.

Viewed https://continuance.ai/author in Chromium at 1440x1000 at the opening and
following scroll position. Observed a persistent large portrait, layered type and
large compositional transitions. Adopted continuity and scale hierarchy, without
using its images, branding, text scrambling, sound or overlays. The browser needed
ignoreHTTPSErrors for this public reference because of the environment's certificate
chain; local site verification did not use that exception.

## Three proposed scenes

1. **Signal → structure → evidence (implemented).** `.opening-stage` contains
   `.intro-copy`, `.signal-field` and decorative `.opening-score`. Desktop trigger
   `top 92px`, end `+=85vh`, scrub .35, pin stage. At labels signal=0,
   structure=.35, evidence=.9, resolve field scatter .8→0, rotate surface z
   -.22→.12, lift field -30px and scale 1→1.08, contract summary 1→.76 with
   x=24px, draw rule 0→100%. Unpin into practice routes and collection index.
   Below 1100px or 800px height: no pin, top/top through bottom/30%, type .94,
   field -12px, no enlargement. Reduced motion: static layout, no scrub or pin.
2. **Project inspection (proposal only).** `#file-dp .project-grid`: hold only
   `.project-copy` on roomy desktops from top/110px for up to 65vh. A separate
   annotation layer connects `.frontier` to `.research-sidebar` with question,
   measured observations and interpretation-limit timeline labels at 0/.4/.8.
   Never move chart marks, change selected points, count values or cover controls.
   Keyboard focus removes the hold; phones and reduced motion use normal flow.
3. **Evidence → conversation (proposal only).** `#about` → `.contact h2`:
   reuse the decorative rule, scrub from contact top/80% to top/25%, enlarge
   headline .82→1 and finish rule as underline. Contact controls stay still.
   No pin; phones use only the rule, reduced motion shows final styles.

## Implemented scope

Scene 1 only, plus motion specification revision. The static opening composition
also changes noticeably. Existing factual case studies and project interactions
are unchanged. `sceneTimeline` provides shared defaults; `sceneState` drives both
DOM and field. GSAP matchMedia reverts transforms and spacers. Focus bypasses the
pin for the remainder of that media context. A font-ready initial hash correction
handles bookmarks after pin measurement. The existing field is rebuilt from source;
rendering is capped near 30fps rather than adding effects or draw calls.

## Validation

See `review/2026-11-10/scene-results.json` and screenshots for actual browser captures.
The dedicated scene regression checks desktop pin versus mobile/tablet normal flow,
0/50/100/50/0% progression, reverse agreement, field uniform progression, live
reduced-motion teardown/restoration, keyboard bypass, project-link activation,
initial study/project/contact bookmarks, horizontal overflow and console errors.
It also captures initial reduced-motion and JavaScript-disabled phone layouts.

The repository browser regression covers seven widths, keyboard menu, SVG chart
selection, inspectors, native disclosures, static figures, fonts, images, reduced
motion and no-JS. Structural tests cover 18 checks. Limitations: headless Chromium
uses SwiftShader; no physical-device GPU profile, Safari, Firefox or deployed test.
The selected-field animation remains decorative and does not represent observations.

Additional checks: cold desktop bookmarks landed at y=112px for `#file-dp` and
`#GA-DP-05`, and y=507px for the bottom-aligned contact section. A 1440x700
viewport used no pin. Observed load layout-shift sums were .00088 (1440x1000),
.00055 (390x844), and .00033 (1440x700). These are lab observations, not a
field Core Web Vitals claim. Long same-document contact navigation was allowed
2.5 seconds to finish the existing native smooth scroll.

Final result: all 18 structural tests, seven-width existing browser suite and
three-width scene suite passed. No console errors. Forward/reverse scene progress
matched to within .000001 on desktop. Mid-pin keyboard focus at scrollY=425 removed
the hold and kept the focused action inside the viewport (y=262–308px).

### Captured frames

[Desktop opening](review/2026-11-10/opening-1440-top.png) ·
[Desktop midpoint](review/2026-11-10/opening-1440-0.5.png) ·
[Desktop resolved](review/2026-11-10/opening-1440-1.png) ·
[Phone opening](review/2026-11-10/opening-390-top.png) ·
[Phone reduced motion](review/2026-11-10/reduced-390.png) ·
[Phone no JavaScript](review/2026-11-10/no-js-390.png)

Reproduce with `python3 scripts/build_site.py`, serve the repository on port 8000,
then run `node scripts/browser_scene.cjs` (Playwright and Chromium required).
