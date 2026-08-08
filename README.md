# Selected Diamonds — new website

**Live at:** https://selected-diamonds.fr

A custom-coded replacement for the Wix site, built for speed and SEO. Plain HTML/CSS/JS — no framework, no build step, works anywhere. All canonical URLs, Open Graph tags, `sitemap.xml`, and `robots.txt` are already pointed at the live Netlify URL above.

## What's inside

- `index.html`, `about.html`, `portfolio.html`, `contact.html` — main pages
- `blog/` — Journal index + 3 SEO articles (4Cs guide, natural vs. lab-grown, engagement ring guide)
- `privacy-policy.html`, `terms-conditions.html`, `shipping-policy.html` — legal pages (templates — see below)
- `sitemap.xml`, `robots.txt` — for search engine crawling
- `css/style.css`, `js/script.js` — shared styling and behavior

## 1. It's live — optional next step: a custom domain

The site is live on Netlify's free subdomain. That's perfectly usable long-term, but a custom domain (e.g. `selecteddiamonds.com` or `.fr`, ~€10-20/year from Namecheap or OVH) looks more professional and lets you use an @yourdomain.com email address.

To add one: buy the domain, then in Netlify go to Site settings → Domain management → Add a custom domain, and follow the DNS instructions there.

**If you add a custom domain:** every page currently has `https://selected-diamonds.fr/` hardcoded in the `<link rel="canonical">`, Open Graph tags, `sitemap.xml`, and `robots.txt`. Find-and-replace that with your new domain across all files, then re-deploy.

## 2. Make the contact form actually send email

The form currently points to `https://formspree.io/f/YOUR_FORM_ID` in `contact.html`. Formspree's free tier handles 50 submissions/month:

1. Create a free account at formspree.io
2. Create a new form, copy the form ID it gives you
3. In `contact.html`, replace `YOUR_FORM_ID` in the form's `action` attribute

Until you do this, the form falls back to opening the visitor's email app instead (via `mailto:`) — it works, just less polished.

## 3. Visibility checklist — do these now that you're live

- **Google Search Console** (search.google.com/search-console): add `selected-diamonds.fr` as a property, verify ownership, then submit `sitemap.xml` under Sitemaps. This is the single highest-priority step left — without it, Google may not find or index the site for weeks.
- **Google Business Profile**: create one for Strasbourg. For a location-based service like this, it matters more for local search than the website itself. Add photos, services, and get a few clients to leave reviews.
- **Real photography**: the portfolio page uses placeholder line-art graphics. Replace with real photos of sourced stones/rings as soon as available — product photos are a strong ranking and trust signal, and stock/AI diamond photos look cheap in this niche.
- **Publish new Journal articles regularly** (aim for 1/month): long-tail guides like "GIA vs IGI certification," "diamond ring insurance," "how to buy an engagement ring online safely" compound over time and are what actually rank, more than the homepage.
- **Backlinks**: link the site from the Instagram bio (@selected.diamonds), any wedding/jewellery directories relevant to Alsace/France, and consider a guest post or interview with a wedding-planning blog.
- **Page speed**: this site is plain HTML/CSS with no heavy JS, so it should score well on Google PageSpeed Insights out of the box — worth a quick check after launch.
- **Multilingual**: since you're targeting France as well as international clients, consider a French version of key pages (`/fr/`) — most of your local search volume in Strasbourg/Alsace will be in French.

## 4. Legal pages

The Privacy Policy, Terms & Conditions, and Shipping Policy are solid starting templates but are **not a substitute for legal review** — especially given GDPR (EU client data) and the fact you're selling high-value certified goods. Worth 30 minutes with a lawyer before launch, particularly for the returns/cancellation and liability sections.

## 5. Local preview

Open `index.html` directly in a browser to preview, or run a tiny local server from inside the folder:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.
