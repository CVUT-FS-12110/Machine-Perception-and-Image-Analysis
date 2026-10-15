/* Lecture 3 — Part 4 (neural radiance fields) and Part 5 (3D Gaussian splatting). */
"use strict";

/* ------------------------------------------------------------ Part 4 */
VIZ.mvsToField = host => {
  const svg = V.svg(host, 1400, 430);
  const L = V.g(svg), R = fadeIn(V.g(svg));
  const FL = frame(30, 60, 600, 280), FR = frame(760, 60, 600, 280);
  V.text(L, 330, 22, "MVS: one depth map per reference view", { size: 21, weight: 700 });
  ["blue", "orange", "green"].forEach((c, i) => {
    const off = (i - 1) * .06;
    const segs = SEGS.filter(s => s[1] > -.2 + i * .1).map(s => [s[0], s[1] + off, s[2], s[3] + off]);
    drawContour(L, FL, c, 2.5, segs);
  });
  V.text(L, 330, 395, "separate estimates must be fused and may disagree", { size: 18, cls: "muted" });
  V.text(R, 1060, 22, "neural field: one function for the whole scene", { size: 21, weight: 700 });
  drawContour(R, FR, "ink", 3);
  [[-2.4, 1.6], [0, 1.9], [2.4, 1.6], [-2.6, -.8], [2.6, -.8]].forEach(([x, y]) => {
    const tx = x * .3, ty = y * .2;
    V.line(R, FR.X(x), FR.Y(y), FR.X(tx), FR.Y(ty), { style: "stroke:var(--blue)", "stroke-dasharray": "6 5", opacity: .7 });
    V.circle(R, FR.X(x), FR.Y(y), 8, { style: "fill:var(--blue)" });
  });
  V.text(R, 1060, 395, "every pixel of every camera constrains the same model", { size: 18, cls: "muted" });
  return { steps: 1, set(s) { V.show(R, s >= 1); } };
};

VIZ.nerfIO = flow({
  w: 1400, h: 330, nodes: [
    { id: "p", x: 0, y: 110, w: 170, h: 100, label: "pixel\n~+ pose, intrinsics" },
    { id: "r", x: 220, y: 110, w: 170, h: 100, label: "ray\n~origin + direction $**d**$", step: 1 },
    { id: "s", x: 440, y: 110, w: 180, h: 100, label: "samples $**x**$_i\n~along the ray", step: 1 },
    { id: "m", x: 670, y: 110, w: 190, h: 100, label: "MLP($**x**$_i, $**d**$)\n~→ $σ$_i, $**c**$_i", cls: "blue", step: 2 },
    { id: "v", x: 910, y: 110, w: 200, h: 100, label: "volume rendering\n~→ colour $Ĉ$", step: 3 },
    { id: "l", x: 1160, y: 110, w: 230, h: 100, label: "loss ‖$Ĉ$ − $C$_{photo}‖²", cls: "good", step: 4 }],
  edges: [{ a: "p", b: "r", step: 1 }, { a: "r", b: "s", step: 1 }, { a: "s", b: "m", step: 2 }, { a: "m", b: "v", step: 3 }, { a: "v", b: "l", step: 4 },
  { a: "l", b: "m", d: "M1275,215 Q1000,320 765,215", color: "magenta", step: 4, label: "gradients update the MLP weights", lx: 1020, ly: 300 }],
});

VIZ.posEnc = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 340);
  const target = x => (x > .3 && x < .45 ? 1 : 0) + (x > .6 ? .5 + .4 * Math.sin(40 * x) : 0);
  const X = x => 80 + x * 820, Y = y => 300 - y * 140;
  plotAxes(svg, X, Y, 0, 1.03, -.3, 1.6, "$x$", "");
  V.path(svg, V.pathFn(target, 0, 1, X, Y, 400), "", { style: "fill:none;stroke:var(--muted);stroke-width:3;stroke-dasharray:6 5" });
  const fit = V.path(svg, "", "curve", { style: "stroke:var(--magenta)" });
  const info = V.text(svg, 1160, 90, "", { size: 22, weight: 700 });
  V.text(svg, 1160, 190, "γ($x$) = [sin(2^k π$x$), cos(2^k π$x$)]_{k < L}\nfed to the network instead of $x$", { size: 19 });
  V.text(svg, 1160, 290, "curve: least-squares fit on γ($x$);\nfew frequencies = blurry, more = detail", { size: 17, cls: "muted" });
  const xs = range(300).map(i => i / 299), ys = xs.map(target);
  const solve = (A, b) => { const n = b.length; for (let i = 0; i < n; i++) { let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r; [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]]; for (let r = i + 1; r < n; r++) { const f = A[r][i] / A[i][i]; for (let c = i; c < n; c++) A[r][c] -= f * A[i][c]; b[r] -= f * b[i]; } } const x = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c]; x[i] = s / A[i][i]; } return x; };
  const upd = v => {
    const L = v.L, feat = x => [1, ...range(L).flatMap(k => [Math.sin(2 ** k * Math.PI * x), Math.cos(2 ** k * Math.PI * x)])];
    const F = xs.map(feat), n = F[0].length;
    const A = range(n).map(i => range(n).map(j => F.reduce((a, f) => a + f[i] * f[j], 0) + (i === j ? 1e-6 : 0)));
    const b = range(n).map(i => F.reduce((a, f, r) => a + f[i] * ys[r], 0));
    const w = solve(A, b);
    fit.setAttribute("d", V.pathFn(x => feat(x).reduce((a, f, i) => a + f * w[i], 0), 0, 1, X, Y, 400));
    V.setText(info, `L = ${L} frequencies`);
  };
  const sl = sliders(host, [{ k: "L", label: "frequencies L", min: 1, max: 9, step: 1, v: 2 }], upd);
  upd(sl.vals);
  return {};
};

VIZ.volRender = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 360);
  const N = 80, t0 = 0, t1 = 1, dt = (t1 - t0) / N, X = t => 120 + t * 760;
  V.text(svg, 60, 40, "ray", { size: 19, weight: 700 });
  const ray = V.g(svg);
  const rows = [["density $σ$(t)", 140, "orange"], ["transmittance $T$(t)", 230, "blue"], ["weight $w$ = $T$ α", 320, "magenta"]];
  const P = rows.map(([n, y, c]) => { V.text(svg, 110, y - 30, n, { size: 18, anchor: "end" }); V.line(svg, X(0), y, X(1), y, { style: "stroke:var(--rule)" }); return V.path(svg, "", "", { style: `fill:var(--${c});fill-opacity:.25;stroke:var(--${c});stroke-width:2.5` }); });
  const swatch = V.rect(svg, 1060, 60, 160, 160, "", { rx: 8, style: "stroke:var(--ink);stroke-width:2" });
  V.text(svg, 1140, 245, "rendered pixel", { size: 19, weight: 700 });
  const txt = V.text(svg, 1140, 300, "", { size: 18 });
  const upd = v => {
    const sig = [], col = [];
    for (let i = 0; i < N; i++) {
      const t = (i + .5) * dt;
      const surf = v.k / (1 + Math.exp(-(t - .62) * v.k * 2));          // solid object behind t = 0.62
      const fog = v.f * Math.exp(-((t - .3) ** 2) / .004);               // optional floater
      sig.push(surf + fog); col.push(t > .55 ? [.77, .42, 0] : [.42, .31, .7]);
    }
    let T = 1; const Ts = [], W = []; let C = [0, 0, 0];
    sig.forEach((s, i) => { const a = 1 - Math.exp(-s * dt); Ts.push(T); W.push(T * a); C = C.map((c, j) => c + T * a * col[i][j]); T *= 1 - a; });
    C = C.map(c => c + T * 1);  // white background
    const area = (vals, y, sc) => `M${X(0)},${y} ` + vals.map((vv, i) => `L${X((i + .5) * dt)},${y - Math.min(70, vv * sc)}`).join(" ") + ` L${X(1)},${y} Z`;
    const ms = Math.max(...sig) || 1, mw = Math.max(...W) || 1;
    P[0].setAttribute("d", area(sig, 140, 70 / ms)); P[1].setAttribute("d", area(Ts, 230, 70)); P[2].setAttribute("d", area(W, 320, 70 / mw));
    ray.innerHTML = "";
    V.line(ray, X(0), 40, X(1), 40, { style: "stroke:var(--ink)", "stroke-width": 2 });
    sig.forEach((s, i) => { if (i % 3 === 0) V.circle(ray, X((i + .5) * dt), 40, 4, { style: `fill:rgb(${col[i].map(c => c * 255).join(",")});opacity:${clamp(W[i] / mw, .15, 1)}` }); });
    swatch.style.fill = `rgb(${C.map(c => Math.round(clamp(c, 0, 1) * 255)).join(",")})`;
    V.setText(txt, `Σ $w$ = ${(1 - T).toFixed(2)}, background ${T.toFixed(2)}`);
  };
  const sl = sliders(host, [{ k: "k", label: "surface sharpness", min: 2, max: 60, step: 1, v: 30 }, { k: "f", label: "floater density", min: 0, max: 30, step: 1, v: 0 }], upd);
  upd(sl.vals);
  return {};
};

VIZ.renderTable = host => {
  const svg = V.svg(host, 1400, 430);
  const sig = [0, .5, 8, 2], c = [.9, .6, .2, .4], d = .25;
  const a = sig.map(s => 1 - Math.exp(-s * d)); const T = []; let t = 1; a.forEach(v => { T.push(t); t *= 1 - v; }); const w = a.map((v, i) => T[i] * v);
  const C = w.reduce((s, v, i) => s + v * c[i], 0) + t * 1;
  const cols = [["sample $i$", i => i + 1], ["$σ$_i", i => sig[i]], ["$α$_i = 1 − e^{−σδ}", i => a[i].toFixed(3)], ["$T$_i = Π(1 − $α$_j)", i => T[i].toFixed(3)], ["$w$_i = $T$_i $α$_i", i => w[i].toFixed(3)], ["$c$_i", i => c[i]], ["$w$_i $c$_i", i => (w[i] * c[i]).toFixed(3)]];
  const G = cols.map(([h, f], j) => {
    const g = fadeIn(V.g(svg)), x = 90 + j * 190;
    V.text(g, x, 40, h, { size: 19, weight: 700 });
    range(4).forEach(i => V.text(g, x, 95 + i * 50, f(i), { size: 21 }));
    return g;
  });
  V.line(svg, 20, 62, 1380, 62, { style: "stroke:var(--ink)", "stroke-width": 2 });
  const res = fadeIn(V.g(svg));
  V.text(res, 700, 330, `$Ĉ$ = Σ $w$_i $c$_i + $T$_{end} · background = ${(C - t).toFixed(3)} + ${t.toFixed(3)} · 1.0 = **${C.toFixed(3)}**`, { size: 24 });
  V.text(res, 700, 385, "sample 3 (high density) dominates: it is the first opaque thing the ray meets", { size: 20, fill: "var(--blue)", weight: 700 });
  V.text(svg, 1300, 410, "step δ = 0.25", { size: 17, cls: "muted" });
  return { steps: 4, set(s) { G.forEach((g, j) => V.show(g, j <= [1, 2, 3, 4, 6][s] || j === 0)); V.show(res, s >= 4); } };
};

VIZ.nerfTrain = host => {
  const svg = V.svg(host, 1400, 430);
  const F = frame(300, 40, 700, 340);
  drawContour(svg, F, "ink", 2.5);
  const cams = [[-2.3, 1.7], [0, 2.05], [2.3, 1.7], [-2.7, -.6], [2.7, -.6]].map(([x, y]) => [F.X(x), F.Y(y)]);
  cams.forEach(c => cam(svg, c[0], c[1], Math.atan2(F.Y(.2) - c[1], F.X(0) - c[0]), 40, "blue"));
  const live = V.g(svg);
  const info = V.text(svg, 1200, 200, "", { size: 21 });
  V.text(svg, 1200, 300, "each step: a random batch of rays\nfrom all training images", { size: 18, cls: "muted" });
  let last = -1;
  const lp = V.loop(t => {
    const k = Math.floor(t / .35); if (k === last) return; last = k;
    if (k % 6 === 0) live.innerHTML = "";
    reseed(k * 7 + 1);
    const c = cams[k % cams.length], tx = F.X(-1.6 + rnd() * 3.2), ty = F.Y(-.9 + rnd() * 2.3);
    const dx = tx - c[0], dy = ty - c[1], L = Math.hypot(dx, dy), u = [dx / L, dy / L];
    let hit = null;
    for (let s = 0; s < 700; s += 3) { const x = c[0] + u[0] * s, y = c[1] + u[1] * s; if (sdf(F.ix(x), F.iy(y)) < 0) { hit = [x, y]; break; } }
    const end = hit || [c[0] + u[0] * 600, c[1] + u[1] * 600];
    V.line(live, c[0], c[1], end[0], end[1], { style: "stroke:var(--magenta)", "stroke-width": 2, opacity: .8 });
    range(12).forEach(i => { const s = i / 11, x = c[0] + (end[0] - c[0]) * s, y = c[1] + (end[1] - c[1]) * s; V.circle(live, x, y, i === 11 && hit ? 7 : 3, { style: `fill:var(--${i === 11 && hit ? "green" : "magenta"})` }); });
    V.setText(info, `iteration ${k + 1}: loss ${(0.25 * Math.exp(-k / 30) + .01).toFixed(3)}`);
  });
  return { start() { last = -1; live.innerHTML = ""; lp.start(); }, stop: lp.stop };
};

VIZ.hierSampling = host => {
  const svg = V.svg(host, 1400, 420);
  const X = t => 120 + t * 1000, sigma = t => 40 * Math.exp(-((t - .63) ** 2) / .0008) + 6 * Math.exp(-((t - .3) ** 2) / .002);
  const rowC = 90, rowW = 230, rowF = 340;
  V.text(svg, 100, rowC, "coarse", { size: 19, anchor: "end", weight: 700 }); V.text(svg, 100, rowW - 30, "weights", { size: 19, anchor: "end", weight: 700 }); V.text(svg, 100, rowF, "fine", { size: 19, anchor: "end", weight: 700 });
  [rowC, rowF].forEach(y => V.line(svg, X(0), y, X(1), y, { style: "stroke:var(--ink)" }));
  const Nc = 32, tc = range(Nc).map(i => (i + .5) / Nc);
  tc.forEach(t => V.circle(svg, X(t), rowC, 5, { style: "fill:var(--blue)" }));
  let T = 1; const w = tc.map(t => { const a = 1 - Math.exp(-sigma(t) / Nc); const v = T * a; T *= 1 - a; return v; }), mw = Math.max(...w);
  const W = fadeIn(V.g(svg));
  tc.forEach((t, i) => V.rect(W, X(t) - 12, rowW - w[i] / mw * 90, 24, w[i] / mw * 90, "", { style: "fill:var(--magenta);fill-opacity:.6" }));
  V.line(W, X(0), rowW, X(1), rowW, { style: "stroke:var(--rule)" });
  const Fg = fadeIn(V.g(svg));
  const cdf = []; let s = 0; w.forEach(v => { s += v; cdf.push(s); });
  range(48).forEach(i => { const u = (i + .5) / 48 * s; let k = cdf.findIndex(v => v >= u); const prev = k ? cdf[k - 1] : 0; const t = (k + (u - prev) / (w[k] || 1)) / Nc; V.circle(Fg, X(t), rowF, 5, { style: "fill:var(--green)" }); });
  V.text(Fg, 1270, rowF, "samples where\nthe weight is", { size: 18, cls: "muted" });
  V.text(svg, 1270, rowC, "uniform", { size: 18, cls: "muted" });
  return { steps: 2, set(st) { V.show(W, st >= 1); V.show(Fg, st >= 2); } };
};

VIZ.coverage = host => {
  const svg = V.svg(host, 1400, 440);
  const F = frame(250, 120, 560, 260);
  drawContour(svg, F, "ink", 3);
  range(7).forEach(i => { const a = Math.PI * (1.15 + .7 * i / 6), x = 530 + 400 * Math.cos(a), y = 250 + 230 * Math.sin(a); cam(svg, x, y, Math.atan2(250 - y, 530 - x), 36, "blue"); });
  V.text(svg, 530, 432, "training cameras (blue) all look from the top", { size: 19, fill: "var(--blue)", weight: 700 });
  const good = fadeIn(V.g(svg));
  cam(good, 300, 70, Math.atan2(250 - 70, 530 - 300), 44, "green", "");
  V.text(good, 1100, 120, "novel view inside the coverage:\ninterpolates well", { size: 21, fill: "var(--green)", weight: 700 });
  const bad = fadeIn(V.g(svg));
  cam(bad, 560, 430, -Math.PI / 2, 44, "red", "");
  reseed(4); range(9).forEach(() => V.el("ellipse", { cx: 400 + rnd() * 280, cy: 330 + rnd() * 80, rx: 8 + rnd() * 18, ry: 5 + rnd() * 10, style: "fill:var(--red);fill-opacity:.35" }, bad));
  V.text(bad, 1100, 270, "view from below: never observed;\nfloaters and invented content", { size: 21, fill: "var(--red)", weight: 700 });
  return { steps: 2, set(s) { V.show(good, s >= 1); V.show(bad, s >= 2); } };
};

VIZ.hashGrid = host => {
  const svg = V.svg(host, 1400, 430);
  const q = [.37, .58], lv = [[4, "blue"], [8, "orange"], [16, "green"]];
  const G = lv.map(([n, c], i) => {
    const g = fadeIn(V.g(svg)), ox = 40 + i * 300, s = 240 / n;
    for (let a = 0; a <= n; a++) { V.line(g, ox + a * s, 60, ox + a * s, 300, { style: `stroke:var(--${c})`, "stroke-width": 1 }); V.line(g, ox, 60 + a * s, ox + 240, 60 + a * s, { style: `stroke:var(--${c})`, "stroke-width": 1 }); }
    const cx = Math.floor(q[0] * n), cy = Math.floor(q[1] * n);
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([a, b]) => V.circle(g, ox + (cx + a) * s, 60 + (cy + b) * s, 6, { style: `fill:var(--${c})` }));
    V.circle(g, ox + q[0] * 240, 60 + q[1] * 240, 7, { style: "fill:var(--magenta)" });
    V.text(g, ox + 120, 40, `level ${i + 1}: ${n} × ${n}`, { size: 19, weight: 700, fill: `var(--${c})` });
    V.text(g, ox + 120, 330, "interpolate 4 corner\nfeature vectors", { size: 17, cls: "muted" });
    return g;
  });
  const M = fadeIn(V.g(svg));
  V.arrow(M, 960, 180, 1010, 180);
  V.box(M, 1020, 130, 160, 100, "concat\n~features", "box", { size: 19 }); V.arrow(M, 1185, 180, 1225, 180);
  V.box(M, 1230, 130, 150, 100, "tiny MLP\n~→ $σ$, $**c**$", "box blue", { size: 19 });
  V.text(M, 1200, 300, "features live in hash tables;\ntraining in seconds–minutes\ninstead of hours–days", { size: 19 });
  return { steps: 3, set(s) { G.forEach((g, i) => V.show(g, i <= s)); V.show(M, s >= 3); } };
};

VIZ.nerfDepth = host => {
  const svg = V.svg(host, 1400, 430);
  const X = t => 140 + t * 900;
  const ray = (y, wf, title, col) => {
    const g = V.g(svg);
    V.text(g, 700, y - 110, title, { size: 21, weight: 700, fill: `var(--${col})` });
    V.line(g, X(0), y, X(1), y, { style: "stroke:var(--ink)" });
    const ws = range(60).map(i => wf((i + .5) / 60)), S = ws.reduce((a, b) => a + b), wn = ws.map(v => v / S), m = Math.max(...wn);
    wn.forEach((v, i) => V.rect(g, X((i + .5) / 60) - 6, y - v / m * 80, 12, v / m * 80, "", { style: `fill:var(--${col});fill-opacity:.55` }));
    const ed = wn.reduce((a, v, i) => a + v * (i + .5) / 60, 0);
    V.line(g, X(ed), y - 95, X(ed), y + 10, { style: "stroke:var(--ink)", "stroke-width": 3, "stroke-dasharray": "6 4" });
    V.text(g, X(ed), y + 28, `expected depth Σ $w$_i $t$_i = ${ed.toFixed(2)}`, { size: 18, weight: 700 });
    return g;
  };
  ray(160, t => Math.exp(-((t - .7) ** 2) / .0005), "surface: weights peak at t = 0.70 → good depth", "green");
  const b = fadeIn(ray(370, t => Math.exp(-((t - .7) ** 2) / .0005) + .8 * Math.exp(-((t - .32) ** 2) / .0008), "floater in front: two peaks → depth 0.52 lies in empty space", "red"));
  V.text(svg, 1220, 200, "depth and meshes can be\nextracted, but nothing forces\nthe density to form a clean\nsurface — SDF-based variants\n(NeuS, VolSDF) do", { size: 18, cls: "muted" });
  return { steps: 1, set(s) { V.show(b, s >= 1); } };
};

/* ------------------------------------------------------------ Part 5 */
VIZ.whyGS = host => {
  const svg = V.svg(host, 1400, 420);
  const A = V.g(svg), B = fadeIn(V.g(svg));
  V.text(A, 340, 30, "NeRF: ask the network at every sample", { size: 21, weight: 700 });
  for (let r = 0; r < 6; r++) { const y = 80 + r * 36; V.line(A, 60, y, 560, y + (r - 2.5) * 10, { style: "stroke:var(--magenta)", opacity: .6 }); range(14).forEach(i => V.circle(A, 60 + i * 36, y + (r - 2.5) * 10 * i / 14, 3.5, { style: "fill:var(--magenta)" })); }
  V.text(A, 330, 345, "1920 × 1080 pixels × ~200 samples\n≈ 400 million network queries per frame", { size: 20, weight: 700, fill: "var(--red)" });
  V.text(B, 1050, 30, "3DGS: project each primitive once", { size: 21, weight: 700 });
  reseed(8); range(26).forEach(() => {
    const cx = 820 + rnd() * 460, cy = 90 + rnd() * 190;
    V.el("ellipse", { cx, cy, rx: 10 + rnd() * 40, ry: 6 + rnd() * 18, transform: `rotate(${(rnd() * 180).toFixed(0)} ${cx} ${cy})`, style: `fill:var(--${["blue", "orange", "green", "violet"][Math.floor(rnd() * 4)]});fill-opacity:.35` }, B);
  });
  V.text(B, 1050, 345, "a few million Gaussians, sorted and blended\non the GPU: real time at 1080p", { size: 20, weight: 700, fill: "var(--green)" });
  return { steps: 1, set(s) { V.show(B, s >= 1); } };
};

VIZ.gaussParams = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 330);
  const g = V.g(svg), mat = V.g(svg);
  const defs = V.el("defs", {}, svg), rg = V.el("radialGradient", { id: "gfall" }, defs);
  [["0", 1], [".5", .6], ["1", 0]].forEach(([o, a]) => V.el("stop", { offset: o, "stop-color": "#c2187a", "stop-opacity": a }, rg));
  const upd = v => {
    g.innerHTML = ""; mat.innerHTML = "";
    const th = v.r * Math.PI / 180;
    V.el("ellipse", { cx: 330, cy: 165, rx: v.sx * 50, ry: v.sy * 50, transform: `rotate(${-v.r} 330 165)`, style: `fill:url(#gfall);opacity:${v.o}` }, g);
    V.circle(g, 330, 165, 5, { style: "fill:var(--ink)" }); V.text(g, 345, 150, "$**μ**$", { size: 22, anchor: "start" });
    const c = Math.cos(th), s = Math.sin(th), a = (v.sx) ** 2, b = (v.sy) ** 2;
    const S = [[c * c * a + s * s * b, c * s * (a - b)], [c * s * (a - b), s * s * a + c * c * b]];
    V.text(mat, 960, 60, "$**Σ**$ = $**R**$ $**S**$ $**S**$^T $**R**$^T", { size: 26 });
    V.text(mat, 960, 140, `$**Σ**$ = [ ${S[0][0].toFixed(2)}  ${S[0][1].toFixed(2)} ; ${S[1][0].toFixed(2)}  ${S[1][1].toFixed(2)} ]`, { size: 22 });
    V.text(mat, 960, 220, "rotation $**R**$ and scales $**S**$ are optimized,\nso $**Σ**$ always stays a valid covariance", { size: 18, cls: "muted" });
    V.text(mat, 960, 300, `opacity α = ${v.o.toFixed(2)} · colour: spherical harmonics`, { size: 19 });
  };
  const sl = sliders(host, [{ k: "sx", label: "scale 1", min: .3, max: 5, step: .1, v: 3.2 }, { k: "sy", label: "scale 2", min: .3, max: 5, step: .1, v: 1 }, { k: "r", label: "rotation", min: 0, max: 180, step: 5, v: 25 }, { k: "o", label: "opacity", min: .1, max: 1, step: .05, v: .9 }], upd);
  upd(sl.vals);
  return {};
};

VIZ.projectGauss = host => {
  const svg = V.svg(host, 1400, 430);
  const C = [100, 220];
  cam(svg, C[0], C[1], 0, 70, "blue", "");
  V.line(svg, C[0] + 70, 100, C[0] + 70, 340, { style: "stroke:var(--blue)", "stroke-width": 4 });
  V.text(svg, C[0] + 70, 365, "image plane", { size: 17, cls: "muted" });
  V.rect(svg, 1040, 60, 320, 260, "cell", { rx: 6 }); V.text(svg, 1200, 40, "2D splat in the image", { size: 19, weight: 700 });
  const live = V.g(svg), img = V.g(svg);
  V.text(svg, 700, 405, "$**Σ**$′ = $**J**$ $**W**$ $**Σ**$ $**W**$^T $**J**$^T   (W: world → camera, J: Jacobian of the projection)", { size: 20 });
  const lp = V.loop(t => {
    const z = 520 + 260 * Math.sin(t * .6), ang = t * 40, y = 220 + 40 * Math.sin(t * .9), sx = 80, sy = 30;
    live.innerHTML = ""; img.innerHTML = "";
    V.el("ellipse", { cx: z, cy: y, rx: sx, ry: sy, transform: `rotate(${ang} ${z} ${y})`, style: "fill:var(--magenta);fill-opacity:.35;stroke:var(--magenta);stroke-width:2" }, live);
    V.line(live, C[0], C[1], z, y, { style: "stroke:var(--muted)", "stroke-dasharray": "5 4" });
    const f = 300 / (z - C[0]);  // perspective scale
    V.el("ellipse", { cx: 1200, cy: 190 + (y - 220) * f, rx: sx * f * 1.5, ry: sy * f * 1.5 + 4, transform: `rotate(${ang} 1200 ${190 + (y - 220) * f})`, style: "fill:var(--magenta);fill-opacity:.45;stroke:var(--magenta);stroke-width:2" }, img);
  });
  return { start: lp.start, stop: lp.stop };
};

VIZ.alphaBlend = host => {
  const svg = V.svg(host, 1400, 430);
  const S = [["blue", .6, 120], ["orange", .5, 250], ["green", .7, 380], ["violet", .9, 510]];
  const px = [700, 210];
  V.text(svg, 300, 22, "splats overlapping one pixel, sorted front to back", { size: 20, weight: 700 });
  const G = S.map(([c, a, x], i) => {
    const g = fadeIn(V.g(svg));
    V.el("ellipse", { cx: x + 100, cy: 210, rx: 120, ry: 70, style: `fill:var(--${c});fill-opacity:${a * .6};stroke:var(--${c});stroke-width:2` }, g);
    V.text(g, x + 100, 300, `α = ${a}`, { size: 18 });
    return g;
  });
  V.circle(svg, 640, 210, 8, { style: "fill:var(--ink)" });
  const rows = []; let T = 1;
  S.forEach(([c, a], i) => { rows.push([c, a, T, T * a]); T *= 1 - a; });
  const tab = S.map(([c], i) => {
    const g = fadeIn(V.g(svg)), [, a, Ti, w] = rows[i];
    V.rect(g, 860, 80 + i * 60, 34, 34, "", { style: `fill:var(--${c})` });
    V.text(g, 910, 97 + i * 60, `$T$ = ${Ti.toFixed(3)}   $w$ = $T$α = ${w.toFixed(3)}`, { size: 20, anchor: "start" });
    return g;
  });
  const f = fadeIn(V.text(svg, 1050, 360, "$C$ = Σ $c$_i α_i Π_{j<i}(1 − α_j)\n— the same formula as NeRF's volume rendering", { size: 21, weight: 700, fill: "var(--blue)" }));
  return { steps: 4, set(s) { G.forEach((g, i) => V.show(g, i < s || s === 0)); tab.forEach((g, i) => V.show(g, i < s)); V.show(f, s >= 4); } };
};

VIZ.gsPipeline = flow({
  w: 1400, h: 360, nodes: [
    { id: "a", x: 0, y: 130, w: 200, h: 100, label: "SfM / SLAM\n~points + poses" },
    { id: "b", x: 260, y: 130, w: 200, h: 100, label: "initial\n~Gaussians", cls: "blue", step: 1 },
    { id: "c", x: 520, y: 130, w: 200, h: 100, label: "rasterize\n~a training view", step: 2 },
    { id: "d", x: 780, y: 130, w: 200, h: 100, label: "loss vs.\n~the photo", step: 2 },
    { id: "e", x: 1040, y: 130, w: 200, h: 100, label: "gradients →\n~all parameters", cls: "blue", step: 3 },
    { id: "f", x: 780, y: 280, w: 200, h: 70, label: "densify / prune", cls: "good", step: 4 }],
  edges: [{ a: "a", b: "b", step: 1 }, { a: "b", b: "c", step: 2 }, { a: "c", b: "d", step: 2 }, { a: "d", b: "e", step: 3 },
  { a: "e", b: "c", d: "M1140,125 Q880,20 620,125", color: "magenta", step: 3, label: "repeat ~30 000 times", lx: 880, ly: 55 },
  { a: "e", b: "f", d: "M1140,235 L1140,315 L985,315", step: 4 }],
});

VIZ.densify = host => {
  const svg = V.svg(host, 1400, 430);
  const F = frame(40, 40, 860, 360);
  drawContour(svg, F, "rule", 2);
  const st = [[6, "start: few Gaussians from sparse SfM points"], [14, "clone small ones where detail is missing"], [30, "split large ones that cover too much"], [60, "prune nearly transparent ones; detail where needed"]];
  const g = V.g(svg), t = V.text(svg, 1150, 160, "", { size: 22, weight: 700 }), n = V.text(svg, 1150, 240, "", { size: 20, cls: "muted" });
  V.text(svg, 1150, 330, "illustration on the 2D cross-section", { size: 16, cls: "muted" });
  return { steps: 3, set(s) { g.innerHTML = ""; gaussFit(st[s][0]).forEach(e => ellipse(g, F, e)); V.setText(t, st[s][1]); V.setText(n, `${st[s][0]} primitives`); } };
};

VIZ.gsGeometry = host => {
  const svg = V.svg(host, 1400, 430);
  const FA = frame(30, 50, 620, 320), FB = frame(740, 50, 620, 320);
  V.text(svg, 340, 25, "3DGS: blobs explain the images", { size: 21, weight: 700 });
  drawContour(svg, FA, "ink", 2.5);
  gaussFit(24).forEach(e => { ellipse(svg, FA, e); V.circle(svg, FA.X(e.c[0]), FA.Y(e.c[1]), 3, { style: "fill:var(--ink)" }); });
  V.text(svg, 340, 405, "centres lie inside the object, not on its surface", { size: 18, cls: "muted" });
  const B = fadeIn(V.g(svg));
  V.text(B, 1050, 25, "surface-aligned (2DGS, SuGaR, …)", { size: 21, weight: 700 });
  drawContour(B, FB, "ink", 2.5);
  SEGS.filter((_, i) => i % 9 === 0).forEach(s => {
    const cx = (s[0] + s[2]) / 2, cy = (s[1] + s[3]) / 2, ang = Math.atan2(s[3] - s[1], s[2] - s[0]);
    V.el("ellipse", { cx: FB.X(cx), cy: FB.Y(cy), rx: 18, ry: 3.5, transform: `rotate(${-ang * 180 / Math.PI} ${FB.X(cx)} ${FB.Y(cy)})`, style: "fill:var(--green);fill-opacity:.55;stroke:var(--green)" }, B);
  });
  V.text(B, 1050, 405, "flat discs on the surface: geometry can be extracted", { size: 18, cls: "muted" });
  return { steps: 1, set(s) { V.show(B, s >= 1); } };
};
