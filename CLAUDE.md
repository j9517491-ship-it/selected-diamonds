# Selected Diamonds — working notes

Static site for Emilia Hallel, independent diamond sourcing advisor, Strasbourg.
Hosted on GitHub Pages at https://selected-diamonds.fr. Deployment is a push
from GitHub Desktop; there is no build step.

## The standing rule: both languages, always

**Every change is made in both editions in the same commit.** English lives at
the root, French under `/fr/`. If a change touches copy, layout, a link, an
image or a page, the counterpart gets the same change before the work is
called done. Never leave the two versions out of step.

Page map:

| English | French |
| --- | --- |
| `index.html` | `fr/index.html` |
| `about.html`, `portfolio.html`, `contact.html`, `consultation.html`, `carat-size.html` | same names under `fr/` |
| `portfolio-*.html` (4 case pages) | same names under `fr/` |
| `privacy-policy.html`, `terms-conditions.html`, `shipping-policy.html` | same names under `fr/` |
| `blog/4cs-guide.html` | `fr/blog/4cs-guide.html` |
| `blog/coloured-diamonds.html`, `blog/optical-properties.html` (stubs) | same names under `fr/blog/` |
| `blog/index.html`, `blog/natural-vs-lab-grown.html`, `blog/engagement-ring-guide.html`, `blog/natural-diamond-formation.html` | **not yet translated** |

French pages that link to an untranslated English article mark it
`(en anglais)` in a muted span. Remove that label when the translation lands.

## After any CSS or JS change

Run `python3 tools/stamp-assets.py`, then copy the new `?v=` hashes into the
French pages — the script only walks the English tree. Skipping this is why
Safari kept showing stale styles.

## After adding or removing a page

Run `python3 tools/link-languages.py`. It rebuilds the EN/FR switch in every
nav and the reciprocal `hreflang` tags. It also strips `noindex`, so re-add it
to the two unwritten article stubs afterwards.

## Things that are deliberate, not oversights

- **Nav breakpoint is 1060px.** Measured: the wordmark collides with the nav
  row at 961px in English and 1052px in French once the language switch is
  counted. Do not lower it without re-measuring both languages.
- **`.card-photo-img` needs `height: auto`.** The intrinsic `height` attribute
  is applied as a real CSS height and beats `aspect-ratio` without it.
- **The carat tool's strings live in `js/script.js`,** routed through `t(en, fr)`
  which reads `<html lang>`. New user-facing strings in the script need both.
- **Language redirect only fires where an exact twin exists.** The untranslated
  articles link to the French home page and never auto-redirect — bouncing a
  reader off the article they asked for is worse than showing them English.
- **The two article stubs carry `noindex` and are absent from `sitemap.xml`.**
  When the content is written, delete the robots meta and add the URLs.

## Open items

- `blog/coloured-diamonds.html` and `blog/optical-properties.html` are
  placeholders in both languages, awaiting Emilia's content.
- The contact form still posts to `formspree.io/f/YOUR_FORM_ID`; until she
  signs up it falls back to the visitor's mail app.
- Three English articles await French translation (see the table above).
