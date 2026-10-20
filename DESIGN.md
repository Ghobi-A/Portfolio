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

Flat by default. Fine borders and restrained tonal backgrounds define evidence panels; there is no card-lift or ambient shadow system. The pink chart envelope encodes displayed interval boundaries, not elevation. A hover image-brightness change acknowledges the playable Crestbound link.

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

Native details/summary keeps the complete case studies available with or without enhancement. Motion draws the guide once and acknowledges a selected result; ordered diagram stages animate once in reading order. No infinite loops, repeated section fade-ups or hidden-by-default content. Reduced motion and document visibility cancel movement without removing results or state cues.

## Do's and Don'ts

### Do:

- Do preserve the approved navy, pink and paper identity across the homepage and restaurant report.
- Do retain source links, measured intervals and project maturity beside claims.
- Do keep the user-provided Crestbound image and compact GitHub controls.
- Do verify desktop, narrow phones, keyboard interaction and reduced motion.

### Don't:

- Don't fabricate measurements, outcomes, participant data or completed features.
- Don't let global SVG rules enlarge interface icons.
- Don't add generic reveal choreography to every section.
- Don't put visible illustrative captions on decorative artwork; keep quantitative interpretation limits where they matter.
