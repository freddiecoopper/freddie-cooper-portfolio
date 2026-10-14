# Freddie Cooper portfolio (VS Code handoff)

A static site with Vercel serverless functions in `api/`. No build step; the only package is `@vercel/blob` for dashboard uploads. Five public pages share one theme and one fallback content file, plus a private `dashboard.html`.

## Run it
Open the folder in VS Code and start **Live Server** on `index.html` (or run `python3 -m http.server`).

## Files
- `index.html` home: split hero, divider slider, Featured work, skills, process, About, contact
- `projects.html` all projects, filterable by product visualization and industrial design
- `start-a-project.html` the six step request form
- `wallpapers.html` the wallpaper store: packs of wallpapers, free or premium, filter by price and device
- `case-study.html` the case study page, with a Story view and a Presentation view (a tall column of images and video). It shows the project named in the address, for example `case-study.html?p=arcs`
- `css/theme.css` the colors: orange accent, text, page background, light and dark. Change them there.
- `js/content.js` **the built in content**: projects and their case studies, hero images, About paragraph. Once projects are saved in the dashboard, the site uses those instead
- `js/home.js` the grid, hero, slider and mode logic (the ripple grid settings are the `CONFIG` object at the top)
- `js/case.js` builds the case study page from the project data; the image size settings are `CASE` at the top
- `images/` all renders. `images/hero/product-visualization` and `images/hero/industrial-design` are the two hero folders.

## Adding to the site
- **Projects and case studies:** use the **Projects** tab in `dashboard.html`. The first time, press **Copy the current projects here** to bring in the built in list. After that you can add, edit, hide, reorder and delete projects, upload thumbnails, choose which ones appear in Featured work on the home page (the first five featured, in list order, each with a tall image), and give any project a case study: intro, role, tools, year, cover image, story sections with optional images, and the Presentation images and videos.
- Uploads need Vercel Blob (see below). Large images are resized in the browser before upload. Videos must be under 4.4 MB, or paste an https address instead.
- Without the dashboard, edit `projects` in `js/content.js` (the comment at the top explains each field).
- **A hero image:** put the file in the matching hero folder and add an entry to `hero.viz` or `hero.id`. `x`, `y`, `w` place it in the stage as a percent (0, 0, 100 fills it).
- Case study spacing: in `js/case.js`, `CASE.presGap` and `CASE.presPad` are 0 so images sit flush, and `presCaptions` is false so no text appears between them.

## Behaviour
- Featured work and project thumbnails show a grey image and fade to colour on hover. Put the files in `images/work/grey` and `images/work/colour` (Featured work), and `images/projects/grey` and `images/projects/colour` (projects page), with matching names. In the dashboard, each project has a colour version field next to each image.
- Slide the hero divider fully right for a product visualization only site, fully left for industrial design only. The slider position is remembered for the form and projects pages.
- Light and dark mode, the ripple switch and Back to top share one bar at the bottom right. The theme choice is saved.
- The home page no longer has a Wallpapers section; every page links to `wallpapers.html` from the footer.
- Share previews: each public page has a description and a preview image (`images/og.jpg`). They point at `https://freddie-cooper-portfolio.vercel.app`; change the page heads if the site moves to its own domain.
- The ripple grid follows the cursor and fades near text. Toggle it in the control bar at the bottom right.
- Respects `prefers-reduced-motion`.

## To connect
- **Form:** `js/start.js` posts to `/api/start-project`, which emails the request through Resend and saves it for the dashboard (see below). If that fails, the form falls back to a mailto link.
- **Calendly:** the Book a call button uses `contact.calendly` in `js/content.js` (currently https://calendly.com/freddiecooper/discovery-call).
- The A.R.C.S case study text (role, year, sections) is still placeholder text. Fill it in from the dashboard.

## Contact and the Start a project backend
- **Send an email** opens a small composer (subject and message). Send opens the visitor's email app with the message addressed to `contact.to` in `js/content.js`. The address is not shown on the page except in the footer.
- **Start a project** posts to `api/start-project.js`, a Vercel serverless function. It emails the answers to favour02fred@gmail.com through Resend and saves them to a key value store so `dashboard.html` can list them. If it fails, the form falls back to a mailto link.
- Setup, once: (1) create a Resend account and an API key; (2) add the Upstash Redis integration (or Vercel KV) to the Vercel project; (3) set the variables in `.env.example` in Vercel project settings; (4) redeploy. `DASHBOARD_TOKEN` is any long secret you choose, and you type it on `dashboard.html` to read requests.
- Without a verified sending domain, Resend only delivers to your own Resend account email. Verify a domain in Resend, then set `FROM_EMAIL`.
- `dashboard.html` manages requests, traffic, sales, projects, the home page, updates and wallpapers. See `Claude.md` for which tab and API owns each piece of content.

## Uploads (Projects tab)
- In the Vercel project, open Storage and connect a **Blob** store. Vercel adds `BLOB_READ_WRITE_TOKEN` for you. Redeploy.
- `api/upload.js` stores the file and returns its address. It uses the `@vercel/blob` package listed in `package.json`, which Vercel installs on deploy.
- `api/projects.js` keeps projects in the same key value store as the requests (keys `proj:<id>` and the sorted list `projects`).

## Home page tab (dashboard)
- Edits the hero images on both sides (upload, description, caption, position and size), the About text and portrait, Skills and tools, the How I work steps and the Book a call link.
- Until the first save it shows the built in content from `js/content.js`. Saving stores one copy under the key `site:home` (`api/site.js`) and the home page reads it from then on.

## Requests pipeline (dashboard)
- Each request has a stage: New, In talks, Quoted, Won or Lost. Changing the stage saves straight away.
- Add the value you quoted (with its currency) and private notes, then press Save value and notes. Clients never see these.
- The totals at the top show open requests, quoted value still waiting, won value and the win rate (won out of won plus lost).
- Requests saved before this change as read count as In talks, and done counts as Won.

## Now working on snippets
- Each update can have one optional work in progress image or short silent MP4 (Updates tab, Snippet). It shows as a small thumbnail beside the update on the home and projects pages; clicking opens it large. Clips loop silently, and stay still for visitors who turn off motion.
- Only post work you are allowed to show.
