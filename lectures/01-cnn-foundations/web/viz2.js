/* Visuals for Part 3 (building a CNN). */
"use strict";

/* Feature maps computed in the browser from a small procedural image. */
VIZ.featureMaps = host => {
  const n = 96, img = new Float32Array(n * n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const r = Math.hypot(x - 48, y - 48);
    img[y * n + x] = r < 12 ? 0.85 : r < 34 ? 0.25 : 0.85;
  }
  const conv = K => {
    const o = new Float32Array(n * n);
    for (let y = 1; y < n - 1; y++) for (let x = 1; x < n - 1; x++) {
      let a = 0; for (let u = -1; u <= 1; u++) for (let v = -1; v <= 1; v++) a += K[u + 1][v + 1] * img[(y + u) * n + x + v];
      o[y * n + x] = Math.max(0, a); // ReLU
    }
    return o;
  };
  const maps = [
    ["input", img, null],
    ["channel 3", conv([[1, 0, -1], [2, 0, -2], [1, 0, -1]]), "light→dark edges, left to right"],
    ["channel 8", conv([[1, 2, 1], [0, 0, 0], [-1, -2, -1]]), "light→dark edges, top to bottom"],
    ["channel 12", conv([[-.3, -.3, -.3], [-.3, -.3, -.3], [-.3, -.3, -.3]].map(r => r.map(v => v))).map((v, i) => Math.max(0, 1 - img[i] - .2)), "dark region"],
    ["channel 27", conv([[.9, -1.2, .4], [-.6, 1.1, -.8], [.3, -.4, .2]]), "no simple name"],
  ];
  host.style.flexDirection = "column";
  host.innerHTML = `<div style="display:flex;gap:34px;align-items:flex-start"></div>`;
  const row = host.firstChild, figs = [];
  maps.forEach(([name, data, note], k) => {
    const f = document.createElement("figure");
    f.style.cssText = "margin:0;text-align:center;font-size:23px";
    f.className = k ? "fade" : "";
    const c = document.createElement("canvas"); c.width = n; c.height = n;
    c.style.cssText = "width:220px;height:220px;image-rendering:pixelated;border:1px solid var(--rule)";
    const ctx = c.getContext("2d"), im = ctx.createImageData(n, n);
    const mx = Math.max(...data) || 1;
    for (let i = 0; i < n * n; i++) {
      const v = k ? 255 * (data[i] / mx) : 255 * data[i];
      im.data[4 * i] = im.data[4 * i + 1] = im.data[4 * i + 2] = k ? 20 + v * .92 : v; im.data[4 * i + 3] = 255;
    }
    ctx.putImageData(im, 0, 0);
    f.innerHTML = `<div style="font-weight:700;margin-bottom:8px">${name}</div>`;
    f.appendChild(c);
    if (note) f.insertAdjacentHTML("beforeend", `<figcaption style="color:var(--muted);font-size:21px;margin-top:6px;max-width:230px">${note}</figcaption>`);
    row.appendChild(f); figs.push(f);
  });
  host.insertAdjacentHTML("beforeend", `<p style="font-size:22px;color:var(--muted);margin:14px 0 0">bright = strong response of that channel's filter (after ReLU); computed live in the browser</p>`);
  return { steps: 4, set(s) { figs.forEach((f, i) => { if (i) f.style.opacity = i <= s ? 1 : 0; }); } };
};

VIZ.stack = host => {
  const svg = V.svg(host, 1400, 330);
  const a = V.g(svg, { class: "g-anim" }), b = V.g(svg, { class: "g-anim" });
  V.box(a, 0, 30, 190, 70, "conv 3 × 3"); V.box(b, 0, 30, 190, 70, "conv 3 × 3");
  V.move(a, 40, 0); V.move(b, 330, 0);
  const ar = V.arrow(svg, 235, 65, 362, 65); ar.classList.add("fade");
  const eq = V.g(svg, { class: "fade" });
  V.text(eq, 590, 65, "=", { size: 40 });
  V.box(eq, 650, 30, 300, 70, "a single conv 5 × 5", "box bad");
  V.text(eq, 1160, 65, "two linear operations collapse", { size: 23, cls: "muted" });
  const r2 = V.g(svg, { class: "fade" });
  [[40, "conv 3 × 3", ""], [300, "ReLU", "blue"], [520, "conv 3 × 3", ""], [780, "ReLU", "blue"], [1000, "nonlinear feature", "good"]].forEach(([x, l, c], i, arr) => {
    V.box(r2, x, 200, l.length > 10 ? 250 : (c ? 150 : 190), 70, l, "box " + c);
    if (i < arr.length - 1) V.arrow(r2, x + (c ? 150 : 190) + 5, 235, arr[i + 1][0] - 8, 235);
  });
  return {
    steps: 2, set(s) {
      V.move(b, s >= 1 ? 40 : 330, 0); a.style.opacity = b.style.opacity = s >= 1 ? 0.25 : 1;
      V.show(ar, s < 1); V.show(eq, s >= 1); V.show(r2, s >= 2);
    }
  };
};


VIZ.receptive = host => {
  const svg = V.svg(host, 1400, 430), s = 70;
  const T = rfTree(svg, 300, 350, [{ K: 3, S: 1 }, { K: 3, S: 1 }, { K: 3, S: 1 }], s, { dy: 105 });
  ["input", "layer 1", "layer 2", "layer 3"].forEach((t, l) => V.text(svg, 280, T.rowY(l) + s / 2, t, { size: 22, anchor: "end", weight: 700 }));
  const info = V.text(svg, 1080, 200, "", { size: 26 });
  return {
    steps: 3, set(st) {
      const center = st ? Math.floor(T.sizes[st] / 2) : -1;
      const n = T.cone(st || -1, center);
      info.innerHTML = "";
      V.text(info, 1080, 200, st ? `one layer-${st} unit sees` : "", { size: 26 });
      V.text(info, 1080, 245, st ? `**${n}** input pixels` : "", { size: 30 });
    }
  };
};

VIZ.rfGrowth = host => {
  const svg = V.svg(host, 1400, 430), s = 38;
  const A = rfTree(svg, 30, 330, [{ K: 3, S: 1 }, { K: 3, S: 1 }, { K: 3, S: 1 }], s, { dy: 90 });
  A.cone(3, 0);
  V.text(svg, 30 + 3.5 * s, 402, "three 3 × 3, stride 1:  RF = 7", { size: 23, weight: 700 });
  const right = V.g(svg, { class: "fade" });
  const B = rfTree(right, 470, 330, [{ K: 3, S: 2 }, { K: 3, S: 2 }, { K: 3, S: 1 }], s, { dy: 90 });
  B.cone(3, 0);
  V.text(right, 470 + 7.5 * s, 402, "three 3 × 3, stride 2:  RF = 15", { size: 23, weight: 700 });
  const f = V.g(svg, { class: "fade" });
  V.box(f, 1070, 40, 330, 270, "$r$_l = $r$_{l−1} + ($K$_l − 1)·$j$_{l−1}\n\n$j$_l = $j$_{l−1}·$S$_l\n\n~$j$ = step between\n~neighbouring units,\n~in input pixels", "box blue", { size: 25 });
  return { steps: 2, set(st) { V.show(right, st >= 1); V.show(f, st >= 2); } };
};

VIZ.hierarchy = host => {
  const svg = V.svg(host, 1400, 380);
  const titles = [["layer 1", "edges"], ["layers 2–3", "corners and arcs"], ["deeper layers", "parts"], ["last layers", "object"]];
  const P = titles.map(([t, s], i) => {
    const g = V.g(svg, { class: "fade" }), x = i * 350;
    V.rect(g, x, 30, 290, 290, "cell", { rx: 8 });
    V.text(g, x + 145, 10, t, { size: 23, weight: 700 }); V.text(g, x + 145, 348, s, { size: 23, cls: "muted" });
    if (i < 3) V.arrow(g, x + 297, 175, x + 343, 175);
    return g;
  });
  const st = "stroke:var(--ink);stroke-width:7;fill:none;stroke-linecap:round";
  [[60, 80, 0], [145, 80, 45], [230, 80, 90], [60, 175, 135], [145, 175, 90], [230, 175, 0], [60, 270, 45], [145, 270, 135], [230, 270, 0]].forEach(([x, y, a]) => {
    const r = a * Math.PI / 180, dx = Math.cos(r) * 28, dy = Math.sin(r) * 28;
    V.path(P[0], `M${x - dx},${y - dy} L${x + dx},${y + dy}`, "", { style: st });
  });
  ["M400,70 L400,130 L460,130", "M560,70 L620,70 L620,130", "M400,240 A60,60 0 0 1 460,180", "M620,300 A60,60 0 0 0 560,240", "M380,300 L440,300"].forEach(d => V.path(P[1], d, "", { style: st }));
  V.circle(P[2], 790, 120, 45, { style: st }); V.circle(P[2], 790, 120, 10, { style: "fill:var(--ink)" });
  V.path(P[2], "M850,290 A110,110 0 0 0 850,180", "", { style: st }); V.circle(P[2], 760, 260, 20, { style: st });
  V.circle(P[3], 1195, 175, 115, { style: "fill:#bbb;stroke:var(--ink);stroke-width:4" });
  V.circle(P[3], 1195, 175, 40, { style: "fill:#fff;stroke:var(--ink);stroke-width:4" });
  [45, 135, 225, 315].forEach(a => V.circle(P[3], 1195 + 78 * Math.cos(a * Math.PI / 180), 175 + 78 * Math.sin(a * Math.PI / 180), 12, { style: "fill:#fff;stroke:var(--ink);stroke-width:3" }));
  return { steps: 3, set(s) { P.forEach((g, i) => V.show(g, i <= s)); } };
};

VIZ.pointwise = host => {
  const svg = V.svg(host, 1400, 400);
  const draw = (x, color) => cuboid(svg, x, 110, 230, 230, 110, color);
  draw(20, "blue"); draw(1090, "green");
  V.text(svg, 175, 385, "$C$_{in} × $H$ × $W$", { size: 22 }); V.text(svg, 1245, 385, "$C$_{out} × $H$ × $W$", { size: 22 });
  const col = (x) => { const g = V.g(svg, { class: "g-anim" }); V.path(g, `M${x},140 l60,-44 l0,0`, "", {}); V.rect(g, x, 0, 34, 34, "", { style: "fill:var(--orange)" }); V.path(g, `M${x},0 l60,-44 l34,0 l-60,44 z`, "", { style: "fill:var(--orange);opacity:.7" }); V.path(g, `M${x + 34},0 l60,-44 l0,34 l-60,44 z`, "", { style: "fill:var(--orange);opacity:.5" }); return g; };
  const c1 = col(0), c2 = col(0);
  V.move(c1, 32, 122); V.move(c2, 1102, 122);
  V.box(svg, 425, 155, 180, 110, "$**x**$_{h,w}\n~$C$_{in} values", "box", { size: 25 });
  V.text(svg, 640, 210, "×", { size: 40 });
  V.box(svg, 675, 155, 180, 110, "$**W**$\n~$C$_{out} × $C$_{in}", "box blue", { size: 25 });
  V.text(svg, 890, 210, "=", { size: 40 });
  V.box(svg, 925, 155, 140, 110, "$**y**$_{h,w}\n~$C$_{out}", "box", { size: 25 });
  V.arrow(svg, 360, 210, 422, 210);
  V.text(svg, 700, 330, "the same small matrix at every pixel; no neighbouring pixels are used", { size: 22, cls: "muted" });
  const lp = V.loop(t => { const k = Math.floor(t / .7) % 25, r = Math.floor(k / 5), c = k % 5; V.move(c1, 20 + 12 + c * 40, 110 + 12 + r * 40); V.move(c2, 1090 + 12 + c * 40, 110 + 12 + r * 40); });
  return { start: lp.start, stop: lp.stop };
};

VIZ.pooling = host => {
  const svg = V.svg(host, 1400, 400), s = 78;
  const X = [[1, 3, 2, 0], [4, 8, 1, 1], [0, 2, 5, 7], [6, 4, 3, 1]];
  const cols = ["orange", "magenta", "green", "violet"];
  V.text(svg, 156, 22, "input 4 × 4", { size: 22, weight: 700 });
  for (let b = 0; b < 4; b++) V.rect(svg, (b % 2) * 2 * s, 45 + Math.floor(b / 2) * 2 * s, 2 * s, 2 * s, "", { style: `fill:var(--${cols[b]}-soft)` });
  X.forEach((r, i) => r.forEach((v, j) => { V.rect(svg, j * s, 45 + i * s, s, s, "", { style: "fill:none;stroke:var(--rule);stroke-width:1.5" }); V.text(svg, j * s + s / 2, 45 + i * s + s / 2, v, { size: 28 }); }));
  const win = V.g(svg, { class: "g-anim" }); V.rect(win, 0, 0, 2 * s, 2 * s, "win"); V.move(win, 0, 45);
  const outs = [["max pool", 620, 30, (a) => Math.max(...a)], ["average pool", 620, 225, a => a.reduce((x, y) => x + y) / 4]].map(([n, x, y, f]) => {
    V.text(svg, x + 280, y + s / 2 + 20, n, { size: 24, weight: 700, anchor: "start" });
    return range(4).map(b => {
      const r = V.rect(svg, x + (b % 2) * s, y + Math.floor(b / 2) * s, s, s, "ghost");
      const bi = Math.floor(b / 2) * 2, bj = (b % 2) * 2, vals = [X[bi][bj], X[bi][bj + 1], X[bi + 1][bj], X[bi + 1][bj + 1]];
      const t = V.text(svg, x + (b % 2) * s + s / 2, y + Math.floor(b / 2) * s + s / 2, f(vals), { size: 28, weight: 700 }); t.classList.add("fade");
      return { r, t, b };
    });
  });
  V.arrow(svg, 340, 130, 600, 90); V.arrow(svg, 340, 250, 600, 290);
  V.text(svg, 1265, 200, "no learnable weights\neach channel separately\n$H$ × $W$ → $H$/2 × $W$/2", { size: 22, cls: "muted" });
  let last = -1;
  const show = k => {
    V.move(win, (k % 2) * 2 * s, 45 + Math.floor(Math.min(k, 3) / 2) * 2 * s); win.style.opacity = k < 4 ? 1 : 0;
    outs.forEach(o => o.forEach(({ r, t, b }) => { V.show(t, b <= k); r.setAttribute("class", b <= k ? "ocell" : "ghost"); r.style.fill = b <= k ? `var(--${cols[b]}-soft)` : ""; }));
  };
  const lp = V.loop(t => { const k = Math.floor(t / 1.1) % 6; if (k !== last) { last = k; show(k); } });
  return { start() { last = -1; lp.start(); }, stop: lp.stop, final() { show(4); } };
};

VIZ.poolVsStride = flow({
  w: 1400, h: 260, nodes: [
    { id: "x", x: 0, y: 80, w: 200, h: 100, label: "input\n$H$ × $W$", size: 25 },
    { id: "p", x: 330, y: 0, w: 320, h: 100, label: "pooling 2 × 2\n~fixed max / mean", size: 25 },
    { id: "c", x: 330, y: 160, w: 320, h: 100, label: "strided conv, $S$ = 2\n~learned kernel", cls: "blue", size: 25 },
    { id: "y", x: 790, y: 80, w: 240, h: 100, label: "output\n$H$/2 × $W$/2", size: 25 }],
  edges: [{ a: "x", b: "p" }, { a: "x", b: "c" }, { a: "p", b: "y" }, { a: "c", b: "y" }],
  texts: [{ x: 1210, y: 130, t: "same shape,\ndifferent cost\nand information", size: 24 }],
});

VIZ.gap = host => {
  const svg = V.svg(host, 1400, 400);
  const maps = [[[.1, .2, .4, .3], [.2, .5, .6, .3], [.3, .4, .5, .2], [.1, .3, .4, .2]], [[.9, .8, .7, .9], [.6, .9, .8, .7], [.7, .8, .9, .6], [.8, .7, .6, .9]], [[.1, .1, .2, .3], [.2, .1, .3, .2], [.1, .2, .2, .3], [.2, .1, .1, .2]]];
  const means = maps.map(m => m.flat().reduce((a, b) => a + b) / 16);
  maps.forEach((m, k) => {
    m.forEach((r, i) => r.forEach((v, j) => V.rect(svg, 50 + k * 260 + j * 40, 60 + i * 40, 40, 40, "", { fill: `rgba(0,112,186,${v})`, stroke: "#fff", "stroke-width": 2 })));
    V.text(svg, 130 + k * 260, 33, `channel ${k + 1}`, { size: 23, weight: 700 });
  });
  // a translucent copy of each map shrinks into its mean
  const groups = maps.map((m, k) => {
    const g = V.g(svg, { class: "g-anim" }); g.style.transformOrigin = `${130 + k * 260}px 320px`;
    V.rect(g, 50 + k * 260, 60, 160, 160, "", { fill: `rgba(0,112,186,${means[k]})`, stroke: "var(--blue)", "stroke-width": 2 });
    return g;
  });
  const vals = means.map((m, k) => { const t = V.box(svg, 85 + k * 260, 290, 90, 60, m.toFixed(2), "box", { size: 24 }); t.classList.add("fade"); return t; });
  const res = V.g(svg, { class: "fade" });
  V.text(res, 880, 320, "=", { size: 40 });
  V.box(res, 940, 270, 400, 100, "vector of length $C$\n~no position information", "box blue", { size: 25 });
  V.text(svg, 1130, 140, "mean over $H$ × $W$,\nseparately for each channel", { size: 23, cls: "muted" });
  return {
    steps: 1, set(s) {
      groups.forEach(g => {
        V.noTransition(g, () => { g.style.transform = ""; g.style.opacity = s ? .9 : 0; });
        if (s) requestAnimationFrame(() => { g.style.transform = "translate(0px,60px) scale(.35)"; g.style.opacity = 0; });
      });
      vals.forEach(v => V.show(v, s)); V.show(res, s);
    }
  };
};

VIZ.normalize = host => {
  const svg = V.svg(host, 1400, 380);
  const X = x => 150 + x * 1.5, Y = y => 330 - y * 1.1;
  const pts = [[40, 30], [70, 55], [100, 80], [130, 110], [170, 120], [200, 180], [240, 210], [250, 235]];
  const mx = pts.reduce((a, p) => a + p[0], 0) / 8, my = pts.reduce((a, p) => a + p[1], 0) / 8;
  const sx = Math.sqrt(pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0) / 8), sy = Math.sqrt(pts.reduce((a, p) => a + (p[1] - my) ** 2, 0) / 8);
  V.path(svg, `M${X(0)},${Y(0)} L${X(270)},${Y(0)} M${X(0)},${Y(0)} L${X(0)},${Y(260)}`, "axis");
  V.text(svg, X(135), 365, "pixel values 0–255", { size: 22, cls: "muted" });
  const cx = 880, cy = 190, k = 90;
  const ax = V.g(svg, { class: "fade" });
  V.path(ax, `M${cx - 230},${cy} L${cx + 230},${cy} M${cx},${cy + 170} L${cx},${cy - 170}`, "axis");
  V.text(ax, cx + 150, 365, "zero mean, unit scale", { size: 22, cls: "muted" });
  const dots = pts.map(p => { const c = V.circle(svg, 0, 0, 9, { fill: "var(--blue)" }); c.classList.add("g-anim"); c._p = p; return c; });
  const f = V.box(svg, 1120, 125, 280, 120, "$x̂$_c = ($x$_c − $μ$_c) / $σ$_c\n~per channel $c$", "box blue", { size: 25 }); f.classList.add("fade");
  return {
    steps: 1, set(s) {
      dots.forEach((d, i) => { const [x, y] = d._p; V.move(d, s ? cx + (x - mx) / sx * k : X(x), s ? cy - (y - my) / sy * k : Y(y)); d.style.transitionDelay = `${i * 0.05}s`; });
      V.show(ax, s); V.show(f, s);
    }
  };
};

VIZ.batchnorm = flow({
  w: 1400, h: 300, nodes: [
    { id: "a", x: 0, y: 40, w: 270, h: 100, label: "activations\n$N$ × $C$ × $H$ × $W$" },
    { id: "s", x: 360, y: 40, w: 290, h: 100, label: "per channel $c$:\n$μ$_c, $σ$_c² over $N$, $H$, $W$", cls: "blue", step: 1 },
    { id: "n", x: 740, y: 40, w: 220, h: 100, label: "normalize\n$x̂$", step: 1 },
    { id: "f", x: 1050, y: 40, w: 330, h: 100, label: "learned scale and shift\n$γ$_c $x̂$ + $β$_c", cls: "blue", step: 2 },
    { id: "r", x: 360, y: 200, w: 290, h: 90, label: "running averages\nused at inference", cls: "mut", step: 3 }],
  edges: [{ a: "a", b: "s", step: 1 }, { a: "s", b: "n", step: 1 }, { a: "n", b: "f", step: 2 },
  { a: "s", b: "r", from: "b", to: "t", step: 3 }, { a: "r", b: "n", d: "M655,245 L850,245 L850,150", step: 3 }],
});

VIZ.minimalCNN = host => {
  const svg = V.svg(host, 1400, 440);
  // Channels run along the horizontal axis (length), spatial size is the height;
  // the oblique edge shows the second spatial axis.
  const L = [
    [40, 14, 230, "muted", "input", "3 × 128 × 128"],
    [300, 50, 150, "blue", "conv 1", "32 × 64 × 64"],
    [540, 95, 100, "blue", "conv 2", "64 × 32 × 32"],
    [800, 165, 64, "blue", "conv 3", "128 × 16 × 16"]];
  const G = L.map(([x, len, h, c, n, sh]) => {
    const g = cuboid(svg, x, 230 - h / 2 + h * .12, len, h, h * .55, c);
    V.text(svg, x + len / 2 + h * .15, 392, n, { size: 23, weight: 700 }); V.text(svg, x + len / 2 + h * .15, 422, sh, { size: 22, cls: "muted" });
    g.style.transition = "opacity .3s"; return g;
  });
  const gap = V.g(svg); V.rect(gap, 1135, 90, 26, 240, "", { style: "fill:var(--orange-soft);stroke:var(--orange);stroke-width:2" });
  V.text(svg, 1148, 392, "GAP", { size: 23, weight: 700 }); V.text(svg, 1148, 422, "128", { size: 22, cls: "muted" });
  const lin = V.g(svg); V.rect(lin, 1290, 160, 26, 100, "", { style: "fill:var(--green-soft);stroke:var(--green);stroke-width:2" });
  V.text(svg, 1303, 392, "linear", { size: 23, weight: 700 }); V.text(svg, 1303, 422, "10 logits", { size: 22, cls: "muted" });
  [[200, 292], [460, 532], [700, 792], [1015, 1125], [1170, 1280]].forEach(([a, b]) => V.arrow(svg, a, 210, b, 210));
  V.text(svg, 700, 22, "each conv block: 3 × 3 conv, stride 2, padding 1 → BatchNorm → ReLU", { size: 23, cls: "muted" });

  const all = [...G, gap, lin];
  const lp = V.loop(t => { const k = Math.floor(t / .8) % (all.length + 2); all.forEach((g, i) => g.style.opacity = k >= all.length ? 1 : (i === k ? 1 : .35)); });
  return { start: lp.start, stop() { lp.stop(); all.forEach(g => g.style.opacity = 1); } };
};

