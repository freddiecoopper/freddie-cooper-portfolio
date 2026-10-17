# Freddie Cooper portfolio

Portfolio for Freddie Cooper, a 3D product designer in Abuja, Nigeria (product visualization and industrial design).
Static HTML, CSS and plain JavaScript, plus Vercel serverless functions in `api/`. No build step and no framework.
Deployed on Vercel from `main` (`vercel.json` turns on clean URLs, so `/work` serves `work.html`; it also redirects `/projects` to `/work`).

## Run it
- Page and style work: VS Code **Live Server** on `index.html`, or `python -m http.server`.
  The `/api` calls fail locally, and every page falls back to the built-in content in `js/content.js`.
- To exercise the API and dashboard: `vercel dev`, with the variables from `.env.example` in `.env.local`.

## Pages
- `index.html` home: split hero with a divider slider, Now working on, Featured work, Skills and tools, How I work, About, contact.
- `work.html` (`/work`) all projects, filterable by product visualization and industrial design, plus Now working on.
- `work/<slug>.html` (`/work/<slug>`) one static page per project, for search engines. Written by hand from the project data.
- `product-visualization.html`, `industrial-design.html` service pages linking to their projects. `about.html` the full About.
- `case-study.html?p=<project id>` the interactive case study (Story and Presentation views), `noindex`; the A.R.C.S project page links to it.
- `start-a-project.html` six-step request form.
- `wallpapers.html` wallpaper packs, free and premium (Paystack).
- `dashboard.html` private, token protected, `noindex`. Not linked from the site.

## Where content comes from (important)
Most content is edited in the dashboard and stored in Upstash Redis (Vercel KV). `js/content.js` is only the fallback,
used when nothing has been saved yet or the API is unreachable. Before changing content in code, check whether it lives in the dashboard.

| Content | Dashboard tab | API | Fallback in content.js |
|---|---|---|---|
| Hero images, About, portrait, skills, How I work, Book a call link, page background colours (light and dark) | Home page | `api/site.js` (key `site:home`) | `hero`, `about`, `portrait`, `skills`, `process`, `contact.calendly`, `colors` |
| Projects (including `slug`, the /work page address), Featured work, case studies | Projects | `api/projects.js` (`proj:<id>`, sorted set `projects`) | `projects` |
| Now working on (with optional image or video snippet) | Updates | `api/updates.js` | `updates` |
| Wallpaper packs | Wallpapers | `api/wallpapers.js` | `wallpapers` |
| Project requests (pipeline: new, talking, quoted, won, lost; value; private notes) | Requests | `api/requests.js` | none |
| Traffic | Traffic | `api/stats.js`, `api/track.js` | none |
| Sales | Sales | `api/stats.js?view=sales`, `api/checkout.js`, `api/paystack-webhook.js`, `api/download.js` | none |

- Page background colours are applied on every page by `js/theme.js` (CSS vars `--bg-l` / `--bg-d` on `.p`, cached in localStorage `fc-colors`). It fetches `/api/site` once as `window.fcSite`, which `loadHome()` reuses.
- `js/live.js` loads the API data for the public pages (`loadProjects`, `loadHome`, `loadUpdates`, `loadWallpapers`) and falls back to `SITE`.
- `api/upload.js` stores dashboard uploads in Vercel Blob (`@vercel/blob`, the only package, in `package.json`).
  Vercel caps a request at 4.5 MB, so the dashboard resizes large images in the browser and rejects videos over 4.4 MB.
- `api/_lib.js` has the shared helpers: `kv`/`pipeline` (Redis REST), `authed` (Bearer `DASHBOARD_TOKEN`), `body`, `cut`, `slug`, `mail` (Resend).
- If you add a field, update the API validator (`clean()` in the API file), the dashboard form, the public renderer, and the fallback in `content.js`.

## Files
- `css/theme.css` shared tokens and the page controls (`.ctrls`: Ripples, Dark mode, Back to top in one bottom-right bar) and the update snippet viewer.
  Per-page layout is in `css/home.css`, `projects.css`, `case.css`, `start.css`, `wallpapers.css`, `dashboard.css`.
- `js/home.js` hero, divider slider and modes (`setPos()`), Featured work, home content, ripple grid (`CONFIG` at the top).
- `js/case.js` builds the case study page; image sizing is the `CASE` object at the top.
- `js/dashboard.js` the whole dashboard. Reusable pieces: `mediaField` (upload or paste an address), `textField`, `checkField`, `group`, `repeater`.
- `images/hero/product-visualization` and `images/hero/industrial-design` are the built-in hero images; `images/og.jpg` is the share preview.
- Thumbnails come in pairs: `images/projects/grey|colour` (projects page, fields `src`/`srcColor`) and `images/work/grey|colour`
  (Featured work, `feature`/`featureColor`). The grey one shows; the colour one fades in on hover (`colourLayer()` in `js/live.js`).
  A colour file that fails to load is removed, so the image just stays grey.

## Design rules
- Flat page grey (`#d6d6d6`, dark `#1c1c1c`), one orange accent (`--o: #df4d1c`), one sans family (Manrope) with light display weights and small uppercase letter-spaced labels.
- Hairline dividers, no shadows, no rounded cards. Featured work and project thumbnails are grey and switch to colour on hover; the hero keeps colour.
- Colours come from the tokens (`--t`, `--o`, `--line`, `--bg`); secondary text colours derive from `--t` with `color-mix`. Check light and dark mode.
- Respect `prefers-reduced-motion` (intro animations, ripple grid and looping snippets stay still).
- Keep pages working at phone width with no sideways scroll.

## SEO (static pages, kept in step by hand)
- Every indexable page has one `<title>`, meta description, canonical (full `https://frddycppr.com/...` address) and JSON-LD. Use clean internal links (`/`, `/work`, `/about`), never `.html`.
- Project pages are static copies of dashboard data. When you add, rename or remove a project: add or edit `work/<slug>.html`
  (copy an existing one), set the same Page address (slug) in the dashboard, and update `sitemap.xml`, the ItemList in `work.html`,
  the static links in `index.html` (`#g5`) and `work.html` (`#grid`), the service page grid, and the More work links on related project pages.
- A project with a slug links to `/work/<slug>` (`projectHref()` in `js/live.js`); without one it falls back to its case study or link.
- `index.html` preloads the first hero image of each side; update those two `<link rel="preload">` tags when you change them in the dashboard.
- `robots.txt` blocks `/api/`. Images in `/images` are cached for 7 days, not a year, because files there get replaced under the same name.
- TODO comments in the new pages mark copy, share images and details still to add. Do not fill them with invented facts.

## Gotchas
- `js/content.js` is a plain object literal: a missing comma breaks every page. Syntax-check it after editing (`node -e "new Function(require('fs').readFileSync('js/content.js','utf8'))"`).
- Share previews and canonicals in each page head use the live address, `https://frddycppr.com`. Update them (and `SITE_URL`) if the site moves to its own domain.
- Vercel's Hobby plan allows at most 12 functions (files in `api/` not starting with `_`); a 13th makes every deploy fail. Add new endpoints to an existing file (as `?view=sales` in `stats.js`) rather than a new file.
- Never commit `.env` files. `.env.example` lists every variable: Resend, KV, `DASHBOARD_TOKEN`, `TRACK_SALT`, Paystack, `SITE_URL`, `DOWNLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN`.
- `dashboard-files/` and `freddie-cooper-site-update1/` are old copies kept for reference and are git-ignored. Do not edit them.
- `script.js`, `styles.css` and the loose images directly in `images/` (such as `hero-amg.png`, `work-1-keyboard.png`) are unused leftovers.

## Still to do
- Real case studies for more projects (A.R.C.S was a test of the case study page).
- Connect Vercel Blob, KV, Resend and Paystack, then test uploads, saving and the request form on the live site.
