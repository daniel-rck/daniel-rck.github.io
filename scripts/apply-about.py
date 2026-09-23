#!/usr/bin/env python3
"""Write the About box (description, topics, website) of every repository
listed in data/about.json to GitHub — the texts the sync then reads.

Editing a repository's About box needs admin rights on it, which the
workflow token does not have, so this runs locally through an authenticated
`gh` CLI (`gh auth login`, scopes `repo` and `read:org`).

  - description is replaced
  - topics are added; topics already on the repository are kept
  - homepage is only set where the repository has none yet

    python3 scripts/apply-about.py            # dry run, shows what would change
    python3 scripts/apply-about.py --apply    # write it
    python3 scripts/apply-about.py --apply amigo-labs/amigo-trommel   # just one
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ABOUT = os.path.join(ROOT, "data", "about.json")


def gh(*args, body=None):
    res = subprocess.run(["gh", "api", *args] + (["--input", "-"] if body is not None else []),
                         input=json.dumps(body) if body is not None else None,
                         capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(res.stderr.strip() or res.stdout.strip())
    return json.loads(res.stdout) if res.stdout.strip() else None


def main():
    args = sys.argv[1:]
    apply = "--apply" in args
    only = [a for a in args if not a.startswith("--")]
    with open(ABOUT, encoding="utf-8") as f:
        about = json.load(f)

    failed = 0
    for full, want in about.items():
        if only and full not in only:
            continue
        try:
            repo = gh("repos/" + full)
        except RuntimeError as e:
            print("  ! {}: {}".format(full, e))
            failed += 1
            continue

        patch = {}
        if want.get("description") and want["description"] != (repo.get("description") or ""):
            patch["description"] = want["description"]
        if want.get("homepage") and not (repo.get("homepage") or "").strip():
            patch["homepage"] = want["homepage"]
        have = repo.get("topics") or []
        topics = have + [t for t in want.get("topics", []) if t not in have]

        if not patch and topics == have:
            print("  = {}".format(full))
            continue
        print("  {} {}".format("~" if apply else "?", full))
        for k, v in patch.items():
            print("      {:<12} {}".format(k, v))
        if topics != have:
            print("      {:<12} + {}".format("topics", ", ".join(t for t in topics if t not in have)))
        if not apply:
            continue
        try:
            if patch:
                gh("-X", "PATCH", "repos/" + full, body=patch)
            if topics != have:
                gh("-X", "PUT", "repos/{}/topics".format(full), body={"names": topics})
        except RuntimeError as e:
            print("  ! {}: {}".format(full, e))
            failed += 1

    if not apply:
        print("\nDry run — nothing written. Run again with --apply.")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
