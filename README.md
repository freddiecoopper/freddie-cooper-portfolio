# Freddie Cooper portfolio (VS Code handoff)

Static portfolio pages plus Vercel serverless endpoints for project requests and dashboard traffic. No client build step; all four public pages share one theme and one content file.

## Run it
Open the folder in VS Code and start **Live Server** on `index.html` (or run `python3 -m http.server`).

## Files
- `index.html` home: split hero, divider slider, Featured work, skills, process, About, contact
- `projects.html` all projects, filterable by product visualization and industrial design
- `start-a-project.html` the six step request form
- `case-study.html` the A.R.C.S case study, with a Story view and a Presentation view (a tall column of images and video)
- `dashboard.html` private requests inbox and traffic overview; requires `DASHBOARD_TOKEN`
- `css/theme.css` the colors: orange accent, text, page background, light and dark. Change them there.
- `js/content.js` **the content**: projects, hero images, About paragraph and presentation slides
- `js/home.js` the grid, hero, slider and mode logic (the ripple grid settings are the `CONFIG` object at the top)
- `js/case.js` the case study view switch and the image size settings (`CASE` at the top)
- `js/track.js` privacy-conscious page-view tracker for the public pages
- `api/` Vercel serverless endpoints for project requests, dashboard data and traffic collection
- `.env.example` required Vercel environment variable names
- `images/` all renders. `images/hero/product-visualization` and `images/hero/industrial-design` are the two hero folders.

## Adding to the site
- **A project:** add an entry to `projects` in `js/content.js` and drop its thumbnail in `images/projects`.
- **A hero image:** put the file in the matching hero folder and add an entry to `hero.viz` or `hero.id`. `x`, `y`, `w` place it in the stage as a percent (0, 0, 100 fills it).
- **A presentation image or video:** add an entry to `slides`.
- Case study spacing: in `js/case.js`, `CASE.presGap` and `CASE.presPad` are 0 so images sit flush, and `presCaptions` is false so no text appears between them.

## Behaviour
- Slide the hero divider fully right for a product visualization only site, fully left for industrial design only. The slider position is remembered for the form and projects pages.
- Light and dark mode is the button at the bottom right. The choice is saved.
- The ripple grid follows the cursor and fades near text. Toggle bottom left.
- Respects `prefers-reduced-motion`.

## Dashboard setup
The dashboard manages project requests and traffic; site copy and project data remain in `js/content.js`.

To activate the form inbox and traffic charts on Vercel:
1. Add an Upstash Redis (or compatible Vercel KV) integration to the project.
2. Add the variables listed in `.env.example` to Vercel: `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `DASHBOARD_TOKEN`, `TRACK_SALT`, `RESEND_API_KEY`, `TO_EMAIL`, and `FROM_EMAIL`.
3. Use a long random value for `DASHBOARD_TOKEN` and `TRACK_SALT`. Never commit real values.
4. Verify a sending domain in Resend before using a custom `FROM_EMAIL`. Resend's onboarding sender can only deliver to the email associated with the Resend account.
5. Deploy, then open `/dashboard.html` and sign in with `DASHBOARD_TOKEN`.

The dashboard API rejects requests without the token. Tracking skips localhost, Do Not Track, and the browser after dashboard sign-in; it stores daily salted visitor hashes, not raw IP addresses. `python -m http.server` serves the static pages only; use Vercel deployment (or `vercel dev`) to exercise the `/api` endpoints.

The project request form sends to `/api/start-project`. It succeeds if either email or storage works; if both fail, the form falls back to a prefilled email draft.
