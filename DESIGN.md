---
name: Gallery Proof
description: An evidence-led portfolio in navy ink, editorial pink and warm paper.
colors:
  ink: "#102449"
  paper: "#fdfcfa"
  panel: "#fffefd"
  muted: "#465574"
  pink: "#bd005f"
  pink-wash: "#fff0f6"
  yellow: "#ffd137"
  line: "#d8dfe9"
typography:
  headline:
    fontFamily: '"Source Serif 4", Georgia, serif'
    fontSize: "clamp(34px, 3.45vw, 54px)"
    fontWeight: 650
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  body:
    fontFamily: '"Source Serif 4", Georgia, serif'
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: '"Source Serif 4", Georgia, serif'
    fontSize: "14px"
    lineHeight: 1.5
rounded:
  control: "3px"
spacing:
  tight: "10px"
  group: "20px"
  panel: "36px"
  section: "60px"
components:
  button-primary:
    backgroundColor: "{colors.pink}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "10px 17px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 17px"
  evidence-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
---

# Design System: Gallery Proof

## Overview

**Creative North Star: "Gallery Proof"**

Study Gallery's clear arrangement meets Proof Print's expressive ink and annotated charts. The work, not a monumental identity block, earns attention. The research-dossier structure provides technical depth without requiring every visitor to read it.

Warm paper and locally served serif type make a generous reading surface. Pink marks actions and uncertainty; yellow identifies a selected observation. Project artwork has room to breathe rather than becoming a generic thumbnail grid.

**Key Characteristics:**

- Evidence-led, readable and inspectable.
- Flat paper surfaces, fine rules and compact controls.
- Distinctive charts and project imagery rather than repeated decorative icons.
- Purposeful native motion with complete static and reduced-motion paths.

## Colors

### Primary

Editorial Pink identifies primary actions, selected controls and chart intervals. Navy Ink is the primary reading and plotting color. The pink action token is darker than the plot fill to preserve text contrast.

### Secondary

Selected Yellow appears on the active measured point and the small masthead dot. It is not used as body text on paper.

### Neutral

Warm Paper is the page, Panel is the nearly white evidence surface, Muted Ink is secondary reading text, and Fine Rule separates related content. Token values above are normative.

**The Evidence Color Rule.** An annotation can be expressive, but its color must not imply a result the underlying project did not establish.

## Typography

Source Serif 4 is self-hosted in regular and italic variable faces, with Georgia as fallback. It carries both expressive headlines and readable body copy. System sans is acceptable for the operational dashboard's dense controls; monospace is reserved for actual identifiers and technical notation.

Headlines are semibold, closely but comfortably tracked, with balanced wrapping. The first project uses its own responsive headline size within the same scale. Body paragraphs use an approximately 65-character measure where space allows. Captions and technical sidebars are deliberately smaller, not lower-contrast placeholders.

**The Readable First Rule.** Never shrink technical evidence to protect a desktop composition on a phone; stack it and let it take the space it needs.

## Layout

The main container stops at 1840px, with fluid side gutters. Project sections pair story and evidence; the privacy lead adds a technical sidebar. Below 1250px that sidebar takes a second row. At 760px and below, the story, chart and methods become a single reading sequence; the project index scrolls horizontally rather than compressing six labels.

Keep grouping tight inside charts and controls, then separate full projects generously. Deep case studies remain native disclosures. Audio and language experiments precede the concise background and direct contact area.

## Elevation & Depth

Flat by default. Fine borders and restrained tonal backgrounds define evidence panels. Pointer hover lifts selected evidence panels by 3px without shadows; keyboard focus uses a border and tone change. Reduced motion removes the lift. The pink chart envelope encodes displayed interval boundaries, not elevation. A hover image-brightness change acknowledges the playable Crestbound link.

## Shapes

Small control and panel corners, thin rules, clean rectangular images. Round shapes are reserved for data marks and the identity dot. GitHub icons are hard-capped to 21px in both dimensions and must never inherit chart-wide SVG sizing.

## Components

### Buttons and links

Primary buttons use Editorial Pink and white lettering; secondary source controls use Navy Ink on paper. Both keep a minimum 46px control height. Focus is a visible pink outline with separation from the element. Hover changes tone rather than moving the layout. Inline sources underline on hover and retain meaningful names.

### Project navigation

Six short destinations form the desktop collection index. A fine border defines each destination; the current item adds a pale tone and pink underline. On phones, horizontal scrolling preserves labels and adequate targets. The main menu supports Escape and focus return.

### Evidence panels and technical facts

Light panel backgrounds, thin borders and small corners keep the content primary. Technical definition lists align labels with values; tables retain explicit units, provenance and interpretation limits. Semantic Drift's status is pre-data, never a result panel.

### Interactive privacy plot

Exactly three measured observations remain selectable by pointer, touch, Enter, Space and arrow keys. The selected point is yellow and updates the adjacent AUC, interval and reference gap. The full-axis checkbox changes only presentation, not values. The smooth monotone guide connects the measured means; the pink envelope joins their displayed intervals. Explain that it is not uncertainty at unmeasured settings. Preserve the static exact-value fallback and source link.

### Disclosures and motion

Native details/summary keeps the complete case studies available with or without enhancement. Motion draws the guide once and acknowledges a selected result; ordered diagram stages animate once in reading order. Section headings, descriptions and supporting metadata enter once with distinct timing; charts draw their guides and ordered diagrams sequence their stages. No infinite loops, replay on reverse scrolling or hidden-by-default content. Reduced motion and document visibility cancel movement without removing results or state cues.

## Do's and Don'ts

### Do:

- Do preserve the approved navy, pink and paper identity across the homepage and restaurant report.
- Do retain source links, measured intervals and project maturity beside claims.
- Do keep the user-provided Crestbound image and compact GitHub controls.
- Do verify desktop, narrow phones, keyboard interaction and reduced motion.

### Don't:

- Don't fabricate measurements, outcomes, participant data or completed features.
- Don't let global SVG rules enlarge interface icons.
- Don't repeat identical choreography on every element; use the motion hierarchy below.
- Don't put visible illustrative captions on decorative artwork; keep quantitative interpretation limits where they matter.

## Recruitment and motion refinement — 25 October 2026

The opening presents a visible name, role, a concise value statement and direct work/CV/contact actions. A secondary column links analytics, NLP and privacy evidence. The seven decorative bars are a typographic signal motif, not experimental data; they are hidden from assistive technology. On phones the practice column becomes a compact stacked section.

`assets/js/motion.js` owns the optional choreography. Use `play` for a finite effect and `lift` for transform/opacity entrances; keep final states in CSS. Timings: 560ms reveal, 85ms stagger, 700ms chart, 220ms selection feedback. Opening movement is 12–18px; section titles use 20px, diagrams 12px and metadata 10px. Delayed effects use backwards fill only during their finite lifetime, never persistent inline styles.

The observer unobserves each target immediately on entrance. Bookmarks and restored history skip the opening sequence. Chart means, intervals and exact values remain fixed; only their guides and selection emphasis animate. Focus stops ancestor movement. Preference changes, page hiding and page exit cancel effects; pending observers reconnect on a back/forward cache restoration. Without JavaScript, IntersectionObserver or WAAPI, the authored content remains readable.

Project accents use pink for research/NLP, blue for image and restaurant systems, and ink for the RPG. Existing authored stages remain the source for inspectors; audio adds explanatory `data-inspect-note` text without claiming neural or real-corpus results. See [the validation report](docs/MOTION-RECRUITMENT-2026-10-25.md) for screenshots and measured limits.

## Motion layer — 3 November 2026

Motion now runs on vendored GSAP 3.15 (core, ScrollTrigger, SplitText, CustomEase) plus a lazily loaded Three.js hero field. It supersedes the WAAPI choreography described above, but every rule above still applies: final states live in CSS, nothing replays on reverse scroll, there are no perpetual loops, and reduced motion, focus and page hiding settle everything immediately.

- **Curves.** `portfolio-out` (`.23, 1, .32, 1`) for anything arriving. `portfolio-in-out` (`.77, 0, .175, 1`) for anything moving between two on-screen states (chart guides, the selection guide, the field resolving). Never ease-in for UI.
- **Durations.** Press 160ms, feedback 220ms, menu 200ms, reveal 600ms, masked headings 900ms, chart guides 800ms, hero field 2.6s once.
- **Hierarchy by mechanism.** Name: characters behind a mask. Summary and section/project titles: lines behind a mask. Body, panels and metadata: an 8–16px lift with a fade. Diagrams: reading-order stages. Splits are reverted when they finish.
- **Never hide interactive content mid-animation.** Animate `opacity`, not `autoAlpha` or visibility, so links and controls stay focusable throughout.
- **The only CSS-hidden state** is `.motion-intro`. The inline head script adds it, and it is removed by motion.js or a 3s failsafe.
- **Press and hover.** Controls scale to .97 on `:active`. Hover effects are gated by `(hover: hover) and (pointer: fine)`.
- **Signal field.** Decorative and `aria-hidden`, at ≥1024px only. Ink points, a pink ridge and one yellow selected point with an ink ring. It renders on demand only. Pointer input lifts nearby points. Scrolling settles it as the evidence takes over. It never carries labels or values.

The audit, budgets and verification are in [the motion audit](docs/MOTION-AUDIT-2026-11-03.md). Rebuild the field or update GSAP with `tools/motion` (`npm ci && npm run build`).

## Living motion — 5 November 2026

The owner asked for a site that feels clearly alive, so the earlier "no perpetual loops" rule is relaxed in one place.

- **The hero field runs continuously**, but only while it is on screen, the tab is visible and reduced motion is off. Slow travelling waves cross the surface, a pink signal pulse sweeps through it about every nine seconds, and the yellow selected point breathes. A fine pointer lifts nearby points; entering or tapping the field sends a ripple. Scrolling away scatters it back toward noise. It runs on every width where WebGL2 is available and Save-Data is off. Below 1024px it is a full-bleed band between identity and practice, with its space reserved before paint.
- **Scroll-driven, reversible depth:**
  - Evidence panels travel ±56px (±28px on phones) against the story beside them.
  - Project titles drift in from the left and section headings from the right, so the page alternates as it scrolls.
  - The contact headline grows into place.
  - Imagery parallaxes ±7% inside its frame.
  - The practice bars respond to scroll speed, then settle.
  - These are scrubbed, so they follow the scrollbar both ways. None of them changes a value.
- **Data marks arrive.** Measured points pop in after their guide line has passed them, whiskers grow from their means, and headline figures rise into place behind a mask. Figures never count up, so no intermediate number is ever shown.
- **Pointer spotlight.** A soft pink light follows a fine pointer across evidence panels. The 3px hover lift was removed, because panels now move with the scroll.
- Everything above stops for reduced motion. The field then shows one still frame.

### Stronger pass (same day)

The owner reviewed the live site and still found too little movement. Measured on the live site, about 2% of the viewport changed every two seconds, and the scroll effects were 56px spread over a full screen of travel. The pass made five changes:
- **Field:** roughly twice the wave speed and a larger amplitude, a pink pulse every five seconds, darker far rows, and a wider cursor lens. Scrolling fully scatters it.
- **Skills marquee:** two `aria-hidden` rows between the opening and the work. They drift in opposite directions, speed up with scroll velocity and reverse with scroll direction, and pause off screen.
- **Scroll motion:**
  - The opening lifts and dims as you leave it.
  - Evidence panels rise 140px and scale from .94 as they enter.
  - Titles and headings sweep 120px, and the contact headline scales from .75.
  - Figures and tags lift after their title, and imagery parallaxes ±9%.
- **Live meter:** the practice bars run continuously while the opening is visible, faster when you scroll fast.
- **Magnetic actions:** buttons lean toward a fine pointer. Press feedback uses the CSS `scale` property so the two compose.

After the pass, about 7% of the viewport changes every two seconds at rest, and 10–14% per scroll step. Focus never jumps a scrubbed or repeating tween. Reduced motion reverts everything through `gsap.matchMedia`.

## Motion and layout repair — 6 November 2026

The signal field occupies a dedicated desktop column, sits below the intro copy on tablets, and stacks between the intro and practice on phones. The WebGL fallback uses the plain intro layout.

The project index leads directly into the work. GSAP handles brief, one-shot entrances, chart guide drawing, and control feedback. Project panels stay in their grid slots, and the opening copy is visible while scripts load. The Three.js field supplies continuous movement while visible and draws a still frame for reduced motion.


## Interactive Lab — 23 November 2026

The homepage was redesigned around one idea: a sophisticated creative page at first glance, the depth of a research engineer's work on interaction. It supersedes the hero and motion sections above; the evidence rules still apply.

- **Palette.** Ivory surround (`#fdfcfa`), navy interior (`#102449`), fuchsia as the single luminous accent (`#bd005f` on ivory, `#f2569f` on navy for AA contrast), blue for depth (`#435c85`, `#9aadcd` on navy), pale blue rules (`#d8dfe9`). Yellow stays reserved for a selected measured point.
- **Stage.** The hero is a navy, rounded "stage" inset in the ivory page. An oversized serif name sits bottom-left, the bench floats right, and a Three.js sculpture sits between them. It recedes like a card being set down as you scroll.
- **The bench.** Three ARIA tabs, each a real experiment with real numbers:
  - Research: pick ε 0.49 / 2 / 6 and read the measured AUC, interval and gap.
  - Applications: random order versus the model's ranking across the first 20 of 200 comments. The expected counts, 6 and 15, come from prevalence 0.30 × Lift@10% 2.5.
  - Systems: step through the four-stage order lifecycle.
  Without JavaScript all three panels are shown in full.
- **Sculpture.** A noise-displaced, lacquered core inside a ~14k-point shell that morphs per mode:
  - Research: a sphere whose turbulence follows the selected ε.
  - Applications: ten decile rings whose pink share matches the queue.
  - Systems: a loop that crowds toward the active lifecycle step.
  It is labelled as illustration, not data. Rendering stops off screen, in hidden tabs and with reduced motion.
- **Motion.**
  - Lenis smooth scroll runs on GSAP's ticker.
  - Headings reveal word by word behind masks, and the name and contact line letter by letter.
  - Some paragraphs brighten word by word with scroll.
  - Images expand from an inset frame.
  - Evidence panels rise as their sticky story stays put, and navy chambers open out of the page.
  - Bars grow from zero and chart guides draw. Figures never count up.
  - Buttons are magnetic for fine pointers.
  Everything is registered in `gsap.matchMedia` so reduced motion reverts it, and Lenis is not started.
- **Project index.** A sticky numbered index follows the reader through the work, with a pink reading-progress rule under the header.

## Noir Lab — 23 November 2026 (same day, supersedes the Interactive Lab palette and hero)

The owner asked for black and fuchsia, no sphere, and an editorial, technical direction. Focus Industries was the reference for its design language, not its content or brand.

- **Palette.**
  - Ground: black `#0a0a0b`, panels `#131315`, hairlines `#242428` / `#34343a`.
  - Type: warm white `#f2f0ec`, with `#a3a2a8` and `#75747b` for secondary text.
  - Accent: luminous fuchsia `#ff3d9a`. The brand pink `#bd005f` fills the methods band and the research sidebar.
  - Navy and blue are retired from the homepage.
- **Type.** Inter Tight variable, self-hosted (latin, latin italic, greek for ε/δ; OFL in `assets/fonts/OFL-inter-tight.txt`):
  - The name, the "Work" word and "Let's talk." are set at extreme scale, tight (-0.07em).
  - Labels are 11px uppercase with 0.16em tracking.
- **Technical grammar.**
  - Spec lines: `LABEL ——— LABEL`, where the rule draws in on scroll.
  - Bold-italic verb rows: the first verb is fuchsia.
  - Project codes in a sticky left rail (DP—05, KH—01…), and "+" links.
  - The verbs describe each project's method; they are not results.
- **Slat field (replaces the sphere).** A single Three.js shader draws a grid of capsules inside the hero "instrument":
  - Research: flicker follows ε.
  - Applications: the columns sort into the ranked queue, with fuchsia shares of 30% overall, 75% in the top decile and 25% elsewhere.
  - Systems: four bands light up to the active lifecycle step, and the webhook step turns fuchsia.
  - The pointer lifts slats and a click sends a ripple.
  - The figure is labelled as illustration, not data.
- **Motion.** As before, plus:
  - The name's two lines drift apart on scroll, and the giant "Work" slides across.
  - The methods band opens from a slit.

### Smoothness pass — 24 November 2026

- **Lenis** glides longer and softer (`lerp` 0.075). Touch keeps native momentum.
- **Paragraphs** fade in line by line, each line lifting 22px out of an 8px blur. Splits revert when the animation ends.
- **Headings.** Project titles rise word by word behind a mask. Other headings come into focus word by word out of a 12px blur.
- **Leaving the opening.** The brief drifts up and dims, and the meta row fades out.
- **Lean.** Big type (the name, "Work", "Let's talk.", section headings, project numbers) leans up to 3.5° with scroll speed, then springs upright.
- **Verified in Chromium.** One wheel flick eases over ~700ms. After a full scroll, no heading or paragraph is left faded or blurred, and only the three scroll-linked paragraphs keep their word wrappers.

### Kinetic layer — 24 November 2026

These are the three pieces the owner's research recommended next. GSAP owns all choreography.

- **Kinetic marquee.** Two rows run in opposite directions below the opening, one filled and one outlined italic:
  - One row lists the methods used in the projects; the other lists verbs.
  - Speed scales with scroll speed, and direction flips with scroll direction.
  - It is `aria-hidden` and stays still under reduced motion.
- **Featured index.** Six large project rows sit beside a live preview of each project's real figures:
  - Figures: ε 0.49 / .933 with the three measured intervals; 2.5× lift with PR-AUC 0.65 vs prevalence 0.30 and the 15/20 queue; 53 orders, 15 SQL analyses and 4 report pages with the lifecycle; 4.58× input with 8.68 s → 8.54 s epochs; Crestbound with 6 classes and 100k simulations; the MIDI pipeline.
  - Hover or keyboard focus previews a project. On touch, the first tap previews and the second opens it. On phones the preview pins above the titles.
  - Panels wipe in, then draw their bars and lines. Figures never count up.
- **Labels decode once.** Uppercase technical labels decode with ScrambleText (vendored from GSAP 3.15). Only letters are used as scramble characters, and the text always ends on the real label.
- **Fine pointers only:**
  - Nav and "+" links roll their letters on hover. The copy is `content: attr(data-text) / ""`, so assistive technology hears the name once.
  - A fuchsia cursor companion becomes a labelled ring ("View", "Play", "Pulse"). The system cursor stays visible.
  - The preview tilts up to 7° toward the pointer, and its glow follows.
- **Hero layers.** The name's lines rise faster than the brief as you scroll (parallax at different rates).

## React port — 25 November 2026

The homepage moved to React so the owner can build with Motion, React Bits and React Three Fiber. The design, content and evidence rules are unchanged.

- **Prerendered, then hydrated.** `web/scripts/prerender.mjs` renders `<App />` into `dist/index.html`. Interactive-only UI switches on after hydration (`useHydrated`): the tabs, a single visible bench panel and the cursor. The server HTML and the first client render always match, and visitors without JavaScript get every panel, project and case study.
- **Who owns what.**
  - GSAP owns anything tied to scroll position (`web/src/components/Choreography.tsx`).
  - Motion owns component state: tabs, panels, previews, cursor and tilt.
  - React Bits supplies the marquee, the decoding labels and the magnetic actions.
  - The slat field is an R3F `<Canvas>`. Its `frameloop` is `never` off screen and `demand` under reduced motion, and its uniforms ease with `MathUtils.damp`.
- **React Bits caveat.** `DecryptedText` and `BlurText` start hidden or scrambled until JavaScript runs, so they are used only on decorative labels. `BlurText` is not used; the GSAP blur reveal hides text only on the client.
- **ScrollTrigger re-measures** whenever the body height changes. Hydration collapses the bench from three panels to one, which otherwise left stale trigger positions and invisible project rows on phones.

### Kinetic text, pinned statement and image distortion — 25 November 2026

- **Rotating thesis** (React Bits `RotatingText`):
  - The thesis plays "models you can audit", "evidence you can inspect" and "products people use" once, then stops on the canonical "systems you can interrogate."
  - The prerendered page and reduced motion show only the canonical line. It never loops, so no motion runs past about 8 seconds.
- **Variable-weight type** (React Bits `VariableProximity`):
  - On "Work" and "Let's talk.", letters follow the cursor along Inter Tight's weight axis: "Work" thins and turns fuchsia, "talk." thickens.
  - A slow idle wave runs when the pointer is away.
  - The component's remote Google Fonts import was removed.
- **Pinned statement** (GSAP ScrollTrigger `pin`, scrubbed):
  - The About section's own description pins for 150% of the viewport. Its words come into focus out of a blur, then *collected*, *legitimately* and *use* light up as a fuchsia rule fills.
  - It is plain text without motion.
- **Image distortion** (React Three Fiber):
  - The project images (Crestbound, the text study) gain a pointer ripple, lens and fuchsia-tinted RGB split, with grayscale lifting to colour under the cursor.
  - It mounts lazily on first hover, renders on demand only while active, and the `<img>` stays as content and fallback.
  - Touch, reduced motion and no-WebGL keep the plain image.

### Interactive charts, smoother scroll, readable case studies — 25 November 2026

- **Charts you can interrogate.**
  - Privacy and partition SVGs: hover or tap shows a dashed fuchsia crosshair that snaps to the nearest *measured* point (never an interpolated position), with a tooltip of that point's exact values (`web/src/lib/chartHover.ts`).
    - Privacy: AUC, 95% t interval and gap to non-private HGB.
    - Partitions: Spark vs local and their ratio.
  - Throughput and epoch bars are a React component (`BarCompare`). Hovering, tapping or tabbing to a bar dims the other and states the exact comparison. The ratios are computed from the plotted values and reproduce the headline 2.28× and 4.58× and the 1.6% epoch difference.
  - Keyboard users keep the charts' own selectable points and live status text.
- **Smoother.**
  - Lenis glides a little tighter (lerp 0.09).
  - Blur reveals are lighter (4–7px) and off on phones, where blur is costly to paint.
  - Canvases are capped at 1.5× pixel ratio.
  - ScrollTrigger never re-measures mid-scroll; it waits until Lenis is at rest, so pinned sections don't jump.
  - Case studies open over 480ms and fade their blocks in, in reading order.
- **Readable extended explanations.**
  - Case-study sections are a numbered single column: the label sits left and the text is held to 66ch.
  - Text is 18px at a 1.72 line height in near-white instead of small muted grey.
  - Scope notes are larger with a fuchsia rule; tables are larger, zebra-striped and right-aligned for figures.
  - Each summary states its length ("6 sections · ≈1 min read"), and a "Close case study" button at the end glides back to the summary.
  - Long-form project copy is brighter and slightly larger.

### Trend-line probe, subpages in Noir Lab, page transitions — 25 November 2026

- **Trend-line probe (privacy chart).**
  - Pointing anywhere along the chart moves a marker along the drawn guide. The readout gives the guide's AUC at that ε and the band around it.
  - Those values are labelled *interpolated*, not measured, alongside the nearest real measurement. The same monotone cubic as the drawn curve is evaluated in (ln ε, AUC) space; it was verified to sit within ~1px of the rendered path, on both axis scales.
  - Within 14px of a measured point the readout snaps to its exact values. Outside ε 0.49–6 it says nothing is extrapolated.
  - Touch can drag along the chart (`touch-action: pan-y`).
- **Subpages share the homepage design.**
  - `assets/css/noir.css` and `assets/js/subpage.js` style the restaurant case study, the local-AI case study, the operations dashboard and its methodology note, with the same header, black ground, Inter Tight type and long-form reading rules.
  - Motion: a fuchsia reading-progress rule, and blocks that fade up out of a soft blur as they enter (none under reduced motion; full content without JavaScript).
  - Dashboard bars are focusable, with a live value readout, and grow in on each page switch.
- **Cross-page transitions.** `@view-transition { navigation: auto }` fades and lifts between the homepage and the subpages where supported.
- **Readability.** Secondary copy (Audio Lab, Semantic Drift, method cards, captions, bench notes) is brighter and larger and held to 56–62ch.
