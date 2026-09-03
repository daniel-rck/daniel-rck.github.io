---
name: projekt
description: Ein Projekt auf der Landing Page daniel-rck.github.io eintragen, ändern oder entfernen. Nutze dieses Skill, wenn Daniel ein neues Projekt gebaut hat, ein bestehendes umbenennt, eine Beschreibung anpassen will, ein Projekt von der Seite nehmen möchte oder fragt, warum ein Live-Link fehlt. Trigger u.a.: "ich hab was Neues gemacht", "trag mal X ein", "neues Projekt", "Projekt entfernen", "Beschreibung ändern", "add project", "update projects".
---

# Projekt pflegen

Die Landing Page rendert sich vollständig aus `data/projects.js`. Das ist die
einzige Datei, die für Projektänderungen angefasst wird.

**Live-URLs stehen NICHT in dieser Datei.** Sie kommen aus dem Feld
*About → Website* des jeweiligen GitHub-Repos, werden von
`scripts/sync-live-urls.py` eingesammelt und landen in `data/live.js`.
`data/live.js` ist generiert — niemals von Hand bearbeiten.

## Ablauf

### 1. Angaben sammeln

Leite so viel wie möglich selbst her, statt zu fragen:

- Aus der Repo-URL: `name` und `id` (beides der Repo-Name, exakt wie auf GitHub
  geschrieben — Groß-/Kleinschreibung zählt, weil `id` der Schlüssel in
  `data/live.js` ist).
- Aus dem Repo selbst (GitHub-MCP-Tools, z.B. `search_repositories` mit
  `repo:owner/name` und `minimal_output: false`): `description`, `language`,
  `topics` und ob eine Website hinterlegt ist.

Frage nur das, was übrig bleibt, und dann **gesammelt in einer einzigen
Rückfrage** — nicht nacheinander:

| Feld | Pflicht | Hinweis |
|---|---|---|
| `category` | ja | `labs` (amigo-labs), `tools` (Dev Tools) oder `apps` (Alltags-Apps) |
| `emoji` | ja | Schlage einen passenden vor. Muss in der ganzen Liste eindeutig sein — prüfe das. |
| `desc.de` / `desc.en` | ja | Ein knapper Satz, kein Punkt am Ende. Ton wie die bestehenden Einträge. |
| `tech` | nein | Array, z.B. `["Svelte", "Rust", "PWA"]`. Leeres Array ist erlaubt. |

### 2. `data/projects.js` bearbeiten

Halte dich exakt an die Form der bestehenden Einträge: gleiche Feldreihenfolge
(`id`, `emoji`, `name`, `category`, `repo`, `tech`, `desc`), zwei Leerzeichen
Einrückung, doppelte Anführungszeichen. Neue Einträge kommen ans **Ende ihrer
Kategorie**; die Kategorien stehen in der Reihenfolge `labs`, `tools`, `apps`
und werden durch eine Leerzeile getrennt.

```js
  {
    id: "HamsterFlight",
    emoji: "🐹",
    name: "HamsterFlight",
    category: "apps",
    repo: "https://github.com/daniel-rck/HamsterFlight",
    tech: ["PWA"],
    desc: {
      en: "…",
      de: "…"
    }
  }
```

### 3. Live-URL

Frage Daniel **nicht** nach der Live-URL. Prüfe stattdessen das
`homepage`-Feld des Repos:

- **Gesetzt** → nichts zu tun. Der nächste Lauf von *Sync live URLs* trägt sie
  nach; du kannst `python3 scripts/sync-live-urls.py` auch lokal ausführen,
  falls der Egress das zulässt.
- **Leer, aber es gibt eine Live-Version** → sag Daniel, dass er sie im Repo
  unter *About → Website* eintragen soll, und nenne das Repo beim Namen. Dann
  gilt sie automatisch für die Seite mit.
- **Zeigt auf github.com** (Wiki, Releases) → das ist Doku, keine Live-App. Der
  Sync ignoriert solche URLs bewusst; die Seite verlinkt das Repo ohnehin schon.

### 4. Prüfen

- `node --check assets/app.js` und `node -e "require('./data/projects.js')"`
  greifen hier nicht (Browser-Globals) — prüfe die Datei stattdessen mit
  `node --check data/projects.js`.
- Emoji-Eindeutigkeit über alle Einträge.
- Jede `id` kommt genau einmal vor.
- Jede `repo`-URL ist erreichbar.
- Lokal ansehen: `python3 -m http.server 8899` und die Seite in beiden Sprachen
  durchklicken. Die Zahl im Zentrum muss der neuen Anzahl entsprechen.

### 5. Committen

Ein Commit, sprechende Message (`Add HamsterFlight to everyday apps`,
`Remove X from the project list`, `Reword the Pizzateig description`), Push auf
den aktuellen Branch. Bei einem Feature-Branch danach einen PR öffnen.

## Entfernen

Eintrag aus `data/projects.js` löschen. `data/live.js` **nicht** anfassen — der
nächste Sync räumt den verwaisten Schlüssel von selbst weg.

## Was dieses Skill nicht tut

- `data/live.js` von Hand ändern.
- Die README im Profil-Repo `daniel-rck/daniel-rck` mitpflegen. Die listet
  bewusst keine Projekte mehr, sondern verlinkt nur die Seite — sie muss bei
  einem neuen Projekt also nicht angefasst werden.
- Design, Layout oder Kategorien ändern. Eine neue Kategorie ist ein Eingriff
  in `assets/app.js` und `assets/style.css` und braucht eine echte Absprache.
