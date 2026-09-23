---
name: beschreibungen
description: Alle Repos von daniel-rck und amigo-labs durchgehen und GitHub-Beschreibung, Topics und Website (About-Feld) sowie die Einsortierung auf daniel-rck.github.io in einem Rutsch aktualisieren. Nutze dieses Skill bei /beschreibungen oder wenn Daniel sagt "aktualisier die Beschreibungen", "GitHub-Beschreibungen", "Topics setzen", "About-Felder", "alles neu einsortieren", "die Seite ist falsch kategorisiert". Optional mit Repo-Namen als Argument, dann nur diese.
---

# Beschreibungen aktualisieren

Ein Durchgang über **alle** Projekte (oder die als Argument genannten):
GitHub-About-Feld und Seitendaten auf Stand bringen. Für ein einzelnes neues
Projekt reicht meist das Skill `projekt`.

## Was wohin gehört

| Datei | Inhalt | Wer schreibt es nach GitHub |
|---|---|---|
| `data/about.json` | `description`, `topics`, optional `homepage` je `owner/repo` | `scripts/apply-about.py --apply` (lokal bei Daniel) |
| `data/overrides.json` | `emoji`, `category`, `tech`, `desc` (DE/EN) je Repo-Name | — (nur die Seite) |
| `data/categories.json` | Kategorien mit `topics`/`keywords`, `pages` (amigo-labs-Seite) | — |
| `data/projects.js` | generiert vom Workflow *Sync projects* | **nie von Hand** |

## Ablauf

1. **Bestand aufnehmen.** `data/projects.js` enthält alle öffentlichen Repos
   vom letzten Sync (Owner, Kategorie, Live-URL). Neu hinzugekommene Repos
   findet `gh repo list daniel-rck` / `gh repo list amigo-labs` — in einer
   Cloud-Session sind Org-weite Listen gesperrt, dann Daniel fragen oder die
   Repos der Session nehmen. Aktueller GitHub-Stand je Repo:
   `gh api repos/OWNER/REPO --jq '{d:.description,t:.topics,h:.homepage}'`.
   Fehlt `gh`: `apt-get install -y gh` (liest über `GH_TOKEN`; `gh auth status`
   darf dabei rot sein).

2. **Verstehen, was ein Repo ist.** README und ggf. `CLAUDE.md` lesen (lokal
   unter `/home/user/<Repo>` oder `git clone --depth 1`). Nicht raten — ein
   leeres Repo ohne Commits: Daniel fragen, was es werden soll.

3. **`data/about.json` pflegen** — Schlüssel `owner/repo`, exakte Schreibweise.
   - `description`: Englisch, ein Satz, kein Punkt am Ende, gern mit
     Gedankenstrich, ~60–120 Zeichen (GitHub-Limit 350). Konkret sagen, was es
     tut, nicht womit es gebaut ist.
   - `topics`: klein, mit Bindestrichen, max. 20. **Mindestens ein Topic aus
     der Zielkategorie** in `data/categories.json` — das bestimmt das Regal.
     Die Kategorien werden der Reihe nach geprüft (games → creative → dev →
     apps), die erste mit Treffer gewinnt: `pwa` (apps) schadet einem Spiel
     mit `game` also nicht. Dazu Tech-Topics (`react`, `rust`, `svelte`,
     `tauri`, `threejs`, `pixijs`, `wasm`, `cloudflare-workers`, …) — die
     bekannten werden auf der Seite zu Tech-Chips (Tabelle `tech`).
   - `homepage`: nur, wenn das Repo keine hat und es nachweislich eine
     Live-Version gibt (`curl -sI` → 200). Das Skript überschreibt nie eine
     bestehende Website.
   - Passt kein vorhandenes Kategorie-Topic, ein neues unter der Kategorie
     in `data/categories.json` → `topics` ergänzen (z. B. `screenshot` bei dev).

4. **`data/overrides.json` nachziehen** — Reihenfolge der Felder `emoji`,
   `category`, `tech`, `desc`, `featured`, `hide`.
   - `category` für jedes Projekt setzen: die Seite soll richtig sortieren,
     auch bevor das About-Feld auf GitHub steht.
   - `desc` DE und EN, knapper Satz ohne Punkt, Ton wie die anderen Einträge.
   - `emoji` muss über alle Einträge eindeutig sein (prüfen, s. u.).
   - `featured`/`hide` nur auf Daniels Wunsch.

5. **Prüfen.**
   ```sh
   for f in data/about.json data/overrides.json data/categories.json; do python3 -m json.tool $f >/dev/null || echo "kaputt: $f"; done
   python3 -c "import json,collections as c;o=json.load(open('data/overrides.json'));print([e for e,n in c.Counter(v.get('emoji') for v in o.values()).items() if n>1])"
   ```
   Einsortierung simulieren — so, als wären die Topics schon gesetzt:
   ```sh
   node -e 'global.window={};require("./data/projects.js");console.log(JSON.stringify(window.PROJECTS))' > /tmp/cur.json
   python3 - <<'EOF'
   import json
   cur=json.load(open('/tmp/cur.json')); about=json.load(open('data/about.json'))
   seed=[{"name":p["name"],"owner":{"login":p["owner"]},"html_url":p["repo"],
          "homepage":p["live"] or about.get(p["owner"]+"/"+p["name"],{}).get("homepage"),
          "description":about.get(p["owner"]+"/"+p["name"],{}).get("description") or p["desc"]["en"],
          "topics":about.get(p["owner"]+"/"+p["name"],{}).get("topics",[]),
          "language":None,"stargazers_count":p["stars"],"pushed_at":p["pushed"]} for p in cur]
   json.dump(seed,open('/tmp/seed.json','w'))
   EOF
   python3 -B scripts/sync-projects.py --from /tmp/seed.json   # Log: Kategorie + Grund je Repo
   node --check data/projects.js assets/app.js
   git checkout data/projects.js                                  # generierte Datei nicht committen
   ```
   Neue Repos fehlen in `projects.js` noch — für die Simulation von Hand in
   den Seed aufnehmen. Kein Projekt darf ungewollt in `other` landen.
   Optisch: `python3 -m http.server 8899`, Hauptseite und `/amigo-labs/`,
   DE/EN, hell/dunkel.

6. **Probelauf gegen GitHub:** `python3 scripts/apply-about.py` (schreibt
   nichts; mit Repo-Namen als Argument nur diese). Zeigt `?` = würde ändern,
   `=` = aktuell, `!` = Fehler.

7. **Committen**, Push, PR. Eine Message wie `Refresh repo descriptions and
   topics`.

8. **Schreiben nach GitHub macht Daniel lokal.** Der Proxy einer Cloud-Session
   blockiert Änderungen an Repo-Einstellungen (HTTP 403) — nicht erneut
   versuchen. Gib Daniel am Ende genau das mit:
   ```sh
   git checkout main && git pull        # nach dem Merge
   python3 scripts/apply-about.py --apply
   gh workflow run "Sync projects" -R daniel-rck/daniel-rck.github.io
   ```
   Lokal ohne Proxy darfst du `--apply` selbst ausführen, wenn Daniel es
   freigibt.

## Nicht tun

- `data/projects.js` von Hand ändern oder den Simulationsstand committen.
- README, Code oder Dateien in den Projekt-Repos anfassen — hier geht es nur
  um das About-Feld und die Seitendaten.
- Bestehende Topics entfernen (das Skript ergänzt nur) oder eine gesetzte
  Website überschreiben.
- Repos ausblenden, neue Kategorien anlegen oder `featured` setzen, ohne zu
  fragen.
