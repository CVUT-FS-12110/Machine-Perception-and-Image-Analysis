/* Visuals for Part 4 (training) and Part 5 (data and diagnosis). */
"use strict";


/* ------------------------------------------------------------ Part 4 */
VIZ.logits = host => {
  const svg = V.svg(host, 1400, 330);
  V.box(svg, 20, 90, 280, 140, "feature vector\n$**h**$ ∈ ℝ^{128}\n~after global average pooling");
  V.arrow(svg, 305, 160, 395, 160);
  V.box(svg, 400, 90, 320, 140, "linear layer\n$**z**$ = $**W**$$**h**$ + $**b**$\n~$**W**$: 3 × 128", "box blue");
  V.arrow(svg, 725, 160, 815, 160);
  const rows = [["OK", "2.1"], ["scratch", "−0.4"], ["dent", "1.2"]];
  const g = V.g(svg, { class: "fade" });
  V.text(g, 940, 60, "logits $**z**$", { size: 22, weight: 700 });
  rows.forEach(([n, v], i) => { V.text(g, 830, 110 + i * 50, n, { size: 24, anchor: "start" }); V.text(g, 1060, 110 + i * 50, v, { size: 24, anchor: "end", weight: 700 }); });
  const note = V.text(svg, 1110, 290, "any real numbers:\nnot probabilities", { size: 20, cls: "muted" }); note.classList.add("fade");
  return { steps: 2, set(s) { V.show(g, s >= 1); V.show(note, s >= 2); } };
};

VIZ.softmax = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 360);
  const names = ["OK", "scratch", "dent"], X0 = [120, 600, 1050];
  V.text(svg, 260, 20, "logits $z$", { size: 22, weight: 700 });
  V.text(svg, 700, 20, "softmax: one class (sums to 1)", { size: 22, weight: 700 });
  V.text(svg, 1170, 20, "sigmoid: independent labels", { size: 22, weight: 700 });
  const bar = (x, y, cls) => V.rect(svg, x, y, 0, 46, "", { style: `fill:var(--${cls});transition:width .25s` });
  const B = names.map((n, i) => {
    const y = 70 + i * 90;
    V.text(svg, 40, y + 23, n, { size: 22, anchor: "start" });
    V.path(svg, `M${X0[0] + 150},${y - 8} L${X0[0] + 150},${y + 54}`, "axis");
    return {
      z: bar(X0[0] + 150, y, "muted"), zt: V.text(svg, 0, y + 23, "", { size: 21, weight: 700 }),
      p: bar(X0[1], y, "blue"), pt: V.text(svg, 0, y + 23, "", { size: 21, weight: 700, anchor: "start" }),
      q: bar(X0[2], y, "magenta"), qt: V.text(svg, 0, y + 23, "", { size: 21, weight: 700, anchor: "start" }),
    };
  });
  const sumT = V.text(svg, 760, 340, "", { size: 21, cls: "muted" });
  const upd = v => {
    const z = [v.a, v.b, v.c], e = z.map(Math.exp), S = e.reduce((a, b) => a + b);
    B.forEach((b, i) => {
      const w = Math.abs(z[i]) * 45;
      b.z.setAttribute("x", z[i] >= 0 ? X0[0] + 150 : X0[0] + 150 - w); b.z.setAttribute("width", w);
      b.zt.querySelector("text").setAttribute("x", z[i] >= 0 ? X0[0] + 150 + w + 30 : X0[0] + 150 - w - 30); V.setText(b.zt, z[i].toFixed(1));
      const p = e[i] / S, q = 1 / (1 + Math.exp(-z[i]));
      b.p.setAttribute("width", p * 330); b.pt.querySelector("text").setAttribute("x", X0[1] + p * 330 + 10); V.setText(b.pt, p.toFixed(2));
      b.q.setAttribute("width", q * 250); b.qt.querySelector("text").setAttribute("x", X0[2] + q * 250 + 10); V.setText(b.qt, q.toFixed(2));
    });
    V.setText(sumT, `softmax sums to ${(e.reduce((a, b) => a + b) / S).toFixed(2)}; sigmoid outputs sum to ${z.map(t => 1 / (1 + Math.exp(-t))).reduce((a, b) => a + b).toFixed(2)}`);
  };
  const sl = sliders(host, [{ k: "a", label: "$z$ OK".replace(/\$/g, ""), min: -3, max: 3, step: .1, v: 2.1 }, { k: "b", label: "z scratch", min: -3, max: 3, step: .1, v: -.4 }, { k: "c", label: "z dent", min: -3, max: 3, step: .1, v: 1.2 }], upd);
  upd(sl.vals);
  return {};
};

VIZ.lossLoop = host => {
  const svg = V.svg(host, 1400, 360);
  V.box(svg, 40, 30, 250, 70, "target $y$", "box good");
  V.box(svg, 40, 190, 280, 70, "prediction $f$_θ($x$)", "box");
  V.box(svg, 480, 100, 300, 100, "loss\n$L$($f$_θ($x$), $y$)", "box blue");
  V.box(svg, 960, 100, 260, 100, "gradient\n∇_θ$L$", "box bad");
  V.box(svg, 480, 270, 300, 70, "optimizer updates θ", "box mut");
  V.arrow(svg, 295, 65, 472, 125); V.arrow(svg, 325, 225, 472, 175); V.arrow(svg, 785, 150, 952, 150);
  V.curveArrow(svg, "M1090,205 L1090,305 L790,305"); V.curveArrow(svg, "M475,305 L180,305 L180,268");
};

VIZ.crossEntropy = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 360);
  V.text(svg, 300, 60, "$L$_{CE} = −Σ_c $y$_c log $p$_c = −log $p$_{true}", { size: 30 });
  V.text(svg, 300, 115, "one-hot target: only the true class contributes", { size: 20, cls: "muted" });
  V.box(svg, 60, 160, 480, 60, "true class OK, $p$ = 0.67  →  $L$ = 0.40", "box good", { size: 21 });
  V.box(svg, 60, 240, 480, 60, "true class scratch, $p$ = 0.06  →  $L$ = 2.81", "box bad", { size: 21 });
  const X = p => 760 + p * 560, Y = l => 320 - l * 85;
  plotAxes(svg, X, Y, 0, 1.05, 0, 3.4, "$p$_{true}", "−log $p$");
  V.path(svg, V.pathFn(p => -Math.log(p), .035, 1, X, Y), "curve", { style: "stroke:var(--magenta)" });
  V.circle(svg, X(.67), Y(.4), 8, { fill: "var(--green)" }); V.circle(svg, X(.06), Y(2.81), 8, { fill: "var(--red)" });
  const pt = V.circle(svg, 0, 0, 11, { fill: "var(--blue)" });
  const lbl = V.text(svg, 0, 0, "", { size: 22, weight: 700, anchor: "start" });
  const upd = v => { const l = -Math.log(v.p); pt.setAttribute("cx", X(v.p)); pt.setAttribute("cy", Y(l)); const t = lbl.querySelector("text"); t.setAttribute("x", X(v.p) + 16); t.setAttribute("y", Y(l) - 18); V.setText(lbl, `$L$ = ${l.toFixed(2)}`); };
  const sl = sliders(host, [{ k: "p", label: "probability of the true class", min: .03, max: 1, step: .01, v: .3 }], upd);
  upd(sl.vals);
  return {};
};

VIZ.regression = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 360);
  const X = r => 400 + r * 110, Y = l => 330 - l * 62;
  V.path(svg, `M${X(-3.3)},${Y(0)} L${X(3.4)},${Y(0)} M${X(0)},${Y(0)} L${X(0)},${Y(4.9)}`, "axis");
  V.text(svg, X(3.4) + 10, Y(0), "error $r$", { size: 20, anchor: "start", cls: "muted" });
  const fs = [["MSE  $r$²/2", "blue", r => r * r / 2], ["MAE  |$r$|", "magenta", r => Math.abs(r)], ["Huber (δ = 1)", "green", r => Math.abs(r) < 1 ? r * r / 2 : Math.abs(r) - .5]];
  const vt = fs.map(([n, c, f], i) => {
    V.path(svg, V.pathFn(f, -3, 3, X, Y, 120), "curve", { style: `stroke:var(--${c})` });
    V.path(svg, `M860,${60 + i * 60} L910,${60 + i * 60}`, "", { style: `stroke:var(--${c});stroke-width:5` });
    V.text(svg, 925, 60 + i * 60, n, { size: 22, anchor: "start", fill: `var(--${c})`, weight: 700 });
    return V.text(svg, 1300, 60 + i * 60, "", { size: 22, anchor: "end", weight: 700 });
  });
  V.text(svg, 1120, 260, "outliers dominate MSE;\nHuber keeps the gradient bounded", { size: 20, cls: "muted" });
  const vl = V.line(svg, 0, Y(0), 0, Y(4.6), { style: "stroke:var(--ink)", "stroke-dasharray": "6 5" });
  const upd = v => { vl.setAttribute("x1", X(v.r)); vl.setAttribute("x2", X(v.r)); fs.forEach(([, , f], i) => V.setText(vt[i], f(v.r).toFixed(2))); };
  const sl = sliders(host, [{ k: "r", label: "error r", min: -3, max: 3, step: .1, v: 2.5 }], upd); upd(sl.vals);
  return {};
};

VIZ.segLoss = host => {
  const svg = V.svg(host, 1400, 360);
  for (let i = 0; i < 10; i++) for (let j = 0; j < 20; j++) V.rect(svg, 20 + j * 17, 40 + i * 17, 17, 17, "", { fill: (i === 4 || i === 5) && j === 9 ? "var(--magenta)" : "#eef1f3", stroke: "#fff" });
  V.text(svg, 190, 18, "defect = 1 % of pixels", { size: 21, weight: 700 });
  V.text(svg, 190, 240, "pixel-wise CE: 99 % of the loss\ncomes from background", { size: 19, cls: "muted" });
  V.box(svg, 480, 50, 400, 170, "pixel-wise cross-entropy\n−(1/$HW$) Σ log $p$_{true}\n~every pixel counts equally\n~→ dominated by background", "box");
  V.text(svg, 935, 135, "or", { size: 26, cls: "muted" });
  V.box(svg, 990, 50, 400, 170, "Dice loss\n1 − 2|$P$ ∩ $G$| / (|$P$| + |$G$|)\n~overlap of the whole region\n~→ insensitive to object size", "box blue");
  V.text(svg, 935, 290, "two independent choices: each loss can be used on its own", { size: 20, cls: "muted" });
};

VIZ.gd1d = host => {
  const svg = V.svg(host, 1400, 380);
  const L = w => .3 * (w - 3.2) ** 2 + .3, dL = w => .6 * (w - 3.2), eta = 1.2;
  const X = w => 80 + w * 125, Y = l => 330 - l * 85;
  plotAxes(svg, X, Y, 0, 6.6, 0, 3.6, "weight $w$", "loss $L$($w$)");
  V.path(svg, V.pathFn(L, .15, 6.2, X, Y), "curve");
  const ws = [.4]; for (let k = 0; k < 6; k++) ws.push(ws[k] - eta * dL(ws[k]));
  const tan = V.line(svg, 0, 0, 0, 0, { style: "stroke:var(--magenta)", "stroke-width": 3 });
  const trail = V.g(svg);
  const ball = V.circle(svg, 0, 0, 13, { fill: "var(--magenta)" }); ball.classList.add("g-anim");
  ball.setAttribute("cx", 0); ball.setAttribute("cy", 0);
  const info = V.text(svg, 1150, 120, "", { size: 24 });
  V.box(svg, 1000, 200, 320, 90, "$w$ ← $w$ − $η$ ∂$L$/∂$w$", "box blue", { size: 26 });
  V.text(svg, 1160, 320, "negative slope ⇒ increase $w$\npositive slope ⇒ decrease $w$", { size: 19, cls: "muted" });
  return {
    steps: 5, set(s) {
      const w = ws[s];
      V.move(ball, X(w), Y(L(w)));
      const g = dL(w), a = w - .8, b = w + .8;
      tan.setAttribute("x1", X(a)); tan.setAttribute("y1", Y(L(w) + g * (a - w))); tan.setAttribute("x2", X(b)); tan.setAttribute("y2", Y(L(w) + g * (b - w)));
      trail.innerHTML = ""; for (let k = 0; k < s; k++) { V.circle(trail, X(ws[k]), Y(L(ws[k])), 6, { fill: "var(--muted)" }); V.arrow(trail, X(ws[k]), Y(L(ws[k])) - 18, X(ws[k + 1]), Y(L(ws[k + 1])) - 18, "muted", { "stroke-width": 2 }); }
      info.innerHTML = ""; V.text(info, 1150, 85, `step ${s}:  $w$ = ${w.toFixed(2)}`, { size: 24 }); V.text(info, 1150, 125, `slope = ${g.toFixed(2)}`, { size: 22, cls: "muted" });
    }
  };
};

VIZ.lrPanels = host => {
  const svg = V.svg(host, 1400, 380);
  const P = [["η too small", "orange", .9, "slow progress"], ["η suitable", "green", .3, "fast and stable"], ["η too large", "red", -1.25, "oscillates, diverges → NaN"]];
  const panels = P.map(([t, c, f, n], i) => {
    const ox = 230 + i * 470, X = w => ox + w * 60, Y = l => 300 - l * 75;
    V.path(svg, V.pathFn(w => .3 * w * w, -3.2, 3.2, X, Y), "curve");
    V.path(svg, `M${X(-3.4)},${Y(0)} L${X(3.4)},${Y(0)}`, "axis");
    V.text(svg, ox, 20, t, { size: 24, weight: 700, fill: `var(--${c})` });
    V.text(svg, ox, 345, n, { size: 20, cls: "muted" });
    return { g: V.g(svg), X, Y, c, f };
  });
  let last = -1;
  const draw = k => panels.forEach(p => {
    p.g.innerHTML = ""; let w = -2.2, prev = null;
    for (let i = 0; i <= k; i++) {
      const cw = Math.max(-3.3, Math.min(3.3, w)), pt = [p.X(cw), p.Y(.3 * cw * cw)];
      if (prev) V.arrow(p.g, prev[0], prev[1], pt[0], pt[1], p.c, { "stroke-width": 2.5 });
      V.circle(p.g, pt[0], pt[1], i === k ? 10 : 6, { fill: `var(--${p.c})` });
      prev = pt; w *= p.f;
    }
  });
  const lp = V.loop(t => { const k = Math.floor(t / .7) % 9; if (k !== last) { last = k; draw(Math.min(k, 6)); } });
  return { start() { last = -1; lp.start(); }, stop: lp.stop, final() { draw(6); } };
};

VIZ.backprop = host => {
  const svg = V.svg(host, 1400, 330);
  const N = [["input $x$", 0], ["conv", 270], ["ReLU", 520], ["logits $z$", 770], ["loss $L$", 1060]];
  N.forEach(([l, x], i) => V.box(svg, x, 60, i === 4 ? 200 : 190, 80, l, "box " + (i === 4 ? "blue" : "")));
  for (let i = 0; i < 4; i++) V.arrow(svg, N[i][0] && N[i][1] + 195, 100, N[i + 1][1] - 8, 100);
  V.text(svg, 232, 75, "forward", { size: 18, cls: "muted" });
  const bw = V.g(svg, { class: "fade" });
  const back = [[1160, 145, 865, 145], [865, 145, 615, 145], [615, 145, 365, 145]];
  back.forEach(([a, b, c, d]) => V.curveArrow(bw, `M${a},${b} Q${(a + c) / 2},${b + 90} ${c},${d + 4}`, "magenta"));
  V.text(bw, 1010, 225, "∂$L$/∂$z$", { size: 21, fill: "var(--magenta)" }); V.text(bw, 490, 225, "backward", { size: 19, fill: "var(--magenta)" });
  const cr = V.text(svg, 700, 300, "chain rule:  ∂$L$/∂$w$ = ∂$L$/∂$z$ · ∂$z$/∂$a$ · ∂$a$/∂$w$  — each layer multiplies by its local derivative", { size: 21, cls: "muted" });
  cr.classList.add("fade");
  return { steps: 2, set(s) { V.show(bw, s >= 1); V.show(cr, s >= 2); } };
};

VIZ.sharedGrad = host => {
  const svg = V.svg(host, 1400, 400), s = 56;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) V.rect(svg, 20 + c * s, 60 + r * s, s, s, "cell");
  V.text(svg, 160, 30, "input $x$", { size: 22, weight: 700 });
  const win = V.g(svg, { class: "g-anim" }); V.rect(win, 0, 0, 3 * s, 3 * s, "win");
  const outs = range(9).map(k => V.rect(svg, 440 + (k % 3) * s, 116 + Math.floor(k / 3) * s, s, s, "cell"));
  V.text(svg, 524, 85, "output $y$", { size: 22, weight: 700 });
  V.box(svg, 820, 150, 230, 100, "Σ over all\npositions", "box blue");
  V.box(svg, 1140, 160, 200, 80, "∂$L$/∂$K$", "box good", { size: 26 });
  V.arrow(svg, 1055, 200, 1132, 200);
  const ar = V.path(svg, "", "", { style: "stroke:var(--orange);stroke-width:3.5;fill:none", "marker-end": "url(#ah-orange)" });
  const cnt = V.text(svg, 935, 290, "", { size: 21, cls: "muted" });
  V.text(svg, 700, 375, "∂$L$/∂$k$_{u,v} = Σ_{i,j} ∂$L$/∂$y$_{i,j} · $x$_{i+u, j+v}   — every output position contributes to the same kernel", { size: 21, cls: "muted" });
  let last = -1;
  const lp = V.loop(t => {
    const k = Math.floor(t / .8) % 11; if (k === last) return; last = k;
    const q = Math.min(k, 8);
    V.move(win, 20 + (q % 3) * s, 60 + Math.floor(q / 3) * s); win.style.opacity = k < 9 ? 1 : 0;
    outs.forEach((o, i) => o.style.fill = i < k ? "var(--orange-soft)" : (i === k ? "var(--orange)" : ""));
    const cx = 440 + (q % 3) * s + s, cy = 116 + Math.floor(q / 3) * s + s / 2;
    ar.setAttribute("d", k < 9 ? `M${cx + 4},${cy} L812,200` : ""); V.setText(cnt, `contributions summed: ${Math.min(k + 1, 9)} / 9`);
  });
  return { start() { last = -1; lp.start(); }, stop: lp.stop };
};

VIZ.batchEpoch = host => {
  const svg = V.svg(host, 1400, 330);
  const tiles = range(12).map(i => { const g = V.g(svg, { class: "g-anim" }); V.rect(g, 0, 0, 80, 80, "", { rx: 6, style: "fill:#eef1f3;stroke:var(--rule);stroke-width:2" }); V.text(g, 40, 40, `#${i + 1}`, { size: 22 }); g._r = g.firstChild; return g; });
  const it = V.text(svg, 1220, 110, "", { size: 26 }), ep = V.text(svg, 1220, 160, "", { size: 26 });
  V.text(svg, 520, 250, "one epoch = all 12 images; minibatch $B$ = 4 ⇒ 12 / 4 = 3 iterations per epoch", { size: 21, cls: "muted" });
  V.text(svg, 520, 290, "each epoch uses a new random order", { size: 20, cls: "muted" });
  let order = range(12), last = -1;
  const place = () => order.forEach((id, p) => V.move(tiles[id], 20 + p * 88 + Math.floor(p / 4) * 24, 70));
  const lp = V.loop(t => {
    const k = Math.floor(t / 1.1); if (k === last) return; last = k;
    const e = Math.floor(k / 4), b = k % 4;
    if (b === 3) { order = order.map(v => [Math.random(), v]).sort((a, c) => a[0] - c[0]).map(v => v[1]); place(); tiles.forEach(g => g._r.style.fill = "#eef1f3"); }
    else order.forEach((id, p) => tiles[id]._r.style.fill = Math.floor(p / 4) === b ? "var(--blue-mid)" : Math.floor(p / 4) < b ? "var(--blue-soft)" : "#eef1f3");
    V.setText(it, b < 3 ? `iteration ${e * 3 + b + 1}` : "shuffle"); V.setText(ep, `epoch ${e + 1}`);
  });
  place();
  return { start() { last = -1; lp.start(); }, stop: lp.stop };
};

VIZ.optimizers = host => {
  const svg = V.svg(host, 1400, 380);
  const a = 1, b = 14, grad = ([x, y]) => [a * x, b * y];
  const run = step => { let p = [-4.2, 1.15]; const st = {}, out = [p.slice()]; for (let i = 0; i < 60; i++) { p = step(p, grad(p), st, i + 1); out.push(p.slice()); } return out; };
  const sgd = run((p, g, s) => { s.v = s.v || [0, 0]; s.v = s.v.map((v, i) => .85 * v + g[i]); return p.map((x, i) => x - .055 * s.v[i]); });
  const adam = run((p, g, s, t) => {
    s.m = s.m || [0, 0]; s.v = s.v || [0, 0];
    s.m = s.m.map((m, i) => .9 * m + .1 * g[i]); s.v = s.v.map((v, i) => .999 * v + .001 * g[i] * g[i]);
    return p.map((x, i) => x - .3 * (s.m[i] / (1 - .9 ** t)) / (Math.sqrt(s.v[i] / (1 - .999 ** t)) + 1e-8));
  });
  const panel = (ox, title, note, path, c) => {
    const X = x => ox + x * 62, Y = y => 170 - y * 62;
    [.5, 1.2, 2.2, 3.4, 4.6].forEach(r => V.el("ellipse", { cx: X(0), cy: Y(0), rx: r * 62, ry: r * 62 * Math.sqrt(a / b), fill: "none", stroke: "var(--rule)", "stroke-width": 2 }, svg));
    V.circle(svg, X(0), Y(0), 6, { fill: "var(--ink)" });
    V.text(svg, ox, 320, title, { size: 24, weight: 700 }); V.text(svg, ox, 352, note, { size: 19, cls: "muted" });
    const pl = V.el("polyline", { fill: "none", stroke: `var(--${c})`, "stroke-width": 3.5, "stroke-linejoin": "round" }, svg);
    const dot = V.circle(svg, 0, 0, 9, { fill: `var(--${c})` });
    return k => { const pts = path.slice(0, k + 1).map(([x, y]) => [X(x), Y(y)]); pl.setAttribute("points", pts.map(p => p.join(",")).join(" ")); const q = pts[pts.length - 1]; dot.setAttribute("cx", q[0]); dot.setAttribute("cy", q[1]); };
  };
  const A = panel(330, "SGD + momentum", "averages past gradients, damps the zig-zag", sgd, "blue");
  const B = panel(1060, "AdamW", "per-parameter step size + decoupled weight decay", adam, "magenta");
  const lp = V.loop(t => { const k = Math.min(60, Math.floor((t % 9) * 9)); A(k); B(k); });
  return { start: lp.start, stop: lp.stop, final() { A(60); B(60); } };
};

VIZ.schedule = host => {
  const svg = V.svg(host, 1400, 340);
  const X = s => 350 + s * 7, Y = e => 300 - e * 240;
  const eta = s => s < 10 ? s / 10 : .5 * (1 + Math.cos(Math.PI * (s - 10) / 90));
  plotAxes(svg, X, Y, 0, 104, 0, 1.12, "step", "$η$");
  V.path(svg, V.pathFn(eta, 0, 100, X, Y, 200), "curve");
  V.path(svg, `M${X(10)},${Y(0)} L${X(10)},${Y(1)}`, "line", { "stroke-dasharray": "6 5", style: "stroke:var(--muted)" });
  V.text(svg, X(5), Y(1.08), "warm-up", { size: 20, cls: "muted" }); V.text(svg, X(55), Y(.8), "cosine decay", { size: 20, cls: "muted" });
  const d = V.circle(svg, 0, 0, 10, { fill: "var(--magenta)" });
  const lp = V.loop(t => { const s = (t * 18) % 100; d.setAttribute("cx", X(s)); d.setAttribute("cy", Y(eta(s))); });
  return { start: lp.start, stop: lp.stop };
};

/* ------------------------------------------------------------ Part 5 */
VIZ.splits = host => {
  const svg = V.svg(host, 1400, 260);
  const S = [["TRAIN 70 %", 980, "blue-mid", "parameter learning"], ["VAL 15 %", 210, "green-soft", "model selection"], ["TEST 15 %", 210, "orange-soft", "final estimate"]];
  let x = 0; const R = S.map(([n, w, c, d]) => {
    const g = V.g(svg); const r = V.rect(g, x, 40, 0, 120, "", { style: `fill:var(--${c});stroke:#fff;stroke-width:3;transition:width .9s ease` });
    V.text(g, x + w / 2, 100, n, { size: 26, weight: 700 }); V.text(g, x + w / 2, 200, d, { size: 21, cls: "muted" });
    r._w = w; x += w; return r;
  });
  return { start() { R.forEach(r => { r.setAttribute("width", 0); requestAnimationFrame(() => requestAnimationFrame(() => r.setAttribute("width", r._w))); }); }, final() { R.forEach(r => r.setAttribute("width", r._w)); } };
};

VIZ.leakage = flow({
  w: 1400, h: 280, nodes: [
    { id: "w", x: 40, y: 80, w: 470, h: 130, label: "TRAIN: A1, B1, C1\nTEST: A2, B2, C2", cls: "bad", size: 26 },
    { id: "c", x: 880, y: 80, w: 470, h: 130, label: "TRAIN: A1, A2, B1, B2\nTEST: C1, C2", cls: "good", size: 26, step: 1 }],
  edges: [{ a: "w", b: "c", step: 1, label: "group by item", lx: 695, ly: 120 }],
  texts: [{ x: 275, y: 40, t: "wrong: photos of one item in both splits", size: 22, weight: 700, cls: "" },
  { x: 1115, y: 40, t: "correct: split by item", size: 22, weight: 700, cls: "", step: 1 },
  { x: 275, y: 245, t: "A1, A2 = two photos of item A" }],
});

function curvesViz(host, fns, opt) {
  const svg = V.svg(host, 1400, 380);
  const X = e => 200 + e * 110, Y = l => 330 - l * 95;
  plotAxes(svg, X, Y, 0, 8.3, 0, 3.2, "epoch", "loss");
  const P = fns.map(([f, c, n]) => ({ f, c, n, p: V.path(svg, "", "curve", { style: `stroke:var(--${c})` }), t: V.text(svg, 0, 0, n, { size: 22, fill: `var(--${c})`, weight: 700, anchor: "start" }) }));
  const extra = opt.extra ? opt.extra(svg, X, Y) : null;
  const draw = e => {
    P.forEach(q => { q.p.setAttribute("d", V.pathFn(q.f, .1, Math.max(.11, e), X, Y, 100)); const t = q.t.querySelector("text"); t.setAttribute("x", X(e) + 12); t.setAttribute("y", Y(q.f(e))); });
    if (extra) extra(e);
  };
  const lp = V.loop(t => draw(Math.min(8, (t % 7) * 1.6)));
  return { start: lp.start, stop: lp.stop, final() { draw(8); } };
}
VIZ.overfit = host => curvesViz(host, [[e => 2.6 * Math.exp(-.45 * e) + .22, "blue", "train"], [e => 2.5 * Math.exp(-.5 * e) + .55 + .03 * e * e, "red", "validation"]], {
  extra(svg, X, Y) {
    const best = 3.45, g = V.g(svg, { class: "fade" });
    V.path(g, `M${X(best)},${Y(0)} L${X(best)},${Y(2.9)}`, "line", { "stroke-dasharray": "7 6" });
    V.text(g, X(best), Y(3.05), "best checkpoint (early stopping)", { size: 20, weight: 700 });
    const gap = V.g(svg, { class: "fade" });
    V.text(gap, X(7.2), Y(1.3), "growing gap:\nmemorizing the\ntraining set", { size: 19, fill: "var(--magenta)" });
    return e => { V.show(g, e > best + .4); V.show(gap, e > 6); };
  }
});
VIZ.underfit = host => curvesViz(host, [[e => 1.2 * Math.exp(-.5 * e) + 1.6, "blue", "train"], [e => 1.3 * Math.exp(-.5 * e) + 1.9, "red", "validation"]], {
  extra(svg, X, Y) {
    V.path(svg, `M${X(0)},${Y(.45)} L${X(8)},${Y(.45)}`, "line", { "stroke-dasharray": "7 6", style: "stroke:var(--muted)" });
    V.text(svg, X(8) + 10, Y(.45), "achievable", { size: 19, cls: "muted", anchor: "start" });
    V.text(svg, X(4), Y(1.1), "both errors remain high", { size: 21, cls: "muted" });
    return null;
  }
});

VIZ.augment = host => {
  const svg = V.svg(host, 1400, 380);
  const P = [["ORIGINAL", "blue", "image, box and mask\ndescribe one object"], ["✓ GEOMETRIC", "green", "rotate image, box and mask\nby the same transform"],
  ["✓ PHOTOMETRIC", "green", "change appearance;\ngeometry stays fixed"], ["✗ LABEL CHANGES", "red", "a horizontal flip changes\na left/right label"]];
  const objs = P.map(([t, c, n], i) => {
    const x = i * 350;
    V.rect(svg, x, 0, 320, 370, "", { rx: 8, style: `fill:${i ? `var(--${c}-soft)` : "#fff"};stroke:var(--${c});stroke-width:2.5;fill-opacity:.35` });
    V.text(svg, x + 160, 30, t, { size: 21, weight: 700, fill: `var(--${c})` });
    V.text(svg, x + 160, 325, n, { size: 18, cls: "muted" });
    const bg = V.rect(svg, x + 25, 60, 270, 220, "", { style: "fill:#f1f2f3" });
    const g = V.g(svg); g.style.transformOrigin = `${x + 160}px 170px`; g.style.transition = "transform .9s ease, filter .9s";
    V.rect(g, x + 60, 120, 200, 100, "", { rx: 6, style: "fill:#9aa0a6;stroke:var(--muted);stroke-width:2" });
    V.circle(g, x + 160, 170, 30, { style: "fill:#fff;stroke:var(--muted);stroke-width:2" });
    V.circle(g, x + 85, 170, 11, { fill: "var(--magenta)" });
    V.rect(g, x + 48, 108, 224, 124, "", { style: "fill:none;stroke:var(--blue);stroke-width:4" });
    return { g, bg };
  });
  const lbl = V.text(svg, 1210, 255, "", { size: 19, weight: 700, fill: "var(--red)" });
  const render = ph => {
    objs[1].g.style.transform = `rotate(${ph ? 14 : -10}deg)`;
    objs[2].g.style.filter = ph ? "brightness(.6) sepia(.6)" : "brightness(1.15)";
    objs[2].bg.style.fill = ph ? "#e8d3b0" : "#f6f6f6";
    objs[3].g.style.transform = ph ? "scaleX(-1)" : "";
    V.setText(lbl, ph ? "defect now on the RIGHT" : "label: defect on the LEFT");
  };
  const lp = V.loop(t => render(Math.floor(t / 1.6) % 2));
  return { start: lp.start, stop: lp.stop, final() { render(1); } };
};

VIZ.imbalance = host => {
  const svg = V.svg(host, 1400, 330);
  plotAxes(svg, x => 60 + x, y => 290 - y, 0, 420, 0, 260);
  V.rect(svg, 120, 290 - 238, 110, 238, "", { style: "fill:var(--blue-mid)" }); V.rect(svg, 290, 290 - 12, 110, 12, "", { style: "fill:var(--magenta)" });
  V.text(svg, 175, 38, "950", { size: 24, weight: 700 }); V.text(svg, 345, 262, "50", { size: 24, weight: 700 });
  V.text(svg, 175, 312, "OK", { size: 21 }); V.text(svg, 345, 312, "defect", { size: 21 });
  const a = V.box(svg, 620, 50, 640, 100, "always predict “OK” ⇒ accuracy 95 %\n~yet zero recall for defects", "box"); a.classList.add("fade");
  const b = V.box(svg, 620, 180, 640, 100, "report per-class precision, recall,\nand the confusion matrix", "box blue"); b.classList.add("fade");
  return { steps: 2, set(s) { V.show(a, s >= 1); V.show(b, s >= 2); } };
};

VIZ.transfer = flow({
  w: 1400, h: 300, nodes: [
    { id: "s", x: 0, y: 40, w: 250, h: 100, label: "large source\ndataset" },
    { id: "b", x: 340, y: 40, w: 310, h: 100, label: "pretrained backbone\n~frozen at first", cls: "mut" },
    { id: "h", x: 740, y: 40, w: 280, h: 100, label: "new head\nfor the target task", cls: "blue", step: 1 },
    { id: "t", x: 1110, y: 40, w: 260, h: 100, label: "small target\ndataset", cls: "good", step: 1 }],
  edges: [{ a: "s", b: "b" }, { a: "b", b: "h", step: 1 }, { a: "h", b: "t", step: 1, d: "M1102,90 L1025,90" },
  { a: "t", b: "b", d: "M1240,145 Q900,300 500,145", color: "magenta", step: 2, label: "fine-tune according to the domain shift", lx: 870, ly: 270 }],
});

VIZ.regularize = host => {
  const svg = V.svg(host, 1400, 330);
  V.box(svg, 20, 30, 400, 110, "weight decay\n$**w**$ ← (1 − $ηλ$)$**w**$");
  V.text(svg, 220, 175, "limits weight magnitude", { size: 20, cls: "muted" });
  V.box(svg, 500, 30, 400, 110, "dropout\n~random units switched off in training", "box blue");
  const units = range(8).map(i => V.circle(svg, 545 + i * 44, 230, 16, { style: "stroke:var(--blue);stroke-width:2.5;transition:fill .3s" }));
  V.box(svg, 980, 30, 400, 110, "augmentation\n~safe data invariances", "box good");
  V.text(svg, 1180, 175, "often the most effective for CNNs", { size: 20, cls: "muted" });
  const bars = range(6).map(i => V.rect(svg, 60 + i * 55, 300, 34, 0, "", { style: "fill:var(--blue-mid);transition:all .5s" }));
  const w0 = [70, 40, 95, 55, 80, 30];
  const lp = V.loop(t => {
    const k = Math.floor(t / .9);
    units.forEach(u => u.style.fill = Math.random() < .35 ? "#fff" : "var(--blue-mid)");
    const f = Math.pow(.88, k % 8);
    bars.forEach((b, i) => { b.setAttribute("height", w0[i] * f); b.setAttribute("y", 300 - w0[i] * f); });
  });
  let lk = -1;
  return { start() { lp.start(); }, stop: lp.stop };
};

VIZ.diagnostics = host => {
  const svg = V.svg(host, 1400, 360);
  const T = [["healthy run", e => 1.8 * Math.exp(-.5 * e) + .25, e => 1.8 * Math.exp(-.45 * e) + .55, "keep going"],
  ["plateau", e => 1.2 * Math.exp(-1.2 * e) + .85, e => 1.2 * Math.exp(-1.1 * e) + 1.1, "check data, capacity, $η$"],
  ["NaN", e => e < 4.2 ? 1.6 * Math.exp(-.45 * e) + .4 : 1.6 * Math.exp(-.45 * 4.2) + .4 + (e - 4.2) * 3, null, "lower $η$, check inputs"]];
  const P = T.map(([t, f, g, n], i) => {
    const ox = 60 + i * 470, X = e => ox + e * 60, Y = l => 290 - l * 110;
    plotAxes(svg, X, Y, 0, 6.2, 0, 2.2);
    V.text(svg, ox + 180, 20, t, { size: 24, weight: 700 }); V.text(svg, ox + 180, 335, n, { size: 19, cls: "muted" });
    const pf = V.path(svg, "", "curve"), pg = g ? V.path(svg, "", "curve", { style: "stroke:var(--red)" }) : null;
    const nan = i === 2 ? V.text(svg, X(5.3), Y(2.05), "NaN", { size: 26, weight: 700, fill: "var(--red)" }) : null;
    return e => {
      pf.setAttribute("d", V.pathFn(t => Math.min(2.1, f(t)), .05, e, X, Y, 80)); if (pg) pg.setAttribute("d", V.pathFn(g, .05, e, X, Y, 80));
      if (nan) V.show(nan, e > 4.6);
    };
  });
  V.text(svg, 400, 60, "train", { size: 20, fill: "var(--blue)", weight: 700, anchor: "end" }); V.text(svg, 400, 88, "validation", { size: 20, fill: "var(--red)", weight: 700, anchor: "end" });
  const lp = V.loop(t => { const e = Math.min(6, .1 + (t % 6) * 1.4); P.forEach(p => p(e)); });
  return { start: lp.start, stop: lp.stop, final() { P.forEach(p => p(6)); } };
};

VIZ.confusion = host => {
  const svg = V.svg(host, 1400, 400), s = 95, ox = 260, oy = 80;
  const M = [[91, 4, 1], [6, 72, 12], [2, 7, 68]], C = ["OK", "scratch", "dent"];
  V.text(svg, ox + 1.5 * s, 22, "predicted class", { size: 22, weight: 700 });
  V.text(svg, 90, oy + 1.5 * s, "true class", { size: 22, weight: 700 });
  C.forEach((c, i) => { V.text(svg, ox + i * s + s / 2, oy - 22, c, { size: 20 }); V.text(svg, ox - 14, oy + i * s + s / 2, c, { size: 20, anchor: "end" }); });
  M.forEach((r, i) => r.forEach((v, j) => {
    const hot = i === 1 && j === 2;
    const rc = V.rect(svg, ox + j * s, oy + i * s, s, s, "", { style: `fill:${i === j ? "var(--blue-mid)" : hot ? "var(--magenta-soft)" : "#eef4f9"};stroke:#fff;stroke-width:4` });
    if (hot) rc.classList.add("pulse");
    V.text(svg, ox + j * s + s / 2, oy + i * s + s / 2, v, { size: 28, weight: 700 });
  }));
  V.arrow(svg, ox + 3 * s + 10, oy + 1.5 * s, 790, oy + 1.5 * s, "magenta");
  V.box(svg, 800, oy + 1.5 * s - 55, 420, 110, "inspect these 12 images:\ntrue scratch, predicted dent", "box mut");
  V.text(svg, ox + 1.5 * s, 385, "the diagonal holds the correct predictions", { size: 19, cls: "muted" });
};

VIZ.errorTax = flow({
  w: 1400, h: 300, nodes: [
    { id: "a", x: 0, y: 20, w: 330, h: 110, label: "illumination\n~exposure, glare" }, { id: "b", x: 370, y: 20, w: 330, h: 110, label: "camera\n~focus, position" },
    { id: "c", x: 0, y: 170, w: 330, h: 110, label: "class\n~rare defect type" }, { id: "d", x: 370, y: 170, w: 330, h: 110, label: "geometry\n~rotation, occlusion" },
    { id: "e", x: 950, y: 95, w: 380, h: 110, label: "each group requires\na different fix", cls: "blue", step: 1 }],
  edges: [{ a: "b", b: "e", d: "M710,150 L940,150", step: 1 }],
});
VIZ.repro = flow({
  w: 1400, h: 260, nodes: [
    { id: "a", x: 0, y: 40, w: 290, h: 130, label: "**DATA SNAPSHOT**\n~version + split" },
    { id: "b", x: 360, y: 40, w: 310, h: 130, label: "**RUN SPEC**\n~code + config + seed\n~environment" },
    { id: "c", x: 740, y: 40, w: 280, h: 130, label: "**EXECUTION**\n~metric log, run ID", cls: "blue" },
    { id: "d", x: 1090, y: 40, w: 300, h: 130, label: "**ARTIFACTS**\n~checkpoint\n~normalization", cls: "good" }],
  edges: [{ a: "a", b: "b" }, { a: "b", b: "c" }, { a: "c", b: "d" }],
  texts: [{ x: 700, y: 225, t: "same snapshot + same specification ⇒ comparable rerun" }],
});
VIZ.compute = flow({
  w: 1400, h: 240, nodes: [
    { id: "p", x: 0, y: 40, w: 290, h: 150, label: "PARAMETERS\n**3.2 M**\n~weight storage", size: 26 },
    { id: "f", x: 360, y: 40, w: 290, h: 150, label: "FLOPs\n**0.8 G**\n~operation count", size: 26 },
    { id: "l", x: 720, y: 40, w: 290, h: 150, label: "LATENCY\n**12 ms**\n~target hardware", cls: "blue", size: 26 },
    { id: "m", x: 1090, y: 55, w: 300, h: 120, label: "measure with a realistic\nbatch and pipeline", cls: "good", step: 1 }],
  edges: [{ a: "p", b: "f" }, { a: "f", b: "l" }],
});
VIZ.experiment = flow({
  w: 1400, h: 280, nodes: [
    { id: "a", x: 0, y: 40, w: 230, h: 100, label: "overfit a\nsmall subset" }, { id: "b", x: 290, y: 40, w: 210, h: 100, label: "simple\nbaseline" },
    { id: "c", x: 560, y: 40, w: 220, h: 100, label: "full training", cls: "blue" }, { id: "d", x: 840, y: 40, w: 240, h: 100, label: "one change\nper experiment" },
    { id: "e", x: 1140, y: 40, w: 240, h: 100, label: "error catalogue", cls: "good" }],
  edges: [{ a: "a", b: "b" }, { a: "b", b: "c" }, { a: "c", b: "d" }, { a: "d", b: "e" },
  { a: "e", b: "b", d: "M1260,145 Q830,300 400,148", step: 1 }],
});
VIZ.workflow = flow({
  w: 1400, h: 280, nodes: [
    { id: "a", x: 0, y: 40, w: 220, h: 100, label: "error\ntolerance" }, { id: "b", x: 290, y: 40, w: 220, h: 100, label: "data\nand split" },
    { id: "c", x: 580, y: 40, w: 220, h: 100, label: "baseline", cls: "blue" }, { id: "d", x: 870, y: 40, w: 220, h: 100, label: "failure\ncatalogue" },
    { id: "e", x: 1160, y: 40, w: 220, h: 100, label: "in-service\nvalidation", cls: "good" }],
  edges: [{ a: "a", b: "b" }, { a: "b", b: "c" }, { a: "c", b: "d" }, { a: "d", b: "e" },
  { a: "d", b: "b", d: "M980,145 Q690,300 400,148", label: "fix data or measurement", lx: 690, ly: 265 }],
});
VIZ.summary = flow({
  w: 1400, h: 180, nodes: [
    { id: "a", x: 0, y: 40, w: 300, h: 110, label: "**CONVOLUTION**\n~locality + sharing", cls: "blue" },
    { id: "b", x: 360, y: 40, w: 300, h: 110, label: "**SHAPES**\n~resolution + receptive field", step: 1 },
    { id: "c", x: 720, y: 40, w: 300, h: 110, label: "**TRAINING**\n~loss + optimizer", step: 2 },
    { id: "d", x: 1080, y: 40, w: 300, h: 110, label: "**VALIDATION**\n~split + error analysis", cls: "good", step: 3 }],
  edges: [{ a: "a", b: "b", step: 1 }, { a: "b", b: "c", step: 2 }, { a: "c", b: "d", step: 3 }],
});
VIZ.nextLecture = flow({
  w: 1400, h: 200, nodes: [
    { id: "a", x: 0, y: 40, w: 180, h: 100, label: "image" }, { id: "b", x: 250, y: 40, w: 230, h: 100, label: "backbone\n~features", cls: "blue" },
    { id: "c", x: 550, y: 40, w: 230, h: 100, label: "neck\n~multiple scales" }, { id: "d", x: 850, y: 40, w: 230, h: 100, label: "head\n~predictions" },
    { id: "e", x: 1150, y: 25, w: 240, h: 130, label: "classification\ndetection\nsegmentation", cls: "good" }],
  edges: [{ a: "a", b: "b" }, { a: "b", b: "c" }, { a: "c", b: "d" }, { a: "d", b: "e" }],
});
