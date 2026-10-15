/* Lecture 2 — visuals for Part 3 (heads) and Part 4 (detection). */
"use strict";

const iou = (a, b) => {
  const iw = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])), ih = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const I = iw * ih, U = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - I;
  return U ? I / U : 0;
};
const tag = (p, x, y, text, color = "blue", size = 30) => {
  const g = V.g(p);
  const w = text.length * size * .56 + 16;
  V.rect(g, x, y - size * 1.25, w, size * 1.25, "", { style: `fill:var(--${color})` });
  V.text(g, x + 8, y - size * .62, text, { size, anchor: "start", fill: "#fff", weight: 700 });
  return g;
};

/* ------------------------------------------------------------ Part 3 */
VIZ.clsHead = host => {
  const svg = V.svg(host, 1400, 420);
  const f = tb(svg, 20, 200, 120, 60, "blue", "backbone output", "2048 × 7 × 7");
  const steps = [];
  const add = (x, w, h, col, n, sh, op) => {
    const g = fadeIn(V.g(svg));
    V.text(g, x - 40, 175, op, { size: 18, cls: "muted" }); V.arrow(g, x - 75, 200, x - 8, 200);
    V.rect(g, x, 200 - h / 2, w, h, "", { style: `fill:var(--${col}-soft);stroke:var(--${col});stroke-width:2` });
    V.text(g, x + w / 2, 395, n, { size: 20, weight: 700 }); V.text(g, x + w / 2, 422, sh, { size: 18, cls: "muted" });
    steps.push(g);
  };
  add(330, 26, 260, "orange", "feature vector", "2048", "GAP");
  add(520, 26, 260, "orange", "dropout (train only)", "2048", "");
  add(760, 26, 150, "green", "logits", "1000", "linear");
  add(990, 26, 150, "green", "probabilities", "1000, sum = 1", "softmax");
  const p = fadeIn(V.text(svg, 1230, 200, "weights:\n2048 · 1000 + 1000\n≈ 2.05 M", { size: 20 }));
  steps.push(p);
  return { steps: 5, set(s) { steps.forEach((g, i) => V.show(g, i < s)); } };
};

VIZ.gapFlatten = host => {
  const svg = V.svg(host, 1400, 430);
  const row = (y, name, vec, params, col) => {
    const g = fadeIn(V.g(svg));
    V.text(g, 30, y, name, { size: 22, weight: 700, anchor: "start" });
    V.box(g, 230, y - 35, 270, 70, vec, "box", { size: 20 }); V.arrow(g, 505, y, 570, y);
    V.box(g, 580, y - 35, 230, 70, "linear → 1000", "box", { size: 20 });
    V.text(g, 840, y, params, { size: 22, weight: 700, anchor: "start", fill: `var(--${col})` });
    return g;
  };
  const a = row(80, "flatten", "7·7·2048 = 100 352", "100.4 M weights", "red");
  const b = row(200, "GAP", "2048", "2.05 M weights", "green");
  const c = fadeIn(V.g(svg));
  V.text(c, 700, 300, "now feed a 448 × 448 image: the last map becomes 2048 × 14 × 14", { size: 21, weight: 700 });
  V.text(c, 700, 350, "flatten → 401 408 values ≠ 100 352: the linear layer no longer fits", { size: 21, fill: "var(--red)" });
  V.text(c, 700, 395, "GAP → still 2048 values: the same head works at any resolution", { size: 21, fill: "var(--green)" });
  return { steps: 2, set(s) { V.show(a, true); V.show(b, s >= 1); V.show(c, s >= 2); } };
};

VIZ.otherHeads = flow({
  w: 1400, h: 330, nodes: [
    { id: "f", x: 0, y: 120, w: 220, h: 90, label: "feature vector\n~after GAP", cls: "blue" },
    { id: "a", x: 360, y: 10, w: 340, h: 90, label: "linear → **softmax**\n~exactly one class" },
    { id: "b", x: 360, y: 120, w: 340, h: 90, label: "linear → **sigmoid** per output\n~independent labels", step: 1 },
    { id: "c", x: 360, y: 230, w: 340, h: 90, label: "linear, **no activation**\n~a measured value", step: 2 },
    { id: "la", x: 820, y: 10, w: 540, h: 90, label: "cat / dog / bird · cross-entropy", cls: "mut" },
    { id: "lb", x: 820, y: 120, w: 540, h: 90, label: "scratch? dent? stain? · binary cross-entropy each", cls: "mut", step: 1 },
    { id: "lc", x: 820, y: 230, w: 540, h: 90, label: "count, width in mm · MSE or Huber", cls: "mut", step: 2 }],
  edges: [{ a: "f", b: "a" }, { a: "f", b: "b", step: 1 }, { a: "f", b: "c", step: 2 }, { a: "a", b: "la" }, { a: "b", b: "lb", step: 1 }, { a: "c", b: "lc", step: 2 }],
});

VIZ.siamese = host => {
  const svg = V.svg(host, 1400, 430);
  photo(svg, "cat-tabby.jpg", 20, 20, 150, 180, "0 20 410 492"); photo(svg, "cat-grass.jpg", 20, 230, 150, 180);
  [110, 320].forEach(y => { V.arrow(svg, 175, y, 250, y); V.box(svg, 260, y - 50, 230, 100, "backbone", "box blue"); V.arrow(svg, 495, y, 570, y); });
  const sh = fadeIn(V.g(svg));
  V.path(sh, "M375,165 L375,265", "line", { "stroke-dasharray": "6 5", style: "stroke:var(--blue);stroke-width:3" });
  V.box(sh, 300, 190, 150, 50, "same weights", "box", { size: 18 });
  const vec = (y, vals, c) => vals.forEach((v, i) => V.rect(svg, 580 + i * 26, y - 40 + (1 - v) * 40, 22, 40 * v + 4, "", { style: `fill:var(--${c})` }));
  vec(110, [.8, .3, .6, .9, .2, .5, .7, .4], "blue"); vec(320, [.7, .35, .55, .85, .25, .45, .75, .3], "blue");
  V.text(svg, 685, 160, "embedding $**e**$_1 (e.g. 128-D)", { size: 18, cls: "muted" }); V.text(svg, 685, 370, "embedding $**e**$_2", { size: 18, cls: "muted" });
  const d = fadeIn(V.g(svg));
  V.arrow(d, 800, 110, 905, 200); V.arrow(d, 800, 320, 905, 230);
  V.box(d, 910, 170, 230, 90, "distance\n‖$**e**$_1 − $**e**$_2‖", "box good");
  V.text(d, 1270, 215, "small → same\nlarge → different", { size: 21 });
  return { steps: 2, set(s) { V.show(sh, s >= 1); V.show(d, s >= 2); } };
};

VIZ.embedSpace = host => {
  const svg = V.svg(host, 1400, 440);
  V.rect(svg, 60, 20, 640, 400, "cell", { rx: 8 });
  const cols = ["blue", "orange", "green"], centers = [[200, 120], [560, 150], [360, 330]];
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const pts = [];
  cols.forEach((c, k) => range(9).forEach(() => {
    const r = [90 + rnd() * 560, 50 + rnd() * 340], t = [centers[k][0] + (rnd() - .5) * 110, centers[k][1] + (rnd() - .5) * 90];
    const e = V.circle(svg, 0, 0, 10, { style: `fill:var(--${c})` }); e.classList.add("g-anim"); pts.push({ e, r, t, k });
  }));
  const q = fadeIn(V.g(svg)), qp = [250, 160];
  const nn = pts.filter(p => p.k === 0).map(p => [Math.hypot(p.t[0] - qp[0], p.t[1] - qp[1]), p]).sort((a, b) => a[0] - b[0]).slice(0, 3);
  nn.forEach(([, p]) => V.line(q, qp[0], qp[1], p.t[0], p.t[1], { style: "stroke:var(--ink)", "stroke-dasharray": "5 4" }));
  V.circle(q, qp[0], qp[1], 13, { style: "fill:#fff;stroke:var(--ink);stroke-width:4" });
  V.text(q, qp[0] + 70, qp[1] - 30, "query", { size: 19, weight: 700 });
  const an = fadeIn(V.g(svg));
  V.circle(an, 640, 380, 13, { style: "fill:var(--red);stroke:#fff;stroke-width:3" });
  V.circle(an, 640, 380, 34, { style: "fill:none;stroke:var(--red);stroke-width:3", "stroke-dasharray": "6 5" });
  V.text(an, 560, 380, "far from all\nknown samples", { size: 18, fill: "var(--red)", weight: 700, anchor: "end" });
  const txt = V.g(svg);
  const T = ["before training: random positions", "after training: same class → close together", "retrieval: nearest neighbours of a query", "anomaly detection: distance to normal samples"];
  const lbl = V.text(svg, 1050, 60, "", { size: 22, weight: 700 });
  V.text(svg, 1050, 200, "triplet loss (anchor $a$, positive $p$, negative $n$):\nmax(0, $d$($a$,$p$) − $d$($a$,$n$) + margin)", { size: 21 });
  V.text(svg, 1050, 320, "uses: retrieval, clustering,\nre-identification, few-shot,\nanomaly detection", { size: 20, cls: "muted" });
  return {
    steps: 3, set(s) {
      pts.forEach(p => V.move(p.e, ...(s >= 1 ? p.t : p.r)));
      V.show(q, s >= 2); V.show(an, s >= 3); V.setText(lbl, T[s]);
    }
  };
};

/* ------------------------------------------------------------ Part 4 */
VIZ.detOut = host => {
  const svg = V.svg(host, 1400, 440);
  const ph = photo(svg, "cats-crowd.jpg", 20, 10, 560, 420, "40 380 980 735");
  const groups = [["A", "B", "C"], ["D", "E", "F", "G"], ["K", "L", "M"]].map(ks => {
    const g = fadeIn(V.g(ph));
    ks.forEach(k => { boxR(g, CATS[k], "blue", 3); tag(g, CATS[k][0], CATS[k][1] + 28, (.97 - "ABCDEFGKLM".indexOf(k) * .04).toFixed(2), "blue", 22); });
    return g;
  });
  V.text(svg, 960, 25, "the output is a list whose length $N$ varies", { size: 22, weight: 700 });
  ["class", "score", "x₁", "y₁", "x₂", "y₂"].forEach((h, j) => V.text(svg, 680 + j * 110, 70, h, { size: 19, weight: 700, cls: "muted" }));
  const order = ["A", "B", "C", "D", "E", "F", "G", "K", "L", "M"];   // sorted by score
  const rows = order.map((k, i) => {
    const g = fadeIn(V.g(svg)), b = CATS[k];
    ["cat", (.97 - "ABCDEFGKLM".indexOf(k) * .04).toFixed(2), ...b].forEach((v, j) => V.text(g, 680 + j * 110, 102 + i * 31, v, { size: 18 }));
    return g;
  });
  const cnt = V.text(svg, 960, 420, "", { size: 21, fill: "var(--blue)", weight: 700 });
  return {
    steps: 3, set(s) {
      groups.forEach((g, i) => V.show(g, i < s));
      const n = [0, 3, 7, 10][s]; rows.forEach((r, i) => V.show(r, i < n));
      V.setText(cnt, `$N$ = ${n}: each object = class + score + 4 box numbers`);
    }
  };
};

VIZ.boxFormats = host => {
  const svg = V.svg(host, 1400, 440);
  const ph = photo(svg, "cat-tabby.jpg", 60, 10, 320, 420, "0 0 410 541");
  const B = [95, 45, 345, 410];
  boxR(ph, B, "blue", 3);
  const c1 = fadeIn(V.g(ph));
  [[B[0], B[1]], [B[2], B[3]]].forEach(([x, y]) => V.circle(c1, x, y, 9, { style: "fill:var(--orange)" }));
  const c2 = fadeIn(V.g(ph));
  V.circle(c2, 220, 227.5, 9, { style: "fill:var(--magenta)" });
  V.el("path", { d: "M95,440 L345,440", stroke: "var(--magenta)", "stroke-width": 3, "marker-end": "url(#ah-magenta)", "vector-effect": "non-scaling-stroke" }, c2);
  V.el("path", { d: "M370,45 L370,410", stroke: "var(--magenta)", "stroke-width": 3, "marker-end": "url(#ah-magenta)", "vector-effect": "non-scaling-stroke" }, c2);
  const t1 = fadeIn(V.g(svg)), t2 = fadeIn(V.g(svg));
  V.text(t1, 900, 90, "corners", { size: 24, weight: 700, fill: "var(--orange)" });
  V.text(t1, 900, 140, "($x$_1, $y$_1, $x$_2, $y$_2) = (95, 45, 345, 410)", { size: 23 });
  V.text(t2, 900, 230, "centre + size", { size: 24, weight: 700, fill: "var(--magenta)" });
  V.text(t2, 900, 280, "($c$_x, $c$_y, $w$, $h$) = (220, 227.5, 250, 365)", { size: 23 });
  V.text(t2, 900, 360, "same box, different numbers: always check the format\nand whether coordinates are in pixels or normalized to 0–1", { size: 19, cls: "muted" });
  return { steps: 2, set(s) { V.show(c1, s >= 1); V.show(t1, s >= 1); V.show(c2, s >= 2); V.show(t2, s >= 2); } };
};

VIZ.iouViz = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 340);
  const G = [300, 60, 560, 300];
  const inter = V.rect(svg, 0, 0, 0, 0, "", { style: "fill:var(--magenta);fill-opacity:.35" });
  V.rect(svg, G[0], G[1], G[2] - G[0], G[3] - G[1], "", { style: "fill:var(--green);fill-opacity:.1;stroke:var(--green);stroke-width:4" });
  V.text(svg, G[0] + 10, G[1] - 16, "ground truth", { size: 19, fill: "var(--green)", weight: 700, anchor: "start" });
  const P = V.rect(svg, 0, 0, 0, 0, "", { style: "fill:var(--blue);fill-opacity:.08;stroke:var(--blue);stroke-width:4" });
  const pl = V.text(svg, 0, 0, "prediction", { size: 19, fill: "var(--blue)", weight: 700, anchor: "start" });
  const val = V.text(svg, 1110, 120, "", { size: 40, weight: 700 });
  const verdict = V.text(svg, 1110, 190, "", { size: 22, weight: 700 });
  V.text(svg, 1110, 270, "IoU = area(∩) / area(∪)\nmatch if IoU ≥ 0.5 (a common choice)", { size: 20, cls: "muted" });
  const upd = v => {
    const s = v.s, w = (G[2] - G[0]) * s, h = (G[3] - G[1]) * s, cx = (G[0] + G[2]) / 2 + v.dx, cy = (G[1] + G[3]) / 2;
    const Pb = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
    [["x", Pb[0]], ["y", Pb[1]], ["width", w], ["height", h]].forEach(([k, x]) => P.setAttribute(k, x));
    const t = pl.querySelector("text"); t.setAttribute("x", Pb[0] + 10); t.setAttribute("y", Pb[3] + 20);
    const ix = [Math.max(G[0], Pb[0]), Math.max(G[1], Pb[1]), Math.min(G[2], Pb[2]), Math.min(G[3], Pb[3])];
    [["x", ix[0]], ["y", ix[1]], ["width", Math.max(0, ix[2] - ix[0])], ["height", Math.max(0, ix[3] - ix[1])]].forEach(([k, x]) => inter.setAttribute(k, x));
    const u = iou(G, Pb); V.setText(val, `IoU = ${u.toFixed(2)}`);
    V.setText(verdict, u >= .5 ? "counts as a correct detection" : "counts as a miss + false positive");
    verdict.querySelector("text").style.fill = u >= .5 ? "var(--green)" : "var(--red)";
  };
  const sl = sliders(host, [{ k: "dx", label: "shift", min: -300, max: 300, step: 5, v: 70 }, { k: "s", label: "scale", min: .4, max: 1.6, step: .05, v: 1 }], upd);
  upd(sl.vals);
  return {};
};

VIZ.detFamilies = flow({
  w: 1400, h: 330, nodes: [
    { id: "a1", x: 0, y: 40, w: 150, h: 80, label: "image" }, { id: "a2", x: 210, y: 40, w: 190, h: 80, label: "backbone", cls: "blue" },
    { id: "a3", x: 460, y: 40, w: 260, h: 80, label: "1. propose regions\n~≈ 300–2000 RoIs" }, { id: "a4", x: 780, y: 40, w: 300, h: 80, label: "2. classify + refine\n~each RoI separately" },
    { id: "b1", x: 0, y: 210, w: 150, h: 80, label: "image", step: 1 }, { id: "b2", x: 210, y: 210, w: 190, h: 80, label: "backbone + neck", cls: "blue", step: 1 },
    { id: "b3", x: 460, y: 210, w: 620, h: 80, label: "dense head: class + box at every location, in one pass", step: 1 },
    { id: "b4", x: 1140, y: 210, w: 240, h: 80, label: "filter + NMS", cls: "good", step: 1 }],
  edges: [{ a: "a1", b: "a2" }, { a: "a2", b: "a3" }, { a: "a3", b: "a4" }, { a: "b1", b: "b2", step: 1 }, { a: "b2", b: "b3", step: 1 }, { a: "b3", b: "b4", step: 1 }],
  texts: [{ x: 1240, y: 70, t: "TWO-STAGE\n~accurate,\nslower", cls: "", weight: 700, size: 20 }, { x: 700, y: 175, t: "ONE-STAGE: fast, simple to deploy (YOLO, SSD, RetinaNet)", weight: 700, size: 20, cls: "", step: 1 },
  { x: 560, y: 15, t: "Faster R-CNN, Mask R-CNN", size: 18 }],
});

VIZ.rcnn = host => {
  const svg = V.svg(host, 1400, 450);
  const rows = [
    ["R-CNN (2014)", [["selective search\n~2000 regions", "mut"], ["crop + resize\n~each region", ""], ["CNN × 2000", "bad"], ["SVM + box regressor", ""]], "≈ 50 s / image"],
    ["Fast R-CNN (2015)", [["CNN once\n~on the whole image", "blue"], ["selective search\n~(still external)", "mut"], ["RoI pooling\n~on the feature map", ""], ["joint heads", "good"]], "≈ 2 s / image"],
    ["Faster R-CNN (2015)", [["CNN once", "blue"], ["RPN\n~learned proposals", "good"], ["RoI pooling", ""], ["joint heads", "good"]], "≈ 0.2 s / image"]];
  const G = rows.map(([n, bx, t], r) => {
    const g = fadeIn(V.g(svg)), y = 20 + r * 145;
    V.text(g, 0, y + 45, n, { size: 21, weight: 700, anchor: "start" });
    bx.forEach(([l, c], i) => { V.box(g, 230 + i * 235, y, 210, 90, l, "box " + c, { size: 18 }); if (i) V.arrow(g, 230 + i * 235 - 22, y + 45, 230 + i * 235 - 4, y + 45); });
    V.text(g, 1330, y + 45, t, { size: 19, weight: 700, fill: "var(--blue)" });
    return g;
  });
  V.text(svg, 1330, 440, "times: original papers, GPU", { size: 15, cls: "muted" });
  return { steps: 2, set(s) { G.forEach((g, i) => { V.show(g, i <= s); }); } };
};

VIZ.rpn = host => {
  const svg = V.svg(host, 1400, 440);
  const ph = photo(svg, "cats-crowd.jpg", 20, 10, 420, 420, "300 400 600 600");
  const gr = V.g(ph);
  for (let k = 0; k <= 600; k += 50) { V.line(gr, 300 + k, 400, 300 + k, 1000, { style: "stroke:#fff", "stroke-width": 1, opacity: .5, "vector-effect": "non-scaling-stroke" }); V.line(gr, 300, 400 + k, 900, 400 + k, { style: "stroke:#fff", "stroke-width": 1, opacity: .5, "vector-effect": "non-scaling-stroke" }); }
  const an = V.g(ph);
  const draw = (cx, cy) => {
    an.innerHTML = "";
    V.rect(an, cx - 25, cy - 25, 50, 50, "", { style: "fill:var(--magenta);fill-opacity:.5" });
    [80, 160, 260].forEach((s, i) => [[1, 1], [1.4, .7], [.7, 1.4]].forEach(([a, b]) => {
      const w = s * a, h = s * b;
      V.rect(an, cx - w / 2, cy - h / 2, w, h, "", { fill: "none", stroke: `var(--${["orange", "blue", "green"][i]})`, "stroke-width": 2, "vector-effect": "non-scaling-stroke" });
    }));
  };
  V.text(svg, 900, 40, "Region Proposal Network", { size: 24, weight: 700 });
  V.text(svg, 900, 150, "at every feature-map location:\n$k$ = 9 anchors (3 sizes × 3 aspect ratios)\n\noutputs per location:\n2$k$ objectness scores + 4$k$ box offsets\n\nkeep the ≈ 300 best proposals after NMS", { size: 21 });
  const P = [[425, 525], [625, 675], [825, 775], [525, 825], [725, 925]];
  let last = -1;
  const lp = V.loop(t => { const k = Math.floor(t / 1.2) % P.length; if (k !== last) { last = k; draw(...P[k]); } });
  draw(...P[2]);
  return { start() { last = -1; lp.start(); }, stop: lp.stop };
};

VIZ.roiAlign = host => {
  const svg = V.svg(host, 1400, 440), s = 46, ox = 60, oy = 40;
  const grid = (x0) => { for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) V.rect(svg, x0 + c * s, oy + r * s, s, s, "cell"); };
  grid(ox); grid(ox + 520);
  const R = [1.4, 1.7, 6.1, 5.3];
  const roi = (x0, col) => V.rect(svg, x0 + R[0] * s, oy + R[1] * s, (R[2] - R[0]) * s, (R[3] - R[1]) * s, "", { style: `fill:none;stroke:var(--${col});stroke-width:4` });
  roi(ox, "blue"); roi(ox + 520, "blue");
  V.text(svg, ox + 4 * s, 420, "RoI pooling", { size: 22, weight: 700 }); V.text(svg, ox + 520 + 4 * s, 420, "RoI Align", { size: 22, weight: 700 });
  const pool = fadeIn(V.g(svg));
  const q = [1, 1, 6, 5];
  V.rect(pool, ox + q[0] * s, oy + q[1] * s, (q[2] - q[0]) * s, (q[3] - q[1]) * s, "", { style: "fill:var(--red);fill-opacity:.12;stroke:var(--red);stroke-width:3", "stroke-dasharray": "8 6" });
  V.line(pool, ox + 3 * s, oy + q[1] * s, ox + 3 * s, oy + q[3] * s, { style: "stroke:var(--red)", "stroke-width": 3 });
  V.line(pool, ox + q[0] * s, oy + 3 * s, ox + q[2] * s, oy + 3 * s, { style: "stroke:var(--red)", "stroke-width": 3 });
  V.text(pool, ox + 4 * s, oy - 18, "coordinates rounded to cells: boundaries shift", { size: 18, fill: "var(--red)" });
  const al = fadeIn(V.g(svg));
  const bw = (R[2] - R[0]) / 2, bh = (R[3] - R[1]) / 2;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const x0 = R[0] + j * bw, y0 = R[1] + i * bh;
    V.rect(al, ox + 520 + x0 * s, oy + y0 * s, bw * s, bh * s, "", { style: "fill:var(--green);fill-opacity:.08;stroke:var(--green);stroke-width:2" });
    [[.25, .25], [.75, .25], [.25, .75], [.75, .75]].forEach(([a, b]) => V.circle(al, ox + 520 + (x0 + a * bw) * s, oy + (y0 + b * bh) * s, 6, { style: "fill:var(--green)" }));
  }
  V.text(al, ox + 520 + 4 * s, oy - 18, "exact bins, values sampled by bilinear interpolation", { size: 18, fill: "var(--green)" });
  V.text(svg, 1240, 120, "both turn a box of any size\ninto a fixed 7 × 7 (here 2 × 2)\nfeature grid for the head", { size: 20 });
  V.text(svg, 1240, 300, "the misalignment of RoI pooling\nhurts pixel-accurate masks", { size: 20, cls: "muted" });
  return { steps: 2, set(st) { V.show(pool, st >= 1); V.show(al, st >= 2); } };
};

VIZ.yoloGrid = host => {
  const svg = V.svg(host, 1400, 440);
  const ph = photo(svg, "cats-crowd.jpg", 20, 10, 420, 420);
  const gr = fadeIn(V.g(ph));
  for (let k = 0; k <= 1024; k += 128) { V.line(gr, k, 0, k, 1024, { style: "stroke:#fff", "stroke-width": 1.5, "vector-effect": "non-scaling-stroke" }); V.line(gr, 0, k, 1024, k, { style: "stroke:#fff", "stroke-width": 1.5, "vector-effect": "non-scaling-stroke" }); }
  const D = CATS.D, cx = (D[0] + D[2]) / 2, cy = (D[1] + D[3]) / 2;
  const cell = fadeIn(V.g(ph));
  V.rect(cell, Math.floor(cx / 128) * 128, Math.floor(cy / 128) * 128, 128, 128, "", { style: "fill:var(--magenta);fill-opacity:.45" });
  V.circle(cell, cx, cy, 12, { style: "fill:var(--magenta);stroke:#fff;stroke-width:3" });
  const box = fadeIn(V.g(ph)); boxR(box, D, "magenta", 4);
  const t = [fadeIn(V.text(svg, 900, 60, "split the image into an $S$ × $S$ grid (here 8 × 8)", { size: 22 })),
  fadeIn(V.text(svg, 900, 140, "the cell containing the object's centre is responsible for it", { size: 22 })),
  fadeIn(V.text(svg, 900, 220, "that cell predicts the box, a confidence, and class scores", { size: 22 })),
  fadeIn(V.text(svg, 900, 320, "output tensor: $S$ × $S$ × ($B$ · 5 + $C$)\nYOLOv1: 7 × 7 × (2 · 5 + 20) = 7 × 7 × 30", { size: 22, weight: 700, fill: "var(--blue)" }))];
  return { steps: 3, set(s) { V.show(gr, true); V.show(cell, s >= 1); V.show(box, s >= 2); t.forEach((e, i) => V.show(e, i <= s)); } };
};

VIZ.anchors = host => {
  const svg = V.svg(host, 1400, 440);
  const ph = photo(svg, "cats-crowd.jpg", 20, 10, 420, 420, "640 520 440 440");
  const A = [780, 690, 960, 870], D = CATS.D;
  const an = V.rect(ph, A[0], A[1], A[2] - A[0], A[3] - A[1], "", { fill: "none", stroke: "var(--orange)", "stroke-width": 4, "stroke-dasharray": "10 7", "vector-effect": "non-scaling-stroke" });
  const pr = V.rect(ph, A[0], A[1], A[2] - A[0], A[3] - A[1], "", { fill: "none", stroke: "var(--blue)", "stroke-width": 4, "vector-effect": "non-scaling-stroke" });
  pr.style.transition = "all .9s ease";
  V.text(svg, 520, 50, "anchor (prior)", { size: 22, fill: "var(--orange)", weight: 700, anchor: "start" });
  const f = fadeIn(V.g(svg));
  V.text(f, 520, 110, "the network predicts small corrections ($t$_x, $t$_y, $t$_w, $t$_h):", { size: 22, anchor: "start" });
  V.text(f, 560, 175, "$x$ = $x$_a + $t$_x · $w$_a        $y$ = $y$_a + $t$_y · $h$_a", { size: 24, anchor: "start" });
  V.text(f, 560, 230, "$w$ = $w$_a · exp($t$_w)       $h$ = $h$_a · exp($t$_h)", { size: 24, anchor: "start" });
  const r = fadeIn(V.g(svg));
  V.text(r, 520, 300, "predicted box", { size: 22, fill: "var(--blue)", weight: 700, anchor: "start" });
  V.text(r, 520, 360, "small, well-scaled targets are easy to regress;\nanchor-free detectors (FCOS, CenterNet, YOLOv8)\npredict distances from a point instead", { size: 19, cls: "muted", anchor: "start" });
  return {
    steps: 2, set(s) {
      V.show(f, s >= 1); V.show(r, s >= 2);
      const B = s >= 2 ? D : A;
      [["x", B[0]], ["y", B[1]], ["width", B[2] - B[0]], ["height", B[3] - B[1]]].forEach(([k, v]) => { pr.style[k] = v + "px"; pr.setAttribute(k, v); });
      pr.style.opacity = s >= 2 ? 1 : 0;
    }
  };
};

VIZ.objectness = host => {
  const svg = V.svg(host, 1400, 440);
  const ph = photo(svg, "cats-crowd.jpg", 20, 10, 440, 420, "60 380 980 935");
  const C = [[[60, 380, 200, 470], .03], [[300, 440, 470, 600], .41], [CATS.B, .96], [CATS.D, .98]];
  const col = o => o > .5 ? "green" : o > .2 ? "orange" : "red";
  C.forEach(([b, o]) => { boxR(ph, b, col(o), 4); tag(ph, b[0], b[1] + 50, `obj ${o.toFixed(2)}`, col(o), 34); });
  V.text(svg, 700, 40, "every candidate box gets", { size: 22, weight: 700, anchor: "start" });
  const y = fadeIn(V.g(svg));
  V.text(y, 700, 110, "YOLO: objectness ∈ (0, 1)  ×  class probabilities", { size: 22, anchor: "start" });
  V.text(y, 700, 150, "score = P(object) · P(class | object)", { size: 21, anchor: "start", cls: "muted" });
  const s2 = fadeIn(V.g(svg));
  V.text(s2, 700, 230, "SSD / RetinaNet: one extra \"background\" class", { size: 22, anchor: "start" });
  V.text(s2, 700, 270, "(or per-class sigmoids where background = all low)", { size: 21, anchor: "start", cls: "muted" });
  const s3 = fadeIn(V.text(svg, 700, 350, "either way: most candidates are background\nand must be discarded by a score threshold", { size: 21, anchor: "start", weight: 700, fill: "var(--blue)" }));
  return { steps: 3, set(s) { V.show(y, s >= 1); V.show(s2, s >= 2); V.show(s3, s >= 3); } };
};

VIZ.funnel = host => {
  const svg = V.svg(host, 1400, 400);
  V.text(svg, 700, 25, "YOLOv3 at 416 × 416: (13² + 26² + 52²) · 3 anchors = 10 647 candidate boxes per image", { size: 21, weight: 700 });
  const S = [["all candidates", 10647, "muted"], ["score > 0.25", 63, "orange"], ["after NMS", 11, "green"]];
  const G = S.map(([n, v, c], i) => {
    const g = fadeIn(V.g(svg)), w = 120 + Math.log10(v) / Math.log10(10647) * 900;
    V.rect(g, 700 - w / 2, 70 + i * 105, w, 80, "", { rx: 8, style: `fill:var(--${c === "muted" ? "muted-soft" : c + "-soft"});stroke:var(--${c});stroke-width:2.5` });
    V.text(g, 700, 110 + i * 105, `${n}: ${v.toLocaleString("en").replace(",", " ")}`, { size: 24, weight: 700 });
    return g;
  });
  V.text(svg, 700, 385, "numbers after the first row are illustrative; width on a log scale", { size: 16, cls: "muted" });
  return { steps: 2, set(s) { G.forEach((g, i) => V.show(g, i <= s)); } };
};

/* Non-maximum suppression, step by step, on real cat faces. */
const NMS_CANDS = (() => {
  const base = [["B", [0, 0, 0, 0], .95], ["B", [-18, 10, -6, 22], .81], ["B", [20, -12, 30, 4], .66], ["C", [0, 0, 0, 0], .92], ["C", [15, 20, 25, 14], .74], ["C", [-25, -6, -20, 8], .58],
  ["L", [0, 0, 0, 0], .88], ["L", [12, -10, 22, 8], .70], ["A", [0, 0, 0, 0], .90], ["A", [-15, 15, -5, 25], .62]];
  return base.map(([k, d, s]) => ({ b: CATS[k].map((v, i) => v + d[i]), s, k })).sort((a, b) => b.s - a.s);
})();
VIZ.nms = host => {
  const svg = V.svg(host, 1400, 440);
  const ph = photo(svg, "cats-crowd.jpg", 20, 10, 560, 420, "90 400 700 525");
  const R = NMS_CANDS.map(c => {
    const r = boxR(ph, c.b, "muted", 3); r.style.transition = "opacity .4s, stroke .3s";
    return r;
  });
  V.text(svg, 960, 25, "candidates sorted by score", { size: 21, weight: 700 });
  const rows = NMS_CANDS.map((c, i) => {
    const g = V.g(svg);
    const bg = V.rect(g, 720, 45 + i * 34, 480, 30, "", { rx: 4, style: "fill:#f3f5f6;transition:fill .3s" });
    V.text(g, 740, 60 + i * 34, `#${i + 1}`, { size: 18, anchor: "start", cls: "muted" });
    V.text(g, 800, 60 + i * 34, `score ${c.s.toFixed(2)}`, { size: 18, anchor: "start" });
    const st = V.text(g, 1190, 60 + i * 34, "", { size: 18, anchor: "end", weight: 700 });
    return { bg, st };
  });
  // precompute NMS states
  const states = [NMS_CANDS.map(() => "open")];
  let cur = states[0].slice();
  while (cur.includes("open")) {
    const i = cur.indexOf("open"); cur = cur.slice(); cur[i] = "keep";
    cur.forEach((v, j) => { if (v === "open" && iou(NMS_CANDS[i].b, NMS_CANDS[j].b) > .5) cur[j] = "drop"; });
    states.push(cur);
  }
  const msg = V.text(svg, 960, 410, "", { size: 20, weight: 700 });
  return {
    steps: states.length - 1, set(s) {
      const st = states[s];
      st.forEach((v, j) => {
        R[j].style.stroke = v === "keep" ? "var(--green)" : v === "drop" ? "var(--red)" : "var(--blue)";
        R[j].style.opacity = v === "drop" ? .25 : 1; R[j].setAttribute("stroke-width", v === "keep" ? 5 : 3);
        rows[j].bg.style.fill = v === "keep" ? "var(--green-soft)" : v === "drop" ? "var(--red-soft)" : "#f3f5f6";
        V.setText(rows[j].st, v === "keep" ? "keep" : v === "drop" ? "suppressed (IoU > 0.5)" : "");
      });
      V.setText(msg, s === 0 ? "1. take the best remaining box   2. suppress boxes overlapping it   3. repeat"
        : s === states.length - 1 ? `done: ${st.filter(v => v === "keep").length} boxes kept from ${st.length}` : `step ${s}: keep #${st.indexOf("keep") >= 0 ? states[s].findIndex((v, j) => v === "keep" && states[s - 1][j] !== "keep") + 1 : ""}, drop its overlaps`);
    }
  };
};

VIZ.nmsFail = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 340);
  const ph = photo(svg, "cats-window.jpg", 20, 0, 300, 340, "0 0 441 500");
  const A = [0, 55, 250, 565], B = [200, 15, 420, 525];
  const ra = boxR(ph, A, "green", 4), rb = boxR(ph, B, "green", 4);
  const ov = iou(A, B);
  V.text(svg, 820, 40, `two real cats overlap: IoU of their boxes = ${ov.toFixed(2)}`, { size: 22, weight: 700 });
  const res = V.text(svg, 820, 130, "", { size: 24, weight: 700 });
  V.text(svg, 820, 230, "a low NMS threshold removes true neighbours (crowds, piles of parts);\na high one keeps duplicates — tune it on validation data,\nor use class-aware / soft NMS", { size: 20, cls: "muted" });
  const upd = v => {
    const drop = ov > v.t;
    rb.style.stroke = drop ? "var(--red)" : "var(--green)"; rb.style.opacity = drop ? .3 : 1;
    V.setText(res, drop ? `threshold ${v.t.toFixed(2)} < IoU → the second cat is suppressed ✗` : `threshold ${v.t.toFixed(2)} ≥ IoU → both cats kept ✓`);
    res.querySelector("text").style.fill = drop ? "var(--red)" : "var(--green)";
  };
  const sl = sliders(host, [{ k: "t", label: "NMS IoU threshold", min: .05, max: .9, step: .01, v: .5 }], upd);
  upd(sl.vals);
  return {};
};

VIZ.focal = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 360);
  const X = p => 120 + p * 640, Y = l => 320 - l * 88;
  plotAxes(svg, X, Y, 0, 1.05, 0, 3.3, "$p$", "loss");
  V.text(svg, X(.5), 360, "predicted probability of the true class", { size: 18, cls: "muted" });
  V.path(svg, V.pathFn(p => -Math.log(p), .04, 1, X, Y), "curve", { style: "stroke:var(--muted);stroke-dasharray:8 6" });
  V.text(svg, X(.08), Y(3.1), "cross-entropy", { size: 19, cls: "muted", anchor: "start" });
  const fl = V.path(svg, "", "curve", { style: "stroke:var(--magenta)" });
  const t1 = V.text(svg, 1110, 70, "focal loss: −(1 − $p$)^γ log $p$", { size: 24 });
  const easy = V.text(svg, 1110, 170, "", { size: 21 }), hard = V.text(svg, 1110, 240, "", { size: 21 });
  V.text(svg, 1110, 320, "10 000 easy background boxes no longer\ndrown the few hard, informative ones", { size: 19, cls: "muted" });
  const upd = v => {
    const f = p => -Math.pow(1 - p, v.g) * Math.log(p);
    fl.setAttribute("d", V.pathFn(f, .04, 1, X, Y, 120));
    V.setText(easy, `easy box ($p$ = 0.95): weight ${Math.pow(.05, v.g).toExponential(1)}`);
    V.setText(hard, `hard box ($p$ = 0.2): weight ${Math.pow(.8, v.g).toFixed(2)}`);
  };
  const sl = sliders(host, [{ k: "g", label: "γ (focusing)", min: 0, max: 5, step: .5, v: 2 }], upd);
  upd(sl.vals);
  return {};
};

VIZ.prCurve = host => {
  const svg = V.svg(host, 1400, 440);
  const D = [1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1], S = [.97, .93, .9, .86, .81, .77, .7, .64, .58, .51, .44, .38], GT = 8;
  let tp = 0; const pts = D.map((d, i) => { tp += d; return [tp / GT, tp / (i + 1)]; });
  V.text(svg, 200, 22, "detections sorted by score", { size: 20, weight: 700 });
  const rows = D.map((d, i) => {
    const g = V.g(svg);
    const bg = V.rect(g, 60, 40 + i * 31, 290, 28, "", { rx: 4, style: "fill:#f3f5f6;transition:fill .3s" });
    V.text(g, 80, 54 + i * 31, S[i].toFixed(2), { size: 18, anchor: "start" });
    V.text(g, 330, 54 + i * 31, d ? "TP" : "FP", { size: 18, anchor: "end", weight: 700, fill: d ? "var(--green)" : "var(--red)" });
    return bg;
  });
  V.text(svg, 200, 430, `${GT} ground-truth objects`, { size: 18, cls: "muted" });
  const X = r => 520 + r * 520, Y = p => 400 - p * 350;
  plotAxes(svg, X, Y, 0, 1.05, 0, 1.06, "recall", "precision");
  [0, .5, 1].forEach(v => { V.text(svg, X(v), 425, v, { size: 16, cls: "muted" }); V.text(svg, X(0) - 12, Y(v), v, { size: 16, cls: "muted", anchor: "end" }); });
  const area = V.path(svg, "", "", { style: "fill:var(--blue);fill-opacity:.12" });
  const line = V.path(svg, "", "curve");
  const dot = V.circle(svg, 0, 0, 8, { style: "fill:var(--magenta)" });
  // AP with the precision envelope (all-point interpolation)
  const env = pts.map((p, i) => [p[0], Math.max(...pts.slice(i).map(q => q[1]))]);
  let ap = 0, pr = 0; env.forEach(([r, p]) => { ap += (r - pr) * p; pr = r; });
  const apT = V.text(svg, 1240, 100, "", { size: 24, weight: 700 });
  V.text(svg, 1240, 220, "lower the threshold:\nrecall ↑, precision usually ↓\n\nAP = area under the\n(envelope of the) PR curve\n\nmAP = mean over classes;\nCOCO also averages IoU 0.5–0.95", { size: 18 });
  const draw = k => {
    rows.forEach((r, i) => r.style.fill = i < k ? (D[i] ? "var(--green-soft)" : "var(--red-soft)") : "#f3f5f6");
    const P = pts.slice(0, k);
    line.setAttribute("d", P.length ? "M" + X(0) + "," + Y(1) + P.map(p => `L${X(p[0])},${Y(p[1])}`).join("") : "");
    if (P.length) { dot.setAttribute("cx", X(P[k - 1][0])); dot.setAttribute("cy", Y(P[k - 1][1])); }
    const E = env.slice(0, k);
    area.setAttribute("d", E.length ? `M${X(0)},${Y(0)} ` + E.map((e, i) => `L${X(i ? E[i - 1][0] : 0)},${Y(e[1])} L${X(e[0])},${Y(e[1])}`).join(" ") + ` L${X(E[E.length - 1][0])},${Y(0)} Z` : "");
    V.setText(apT, k === D.length ? `AP = ${ap.toFixed(2)}` : `threshold ${S[Math.max(0, k - 1)].toFixed(2)}`);
  };
  let last = -1;
  const lp = V.loop(t => { const k = Math.min(D.length, Math.floor(t / .6) % (D.length + 4)); if (k !== last) { last = k; draw(k); } });
  return { start() { last = -1; lp.start(); }, stop: lp.stop, final() { draw(D.length); } };
};
