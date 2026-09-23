#!/usr/bin/env python3
"""Read every public repository of the profiles listed in data/categories.json,
sort each one into a category and write the result to data/projects.js.

Category per repository, first match wins:
  1. "category" in data/overrides.json
  2. a GitHub topic listed under a category's "topics"
  3. the most keywords from a category's "keywords" in the name or description
  4. the last category (the catch-all)

A profile listed under "pages" gets a page of its own: its projects carry that
page's id and stay off the main page, which keeps everything else.

    python3 scripts/sync-projects.py                 # live, from the GitHub API
    python3 scripts/sync-projects.py --from seed.json  # offline, from a repo dump
"""
import json, os, re, sys, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join(ROOT, "data", "categories.json")
OVERRIDES = os.path.join(ROOT, "data", "overrides.json")
OUT = os.path.join(ROOT, "data", "projects.js")
API = "https://api.github.com/{}/{}/repos?per_page=100&type=owner&sort=pushed"


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def get(url, token):
    req = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json",
                                               "User-Agent": "daniel-rck-site-sync"})
    if token:
        req.add_header("Authorization", "Bearer " + token)
    with urllib.request.urlopen(req, timeout=25) as r:
        nxt = re.search(r'<([^>]+)>;\s*rel="next"', r.headers.get("Link", ""))
        return json.load(r), (nxt.group(1) if nxt else None)


def fetch(sources, token):
    """All repositories of all sources. Any failure aborts the whole run, so a
    flaky API never publishes a page with half the projects missing."""
    repos = []
    for src in sources:
        url = API.format(src["type"], src["name"])
        while url:
            try:
                page, url = get(url, token)
            except (urllib.error.URLError, OSError) as e:
                sys.exit("  ! {}/{}: {}".format(src["type"], src["name"], e))
            repos.extend(page)
    return repos


def homepage(repo):
    url = (repo.get("homepage") or "").strip()
    if not url:
        return None
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    # A homepage pointing back at GitHub (a wiki, the repo itself, a release
    # page) is documentation, not a live app — the site already links the repo.
    if re.match(r"https?://(www\.)?github\.com/", url):
        return None
    return url


def categorize(repo, override, cats):
    if override.get("category"):
        return override["category"], "override"
    topics = repo.get("topics") or []
    for c in cats:
        hit = next((t for t in topics if t in c["topics"]), None)
        if hit:
            return c["id"], "topic " + hit
    text = " ".join([repo["name"], repo.get("description") or ""]).lower()
    # The category with the most keyword hits wins, the earlier one on a tie —
    # so "game engine" outvotes the bare "game" of a game.
    best, hits = None, []
    for c in cats:
        found = [k for k in c["keywords"] if re.search(r"\b" + re.escape(k), text)]
        if len(found) > len(hits):
            best, hits = c, found
    if best:
        return best["id"], "keywords " + ", ".join(hits)
    return cats[-1]["id"], "fallback"


def tech(repo, techmap):
    out = []
    for label in [repo.get("language")] + [techmap.get(t) for t in repo.get("topics") or []]:
        if label and label not in out:
            out.append(label)
    return out


def main():
    args = sys.argv[1:]
    cfg, overrides = load(CONFIG), load(OVERRIDES)
    cats = cfg["categories"]
    ids = [c["id"] for c in cats]
    for name, o in overrides.items():
        if o.get("category") and o["category"] not in ids:
            sys.exit("  ! overrides.json: {} has unknown category {!r}".format(name, o["category"]))

    if args[:1] == ["--from"]:
        repos = load(args[1])
    else:
        repos = fetch(cfg["sources"], os.environ.get("GITHUB_TOKEN", ""))

    skip = set(cfg.get("skip", []))
    pages = cfg.get("pages", [])
    page_of = {owner: pg["id"] for pg in pages for owner in pg["owners"]}
    emoji = {c["id"]: c["emoji"] for c in cats}
    projects, seen = [], set()
    for r in repos:
        name = r["name"]
        o = overrides.get(name, {})
        if r.get("fork") or r.get("archived") or r.get("private") or name in skip or o.get("hide"):
            continue
        if name in seen:
            sys.exit("  ! {} exists in two profiles — ids must be unique".format(name))
        seen.add(name)
        cat, why = categorize(r, o, cats)
        text = (r.get("description") or "").strip()
        projects.append({
            "id": name,
            "name": name,
            "owner": r["owner"]["login"],
            "page": page_of.get(r["owner"]["login"], ""),
            "category": cat,
            "emoji": o.get("emoji") or emoji[cat],
            "desc": {"de": o.get("desc", {}).get("de") or text,
                     "en": o.get("desc", {}).get("en") or text},
            "tech": o["tech"] if "tech" in o else tech(r, cfg.get("tech", {})),
            "repo": r["html_url"],
            "live": homepage(r),
            "stars": r.get("stargazers_count") or 0,
            "pushed": r.get("pushed_at"),
            "featured": bool(o.get("featured")),
        })
        print("  {:<10} {:<26} {}".format(cat, name, why))

    for name in overrides:
        if name not in seen and not overrides[name].get("hide"):
            print("  ? overrides.json: {} matches no repository".format(name))

    # featured first, then live apps, then most recently pushed; name breaks ties
    projects.sort(key=lambda p: p["name"].lower())
    projects.sort(key=lambda p: p["pushed"] or "", reverse=True)
    projects.sort(key=lambda p: (ids.index(p["category"]), not p["featured"], not p["live"]))

    public = [{k: c[k] for k in ("id", "label", "blurb", "emoji", "color")} for c in cats]
    public_pages = [{k: pg[k] for k in ("id", "path", "name", "title", "tagline")} for pg in pages]
    dump = lambda v: json.dumps(v, indent=2, ensure_ascii=False)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* Generated by scripts/sync-projects.py — do not edit by hand.\n"
                "   Edit data/categories.json or data/overrides.json instead. */\n"
                "window.CATEGORIES = " + dump(public) + ";\n\n"
                "window.PAGES = " + dump(public_pages) + ";\n\n"
                "window.PROJECTS = " + dump(projects) + ";\n")
    print("\n{} project(s) written to data/projects.js".format(len(projects)))


if __name__ == "__main__":
    main()
