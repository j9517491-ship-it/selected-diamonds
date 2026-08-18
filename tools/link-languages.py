# -*- coding: utf-8 -*-
"""Wire the two language editions together.

Adds the EN/FR switch to every navigation, gives each page a reciprocal
hreflang pair, and lifts the noindex that kept the French pages out of search
while they were being reviewed. Idempotent: safe to run again after new pages
are added.
"""
import os, re, glob

# path -> (french twin, exact?)   exact means "same page, other language",
# which is the only case where an automatic redirect is honest.
def is_redirect_stub(path):
    """Moved-page stubs have no nav and no head worth wiring — skip them."""
    return 'http-equiv="refresh"' in open(path).read()

PAIRS = {}
for f in glob.glob('*.html'):
    if os.path.exists(os.path.join('fr', f)) and not is_redirect_stub(f):
        PAIRS[f] = ('fr/' + f, True)
for f in glob.glob('blog/*.html'):
    if is_redirect_stub(f):
        continue
    twin = os.path.join('fr', f)
    PAIRS[f] = (twin, True) if os.path.exists(twin) else ('fr/index.html', False)

def rel(frm, to):
    r = os.path.relpath(to, os.path.dirname(frm) or '.')
    return r.replace(os.sep, '/')

def canon(p):
    return 'https://selected-diamonds.fr/' + ('' if p == 'index.html' else p)

SWITCH = ('      <li class="lang-switch"><a href="{href}" hreflang="{lang}" '
          'lang="{lang}" data-lang="{lang}"{exact}>{label}</a></li>\n')

def strip_old(s):
    s = re.sub(r'\n? *<li class="lang-switch">.*?</li>', '', s, flags=re.S)
    s = re.sub(r'\n?<link rel="alternate" hreflang="[^"]*" href="[^"]*">', '', s)
    return s

def inject_switch(path, s, href, lang, label, exact):
    tag = SWITCH.format(href=href, lang=lang, label=label,
                        exact=' data-lang-exact="1"' if exact else '')
    m = re.search(r'( *</ul>\n *</div>\n</header>)', s)
    assert m, path
    return s[:m.start()] + tag + s[m.start():]

def alt_tags(fr_url, en_url):
    return ('<link rel="alternate" hreflang="fr" href="%s">\n'
            '<link rel="alternate" hreflang="en" href="%s">\n'
            '<link rel="alternate" hreflang="x-default" href="%s">' % (fr_url, en_url, en_url))

n = 0
# ---- English pages ----------------------------------------------------
for en, (fr, exact) in PAIRS.items():
    s = strip_old(open(en).read())
    s = inject_switch(en, s, rel(en, fr), 'fr', 'FR', exact)
    tags = alt_tags(canon(fr), canon(en))
    if '<link rel="canonical"' in s:
        s = re.sub(r'(<link rel="canonical"[^>]*>)', r'\1\n' + tags, s, count=1)
    else:
        s = s.replace('<meta name="viewport"', tags + '\n<meta name="viewport"', 1)
    open(en, 'w').write(s); n += 1

# ---- French pages -----------------------------------------------------
for en, (fr, exact) in PAIRS.items():
    if not os.path.exists(fr) or not exact:
        continue
    s = strip_old(open(fr).read())
    s = s.replace('<meta name="robots" content="noindex, nofollow">\n', '')
    s = inject_switch(fr, s, rel(fr, en), 'en', 'EN', True)
    tags = alt_tags(canon(fr), canon(en))
    s = re.sub(r'(<link rel="canonical"[^>]*>)', r'\1\n' + tags, s, count=1)
    open(fr, 'w').write(s); n += 1

print(f"{n} pages wired; {sum(1 for _, e in PAIRS.values() if e)} exact pairs, "
      f"{sum(1 for _, e in PAIRS.values() if not e)} fall back to the French home page")
