# Freddie Cooper portfolio: design handoff

Single-page static site (index.html, no build step). Images are in /images.

## Design system (apply everywhere)
- Flat light gray page (#D9D9D9), near-black text (#141414), mid-grays (#4a4a4a, #6b6b6b), white hairline dividers.
- One accent orange (#E8590C, var --o): primary buttons, hover states, small markers, the key word/number in a section. Nothing else is colored.
- One sans family (Manrope): large light-weight (200) display sizes, regular body, small uppercase labels with wide letter spacing (.22em). Hierarchy through size and spacing, not bold.
- No gradients (except the image bottom-fade masks), drop shadows, rounded cards or filled icons. Sections are separated by thin white hairlines, never by background color changes.
- Generous margins and vertical spacing.

## Sections
- Hero: label row (name, role, location), large faint "Freddie Cooper" text behind, orange ring, full-color render crossfading every 15s (3 renders, CSS-only), orange primary button, descriptor card bottom-left, "Featured" card bottom-right whose text changes in sync with the render.
- Selected work: five vertical hairline panels, grayscale renders with bottom fade. Hover: render scales ~7% inside its panel, hairline and label turn orange.
- Skills and tools: plain grid of uppercase text labels separated by hairlines.
- How I work: four numbered columns, oversized gray numerals, orange only on the hovered step.
- About: two columns, short text left, image right (placeholder).
- Contact: large email type (placeholder), one orange button, hairline footer.

## Motion
Slow fade/slide reveals, hairlines drawing in, orange hover states. Respects prefers-reduced-motion (hero shows only the first render).

## Notes for the implementer
- Hero crossfade is pure CSS: each .hs image shares a 45s keyframe and a staggered animation-delay (15s apart). Adding a render means changing the 45s duration, keyframe percentages and delays.
- Contact email, about image and case-study copy are placeholders to fill in.
