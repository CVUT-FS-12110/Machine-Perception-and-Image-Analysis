/* Lecture 3 — Part 1 (from VSLAM to dense 3D), Part 2 (representations), Part 3 (learned depth). */
"use strict";

const fadeIn = e => { e.classList.add("fade"); return e; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let _seed = 1; const rnd = () => (_seed = (_seed * 9301 + 49297) % 233280) / 233280; const reseed = s => { _seed = s; };
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

/* The running example: a 2D cross-section of a flange (signed distance, negative inside). */
function sdf(x, y) {
  const rr = (() => { const r = .25, qx = Math.abs(x) - 2.0 + r, qy = Math.abs(y + .3) - .45 + r; return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r; })();
  const circ = Math.hypot(x, y - .5) - .85;
  const hole = Math.hypot(x, y - .5) - .35, b1 = Math.hypot(x - 1.45, y + .3) - .18, b2 = Math.hypot(x + 1.45, y + .3) - .18;
  return Math.max(Math.min(rr, circ), -hole, -b1, -b2);
}
const DOM = [-2.45, 2.45, -1.05, 1.6];   // x0, x1, y0, y1
/* Panel mapping: world (x, y up) → svg coordinates inside a box. */
function frame(ox, oy, w, h) {
  const k = Math.min(w / (DOM[1] - DOM[0]), h / (DOM[3] - DOM[2]));
  const cx = ox + w / 2, cy = oy + h / 2, mx = (DOM[0] + DOM[1]) / 2, my = (DOM[2] + DOM[3]) / 2;
  return { X: x => cx + (x - mx) * k, Y: y => cy - (y - my) * k, k, ix: X => (X - cx) / k + mx, iy: Y => -(Y - cy) / k + my };
}
/* Marching squares on f over the domain; returns segments [x1, y1, x2, y2]. */
function contour(f, n = 120, lvl = 0) {
  const [x0, x1, y0, y1] = DOM, m = Math.round(n * (y1 - y0) / (x1 - x0)), dx = (x1 - x0) / n, dy = (y1 - y0) / m;
  const v = []; for (let j = 0; j <= m; j++) { v.push([]); for (let i = 0; i <= n; i++) v[j].push(f(x0 + i * dx, y0 + j * dy) - lvl); }
  const segs = [];
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
    const c = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]], pts = [];
    for (let e = 0; e < 4; e++) {
      const [a, b] = [c[e], c[(e + 1) % 4]], va = v[a[1]][a[0]], vb = v[b[1]][b[0]];
      if ((va < 0) !== (vb < 0)) { const t = va / (va - vb); pts.push([x0 + (a[0] + t * (b[0] - a[0])) * dx, y0 + (a[1] + t * (b[1] - a[1])) * dy]); }
    }
    if (pts.length >= 2) segs.push([...pts[0], ...pts[1]]);
    if (pts.length === 4) segs.push([...pts[2], ...pts[3]]);
  }
  return segs;
}
const SEGS = contour(sdf, 140);
function drawContour(p, F, color = "ink", w = 2.5, segs = SEGS) {
  const d = segs.map(s => `M${F.X(s[0]).toFixed(1)},${F.Y(s[1]).toFixed(1)}L${F.X(s[2]).toFixed(1)},${F.Y(s[3]).toFixed(1)}`).join("");
  return V.path(p, d, "", { style: `fill:none;stroke:var(--${color});stroke-width:${w};stroke-linecap:round` });
}
/* Boundary samples (for point clouds). */
function boundaryPoints(n, noise = 0) {
  const pts = []; reseed(5);
  while (pts.length < n) {
    const s = SEGS[Math.floor(rnd() * SEGS.length)], t = rnd();
    pts.push([s[0] + t * (s[2] - s[0]) + noise * gauss(), s[1] + t * (s[3] - s[1]) + noise * gauss()]);
  }
  return pts;
}
/* Camera glyph in a top-down 2D view: centre (x,y), viewing direction a (radians). */
function cam(p, x, y, a, s = 40, color = "blue", label) {
  const g = V.g(p), c = Math.cos(a), si = Math.sin(a), half = .55;
  const L = [x + s * (c - half * -si), y + s * (si - half * c)], R = [x + s * (c + half * -si), y + s * (si + half * c)];
  V.path(g, `M${x},${y} L${L[0]},${L[1]} L${R[0]},${R[1]} Z`, "", { style: `fill:var(--${color}-soft);stroke:var(--${color});stroke-width:2.5` });
  V.circle(g, x, y, 5, { style: `fill:var(--${color})` });
  if (label) V.text(g, x - 30 * c, y - 30 * si, label, { size: 18, weight: 700, fill: `var(--${color})` });
  return g;
}
const heat = v => { const t = clamp(v, -1, 1); return t < 0 ? `rgba(194,24,122,${(-t * .75).toFixed(2)})` : `rgba(0,112,186,${(t * .75).toFixed(2)})`; };

/* ------------------------------------------------------------ Part 1 */
VIZ.goals3 = flow({
  w: 1400, h: 200, nodes: [
    { id: "a", x: 0, y: 40, w: 300, h: 120, label: "**REPRESENT**\n~points, meshes, fields,\n~Gaussians", cls: "blue" },
    { id: "b", x: 365, y: 40, w: 300, h: 120, label: "**LEARN DEPTH**\n~stereo, MVS,\n~monocular" },
    { id: "c", x: 730, y: 40, w: 300, h: 120, label: "**OPTIMIZE A SCENE**\n~NeRF, 3DGS, 4D" },
    { id: "d", x: 1095, y: 40, w: 300, h: 120, label: "**EVALUATE HONESTLY**\n~geometry, not only\n~pretty pictures", cls: "good" }],
  edges: [{ a: "a", b: "b" }, { a: "b", b: "c" }, { a: "c", b: "d" }],
});

VIZ.roadmap3 = flow({
  w: 1400, h: 260, nodes: [
    ["1", "**1 From VSLAM**\n**to dense 3D**", "blue"], ["2", "**2 Representing**\n**3D**"], ["3", "**3 Learned**\n**depth**"], ["4", "**4 Neural**\n**radiance fields**"],
    ["5", "**5 Gaussian**\n**splatting**"], ["6", "**6 Dynamic**\n**scenes (4D)**"], ["7", "**7 Evaluation**\n**and practice**", "good"]]
    .map(([id, label, cls], i) => ({ id, x: i * 204, y: 30, w: 176, h: 110, label, cls, size: 20 })),
  edges: ["1", "2", "3", "4", "5", "6"].map(a => ({ a, b: String(+a + 1) })),
  texts: [["what SLAM gives,\nwhat it does not"], ["points, voxels,\nSDF, fields"], ["cost volumes,\nplane sweep"], ["volume\nrendering"], ["explicit\nprimitives"], ["deformation,\ntime"], ["metrics,\npipelines"]]
    .map(([t], i) => ({ x: 88 + i * 204, y: 195, t, size: 18 })),
});

/* The rendered workshop scene with its "troublemakers" labelled (pixel positions projected from the 3D scene). */
VIZ.sceneIntro = host => {
  const svg = V.svg(host, 1400, 470);
  const s = 1.0 * 470 / 600, ox = 20;              // photo 960 × 600 scaled to height 470
  V.el("image", { href: "../assets/hero.jpg", x: ox, y: 0, width: 960 * s, height: 470 }, svg);
  const L = [["plain white wall", "no texture at all", 720, 40, "red"], ["glossy ball", "highlight is not on the surface", 328, 150, "orange"],
  ["textured box", "easy to match", 853, 230, "green"], ["shiny metal part", "reflections move with the view", 470, 250, "orange"],
  ["checkerboard", "repetitive: many false matches", 120, 470, "red"]];
  const G = L.map(([t, n, u, v, c], i) => {
    const g = fadeIn(V.g(svg)), x = ox + u * s, y = Math.min(455, v * s), ty = 50 + i * 82;
    V.circle(g, x, y, 9, { style: `fill:var(--${c});stroke:#fff;stroke-width:3` });
    V.path(g, `M${x},${y} L${790},${ty + 12}`, "", { style: `stroke:var(--${c});stroke-width:2;fill:none;opacity:.8` });
    V.text(g, 800, ty, t, { size: 22, weight: 700, anchor: "start", fill: `var(--${c})` });
    V.text(g, 800, ty + 28, n, { size: 18, anchor: "start", cls: "muted" });
    return g;
  });
  return { steps: 5, set(st) { G.forEach((g, i) => V.show(g, i < st)); } };
};

VIZ.vslamRecap = host => {
  const svg = V.svg(host, 1400, 440);
  V.rect(svg, 20, 10, 860, 420, "cell", { rx: 8 });
  const traj = t => [120 + t * 640, 330 - 90 * Math.sin(t * Math.PI * 1.1) - 40 * t];
  const path = range(41).map(i => traj(i / 40));
  V.path(svg, "M" + path.map(p => p.join(",")).join("L"), "", { style: "fill:none;stroke:var(--blue);stroke-width:3;stroke-dasharray:8 6" });
  reseed(9);
  const lm = range(70).map(() => { const x = 80 + rnd() * 760, y = 30 + rnd() * 170 + (rnd() < .5 ? 0 : 0); return [x, y]; });
  const dots = lm.map(([x, y]) => { const c = V.circle(svg, x, y, 5, { style: "fill:var(--ink)" }); c.style.transition = "opacity .4s"; c.style.opacity = 0; return c; });
  const kf = range(6).map(i => { const t = i / 5, [x, y] = traj(t); const g = cam(svg, x, y, -Math.PI / 2 - .2 + .4 * t, 34, "muted"); g.style.opacity = 0; g.style.transition = "opacity .4s"; return g; });
  const live = V.g(svg);
  const R = [["camera poses (trajectory)", true], ["sparse 3D landmarks", true], ["keyframes, loop closures", true], ["dense surface", false], ["appearance, new views", false], ["metric scale (monocular)", false]];
  R.forEach(([t, ok], i) => {
    V.text(svg, 930, 80 + i * 55, ok ? "✓" : "✗", { size: 28, weight: 700, fill: ok ? "var(--green)" : "var(--red)", anchor: "start" });
    V.text(svg, 975, 80 + i * 55, t, { size: 22, anchor: "start" });
  });
  V.text(svg, 1150, 30, "what VSLAM gives us", { size: 22, weight: 700 });
  const lp = V.loop(time => {
    const t = (time % 7) / 6, tt = Math.min(1, t);
    live.innerHTML = ""; const [x, y] = traj(tt); cam(live, x, y, -Math.PI / 2 - .2 + .4 * tt, 46, "blue");
    lm.forEach(([lx], i) => dots[i].style.opacity = lx < x + 120 ? 1 : 0);
    kf.forEach((g, i) => g.style.opacity = i / 5 <= tt ? 1 : 0);
  });
  return { start: lp.start, stop: lp.stop, final() { dots.forEach(d => d.style.opacity = 1); kf.forEach(g => g.style.opacity = 1); } };
};

VIZ.reconGoals = host => {
  const svg = V.svg(host, 1400, 420);
  const P = [["GEOMETRY", "where is the surface?"], ["APPEARANCE", "how does it look from here?"], ["DYNAMICS", "how does it change in time?"]].map(([t, s], i) => {
    const g = fadeIn(V.g(svg)), x = i * 470;
    V.rect(g, x, 0, 430, 410, "cell", { rx: 8 });
    V.text(g, x + 215, 30, t, { size: 22, weight: 700 }); V.text(g, x + 215, 380, s, { size: 20, cls: "muted" });
    return g;
  });
  const F0 = frame(20, 60, 390, 290), F1 = frame(490, 60, 390, 290), F2 = frame(960, 60, 390, 290);
  drawContour(P[0], F0, "ink", 3);
  const shade = V.g(P[1]);
  for (let gy = 0; gy < 50; gy++) for (let gx = 0; gx < 80; gx++) { const x = DOM[0] + (gx + .5) * (DOM[1] - DOM[0]) / 80, y = DOM[2] + (gy + .5) * (DOM[3] - DOM[2]) / 50; if (sdf(x, y) < 0) V.rect(shade, F1.X(x) - 2.6, F1.Y(y) - 3, 5.2, 6, "", { style: "fill:#9aa3ab" }); }
  const spec = V.circle(P[1], 0, 0, 34, { style: "fill:#fff;opacity:.85;filter:blur(6px)" });
  drawContour(P[1], F1, "muted", 2);
  const dyn = V.g(P[2]);
  const lp = V.loop(t => {
    spec.setAttribute("cx", F1.X(-1.3 + 2.6 * (.5 + .5 * Math.sin(t * 1.4)))); spec.setAttribute("cy", F1.Y(-.3));
    const a = .35 * Math.sin(t * 2);
    dyn.innerHTML = "";
    const segs = SEGS.map(s => { const w = (x, y) => [x, y + a * Math.sin(x * 1.3)]; const p = w(s[0], s[1]), q = w(s[2], s[3]); return [...p, ...q]; });
    drawContour(dyn, F2, "magenta", 3, segs);
  });
  return { steps: 2, start: lp.start, stop: lp.stop, set(s) { P.forEach((g, i) => V.show(g, i <= s)); } };
};

VIZ.visionGraphics = host => {
  const svg = V.svg(host, 1400, 420);
  const A = V.g(svg), B = fadeIn(V.g(svg));
  const FA = frame(40, 50, 560, 300), FB = frame(780, 50, 560, 300);
  V.text(A, 320, 22, "photorealistic rendering", { size: 22, weight: 700 });
  const grad = V.el("linearGradient", { id: "metal", x1: 0, y1: 0, x2: 1, y2: 1 }, V.el("defs", {}, svg));
  [["0", "#e8ecef"], [".5", "#8f98a0"], ["1", "#cfd5da"]].forEach(([o, c]) => V.el("stop", { offset: o, "stop-color": c }, grad));
  for (let gy = 0; gy < 60; gy++) for (let gx = 0; gx < 100; gx++) { const x = DOM[0] + (gx + .5) * (DOM[1] - DOM[0]) / 100, y = DOM[2] + (gy + .5) * (DOM[3] - DOM[2]) / 60; if (sdf(x * 1.03, y) < 0) V.rect(A, FA.X(x) - 3, FA.Y(y) - 3, 6, 6, "", { style: "fill:url(#metal)" }); }
  V.el("path", { d: `M${FA.X(-2.06)},${FA.Y(-1)} L${FA.X(2.06)},${FA.Y(-1)}`, stroke: "var(--red)", "stroke-width": 3, "marker-end": "url(#ah-red)", "marker-start": "url(#ah-red-s)" }, A);
  V.text(A, 320, 385, "width = 41.1 mm  (true 42.3 mm)", { size: 22, weight: 700, fill: "var(--red)" });
  V.text(B, 1060, 22, "coarse, but measured", { size: 22, weight: 700 });
  for (let gy = 0; gy < 22; gy++) for (let gx = 0; gx < 36; gx++) { const x = DOM[0] + (gx + .5) * (DOM[1] - DOM[0]) / 36, y = DOM[2] + (gy + .5) * (DOM[3] - DOM[2]) / 22; if (sdf(x, y) < 0) V.rect(B, FB.X(x) - 7, FB.Y(y) - 7, 14, 14, "", { style: "fill:var(--blue-soft);stroke:var(--blue);stroke-width:1" }); }
  drawContour(B, FB, "ink", 2.5);
  V.el("path", { d: `M${FB.X(-2)},${FB.Y(-1)} L${FB.X(2)},${FB.Y(-1)}`, stroke: "var(--green)", "stroke-width": 3, "marker-end": "url(#ah-green)", "marker-start": "url(#ah-green-s)" }, B);
  V.text(B, 1060, 385, "width = 42.3 ± 0.1 mm", { size: 22, weight: 700, fill: "var(--green)" });
  return { steps: 1, set(s) { V.show(B, s >= 1); } };
};

VIZ.rayAmbiguity = host => {
  const svg = V.svg(host, 1400, 420);
  const C = [120, 210];
  cam(svg, C[0], C[1], 0, 70, "blue", "camera");
  V.line(svg, C[0] + 70, 150, C[0] + 70, 270, { style: "stroke:var(--blue)", "stroke-width": 4 });
  V.text(svg, C[0] + 70, 295, "image", { size: 17, cls: "muted" });
  V.circle(svg, C[0] + 70, 210 - 10, 7, { style: "fill:var(--magenta)" });
  const dir = [1, -10 / 70], L = Math.hypot(...dir), u = [dir[0] / L, dir[1] / L];
  V.path(svg, `M${C[0]},${C[1]} L${C[0] + u[0] * 1180},${C[1] + u[1] * 1180}`, "", { style: "stroke:var(--magenta);stroke-width:2.5;stroke-dasharray:10 7" });
  const obj = V.g(svg);
  const lbl = V.text(svg, 1050, 360, "", { size: 21 });
  V.text(svg, 700, 405, "every point on the ray projects to the same pixel: one image does not determine depth", { size: 21, weight: 700, fill: "var(--blue)" });
  const lp = V.loop(t => {
    const s = .25 + .3 * (1 + Math.sin(t * .9)), d = 1250 * s;
    const p = [C[0] + u[0] * d, C[1] + u[1] * d], r = d * .07;
    obj.innerHTML = "";
    V.circle(obj, p[0], p[1], r, { style: "fill:var(--orange-soft);stroke:var(--orange);stroke-width:3" });
    V.setText(lbl, `object ${(d / 300).toFixed(1)} m away, ${(r / 30).toFixed(2)} m large`);
  });
  return { start: lp.start, stop: lp.stop };
};

VIZ.triangulation = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 360);
  const g = V.g(svg), info = V.text(svg, 1180, 140, "", { size: 22 });
  V.text(svg, 1180, 250, "each ray is known only within\n± 0.25° (pixel noise);\nthe overlap is where the point can be", { size: 18, cls: "muted" });
  const upd = v => {
    g.innerHTML = "";
    const k = 34, P = [520, 340 - v.z * k], B = v.b * k;
    const A = [520 - B / 2, 340], Bc = [520 + B / 2, 340], sig = .25 * Math.PI / 180 * 6;
    [A, Bc].forEach(c => {
      const a = Math.atan2(P[1] - c[1], P[0] - c[0]), L = 1.25 * Math.hypot(P[0] - c[0], P[1] - c[1]);
      V.path(g, `M${c[0]},${c[1]} L${c[0] + L * Math.cos(a - sig)},${c[1] + L * Math.sin(a - sig)} L${c[0] + L * Math.cos(a + sig)},${c[1] + L * Math.sin(a + sig)} Z`, "", { style: "fill:var(--blue);fill-opacity:.18;stroke:var(--blue);stroke-width:1" });
      cam(g, c[0], c[1], a, 34, "blue");
    });
    V.circle(g, P[0], P[1], 7, { style: "fill:var(--magenta)" });
    V.line(g, A[0], 352, Bc[0], 352, { style: "stroke:var(--ink)", "stroke-width": 2 }); V.text(g, 520, 345 + 0, "", {});
    const dz = v.z * v.z / v.b * (.25 * Math.PI / 180) * 2;
    V.setText(info, `depth ${v.z} m, baseline ${v.b} m → depth uncertainty ≈ ${(dz * 100).toFixed(1)} cm`);
  };
  const sl = sliders(host, [{ k: "b", label: "baseline [m]", min: .5, max: 8, step: .5, v: 2 }, { k: "z", label: "depth [m]", min: 2, max: 9, step: .5, v: 7 }], upd);
  upd(sl.vals);
  return {};
};

/* ------------------------------------------------------------ Part 2 */
function panel(p, x, y, w, h, title) {
  const g = V.g(p); V.rect(g, x, y, w, h, "cell", { rx: 8 }); V.text(g, x + w / 2, y + 24, title, { size: 20, weight: 700 }); return g;
}
function drawRepr(kind, p, F, opt = {}) {
  const [x0, x1, y0, y1] = DOM;
  if (kind === "points") boundaryPoints(opt.n || 160, .02).forEach(([x, y]) => V.circle(p, F.X(x), F.Y(y), 2.6, { style: "fill:var(--ink)" }));
  if (kind === "mesh") {
    const S = contour(sdf, 26);
    drawContour(p, F, "blue", 2, S);
    S.forEach(s => V.circle(p, F.X(s[0]), F.Y(s[1]), 2.8, { style: "fill:var(--blue)" }));
  }
  if (kind === "voxel") {
    const n = opt.n || 26, m = Math.round(n * (y1 - y0) / (x1 - x0)), dx = (x1 - x0) / n, dy = (y1 - y0) / m;
    for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) if (sdf(x0 + (i + .5) * dx, y0 + (j + .5) * dy) < 0)
      V.rect(p, F.X(x0 + i * dx), F.Y(y0 + (j + 1) * dy), dx * F.k, dy * F.k, "", { style: "fill:var(--blue-soft);stroke:var(--blue);stroke-width:.8" });
  }
  if (kind === "sdf" || kind === "density") {
    const n = opt.n || 60, m = Math.round(n * (y1 - y0) / (x1 - x0)), dx = (x1 - x0) / n, dy = (y1 - y0) / m, mu = opt.mu || .5;
    for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
      const d = sdf(x0 + (i + .5) * dx, y0 + (j + .5) * dy);
      const fill = kind === "sdf" ? heat(d / mu) : `rgba(28,36,43,${(1 / (1 + Math.exp(d * 18))).toFixed(2)})`;
      V.rect(p, F.X(x0 + i * dx), F.Y(y0 + (j + 1) * dy), dx * F.k + .5, dy * F.k + .5, "", { style: `fill:${fill}` });
    }
    if (kind === "sdf") drawContour(p, F, "ink", 2.5);
  }
  if (kind === "gauss") gaussFit(opt.n || 24).forEach(e => ellipse(p, F, e));
}
/* Fit N 2D Gaussians to interior samples with a few k-means iterations. */
function gaussFit(N) {
  reseed(3); const pts = [];
  while (pts.length < 1500) { const x = DOM[0] + rnd() * (DOM[1] - DOM[0]), y = DOM[2] + rnd() * (DOM[3] - DOM[2]); if (sdf(x, y) < 0) pts.push([x, y]); }
  let C = range(N).map(i => pts[Math.floor(i * pts.length / N)].slice());
  let lab = [];
  for (let it = 0; it < 12; it++) {
    lab = pts.map(p => { let b = 0, bd = 1e9; C.forEach((c, k) => { const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2; if (d < bd) { bd = d; b = k; } }); return b; });
    C = C.map((c, k) => { const q = pts.filter((_, i) => lab[i] === k); return q.length ? [q.reduce((a, p) => a + p[0], 0) / q.length, q.reduce((a, p) => a + p[1], 0) / q.length] : c; });
  }
  return C.map((c, k) => {
    const q = pts.filter((_, i) => lab[i] === k); if (q.length < 3) return null;
    let sxx = 0, syy = 0, sxy = 0; q.forEach(([x, y]) => { sxx += (x - c[0]) ** 2; syy += (y - c[1]) ** 2; sxy += (x - c[0]) * (y - c[1]); });
    sxx /= q.length; syy /= q.length; sxy /= q.length;
    const tr = (sxx + syy) / 2, det = Math.sqrt(((sxx - syy) / 2) ** 2 + sxy * sxy);
    return { c, a: Math.sqrt(tr + det), b: Math.sqrt(Math.max(1e-4, tr - det)), ang: .5 * Math.atan2(2 * sxy, sxx - syy) };
  }).filter(Boolean);
}
function ellipse(p, F, e, color = "magenta") {
  return V.el("ellipse", { cx: F.X(e.c[0]), cy: F.Y(e.c[1]), rx: 1.6 * e.a * F.k, ry: 1.6 * e.b * F.k, transform: `rotate(${(-e.ang * 180 / Math.PI).toFixed(1)} ${F.X(e.c[0])} ${F.Y(e.c[1])})`, style: `fill:var(--${color});fill-opacity:.32;stroke:var(--${color});stroke-width:1.5` }, p);
}

VIZ.reprZoo = host => {
  const svg = V.svg(host, 1400, 440);
  const K = [["points", "point cloud"], ["mesh", "mesh"], ["voxel", "voxels"], ["sdf", "signed distance"], ["density", "density field"], ["gauss", "Gaussians"]];
  const G = K.map(([k, t], i) => {
    const x = (i % 3) * 470, y = Math.floor(i / 3) * 222, g = fadeIn(panel(svg, x, y, 450, 212, t));
    drawRepr(k, g, frame(x + 15, y + 40, 420, 165));
    return g;
  });
  return { steps: 5, set(s) { G.forEach((g, i) => V.show(g, i <= s)); } };
};

VIZ.pointCloud = host => {
  const svg = V.svg(host, 1400, 430);
  const F = frame(250, 20, 900, 380);
  drawContour(svg, F, "rule", 2);
  const ca = [F.X(-2.3), F.Y(1.55)], cb = [F.X(2.3), F.Y(1.55)];
  const vis = (x, y, c) => {   // visible if the segment from camera to point stays outside the solid
    const X = F.ix(c[0]), Y = F.iy(c[1]);
    for (let t = .02; t < .97; t += .02) if (sdf(X + (x - X) * t, Y + (y - Y) * t) < -.01) return false; return true;
  };
  const pts = boundaryPoints(420, .015);
  const A = fadeIn(V.g(svg)), B = fadeIn(V.g(svg));
  pts.forEach(([x, y]) => { if (vis(x, y, ca)) V.circle(A, F.X(x), F.Y(y), 3, { style: "fill:var(--blue)" }); else if (vis(x, y, cb)) V.circle(B, F.X(x), F.Y(y), 3, { style: "fill:var(--orange)" }); });
  cam(svg, ca[0], ca[1], .55, 46, "blue", "scan 1"); const cB = fadeIn(cam(svg, cb[0], cb[1], Math.PI - .55, 46, "orange", "scan 2"));
  V.text(svg, 700, 425, "only surfaces seen by a sensor get points; the bottom is never observed", { size: 20, cls: "muted" });
  return { steps: 2, set(s) { V.show(A, s >= 1); V.show(B, s >= 2); V.show(cB, s >= 2); } };
};

VIZ.meshViz = host => {
  const svg = V.svg(host, 1400, 430);
  const F = frame(60, 30, 800, 370);
  drawRepr("mesh", svg, F);
  V.el("path", { d: `M${F.X(-2)},${F.Y(-.95)} L${F.X(2)},${F.Y(-.95)}`, stroke: "var(--green)", "stroke-width": 3, "marker-end": "url(#ah-green)", "marker-start": "url(#ah-green-s)" }, svg);
  V.text(svg, F.X(0), F.Y(-.95) + 26, "dimensions can be measured directly", { size: 19, fill: "var(--green)", weight: 700 });
  V.text(svg, 1130, 120, "2D analogy: vertices + edges\n(3D: vertices + triangles)", { size: 21 });
  V.text(svg, 1130, 260, "explicit surface: inside/outside,\nnormals, collisions, rendering", { size: 21, cls: "muted" });
};

VIZ.voxelMem = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 350);
  const g = V.g(svg), mem = V.g(svg);
  const upd = v => {
    g.innerHTML = ""; drawRepr("voxel", g, frame(30, 10, 760, 330), { n: v.n });
    mem.innerHTML = "";
    V.text(mem, 1100, 40, "the same resolution in 3D", { size: 22, weight: 700 });
    [v.n, 128, 256, 512].forEach((n, i) => {
      const cells = n ** 3, mb = cells * 4 / 1e6;
      V.text(mem, 870, 100 + i * 60, `${n}³`, { size: 22, anchor: "start", weight: i ? null : 700 });
      V.text(mem, 1000, 100 + i * 60, `${(cells / 1e6).toFixed(cells < 1e6 ? 3 : 1)} M cells`, { size: 22, anchor: "start" });
      V.text(mem, 1210, 100 + i * 60, mb < 1000 ? `${mb.toFixed(mb < 10 ? 1 : 0)} MB` : `${(mb / 1000).toFixed(1)} GB`, { size: 22, anchor: "start", fill: mb > 500 ? "var(--red)" : null, weight: 700 });
    });
    V.text(mem, 1100, 335, "float32 per cell; 2× resolution = 8× memory", { size: 18, cls: "muted" });
  };
  const sl = sliders(host, [{ k: "n", label: "cells across", min: 8, max: 72, step: 4, v: 24 }], upd);
  upd(sl.vals);
  return {};
};

VIZ.occupancy = host => {
  const svg = V.svg(host, 1400, 430);
  const F = frame(40, 20, 860, 400), n = 30, [x0, x1, y0, y1] = DOM, m = Math.round(n * (y1 - y0) / (x1 - x0)), dx = (x1 - x0) / n, dy = (y1 - y0) / m;
  const L = range(n * m).map(() => 0);
  const cells = range(n * m).map(k => { const i = k % n, j = Math.floor(k / n); return V.rect(svg, F.X(x0 + i * dx), F.Y(y0 + (j + 1) * dy), dx * F.k, dy * F.k, "", { style: "fill:#d9dee2;stroke:#fff;stroke-width:.6" }); });
  drawContour(svg, F, "ink", 1.5);
  const S = [F.ix(F.X(0)), 1.55], beam = V.g(svg);
  cam(svg, F.X(S[0]), F.Y(S[1]), Math.PI / 2, 40, "blue", "");
  const paint = () => L.forEach((l, k) => { const p = 1 / (1 + Math.exp(-l)); cells[k].style.fill = `hsl(0,0%,${(92 - p * 70).toFixed(0)}%)`; });
  V.text(svg, 1150, 80, "for every measured ray:", { size: 22, weight: 700 });
  V.text(svg, 1150, 150, "cells it passes: more likely free\n(log-odds − 0.4)", { size: 20 });
  V.text(svg, 1150, 240, "cell where it hits: more likely\noccupied (log-odds + 0.85)", { size: 20 });
  V.text(svg, 1150, 340, "free space is information too", { size: 20, fill: "var(--blue)", weight: 700 });
  const cast = a => {
    beam.innerHTML = "";
    const d = [Math.cos(a), Math.sin(a)]; let t = 0, hit = null;
    while (t < 6) { const x = S[0] + d[0] * t, y = S[1] + d[1] * t; if (x < x0 || x > x1 || y < y0) break; if (sdf(x, y) < 0) { hit = [x, y]; break; } t += .01; }
    const end = hit || [S[0] + d[0] * t, S[1] + d[1] * t];
    V.line(beam, F.X(S[0]), F.Y(S[1]), F.X(end[0]), F.Y(end[1]), { style: "stroke:var(--magenta)", "stroke-width": 2.5 });
    const seen = new Set();
    for (let s = 0; s < t; s += .02) { const x = S[0] + d[0] * s, y = S[1] + d[1] * s, i = Math.floor((x - x0) / dx), j = Math.floor((y - y0) / dy); if (i >= 0 && i < n && j >= 0 && j < m && !seen.has(j * n + i)) { seen.add(j * n + i); } }
    const hk = hit ? Math.floor((hit[1] - y0) / dy) * n + Math.floor((hit[0] - x0) / dx) : -1;
    seen.forEach(k => { if (k !== hk) L[k] -= .4; }); if (hk >= 0) L[hk] += .85;
    paint();
  };
  let last = -1;
  const lp = V.loop(t => { const k = Math.floor(t / .12); if (k !== last) { last = k; if (k % 90 === 0) L.fill(0); cast(-Math.PI / 2 + (((k * 37) % 90) / 89 - .5) * 2.4); } });
  return { start() { last = -1; L.fill(0); paint(); lp.start(); }, stop: lp.stop, final() { L.fill(0); for (let k = 0; k < 90; k++) cast(-Math.PI / 2 + (k / 89 - .5) * 2.4); beam.innerHTML = ""; } };
};

VIZ.tsdf = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 340);
  const g = V.g(svg);
  V.text(svg, 1150, 70, "signed distance to the surface", { size: 22, weight: 700 });
  V.rect(svg, 1000, 110, 26, 26, "", { style: "fill:rgba(0,112,186,.7)" }); V.text(svg, 1040, 123, "outside (+)", { size: 20, anchor: "start" });
  V.rect(svg, 1000, 150, 26, 26, "", { style: "fill:rgba(194,24,122,.7)" }); V.text(svg, 1040, 163, "inside (−)", { size: 20, anchor: "start" });
  V.text(svg, 1150, 230, "the surface is the zero level set;\nfar from it the value is truncated\nto ± μ: only a thin band is stored", { size: 19, cls: "muted" });
  const upd = v => { g.innerHTML = ""; drawRepr("sdf", g, frame(30, 10, 900, 320), { n: 90, mu: v.mu }); };
  const sl = sliders(host, [{ k: "mu", label: "truncation μ", min: .05, max: 1.5, step: .05, v: .3 }], upd);
  upd(sl.vals);
  return {};
};

VIZ.quadtree = host => {
  const svg = V.svg(host, 1400, 430);
  const F = frame(40, 20, 860, 400);
  const cp = V.el("clipPath", { id: "qtclip" }, V.el("defs", {}, svg));
  V.rect(cp, F.X(DOM[0]), F.Y(DOM[3]), (DOM[1] - DOM[0]) * F.k, (DOM[3] - DOM[2]) * F.k);
  const g = V.g(svg, { "clip-path": "url(#qtclip)" }), info = V.text(svg, 1150, 120, "", { size: 22 });
  drawContour(svg, F, "ink", 2);
  V.text(svg, 1150, 260, "split a cell only where the\nsurface passes through it\n(3D: octree)", { size: 20, cls: "muted" });
  const set = depth => {
    g.innerHTML = ""; let count = 0;
    const rec = (x, y, w, h, d) => {
      let near = false; const r = Math.hypot(w, h) / 2;
      near = Math.abs(sdf(x + w / 2, y + h / 2)) < r;
      if (d < depth && near) { rec(x, y, w / 2, h / 2, d + 1); rec(x + w / 2, y, w / 2, h / 2, d + 1); rec(x, y + h / 2, w / 2, h / 2, d + 1); rec(x + w / 2, y + h / 2, w / 2, h / 2, d + 1); return; }
      count++;
      V.rect(g, F.X(x), F.Y(y + h), w * F.k, h * F.k, "", { style: `fill:${sdf(x + w / 2, y + h / 2) < 0 ? "var(--blue-soft)" : "none"};stroke:var(--blue);stroke-width:1` });
    };
    const [x0, x1, y0, y1] = DOM, s = Math.max(x1 - x0, y1 - y0);
    rec(x0, y0, s, s, 0);
    V.setText(info, `depth ${depth}: ${count} cells vs ${4 ** depth} in a full grid`);
  };
  return { steps: 5, set(s) { set(s + 2); } };
};

VIZ.implicitField = host => {
  const svg = V.svg(host, 1400, 430);
  const F = frame(30, 20, 760, 400);
  drawContour(svg, F, "rule", 2);
  const q = V.g(svg);
  V.box(svg, 900, 150, 140, 80, "($x$, $y$, $z$)", "box", { size: 22 }); V.arrow(svg, 1045, 190, 1095, 190);
  V.box(svg, 1100, 140, 140, 100, "MLP\n~weights θ", "box blue", { size: 22 }); V.arrow(svg, 1245, 190, 1290, 190);
  V.box(svg, 1295, 150, 90, 80, "$f$", "box good", { size: 26 });
  V.text(svg, 1140, 320, "query any point, at any resolution;\nthe surface is where $f$ = 0\nthe whole scene is stored in θ", { size: 20 });
  let k = 0;
  const lp = V.loop(t => {
    const want = Math.min(400, Math.floor(t * 40) % 480);
    if (want < k) { q.innerHTML = ""; k = 0; }
    while (k < want) { const x = DOM[0] + rnd() * (DOM[1] - DOM[0]), y = DOM[2] + rnd() * (DOM[3] - DOM[2]); V.circle(q, F.X(x), F.Y(y), 5, { style: `fill:${heat(sdf(x, y) / .6)}` }); k++; }
  });
  return { start() { q.innerHTML = ""; k = 0; lp.start(); }, stop: lp.stop };
};

VIZ.radiance = host => {
  const svg = V.svg(host, 1400, 430);
  const P = [460, 300];
  V.rect(svg, 200, 300, 520, 18, "", { style: "fill:#b7bec4" });
  V.circle(svg, P[0], P[1], 8, { style: "fill:var(--ink)" });
  const live = V.g(svg);
  V.box(svg, 900, 70, 200, 80, "($**x**$, $**d**$)", "box", { size: 22 }); V.arrow(svg, 1105, 110, 1150, 110);
  V.box(svg, 1155, 60, 230, 100, "($σ$, $**c**$)\n~density, colour", "box good", { size: 22 });
  V.text(svg, 1140, 210, "the same 3D point has a different\ncolour from different directions\n(glossy, metallic surfaces)", { size: 20 });
  const plot = V.g(svg);
  const X = a => 880 + a / Math.PI * 400, Y = c => 410 - c * 110;
  plotAxes(plot, X, Y, 0, Math.PI, 0, 1, "viewing angle", "brightness");
  const br = a => .25 + .7 * Math.exp(-((a - Math.PI * .62) ** 2) / .06);
  V.path(plot, V.pathFn(br, 0, Math.PI, X, Y, 100), "curve");
  const dot = V.circle(svg, 0, 0, 8, { style: "fill:var(--magenta)" });
  const lp = V.loop(t => {
    const a = Math.PI * (.12 + .76 * (.5 + .5 * Math.sin(t * .8))), c = [P[0] - 230 * Math.cos(a), P[1] - 230 * Math.sin(a)];
    live.innerHTML = "";
    V.line(live, c[0], c[1], P[0], P[1], { style: "stroke:var(--blue)", "stroke-dasharray": "7 5" });
    cam(live, c[0], c[1], Math.atan2(P[1] - c[1], P[0] - c[0]), 40, "blue");
    const b = br(a), col = `hsl(30,15%,${(25 + b * 70).toFixed(0)}%)`;
    V.circle(live, c[0], c[1] - 50, 22, { style: `fill:${col};stroke:var(--ink)` });
    dot.setAttribute("cx", X(a)); dot.setAttribute("cy", Y(b));
  });
  return { start: lp.start, stop: lp.stop };
};

VIZ.gaussFitViz = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 340);
  const F = frame(30, 10, 860, 320);
  const g = V.g(svg);
  drawContour(svg, F, "ink", 1.5);
  V.text(svg, 1150, 70, "each primitive: centre, covariance\n(size + orientation), opacity, colour", { size: 20 });
  V.text(svg, 1150, 210, "anisotropic ellipses follow thin\nand elongated structures; more\nprimitives = finer detail", { size: 19, cls: "muted" });
  const upd = v => { g.innerHTML = ""; gaussFit(v.n).forEach(e => ellipse(g, F, e)); };
  const sl = sliders(host, [{ k: "n", label: "number of Gaussians", min: 4, max: 90, step: 2, v: 24 }], upd);
  upd(sl.vals);
  return {};
};

/* ------------------------------------------------------------ Part 3 */
VIZ.densePipe = flow({
  w: 1400, h: 260, nodes: [
    { id: "a", x: 0, y: 80, w: 230, h: 100, label: "calibrated images\n~poses from SLAM / SfM" },
    { id: "b", x: 300, y: 80, w: 230, h: 100, label: "depth map\n~per view (stereo / MVS)", cls: "blue", step: 1 },
    { id: "c", x: 600, y: 80, w: 230, h: 100, label: "filter\n~consistency, confidence", step: 2 },
    { id: "d", x: 900, y: 80, w: 230, h: 100, label: "fuse\n~points / TSDF", step: 3 },
    { id: "e", x: 1200, y: 80, w: 190, h: 100, label: "surface\n~mesh", cls: "good", step: 3 }],
  edges: [{ a: "a", b: "b", step: 1 }, { a: "b", b: "c", step: 2 }, { a: "c", b: "d", step: 3 }, { a: "d", b: "e", step: 3 }],
  texts: [{ x: 415, y: 225, t: "learning helps most here", step: 1, cls: "", size: 20, weight: 700 }],
});

VIZ.matchingCost = host => {
  const svg = V.svg(host, 1400, 430);
  const cases = [
    ["textured patch", d => .2 + .7 * (1 - Math.exp(-((d - 12) ** 2) / 6)) + .05 * Math.sin(d * 1.7), "var(--blue)"],
    ["textureless wall", d => .45 + .05 * Math.sin(d * .9) + .03 * Math.sin(d * 2.3), "var(--red)"],
    ["repetitive pattern", d => .5 - .32 * Math.cos(d * 2 * Math.PI / 8), "var(--red)"],
    ["learned features", d => .15 + .8 * (1 - Math.exp(-((d - 12) ** 2) / 10)), "var(--green)"]];
  const G = cases.map(([t, f, c], i) => {
    const g = fadeIn(V.g(svg)), ox = 40 + (i % 2) * 680, oy = 20 + Math.floor(i / 2) * 210;
    const X = d => ox + 60 + d * 22, Y = v => oy + 170 - v * 140;
    plotAxes(g, X, Y, 0, 25, 0, 1.05, "disparity", "");
    V.text(g, ox + 330, oy + 12, t, { size: 21, weight: 700, fill: c });
    V.path(g, V.pathFn(f, 0, 24, X, Y, 120), "", { style: `fill:none;stroke:${c};stroke-width:4` });
    V.text(g, ox + 20, oy + 90, "cost", { size: 17, cls: "muted" });
    return g;
  });
  return { steps: 3, set(s) { G.forEach((g, i) => V.show(g, i <= s)); } };
};

VIZ.disparity = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 340);
  const f = 700, B = .12, X = z => 140 + z * 52, Y = e => 300 - e * 260 / 1.2;
  plotAxes(svg, X, Y, 0, 15.5, 0, 1.25, "depth $Z$ [m]", "error [m]");
  const err = z => z * z * .5 / (f * B);
  V.path(svg, V.pathFn(err, .2, 15, X, Y, 100), "curve");
  [5, 10, 15].forEach(z => V.text(svg, X(z), 322, z, { size: 17, cls: "muted" }));
  const dot = V.circle(svg, 0, 0, 9, { style: "fill:var(--magenta)" });
  const t1 = V.text(svg, 1150, 80, "$Z$ = $f$ · $B$ / $d$", { size: 30 });
  const t2 = V.text(svg, 1150, 160, "", { size: 21 }), t3 = V.text(svg, 1150, 210, "", { size: 21, weight: 700 });
  V.text(svg, 1150, 245, "$f$ = 700 px, $B$ = 12 cm, matching error 0.5 px:\nerror grows with $Z$²", { size: 18, cls: "muted" });
  const upd = v => {
    dot.setAttribute("cx", X(v.z)); dot.setAttribute("cy", Y(err(v.z)));
    V.setText(t2, `disparity $d$ = ${(f * B / v.z).toFixed(1)} px`); V.setText(t3, `depth error ≈ ${(err(v.z) * 100).toFixed(1)} cm`);
  };
  const sl = sliders(host, [{ k: "z", label: "depth Z [m]", min: .5, max: 15, step: .5, v: 4 }], upd);
  upd(sl.vals);
  return {};
};

VIZ.costVolume = host => {
  const svg = V.svg(host, 1400, 440);
  const D = 8;
  for (let k = D - 1; k >= 0; k--) {
    const o = k * 22;
    V.rect(svg, 60 + o, 120 - o * .7, 300, 220, "", { style: `fill:var(--blue-soft);stroke:var(--blue);stroke-width:1.5;fill-opacity:.85` });
  }
  V.text(svg, 210, 380, "$H$ × $W$ (pixels)", { size: 20 }); V.text(svg, 380, 40, "$D$ disparity\nhypotheses", { size: 19, anchor: "start" });
  const col = fadeIn(V.g(svg));
  for (let k = 0; k < D; k++) V.rect(col, 200 + k * 22, 220 - k * 22 * .7, 18, 18, "", { style: "fill:var(--magenta);stroke:#fff" });
  V.text(col, 210, 255, "one pixel", { size: 18, fill: "var(--magenta)", weight: 700 });
  const plot = fadeIn(V.g(svg));
  const c = [.8, .7, .62, .3, .08, .25, .6, .75];
  c.forEach((v, k) => { V.rect(plot, 640 + k * 60, 330 - v * 220, 44, v * 220, "", { style: `fill:var(--${k === 4 ? "green" : "magenta"})` }); V.text(plot, 662 + k * 60, 352, k, { size: 18 }); });
  V.text(plot, 870, 390, "disparity $d$", { size: 19, cls: "muted" }); V.text(plot, 870, 80, "matching cost along $D$ for that pixel", { size: 21, weight: 700 });
  V.text(plot, 1250, 220, "lowest cost\n→ disparity 4", { size: 20, fill: "var(--green)", weight: 700 });
  return { steps: 2, set(s) { V.show(col, s >= 1); V.show(plot, s >= 2); } };
};

VIZ.stereoNet = host => {
  const svg = V.svg(host, 1400, 440);
  const N = [["left / right\nimage", "3 × $H$ × $W$", "mut"], ["shared CNN\n~features (lecture 1–2)", "$C$ × $H$/4 × $W$/4", "blue"], ["cost volume\n~compare at each $d$", "$C$ × $D$/4 × $H$/4 × $W$/4", ""],
  ["3D convolutions\n~regularize", "$D$/4 × $H$/4 × $W$/4", "blue"], ["upsample +\n~soft-argmin", "$H$ × $W$ disparity", "good"]];
  const G = N.map(([l, s, c], i) => {
    const g = fadeIn(V.g(svg)), x = i * 280;
    V.box(g, x, 120, 230, 120, l, "box " + c, { size: 20 });
    V.text(g, x + 115, 275, s, { size: 18, fill: "var(--blue)", weight: 700 });
    if (i) V.arrow(g, x - 46, 180, x - 6, 180);
    return g;
  });
  V.text(svg, 700, 380, "every step is differentiable: the whole network is trained end to end on disparity", { size: 20, cls: "muted" });
  return { steps: 4, set(s) { G.forEach((g, i) => V.show(g, i <= s)); } };
};

VIZ.softArgmin = host => {
  const svg = V.svg(host, 1400, 430);
  const c = [2.4, 1.9, 1.2, .3, .1, .9, 1.8, 2.3], e = c.map(v => Math.exp(-2.5 * v)), S = e.reduce((a, b) => a + b), p = e.map(v => v / S);
  const dhat = p.reduce((a, v, d) => a + v * d, 0);
  const bars = (g, vals, ox, max, col, title) => {
    V.text(g, ox + 230, 30, title, { size: 21, weight: 700 });
    vals.forEach((v, k) => { V.rect(g, ox + k * 58, 300 - v / max * 220, 44, v / max * 220, "", { style: `fill:var(--${col})` }); V.text(g, ox + 22 + k * 58, 322, k, { size: 17 }); V.text(g, ox + 22 + k * 58, 285 - v / max * 220, v.toFixed(2), { size: 15 }); });
  };
  bars(svg, c, 40, 2.5, "magenta", "cost $c$_d");
  const P = fadeIn(V.g(svg)); bars(P, p, 600, Math.max(...p), "blue", "softmax(−$c$) = probability $p$_d");
  V.arrow(svg, 520, 180, 585, 180);
  const R = fadeIn(V.g(svg));
  V.text(R, 1270, 140, "$d̂$ = Σ $d$ · $p$_d", { size: 26 });
  V.text(R, 1270, 200, `= ${dhat.toFixed(2)}`, { size: 30, weight: 700, fill: "var(--green)" });
  V.text(R, 1270, 290, "sub-pixel and differentiable,\nunlike a hard argmin", { size: 19, cls: "muted" });
  V.line(R, 600 + dhat * 58 + 22, 60, 600 + dhat * 58 + 22, 300, { style: "stroke:var(--green)", "stroke-width": 3, "stroke-dasharray": "6 5" });
  return { steps: 2, set(s) { V.show(P, s >= 1); V.show(R, s >= 2); } };
};

VIZ.planeSweep = host => {
  const svg = V.svg(host, 1400, 440);
  const ref = [200, 400], src = [[60, 330], [340, 330]], P = [230, 120];
  V.rect(svg, 120, 90, 240, 30, "", { style: "fill:#b7bec4" });
  cam(svg, ref[0], ref[1], -Math.PI / 2, 48, "blue", "ref");
  src.forEach(c => cam(svg, c[0], c[1], Math.atan2(P[1] - c[1], P[0] - c[0]), 40, "orange", ""));
  V.circle(svg, P[0], P[1], 8, { style: "fill:var(--ink)" });
  const live = V.g(svg);
  const X = z => 560 + (z - 80) * 2.6, Y = v => 380 - v * 3.2;
  plotAxes(svg, X, Y, 80, 345, 0, 100, "plane depth", "disagreement");
  V.line(svg, X(280), Y(0), X(280), Y(95), { style: "stroke:var(--green)", "stroke-dasharray": "6 5" });
  V.text(svg, X(280), Y(0) + 22, "true depth", { size: 17, fill: "var(--green)", weight: 700 });
  const curve = V.path(svg, "", "", { style: "fill:none;stroke:var(--magenta);stroke-width:4" });
  V.text(svg, 1050, 60, "sweep a plane through depth: where the source views agree,\nthe plane passes through the surface", { size: 19 });
  const dis = z => { // spread of where the source rays to P cross the plane y = ref.y - z
    const yPl = ref[1] - z, hits = src.map(c => { const t = (yPl - c[1]) / (P[1] - c[1]); return c[0] + t * (P[0] - c[0]); });
    return Math.abs(hits[0] - hits[1]) * .15;
  };
  const pts = [];
  const lp = V.loop(t => {
    const z = 80 + ((t * 55) % 265), yPl = ref[1] - z;
    live.innerHTML = "";
    V.line(live, 40, yPl, 420, yPl, { style: "stroke:var(--green)", "stroke-width": 3 });
    src.forEach(c => { const tt = (yPl - c[1]) / (P[1] - c[1]), hx = c[0] + tt * (P[0] - c[0]); V.line(live, c[0], c[1], hx, yPl, { style: "stroke:var(--orange)", "stroke-dasharray": "5 4" }); V.circle(live, hx, yPl, 7, { style: "fill:var(--orange)" }); });
    if (z < 85) pts.length = 0;
    pts.push([z, Math.min(95, dis(z))]);
    curve.setAttribute("d", "M" + pts.map(([a, b]) => `${X(a)},${Y(b)}`).join("L"));
  });
  return { start() { pts.length = 0; lp.start(); }, stop: lp.stop };
};

VIZ.mvsnet = flow({
  w: 1400, h: 330, nodes: [
    { id: "a", x: 0, y: 110, w: 180, h: 100, label: "reference +\n~$N$ source views" },
    { id: "b", x: 230, y: 110, w: 190, h: 100, label: "shared 2D CNN\n~features", cls: "blue", step: 1 },
    { id: "c", x: 470, y: 110, w: 220, h: 100, label: "warp onto $D$\n~depth planes", step: 2 },
    { id: "d", x: 740, y: 110, w: 190, h: 100, label: "variance\n~→ cost volume", step: 2 },
    { id: "e", x: 980, y: 110, w: 170, h: 100, label: "3D CNN\n~→ probabilities", cls: "blue", step: 3 },
    { id: "f", x: 1200, y: 110, w: 190, h: 100, label: "depth map\n~+ confidence", cls: "good", step: 4 }],
  edges: [{ a: "a", b: "b", step: 1 }, { a: "b", b: "c", step: 2 }, { a: "c", b: "d", step: 2 }, { a: "d", b: "e", step: 3 }, { a: "e", b: "f", step: 4 }],
  texts: [{ x: 700, y: 290, t: "depth maps of many reference views are then filtered by confidence and fused (as in the classical pipeline)", step: 4, size: 19 }],
});

VIZ.monoScale = host => {
  const svg = V.svg(host, 1400, 440);
  const C = [100, 330], k = 3;                       // camera on the ground; the big house is k× larger and k× farther
  cam(svg, C[0], C[1] - 22, 0, 50, "blue", "");
  const house = (p, x, s, col) => V.path(p, `M${x},${C[1]} l0,${-60 * s} l${40 * s},${-40 * s} l${40 * s},${40 * s} l0,${60 * s} z`, "", { style: `fill:var(--${col}-soft);stroke:var(--${col});stroke-width:3` });
  V.line(svg, 60, C[1] + 2, 1360, C[1] + 2, { style: "stroke:var(--muted)" });
  const A = V.g(svg), B = fadeIn(V.g(svg)), x0 = 250;
  house(A, x0, 1, "orange"); V.text(A, x0 + 40, C[1] + 26, "toy house, 1.5 m away", { size: 19, fill: "var(--orange)", weight: 700 });
  const x1 = C[0] + (x0 - C[0]) * k;
  house(B, x1, k, "green"); V.text(B, x1 + 120, C[1] + 26, `real house, ${k}× larger and ${k}× farther`, { size: 19, fill: "var(--green)", weight: 700 });
  [[x0 + 40, C[1] - 100], [x0 + 80, C[1] - 60]].forEach(([x, y]) => V.line(svg, C[0], C[1], C[0] + (x - C[0]) * k * 1.12, C[1] + (y - C[1]) * k * 1.12, { style: "stroke:var(--blue)", "stroke-dasharray": "8 6" }));
  V.text(svg, 700, 395, "same image, different scenes: a single image fixes depth only up to scale", { size: 21, weight: 700, fill: "var(--blue)" });
  V.text(svg, 700, 428, "monocular networks learn plausible relative depth; metric scale needs a reference (SLAM points, a known size, IMU)", { size: 18, cls: "muted" });
  return { steps: 1, set(s) { V.show(B, s >= 1); } };
};

VIZ.scaleAlign = host => {
  const svg = V.svg(host, 1400, 430);
  reseed(21);
  const pts = range(40).map(() => { const d = .2 + rnd() * .75; return [d, 2.6 * d + .4 + .12 * gauss()]; });
  const n = pts.length, mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
  const s = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0), t = my - s * mx;
  const X = d => 120 + d * 700, Y = z => 390 - z * 115;
  plotAxes(svg, X, Y, 0, 1.05, 0, 3.2, "network depth (relative)", "SLAM depth [m]");
  pts.forEach(([a, b]) => V.circle(svg, X(a), Y(b), 6, { style: "fill:var(--blue)" }));
  const fit = fadeIn(V.g(svg));
  V.line(fit, X(0), Y(t), X(1), Y(s + t), { style: "stroke:var(--magenta)", "stroke-width": 4 });
  V.text(fit, 1140, 120, `least squares on sparse\nSLAM points: $s$ = ${s.toFixed(2)}, $t$ = ${t.toFixed(2)}`, { size: 21 });
  V.text(fit, 1140, 250, "metric depth = $s$ · network depth + $t$\nfor every pixel of the image", { size: 21, weight: 700, fill: "var(--magenta)" });
  V.text(svg, 1140, 360, "each dot: a pixel where VSLAM\nhas a triangulated landmark", { size: 18, cls: "muted" });
  return { steps: 1, set(st) { V.show(fit, st >= 1); } };
};
