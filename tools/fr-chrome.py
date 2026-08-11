# -*- coding: utf-8 -*-
"""Shared chrome for the French pages under /fr/.

Everything here is the furniture that surrounds the translated body: head,
navigation, footer. Kept in one place so a change to the English chrome can be
mirrored once rather than thirteen times.
"""
import re, os

CSS = re.search(r'style\.css\?v=[0-9a-f]+', open('index.html').read()).group(0)
JS  = re.search(r'script\.js\?v=[0-9a-f]+',  open('index.html').read()).group(0)

NAV = [("index.html","Accueil"),("about.html","À propos"),("portfolio.html","Portfolio"),
       ("blog/index.html","Journal"),("contact.html","Contact")]

def head(title, desc, canon_fr, en_page, extra=""):
    """en_page is the English counterpart's path from the site root."""
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://selected-diamonds.fr/fr/{canon_fr}">
<link rel="alternate" hreflang="fr" href="https://selected-diamonds.fr/fr/{canon_fr}">
<link rel="alternate" hreflang="en" href="https://selected-diamonds.fr/{en_page}">
<link rel="alternate" hreflang="x-default" href="https://selected-diamonds.fr/{en_page}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Selected Diamonds">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="https://selected-diamonds.fr/fr/{canon_fr}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/favicon-16.png" sizes="16x16" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Jost:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/{CSS}">{extra}
</head>
<body>
<a class="skip-link" href="#main">Aller au contenu</a>
'''

def header(active):
    items=[]
    for href,label in NAV:
        cls=' class="active"' if href==active else ''
        items.append(f'      <li><a href="{href}"{cls}>{label}</a></li>')
    cta=' nav-cta active' if active=="consultation.html" else ' nav-cta'
    items.append(f'      <li><a class="{cta.strip()}" href="consultation.html">Réserver un appel</a></li>')
    nl="\n"
    return f'''
<header class="site-header">
  <div class="container nav">
    <a class="brand" href="index.html">Selected <span>Diamonds</span></a>
    <button class="nav-toggle" aria-label="Ouvrir le menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links">
{nl.join(items)}
    </ul>
  </div>
</header>

'''

PHONE = ('<span class="phone-reveal" data-tel="NTQgMTUgNTEgMjggNyAzMys=">'
         '<button type="button" class="phone-reveal-btn">Afficher le numéro</button></span>')

def footer():
    return f'''
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <h4>Selected Diamonds</h4>
        <p>Sourcing et conseil indépendants en diamants pour bagues de fiançailles, haute joaillerie et acquisitions privées.</p>
        <p class="social-icon"><a href="https://www.instagram.com/selected.diamonds/" target="_blank" rel="noopener">Instagram — @selected.diamonds</a></p>
      </div>
      <div>
        <h4>Explorer</h4>
        <ul>
          <li><a href="about.html">À propos d’Emilia</a></li>
          <li><a href="portfolio.html">Portfolio</a></li>
          <li><a href="blog/index.html">Journal</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li>Strasbourg, France</li>
          <li>{PHONE}</li>
          <li><a href="mailto:contact@selected-diamonds.fr">contact@selected-diamonds.fr</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Emilia Hallel — Selected Diamonds. Tous droits réservés.</span>
      <span><a href="privacy-policy.html">Politique de confidentialité</a> · <a href="terms-conditions.html">Conditions générales</a> · <a href="shipping-policy.html">Politique d’expédition</a></span>
    </div>
  </div>
</footer>

<script src="../js/{JS}"></script>
</body>
</html>
'''

def write(path, title, desc, en_page, active, main, extra=""):
    out = head(title, desc, path, en_page, extra) + header(active) + main.rstrip() + "\n" + footer()
    with open(os.path.join('fr', path), 'w') as f:
        f.write(out)
    return path
