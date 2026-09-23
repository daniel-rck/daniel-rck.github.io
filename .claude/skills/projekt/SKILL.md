---
name: projekt
description: Ein Projekt auf der Landing Page daniel-rck.github.io anpassen, einsortieren oder ausblenden. Nutze dieses Skill, wenn Daniel ein neues Projekt gebaut hat, eines in einer falschen Kategorie landet, eine Beschreibung oder ein Emoji ändern will, ein Projekt von der Seite nehmen möchte oder fragt, warum ein Live-Link fehlt. Trigger u.a.: "ich hab was Neues gemacht", "trag mal X ein", "neues Projekt", "falsche Kategorie", "Projekt entfernen", "Beschreibung ändern", "add project", "update projects".
---

# Projekt pflegen

Die Seite liest **alle öffentlichen Repos** der Profile aus
`data/categories.json` (`sources`) automatisch ein. `scripts/sync-projects.py`
schreibt daraus `data/projects.js` — diese Datei ist generiert und wird
**nie von Hand bearbeitet**. Der Workflow *Sync projects* läuft täglich, per
`workflow_dispatch` und bei jeder Änderung an den Daten-Dateien.

Von Hand gepflegt werden nur:

- `data/overrides.json` — optionaler Feinschliff pro Repo
- `data/categories.json` — Profile, Unterseiten, Kategorien, Topics, Keywords, Farben
- `data/about.json` — Beschreibung und Topics, wie sie im GitHub-About-Feld
  stehen sollen; `scripts/apply-about.py --apply` schreibt sie (lokal, mit `gh`)

Projekte von `amigo-labs` stehen **nur** auf der eigenen Seite
`/amigo-labs/` (Eintrag unter `pages` in `data/categories.json`), nicht auf
der Hauptseite.

## Neues Projekt

Normalerweise: **nichts tun.** Es erscheint beim nächsten Sync. Prüfe
trotzdem mit den GitHub-MCP-Tools (`description`, `topics`, `homepage`):

1. **Kategorie** — landet es richtig? Reihenfolge der Zuordnung: Override →
   Topic → meiste Keyword-Treffer in Name+Beschreibung → `other`. Die beste
   Lösung ist ein passendes Topic im Repo (z.B. `game`, `pixel-art`,
   `vscode-extension`, `pwa`; die Liste steht in `data/categories.json`).
   Trag Beschreibung und Topics in `data/about.json` ein; Daniel schreibt sie
   mit `python3 scripts/apply-about.py --apply` nach GitHub. Nur wenn kein
   Topic passt, `category` in `data/overrides.json` eintragen.
   Die bestehenden Projekte tragen `category` zusätzlich als Override,
   damit die Seite nicht davon abhängt, ob das About-Feld schon gesetzt ist.
2. **Texte** — GitHub liefert nur eine Beschreibung für beide Sprachen. Für
   eine saubere DE/EN-Fassung `desc` in `data/overrides.json` setzen: ein
   knapper Satz, kein Punkt am Ende, Ton wie die bestehenden Einträge.
3. **Emoji** — ohne Override bekommt ein Projekt das Emoji seiner Kategorie.
   Schlag ein eigenes vor; es muss über alle Einträge eindeutig sein.

Frage offene Punkte **gesammelt in einer Rückfrage**, nicht nacheinander.

## Live-URL

Frage Daniel **nicht** nach der Live-URL. Sie kommt aus *About → Website*
des Repos:

- **Gesetzt** → nichts zu tun.
- **Leer, aber es gibt eine Live-Version** → Daniel soll sie im Repo unter
  *About → Website* eintragen; nenne das Repo beim Namen.
- **Zeigt auf github.com** (Wiki, Releases) → gilt als Doku und wird bewusst
  ignoriert; die Karte verlinkt das Repo ohnehin.

## Overrides (`data/overrides.json`)

Schlüssel = Repo-Name, exakt wie auf GitHub (Groß-/Kleinschreibung zählt).
Alle Felder optional, Reihenfolge `emoji`, `category`, `tech`, `desc`,
`featured`, `hide`; kurze Arrays einzeilig.

```json
"HamsterFlight": {
  "emoji": "🐹",
  "category": "games",
  "tech": ["PWA"],
  "desc": { "en": "…", "de": "…" }
}
```

- `featured: true` → breite Karte, zuerst im Regal
- `hide: true` → Projekt verschwindet von der Seite
- Leeres `tech: []` unterdrückt die automatisch erkannten Tech-Chips

## Prüfen

- `python3 -m json.tool data/overrides.json` und `data/categories.json`
- Wenn der Egress `api.github.com` zulässt: `python3 scripts/sync-projects.py`
  und das Log lesen — pro Repo steht dort Kategorie und Grund. Sonst nach dem
  Merge den Workflow manuell starten (oder er läuft durch die Änderung an
  `data/overrides.json` von selbst).
- `node --check assets/app.js data/projects.js`
- Lokal: `python3 -m http.server 8899`, beide Sprachen, hell und dunkel.

## Committen

Ein Commit, sprechende Message (`Polish the HamsterFlight card`,
`Move Codes to dev tools`, `Hide the X repo from the page`), Push auf den
aktuellen Branch, bei Feature-Branch danach PR.

## Was dieses Skill nicht tut

- `data/projects.js` von Hand ändern.
- Die README im Profil-Repo `daniel-rck/daniel-rck` mitpflegen.
- Neue Kategorien oder Design-Änderungen ohne Absprache. Eine neue Kategorie
  ist ein Eintrag in `data/categories.json` (id, Label DE/EN, Blurb, Emoji,
  Farbe hell/dunkel, Topics, Keywords) — das Frontend übernimmt sie
  automatisch, aber Farbe und Reihenfolge gehören abgesprochen.
