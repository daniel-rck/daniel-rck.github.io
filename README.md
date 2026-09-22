# daniel-rck.github.io

Project landing page, live at **<https://daniel-rck.github.io>**.

Every public repository of `daniel-rck`, `amigo-labs` and `nuget-workbench`
lands on a shelf for its category — games, creative tools, dev tools,
everyday apps — as a card in a bento grid. No build step, no dependencies —
plain HTML, CSS and JavaScript.

```
index.html               markup and metadata
assets/style.css         the whole design (light and dark)
assets/app.js            shelves, filter bar, language switch
data/categories.json     profiles to read, categories and how to detect them
data/overrides.json      optional per-repo polish (emoji, DE/EN text, …)
data/projects.js         generated, do not edit by hand
scripts/sync-projects.py the sync
```

## How a project gets onto the page

Nothing to do: the *Sync projects* workflow reads all public repositories
once a day (and on demand, and on every change to the data files) and writes
`data/projects.js`. Forks, archived repos, this site and the profile README
repo are skipped.

- **Live link** — the repository's *About → Website* field. A homepage that
  points back at github.com counts as documentation and is ignored.
- **Category** — first match wins:
  1. `category` in `data/overrides.json`
  2. a GitHub topic listed under a category's `topics` (e.g. `game`,
     `pixel-art`, `vscode-extension`, `pwa`)
  3. the category whose `keywords` appear most often in name + description
  4. `other`

  The workflow log prints the reason for every repo, e.g.
  `games  Tonspur  keywords game, guessing`.
- **Text, emoji, tech** — from GitHub (description, language, known topics)
  unless `data/overrides.json` says otherwise.

## Overrides

`data/overrides.json`, keyed by repository name (case matters). Every field
is optional:

```json
"Tonspur": {
  "emoji": "🎥",
  "category": "games",
  "tech": ["PWA"],
  "desc": { "en": "Movie guessing game", "de": "Film-Ratespiel" },
  "featured": true,
  "hide": false
}
```

`featured` makes the card wide and puts it first on its shelf; `hide` keeps a
repo off the page.

## Deployment

GitHub Pages, *Deploy from a branch* → `main` / `/ (root)`. `.nojekyll` keeps
Jekyll out of the way. A push is a deploy.

## Local preview

```sh
python3 scripts/sync-projects.py   # optional, needs api.github.com
python3 -m http.server 8899
```

Then open <http://127.0.0.1:8899>. Opening `index.html` directly from the
filesystem works too — the data file is a plain script, not a `fetch` call.
