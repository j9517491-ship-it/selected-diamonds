// Selected Diamonds — shared behaviour

document.addEventListener("DOMContentLoaded", function () {
  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
    });
  }

  // Respect prefers-reduced-motion: don't autoplay looping video
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    Array.prototype.forEach.call(document.querySelectorAll("video[autoplay]"), function (v) {
      v.removeAttribute("autoplay");
      v.setAttribute("controls", "");
      v.pause();
    });
  }

  // Reveal on scroll — elements fade and rise as they enter the viewport.
  // Progressive enhancement: nothing is hidden until this runs, so if the
  // script fails or IntersectionObserver is missing, all content stays visible.
  (function () {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Blocks worth animating. Deliberately excludes the site header, footer,
    // and the carat tool, whose own layout shifts would fight the transform.
    var SELECTOR = [
      ".page-header .eyebrow",
      ".page-header h1",
      ".page-header > .container > p",
      ".hero h1",
      ".hero p",
      ".hero .btn",
      "main h2",
      ".card",
      ".post-card",
      ".pf-item",
      ".post > p",
      ".post > h2",
      ".post-figure",
      ".pf-gallery figure",
      ".pf-specs",
      ".pf-detail-video",
      ".pf-note",
      ".grid > *"
    ].join(",");

    var nodes = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
    if (!nodes.length) return;

    // De-duplicate: an element matched by two selectors must not be tagged twice.
    var seen = [];
    nodes = nodes.filter(function (el) {
      if (seen.indexOf(el) !== -1) return false;
      seen.push(el);
      // Never animate something nested inside an already-tagged ancestor —
      // the parent's transform would carry the child anyway and the delays stack.
      var p = el.parentElement;
      while (p) {
        if (seen.indexOf(p) !== -1) return false;
        p = p.parentElement;
      }
      return true;
    });

    // Anything already on screen stays untouched. Hiding it now and revealing it
    // a frame later would show a visible flash, and content above the fold has
    // nothing to reveal on — the visitor is already looking at it.
    nodes = nodes.filter(function (el) {
      var r = el.getBoundingClientRect();
      return r.top >= window.innerHeight;
    });
    if (!nodes.length) return;

    // Stagger siblings so grids and card rows arrive in sequence.
    var counts = [];
    var parents = [];
    nodes.forEach(function (el) {
      el.classList.add("reveal");
      var parent = el.parentElement;
      var i = parents.indexOf(parent);
      if (i === -1) { parents.push(parent); counts.push(0); i = parents.length - 1; }
      var n = counts[i]++;
      if (n > 0 && n <= 5) el.setAttribute("data-reveal-i", String(n));
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("is-visible");
        observer.unobserve(el);
        // Release the compositor hint once the transition has finished.
        window.setTimeout(function () { el.classList.add("is-done"); }, 1200);
      });
    }, {
      // The element sits 44px lower than its resting place while hidden, so it
      // crosses the fold later than its final position would suggest. A small
      // threshold fires as soon as a sliver appears, which keeps tall cards
      // from animating only once they are halfway up the screen.
      rootMargin: "0px 0px -4% 0px",
      threshold: 0.02
    });

    nodes.forEach(function (el) { observer.observe(el); });

    // Safety net: if anything is still hidden after a few seconds — an observer
    // that never fired, a browser quirk, a restored scroll position — show it.
    // Content must never be permanently invisible because of a decorative effect.
    window.setTimeout(function () {
      nodes.forEach(function (el) {
        if (!el.classList.contains("is-visible")) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      });
    }, 4000);
  })();

  // Portfolio carousel — drag, swipe, arrows, keyboard, dots + counter
  var pf = document.querySelector("[data-pf-carousel]");
  if (pf) {
    var track = pf.querySelector(".pf-track");
    var items = Array.prototype.slice.call(track.querySelectorAll(".pf-item"));
    var prevBtn = pf.querySelector("[data-pf-prev]");
    var nextBtn = pf.querySelector("[data-pf-next]");
    var dots = Array.prototype.slice.call(pf.querySelectorAll(".pf-dot"));
    var counter = pf.querySelector("[data-pf-current]");
    var pad = function (n) { return n < 10 ? "0" + n : String(n); };

    var offsetOf = function (i) { return items[i].offsetLeft - items[0].offsetLeft; };

    var nearestIndex = function () {
      var x = track.scrollLeft;
      var best = 0;
      var bestDist = Infinity;
      for (var i = 0; i < items.length; i++) {
        var d = Math.abs(offsetOf(i) - x);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      return best;
    };

    var goTo = function (i) {
      i = Math.max(0, Math.min(items.length - 1, i));
      track.scrollTo({ left: offsetOf(i), behavior: "smooth" });
    };

    var refresh = function () {
      var i = nearestIndex();
      dots.forEach(function (d, n) {
        var on = n === i;
        d.classList.toggle("is-active", on);
        d.setAttribute("aria-current", on ? "true" : "false");
      });
      if (counter) counter.textContent = pad(i + 1);
      var max = track.scrollWidth - track.clientWidth;
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
      if (nextBtn) nextBtn.disabled = track.scrollLeft >= max - 2;
    };

    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { ticking = false; refresh(); });
    }, { passive: true });

    window.addEventListener("resize", refresh);

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(nearestIndex() - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(nearestIndex() + 1); });

    dots.forEach(function (d, n) {
      d.addEventListener("click", function () { goTo(n); });
    });

    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(nearestIndex() + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(nearestIndex() - 1); }
      else if (e.key === "Home") { e.preventDefault(); goTo(0); }
      else if (e.key === "End") { e.preventDefault(); goTo(items.length - 1); }
    });

    // Pointer dragging (desktop). Touch scrolling stays native.
    var down = false, dragging = false, startX = 0, startScroll = 0, moved = 0;

    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch" || e.button !== 0) return;
      down = true; dragging = false; moved = 0;
      startX = e.clientX;
      startScroll = track.scrollLeft;
    });

    track.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      if (!dragging && moved > 5) {
        dragging = true;
        track.classList.add("is-dragging");
        try { track.setPointerCapture(e.pointerId); } catch (err) {}
      }
      if (dragging) {
        e.preventDefault();
        track.scrollLeft = startScroll - dx;
      }
    });

    var endDrag = function (e) {
      if (!down) return;
      down = false;
      if (!dragging) return;
      track.classList.remove("is-dragging");
      try { track.releasePointerCapture(e.pointerId); } catch (err) {}
      goTo(nearestIndex());
      window.setTimeout(function () { dragging = false; }, 0);
    };

    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);

    // A drag must never trigger the card link.
    track.addEventListener("click", function (e) {
      if (dragging || moved > 5) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    track.addEventListener("dragstart", function (e) { e.preventDefault(); });

    refresh();
  }


  // Carat size tool — six shapes, optional true-size calibration.
  // Sizes assume a well-cut stone (GIA Excellent, or its equivalent for fancy shapes).
  // Dimensions come from Emilia's own size chart for excellent-cut stones,
  // interpolated between charted weights. Cushion below 0.3ct and emerald below
  // 0.2ct are approximations scaled from the first charted weight.
  var caratTool = document.querySelector("[data-carat-tool]");
  if (caratTool) {
    var SIZES = {
      round: [
        [0.1, 3.00, 3.00], [0.2, 3.77, 3.77], [0.3, 4.32, 4.32], [0.4, 4.75, 4.75],
        [0.5, 5.05, 5.05], [0.6, 5.34, 5.34], [0.7, 5.67, 5.67], [0.8, 5.94, 5.94],
        [0.9, 6.18, 6.18], [1.0, 6.30, 6.30], [1.3, 6.93, 6.93], [1.5, 7.37, 7.37],
        [2.0, 8.00, 8.00], [2.5, 8.80, 8.80], [3.0, 9.24, 9.24]
      ],
      oval: [
        [0.1, 3.97, 2.76], [0.2, 4.79, 3.42], [0.3, 5.47, 3.70], [0.4, 5.77, 4.12],
        [0.5, 6.11, 4.35], [0.6, 6.66, 4.75], [0.7, 6.86, 4.90], [0.8, 7.19, 5.14],
        [0.9, 7.34, 5.24], [1.0, 7.74, 5.53], [1.3, 8.46, 6.06], [1.5, 8.70, 6.22],
        [2.0, 9.88, 7.08], [2.5, 10.48, 7.51], [3.0, 11.23, 8.03]
      ],
      pear: [
        [0.1, 4.12, 2.56], [0.2, 5.28, 3.30], [0.3, 5.82, 3.57], [0.4, 6.37, 3.99],
        [0.5, 7.22, 4.52], [0.6, 7.37, 4.61], [0.7, 7.76, 4.85], [0.8, 8.16, 5.11],
        [0.9, 8.27, 5.16], [1.0, 8.89, 5.51], [1.3, 9.56, 5.99], [1.5, 9.76, 6.07],
        [2.0, 10.11, 6.32], [2.5, 11.72, 7.28], [3.0, 12.78, 7.97]
      ],
      marquise: [
        [0.1, 4.78, 2.33], [0.2, 6.11, 3.06], [0.3, 7.11, 3.46], [0.4, 7.71, 3.81],
        [0.5, 7.97, 3.96], [0.6, 8.47, 4.22], [0.7, 9.16, 4.48], [0.8, 9.39, 4.68],
        [0.9, 9.82, 4.85], [1.0, 10.60, 5.26], [1.3, 10.99, 5.45], [1.5, 11.61, 5.68],
        [2.0, 13.00, 6.50], [2.5, 13.69, 6.84], [3.0, 14.61, 7.39]
      ],
      cushion: [
        [0.1, 2.70, 2.70], [0.2, 3.41, 3.41], [0.3, 3.90, 3.90], [0.4, 4.20, 4.20], [0.5, 4.47, 4.47], [0.6, 4.62, 4.62],
        [0.7, 4.88, 4.88], [0.8, 5.07, 5.07], [0.9, 5.36, 5.34], [1.0, 5.45, 5.45],
        [1.3, 6.11, 6.11], [1.5, 6.24, 6.24], [2.0, 7.03, 7.03], [2.5, 7.43, 7.43],
        [3.0, 8.03, 8.03]
      ],
      emerald: [
        [0.1, 3.07, 2.24], [0.2, 3.87, 2.82], [0.3, 4.18, 3.22], [0.4, 4.60, 3.54], [0.5, 4.92, 3.79],
        [0.6, 5.19, 3.98], [0.7, 5.46, 4.19], [0.8, 5.77, 4.43], [0.9, 5.91, 4.54],
        [1.0, 6.13, 4.73], [1.3, 6.64, 5.10], [1.5, 7.09, 5.44], [2.0, 8.66, 6.68],
        [2.5, 8.91, 6.81], [3.0, 9.19, 7.09]
      ]
    };

    var LABELS = {
      round: "Round brilliant", oval: "Oval", pear: "Pear",
      marquise: "Marquise", cushion: "Cushion", emerald: "Emerald"
    };

    // Linear interpolation between the two bracketing chart entries.
    // Outside the charted range, scale the nearest entry by the cube root of the weight ratio.
    function dimsFor(shape, ct) {
      var t = SIZES[shape], i;
      if (ct <= t[0][0]) {
        var f0 = Math.pow(ct / t[0][0], 1 / 3);
        return [t[0][1] * f0, t[0][2] * f0];
      }
      var last = t[t.length - 1];
      if (ct >= last[0]) {
        var f1 = Math.pow(ct / last[0], 1 / 3);
        return [last[1] * f1, last[2] * f1];
      }
      for (i = 0; i < t.length - 1; i++) {
        if (ct >= t[i][0] && ct <= t[i + 1][0]) {
          var r = (ct - t[i][0]) / (t[i + 1][0] - t[i][0]);
          return [t[i][1] + (t[i + 1][1] - t[i][1]) * r,
                  t[i][2] + (t[i + 1][2] - t[i][2]) * r];
        }
      }
      return [last[1], last[2]];
    }

    var DEFAULT_PX_MM = 96 / 25.4;
    var STORE = "sd-px-per-mm";
    var state = { shape: "round", ct: 1, pxmm: DEFAULT_PX_MM, calibrated: false, enlarged: false };

    try {
      var saved = parseFloat(window.localStorage.getItem(STORE));
      // a screen is realistically 2.5-14 px per mm; anything else is a bad save
      if (saved > 2.5 && saved < 14) { state.pxmm = saved; state.calibrated = true; }
      else { window.localStorage.removeItem(STORE); }
    } catch (e) {}

    var stage     = caratTool.querySelector("[data-carat-stage]");
    var outCt     = caratTool.querySelector("[data-carat-ct]");
    var outLen    = caratTool.querySelector("[data-carat-len]");
    var outWid    = caratTool.querySelector("[data-carat-wid]");
    var range     = caratTool.querySelector("#caratRange");
    var note      = caratTool.querySelector("[data-carat-scale-note]");
    var calPanel  = caratTool.querySelector("[data-carat-calibrate]");
    var card      = caratTool.querySelector("[data-carat-card]");
    var cardRange = caratTool.querySelector("#caratCardRange");

    // The stone alone, on a fixed millimetre canvas so weights stay comparable:
    // a 0.25ct and a 3.00ct are drawn on the same scale, not each fitted to the frame.
    // The canvas is 16 mm square, which clears the largest stone in the chart
    // (a 3.00ct marquise at 14.61 mm long).
    var PLATE = { w: 16, h: 16 };

    function scene(shape, wmm, lmm, pxmm) {
      var sx = PLATE.w / 2 - wmm / 2;
      var sy = PLATE.h / 2 - lmm / 2;
      return '<svg width="' + (PLATE.w * pxmm).toFixed(1) + '" height="' + (PLATE.h * pxmm).toFixed(1) + '" ' +
             'viewBox="0 0 ' + PLATE.w + ' ' + PLATE.h + '" xmlns="http://www.w3.org/2000/svg" role="img" ' +
             'aria-label="A ' + LABELS[shape].toLowerCase() + ' diamond, ' + lmm.toFixed(2) + ' by ' +
             wmm.toFixed(2) + ' millimetres">' +
             // Root-absolute so the tool works wherever it is used — the article
             // sits one level down, the dedicated page at the root.
             '<image href="/images/stone-' + shape + '.webp" x="' + sx.toFixed(3) + '" y="' + sy.toFixed(3) +
             '" width="' + wmm.toFixed(3) + '" height="' + lmm.toFixed(3) +
             '" preserveAspectRatio="xMidYMid meet"/>' +
             '</svg>';
    }

    var APPROX_PX = 320, ENLARGED_PX = 460;

    function currentPxmm() {
      var room = Math.max(200, caratTool.querySelector(".carat-inner").clientWidth);
      if (state.enlarged) return Math.min(ENLARGED_PX, room) / PLATE.w;
      if (state.calibrated) return state.pxmm;
      return Math.min(APPROX_PX, room) / PLATE.w;
    }

    function setMode() {
      var mode = caratTool.querySelector("[data-carat-mode]");
      var note = caratTool.querySelector("[data-carat-note]");
      var enl  = caratTool.querySelector("[data-carat-enlarge]");
      if (state.enlarged) {
        mode.textContent = "Enlarged view";
        note.textContent = "Shown larger than life so the outline is easy to read. Not to scale.";
      } else if (state.calibrated) {
        mode.textContent = "Actual size";
        note.textContent = "Calibrated to this screen, so the stone is shown at its real millimetre size.";
      } else {
        mode.textContent = "Approximate size";
        note.innerHTML = "Sizes are to scale against one another. Calibrate your screen to see the stone at approximately actual size.";
      }
      enl.setAttribute("aria-pressed", String(state.enlarged));
      enl.textContent = state.enlarged ? "Show smaller" : "Show enlarged";
    }

    function render() {
      var d = dimsFor(state.shape, state.ct);
      var lmm = d[0], wmm = d[1];

      outCt.innerHTML  = state.ct.toFixed(2) + '<span>ct</span>';
      outLen.innerHTML = lmm.toFixed(2) + '<span>mm</span>';
      outWid.innerHTML = wmm.toFixed(2) + '<span>mm</span>';
      range.setAttribute("aria-valuetext", state.ct.toFixed(2) + " carat");
      var pct = ((state.ct - 0.25) / (3 - 0.25)) * 100;
      range.style.setProperty("--pct", pct.toFixed(1) + "%");

      stage.innerHTML = scene(state.shape, wmm, lmm, currentPxmm());
    }

    caratTool.querySelectorAll(".carat-shape").forEach(function (b) {
      b.addEventListener("click", function () {
        state.shape = b.getAttribute("data-shape");
        caratTool.querySelectorAll(".carat-shape").forEach(function (o) {
          o.setAttribute("aria-pressed", String(o === b));
        });
        render();
      });
    });

    range.addEventListener("input", function () {
      state.ct = parseFloat(range.value);
      render();
    });

    caratTool.querySelector("[data-carat-calibrate-open]").addEventListener("click", function () {
      calPanel.hidden = !calPanel.hidden;
    });

    caratTool.querySelector("[data-carat-enlarge]").addEventListener("click", function () {
      state.enlarged = !state.enlarged;
      setMode(); render();
    });

    cardRange.addEventListener("input", function () {
      card.style.width = cardRange.value + "px";
    });

    caratTool.querySelector("[data-carat-save]").addEventListener("click", function () {
      state.pxmm = card.getBoundingClientRect().width / 85.6;
      state.calibrated = true;
      try { window.localStorage.setItem(STORE, String(state.pxmm)); } catch (e) {}
      calPanel.hidden = true;
      state.enlarged = false;
      setMode();
      render();
    });

    caratTool.querySelector("[data-carat-reset]").addEventListener("click", function () {
      state.pxmm = DEFAULT_PX_MM;
      state.calibrated = false;
      try { window.localStorage.removeItem(STORE); } catch (e) {}
      setMode();
      render();
    });

    window.addEventListener("resize", render);
    setMode();
    render();
  }

  // Contact form. Submits in the background so the visitor stays on the page
  // and gets a clear answer either way. An enquiry that silently disappears is
  // worse than no form at all, so every failure path says so plainly and shows
  // the email address as a way through.
  var form = document.querySelector(".contact-form");
  if (form) {
    var ADDRESS = "contact@selected-diamonds.fr";

    var setStatus = function (status, text, kind) {
      if (!status) return;
      status.textContent = text;
      status.setAttribute("data-state", kind || "");
    };

    var mailtoFallback = function (status) {
      var val = function (sel) {
        var el = form.querySelector(sel);
        return el ? el.value : "";
      };
      var body = encodeURIComponent(
        "Name: " + val("#firstName") + " " + val("#lastName") + "\n" +
        "Email: " + val("#email") + "\n" +
        "Phone: " + val("#phone") + "\n\n" +
        val("#message")
      );
      window.location.href =
        "mailto:" + ADDRESS + "?subject=Diamond%20sourcing%20inquiry&body=" + body;
      setStatus(status,
        "Opening your email app. If nothing happens, please write to " + ADDRESS + " directly.",
        "warn");
    };

    form.addEventListener("submit", function (e) {
      var status = form.querySelector(".form-status");
      var button = form.querySelector("button[type=submit]");
      var action = form.getAttribute("action") || "";

      e.preventDefault();

      // No endpoint configured yet — hand off to the visitor's mail app.
      if (!action || action.indexOf("YOUR_FORM_ID") !== -1) {
        mailtoFallback(status);
        return;
      }

      if (typeof form.reportValidity === "function" && !form.reportValidity()) return;

      if (button) { button.disabled = true; }
      setStatus(status, "Sending…", "");

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          setStatus(status,
            "Thank you — your message has been sent. I'll reply personally, usually within one working day.",
            "ok");
        } else {
          // The endpoint answered but rejected it: quota reached, unverified, misconfigured.
          setStatus(status,
            "Something went wrong sending that. Please write to " + ADDRESS + " and I'll come straight back to you.",
            "warn");
        }
      }).catch(function () {
        // Offline, blocked, or the service is unreachable.
        mailtoFallback(status);
      }).then(function () {
        if (button) { button.disabled = false; }
      });
    });
  }
});
