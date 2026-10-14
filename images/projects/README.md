# Project thumbnails (projects page)

- `grey/` the non-coloured thumbnails (4:3, for example 1200 x 900). These show by default.
- `colour/` the coloured versions. They fade in on hover.

Give the colour file the same name, size and crop as its grey file (for example `grey/amg.png` and `colour/amg.png`).
Until a colour file is added, that thumbnail stays grey on hover.
A new project also needs its paths in `js/content.js` (`src`, `srcColor`), or upload both in the dashboard instead.
