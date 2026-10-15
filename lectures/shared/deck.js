/* Minimal slide engine + SVG toolkit. No dependencies.
 *
 * Slides:      <section class="slide" data-part="2"><h2>Title</h2><div class="body">…</div></section>
 * Fragments:   any element with class "step" (optional data-step="n"), revealed one per step.
 * Visuals:     <div class="viz" data-viz="name" data-offset="k"></div>
 *              VIZ[name](host) returns {steps, set(step, instant), start(), stop(), final()} (all optional).
 *              set() receives the slide step minus data-offset (clamped at 0).
 * Print/PDF:   index.html?print shows every slide in its final state (see export_pdf.py).
 */
"use strict";
const NS = "http://www.w3.org/2000/svg";
const DECK_BASE = document.currentScript.src.replace(/[^/]*$/, "");
const VIZ = {};

/* ------------------------------------------------------------------ SVG toolkit */
const V = {
  el(tag, attrs = {}, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) {
      const v = attrs[k];
      if (v === undefined || v === null) continue;
      if (k !== "style" && typeof v === "string" && v.includes("var(")) e.style.setProperty(k, v); else e.setAttribute(k, v);
    }
    if (parent) parent.appendChild(e);
    return e;
  },
  svg(host, w, h) {
    host.innerHTML = "";
    return V.el("svg", { viewBox: `0 0 ${w} ${h}`, width: w, height: h }, host);
  },
  g(p, attrs = {}) { return V.el("g", attrs, p); },
  rect(p, x, y, w, h, cls = "cell", extra = {}) {
    return V.el("rect", Object.assign({ x, y, width: w, height: h, class: cls }, extra), p);
  },
  circle(p, cx, cy, r, extra = {}) { return V.el("circle", Object.assign({ cx, cy, r }, extra), p); },
  path(p, d, cls = "line", extra = {}) { return V.el("path", Object.assign({ d, class: cls }, extra), p); },
  line(p, x1, y1, x2, y2, extra = {}) {
    return V.el("line", Object.assign({ x1, y1, x2, y2, stroke: "var(--ink)", "stroke-width": 2 }, extra), p);
  },
  /* Text with a tiny markup: $…$ = italic math, _x or _{…} = subscript, ^x or ^{…} = superscript,
     **…** = bold. "\n" makes a new line. */
  text(p, x, y, str, o = {}) {
    const size = o.size || 22, lh = o.lh || 1.25;
    const lines = String(str).split("\n");
    const g = V.g(p, { class: o.gcls || null });
    lines.forEach((ln, i) => {
      const t = V.el("text", {
        x, y: y + (i - (lines.length - 1) / 2) * size * lh,
        "font-size": size, "text-anchor": o.anchor || "middle",
        class: o.cls || null, fill: o.fill || null, "font-weight": o.weight || null,
      }, g);
      V._rich(t, ln, size);
    });
    return g;
  },
  _rich(t, s, size) {
    let ital = false, bold = false, i = 0, shift = 0;
    const add = (txt, sh, small) => {
      if (!txt) return;
      const ts = V.el("tspan", {}, t);
      if (ital) { ts.style.fontFamily = "var(--serif)"; ts.style.fontStyle = "italic"; }
      if (bold) ts.setAttribute("font-weight", "700");
      if (small) ts.setAttribute("font-size", size * 0.7);
      const dy = sh - shift;
      if (dy) ts.setAttribute("dy", dy);
      shift = sh;
      ts.textContent = txt;
    };
    let buf = "";
    const flush = () => { add(buf, 0, false); buf = ""; };
    while (i < s.length) {
      const c = s[i];
      if (c === "$") { flush(); ital = !ital; i++; continue; }
      if (c === "*" && s[i + 1] === "*") { flush(); bold = !bold; i += 2; continue; }
      if ((c === "_" || c === "^") && i + 1 < s.length) {
        flush();
        let grp;
        if (s[i + 1] === "{") { const j = s.indexOf("}", i + 2); grp = s.slice(i + 2, j); i = j + 1; }
        else { grp = s[i + 1]; i += 2; }
        add(grp, c === "_" ? size * 0.28 : -size * 0.38, true);
        continue;
      }
      buf += c; i++;
    }
    flush();
    if (shift) { const z = V.el("tspan", { dy: -shift }, t); z.textContent = "​"; }
  },
  /* Box with centred label; a line starting with "~" is rendered smaller and muted. */
  box(p, x, y, w, h, label, cls = "box", o = {}) {
    const g = V.g(p, { class: o.gcls || null });
    V.rect(g, x, y, w, h, cls, { rx: 7 });
    const lines = String(label || "").split("\n");
    const size = o.size || 22;
    const hs = lines.map(l => (l.startsWith("~") ? size * 0.78 : size) * 1.22);
    let cy = y + h / 2 - hs.reduce((a, b) => a + b, 0) / 2;
    lines.forEach((l, i) => {
      const small = l.startsWith("~");
      V.text(g, x + w / 2, cy + hs[i] / 2, small ? l.slice(1) : l,
        { size: small ? size * 0.78 : size, cls: small ? "muted" : null, weight: o.weight && !small ? o.weight : null });
      cy += hs[i];
    });
    return g;
  },
  arrow(p, x1, y1, x2, y2, color = "blue", extra = {}) {
    return V.el("path", Object.assign({
      d: `M${x1},${y1} L${x2},${y2}`, fill: "none",
      stroke: `var(--${color})`, "stroke-width": 3.5, "marker-end": `url(#ah-${color})`,
    }, extra), p);
  },
  curveArrow(p, d, color = "blue", extra = {}) {
    return V.el("path", Object.assign({ d, fill: "none", stroke: `var(--${color})`, "stroke-width": 3.5, "marker-end": `url(#ah-${color})` }, extra), p);
  },
  /* Grid of cells; rows = array of arrays of values (or null for blank). Returns {g, cells}. */
  grid(p, x, y, rows, s, cls = "cell", o = {}) {
    const g = V.g(p);
    const cells = rows.map((row, r) => row.map((v, c) => {
      const rc = V.rect(g, x + c * s, y + r * s, s, s, typeof cls === "function" ? cls(r, c, v) : cls);
      const tx = v === null || v === undefined ? null :
        V.text(g, x + c * s + s / 2, y + r * s + s / 2, String(v), { size: o.size || s * 0.42, weight: o.weight });
      return { rect: rc, text: tx };
    }));
    return { g, cells };
  },
  setText(tg, str) { // replace content of a V.text group (single line)
    const t = tg.querySelector("text"); t.textContent = ""; V._rich(t, String(str), +t.getAttribute("font-size"));
  },
  move(e, x, y) { e.style.transform = `translate(${x}px,${y}px)`; },
  show(e, on) { if (e) e.style.opacity = on ? 1 : 0; },
  pathFn(f, x0, x1, X, Y, n = 80) {
    let d = "";
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; d += (i ? "L" : "M") + X(x).toFixed(1) + "," + Y(f(x)).toFixed(1); }
    return d;
  },
  /* requestAnimationFrame loop that only runs while the slide is active. */
  loop(fn) {
    let id = null, t0 = 0;
    const tick = t => { if (!t0) t0 = t; fn((t - t0) / 1000); id = requestAnimationFrame(tick); };
    return { start() { if (id === null) { t0 = 0; id = requestAnimationFrame(tick); } }, stop() { if (id !== null) cancelAnimationFrame(id); id = null; } };
  },
  noTransition(e, fn) { e.style.transition = "none"; fn(); e.getBoundingClientRect(); e.style.transition = ""; },
};

/* ------------------------------------------------------------------ deck engine */
// Part names: set window.DECK_PARTS = ["", "Part 1 · …", …] in the lecture before deck.js loads.
const PARTS = window.DECK_PARTS || [""];

const Deck = {
  i: 0, step: 0, slides: [],
  init() {
    const stage = document.getElementById("stage");
    this.slides = [...stage.querySelectorAll(".slide")].map((el, idx) => {
      const h2 = el.querySelector(":scope > h2");
      if (h2) {
        const head = document.createElement("header");
        head.innerHTML = `<img class="logo" src="${DECK_BASE}logo-cvut-en.svg" alt="CTU in Prague"><div></div>`;
        const box = head.lastChild; box.appendChild(h2);
        const sub = el.dataset.sub || PARTS[+el.dataset.part || 0];
        if (sub) { const p = document.createElement("p"); p.textContent = sub; box.appendChild(p); }
        el.prepend(head);
      }
      const pn = document.createElement("div"); pn.className = "pageno"; el.appendChild(pn);
      const frags = [...el.querySelectorAll(".step")];
      let auto = 0;
      frags.forEach(f => { f._n = f.dataset.step ? +f.dataset.step : ++auto; });
      const ctrls = [];
      el.querySelectorAll("[data-viz]").forEach(host => {
        const f = VIZ[host.dataset.viz];
        if (!f) { console.warn("missing viz", host.dataset.viz); return; }
        const c = f(host) || {};
        c.offset = +(host.dataset.offset || 0);
        ctrls.push(c);
      });
      const max = Math.max(0, ...frags.map(f => f._n), ...ctrls.map(c => (c.steps || 0) + c.offset));
      return { el, frags, ctrls, max, idx, title: h2 ? h2.textContent : (el.querySelector("h1") || {}).textContent };
    });
    const numbered = this.slides.filter(s => !s.el.classList.contains("title"));
    numbered.forEach((s, k) => { s.no = k + 1; s.el.querySelector(".pageno").textContent = `${k + 1} / ${numbered.length}`; });
    this.total = numbered.length;
    this.buildOverview();
    this.bind();
    this.fit();
    // ?print: every slide in its final state, for PDF export (see export_pdf.py)
    if (/[?&]print\b/.test(location.search)) {
      document.body.classList.add("printing");
      this.slides.forEach(s => { this.apply(s, s.max, true); s.ctrls.forEach(c => { c.stop && c.stop(); c.final && c.final(); }); });
      return;
    }
    const m = location.hash.match(/#\/?(\d+)(?:\/(\d+))?/);
    this.go(m ? Math.min(+m[1], this.slides.length - 1) : 0, m && m[2] ? +m[2] : 0, true);
  },
  fit() {
    const s = Math.min(innerWidth / 1600, innerHeight / 900);
    document.getElementById("stage").style.transform = `scale(${s})`;
  },
  apply(slide, step, instant) {
    slide.frags.forEach(f => f.classList.toggle("shown", f._n <= step));
    slide.ctrls.forEach(c => c.set && c.set(Math.max(0, step - c.offset), instant));
  },
  go(i, step = 0, instant = false) {
    const prev = this.slides[this.i];
    i = Math.max(0, Math.min(this.slides.length - 1, i));
    const s = this.slides[i];
    step = Math.max(0, Math.min(s.max, step));
    if (prev !== s) {
      prev.el.classList.remove("active");
      prev.ctrls.forEach(c => c.stop && c.stop());
      this.apply(s, step, true);
      s.el.classList.add("active");
      s.ctrls.forEach(c => c.start && c.start());
    } else {
      s.el.classList.add("active");
      this.apply(s, step, instant);
      if (instant) s.ctrls.forEach(c => c.start && c.start());
    }
    this.i = i; this.step = step;
    history.replaceState(null, "", `#/${i}${step ? "/" + step : ""}`);
    document.getElementById("footer").textContent = s.no ? `${s.no} / ${this.total}` : "";
    document.getElementById("progress").style.width = `${100 * i / (this.slides.length - 1)}%`;
    const dots = document.getElementById("stepdots");
    dots.innerHTML = s.max ? Array.from({ length: s.max + 1 }, (_, k) => `<i class="${k <= step ? "on" : ""}"></i>`).join("") : "";
    [...document.querySelectorAll("#overview button")].forEach((b, k) => b.classList.toggle("cur", k === i));
  },
  next() { const s = this.slides[this.i]; if (this.step < s.max) this.go(this.i, this.step + 1); else if (this.i < this.slides.length - 1) this.go(this.i + 1, 0); },
  prev() { if (this.step > 0) this.go(this.i, this.step - 1); else if (this.i > 0) this.go(this.i - 1, this.slides[this.i - 1].max); },
  buildOverview() {
    const ov = document.getElementById("overview");
    ov.innerHTML = this.slides.map(s => `<button><small>${s.no ? s.no : "title"}</small>${s.title || ""}</button>`).join("");
    [...ov.children].forEach((b, k) => b.onclick = () => { document.body.classList.remove("overview"); this.go(k, 0); });
  },
  bind() {
    addEventListener("resize", () => this.fit());
    let typed = "";
    addEventListener("keydown", e => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "select" || tag === "textarea") return;
      const k = e.key;
      if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter", "n"].includes(k)) {
        if (k === "Enter" && typed) { this.go(this.slides.findIndex(s => s.no === +typed), 0); typed = ""; e.preventDefault(); return; }
        e.preventDefault(); e.shiftKey ? this.go(this.i + 1, 0) : this.next();
      } else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace", "p"].includes(k)) {
        e.preventDefault(); e.shiftKey ? this.go(this.i - 1, 0) : this.prev();
      } else if (k === "Home") this.go(0, 0);
      else if (k === "End") this.go(this.slides.length - 1, 0);
      else if (k === "f" || k === "F5") { e.preventDefault(); this.fullscreen(); }
      else if (k === "o" || k === "Escape" && document.body.classList.contains("overview")) document.body.classList.toggle("overview");
      else if (k === "h" || k === "?") document.body.classList.toggle("help");
      else if (k === "r") this.go(this.i, 0, true);
      else if (/^\d$/.test(k)) { typed += k; clearTimeout(this._t); this._t = setTimeout(() => typed = "", 1500); }
    });
    document.getElementById("stage").addEventListener("click", e => {
      if (e.target.closest("input,button,label,select,.ctrls,.interactive")) return;
      if (e.clientX < innerWidth * 0.2) this.prev(); else this.next();
    });
    let tx = null;
    addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
    addEventListener("touchend", e => {
      if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 50) dx < 0 ? this.next() : this.prev();
    });
    document.addEventListener("change", e => { if (e.target.matches("input[type=range]")) e.target.blur(); });
    // Printing from the browser: every slide in its final state.
    addEventListener("beforeprint", () => this.slides.forEach(s => { s.ctrls.forEach(c => c.stop && c.stop()); this.apply(s, s.max, true); s.ctrls.forEach(c => c.final && c.final()); }));
    addEventListener("afterprint", () => { this.slides.forEach(s => this.apply(s, 0, true)); this.go(this.i, this.step, true); });
  },
  fullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.();
  },
};
addEventListener("DOMContentLoaded", () => Deck.init());
