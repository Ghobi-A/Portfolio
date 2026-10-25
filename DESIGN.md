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
