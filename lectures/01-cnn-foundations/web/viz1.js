/* Visuals for Part 1 (images and neurons) and Part 2 (convolution step by step). */
"use strict";

/* ------------------------------------------------------------ Part 1 */
VIZ.goals = flow({
  w: 1300, h: 200, nodes: [
    { id: "a", x: 0, y: 40, w: 360, h: 120, label: "**READ TENSORS**\n~shapes and parameters", cls: "blue", size: 25 },
    { id: "b", x: 470, y: 40, w: 360, h: 120, label: "**DESIGN LAYERS**\n~operators and receptive fields", size: 25 },
    { id: "c", x: 940, y: 40, w: 360, h: 120, label: "**DIAGNOSE TRAINING**\n~curves, errors, and data", cls: "good", size: 25 }],
  edges: [{ a: "a", b: "b" }, { a: "b", b: "c" }],
});

VIZ.roadmap = flow({
  w: 1400, h: 260, nodes: [
    { id: "1", x: 0, y: 30, w: 240, h: 120, label: "**1 Images and**\n**neurons**", cls: "blue" },
    { id: "2", x: 290, y: 30, w: 240, h: 120, label: "**2 Convolution**\n**step by step**" },
    { id: "3", x: 580, y: 30, w: 240, h: 120, label: "**3 Building**\n**a CNN**" },
    { id: "4", x: 870, y: 30, w: 240, h: 120, label: "**4 Training**" },
    { id: "5", x: 1160, y: 30, w: 240, h: 120, label: "**5 Data and**\n**diagnosis**", cls: "good" }],
  edges: [{ a: "1", b: "2" }, { a: "2", b: "3" }, { a: "3", b: "4" }, { a: "4", b: "5" }],
  texts: [
    { x: 120, y: 200, t: "tensors, neuron,\nnonlinearity" }, { x: 410, y: 200, t: "sliding window,\noutput size, channels" },
    { x: 700, y: 200, t: "receptive field,\npooling, normalization" }, { x: 990, y: 200, t: "loss, gradient,\noptimizer" },
    { x: 1280, y: 200, t: "splits, overfitting,\nerror analysis" }],
});

VIZ.measurement = host => {
  const svg = V.svg(host, 1300, 260);
  const B = [[0, 80, 220, "camera\n~intensities", ""], [380, 80, 220, "tensor\n~$C$ × $H$ × $W$", ""], [760, 80, 220, "CNN\n~features", "blue"]];
  B.forEach(b => V.box(svg, b[0], b[1], b[2], 100, b[3], "box " + b[4], { size: 25 }));
  V.box(svg, 1120, 40, 150, 70, "OK", "box good"); V.box(svg, 1120, 150, 150, 70, "NOK", "box bad");
  V.arrow(svg, 225, 130, 372, 130); V.arrow(svg, 605, 130, 752, 130);
  V.arrow(svg, 985, 120, 1112, 80); V.arrow(svg, 985, 140, 1112, 182);
  V.text(svg, 300, 102, "measurement", { size: 22, cls: "muted" }); V.text(svg, 680, 102, "inference", { size: 22, cls: "muted" });
};

VIZ.tasks = host => {
  const svg = V.svg(host, 1400, 330);
  const names = ["CLASSIFICATION", "DETECTION", "SEGMENTATION", "REGRESSION"];
  const panels = names.map((n, i) => {
    const x = i * 355, g = V.g(svg, { class: "fade" });
    V.rect(g, x, 0, 320, 320, "cell", { rx: 6 });
    V.text(g, x + 160, 26, n, { size: 23, weight: 700 });
    const inner = V.el("svg", { x: x + 10, y: 50, width: 300, height: 255, viewBox: "0 21 530 450", preserveAspectRatio: "xMidYMid slice" }, g);
    V.el("image", { href: "../assets/invariance-grid.png", width: 1672, height: 941 }, inner);
    g._img = inner;
    return g;
  });
  // Flange outline segmented from the image itself (image pixel coordinates).
  const FLANGE = "M320,321.5 L295,321.5 L265,318.5 L223,311.5 L144,303.5 L119,295.5 L112,292.5 L109.5,290 L106.5,282 L109.5,274 L108.5,261 L106.5,256 L108.5,251 L107.5,247 L108.5,238 L110.5,234 L122,224.5 L149,215.5 L194,207.5 L198.5,205 L200.5,201 L198.5,147 L199.5,144 L202.5,142 L205.5,135 L215,126.5 L233,118.5 L265,112.5 L305,112.5 L329,116.5 L342,120.5 L353,125.5 L360,130.5 L368.5,144 L367.5,148 L368.5,202 L370.5,206 L381,210.5 L425,221.5 L439,228.5 L449,229.5 L459,236.5 L464.5,245 L464.5,279 L467.5,287 L463,293.5 L448,302.5 L420,310.5 L373,315.5 L343,320.5 L321,320.5 L320,321.5 Z M136,239 a24,11.5 0 1,0 48,0 a24,11.5 0 1,0 -48,0 Z M387,246 a24,11.5 0 1,0 48,0 a24,11.5 0 1,0 -48,0 Z";
  const ns = { "vector-effect": "non-scaling-stroke" };
  // overlays (coordinates in panel space)
  V.box(panels[0], 98, 256, 124, 40, "flange", "box blue", { size: 22 });
  V.rect(panels[1]._img, 106.5, 112.5, 361, 209, "", Object.assign({ fill: "none", stroke: "var(--blue)", "stroke-width": 4 }, ns));
  V.box(panels[1], 355 + 98, 256, 124, 40, "object", "box blue", { size: 22 });
  V.path(panels[2]._img, FLANGE, "", Object.assign({ fill: "var(--magenta)", "fill-opacity": .45, "fill-rule": "evenodd", stroke: "var(--magenta)", "stroke-width": 2.5 }, ns));
  V.el("path", { d: `M${1065 + 55},270 L${1065 + 265},270`, stroke: "var(--blue)", "stroke-width": 4, "marker-end": "url(#ah-blue)", "marker-start": "url(#ah-blue-s)" }, panels[3]);
  V.box(panels[3], 1065 + 75, 214, 170, 42, "$w$ = 42.3 mm", "box blue", { size: 22 });
  return { steps: 3, set(s) { panels.forEach((p, i) => V.show(p, i <= s)); } };
};

VIZ.imageTensor = host => {
  const svg = V.svg(host, 1400, 420);
  const vals = [[10, 20, 35, 20, 10], [20, 55, 80, 55, 20], [30, 80, 95, 80, 30], [20, 55, 80, 55, 20], [10, 20, 35, 20, 10]];
  V.text(svg, 160, 20, "grayscale image", { size: 22, weight: 700 });
  vals.forEach((r, i) => r.forEach((v, j) => V.rect(svg, 30 + j * 52, 50 + i * 52, 52, 52, "", { fill: shade(v) })));
  V.rect(svg, 30 + 52, 50 + 52, 156, 156, "win");
  V.text(svg, 160, 342, "$H$ × $W$ numbers", { size: 22, cls: "muted" });
  const zoom = V.g(svg, { class: "fade" });
  V.path(zoom, "M238,102 L420,60 M238,258 L420,330", "line", { "stroke-dasharray": "6 5", stroke: "var(--blue)" });
  V.grid(zoom, 420, 60, [[204, 82, 51], [82, 13, 82], [51, 82, 204]], 90, "cell", { size: 30 });
  V.rect(zoom, 420, 60, 270, 270, "", { fill: "none", stroke: "var(--blue)", "stroke-width": 4 });
  V.text(zoom, 555, 364, "integers 0–255 (or floats 0–1)", { size: 22, cls: "muted" });
  // colour planes
  const planes = [["R", "red"], ["G", "green"], ["B", "blue"]].map(([n, c], i) => {
    const g = V.g(svg, { class: "g-anim" });
    V.rect(g, 0, 0, 210, 210, "", { fill: `var(--${c === "red" ? "red-soft" : c === "green" ? "green-soft" : "blue-soft"})`, stroke: `var(--${c})`, "stroke-width": 3 });
    V.text(g, 185, 25, n, { size: 26, weight: 700, fill: `var(--${c})` });
    return g;
  }).reverse();
  planes.forEach((g, i) => V.move(g, 1000 + (2 - i) * 22, 70 + (2 - i) * 22));
  V.text(svg, 1110, 20, "colour image", { size: 22, weight: 700 });
  const lbl = V.text(svg, 1110, 374, "3 channels: $C$ × $H$ × $W$ (PyTorch order)", { size: 22, cls: "muted" });
  lbl.classList.add("fade");
  return {
    steps: 2, set(s) {
      V.show(zoom, s >= 1);
      planes.forEach((g, i) => V.move(g, 1000 + (2 - i) * (s >= 2 ? 70 : 22), 70 + (2 - i) * (s >= 2 ? 40 : 22)));
      V.show(lbl, s >= 2);
    }
  };
};

VIZ.neuron = host => {
  const svg = V.svg(host, 1400, 380);
  const xs = [["$x$_1 = 1", "× $w$_1 = 0.5", "0.5"], ["$x$_2 = 2", "× $w$_2 = 0.4", "0.8"], ["$x$_3 = −1", "× $w$_3 = 0.3", "−0.3"]];
  const prods = [];
  xs.forEach((r, i) => {
    const y = 60 + i * 110;
    V.box(svg, 0, y - 32, 150, 64, r[0], "box");
    V.text(svg, 162, y, r[1], { size: 22, anchor: "start" });
    V.path(svg, `M370,${y} L452,${180 + (i - 1) * 30}`, "line", { style: "stroke:var(--muted)" });
    const pt = V.text(svg, 320, y, "= " + r[2], { size: 22, fill: "var(--magenta)", weight: 700 });
    pt.classList.add("fade"); prods.push(pt);
  });
  V.circle(svg, 530, 180, 72, { class: "box blue", style: "fill:var(--blue-soft);stroke:var(--blue);stroke-width:3" });
  V.text(svg, 530, 168, "Σ + $b$", { size: 30 }); V.text(svg, 530, 210, "$b$ = 0.1", { size: 22, cls: "muted" });
  V.box(svg, 760, 135, 200, 90, "ReLU\n$φ$($z$)", "box");
  V.box(svg, 1120, 145, 190, 70, "$y$ = 1.1", "box good");
  V.arrow(svg, 605, 180, 752, 180); V.arrow(svg, 965, 180, 1112, 180);
  const z = V.text(svg, 680, 155, "$z$ = 1.1", { size: 22, fill: "var(--magenta)", weight: 700 }); z.classList.add("fade");
  const eq = V.text(svg, 700, 345, "$z$ = 0.5 + 0.8 − 0.3 + 0.1 = 1.1        $y$ = max(0, $z$) = 1.1", { size: 22, cls: "muted" }); eq.classList.add("fade");
  return {
    steps: 3,
    set(s) { prods.forEach(p => V.show(p, s >= 1)); V.show(z, s >= 2); V.show(eq, s >= 3); }
  };
};

VIZ.nonlinearity = host => {
  const svg = V.svg(host, 1400, 400);
  const row = (y, parts) => parts.map(([x, w, l, c]) => { const g = V.g(svg, { class: "g-anim" }); V.box(g, x, y, w, 70, l, "box " + (c || "")); return g; });
  const r1 = row(30, [[0, 90, "$**x**$"], [170, 110, "$**W**$_1"], [360, 110, "$**W**$_2"]]);
  const a1 = [V.arrow(svg, 95, 65, 162, 65), V.arrow(svg, 285, 65, 352, 65)];
  a1.forEach(a => a.classList.add("fade"));
  const merged = V.box(svg, 170, 30, 300, 70, "$**W**$_2$**W**$_1 = one linear map", "box bad"); merged.classList.add("fade");
  V.text(svg, 300, 137, "without activation", { size: 22, cls: "muted" });
  const r2 = V.g(svg, { class: "fade" });
  [[0, 90, "$**x**$"], [170, 110, "$**W**$_1"], [360, 120, "ReLU", "blue"], [560, 110, "$**W**$_2"]].forEach(([x, w, l, c]) => V.box(r2, x, 210, w, 70, l, "box " + (c || "")));
  [[95, 162], [285, 352], [485, 552]].forEach(([a, b]) => V.arrow(r2, a, 245, b, 245));
  V.text(r2, 340, 317, "with activation: depth adds expressive power", { size: 22, cls: "muted" });
  // plot
  const X = x => 1050 + x * 75, Y = y => 330 - y * 110;
  V.path(svg, `M${X(-3.3)},${Y(0)} L${X(3.4)},${Y(0)} M${X(0)},${Y(-.2)} L${X(0)},${Y(2.8)}`, "axis");
  V.path(svg, V.pathFn(x => Math.max(0, x), -3, 2.6, X, Y), "curve");
  V.path(svg, V.pathFn(x => 2 / (1 + Math.exp(-1.6 * x)), -3, 3, X, Y), "curve", { style: "stroke:var(--magenta)" });
  V.text(svg, X(1.2), Y(2.6), "ReLU", { size: 24, fill: "var(--blue)", weight: 700 });
  V.text(svg, X(2.6), Y(1.5), "sigmoid", { size: 24, fill: "var(--magenta)", weight: 700 });
  const probe = V.circle(svg, 0, 0, 9, { fill: "var(--blue)" });
  const lp = V.loop(t => { const x = -3 + ((t * 1.2) % 5.6); probe.setAttribute("cx", X(x)); probe.setAttribute("cy", Y(Math.max(0, x))); });
  return {
    steps: 2, start: lp.start, stop: lp.stop, set(s) {
      V.move(r1[1], s >= 1 ? 0 : 0, 0); r1[1].style.opacity = s >= 1 ? 0 : 1; r1[2].style.opacity = s >= 1 ? 0 : 1;
      a1.forEach(a => V.show(a, s < 1)); V.show(merged, s >= 1); V.show(r2, s >= 2);
    }
  };
};

VIZ.fcImage = host => {
  const svg = V.svg(host, 1400, 440);
  const vals = [[15, 30, 70, 90], [20, 60, 85, 60], [55, 85, 50, 20], [85, 60, 25, 10]];
  const ROW = ["blue", "orange", "green", "violet"];
  const s = 56, gx = 44, gy = 108;                    // image grid
  const vx = 430, vy = 36, cw = 44, ch = 23;          // flattened vector
  const ux = 830, uy = k => 70 + k * 60, ur = 20;     // hidden units
  const cyV = i => vy + i * ch + ch / 2;
  const P = 5, NB = [1, 4, 6, 9];                     // example pixel and its 4 neighbours
  V.text(svg, gx + 2 * s, 78, "image 4 × 4", { size: 23, weight: 700 });
  ROW.forEach((c, r) => V.rect(svg, gx - 14, gy + r * s, 8, s, "", { style: `fill:var(--${c})` }));
  vals.forEach((row, r) => row.forEach((v, c) => V.rect(svg, gx + c * s, gy + r * s, s, s, "", { fill: shade(v), stroke: "var(--rule)" })));
  // flatten: copies of the pixels fly into one column, row after row
  const flat = V.g(svg, { class: "fade" });
  V.text(flat, vx + cw / 2, 16, "vector $**x**$", { size: 23, weight: 700 });
  ROW.forEach((c, r) => V.rect(flat, vx - 12, vy + r * 4 * ch, 8, 4 * ch, "", { style: `fill:var(--${c})` }));
  V.arrow(flat, gx + 4 * s + 18, 310, vx - 22, 310);
  V.text(flat, (gx + 4 * s + vx) / 2 - 2, 286, "flatten", { size: 22, cls: "muted" });
  const fly = [];
  vals.forEach((row, r) => row.forEach((v, c) => {
    const g = V.g(svg, { class: "g-anim" });
    V.rect(g, 0, 0, 1, 1, "", { fill: shade(v), stroke: "var(--rule)", "stroke-width": 1.5, "vector-effect": "non-scaling-stroke" });
    fly.push({ g, a: [gx + c * s, gy + r * s, s, s], b: [vx, vy + (r * 4 + c) * ch, cw, ch] });
  }));
  const place = (f, [x, y, w, h]) => { f.g.style.transform = `translate(${x}px,${y}px) scale(${w},${h})`; };
  // dense connections
  const dense = V.g(svg, { class: "fade" }), fan = V.g(svg, { class: "fade" });
  for (let i = 0; i < 16; i++) for (let k = 0; k < 6; k++) {
    V.line(dense, vx + cw, cyV(i), ux - ur, uy(k), { style: "stroke:var(--blue-mid)", "stroke-width": 1.2 });
    if (i === P) V.line(fan, vx + cw, cyV(i), ux - ur, uy(k), { style: "stroke:var(--blue)", "stroke-width": 3 });
  }
  const units = V.g(svg, { class: "fade" });
  V.text(units, ux, 16, "6 units", { size: 23, weight: 700 });
  for (let k = 0; k < 6; k++) V.circle(units, ux, uy(k), ur, { style: "fill:var(--blue-soft);stroke:var(--blue);stroke-width:2.5" });
  const pickG = V.rect(fan, gx + (P % 4) * s, gy + Math.floor(P / 4) * s, s, s, "", { fill: "none", style: "stroke:var(--blue)", "stroke-width": 5 });
  const pickV = V.rect(fan, vx, vy + P * ch, cw, ch, "", { fill: "none", style: "stroke:var(--blue)", "stroke-width": 4 });
  const n1 = V.g(svg, { class: "fade" });
  V.text(n1, 1160, 70, "every pixel → every unit", { size: 24, weight: 700, fill: "var(--blue)" });
  V.text(n1, 1160, 106, "16 inputs × 6 units = 96 weights", { size: 22, cls: "muted" });
  const n2 = V.box(svg, 935, 150, 450, 128, "224 × 224 × 3 = 150 528 inputs\n× 1000 units\n= **150 million** weights", "box bad", { size: 24 });
  n2.classList.add("fade");
  // neighbours: adjacent in the image, scattered in the vector
  const nb = V.g(svg, { class: "fade" });
  const mark = (i, c) => {
    V.rect(nb, gx + (i % 4) * s + 2, gy + Math.floor(i / 4) * s + 2, s - 4, s - 4, "", { fill: "none", style: `stroke:var(--${c})`, "stroke-width": 5 });
    V.rect(nb, vx + 2, vy + i * ch + 2, cw - 4, ch - 4, "", { fill: "none", style: `stroke:var(--${c})`, "stroke-width": 4 });
  };
  NB.forEach(i => mark(i, "orange")); mark(P, "magenta");
  [[1, P], [P, 9]].forEach(([a, b]) => {
    V.path(nb, `M${vx - 16},${cyV(a)} C${vx - 52},${cyV(a)} ${vx - 52},${cyV(b)} ${vx - 16},${cyV(b)}`, "", { fill: "none", style: "stroke:var(--orange)", "stroke-width": 3 });
    V.text(nb, vx - 50, (cyV(a) + cyV(b)) / 2, "4 apart", { size: 22, anchor: "end", fill: "var(--orange)", weight: 700 });
  });
  V.text(nb, 1160, 330, "image neighbours end up far apart:", { size: 22 });
  V.text(nb, 1160, 362, "4 positions here, 224 in a real image", { size: 22 });
  V.text(nb, 1160, 404, "the layer has no notion of “neighbour”", { size: 22, weight: 700, fill: "var(--orange)" });
  return {
    steps: 4,
    set(st, instant) {
      fly.forEach(f => instant ? V.noTransition(f.g, () => place(f, st >= 1 ? f.b : f.a)) : place(f, st >= 1 ? f.b : f.a));
      V.show(flat, st >= 1); V.show(dense, st >= 2); V.show(units, st >= 2);
      V.show(fan, st >= 2 && st < 4); V.show(n1, st >= 2); V.show(n2, st >= 3); V.show(nb, st >= 4);
      dense.style.opacity = st >= 4 ? .35 : st >= 2 ? 1 : 0;
    }
  };
};

VIZ.translation = host => {
  const svg = V.svg(host, 1400, 440);
  const s = 46, n = 8, gx = 40, gy = 58, fx = 560;
  V.text(svg, gx + n * s / 2, 14, "input: the same pattern moves", { size: 23, weight: 700 });
  V.text(svg, fx + n * s / 2, 14, "fully connected: weights touched", { size: 23, weight: 700 });
  const cellsIn = [], cellsW = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    cellsIn.push(V.rect(svg, gx + c * s, gy + r * s, s, s, "cell"));
    cellsW.push(V.rect(svg, fx + c * s, gy + r * s, s, s, "cell"));
  }
  const kern = V.g(svg, { class: "g-anim" });
  V.rect(kern, 0, 0, 3 * s, 3 * s, "win");
  V.text(kern, 1.5 * s, -15, "kernel $K$", { size: 22, fill: "var(--blue)", weight: 700 });
  const pos = [[1, 1], [4, 2], [2, 5], [5, 5], [0, 4], [5, 0]];
  const pat = [[0, 1], [1, 1], [1, 2]];
  const learned = new Set();
  const info = V.text(svg, 1220, 120, "", { size: 23 });
  V.box(svg, 1040, 180, 360, 100, "convolution:\none kernel for all positions", "box good", { size: 23 });
  const fcBox = V.box(svg, 1040, 300, 360, 100, "fully connected:\nlearns each position anew", "box bad", { size: 23 });
  let last = -1;
  const draw = k => {
    const [pr, pc] = pos[k];
    cellsIn.forEach(c => c.setAttribute("style", ""));
    pat.forEach(([dr, dc]) => {
      const i = (pr + dr) * n + pc + dc;
      cellsIn[i].setAttribute("style", "fill:var(--ink)");
      learned.add(i);
    });
    cellsW.forEach((c, i) => c.setAttribute("style", learned.has(i) ? "fill:var(--red-soft);stroke:var(--red)" : ""));
    pat.forEach(([dr, dc]) => cellsW[(pr + dr) * n + pc + dc].setAttribute("style", "fill:var(--red);stroke:var(--red)"));
    V.move(kern, gx + pc * s, gy + pr * s);
    V.setText(info, `position ${k + 1}: FC weights used ${learned.size}`);
  };
  const lp = V.loop(t => {
    const k = Math.floor(t / 1.5) % pos.length;
    if (k !== last) { if (k === 0) learned.clear(); last = k; draw(k); }
  });
  draw(0);
  return { start() { last = -1; lp.start(); }, stop: lp.stop };
};

VIZ.inductive = host => {
  const svg = V.svg(host, 1400, 330);
  const panel = (x, w, title, note) => {
    const g = V.g(svg, { class: "fade" });
    V.rect(g, x, 0, w, 320, "cell", { rx: 8 });
    V.text(g, x + w / 2, 30, title, { size: 23, weight: 700, fill: "var(--blue)" });
    V.text(g, x + w / 2, 281, note, { size: 22, cls: "muted" });
    return g;
  };
  const p1 = panel(0, 430, "LOCAL CONNECTIVITY", "only the highlighted patch\naffects this output");
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) V.rect(p1, 40 + c * 36, 60 + r * 36, 36, 36, "cell");
  V.rect(p1, 76, 96, 108, 108, "win");
  V.circle(p1, 350, 150, 30, { style: "fill:var(--blue-soft);stroke:var(--blue);stroke-width:3" });
  V.arrow(p1, 188, 150, 312, 150);
  const p2 = panel(470, 430, "WEIGHT SHARING", "the same values in $K$\nare used at every position");
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) V.rect(p2, 520 + c * 41, 60 + r * 36, 41, 36, "cell");
  const kw = V.g(p2, { class: "g-anim" }); V.rect(kw, 0, 0, 123, 108, "win"); V.text(kw, 61, 54, "$K$", { size: 30, fill: "var(--blue)" }); V.move(kw, 520, 60);
  const p3 = panel(940, 460, "HIERARCHY", "larger concepts are composed\nacross successive layers");
  [["edge", 960], ["corner", 1065], ["part", 1185], ["object", 1290]].forEach(([l, x], i) => {
    V.box(p3, x, 125, l === "corner" ? 95 : 85, 56, l, "box " + (i === 3 ? "good" : ""), { size: 22 });
    if (i < 3) V.arrow(p3, x + (l === "corner" ? 98 : 88), 153, x + (l === "corner" ? 117 : 102) + (i === 0 ? 0 : 0), 153);
  });
  const lp = V.loop(t => { const k = Math.floor(t / .9) % 6, r = k < 3 ? 0 : 1, c = k % 3; V.move(kw, 520 + [0, 82, 164][c] + (r ? 41 : 0), 60 + r * 72); });
  return { steps: 2, start: lp.start, stop: lp.stop, set(s) { V.show(p2, s >= 1); V.show(p3, s >= 2); } };
};

/* ------------------------------------------------------------ Part 2 */
const X5 = [[1, 2, 0, 1, 2], [0, 1, 3, 1, 0], [2, 2, 1, 0, 1], [1, 0, 2, 3, 1], [0, 1, 1, 2, 0]];
const KV = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]];
const conv2 = (X, K) => range(X.length - K.length + 1).map(i => range(X[0].length - K[0].length + 1).map(j =>
  K.reduce((a, row, u) => a + row.reduce((b, k, v) => b + k * X[i + u][j + v], 0), 0)));

VIZ.localOp = host => {
  const svg = V.svg(host, 1400, 380);
  const sh = [[8, 18, 30, 12, 5], [15, 38, 58, 28, 10], [22, 55, 78, 46, 18], [10, 32, 62, 40, 16], [4, 12, 25, 17, 7]];
  V.text(svg, 140, 25, "input image", { size: 22, weight: 700 });
  sh.forEach((r, i) => r.forEach((v, j) => V.rect(svg, 10 + j * 52, 50 + i * 52, 52, 52, "", { fill: shade(v), stroke: "#fff", "stroke-width": 2 })));
  V.rect(svg, 62, 102, 156, 156, "win");
  const st = [];
  const g1 = V.g(svg, { class: "fade" }); st.push(g1);
  V.arrow(g1, 290, 180, 380, 180); V.text(g1, 335, 154, "read", { size: 22, cls: "muted" });
  V.text(g1, 485, 25, "patch", { size: 22, weight: 700 });
  V.grid(g1, 395, 90, [[1, 3, 1], [2, 1, 0], [0, 2, 3]], 60, "cell", { size: 26 });
  const g2 = V.g(svg, { class: "fade" }); st.push(g2);
  V.text(g2, 630, 180, "⊙", { size: 46 });
  V.text(g2, 790, 25, "kernel $K$ (learned)", { size: 22, weight: 700 });
  V.grid(g2, 700, 90, KV, 60, "kcell", { size: 26 });
  const g3 = V.g(svg, { class: "fade" }); st.push(g3);
  V.arrow(g3, 900, 180, 1010, 180); V.text(g3, 955, 154, "sum", { size: 22, cls: "muted" });
  V.text(g3, 1150, 25, "output map", { size: 22, weight: 700 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) V.rect(g3, 1060 + c * 60, 90 + r * 60, 60, 60, r === 1 && c === 1 ? "ocell" : "ghost");
  V.rect(g3, 1120, 150, 60, 60, "", { style: "fill:var(--blue-soft);stroke:var(--blue);stroke-width:3" });
  V.text(g3, 1150, 180, "1", { size: 28, weight: 700 });
  V.text(svg, 700, 347, "⊙ : multiply matching cells, then add all nine products", { size: 22, cls: "muted" });
  return { steps: 3, set(s) { st.forEach((g, i) => V.show(g, s > i)); } };
};

VIZ.slide1d = host => {
  const svg = V.svg(host, 1400, 400);
  const x = [1, 1, 1, 4, 4, 4, 1], w = [-1, 0, 1], s = 92, x0 = 220, yIn = 70, yK = 185, yOut = 300;
  const y = range(5).map(i => w.reduce((a, k, j) => a + k * x[i + j], 0));
  V.text(svg, x0 - 30, yIn + s / 2, "input $x$", { size: 24, weight: 700, anchor: "end" });
  V.text(svg, x0 - 30, yOut + s / 2, "output $y$", { size: 24, weight: 700, anchor: "end" });
  x.forEach((v, i) => { V.rect(svg, x0 + i * s, yIn, s, s, "cell"); V.text(svg, x0 + i * s + s / 2, yIn + s / 2, v, { size: 32 }); V.text(svg, x0 + i * s + s / 2, yIn - 22, `$x$_${i}`, { size: 23, cls: "muted" }); });
  const outs = range(5).map(i => {
    const r = V.rect(svg, x0 + (i + 1) * s, yOut, s, s, "ghost");
    const t = V.text(svg, x0 + (i + 1.5) * s, yOut + s / 2, y[i], { size: 32, weight: 700 }); t.classList.add("fade");
    return { r, t };
  });
  const win = V.g(svg, { class: "g-anim" }); V.move(win, x0, 0);
  V.rect(win, 0, yIn, 3 * s, s, "win");
  w.forEach((v, j) => { V.rect(win, j * s, yK, s, s * .8, "kcell"); V.text(win, j * s + s / 2, yK + s * .4, v, { size: 28 }); });
  V.text(win, -16, yK + s * .4, "kernel $w$", { size: 22, anchor: "end", fill: "var(--orange)", weight: 700 });
  V.arrow(win, 1.5 * s, yK + s * .8 + 4, 1.5 * s, yOut - 10);
  const eq = V.text(svg, 1110, 230, "", { size: 24 });
  const sum = V.text(svg, 1110, 230, "7 inputs, kernel of 3\n⇒ 5 window positions\n⇒ 5 outputs\n\nnon-zero only where\nthe signal changes", { size: 23 });
  sum.classList.add("fade");
  return {
    steps: 5, set(st) {
      const p = Math.min(st, 4);
      V.move(win, x0 + p * s, 0); win.style.opacity = st >= 5 ? 0 : 1;
      outs.forEach((o, i) => { V.show(o.t, i <= st); o.r.setAttribute("class", i <= st ? "ocell" : "ghost"); o.r.style.fill = i === st && st < 5 ? "var(--blue-soft)" : ""; });
      V.setText(eq, st < 5 ? `$y$_${p} = (−1)·${x[p]} + 0·${x[p + 1]} + 1·${x[p + 2]} = **${y[p]}**` : "");
      V.show(sum, st >= 5);
    }
  };
};

VIZ.oneOut = host => {
  const svg = V.svg(host, 1400, 400), s = 62;
  V.text(svg, 155, 18, "input $x$ (5 × 5)", { size: 22, weight: 700 });
  V.grid(svg, 0, 40, X5, s, "cell", { size: 24 });
  V.rect(svg, s, 40 + s, 3 * s, 3 * s, "win");
  V.text(svg, 155, 376, "window at row 1, column 1", { size: 22, cls: "muted" });
  V.text(svg, 380, 195, "⊙", { size: 44 });
  V.text(svg, 525, 80, "kernel $K$", { size: 22, weight: 700 });
  V.grid(svg, 432, 102, KV, s, "kcell", { size: 24 });
  V.text(svg, 670, 195, "=", { size: 44 });
  V.text(svg, 820, 80, "products", { size: 22, weight: 700 });
  const P = range(3).map(u => range(3).map(v => X5[1 + u][1 + v] * KV[u][v]));
  const pg = V.grid(svg, 727, 102, P, s, "cell", { size: 24 });
  pg.cells.flat().forEach((c, k) => { c.text.classList.add("fade"); c.text.style.transitionDelay = `${k * 0.12}s`; });
  const sumG = V.g(svg, { class: "fade" });
  V.arrow(sumG, 925, 195, 1040, 195); V.text(sumG, 983, 169, "sum", { size: 22, cls: "muted" });
  V.box(sumG, 1050, 150, 95, 90, "**1**", "box blue", { size: 36 });
  V.text(sumG, 1097, 270, "$y$_{1,1}", { size: 22 });
  V.text(sumG, 1000, 342, "−1 + 0 + 1 − 2 + 0 + 0 + 0 + 0 + 3 = 1", { size: 23, cls: "muted" });
  return { steps: 2, set(st) { pg.cells.flat().forEach(c => V.show(c.text, st >= 1)); V.show(sumG, st >= 2); } };
};

VIZ.slide2d = host => {
  const svg = V.svg(host, 1400, 440), s = 66, ox = 560, oy = 70, kx = 1010;
  const Y = conv2(X5, KV);
  V.text(svg, 165, 25, "input 5 × 5", { size: 22, weight: 700 });
  V.grid(svg, 0, 50, X5, s, "cell", { size: 26 });
  V.text(svg, ox + 99, 25, "output 3 × 3", { size: 22, weight: 700 });
  const outs = range(3).map(i => range(3).map(j => {
    const r = V.rect(svg, ox + j * s, 50 + i * s, s, s, "ghost");
    const t = V.text(svg, ox + j * s + s / 2, 50 + i * s + s / 2, Y[i][j], { size: 26, weight: 700 }); t.classList.add("fade");
    return { r, t };
  }));
  V.text(svg, kx + 99, 25, "kernel $K$", { size: 22, weight: 700 });
  V.grid(svg, kx, 50, KV, s, "kcell", { size: 26 });
  V.text(svg, kx + 99, 296, "the same kernel\nat every position", { size: 22, cls: "muted" });
  const win = V.g(svg, { class: "g-anim" }); V.rect(win, 0, 0, 3 * s, 3 * s, "win"); V.move(win, 0, 50);
  const l1 = V.line(svg, 0, 0, 0, 0, { style: "stroke:var(--blue)", "stroke-dasharray": "6 5" });
  const l2 = V.line(svg, 0, 0, 0, 0, { style: "stroke:var(--blue)", "stroke-dasharray": "6 5" });
  const eq = V.text(svg, 520, 410, "", { size: 23 });
  return {
    steps: 9, set(st) {
      const k = Math.min(st, 8), i = Math.floor(k / 3), j = k % 3;
      V.move(win, j * s, 50 + i * s); win.style.opacity = st >= 9 ? 0 : 1;
      [[l1, 0], [l2, 3]].forEach(([l, d]) => {
        l.setAttribute("x1", (j + 3) * s); l.setAttribute("y1", 50 + (i + d) * s);
        l.setAttribute("x2", ox + j * s); l.setAttribute("y2", 50 + (i + (d ? 1 : 0)) * s);
        l.style.opacity = st >= 9 ? 0 : 1;
      });
      outs.flat().forEach((o, q) => { V.show(o.t, q <= st); o.r.setAttribute("class", q <= st ? "ocell" : "ghost"); o.r.style.fill = q === st ? "var(--blue-soft)" : ""; });
      V.setText(eq, st < 9 ? `window at row ${i}, column ${j}:   $y$_{${i},${j}} = Σ (window ⊙ $K$) = **${Y[i][j]}**`
        : "left to right, top to bottom: 3 × 3 = 9 positions give a 3 × 3 feature map");
    }
  };
};

VIZ.edgeDetect = host => {
  const svg = V.svg(host, 1400, 420), s = 62;
  const X = range(4).map(() => [1, 1, 1, 8, 8, 8]);
  const Kv = KV, Kh = [[-1, -1, -1], [0, 0, 0], [1, 1, 1]];
  V.text(svg, 186, 25, "input: dark | bright", { size: 22, weight: 700 });
  X.forEach((r, i) => r.forEach((v, j) => { V.rect(svg, j * s, 50 + i * s, s, s, "", { fill: shade(v === 1 ? 8 : 55), stroke: "var(--rule)" }); V.text(svg, j * s + s / 2, 50 + i * s + s / 2, v, { size: 24, fill: v === 8 ? "#fff" : null }); }));
  const win = V.g(svg, { class: "g-anim" }); V.rect(win, 0, 0, 3 * s, 3 * s, "win"); V.move(win, 0, 50);
  const kTitle = V.text(svg, 640, 25, "", { size: 22, weight: 700 });
  const kg = V.g(svg);
  const outT = V.text(svg, 1080, 25, "feature map", { size: 22, weight: 700 });
  const outs = range(2).map(i => range(4).map(j => {
    const r = V.rect(svg, 960 + j * s, 90 + i * s, s, s, "ghost");
    const t = V.text(svg, 960 + j * s + s / 2, 90 + i * s + s / 2, "", { size: 24, weight: 700 }); return { r, t };
  }));
  const note = V.text(svg, 1085, 300, "", { size: 23, cls: "muted" });
  V.arrow(svg, 830, 155, 940, 155);
  let K = Kv, last = -1;
  const drawK = () => { kg.innerHTML = ""; V.grid(kg, 555, 60, K, 58, "kcell", { size: 24 }); V.setText(kTitle, K === Kv ? "vertical-edge kernel" : "horizontal-edge kernel"); };
  const Y = () => conv2(X, K);
  const lp = V.loop(t => {
    const k = Math.floor(t / .75) % 11;
    if (k === last) return; last = k; render(k);
  });
  function render(k) {
    const y = Y();
    outs.flat().forEach((o, q) => {
      const on = q < k; V.setText(o.t, on ? y[Math.floor(q / 4)][q % 4] : "");
      o.r.setAttribute("class", on ? "ocell" : "ghost");
      o.r.style.fill = on && y[Math.floor(q / 4)][q % 4] ? "var(--blue-mid)" : "";
    });
    if (k < 8) { V.move(win, (k % 4) * s, 50 + Math.floor(k / 4) * s); win.style.opacity = 1; } else win.style.opacity = 0;
    V.setText(note, k >= 8 ? (K === Kv ? "strong response exactly at the edge" : "no response: pattern not present") : "");
  }
  return {
    steps: 1, start() { last = -1; lp.start(); }, stop: lp.stop, final() { render(8); },
    set(st) { K = st ? Kh : Kv; drawK(); last = -1; }
  };
};

/* Real image: a procedural scene convolved in the browser, scanned line by line. */
VIZ.realConv = host => {
  host.style.flexDirection = "column";
  host.innerHTML = `<div class="interactive" style="display:flex;gap:40px;align-items:center">
    <figure style="margin:0;text-align:center"><canvas width="300" height="220" style="width:420px;image-rendering:pixelated;border:1px solid var(--rule)"></canvas><figcaption style="font-size:22px;color:var(--muted)">input (drop your own image here)</figcaption></figure>
    <div style="text-align:center"><svg width="190" height="190" viewBox="0 0 190 190"></svg><div class="kname" style="font-size:22px;font-weight:700"></div></div>
    <figure style="margin:0;text-align:center"><canvas width="300" height="220" style="width:420px;image-rendering:pixelated;border:1px solid var(--rule)"></canvas><figcaption style="font-size:22px;color:var(--muted)">feature map (grey = 0)</figcaption></figure></div>
    <div class="ctrls interactive"><button class="btn" data-k="v">vertical edge</button><button class="btn" data-k="h">horizontal edge</button><button class="btn" data-k="b">blur</button><button class="btn" data-k="s">sharpen</button></div>`;
  const [cin, cout] = host.querySelectorAll("canvas"), ksvg = host.querySelector("svg"), kname = host.querySelector(".kname");
  const W = 300, H = 220, ci = cin.getContext("2d"), co = cout.getContext("2d");
  const KS = {
    v: ["vertical edge", [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], 1], h: ["horizontal edge", [[-1, -2, -1], [0, 0, 0], [1, 2, 1]], 1],
    b: ["blur", [[1, 1, 1], [1, 1, 1], [1, 1, 1]], 1 / 9], s: ["sharpen", [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], 1]
  };
  let key = "v", gray = null, out = null, row = 0;
  const scene = () => {
    const g = ci.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#d8d8d8"); g.addColorStop(1, "#9a9a9a");
    ci.fillStyle = g; ci.fillRect(0, 0, W, H);
    ci.fillStyle = "#555"; ci.beginPath(); ci.arc(105, 115, 70, 0, 7); ci.fill();
    ci.fillStyle = "#cfcfcf"; ci.beginPath(); ci.arc(105, 115, 24, 0, 7); ci.fill();
    [[0, 1], [1, 0], [0, -1], [-1, 0]].forEach(([a, b]) => { ci.beginPath(); ci.arc(105 + 47 * a, 115 + 47 * b, 8, 0, 7); ci.fill(); });
    ci.fillStyle = "#2a2a2a"; ci.fillRect(200, 40, 70, 140);
    ci.fillStyle = "#eee"; ci.fillRect(212, 60, 46, 12); ci.fillRect(212, 100, 46, 12);
    for (let i = 0; i < 900; i++) { ci.fillStyle = `rgba(0,0,0,${Math.random() * .08})`; ci.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
  };
  const readGray = () => { const d = ci.getImageData(0, 0, W, H).data; gray = new Float32Array(W * H); for (let i = 0; i < W * H; i++) gray[i] = (d[4 * i] * .299 + d[4 * i + 1] * .587 + d[4 * i + 2] * .114); };
  const drawKernel = () => {
    ksvg.innerHTML = ""; const [n, K, f] = KS[key];
    K.forEach((r, i) => r.forEach((v, j) => { V.rect(ksvg, 5 + j * 60, 5 + i * 60, 60, 60, "kcell"); V.text(ksvg, 35 + j * 60, 35 + i * 60, f !== 1 ? "1/9" : v, { size: f !== 1 ? 21 : 26 }); }));
    kname.textContent = n + " kernel";
  };
  const reset = () => { out = co.createImageData(W, H); for (let i = 0; i < out.data.length; i += 4) { out.data[i] = out.data[i + 1] = out.data[i + 2] = 245; out.data[i + 3] = 255; } row = 1; drawKernel(); };
  const stepRows = n => {
    const [, K, f] = KS[key], signed = key === "v" || key === "h";
    for (let k = 0; k < n && row < H - 1; k++, row++) for (let x = 1; x < W - 1; x++) {
      let a = 0; for (let u = -1; u <= 1; u++) for (let v = -1; v <= 1; v++) a += K[u + 1][v + 1] * gray[(row + u) * W + x + v];
      a *= f; const val = signed ? 128 + a / 4 : a; const c = Math.max(0, Math.min(255, val)), i = 4 * (row * W + x);
      out.data[i] = out.data[i + 1] = out.data[i + 2] = c;
    }
    co.putImageData(out, 0, 0);
    if (row < H - 1) { co.strokeStyle = "#0070ba"; co.lineWidth = 3; co.strokeRect(0, row - 1, W, 3); ci.save(); }
  };
  let marker = null;
  const lp = V.loop(() => { if (row < H - 1) stepRows(3); else if (row === H - 1) { co.putImageData(out, 0, 0); row++; } });
  host.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { key = b.dataset.k; reset(); });
  cin.parentElement.addEventListener("dragover", e => e.preventDefault());
  cin.parentElement.addEventListener("drop", e => {
    e.preventDefault(); const f = e.dataTransfer.files[0]; if (!f) return;
    const img = new Image(); img.onload = () => {
      const r = Math.max(W / img.width, H / img.height); ci.drawImage(img, (W - img.width * r) / 2, (H - img.height * r) / 2, img.width * r, img.height * r);
      readGray(); reset();
    }; img.src = URL.createObjectURL(f);
  });
  scene(); readGray(); reset();
  return { start() { reset(); lp.start(); }, stop: lp.stop, final() { while (row < H - 1) stepRows(50); co.putImageData(out, 0, 0); } };
};

/* Reusable animated 1D convolution with padding, stride, and dilation. */
function conv1d(host, P0, opt = {}) {
  host.style.flexDirection = "column";
  const wrap = document.createElement("div"); host.appendChild(wrap);
  const p = Object.assign({ N: 7, K: 3, P: 0, S: 1, D: 1 }, P0);
  let svg, outs = [], winG, O = 0, last = -1, positions = [];
  const build = () => {
    svg = V.svg(wrap, 1400, opt.h || 380);
    const L = p.N + 2 * p.P, s = Math.min(92, 1100 / L), x0 = (1400 - L * s) / 2 + (opt.dx || 0), yIn = 50, yOut = 230;
    O = Math.floor((p.N + 2 * p.P - p.D * (p.K - 1) - 1) / p.S) + 1;
    for (let i = 0; i < L; i++) {
      const pad = i < p.P || i >= p.P + p.N;
      V.rect(svg, x0 + i * s, yIn, s, s, pad ? "pcell" : "cell");
      V.text(svg, x0 + i * s + s / 2, yIn + s / 2, pad ? "0" : `$x$_${i - p.P}`, { size: Math.min(28, s * .38) });
    }
    if (p.P) V.text(svg, x0 - 20, yIn + s / 2, `padding\n$P$ = ${p.P}`, { size: 22, anchor: "end", fill: "var(--orange)", weight: 700 });
    V.text(svg, x0 - 20, yOut + s / 2, "output", { size: 22, anchor: "end", weight: 700 });
    if (!opt.noLabel) V.text(svg, x0 - 20, yIn + s / 2 + (p.P ? 26 : 0), p.P ? "" : "input", { size: 22, anchor: "end", weight: 700 });
    winG = V.g(svg, { class: "g-anim" });
    for (let j = 0; j < p.K; j++) {
      V.rect(winG, j * p.D * s, yIn, s, s, "", { fill: "var(--orange)", "fill-opacity": .32, stroke: "var(--orange)", "stroke-width": 3 });
      V.text(winG, j * p.D * s + s / 2, yIn - 21, `$w$_${j}`, { size: 23, fill: "var(--orange)", weight: 700 });
    }
    const span = (p.D * (p.K - 1) + 1) * s;
    V.path(winG, `M2,${yIn + s + 16} L${span - 2},${yIn + s + 16} M2,${yIn + s + 6} L2,${yIn + s + 26} M${span - 2},${yIn + s + 6} L${span - 2},${yIn + s + 26}`, "line", { style: "stroke:var(--blue);stroke-width:4" });
    V.arrow(winG, span / 2, yIn + s + 30, span / 2, yOut - 8);
    positions = range(Math.max(O, 0)).map(o => x0 + o * p.S * s);
    if (positions.length) V.noTransition(winG, () => V.move(winG, positions[0], 0));
    outs = positions.map((px, o) => {
      const cx = px + span / 2;
      const r = V.rect(svg, cx - s / 2, yOut, s, s, "ghost");
      const t = V.text(svg, cx, yOut + s / 2, `$y$_${o}`, { size: Math.min(26, s * .36) }); t.classList.add("fade");
      return { r, t };
    });
    if (O <= 0) V.text(svg, 700, yOut + 40, "the kernel does not fit: no valid output", { size: 24, fill: "var(--red)" });
    const f = `$O$ = ⌊($N$ + 2$P$ − $D$($K$ − 1) − 1) / $S$⌋ + 1 = ⌊(${p.N} + ${2 * p.P} − ${p.D * (p.K - 1)} − 1) / ${p.S}⌋ + 1 = **${Math.max(O, 0)}**`;
    V.text(svg, 700, (opt.h || 380) - 30, opt.formula || f, { size: 25 });
    last = -1; winG.style.opacity = O > 0 ? 1 : 0;
  };
  const show = k => {
    if (O <= 0) return;
    const cur = Math.min(k, O - 1);
    V.move(winG, positions[cur], 0); winG.style.opacity = k < O ? 1 : 0;
    outs.forEach((o, i) => { V.show(o.t, i <= k); o.r.setAttribute("class", i <= k ? "ocell" : "ghost"); o.r.style.fill = i === k ? "var(--blue-soft)" : ""; });
  };
  const lp = V.loop(t => { const k = Math.floor(t / .9) % (O + 2); if (k !== last) { last = k; show(k); } });
  if (opt.controls) {
    const c = document.createElement("div"); c.className = "ctrls interactive";
    c.innerHTML = ["N", "K", "P", "S", "D"].map(k => `<label><span class="m">${k}</span><input type="range" data-p="${k}" min="${k === "P" ? 0 : 1}" max="${{ N: 12, K: 5, P: 3, S: 3, D: 3 }[k]}" value="${p[k]}"><output>${p[k]}</output></label>`).join("");
    host.appendChild(c);
    c.querySelectorAll("input").forEach(inp => inp.oninput = () => { p[inp.dataset.p] = +inp.value; inp.nextElementSibling.textContent = inp.value; build(); });
  }
  build();
  return { start() { last = -1; lp.start(); }, stop: lp.stop, final() { show(O); } };
}
VIZ.countPositions = host => conv1d(host, {}, { formula: "the window starts at 0, 1, …, $N$ − $K$   ⇒   $O$ = $N$ − $K$ + 1 = 7 − 3 + 1 = **5**" });
VIZ.padding1d = host => conv1d(host, { P: 1 }, { formula: "$O$ = $N$ + 2$P$ − $K$ + 1 = 7 + 2 − 3 + 1 = **7**   (same size as the input)" });
VIZ.stride1d = host => conv1d(host, { S: 2 }, { formula: "$O$ = ⌊($N$ + 2$P$ − $K$) / $S$⌋ + 1 = ⌊4 / 2⌋ + 1 = **3**" });
VIZ.dilation1d = host => conv1d(host, { D: 2 }, { formula: "span = $D$($K$ − 1) + 1 = 5   ⇒   $O$ = $N$ − $D$($K$ − 1) = 7 − 4 = **3**" });
VIZ.general1d = host => conv1d(host, { N: 8, K: 3, P: 1, S: 2, D: 1 }, { controls: true, h: 400 });

VIZ.channels = host => {
  const svg = V.svg(host, 1400, 400);
  const C = [["blue", "B"], ["green", "G"], ["red", "R"]];
  C.forEach(([c, n], i) => {
    const o = (2 - i) * 28;
    V.rect(svg, 20 + o, 60 + o, 250, 250, "", { fill: `var(--${c}-soft)`, stroke: `var(--${c})`, "stroke-width": 3 });
    V.text(svg, 250 + o, 80 + o, n, { size: 22, weight: 700, fill: `var(--${c})` });
  });
  V.text(svg, 190, 25, "input 3 × $H$ × $W$", { size: 22, weight: 700 });
  const slices = C.map(([c], i) => {
    const g = V.g(svg, { class: "g-anim" });
    V.rect(g, 0, 0, 90, 90, "", { fill: `var(--${c})`, "fill-opacity": .35, stroke: `var(--${c})`, "stroke-width": 3 });
    V.move(g, 450 + (2 - i) * 28 * .8, 120 + (2 - i) * 28 * .8); return g;
  });
  V.text(svg, 520, 25, "filter 3 × 3 × 3", { size: 22, weight: 700 });
  V.text(svg, 520, 334, "one 3 × 3 slice per input channel", { size: 22, cls: "muted" });
  const sumG = V.g(svg, { class: "fade" });
  V.arrow(sumG, 680, 185, 790, 185);
  V.box(sumG, 800, 135, 250, 100, "27 products\nsummed + $b$", "box blue");
  V.arrow(sumG, 1055, 185, 1150, 185);
  const outG = V.g(svg, { class: "fade" });
  V.rect(outG, 1160, 80, 220, 220, "", { style: "fill:var(--blue-soft);stroke:var(--blue);stroke-width:3" });
  V.rect(outG, 1250, 170, 40, 40, "", { style: "fill:var(--blue)" });
  V.text(outG, 1270, 25, "1 output channel", { size: 22, weight: 700 });
  V.text(outG, 1270, 334, "one number per position", { size: 22, cls: "muted" });
  return {
    steps: 3, set(s) {
      slices.forEach((g, i) => { const o = (2 - i) * 28; s >= 1 ? V.move(g, 100 + o, 140 + o) : V.move(g, 450 + o * .8, 120 + o * .8); });
      V.show(sumG, s >= 2); V.show(outG, s >= 3);
    }
  };
};


VIZ.multiOut = host => {
  const svg = V.svg(host, 1400, 420);
  cuboid(svg, 20, 110, 220, 220, 90, "blue");
  V.text(svg, 175, 372, "input  $C$_{in} × $H$ × $W$", { size: 23 });
  const cols = ["orange", "magenta", "green", "violet"];
  const filt = cols.map((c, i) => { const g = cuboid(svg, 470, 40 + i * 85, 60, 60, 90, c, { class: "fade" }); V.text(g, 615, 70 + i * 85, `filter ${i + 1}`, { size: 22, anchor: "start" }); return g; });
  V.text(svg, 560, 400, "$C$_{out} = 4 filters, each $C$_{in} × $K$ × $K$", { size: 22 });
  V.arrow(svg, 330, 200, 450, 200); V.arrow(svg, 720, 200, 850, 200);
  const sl = cols.map((c, i) => { const g = V.g(svg, { class: "fade" }); V.rect(g, 880 + i * 34, 80 + i * 24, 220, 220, "", { style: `fill:var(--${c}-soft);stroke:var(--${c});stroke-width:2.5` }); V.text(g, 880 + i * 34 + 110, 80 + i * 24 + 110, `channel ${i + 1}`, { size: 22, fill: `var(--${c})`, weight: 700 }); return g; }).reverse();
  V.text(svg, 1050, 400, "output  $C$_{out} × $H$_o × $W$_o", { size: 23 });
  return {
    steps: 4, set(s) {
      filt.forEach((g, i) => { V.show(g, true); g.style.opacity = s === 0 ? 1 : (i === s - 1 ? 1 : .3); });
      sl.forEach((g, i) => V.show(g, (3 - i) < s));
      if (s === 0) sl.forEach(g => V.show(g, false));
    }
  };
};

VIZ.params = host => {
  const svg = V.svg(host, 1400, 400);
  V.box(svg, 80, 20, 300, 110, "one filter\n$K$ × $K$ × $C$_{in}", "box blue");
  V.text(svg, 440, 75, "×", { size: 40 });
  V.box(svg, 500, 20, 200, 110, "$C$_{out}\nfilters");
  V.text(svg, 760, 75, "+", { size: 40 });
  V.box(svg, 820, 20, 200, 110, "$C$_{out}\nbiases");
  V.text(svg, 1210, 75, "independent of $H$ × $W$", { size: 23, cls: "muted" });
  const ex = V.text(svg, 550, 170, "example: 3 · 3 · 3 · 32 + 32 = 896", { size: 22 }); ex.classList.add("fade");
  const cmp = V.g(svg, { class: "fade" });
  const conv = V.text(cmp, 160, 245, "conv 3 → 32, 3 × 3", { size: 22, anchor: "start" });
  const fc = V.text(cmp, 160, 325, "dense 224² · 3 → 1000", { size: 22, anchor: "start" });
  const bc = V.rect(cmp, 470, 220, 0, 50, "", { style: "fill:var(--green);transition:width 1.2s ease" });
  const bf = V.rect(cmp, 470, 300, 0, 50, "", { style: "fill:var(--red);transition:width 1.2s ease" });
  const tc = V.text(cmp, 490, 245, "896", { size: 24, weight: 700, anchor: "start" });
  const tf = V.text(cmp, 490, 325, "150 528 000", { size: 24, weight: 700, anchor: "start", fill: "#fff" });
  V.text(cmp, 700, 385, "bar length on a logarithmic scale", { size: 22, cls: "muted" });
  return {
    steps: 2, set(s) {
      V.show(ex, s >= 1); V.show(cmp, s >= 2);
      bc.setAttribute("width", s >= 2 ? 870 * Math.log10(896) / Math.log10(1.5e8) : 0);
      bf.setAttribute("width", s >= 2 ? 870 : 0);
      tc.querySelector("text").setAttribute("x", 470 + (s >= 2 ? 870 * Math.log10(896) / 8.18 + 15 : 15));
      tf.querySelector("text").setAttribute("x", 490);
    }
  };
};

VIZ.cost = flow({
  w: 1400, h: 330, nodes: [
    { id: "p", x: 40, y: 60, w: 400, h: 170, label: "**PARAMETERS**\n$K$²$C$_{in}$C$_{out}\n**18.4 k**", size: 26 },
    { id: "f", x: 500, y: 60, w: 400, h: 170, label: "**MULTIPLY–ADDS**\n$H$_o$W$_o · $K$²$C$_{in}$C$_{out}\n**75.5 M**", cls: "blue", size: 26, step: 1 },
    { id: "a", x: 960, y: 60, w: 400, h: 170, label: "**ACTIVATIONS**\n$C$_{out}$H$_o$W$_o\n**262 k**", size: 26, step: 2 }],
  texts: [{ x: 700, y: 20, t: "example: 3 × 3 conv, 32 → 64 channels, output 64 × 64", size: 23, weight: 700 },

  { x: 240, y: 275, t: "independent of image size" }, { x: 700, y: 280, t: "every weight is used at\nevery output position", step: 1 },
  { x: 1160, y: 280, t: "≈ 1 MB per image (float32),\nstored for backprop", step: 2 }],
});
