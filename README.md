# Freddie Cooper portfolio (VS Code handoff)

A static site. No build step, no dependencies. Four pages share one theme and one content file.

## Run it
Open the folder in VS Code and start **Live Server** on `index.html` (or run `python3 -m http.server`).

## Files
- `index.html` home: split hero, divider slider, Featured work, skills, process, About, contact
- `projects.html` all projects, filterable by product visualization and industrial design
- `start-a-project.html` the six step request form
- `case-study.html` the A.R.C.S case study, with a Story view and a Presentation view (a tall column of images and video)
- `css/theme.css` the colors: orange accent, text, page background, light and dark. Change them there.
- `js/content.js` **the content**: projects, hero images, About paragraph and presentation slides
- `js/home.js` the grid, hero, slider and mode logic (the ripple grid settings are the `CONFIG` object at the top)
- `js/case.js` the case study view switch and the image size settings (`CASE` at the top)
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

## To connect
- **Form:** `js/start.js` posts to `/api/start-project` (a placeholder, marked at the top of the file). Connect a real handler that emails favour02fred@gmail.com. Until then the form falls back to a mailto link.
- The project request form posts to a placeholder endpoint and falls back to a prefilled email draft. The case study copy is concise and based on the project description; add further verified project details as needed.
- The dashboard is a separate Claude page and is not part of this export. Edit `js/content.js` here instead.
