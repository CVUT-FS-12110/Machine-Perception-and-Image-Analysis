/* Lecture 3 — Part 6 (dynamic scenes) and Part 7 (evaluation and practice). */
"use strict";

/* ------------------------------------------------------------ Part 6 */
VIZ.dynAmbiguity = host => {
  const svg = V.svg(host, 1400, 420);
  const pan = (x, t) => { const g = V.g(svg); V.rect(g, x, 40, 420, 300, "cell", { rx: 8 }); V.text(g, x + 210, 22, t, { size: 20, weight: 700 }); return g; };
  pan(20, "camera moves, object static"); pan(490, "camera static, object moves"); pan(960, "what both cameras record");
  const L = V.g(svg), M = V.g(svg), R = V.g(svg);
  V.text(svg, 700, 395, "from the images alone both explanations fit: 4D methods must separate camera motion from scene motion", { size: 19, weight: 700, fill: "var(--blue)" });
  const lp = V.loop(t => {
    const u = Math.sin(t * 1.2) * 90;
    L.innerHTML = ""; M.innerHTML = ""; R.innerHTML = "";
    V.rect(L, 210, 120, 60, 60, "", { style: "fill:var(--orange-soft);stroke:var(--orange);stroke-width:3" }); cam(L, 230 + u, 300, -Math.PI / 2, 44, "blue");
    V.rect(M, 680 - u, 120, 60, 60, "", { style: "fill:var(--orange-soft);stroke:var(--orange);stroke-width:3" }); cam(M, 700, 300, -Math.PI / 2, 44, "blue");
    V.rect(R, 1140 - u * 1.4, 150, 80, 80, "", { style: "fill:var(--orange-soft);stroke:var(--orange);stroke-width:3" });
  });
  return { start: lp.start, stop: lp.stop };
};

VIZ.canonical = host => {
  const svg = V.svg(host, 1400, 420);
  const FA = frame(20, 50, 520, 290), FB = frame(860, 50, 520, 290);
  V.text(svg, 280, 25, "canonical shape (shared over time)", { size: 20, weight: 700 });
  drawContour(svg, FA, "ink", 3);
  V.box(svg, 590, 150, 220, 100, "deformation\n~$**x**$′ = $**x**$ + $**Δ**$($**x**$, $t$)", "box blue", { size: 19 });
  V.arrow(svg, 545, 200, 584, 200); V.arrow(svg, 815, 200, 855, 200);
  const T = V.text(svg, 1120, 25, "", { size: 20, weight: 700 });
  const g = V.g(svg), arr = V.g(svg);
  const D = (x, y, t) => [.25 * Math.sin(t) * (y + 1), .3 * Math.sin(t * .7) * Math.sin(x * 1.4)];
  V.text(svg, 700, 395, "a NeRF or a set of Gaussians lives in the canonical space; a small network moves it to time $t$", { size: 19, cls: "muted" });
  const lp = V.loop(time => {
    g.innerHTML = ""; arr.innerHTML = "";
    const segs = SEGS.map(s => { const a = D(s[0], s[1], time), b = D(s[2], s[3], time); return [s[0] + a[0], s[1] + a[1], s[2] + b[0], s[3] + b[1]]; });
    drawContour(g, FB, "magenta", 3, segs);
    for (let x = -2; x <= 2; x += .8) for (let y = -.8; y <= 1.4; y += .55) { const d = D(x, y, time); V.line(arr, FA.X(x), FA.Y(y), FA.X(x + d[0] * .8), FA.Y(y + d[1] * .8), { style: "stroke:var(--blue)", "stroke-width": 2 }); }
    V.setText(T, `time $t$ = ${(time % 10).toFixed(1)} s`);
  });
  return { start: lp.start, stop: lp.stop };
};

VIZ.gauss4d = host => {
  const svg = V.svg(host, 1400, 420);
  const F = frame(60, 30, 900, 360), E = gaussFit(20);
  const g = V.g(svg), trails = V.g(svg);
  V.text(svg, 1180, 120, "each Gaussian gets a\ntime-dependent position\n(and possibly shape, colour):\n$**μ**$($t$), $**Σ**$($t$)", { size: 21 });
  V.text(svg, 1180, 300, "rendering stays a fast splat\nof the Gaussians at time $t$", { size: 19, cls: "muted" });
  const pos = (e, t, k) => [e.c[0] + .35 * Math.sin(t + k) * (e.c[1] + 1) * .5, e.c[1] + .15 * Math.sin(t * 1.3 + k * .7)];
  const lp = V.loop(t => {
    g.innerHTML = ""; trails.innerHTML = "";
    E.forEach((e, k) => {
      const pts = range(16).map(i => pos(e, t - i * .08, k));
      V.path(trails, "M" + pts.map(p => `${F.X(p[0])},${F.Y(p[1])}`).join("L"), "", { style: "fill:none;stroke:var(--blue);stroke-width:2;opacity:.5" });
      ellipse(g, F, { ...e, c: pts[0] });
    });
  });
  return { start: lp.start, stop: lp.stop };
};

VIZ.smoothing = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 330);
  reseed(13);
  const N = 120, truth = range(N).map(i => i < 70 ? .2 + i * .006 : .62 - (i - 70) * .004 + (i === 70 ? 0 : 0)).map((v, i) => i >= 70 ? v + .35 : v);
  const meas = truth.map(v => v + .05 * gauss());
  const X = i => 80 + i * 8.4, Y = v => 300 - v * 260;
  plotAxes(svg, X, Y, 0, N, 0, 1.1, "frame", "position");
  V.path(svg, "M" + truth.map((v, i) => `${X(i)},${Y(v)}`).join("L"), "", { style: "fill:none;stroke:var(--muted);stroke-width:2;stroke-dasharray:6 5" });
  meas.forEach((v, i) => V.circle(svg, X(i), Y(v), 3, { style: "fill:var(--blue);opacity:.6" }));
  const sm = V.path(svg, "", "curve", { style: "stroke:var(--magenta)" });
  V.text(svg, X(70), Y(1.05), "impact at frame 70", { size: 17, cls: "muted" });
  const info = V.text(svg, 1220, 120, "", { size: 21, weight: 700 });
  V.text(svg, 1220, 220, "smoothing removes noise,\nbut too much smoothing also\nremoves the real event", { size: 18, cls: "muted" });
  const upd = v => {
    const s = v.s, out = meas.map((_, i) => { let a = 0, w = 0; for (let j = 0; j < N; j++) { const k = s ? Math.exp(-((i - j) ** 2) / (2 * s * s)) : (i === j ? 1 : 0); a += k * meas[j]; w += k; } return a / w; });
    sm.setAttribute("d", "M" + out.map((v, i) => `${X(i)},${Y(v)}`).join("L"));
    const err = Math.sqrt(out.reduce((a, v, i) => a + (v - truth[i]) ** 2, 0) / N);
    V.setText(info, `σ = ${s} frames · RMS error ${(err * 100).toFixed(1)}`);
  };
  const sl = sliders(host, [{ k: "s", label: "temporal smoothing σ", min: 0, max: 20, step: 1, v: 3 }], upd);
  upd(sl.vals);
  return {};
};

VIZ.sync = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 320);
  const tl = V.g(svg), info = V.g(svg);
  const upd = v => {
    tl.innerHTML = ""; info.innerHTML = "";
    ["camera A", "camera B", "camera C"].forEach((n, k) => {
      const y = 70 + k * 80, off = [0, v.dt, -v.dt * .6][k];
      V.text(tl, 120, y, n, { size: 19, anchor: "end", weight: 700 });
      V.line(tl, 140, y, 900, y, { style: "stroke:var(--rule)" });
      range(8).forEach(i => { const x = 160 + i * 100 + off * 3; V.rect(tl, x, y - 16, 14, 32, "", { style: `fill:var(--${["blue", "orange", "green"][k]})` }); });
    });
    const err = v.speed * v.dt / 1000 * 1000;
    V.text(info, 1150, 90, `offset ${v.dt} ms × speed ${v.speed} m/s`, { size: 21 });
    V.text(info, 1150, 150, `= ${err.toFixed(0)} mm apparent displacement`, { size: 24, weight: 700, fill: err > 5 ? "var(--red)" : "var(--green)" });
    V.text(info, 1150, 240, "unsynchronized views see a moving\nobject at different places: the\nreconstruction blurs or doubles it", { size: 18, cls: "muted" });
  };
  const sl = sliders(host, [{ k: "dt", label: "time offset [ms]", min: 0, max: 40, step: 1, v: 8 }, { k: "speed", label: "object speed [m/s]", min: .1, max: 5, step: .1, v: 1.5 }], upd);
  upd(sl.vals);
  return {};
};

/* ------------------------------------------------------------ Part 7 */
VIZ.psnr = host => {
  host.style.flexDirection = "column";
  const W = 220, H = 160;
  host.innerHTML = `<div style="display:flex;gap:30px;align-items:flex-start"></div><p style="font-size:19px;color:var(--muted);margin:16px 0 0">PSNR = 10 log₁₀(1 / MSE), computed live on these images. A 1-pixel shift costs more than visible blur: pixel metrics punish misalignment, not perceived quality.</p>`;
  const row = host.firstChild;
  const base = document.createElement("canvas"); base.width = W; base.height = H;
  const b = base.getContext("2d");
  b.fillStyle = "#ced6dc"; b.fillRect(0, 0, W, H);
  b.fillStyle = "#4a5560"; b.beginPath(); b.arc(80, 85, 50, 0, 7); b.fill();
  b.fillStyle = "#e8ecef"; b.beginPath(); b.arc(80, 85, 18, 0, 7); b.fill();
  b.fillStyle = "#c46a00"; b.fillRect(140, 30, 50, 100);
  for (let i = 0; i < 12; i++) { b.fillStyle = i % 2 ? "#1c242b" : "#fff"; b.fillRect(150 + (i % 3) * 10, 40 + Math.floor(i / 3) * 20, 10, 10); }
  const ref = b.getImageData(0, 0, W, H).data;
  const variant = (name, draw) => {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d"); draw(x);
    const d = x.getImageData(0, 0, W, H).data; let mse = 0;
    for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) mse += ((d[i + k] - ref[i + k]) / 255) ** 2;
    mse /= W * H * 3; return [name, c, mse ? 10 * Math.log10(1 / mse) : Infinity];
  };
  const V4 = [variant("reference", x => x.drawImage(base, 0, 0)), variant("shifted by 1 px", x => { x.drawImage(base, 0, 0); x.drawImage(base, 1, 0); }),
  variant("slightly blurred", x => { x.filter = "blur(1.2px)"; x.drawImage(base, 0, 0); }), variant("5 % brighter", x => { x.filter = "brightness(1.05)"; x.drawImage(base, 0, 0); })];
  const figs = V4.map(([n, c, p], i) => {
    const f = document.createElement("figure"); f.style.cssText = "margin:0;text-align:center;font-size:20px"; if (i) f.className = "fade";
    c.style.cssText = "width:290px;border:1px solid var(--rule)"; f.appendChild(c);
    f.insertAdjacentHTML("beforeend", `<figcaption style="margin-top:8px"><b>${n}</b><br>${isFinite(p) ? "PSNR " + p.toFixed(1) + " dB" : "PSNR ∞"}</figcaption>`);
    row.appendChild(f); return f;
  });
  return { steps: 3, set(s) { figs.forEach((f, i) => { if (i) f.style.opacity = i <= s ? 1 : 0; }); } };
};

VIZ.chamfer = host => {
  host.style.flexDirection = "column";
  const svg = V.svg(host, 1400, 350);
  const F = frame(40, 10, 820, 330), mm = 20;    // 1 unit = 20 mm
  const gt = boundaryPoints(140, 0);
  reseed(17);
  const rec = gt.filter(([x, y]) => !(y < -.6 && x > .2)).map(([x, y]) => [x + .04 * gauss(), y + .04 * gauss()]);
  range(8).forEach(() => rec.push([-1.6 + rnd() * 3.2, 1.0 + rnd() * .4]));
  const nn = (p, S) => Math.min(...S.map(q => Math.hypot(p[0] - q[0], p[1] - q[1])));
  const acc = rec.map(p => nn(p, gt)), comp = gt.map(p => nn(p, rec));
  const g = V.g(svg);
  gt.forEach(([x, y]) => V.circle(svg, F.X(x), F.Y(y), 3.2, { style: "fill:var(--green)" }));
  rec.forEach(([x, y]) => V.circle(svg, F.X(x), F.Y(y), 3.2, { style: "fill:var(--blue)" }));
  V.text(svg, 900, 30, "● ground truth (scanner)", { size: 19, anchor: "start", fill: "var(--green)", weight: 700 });
  V.text(svg, 900, 60, "● reconstruction", { size: 19, anchor: "start", fill: "var(--blue)", weight: 700 });
  const info = V.g(svg);
  const upd = v => {
    g.innerHTML = ""; info.innerHTML = "";
    const tau = v.tau / mm;
    rec.forEach((p, i) => { if (acc[i] > tau) V.circle(g, F.X(p[0]), F.Y(p[1]), 9, { style: "fill:none;stroke:var(--red);stroke-width:2" }); });
    gt.forEach((p, i) => { if (comp[i] > tau) V.circle(g, F.X(p[0]), F.Y(p[1]), 9, { style: "fill:none;stroke:var(--orange);stroke-width:2" }); });
    const P = acc.filter(d => d <= tau).length / acc.length, R = comp.filter(d => d <= tau).length / comp.length, Fs = P + R ? 2 * P * R / (P + R) : 0;
    const mean = a => a.reduce((s, d) => s + d, 0) / a.length * mm;
    [[`accuracy (rec → GT): ${mean(acc).toFixed(1)} mm`, "blue"], [`completeness (GT → rec): ${mean(comp).toFixed(1)} mm`, "green"], [`Chamfer = mean of both: ${((mean(acc) + mean(comp)) / 2).toFixed(1)} mm`, "ink"],
    [`at τ = ${v.tau} mm: precision ${(P * 100).toFixed(0)} %, recall ${(R * 100).toFixed(0)} %`, "ink"], [`F-score ${(Fs * 100).toFixed(0)} %`, "magenta"]].forEach(([t, c], i) =>
      V.text(info, 900, 120 + i * 42, t, { size: 19, anchor: "start", fill: `var(--${c})`, weight: i === 4 ? 700 : null }));
    V.text(info, 900, 335, "red: false surface · orange: missing surface", { size: 16, anchor: "start", cls: "muted" });
  };
  const sl = sliders(host, [{ k: "tau", label: "threshold τ [mm]", min: 1, max: 20, step: 1, v: 3 }], upd);
  upd(sl.vals);
  return {};
};

VIZ.uncertainty = host => {
  const svg = V.svg(host, 1400, 430);
  const F = frame(40, 60, 860, 340);
  const cams = [[-2.3, 1.6], [-1, 1.85], [.6, 1.85], [2.2, 1.5]];
  cams.forEach(([x, y]) => cam(svg, F.X(x), F.Y(y), Math.atan2(F.Y(.2) - F.Y(y), F.X(0) - F.X(x)), 36, "blue"));
  const pts = boundaryPoints(380, 0);
  const vis = (x, y, c) => { for (let t = .03; t < .97; t += .02) if (sdf(c[0] + (x - c[0]) * t, c[1] + (y - c[1]) * t) < -.01) return false; return true; };
  pts.forEach(([x, y]) => {
    const n = cams.filter(c => vis(x, y, c)).length, u = 1 - n / cams.length;
    V.circle(svg, F.X(x), F.Y(y), 4.5, { style: `fill:hsl(${(120 - u * 120).toFixed(0)},70%,42%)` });
  });
  V.text(svg, 1150, 90, "colour = how many cameras\nsaw this part of the surface", { size: 21 });
  V.text(svg, 1150, 190, "green: well observed\nred: never observed → the\nmodel's guess (epistemic)", { size: 20 });
  V.text(svg, 1150, 320, "aleatoric: noise and ambiguity\neven where it was observed", { size: 19, cls: "muted" });
};

VIZ.failures = host => {
  const svg = V.svg(host, 1400, 420);
  const P = [["shiny / transparent", "reflections become\nfake geometry"], ["rolling shutter, motion", "shapes skew and smear"], ["wrong camera poses", "surfaces double or blur"], ["unobserved regions", "plausible but invented"]];
  const G = P.map(([t, s], i) => {
    const g = fadeIn(V.g(svg)), x = i * 350;
    V.rect(g, x, 0, 320, 410, "cell", { rx: 8 }); V.text(g, x + 160, 26, t, { size: 19, weight: 700 }); V.text(g, x + 160, 370, s, { size: 17, cls: "muted" });
    const F = frame(x + 10, 60, 300, 230);
    if (i === 0) { drawContour(g, F, "ink", 2.5); drawContour(g, F, "red", 2, SEGS.map(q => [q[0], -q[1] - 2.3, q[2], -q[3] - 2.3]).filter(q => q[1] > -1.05)); }
    if (i === 1) drawContour(g, F, "red", 2.5, SEGS.map(q => [q[0] + .35 * q[1], q[1], q[2] + .35 * q[3], q[3]]));
    if (i === 2) { drawContour(g, F, "ink", 2, SEGS.map(q => [q[0] - .08, q[1], q[2] - .08, q[3]])); drawContour(g, F, "red", 2, SEGS.map(q => [q[0] + .1, q[1] + .05, q[2] + .1, q[3] + .05])); }
    if (i === 3) { drawContour(g, F, "ink", 2.5, SEGS.filter(q => q[1] > -.4)); drawContour(g, F, "red", 2.5, contour((a, b) => Math.max(sdf(a, b), -(b + .4)) + .08 * Math.sin(a * 5), 70).filter(q => q[1] <= -.38)); }
    return g;
  });
  return { steps: 3, set(s) { G.forEach((g, i) => V.show(g, i <= s)); } };
};

VIZ.applications = flow({
  w: 1400, h: 260, nodes: [
    { id: "a", x: 0, y: 40, w: 420, h: 150, label: "**DIGITAL TWIN**\n~inspect a part or a line from any view,\n~simulate camera placements", cls: "blue" },
    { id: "b", x: 490, y: 40, w: 420, h: 150, label: "**ROBOT WORKSPACE**\n~dense geometry for grasping and\n~collision checking", step: 1 },
    { id: "c", x: 980, y: 40, w: 420, h: 150, label: "**PROCESS MONITORING**\n~4D models of people, machines,\n~material flow", cls: "good", step: 2 }],
  texts: [{ x: 700, y: 235, t: "each needs a different representation and a different quality measure", size: 19, step: 2 }],
});

VIZ.choosePipe = flow({
  w: 1400, h: 400, nodes: [
    { id: "q1", x: 0, y: 30, w: 300, h: 90, label: "depth sensor available?", cls: "blue" },
    { id: "a1", x: 400, y: 30, w: 330, h: 90, label: "TSDF / surfel fusion\n~fast, metric, robust", cls: "good", step: 1 },
    { id: "q2", x: 0, y: 160, w: 300, h: 90, label: "need measured geometry\n~from images?", cls: "blue", step: 2 },
    { id: "a2", x: 400, y: 160, w: 330, h: 90, label: "MVS or neural surfaces\n~(NeuS, 2DGS) + ground truth", cls: "good", step: 2 },
    { id: "q3", x: 0, y: 290, w: 300, h: 90, label: "need new views,\n~real time?", cls: "blue", step: 3 },
    { id: "a3", x: 400, y: 290, w: 330, h: 90, label: "3D Gaussian splatting\n~(4DGS if the scene moves)", cls: "good", step: 3 },
    { id: "v", x: 900, y: 140, w: 480, h: 130, label: "in every case: check calibration and poses first,\n~compare with a classical baseline, evaluate\n~geometry on held-out data", cls: "mut", step: 4 }],
  edges: [{ a: "q1", b: "a1", step: 1 }, { a: "q2", b: "a2", step: 2 }, { a: "q3", b: "a3", step: 3 },
  { a: "q1", b: "q2", from: "b", to: "t", step: 2 }, { a: "q2", b: "q3", from: "b", to: "t", step: 3 }],
  texts: [{ x: 350, y: 60, t: "yes", step: 1 }, { x: 165, y: 140, t: "no", step: 2 }, { x: 165, y: 270, t: "no", step: 3 }],
});

VIZ.slamCoupling = flow({
  w: 1400, h: 340, nodes: [
    { id: "s", x: 0, y: 110, w: 260, h: 110, label: "**VSLAM / SfM**\n~poses, intrinsics,\n~sparse points", cls: "blue" },
    { id: "i", x: 360, y: 110, w: 260, h: 110, label: "initialization\n~cameras + seed points" },
    { id: "r", x: 720, y: 110, w: 280, h: 110, label: "NeRF / 3DGS\n~dense geometry, appearance", cls: "good" },
    { id: "w", x: 1080, y: 110, w: 310, h: 110, label: "joint refinement\n~of poses and scene", cls: "bad", step: 1 }],
  edges: [{ a: "s", b: "i" }, { a: "i", b: "r" }, { a: "r", b: "w", step: 1 },
  { a: "w", b: "s", d: "M1235,225 Q640,360 130,225", color: "red", step: 1, label: "can fix small pose errors — or hide them as a deformed scene", lx: 680, ly: 320 }],
});

VIZ.safeFlow = flow({
  w: 1400, h: 260, nodes: [
    ["1", "check calibration\n~and poses"], ["2", "classical\n~baseline"], ["3", "learned method\n~(prior)"], ["4", "test on held-out\n~views and geometry"], ["5", "report error\n~+ uncertainty map"]]
    .map(([id, label], i) => ({ id, x: i * 284, y: 60, w: 250, h: 110, label, cls: i === 4 ? "good" : i === 0 ? "blue" : "", step: i })),
  edges: ["1", "2", "3", "4"].map(a => ({ a, b: String(+a + 1), step: +a })),
  texts: [{ x: 700, y: 225, t: "base operational decisions on measured geometry and its uncertainty, not on how good the rendering looks", step: 4, size: 19, weight: 700, cls: "" }],
});

VIZ.summary3 = flow({
  w: 1400, h: 200, nodes: [
    { id: "a", x: 0, y: 40, w: 320, h: 120, label: "**REPRESENTATION**\n~decides what can be measured\n~and what it costs", cls: "blue" },
    { id: "b", x: 360, y: 40, w: 320, h: 120, label: "**LEARNED DEPTH**\n~priors fill gaps, scale needs\n~a reference", step: 1 },
    { id: "c", x: 720, y: 40, w: 320, h: 120, label: "**NeRF / 3DGS**\n~optimize image agreement,\n~not surfaces", step: 2 },
    { id: "d", x: 1080, y: 40, w: 320, h: 120, label: "**EVALUATION**\n~geometry in mm, held-out views,\n~uncertainty", cls: "good", step: 3 }],
});
