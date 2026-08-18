# Selected Diamonds — working notes

Static site for Emilia Hallel, independent diamond sourcing advisor, Strasbourg.
Hosted on GitHub Pages at https://selected-diamonds.fr. Deployment is a push
from GitHub Desktop; there is no build step.

## The standing rule: both languages, always

**Every change is made in both editions in the same commit.** English lives at
the root, French under `/fr/`. If a change touches copy, layout, a link, an
image or a page, the counterpart gets the same change before the work is
called done. Never leave the two versions out of step.

| English | French |
| --- | --- |
| `index.html` | `fr/index.html` |
| `about.html`, `services.html`, `portfolio.html`, `contact.html`, `consultation.html`, `carat-size.html` | same names under `fr/` |
| `portfolio-fivestone-weddingband.html`, `portfolio-fine-jewellery-commission.html`, `portfolio-private-purchase.html`, `portfolio-heirloom-reset.html`, `portfolio-mixed-shape-earrings.html` | same names under `fr/` |
| `privacy-policy.html`, `terms-conditions.html`, `shipping-policy.html` | same names under `fr/` |
| `blog/4cs-guide.html`, `blog/optical-properties.html` | same names under `fr/blog/` |
| `blog/coloured-diamonds.html` (placeholder) | same name under `fr/blog/` |
| `blog/index.html`, `blog/natural-vs-lab-grown.html`, `blog/engagement-ring-guide.html`, `blog/natural-diamond-formation.html` | **not yet translated** |

Navigation, both languages, seven items plus the language switch:
Home · About · Services · Portfolio · Journal · Contact · Book a Call · FR
Accueil · À propos · Prestations · Portfolio · Journal · Contact · Réserver un appel · EN

## Routine after certain changes

- **After any CSS or JS edit** — run `python3 tools/stamp-assets.py`, then copy
  the new `?v=` hashes into the French pages. The script only walks the English
  tree. Skipping this is why Safari kept serving stale styles.
- **After adding or removing a page** — run `python3 tools/link-languages.py`.
  It rebuilds the EN/FR switch in every nav and the reciprocal `hreflang` tags.
  It also strips `noindex`, so re-add it to any placeholder afterwards.
- **After publishing an article** — add it to `blog/index.html` by hand. That
  listing is maintained manually and is easy to forget; an article went live
  unlisted once already.
- **After adding a page** — add it to `sitemap.xml`. Placeholders stay out.

## Things that are deliberate, not oversights

- **Nav breakpoint is 1100px,** with `clamp()` on the gap and font size so the
  row tightens before it collapses. Measured collision points: 961px English,
  1052px French, before Services was added. Re-measure both languages if the
  nav grows again.
- **`.card-photo-img` needs `height: auto`.** The intrinsic `height` attribute
  is applied as a real CSS height and beats `aspect-ratio` without it.
- **Photo cards are one anchor** (`.card-link`), and the trailing line is a
  `<p class="card-more">`, not a link. An `<a>` inside an `<a>` is invalid and
  browsers break the outer one.
- **Carat tool and form strings live in `js/script.js`,** routed through
  `t(en, fr)` which reads `<html lang>`. New user-facing strings need both.
- **The language redirect never fires unless the page has a true twin**
  (`data-lang-exact`). Without that guard a French reader following a link to
  an untranslated article was thrown to the French home page.
- **Placeholders carry `noindex` and stay out of `sitemap.xml`.** Delete the
  robots meta and add the URL when the content is written.
- **`portfolio-engagement-solitaire.html` is a redirect stub** left at the old
  address after the rename to `portfolio-fivestone-weddingband.html`.
- **Article figures are inline SVG drawn from scratch,** never copied from GIA
  material. Labels and `aria-label` are translated on the French pages.

## Verification worth re-running

A pass over all pages that checks: balanced tags, every local link resolves,
every `<img>` has `alt`, SVG parses, nav and footer identical within each
language, carousel items counted *inside* `.pf-track`, published articles all
present in the Journal listing, placeholders absent from it.

## Open items

- `blog/coloured-diamonds.html` — Chemistry placeholder, both languages.
- No French Journal index; `fr/blog/` holds two articles and the nav points at
  the English listing.
- Contact form still posts to `formspree.io/f/YOUR_FORM_ID`; until she signs
  up it falls back to the visitor's mail app.
- Three English articles await French translation.
- The five-stone band case page does not name the metal or finish.
