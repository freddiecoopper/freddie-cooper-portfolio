# Freddie Cooper portfolio (VS Code handoff)

Static site, no build step, no dependencies.

## Run it
- Open the folder in VS Code and use the **Live Server** extension on `index.html`
  (or run `npx serve .` / `python3 -m http.server`).
- Files: `index.html` (markup), `styles.css` (all styling), `script.js` (behaviour), `images/`, `case-study.html`.

## What is in it
- **Hero:** Offgrid (product visualization, left) and the A.R.C.S clay model (industrial design, right) meet at a center divider.
  They ease out from behind the divider on load (CSS animations `revL` / `revR`; the clip is on the fixed `.lw` wrapper, the image moves inside it).
- **Slider** (`#slider`): moves the divider. Fully right = product visualization only; fully left = industrial design only.
  In a single mode the center line, the other half of the hero, the other side's work panels and skills list are hidden (`setPos()` in `script.js`).
- **Selected work:** five hairline panels, grayscale renders with a bottom fade. Hover: ~7% enlarge, orange hairline and label.
- **Ripple grid:** a canvas behind all page content (`z-index:-1` inside `.p{isolation:isolate}`).
  A faint grid appears around the cursor and ripples like a boat wake. It fades near text blocks. Toggle bottom-left.
  Every property is in the `CONFIG` object at the top of `script.js` (cell size, effect area, strength, wave height/speed/width/length, fade time, fluidity, line width, colors, text fade).
- **Theme:** `--o` (orange accent), `--t` (text) and the page background are set at the bottom of `styles.css` (`.p{...}`).
  Secondary text colors are derived from `--t` with `color-mix`.
- Respects `prefers-reduced-motion` (intro animations and ripple grid off).

## Design rules
Flat page color, one orange accent, one sans family (Manrope) with light-weight display type and small uppercase labels, hairline dividers,
no shadows, no rounded cards. Selected-work renders are grayscale; the hero keeps color.

## To fill in
The case-study copy and work-panel links (`href="#"`).
