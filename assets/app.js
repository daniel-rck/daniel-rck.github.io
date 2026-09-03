/* Orbital star map.
   Reads window.PROJECTS (curated) and window.LIVE (generated from each
   repository's About > Website field) and renders them as nodes on three
   orbits, with a detail panel that sits in its own reserved column so it
   never covers a node. */
(function () {
  "use strict";

  var CATS = ["labs", "tools", "apps"];
  var RING = { labs: 0.44, tools: 0.70, apps: 0.96 };
  var SQUASH = 0.8;           // orbit tilt; recomputed per viewport in measure()
  var LABEL_ROOM = 200;       // horizontal room a node label may need
  var MIN_MAP_WIDTH = 1280;   // below this the page falls back to a list

  var T = {
    en: {
      tagline: "Projects in orbit", hub: "Projects",
      labs: "amigo-labs", tools: "Dev Tools", apps: "Everyday Apps",
      repo: "Repo", live: "Live", soon: "No live app",
      langgroup: "Language", detaillabel: "Selected project",
      title: "Daniel Rck · Projects"
    },
    de: {
      tagline: "Projekte im Orbit", hub: "Projekte",
      labs: "amigo-labs", tools: "Dev-Tools", apps: "Alltags-Apps",
      repo: "Repo", live: "Live", soon: "Keine Live-App",
      langgroup: "Sprache", detaillabel: "Ausgewähltes Projekt",
      title: "Daniel Rck · Projekte"
    }
  };

  var P = (window.PROJECTS || []).map(function (p) {
    var copy = {};
    for (var k in p) copy[k] = p[k];
    copy.live = (window.LIVE || {})[p.id] || null;
    return copy;
  });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lang = "en";
  var sel = 0;
  var paused = false;

  function t(k) { return T[lang][k]; }

  /* ------------------------------------------------------------------ *
   * layout
   * ------------------------------------------------------------------ */
  var view = { cx: 0, cy: 0, R: 200, map: true };

  function measure() {
    var W = window.innerWidth, H = window.innerHeight;
    view.map = W >= MIN_MAP_WIDTH;
    if (!view.map) return;

    var cs = getComputedStyle(document.documentElement);
    var panelW = parseInt(cs.getPropertyValue("--panel-w"), 10) || 340;
    var panelRight = parseInt(cs.getPropertyValue("--panel-right"), 10) || 24;

    var padL = 28;
    var padR = panelRight + panelW + 28;   // the panel's reserved column
    var padT = 118;                        // clears the header
    var padB = 56;                         // clears the footer

    var availW = Math.max(240, W - padL - padR);
    var availH = Math.max(240, H - padT - padB);

    view.cx = padL + availW / 2;
    view.cy = padT + availH / 2;

    // Width is the binding constraint (labels stick out sideways), so the
    // radius comes from it and the tilt then opens up to use the height.
    var outer = RING.apps;
    var R = Math.max(120, (availW / 2 - LABEL_ROOM) / outer);
    var fits = (availH / 2 - 30) / (R * outer);
    if (fits < 0.55) {
      R = Math.max(120, (availH / 2 - 30) / (0.55 * outer));
      SQUASH = 0.55;
    } else {
      SQUASH = Math.min(0.9, fits);
    }
    view.R = R;
  }

  /* ------------------------------------------------------------------ *
   * canvas: stars, orbits, spokes
   * ------------------------------------------------------------------ */
  var cv = document.getElementById("sky");
  var cx2 = cv.getContext("2d");
  var W = 0, H = 0, stars = [];
  var pointer = { x: 0, y: 0 };

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    cx2.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = [];
    var n = Math.round(W * H / 5200);
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.25 + 0.25,
        a: Math.random() * 0.65 + 0.15,
        z: Math.random() * 0.6 + 0.25
      });
    }
  }

  var RING_STROKE = {
    labs: "rgba(167,139,250,.20)",
    tools: "rgba(103,232,249,.18)",
    apps: "rgba(251,191,36,.15)"
  };

  function draw() {
    cx2.clearRect(0, 0, W, H);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      cx2.globalAlpha = s.a;
      cx2.fillStyle = "#dbe6ff";
      cx2.beginPath();
      cx2.arc(s.x - pointer.x * 26 * s.z, s.y - pointer.y * 26 * s.z, s.r, 0, 6.2832);
      cx2.fill();
    }
    cx2.globalAlpha = 1;

    if (!view.map) return;

    for (var c = 0; c < CATS.length; c++) {
      var cat = CATS[c];
      cx2.beginPath();
      cx2.ellipse(view.cx, view.cy, view.R * RING[cat], view.R * RING[cat] * SQUASH, 0, 0, 6.2832);
      cx2.strokeStyle = RING_STROKE[cat];
      cx2.lineWidth = 1;
      cx2.setLineDash([3, 7]);
      cx2.stroke();
      cx2.setLineDash([]);
    }

    for (var k = 0; k < pos.length; k++) {
      if (!pos[k]) continue;
      cx2.beginPath();
      cx2.moveTo(view.cx, view.cy);
      cx2.lineTo(pos[k].x, pos[k].y);
      cx2.strokeStyle = (k === sel) ? "rgba(167,139,250,.55)" : "rgba(167,139,250,.13)";
      cx2.lineWidth = (k === sel) ? 1.5 : 1;
      cx2.stroke();
    }

    var g = cx2.createRadialGradient(view.cx, view.cy, 0, view.cx, view.cy, 120);
    g.addColorStop(0, "rgba(167,139,250,.30)");
    g.addColorStop(1, "rgba(167,139,250,0)");
    cx2.fillStyle = g;
    cx2.beginPath();
    cx2.arc(view.cx, view.cy, 120, 0, 6.2832);
    cx2.fill();
  }

  /* ------------------------------------------------------------------ *
   * orbital nodes — real buttons, so they are reachable by keyboard
   * ------------------------------------------------------------------ */
  var layer = document.getElementById("layer");
  var nodes = [], pos = [];

  function buildNodes() {
    layer.innerHTML = "";
    nodes = []; pos = [];
    P.forEach(function (p, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "node";
      b.setAttribute("data-cat", p.category);
      b.innerHTML =
        '<span class="dot"></span>' +
        '<span class="glyph" aria-hidden="true"></span>' +
        '<span class="label"></span>';
      b.querySelector(".glyph").textContent = p.emoji;
      b.querySelector(".label").textContent = p.name;
      b.addEventListener("click", function () { select(i); });
      b.addEventListener("mouseenter", function () { paused = true; select(i); });
      b.addEventListener("mouseleave", function () { paused = false; });
      b.addEventListener("focus", function () { paused = true; select(i); });
      b.addEventListener("blur", function () { paused = false; });
      layer.appendChild(b);
      nodes.push(b);
      pos.push(null);
    });
  }

  var BASE = [-1.35, 0.4, -0.28];

  /* Labels stick out sideways, so two nodes on different orbits can end up
     printed on top of each other. Push any overlapping pair apart vertically
     and ease into the correction so it never reads as a jitter. */
  var nudge = [], nudgeTarget = [], widths = [];
  var NODE_H = 32;                                   // measured, not guessed

  function measureNodes() {
    widths = nodes.map(function (n) { return n.offsetWidth || 140; });
    if (nodes.length && nodes[0].offsetHeight) NODE_H = nodes[0].offsetHeight + 5;
  }

  function separate() {
    var n = pos.length, i, j;
    for (i = 0; i < n; i++) nudgeTarget[i] = 0;

    for (var pass = 0; pass < 8; pass++) {
      for (i = 0; i < n; i++) {
        if (!pos[i]) continue;
        for (j = i + 1; j < n; j++) {
          if (!pos[j]) continue;
          var ai = pos[i].flip ? pos[i].x - widths[i] : pos[i].x;
          var bi = ai + widths[i];
          var aj = pos[j].flip ? pos[j].x - widths[j] : pos[j].x;
          var bj = aj + widths[j];
          if (bi < aj || bj < ai) continue;                    // no horizontal overlap

          var yi = pos[i].y + nudgeTarget[i];
          var yj = pos[j].y + nudgeTarget[j];
          var gap = Math.abs(yi - yj);
          if (gap >= NODE_H) continue;

          var push = (NODE_H - gap) / 2 + 1;
          if (yi <= yj) { nudgeTarget[i] -= push; nudgeTarget[j] += push; }
          else          { nudgeTarget[i] += push; nudgeTarget[j] -= push; }
        }
      }
    }

    for (i = 0; i < n; i++) {
      if (nudge[i] === undefined) nudge[i] = 0;
      nudge[i] += (nudgeTarget[i] - nudge[i]) * 0.25;          // ease, don't snap
      if (Math.abs(nudge[i]) < 0.05) nudge[i] = 0;
    }
  }

  function place(clock) {
    if (!view.map) return;
    CATS.forEach(function (cat, ci) {
      var idx = [];
      P.forEach(function (p, i) { if (p.category === cat) idx.push(i); });
      var speed = reduce ? 0 : (ci === 1 ? -1 : 1) * (0.000035 / (1 + ci * 0.55));
      idx.forEach(function (i, k) {
        var ang = BASE[ci] + (k / idx.length) * 6.2832 + clock * speed;
        var r = view.R * RING[cat];
        var x = view.cx + Math.cos(ang) * r;
        var y = view.cy + Math.sin(ang) * r * SQUASH;
        var flip = Math.cos(ang) < 0;
        pos[i] = { x: x, y: y, flip: flip };
        nodes[i].classList.toggle("flip", flip);
      });
    });

    separate();

    for (var i = 0; i < nodes.length; i++) {
      var q = pos[i];
      if (!q) continue;
      nodes[i].style.transform =
        "translate(" + q.x.toFixed(1) + "px," + (q.y + nudge[i]).toFixed(1) + "px) " +
        "translate(" + (q.flip ? "-100%" : "0") + ",-50%)";
    }
    var hub = document.getElementById("hub");
    hub.style.transform =
      "translate(" + view.cx.toFixed(1) + "px," + view.cy.toFixed(1) + "px) translate(-50%,-50%)";
  }

  var clock = 0, last = 0;
  function frame(ts) {
    if (!last) last = ts;
    if (!paused) clock += ts - last;
    last = ts;
    place(clock);
    draw();
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------ *
   * detail panel
   * ------------------------------------------------------------------ */
  var detail = document.getElementById("detail");

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function select(i) {
    sel = i;
    var p = P[i];

    detail.innerHTML = "";
    detail.appendChild(el("div", "kicker", t(p.category)));

    var h = el("h2");
    var glyph = el("span", null, p.emoji);
    glyph.setAttribute("aria-hidden", "true");
    h.appendChild(glyph);
    h.appendChild(document.createTextNode(p.name));
    detail.appendChild(h);

    detail.appendChild(el("p", null, p.desc[lang]));

    if (p.tech && p.tech.length) {
      var chips = el("div", "chips");
      p.tech.forEach(function (x) { chips.appendChild(el("span", null, x)); });
      detail.appendChild(chips);
    }

    var acts = el("div", "acts");
    var repo = el("a", null, t("repo"));
    repo.href = p.repo; repo.target = "_blank"; repo.rel = "noopener";
    acts.appendChild(repo);
    if (p.live) {
      var live = el("a", null, t("live"));
      live.href = p.live; live.target = "_blank"; live.rel = "noopener";
      acts.appendChild(live);
    } else {
      var none = el("span", null, t("soon"));
      none.setAttribute("aria-disabled", "true");
      acts.appendChild(none);
    }
    detail.appendChild(acts);

    var legend = el("div", "legend");
    [["labs", "#a78bfa"], ["tools", "#67e8f9"], ["apps", "#fbbf24"]].forEach(function (pair) {
      var s = el("span");
      var dot = el("i");
      dot.style.background = pair[1];
      s.appendChild(dot);
      s.appendChild(document.createTextNode(t(pair[0])));
      legend.appendChild(s);
    });
    detail.appendChild(legend);

    nodes.forEach(function (n, k) { n.setAttribute("aria-current", String(k === i)); });
    Array.prototype.forEach.call(
      document.querySelectorAll(".listing button"),
      function (b) { b.setAttribute("aria-current", String(+b.dataset.i === i)); }
    );
  }

  /* ------------------------------------------------------------------ *
   * stacked list (narrow viewports)
   * ------------------------------------------------------------------ */
  function buildList() {
    var host = document.getElementById("listing");
    host.innerHTML = "";
    CATS.forEach(function (cat) {
      var section = document.createElement("section");
      section.appendChild(el("h2", null, t(cat)));
      P.forEach(function (p, i) {
        if (p.category !== cat) return;
        var b = document.createElement("button");
        b.type = "button";
        b.dataset.i = i;
        b.setAttribute("data-cat", p.category);
        b.appendChild(el("span", "dot"));
        var glyph = el("span", null, p.emoji);
        glyph.setAttribute("aria-hidden", "true");
        b.appendChild(glyph);
        b.appendChild(el("span", null, p.name));
        b.addEventListener("click", function () {
          select(i);
          detail.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        });
        section.appendChild(b);
      });
      host.appendChild(section);
    });
  }

  /* ------------------------------------------------------------------ *
   * language
   * ------------------------------------------------------------------ */
  function setLang(l) {
    lang = l;
    try { localStorage.setItem("lang", l); } catch (e) { /* private mode */ }
    document.documentElement.lang = l;
    document.title = t("title");

    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function (n) {
      n.textContent = t(n.dataset.i18n);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n-label]"), function (n) {
      n.setAttribute("aria-label", t(n.dataset.i18nLabel));
    });
    Array.prototype.forEach.call(document.querySelectorAll(".lang button"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === l));
    });

    buildList();
    select(sel);
    measureNodes();
  }

  Array.prototype.forEach.call(document.querySelectorAll(".lang button"), function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); });
  });

  /* ------------------------------------------------------------------ *
   * boot
   * ------------------------------------------------------------------ */
  document.getElementById("hubnum").textContent = P.length;

  if (!reduce) {
    window.addEventListener("pointermove", function (e) {
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
  }
  detail.addEventListener("mouseenter", function () { paused = true; });
  detail.addEventListener("mouseleave", function () { paused = false; });

  window.addEventListener("resize", function () { sizeCanvas(); measure(); measureNodes(); });

  sizeCanvas();
  measure();
  buildNodes();
  measureNodes();

  var start = "en";
  try {
    var stored = localStorage.getItem("lang");
    if (stored === "de" || stored === "en") start = stored;
  } catch (e) { /* private mode */ }
  setLang(start);

  place(0);
  draw();
  requestAnimationFrame(frame);
})();
