#!/usr/bin/env python3
"""Stamp css/style.css and js/script.js references with a content hash.

Browsers cache these files for ten minutes (GitHub Pages sends
cache-control: max-age=600), so an edit is not necessarily visible on a
normal reload. Appending a hash of the file's contents to the URL makes
each new version a URL the browser has never seen, so it is fetched
immediately — while unchanged files keep their cached copy.

Run from the site root after changing the stylesheet or script:

    python3 tools/stamp-assets.py

Idempotent: running it twice in a row changes nothing.
"""

import hashlib
import pathlib
import re
import sys

ASSETS = {
    "css/style.css": re.compile(r'(href="(?:\.\./)?css/style\.css)(?:\?v=[0-9a-f]+)?(")'),
    "js/script.js": re.compile(r'(src="(?:\.\./)?js/script\.js)(?:\?v=[0-9a-f]+)?(")'),
}


def short_hash(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:8]


def main() -> int:
    root = pathlib.Path(__file__).resolve().parent.parent

    versions = {}
    for asset in ASSETS:
        path = root / asset
        if not path.exists():
            print(f"missing asset: {asset}", file=sys.stderr)
            return 1
        versions[asset] = short_hash(path)

    changed = 0
    for html in sorted(root.rglob("*.html")):
        original = html.read_text(encoding="utf-8")
        text = original
        for asset, pattern in ASSETS.items():
            text = pattern.sub(rf"\g<1>?v={versions[asset]}\g<2>", text)
        if text != original:
            html.write_text(text, encoding="utf-8")
            changed += 1

    for asset, version in versions.items():
        print(f"{asset}  ->  ?v={version}")
    print(f"{changed} file(s) updated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
