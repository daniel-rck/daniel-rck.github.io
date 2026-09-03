# daniel-rck.github.io

Project landing page, live at **<https://daniel-rck.github.io>**.

An orbital star map: every project is a node on one of three orbits, and
selecting one shows its details next to the map. No build step, no
dependencies — plain HTML, CSS and JavaScript.

```
index.html            markup and metadata
assets/style.css      the whole design
assets/app.js         orbits, detail panel, language switch
data/projects.js      the project list — this is the file you edit
data/live.js          generated, do not edit by hand
scripts/              the live-URL sync
```

## Adding a project

Edit `data/projects.js`. Nothing else needs touching — the map, the list, the
counter and both languages all render from it.

In a Claude Code session in this repo, `/projekt` does it for you, including
the checks.

## Live URLs

Live URLs are **not** stored in this repository. Each one comes from its own
repository's **About → Website** field on GitHub. The *Sync live URLs* workflow
reads those once a day (and on demand) and writes `data/live.js`.

So: to give a project a live link, set the website on that project's repo. A
homepage pointing back at github.com (a wiki, a releases page) is treated as
documentation and skipped — the page already links the repository.

Projects without a live URL simply show "No live app" instead of the button.

## Deployment

GitHub Pages, *Deploy from a branch* → `main` / `/ (root)`. `.nojekyll` keeps
Jekyll out of the way. A push is a deploy.

## Local preview

```sh
python3 -m http.server 8899
```

Then open <http://127.0.0.1:8899>. Opening `index.html` directly from the
filesystem works too — the data files are plain scripts, not `fetch` calls.
