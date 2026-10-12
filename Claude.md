# Freddie Cooper portfolio (VS Code handoff)

Static pages plus Vercel serverless endpoints for project requests and dashboard traffic. No client build step.

## Run it
- Open the folder in VS Code and use **Live Server** on `index.html` for static page work.
  Use `vercel dev` or a Vercel deployment to exercise the `/api` endpoints.
- Files: `index.html`, `projects.html`, `start-a-project.html`, `case-study.html`, `dashboard.html`, `css/`, `js/`, `api/`, and `images/`.

## What is in it
- **Hero:** Offgrid (product visualization, left) and the A.R.C.S clay model (industrial design, right) meet at a center divider.
  They ease out from behind the divider on load (CSS animations `revL` / `revR`; the clip is on the fixed `.lw` wrapper, the image moves inside it).
- **Slider** (`#slider`): moves the divider. Fully right = product visualization only; fully left = industrial design only.
  In a single mode the center line, the other half of the hero, the other side's work panels and skills list are hidden (`setPos()` in `js/home.js`).
- **Selected work:** five hairline panels, grayscale renders with a bottom fade. Hover: ~7% enlarge, orange hairline and label.
- **Ripple grid:** a canvas behind all page content (`z-index:-1` inside `.p{isolation:isolate}`).
  A faint grid appears around the cursor and ripples like a boat wake. It fades near text blocks. Toggle bottom-left.
  Every property is in the `CONFIG` object at the top of `js/home.js` (cell size, effect area, strength, wave height/speed/width/length, fade time, fluidity, line width, colors, text fade).
- **Theme:** shared tokens live in `css/theme.css`; homepage layout is in `css/home.css`, with behavior in `js/home.js`.
  Secondary text colors derive from `--t` with `color-mix`.
- Respects `prefers-reduced-motion` (intro animations and ripple grid off).

## Design rules
Flat page color, one orange accent, one sans family (Manrope) with light-weight display type and small uppercase labels, hairline dividers,
no shadows, no rounded cards. Selected-work renders are grayscale; the hero keeps color.

## To fill in
The case-study copy and work-panel links (`href="#"`).

## Dashboard
`dashboard.html` contains the token-protected project request inbox and traffic view. Set the variables in `.env.example` in Vercel, including Resend and KV/Upstash credentials, `DASHBOARD_TOKEN`, and `TRACK_SALT`. The dashboard reports requests and traffic; edit site content in `js/content.js`.
